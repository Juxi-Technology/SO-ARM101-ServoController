[English](../en/Windows.md) | 简体中文 | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# SoARM 系列校准工具 — Windows 使用教程

适用于 Windows 10 / 11。本教程覆盖从环境安装到完整校准的每一步。

> ⚠️ **兼容性说明:本系统目前仅支持 Feetech(STS3215 系列)舵机**。寄存器表、xdat 参数格式均针对飞特 STS3215 系列设计,其他品牌/型号不保证兼容。

---

## 1. 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Python | >= 3.8 | 建议 3.10+，从 [python.org](https://www.python.org/downloads/) 下载 |
| PySide6 | >= 6.0 | GUI 框架 |
| pyserial | >= 3.5 | 串口通信 |
| 系统 | Win10 / Win11 | 任意版本 |

## 2. 安装 Python

1. 访问 <https://www.python.org/downloads/>
2. 下载 Python 3.10+ 安装包
3. 安装时**务必勾选 "Add Python to PATH"**(否则命令行找不到 python)

验证安装:

```bash
python --version
```

## 3. 安装依赖

推荐在虚拟环境中安装,避免污染系统 Python:

```bash
# 进入项目目录
cd SO-ARM101-ServoController

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境(Windows)
.venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

> 提示:激活后命令行前缀会出现 `(.venv)`。

## 4. 检查环境

```bash
python setup.py
```

看到 `[OK] 环境检查通过，可以运行项目` 即表示环境正确。

## 5. 连接硬件

1. 将 USB 转串口适配器(如 CH340 / CP2102)插入电脑
2. 连接舵机控制器(机械臂控制板)
3. 给舵机供电(建议 DC 5V 5A,Pro 版 DC 12V 5A)

打开设备管理器(`Win+X` → 设备管理器)确认串口号:

```
端口 (COM 和 LPT)
  └─ USB-SERIAL CH340 (COM3)     ← 你的舵机串口
```

> **记下 COM 号**,启动程序时选择。

## 6. 启动 GUI

```bash
python -m src.gui.factory_calibration_tool
```

或手动指定端口(串口被占用时):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

查看可用端口:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. 界面操作流程

### 7.1 舵机标定页

1. 顶栏选择串口1/串口2 → 自动扫描出舵机(ID 1-6)
2. 常用按钮:
   - **串口1/2 中位校准**:将当前位置设为中位 2048
   - **串口1/2 中位测试**:启动力矩并移动到中位验证
   - **串口1/2 失能电机**:关闭力矩,可手动旋转

### 7.2 单舵机控制页

- 滑杆拖动 → 松开后舵机移动到目标位置
- 力矩开关控制单个舵机

### 7.3 FT 调试器页

- **串口连接**:选择端口、波特率(默认 1M)
- **扫描舵机**:检测在线舵机
- **读取参数**:读取全部寄存器(EEPROM + SRAM)
- **参数表**:5 列显示全部 56 个寄存器,**点选联动填充"写入地址""长度""值"**
- **写入弹窗**:写入成功弹绿色"✅ 已成功写入",失败弹红色"❌ 写入失败"(含原因)
- **位置控制**:
  - **滑动条**拖动调整目标位置(0-4095),数值框同步显示;也可直接在数值框输入
  - 移动完成后提示关闭力矩
- **波特率/恢复出厂**:修改波特率、恢复出厂设置
- **xdat 参数(仅保存 EEPROM)**:
  1. `💾 保存当前舵机`:保存当前 ID 舵机的 EEPROM 参数到 xdat 文件
  2. `📂 打开 xdat`:加载备份文件
  3. `📤 恢复参数到舵机`:把备份写回舵机

### 7.4 遥控

> ⚠️ **方向说明:串口1 控制 串口2**。串口1(主控)只读取舵机角度,串口2(从控)被同步控制。需两个端口存在相同 ID 的舵机。

- 顶栏 `🎮 遥控` 按钮:串口1 读取 → 串口2 控制(两端口同 ID 舵机)
- 再次点击按钮停止遥控

## 8. 常见问题

| 问题 | 解决 |
|------|------|
| 找不到串口 | 设备管理器检查驱动;换 USB 口;装 CH340 驱动 |
| 串口被占用 | 关闭串口监视器等程序;重启工具 |
| 中文字体显示空白 | 系统默认微软雅黑,若异常安装中文字体 |
| 舵机扫描不到 | 检查供电/接线;确认波特率 1M |
| PermissionError 打开串口失败 | 确保没有其他进程占用该 COM 口 |

## 9. 命令行工具(可选)

```bash
# 扫描舵机
python -m src.tools.scan_id

# 快速中位校准
python -m src.tools.servo_quick_calibration

# LeRobot 校准
python -m src.tools.lerobot_calibrate
```
