[English](../en/macOS.md) | 简体中文 | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# SoARM 系列校准工具 — macOS 使用教程

适用于 macOS 11 (Big Sur) 及以上。重点:串口命名(`cu.*` vs `tty.*`)、USB 驱动。

> ⚠️ **兼容性说明:本系统目前仅支持 Feetech(STS3215 系列)舵机**。寄存器表、xdat 参数格式均针对飞特 STS3215 系列设计,其他品牌/型号不保证兼容。

---

## 1. 环境要求

| 依赖 | 版本 |
|------|------|
| Python | >= 3.8(建议 3.10+,Homebrew 安装) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| 系统 | macOS 11+ (Apple Silicon / Intel) |

## 2. 安装 Python

推荐用 Homebrew 安装,避免系统自带 Python 版本过旧:

```bash
# 安装 Homebrew(如果没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Python
brew install python
```

验证:

```bash
python3 --version
```

## 3. 安装依赖

```bash
cd SO-ARM101-ServoController

# 创建虚拟环境
python3 -m venv .venv

# 激活(macOS 用 source,不是 .bat)
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

## 4. ⚠️ macOS 串口命名【关键】

macOS 把 USB 转串口设备放在 `/dev` 下,有**两套命名**:

| 前缀 | 含义 | 是否可用 |
|------|------|---------|
| `/dev/tty.usbserial-*` | 调制解调器风格(阻塞式) | 可能卡住,不推荐 |
| `/dev/cu.usbserial-*` | 调用/终端风格(**非阻塞**) | ✅ 推荐使用 |

**查看你的串口名:**

```bash
ls /dev/cu.*
```

典型输出:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # 板载 USB 串口(Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> 程序会自动优先选择 `cu.*` 设备。若手动指定端口,请用 `cu.` 而非 `tty.`。

## 5. USB 驱动

大部分常见芯片(CH340、CP2102、FTDI)macOS 自带驱动,即插即用。若设备不识别:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**:较老批次需安装 WCH 官方驱动
- 一般 `ls /dev/cu.*` 能看到设备即可

## 6. 检查环境

```bash
python setup.py
```

## 7. 启动 GUI

```bash
python main.py
# 或
python -m src.gui.factory_calibration_tool
```

指定端口:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> 只有一个串口时,第二个端口自动禁用。

## 8. 界面操作流程

### 8.1 舵机标定页
- 选择串口 → 自动扫描舵机(ID 1-6)
- 中位校准会打开 LeRobot 校准向导:左侧实时监视(ID / Pos / 滑动条),右侧校准表格
- 【开始中位值记录】→ 摆好中位 →【完成中位值记录】;【记录运动范围】(变绿)→ 每个关节转到尾(夹爪也要转)→ 再点停止
- 6 个关节完成后自动保存并覆盖同名校准文件

> ⚠️ 两条臂的关节行程要扫得一致,否则遥操作时从动臂幅度会和主动臂对不上。

### 8.2 单舵机控制页
- 每行:ID / Pos 数值 / 滑动条 / L(目标)
- **Pos 与滑杆双向绑定**:拖滑杆 Pos 跟着变;在 Pos 里输入数字,滑杆跟着跳并立即发命令
- 拖动过程中不发命令,松开才发送

### 8.3 FT 调试器页
- 串口连接(默认 1M)、扫描舵机、读取参数
- 参数表(56 寄存器)、点选联动填充地址/长度/值
- 写入弹窗:成功弹绿色"✅ 已成功写入",失败弹红色"❌ 写入失败"(含原因)
- 位置控制:滑动条拖动调整目标位置(0-4095),数值框同步显示
- 波特率 / 恢复出厂
- xdat 参数(仅保存 EEPROM):保存 → 打开 → 恢复

### 8.4 遥控

> ⚠️ **方向说明:主动臂 控制 从动臂**。主动臂(主控)只读取舵机角度,从动臂(从控)被同步控制。需两个端口存在相同 ID 的舵机。

顶栏 `🎮 遥控`:主动臂 读取 → 从动臂 控制(两端口同 ID 舵机)

## 9. 常见问题

| 问题 | 解决 |
|------|------|
| 串口名带 `tty.` 卡住 | 改用 `cu.` 前缀 |
| 找不到设备 | `ls /dev/cu.*`;插拔后重插;`system_profiler SPUSBDataType` |
| 中文界面空白 | 系统自带 PingFang,一般正常;异常时安装 Noto Sans CJK |
| 权限问题 | macOS 一般无需额外权限;若弹出访问控制,允许终端访问 |
| 虚拟环境激活失败 | `source .venv/bin/activate`(不是 `.bat`) |
| Apple Silicon 编译错误 | Python 3.10+ 原生支持,避免用 Rosetta 的旧 Python |

## 10. 命令行工具(可选)

```bash
# 扫描舵机
python -m src.tools.scan_id

# LeRobot 校准
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. 提示

- **串口名会变**:不同 USB 口插拔后 `cu.*` 名可能变化,每次启动时在顶栏下拉框选择即可
- **省电**:macOS 可能休眠导致串口断开,操作时保持唤醒或调高睡眠时间
- **隐私权限**:首次运行如提示"访问可移动磁盘",点击允许
