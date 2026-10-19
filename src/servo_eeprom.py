#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""LeRobot 校准参数在舵机 EEPROM 上的读写。

校准向导（GUI）和命令行工具共用这一份实现，避免两处各写一套导致口径漂移——
这是直接写硬件 EEPROM 的操作，两边不一致就等于机械臂被标歪。

涉及的三个寄存器（STS3215 / 协议 0，与 LeRobot 一致）：

* 31 ``SMS_STS_OFS_L``           运动偏移，**符号-幅值**编码，见 src/calibration_math.py
* 9  ``SMS_STS_MIN_ANGLE_LIMIT_L`` 最小角度限位
* 11 ``SMS_STS_MAX_ANGLE_LIMIT_L`` 最大角度限位

所有收发都支持传入 ``lock``：同一个 PortHandler 不是线程安全的，后台读取线程和
界面线程同时收发会互相吃掉对方的应答包，表现就是"命令发了但舵机没动"。
"""

import contextlib
import time

from scservo_sdk.scservo_def import COMM_SUCCESS
from scservo_sdk.sms_sts import (
    SMS_STS_MAX_ANGLE_LIMIT_L,
    SMS_STS_MIN_ANGLE_LIMIT_L,
    SMS_STS_OFS_L,
)

from src.calibration_math import MAX_RES, encode_homing_offset
from src.i18n import tr


def _ctx(lock):
    return lock if lock is not None else contextlib.nullcontext()


def read_eeprom(servo_handler, servo_id, address, lock=None):
    """读一个 2 字节寄存器，返回 (值, 错误信息)；失败时值为 None。"""
    if servo_handler is None:
        return None, tr("串口未连接")
    try:
        with _ctx(lock):
            value, result, error = servo_handler.read2ByteTxRx(servo_id, address)
        if result != COMM_SUCCESS:
            return None, tr("读取寄存器 {} 失败: {}").format(address, error)
        return value, ""
    except Exception as e:
        return None, str(e)


def write_eeprom(servo_handler, servo_id, address, value, lock=None, verify=True):
    """写一个 2 字节 EEPROM 寄存器，自动解锁/上锁，写完回读校验。

    只负责搬运字节：value 必须已经是按该寄存器编码规则算好的**非负**整数。
    运动偏移是符号-幅值，直接把负数交给 write2ByteTxRx 会写成补码，
    LeRobot 读回来对不上。

    verify=True 会在重新上锁后回读比对——写没写进去当场就能知道，
    不用等 LeRobot 报"未校准"才发现。
    返回 (是否成功, 错误信息)。
    """
    if servo_handler is None:
        return False, tr("串口未连接")
    try:
        with _ctx(lock):
            result, error = servo_handler.unLockEprom(servo_id)
            if result != COMM_SUCCESS:
                return False, tr("EEPROM解锁失败: {}").format(error)
            time.sleep(0.1)

            result, error = servo_handler.write2ByteTxRx(servo_id, address, value)
            if result != COMM_SUCCESS:
                servo_handler.LockEprom(servo_id)
                return False, tr("写入寄存器 {} 失败: {}").format(address, error)
            time.sleep(0.05)

            result, error = servo_handler.LockEprom(servo_id)
            if result != COMM_SUCCESS:
                return False, tr("EEPROM重新锁定失败: {}").format(error)

            if verify:
                time.sleep(0.05)
                actual, result, error = servo_handler.read2ByteTxRx(servo_id, address)
                if result != COMM_SUCCESS:
                    return False, tr("写入后回读寄存器 {} 失败: {}").format(address, error)
                if actual != value:
                    return False, tr("写入寄存器 {} 后回读不一致（写入 {}，读回 {}）").format(
                        address, value, actual)
        return True, ""
    except Exception as e:
        return False, str(e)


def reset_calibration(servo_handler, servo_ids, lock=None):
    """把运动偏移清零、角度限位放开到 [0, MAX_RES]。

    等价 LeRobot 的 reset_calibration（set_half_turn_homings 会先调用它）。
    必须先做这一步，偏移清零后读到的原始位置才是"未加偏移"的位置，
    据此算出的 homing_offset 才与 LeRobot 口径一致，行程读数也才落在同一坐标系。

    返回复位失败的 (舵机 ID, 错误信息) 列表。
    """
    failures = []
    for servo_id in servo_ids:
        for address, value in (
            (SMS_STS_OFS_L, 0),
            (SMS_STS_MIN_ANGLE_LIMIT_L, 0),
            (SMS_STS_MAX_ANGLE_LIMIT_L, MAX_RES),
        ):
            ok, error = write_eeprom(servo_handler, servo_id, address, value, lock=lock)
            if not ok:
                failures.append((servo_id, error))
                break
    return failures


def write_calibration_to_servos(servo_handler, calibration_data, lock=None):
    """把校准结果写回舵机，使硬件与 JSON 完全一致。

    等价 LeRobot 的 write_calibration。LeRobot 的 is_calibrated 是拿 JSON 与
    这三个寄存器逐个比对，只要有一处不一致，每次连接都会重新提示校准。

    calibration_data 为 {关节名: {"id", "homing_offset", "range_min", "range_max"}}，
    返回写入失败的关节名列表。
    """
    failed = []
    for name, joint in calibration_data.items():
        for address, value in (
            (SMS_STS_OFS_L, encode_homing_offset(joint["homing_offset"])),
            (SMS_STS_MIN_ANGLE_LIMIT_L, joint["range_min"]),
            (SMS_STS_MAX_ANGLE_LIMIT_L, joint["range_max"]),
        ):
            ok, error = write_eeprom(servo_handler, joint["id"], address, value, lock=lock)
            if not ok:
                print(tr("[DEBUG] {} (ID{}) 写入寄存器 {} 失败: {}").format(
                    name, joint["id"], address, error))
                failed.append(name)
                break
    return failed
