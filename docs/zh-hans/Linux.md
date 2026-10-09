[English](../en/Linux.md) | 简体中文 | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# SoARM 系列校准工具 — Linux 使用教程

适用于 Ubuntu / Debian / 其他主流发行版。重点:串口权限(dialout)、USB 转串口设备识别。

> ⚠️ **兼容性说明:本系统目前仅支持 Feetech(STS3215 系列)舵机**。寄存器表、xdat 参数格式均针对飞特 STS3215 系列设计,其他品牌/型号不保证兼容。

---

## 1. 环境要求

| 依赖 | 版本 |
|------|------|
| Python | >= 3.8(建议 3.10+) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| 系统 | Ubuntu 20.04+ / Debian 11+ |

中文字体(显示中文界面必需):

```bash
sudo apt install fonts-noto-cjk
```

emoji 图标字体(日志中的 ✅⚠️ 等):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. 安装 Python 依赖

```bash
cd SO-ARM101-ServoController

# 创建虚拟环境
python3 -m venv .venv

# 激活
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

> 若 pip 报 externall managed environment,用 `pip install --break-system-packages -r requirements.txt` 或使用 venv。

## 3. ⚠️ 串口权限(dialout)【必需】

Linux 默认**普通用户无法访问** `/dev/ttyUSB*` / `/dev/ttyACM*`。将当前用户加入 `dialout` 组:

```bash
sudo usermod -a -G dialout $USER
```

**注销并重新登录**(或重启)后生效。验证:

```bash
groups
# 输出应包含 dialout
```

> 不生效时:重启电脑;部分发行版组名是 `uucp`(Arch)或 `tty`。

## 4. 识别 USB 转串口设备

插入适配器后,查看设备:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

典型输出:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # 原生 USB 串口(Arduino/ESP32 板载)
```

查看详细制造商信息:

```bash
dmesg | tail -20 | grep -i tty
# 或
lsusb
```

> 多个设备时按插拔顺序分配 ttyUSB0/ttyUSB1,可能不稳定。建议**用 /dev/ttyACM* 或按制造商固定**。

## 5. 检查环境

```bash
python setup.py
```

## 6. 启动 GUI

```bash
python -m src.gui.factory_calibration_tool
```

指定端口:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> 若只有一个串口,工具会自动把第二个端口设为"禁用"。

## 7. 界面操作流程

### 7.1 舵机标定页
1. 顶栏选择串口 → 自动扫描舵机
2. **中位校准 / 中位测试 / 失能电机** 三个按钮

### 7.2 单舵机控制页
滑杆控制位置、力矩开关。

### 7.3 FT 调试器页
- 串口连接(默认 1M 波特率)、扫描舵机
- 读取参数、参数表(56 个寄存器)、点选联动填充地址/长度/值
- 写入弹窗:成功弹绿色"✅ 已成功写入",失败弹红色"❌ 写入失败"(含原因)
- 位置控制:滑动条拖动调整目标位置(0-4095),数值框同步显示
- 波特率修改 / 恢复出厂
- xdat 参数(仅保存 EEPROM):保存当前舵机 → 打开备份 → 恢复

### 7.4 遥控

> ⚠️ **方向说明:串口1 控制 串口2**。串口1(主控)只读取舵机角度,串口2(从控)被同步控制。需两个端口存在相同 ID 的舵机。

顶栏 `🎮 遥控`:串口1 读取 → 串口2 控制(两端口同 ID 舵机)

## 8. 常见问题

| 问题 | 解决 |
|------|------|
| **Permission denied: /dev/ttyUSB0** | 未加入 dialout 组,见第 3 节;或 `sudo chmod 666 /dev/ttyUSB0`(临时) |
| 找不到串口 | `ls /dev/ttyUSB* /dev/ttyACM*`;`lsusb` 确认设备 |
| 设备名变化 | 插拔顺序影响 ttyUSB 编号;用 `udev` 规则固定或每次启动时选择 |
| 中文界面空白 | 安装 `fonts-noto-cjk` |
| emoji 显示方块 | 安装 `fonts-noto-color-emoji` |
| pip 安装失败 | 用虚拟环境;或 `--break-system-packages` |
| 程序无法启动 | `python3 --version` 确认版本;`pip list` 检查依赖 |

## 9. 命令行工具(可选)

```bash
# 扫描舵机
python -m src.tools.scan_id

# LeRobot 校准
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. 高级:udev 固定设备名(可选)

创建 `/etc/udev/rules.d/99-servo.rules` 按 USB ID 固定:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

`ls -l /dev/ttyServo` 即可用固定名。厂商 ID 用 `lsusb` 查询。
