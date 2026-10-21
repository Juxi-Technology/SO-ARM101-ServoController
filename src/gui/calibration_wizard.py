#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""LeRobot 校准向导（整臂一次校准）

界面分左右两栏：

* 左：仿照「单舵机控制」的实时监视 —— ID / Pos / 滑动条 / L（L 显示已记录的中位值）
* 右：6 个舵机的中位值、最小值、最大值、状态表格 + 记录按钮 + 校准文件 ID + 保存

流程：

1. 连接后先复位（偏移清零、限位放开到 [0,4095]），与 LeRobot 的 reset_calibration 一致；
   这样读到的是「未加偏移」的原始位置，算出的 homing_offset 才和 LeRobot 同口径。
2. 把机械臂摆到中位 → 点【记录中位值】：把左侧 6 个 Pos 一次记成中位，
   并把偏移写回舵机（增量 = 中位原始位置 − 2047）。
3. 点【记录运动范围】（按钮变绿）→ 依次转动各关节 →
   后台读取线程实时刷新每个舵机的 min/max；再点一次停止。
4. 全部完成后自动保存（主界面调用时），也可手动【保存校准文件】。
   保存时把偏移与限位写回 EEPROM，并落一份 LeRobot 可直接使用的 JSON。
"""

import sys
import os
import time
import json
import platform
import contextlib
import threading
from pathlib import Path
from typing import Dict, List, Optional

sys.path.append('../..')
sys.path.append('../../scservo_sdk')

try:
    from PySide6.QtWidgets import (
        QApplication, QDialog, QWidget, QVBoxLayout, QHBoxLayout,
        QPushButton, QLabel, QTableWidget, QTableWidgetItem, QHeaderView,
        QMessageBox, QGroupBox, QFormLayout, QLineEdit, QGridLayout,
        QSpinBox, QSlider, QAbstractSpinBox, QAbstractItemView
    )
    from PySide6.QtCore import Qt, QTimer, Signal, QObject, QThread
    from PySide6.QtGui import QColor, QFont
except ImportError as e:
    print(f"❌ 无法导入 PySide6: {e}")
    sys.exit(1)

try:
    from scservo_sdk.port_handler import PortHandler
    from scservo_sdk.sms_sts import sms_sts, SMS_STS_OFS_L
    from scservo_sdk.scservo_def import COMM_SUCCESS
except ImportError as e:
    print(f"❌ 无法导入 SCServo SDK: {e}")
    sys.exit(1)

try:
    from src import servo_eeprom
    from src.calibration_manager import CalibrationManager, JOINT_NAME_MAP
    from src.calibration_math import (
        MAX_RES,
        encode_homing_offset,
        homing_offset_from_position,
    )
except ImportError:
    print("❌ 无法导入 calibration_manager / calibration_math / servo_eeprom")
    sys.exit(1)

try:
    from src.gui.theme_utils import setup_light_theme
except ImportError:
    setup_light_theme = None

try:
    from src.i18n import tr, set_lang, lang_from_argv
except ImportError:
    def tr(text):
        return text

    def set_lang(lang):
        return lang

    def lang_from_argv(argv):
        return None


BAUD_RATE = 1000000
TORQUE_ENABLE_ADDR = 40
TORQUE_ON = 1
TORQUE_OFF = 0

# ID -> 关节名映射（SoARM 10x 标准配置）
ID_TO_JOINT = {
    1: "shoulder_pan",
    2: "shoulder_lift",
    3: "elbow_flex",
    4: "wrist_flex",
    5: "wrist_roll",
    6: "gripper",
}

# 连续旋转关节：范围固定 [0, 4095]
CONTINUOUS_JOINTS = {"wrist_roll"}


def get_chinese_font(size=10, bold=False):
    """返回跨平台可用的中文字体。

    Ubuntu 下通常有 Noto Sans CJK / WenQuanYi 等回退字体，Qt 能正常显示中文；
    Windows 下如果显式使用西文字体（如 Consolas）显示中文表头，会出现缺字/空白。
    这里按平台选择主字体，并设置 SansSerif 风格提示以便自动回退。
    """
    system = platform.system()
    if system == "Windows":
        family = "Microsoft YaHei"
    elif system == "Darwin":
        family = "PingFang SC"
    else:
        family = "Noto Sans CJK SC"

    font = QFont(family, size)
    font.setStyleHint(QFont.SansSerif)
    if bold:
        font.setBold(True)
    return font


class PositionReader(QObject):
    """后台位置读取线程

    io_lock 用来和界面线程串行化串口收发：PortHandler 不是线程安全的，
    两边同时收发会互相吃掉应答包（表现为读数不刷新、写命令"没生效"）。
    """
    # 用 object 而不是 dict：PySide6 跨线程传 dict 时会丢内容（界面收到空字典），
    # 原项目 ServoWorker 的 positions_updated 也是这么绕开的
    positions_updated = Signal(object)  # {servo_id: position}

    def __init__(self, servo_handler, servo_ids: List[int], io_lock=None):
        super().__init__()
        self.servo_handler = servo_handler
        self.servo_ids = servo_ids
        self.io_lock = io_lock
        self.running = False

    def start_reading(self):
        self.running = True
        ctx = self.io_lock if self.io_lock is not None else contextlib.nullcontext()
        while self.running:
            positions = {}
            with ctx:
                for servo_id in self.servo_ids:
                    try:
                        pos, result, _error = self.servo_handler.ReadPos(servo_id)
                        if result == COMM_SUCCESS:
                            # low 12 bits: the register can report a multi-turn value
                            positions[servo_id] = pos & 0xFFF
                    except Exception as e:
                        print(tr("[DEBUG] 读取 ID{} 异常: {}").format(servo_id, e))
            if positions:
                self.positions_updated.emit(positions)
            time.sleep(0.05)  # 20Hz

    def stop(self):
        self.running = False


class ReaderThread(QThread):
    """Qt 线程包装器"""

    def __init__(self, reader: PositionReader):
        super().__init__()
        self.reader = reader

    def run(self):
        self.reader.start_reading()

    def stop(self):
        self.reader.stop()
        self.wait(1000)


class CalibrationWizard(QDialog):
    """LeRobot 校准向导"""

    def __init__(self, port_name: str, arm_type: str = "follower", fixed_id: str = None,
                 lock_id: bool = False, auto_save: bool = False, parent=None):
        super().__init__(parent)
        self.port_name = port_name
        self.arm_type = arm_type
        self.fixed_id = fixed_id
        self.lock_id = lock_id
        self.auto_save = auto_save
        self._closing = False

        title = tr("LeRobot 校准向导 - {}").format(port_name)
        self.setWindowTitle(title)
        self.setMinimumSize(1040, 620)
        self.setFont(get_chinese_font(10))

        # 串口
        self._io_lock = threading.Lock()
        self.port_handler = None
        self.servo_handler = None
        self.servo_ids: List[int] = []

        # 实时位置与校准数据
        self.latest: Dict[int, int] = {}
        self.state = {
            sid: {"center": None, "min": None, "max": None} for sid in ID_TO_JOINT
        }
        self.is_recording = False
        self.center_recording = False
        self._toggle_guard = False

        # 保存结果（供调用方读取）
        self.saved_path = None
        self.saved_id = None

        # 后台读取
        self.position_reader = None
        self.reader_thread = None

        self.connected = False
        self.init_ui()
        self.connected = self.connect_port()

    # ---------------- 界面 ----------------

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(16, 16, 16, 16)

        title = QLabel(tr("🦾 LeRobot 校准向导 - {}").format(
            tr("主动臂") if self.arm_type == "leader" else tr("从动臂")))
        title.setStyleSheet("font-size: 18px; font-weight: bold; color: #1a237e;")
        title.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(title)

        self.status_label = QLabel(tr("串口: {} | 状态: 初始化中...").format(self.port_name))
        self.status_label.setStyleSheet("font-size: 11px; color: #546e7a;")
        self.status_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(self.status_label)

        content = QHBoxLayout()
        content.setSpacing(14)
        content.addWidget(self._build_monitor_group(), 3)
        content.addWidget(self._build_data_group(), 4)
        main_layout.addLayout(content, 1)

        bottom = QHBoxLayout()
        bottom.addStretch()
        self.disconnect_btn = QPushButton(tr("🔌 断开连接"))
        self.disconnect_btn.clicked.connect(self.disconnect_and_close)
        bottom.addWidget(self.disconnect_btn)

        self.close_btn = QPushButton(tr("关闭"))
        self.close_btn.clicked.connect(self.close)
        bottom.addWidget(self.close_btn)
        main_layout.addLayout(bottom)

        # 记录过程中按 10Hz 刷新表格（数据本身 20Hz 更新）
        self.range_timer = QTimer(self)
        self.range_timer.timeout.connect(self.refresh_table)

        self.refresh_table()
        self._update_buttons()

    def _build_monitor_group(self) -> QWidget:
        """左栏：仿照「单舵机控制」的实时监视"""
        group = QGroupBox(tr("实时位置"))
        grid = QGridLayout(group)
        grid.setSpacing(8)
        grid.setColumnStretch(2, 1)

        self.pos_inputs: Dict[int, QSpinBox] = {}
        self.sliders: Dict[int, QSlider] = {}

        for row, sid in enumerate(sorted(ID_TO_JOINT)):
            id_label = QLabel(f"ID{sid}")
            id_label.setStyleSheet("font-weight: bold; font-size: 12px;")
            id_label.setFixedWidth(38)
            grid.addWidget(id_label, row, 0)

            pos_input = QSpinBox()
            pos_input.setRange(0, MAX_RES)
            pos_input.setValue(0)
            pos_input.setPrefix("Pos: ")
            pos_input.setReadOnly(True)
            pos_input.setButtonSymbols(QAbstractSpinBox.NoButtons)
            pos_input.setMinimumWidth(95)
            pos_input.setStyleSheet("font-size: 11px;")
            self.pos_inputs[sid] = pos_input
            grid.addWidget(pos_input, row, 1)

            slider = QSlider(Qt.Horizontal)
            slider.setRange(0, MAX_RES)
            slider.setValue(2048)
            # 只看不拖：保持正常配色，但忽略鼠标操作
            slider.setAttribute(Qt.WA_TransparentForMouseEvents, True)
            slider.setStyleSheet("""
                QSlider::groove:horizontal {
                    border: 1px solid #bbb;
                    height: 8px;
                    background: #eef1f5;
                    border-radius: 4px;
                }
                QSlider::handle:horizontal {
                    background: #5c6bc0;
                    border: 1px solid #3f51b5;
                    width: 18px;
                    margin: -5px 0;
                    border-radius: 4px;
                }
                QSlider::sub-page:horizontal {
                    background: #5c6bc0;
                    border-radius: 4px;
                }
            """)
            self.sliders[sid] = slider
            grid.addWidget(slider, row, 2)

        return group

    def _build_data_group(self) -> QWidget:
        """右栏：校准表格 + 记录按钮 + 保存"""
        group = QGroupBox(tr("校准数据"))
        layout = QVBoxLayout(group)
        layout.setSpacing(10)

        self.table = QTableWidget(len(ID_TO_JOINT), 5)
        self.table.setHorizontalHeaderLabels(
            [tr("ID"), tr("中位值"), tr("最小值"), tr("最大值"), tr("状态")])
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.table.setSelectionMode(QAbstractItemView.NoSelection)
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        for row, sid in enumerate(sorted(ID_TO_JOINT)):
            self.table.setItem(row, 0, QTableWidgetItem(f"ID{sid}"))
            for col in range(1, 5):
                self.table.setItem(row, col, QTableWidgetItem("--"))
        self.table.setMinimumHeight(210)
        layout.addWidget(self.table)

        btn_row = QHBoxLayout()
        self.record_center_btn = QPushButton(tr("开始中位值记录"))
        self.record_center_btn.setCheckable(True)
        self.record_center_btn.setMinimumHeight(42)
        self.record_center_btn.setFont(get_chinese_font(11, bold=True))
        self.record_center_btn.setStyleSheet("""
            QPushButton {
                background-color: #fff3e0;
                color: #e65100;
                border: 1px solid #ffb74d;
                border-radius: 6px;
                padding: 0 14px;
            }
            QPushButton:hover { background-color: #ffe0b2; }
            QPushButton:checked {
                background-color: #ef6c00;
                color: white;
                border: 1px solid #e65100;
            }
        """)
        self.record_center_btn.toggled.connect(self.on_center_toggled)
        btn_row.addWidget(self.record_center_btn)

        self.record_range_btn = QPushButton(tr("记录运动范围"))
        self.record_range_btn.setCheckable(True)
        self.record_range_btn.setMinimumHeight(42)
        self.record_range_btn.setFont(get_chinese_font(11, bold=True))
        self.record_range_btn.setStyleSheet("""
            QPushButton {
                background-color: #e8eaf6;
                color: #283593;
                border: 1px solid #9fa8da;
                border-radius: 6px;
                padding: 0 14px;
            }
            QPushButton:hover { background-color: #c5cae9; }
            QPushButton:checked {
                background-color: #2e7d32;
                color: white;
                border: 1px solid #1b5e20;
            }
        """)
        self.record_range_btn.toggled.connect(self.on_range_toggled)
        btn_row.addWidget(self.record_range_btn)
        layout.addLayout(btn_row)

        form = QFormLayout()
        form.setSpacing(8)
        self.id_input = QLineEdit()
        self.id_input.setMinimumHeight(32)
        default_id = self.fixed_id or (
            "my_leader_arm" if self.arm_type == "leader" else "my_follower_arm")
        self.id_input.setText(default_id)
        if self.fixed_id and self.lock_id:
            self.id_input.setReadOnly(True)
        form.addRow(tr("校准文件 ID:"), self.id_input)
        layout.addLayout(form)

        self.save_btn = QPushButton(tr("💾 保存校准文件"))
        self.save_btn.setMinimumHeight(46)
        self.save_btn.setFont(get_chinese_font(11, bold=True))
        self.save_btn.setStyleSheet("""
            QPushButton {
                background-color: #6f42c1;
                color: white;
                border: none;
                border-radius: 6px;
            }
            QPushButton:hover { background-color: #5a34a8; }
            QPushButton:disabled { background-color: #b39ddb; }
        """)
        self.save_btn.clicked.connect(self.save_calibration)
        layout.addWidget(self.save_btn)

        return group

    # ---------------- 串口 ----------------

    def connect_port(self):
        """连接串口、扫描舵机、复位校准参数、启动读取线程"""
        try:
            self.port_handler = PortHandler(self.port_name)
            if not self.port_handler.openPort():
                QMessageBox.critical(self, tr("错误"), tr("无法打开串口: {}").format(self.port_name))
                return False
            if not self.port_handler.setBaudRate(BAUD_RATE):
                QMessageBox.critical(self, tr("错误"), tr("无法设置波特率"))
                self.port_handler.closePort()
                return False

            self.servo_handler = sms_sts(self.port_handler)

            found_servos = self.scan_servos()
            if not found_servos:
                QMessageBox.critical(self, tr("错误"), tr("未发现舵机"))
                self.port_handler.closePort()
                return False

            self.servo_ids = [sid for sid in found_servos if sid in ID_TO_JOINT]
            if not self.servo_ids:
                QMessageBox.critical(
                    self, tr("错误"), tr("未发现 SoARM 10x 标准关节（ID 1-6）"))
                self.port_handler.closePort()
                return False

            missing_ids = set(ID_TO_JOINT) - set(self.servo_ids)
            if missing_ids:
                self.state.update({sid: {"center": None, "min": None, "max": None}
                                   for sid in missing_ids})
                QMessageBox.warning(
                    self,
                    tr("警告"),
                    tr("以下标准关节未被发现：{}\n这些关节将无法校准，请检查连接。").format(
                        ', '.join(f"ID{sid}" for sid in sorted(missing_ids))),
                )

            # 失能力矩，方便手动摆位
            self.set_torque(False)

            # 偏移清零 + 限位放开，等价 LeRobot 的 reset_calibration
            reset_failures = servo_eeprom.reset_calibration(
                self.servo_handler, self.servo_ids, lock=self._io_lock)
            if reset_failures:
                QMessageBox.warning(
                    self,
                    tr("警告"),
                    tr("以下舵机的校准复位失败，本次校准结果可能不准：{}").format(
                        ', '.join("ID{}".format(sid) for sid, _ in reset_failures)),
                )

            # 后台读取（与界面线程共用一把串口锁）
            self.position_reader = PositionReader(
                self.servo_handler, self.servo_ids, io_lock=self._io_lock)
            self.position_reader.positions_updated.connect(self.on_positions_updated)
            self.reader_thread = ReaderThread(self.position_reader)
            self.reader_thread.start()

            # 先把状态置位，_update_buttons 依赖它；否则这里会把按钮判成离线禁用
            self.connected = True
            self.status_label.setText(
                tr("串口: {} | 已连接 | 发现舵机: {}").format(self.port_name, self.servo_ids))
            self.refresh_table()
            self._update_buttons()
            return True

        except Exception as e:
            QMessageBox.critical(self, tr("错误"), tr("连接失败: {}").format(e))
            return False

    def scan_servos(self) -> List[int]:
        found = []
        for servo_id in range(1, 21):
            _model, result, _error = self.servo_handler.ping(servo_id)
            if result == COMM_SUCCESS:
                found.append(servo_id)
        return found

    def set_torque(self, enable: bool):
        if not self.servo_handler:
            return
        value = TORQUE_ON if enable else TORQUE_OFF
        with self._io_lock:
            for servo_id in self.servo_ids:
                self.servo_handler.write1ByteTxRx(servo_id, TORQUE_ENABLE_ADDR, value)
                time.sleep(0.02)

    # ---------------- 实时刷新 ----------------

    def on_positions_updated(self, positions: dict):
        for servo_id, pos in positions.items():
            self.latest[servo_id] = pos

            pos_input = self.pos_inputs.get(servo_id)
            if pos_input is not None:
                pos_input.setValue(pos)
            slider = self.sliders.get(servo_id)
            if slider is not None:
                slider.setValue(pos)

            if self.center_recording:
                # 中位列实时跟着左侧 Pos：直接记原始位置，保存时再换算成 LeRobot 的增量
                st = self.state.get(servo_id)
                if st is not None:
                    st["center"] = pos

            if not self.is_recording:
                continue
            st = self.state.get(servo_id)
            if st is None or st["center"] is None:
                continue
            if st["min"] is None or pos < st["min"]:
                st["min"] = pos
            if st["max"] is None or pos > st["max"]:
                st["max"] = pos

    def refresh_table(self):
        for row, sid in enumerate(sorted(ID_TO_JOINT)):
            st = self.state[sid]
            center = st["center"]
            rmin = st["min"]
            rmax = st["max"]

            self.table.item(row, 0).setText(f"ID{sid}")
            self.table.item(row, 1).setText(str(center) if center is not None else "--")
            self.table.item(row, 2).setText(str(rmin) if rmin is not None else "--")
            self.table.item(row, 3).setText(str(rmax) if rmax is not None else "--")

            status_item = self.table.item(row, 4)
            if sid not in self.servo_ids:
                text, color = tr("未连接"), "#c62828"
            elif (self.center_recording or self.is_recording) and center is not None:
                text, color = tr("记录中"), "#ef6c00"
            elif center is None:
                text, color = tr("待记录"), "#78909c"
            elif rmin is None or rmax is None:
                text, color = tr("已记中位"), "#3949ab"
            else:
                text, color = tr("完成"), "#2e7d32"
            status_item.setText(text)
            status_item.setForeground(QColor(color))

    def _update_buttons(self):
        online = self.connected and bool(self.servo_ids)
        self.record_center_btn.setEnabled(online and not self.is_recording)
        self.record_range_btn.setEnabled(online and not self.center_recording)
        self.save_btn.setEnabled(
            online and not self.center_recording and not self.is_recording)

    # ---------------- 记录 ----------------

    def on_center_toggled(self, checked: bool):
        """【开始中位值记录】/【完成中位值记录】

        按下后表格中位列实时跟随左侧 Pos，操作员摆好姿态后再按一次冻结。
        """
        if self._toggle_guard:
            return
        if checked:
            self._start_center_recording()
        else:
            self._finish_center_recording()

    def _start_center_recording(self):
        if not self.connected:
            self._set_center_checked(False)
            return
        if self.is_recording:
            self._set_center_checked(False)
            QMessageBox.warning(self, tr("警告"), tr("请先停止记录运动范围"))
            return

        # 每次开始都先把运动偏移清零。偏移不清零的话，第二次记录时读到的是
        # 「已经减过上次偏移」的位置，算出来的中位会整体偏掉。
        failed = []
        for sid in self.servo_ids:
            ok, error = servo_eeprom.write_eeprom(
                self.servo_handler, sid, SMS_STS_OFS_L, 0, lock=self._io_lock)
            if not ok:
                failed.append(f"ID{sid}（{error}）")
            st = self.state[sid]
            st["center"] = None
            st["min"] = None
            st["max"] = None

        if failed:
            self._set_center_checked(False)
            QMessageBox.warning(
                self, tr("警告"),
                tr("中位值写入失败：{}").format('; '.join(failed)))
            return

        self.center_recording = True
        self.record_center_btn.setText(tr("完成中位值记录"))
        self.range_timer.start(100)
        self.status_label.setText(tr("正在记录中位值，摆好后点【完成中位值记录】"))
        self._update_buttons()
        self.refresh_table()

    def _finish_center_recording(self):
        self.center_recording = False
        self.range_timer.stop()
        self.record_center_btn.setText(tr("开始中位值记录"))

        missing = [sid for sid in self.servo_ids if self.state[sid]["center"] is None]
        failed = []
        for sid in self.servo_ids:
            st = self.state[sid]
            if st["center"] is None:
                continue
            ok, error = servo_eeprom.write_eeprom(
                self.servo_handler, sid, SMS_STS_OFS_L,
                encode_homing_offset(homing_offset_from_position(st["center"])),
                lock=self._io_lock)
            if ok:
                # 偏移变了，之前记录的行程作废
                st["min"] = None
                st["max"] = None
            else:
                failed.append(f"ID{sid}（{error}）")

        self.refresh_table()
        self._update_buttons()

        if failed:
            QMessageBox.warning(
                self, tr("警告"),
                tr("中位值写入失败：{}").format('; '.join(failed)))
        elif missing:
            QMessageBox.warning(
                self, tr("警告"),
                tr("以下舵机没有读到位置，无法记录中位：{}").format(
                    ', '.join(f"ID{sid}" for sid in missing)),
            )
        else:
            self.status_label.setText(
                tr("已记录 {} 个舵机的中位值").format(len(self.servo_ids)))

    def _set_center_checked(self, checked: bool):
        self._toggle_guard = True
        try:
            self.record_center_btn.setChecked(checked)
        finally:
            self._toggle_guard = False

    def on_range_toggled(self, checked: bool):
        """【记录运动范围】按钮：按下变绿开始记录，再按停止"""
        if self._toggle_guard:
            return

        if checked:
            if not self.connected:
                self._set_range_checked(False)
                return
            if self.center_recording:
                self._set_range_checked(False)
                QMessageBox.warning(self, tr("警告"), tr("请先完成中位值记录"))
                return
            if any(self.state[sid]["center"] is None for sid in self.servo_ids):
                self._set_range_checked(False)
                QMessageBox.warning(self, tr("警告"), tr("请先记录中位值"))
                return

            for sid in self.servo_ids:
                st = self.state[sid]
                st["min"] = self.latest.get(sid)
                st["max"] = self.latest.get(sid)

            self.is_recording = True
            self.record_range_btn.setText(tr("停止记录范围"))
            self.range_timer.start(100)
            self.status_label.setText(tr("正在记录运动范围，请依次移动各关节"))
            self._update_buttons()
            self.refresh_table()
        else:
            self.is_recording = False
            self.range_timer.stop()
            self.record_range_btn.setText(tr("记录运动范围"))

            for sid in self.servo_ids:
                st = self.state[sid]
                if ID_TO_JOINT[sid] in CONTINUOUS_JOINTS:
                    st["min"], st["max"] = 0, MAX_RES
                elif st["min"] is not None and st["min"] == st["max"]:
                    # 这个关节根本没动过，不能当有效行程
                    st["min"] = st["max"] = None

            self.refresh_table()
            self.status_label.setText(tr("运动范围记录完成"))
            self._update_buttons()
            self._maybe_auto_save()

    def _set_range_checked(self, checked: bool):
        self._toggle_guard = True
        try:
            self.record_range_btn.setChecked(checked)
        finally:
            self._toggle_guard = False

    # ---------------- 保存 ----------------

    def _all_done(self) -> bool:
        # 少一个舵机也不算完成：JSON 缺关节时 LeRobot 依旧判定未校准
        if len(self.servo_ids) < len(ID_TO_JOINT):
            return False
        return all(
            self.state[sid]["center"] is not None
            and self.state[sid]["min"] is not None
            and self.state[sid]["max"] is not None
            for sid in self.servo_ids
        )

    def _maybe_auto_save(self):
        if not self.auto_save or not self.connected:
            return
        if self._all_done():
            self._save_calibration_file(auto=True)

    def save_calibration(self):
        self._save_calibration_file(auto=False)

    def _build_calibration_data(self) -> dict:
        data = {}
        for sid in sorted(ID_TO_JOINT):
            st = self.state[sid]
            data[ID_TO_JOINT[sid]] = {
                "id": sid,
                "drive_mode": 0,
                # 表格里显示的是原始中位位置，写进文件时换算成 LeRobot 的增量
                "homing_offset": (homing_offset_from_position(st["center"])
                                  if st["center"] is not None else 0),
                "range_min": st["min"] if st["min"] is not None else 0,
                "range_max": st["max"] if st["max"] is not None else MAX_RES,
            }
        return data

    def _save_calibration_file(self, auto=False):
        if not self.connected:
            QMessageBox.warning(self, tr("警告"), tr("串口未连接"))
            return

        if not self._all_done() and not auto:
            incomplete = [
                "ID{}".format(sid) for sid in sorted(ID_TO_JOINT)
                if self.state[sid]["center"] is None
                or self.state[sid]["min"] is None
                or self.state[sid]["max"] is None
            ]
            reply = QMessageBox.question(
                self,
                tr("确认保存"),
                tr("以下关节尚未完成校准:\n{}\n\n未完成关节将使用默认值（中位偏移=0, 范围=[0,4095]）。\n是否继续保存？").format(
                    ', '.join(incomplete)),
                QMessageBox.Yes | QMessageBox.No,
                QMessageBox.No,
            )
            if reply != QMessageBox.Yes:
                return

        calibration_data = self._build_calibration_data()

        # 先写回舵机：LeRobot 的 is_calibrated 是拿 JSON 与寄存器逐个比对，
        # 两边一致它才不会每次连接都提示重新校准
        write_failures = servo_eeprom.write_calibration_to_servos(
            self.servo_handler, calibration_data, lock=self._io_lock)

        calib_id = self.id_input.text().strip()
        if not calib_id:
            calib_id = "my_leader_arm" if self.arm_type == "leader" else "my_follower_arm"

        manager = CalibrationManager()
        if self.arm_type == "leader":
            save_dir = manager.teleoperators_dir / "so_leader"
        else:
            save_dir = manager.robots_dir / "so_follower"
        save_path = save_dir / f"{calib_id}.json"

        try:
            save_dir.mkdir(parents=True, exist_ok=True)
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(calibration_data, f, indent=4, ensure_ascii=False)

            self.saved_path = str(save_path)
            self.saved_id = calib_id

            arm_label = tr("主动臂") if self.arm_type == "leader" else tr("从动臂")
            message = tr("{}校准文件已保存:\n{}\n\nID: {}").format(
                arm_label, save_path, calib_id)
            if write_failures:
                message += "\n\n" + tr(
                    "以下关节的参数未能写回舵机，LeRobot 可能仍提示未校准：{}").format(
                    ', '.join(write_failures))
            QMessageBox.information(self, tr("保存成功"), message)
            self.status_label.setText(tr("校准文件已保存: {}").format(save_path))

        except Exception as e:
            self.saved_path = None
            self.saved_id = None
            QMessageBox.critical(self, tr("保存失败"), tr("保存校准文件失败: {}").format(e))

    # ---------------- 生命周期 ----------------

    def _ask_save_on_close(self):
        if self._closing:
            return
        self._closing = True
        if not self.auto_save or self.saved_path or not self.connected:
            return
        if all(self.state[sid]["center"] is None for sid in self.servo_ids):
            return

        reply = QMessageBox.question(
            self,
            tr("尚未保存"),
            tr("校准尚未完成，是否保存当前数据？\n将覆盖同 ID 的已有校准文件。"),
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )
        if reply == QMessageBox.Yes:
            self._save_calibration_file(auto=True)

    def disconnect_and_close(self):
        self._ask_save_on_close()
        self.cleanup()
        self.accept()

    def close(self):
        self._ask_save_on_close()
        self.cleanup()
        super().close()

    def reject(self):
        self._ask_save_on_close()
        self.cleanup()
        super().reject()

    def cleanup(self):
        if self.range_timer.isActive():
            self.range_timer.stop()
        if self.reader_thread:
            self.reader_thread.stop()
            self.reader_thread = None
        if self.port_handler and self.port_handler.is_open:
            try:
                self.set_torque(False)
                self.port_handler.closePort()
            except Exception:
                pass


if __name__ == "__main__":
    app = QApplication(sys.argv)
    if setup_light_theme:
        setup_light_theme(app)

    lang = lang_from_argv(sys.argv)
    if lang is None:
        from src.gui.language_dialog import choose_language
        lang = choose_language()
    set_lang(lang)

    wizard = CalibrationWizard("/dev/ttyACM0", "follower")
    wizard.show()
    sys.exit(app.exec())
