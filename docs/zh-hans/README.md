[English](../en/README.md) | 简体中文 | [繁體中文](../zh-hant/README.md) | [Deutsch](../de/README.md) | [Español](../es/README.md) | [Français](../fr/README.md) | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# So-ARM 系列校准工具

**专为 So-ARM 10X 系列机械臂设计的 FTServo 舵机工厂校准与 LeRobot 校准工具包**

> ⚠️ **兼容性说明:本系统目前仅支持 Feetech(STS3215 系列)舵机**。寄存器表、xdat 参数格式、波特率表均针对飞特 STS3215 系列设计,其他品牌/型号舵机不保证兼容。

> 📜 **来源与致谢:本工具基于 [Seeed Studio 的 Seeed_RoboController](https://github.com/Seeed-Studio) 项目改造与升级**,原项目以 MIT 许可发布。本项目在保留原有核心功能基础上,重构了 GUI 界面、新增了 FT 调试器、xdat 参数备份/恢复、跨平台支持等增强功能。详见 [LICENSE](../../LICENSE)。

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[功能特性](#-功能特性) · [界面介绍](#-界面介绍) · [快速开始](#-快速开始) · [使用步骤](#-使用步骤) · [注意事项](#-注意事项) · [故障排除](#-故障排除)

</div>

---

## ✨ 功能特性

| 特性 | 说明 |
| ---- | ---- |
| 自动端口检测 | 智能识别 USB 串口，自动过滤虚拟设备 |
| 跨平台支持 | Windows / Ubuntu / macOS 全平台兼容 |
| 双端口同步 | 左、右两个串口独立操作，支持主从双端口同步遥控 |
| 中英文切换 | 界面内一键切换中 / 英文，选择自动记忆 |
| 中位校准 | 将舵机当前位置烧录为 2048 中位（EEPROM 持久化） |
| 中位测试 | 启动力矩并将舵机移动到中位，验证校准结果 |
| 失能电机 | 一键关闭所有舵机力矩，便于手动调整 |
| 自动扫描 | 自动检测 ID 1–20 范围内所有在线舵机 |
| 单舵机控制 | 滑杆实时控制单个舵机位置与力矩开关 |
| FT 调试器 | 串口连接、扫描、参数读写、位置控制、波特率修改、恢复出厂、xdat 参数备份 |
| xdat 参数 | 保存当前舵机 EEPROM 参数 / 打开备份恢复 |
| LeRobot 校准 | 生成 LeRobot 格式的 JSON 校准文件 |
| 校准文件中位运行 | 根据校准文件将机械臂移动到中位 |

---

## 📚 系统教程

| 系统 | 教程 |
|------|------|
| Windows | [Windows 使用教程](Windows.md) |
| Linux | [Linux 使用教程](Linux.md) |
| macOS | [macOS 使用教程](macOS.md) |

---

## 🖥️ 界面介绍

主程序包含三个标签页:

```
┌─────────────────────────────────────────────────────────────┐
│  SoARM 系列校准工具         [串口1▾] [串口2▾] [🔄]  [🎮遥控][EN]│  ← 顶栏
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┬──────────────────────────────┐ │
│  │ 串口1 - 舵机标定        │ 串口2 - 舵机标定            │ │
│  │  [🔴未连接] 当前舵机:…   │  [🔴未连接] 当前舵机:…      │ │
│  │  舵机1~6 状态表格        │  舵机1~6 状态表格           │ │
│  │  [中位校准][中位测试]…   │  [中位校准][中位测试]…      │ │
│  └─────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- **顶栏**：应用标题、串口选择下拉框、刷新按钮、遥控按钮、语言切换按钮。
- **🦾 Tab1 舵机标定**：左右面板快捷操作（中位校准、中位测试、失能电机）及实时状态。
- **🎚️ Tab2 单舵机控制**：对每个在线舵机用滑杆微调位置、开关力矩。
- **🔬 Tab3 FT 调试器**：串口连接、扫描、参数读写、位置控制、波特率/恢复出厂、xdat 参数备份恢复。

---

## 🚀 快速开始

> 完整分系统教程见 [📚 详细教程](#-详细教程)。以下为各系统要点。

### Windows

1. 安装 [Python 3.10+](https://www.python.org/downloads/)(勾选 **Add to PATH**)
2. 创建虚拟环境并安装依赖:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. 检查环境并启动:

```bash
python setup.py
python -m src.gui.factory_calibration_tool
```

4. 设备管理器确认串口号(如 `COM3`),顶栏选择。手动指定端口:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. 安装中文字体与依赖:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ 添加串口权限(dialout 组)**【必需】:

```bash
sudo usermod -a -G dialout $USER
# 注销并重新登录后生效
```

3. 创建虚拟环境、安装依赖、启动:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. 串口设备为 `/dev/ttyUSB0` / `/dev/ttyACM0`。手动指定:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. 用 Homebrew 安装 Python:

```bash
brew install python
```

2. 创建虚拟环境、安装依赖、启动:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ 串口命名**:macOS 用 `/dev/cu.usbserial-*`(**推荐,非阻塞**)而非 `/dev/tty.*`。查看:

```bash
ls /dev/cu.*
```

手动指定:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### 通用命令行工具(无需 GUI)

```bash
# 扫描舵机
python -m src.tools.scan_id

# 舵机快速中位校准
python -m src.tools.servo_quick_calibration

# 舵机中位测试
python -m src.tools.servo_center_test

# 失能全部舵机
python -m src.tools.servo_disable

# LeRobot 风格校准
python -m src.tools.lerobot_calibrate

# 双端口同步遥控
python -m src.tools.servo_remote_control
```

---

## 📖 使用步骤

### 1. 连接与识别舵机

1. 通过 USB 转串口适配器连接机械臂控制板，给舵机供电。
2. 打开 GUI，在顶栏串口下拉框中选择对应端口（或点击 `🔄` 刷新）。
3. 面板顶部显示 `🟢 已连接`，并自动扫描出 ID 1–20 范围内的在线舵机（通常为 1–6）。

> 若提示串口占用，请确认没有其他程序（串口监视器、上一个未退出的工具）占用该端口。

### 2. 中位校准（将当前位置设为 2048）

> 校准前请先物理摆好机械臂姿态，使每个关节位于你期望的"零位 / 中位"。

1. 点击面板上的 **串口X中位校准** 按钮。
2. 程序先失能舵机，提示你手动调整舵机到期望中位。
3. 确认后，程序对每个舵机执行：解锁 EEPROM → 写入校准命令（值 128 到地址 40）→ 重新锁定 EEPROM。
4. 校准后可使用"中位测试"验证：舵机应保持原位（位移很小）说明校准成功。

### 3. 中位测试

1. 点击 **串口X中位测试**。
2. 程序启动力矩并把所有舵机移动到 2048。
3. 若舵机从当前位置几乎不动，说明校准正确；若大幅移动，说明该校准值不可靠，需要重新校准。

### 4. 失能电机（手动调整）

- 点击 **串口X失能电机**，关闭该端口全部舵机力矩，可自由手动旋转。
- 单舵机可在 **单舵机控制** 页通过滑杆下方的力矩开关单独开关。

### 5. 修改舵机 ID

1. 进入 **🔬 FT 调试器** 页，连接串口并扫描舵机。
2. 选中目标舵机，在参数表中修改"舵机 ID"（地址 0x05）的值，点击写入。
3. 程序执行：解锁 → 写入地址 5 → 验证新 ID → 重新锁定。

> ⚠️ 修改 ID 前务必确保总线上只有这一只舵机，避免 ID 冲突。

### 6. 修改波特率 / 恢复出厂设置

- **修改波特率**：在 FT 调试器页的"波特率 / 恢复出厂"区，选择新波特率（38400 – 1000000 bps）后修改。写入后自动切换串口波特率并 ping 验证，失败自动回滚。
- **恢复出厂设置**：舵机恢复为出厂默认（ID=1，波特率=1000000），之后需重新扫描。

### 7. xdat 参数备份与恢复

在 FT 调试器页"xdat 参数（仅保存 EEPROM）"区：

1. **💾 保存当前舵机**：把当前选中舵机的 EEPROM 参数保存为 xdat 文件（备份）。
2. 随意修改舵机参数后，如想恢复：
3. **📂 打开 xdat**：加载备份文件。
4. **📤 恢复参数到舵机**：把备份写回当前舵机 EEPROM。

### 8. 双端口同步遥控

> ⚠️ **方向说明:串口1 控制 串口2**。串口1(主控)只读取舵机角度,串口2(从控)被同步控制。

1. 顶栏点击 **🎮 遥控**(串口1 读取角度 → 串口2 同步控制同 ID 舵机)。
2. 两个端口的舵机 ID 需一致;仅交集内的舵机会被同步。
3. 再次点击同一按钮停止,之后左右面板扫描线程自动恢复。

### 9. LeRobot 校准（命令行）

```bash
# 校准从动臂（保存到 ~/.cache/huggingface/lerobot/calibration/robots/so_follower/）
python -m src.tools.lerobot_calibrate --arm-type follower

# 校准领导臂
python -m src.tools.lerobot_calibrate --arm-type leader
```

流程：失能舵机 → 每个关节摆到中位记录 `homing_offset` → 缓慢转动整个行程记录 `range_min/max`（`wrist_roll` 为连续旋转关节，范围固定 `[0,4095]`）→ 保存 JSON。

按校准文件运行到中位：

```bash
python -m src.tools.run_calibration_middle <校准文件.json> --mode zero
```

---

## ⚠️ 注意事项

1. **安全第一**：中位校准会把 EEPROM 持久化。校准前确认供电稳定、机械臂不会碰撞到人或物。
2. **供电**：SoARM 101 标准版建议 DC 5V 5A，Pro 版建议 DC 12V 5A。供电不足会导致舵机丢步或通信失败。
3. **串口独占**：Windows 下串口被程序独占，同一端口不能同时被 GUI 扫描线程和校准子进程占用。工具会自动先停扫描线程、结束旧进程再操作，请勿手动重复点击。
4. **Linux 串口权限**：访问 `/dev/ttyUSB*` / `/dev/ttyACM*` 需将用户加入 `dialout` 组（见 [Linux 教程](Linux.md)）。
5. **macOS 串口命名**：请使用 `/dev/cu.*`（非阻塞）而非 `/dev/tty.*`（阻塞，可能卡住），见 [macOS 教程](macOS.md)。
6. **热插拔**：拔掉 USB 后程序会尝试自动重连；重新插回后点击 `🔄` 刷新端口列表。
7. **过温 / 过压保护**：程序会监控电压与温度（温度 > 60°C 告警）。若舵机连续高温，请停机散热。
8. **中位校准不可逆**：写入后原偏移被覆盖，无法撤销。建议先记录原始位置再校准。
9. **ID 修改风险**：写入失败或验证失败时程序会报错并恢复扫描，但极端情况下舵机可能"失联"。遇到失联可尝试"恢复出厂设置"（复位后 ID 回到 1）。
10. **编码问题**：若在 Windows 控制台出现 emoji 乱码，请设置 `PYTHONIOENCODING=utf-8` 后再运行命令行工具。Linux/macOS 原生 UTF-8 一般无此问题。

---

## 🛠️ 故障排除

| 现象 | 可能原因 | 解决办法 |
| ---- | -------- | -------- |
| 无法打开串口 / 端口被占用 | 其他程序占用 | 关闭串口监视器等程序，或更换端口后重启工具 |
| 扫描不到舵机 | 供电不足 / 接线错误 / 波特率不符 | 检查供电与接线，确认舵机为 1M 波特率 |
| 中位校准后舵机乱跑 | 校准前未摆好姿态 | 重新执行"失能→手动摆位→中位校准" |
| 温升过快 | 负载过大或堵转 | 检查机构卡滞，降低速度/加速度 |
| 修改 ID 后找不到舵机 | ID 冲突或写失败 | 恢复出厂设置，重新扫描 |
| 遥控不同步 | 两端口 ID 不一致 | 确认主从端口同 ID 舵机在线 |

---

## 📁 目录结构

```
SO-ARM101-ServoController/
├── docs/                    # 文档，按语言分目录
│   └── <语言>/              # en、zh-hans、zh-hant、de、es、fr、it、ja、ko、pt-br、pt-pt
│       ├── README.md        # 本文件
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── src/
│   ├── gui/                  # PySide6 图形界面
│   │   ├── factory_calibration_tool.py   # 主工具（双串口标定 + 遥控 + 语言切换）
│   │   ├── ft_debugger.py                # FT 调试器（参数读写 / xdat 备份）
│   │   ├── calibration_wizard.py         # LeRobot 校准向导
│   │   ├── theme_utils.py                # 浅色主题
│   │   └── language_dialog.py            # 语言选择对话框
│   ├── tools/                # 命令行工具
│   ├── xdat_utils.py         # xdat 参数文件读写
│   ├── i18n*.py / i18n_translations/     # 中英文国际化
│   ├── port_utils.py         # 串口检测
│   └── calibration_manager.py# LeRobot 校准文件管理
├── scservo_sdk/              # FTServo 舵机通信 SDK
├── requirements.txt
└── setup.py                  # 环境检查脚本
```
