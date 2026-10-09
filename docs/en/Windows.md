English | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# SoARM Series Calibration Tool — Windows Guide

For Windows 10 / 11. Covers installation to full servo calibration.

> ⚠️ **Compatibility: This tool currently supports only Feetech (STS3215 series) servos**. Register table and xdat format are designed for Feetech STS3215; other brands/models are not guaranteed.

---

## 1. Requirements

| Dependency | Version | Notes |
|-----------|---------|-------|
| Python | >= 3.8 | 3.10+ recommended, download from [python.org](https://www.python.org/downloads/) |
| PySide6 | >= 6.0 | GUI framework |
| pyserial | >= 3.5 | Serial communication |
| OS | Win10 / Win11 | Any edition |

## 2. Install Python

1. Visit <https://www.python.org/downloads/>
2. Download Python 3.10+ installer
3. **Check "Add Python to PATH"** during install (otherwise python won't be found in terminal)

Verify:

```bash
python --version
```

## 3. Install Dependencies

Install in a virtual environment to avoid polluting system Python:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **Create the virtual environment only ONCE**. Re-running it will reset/overwrite the environment (clearing installed deps). After that, just `activate` it each time.

> The prompt will show `(.venv)` after activation.

## 4. Check Environment

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目` means the environment is ready.

## 5. Connect Hardware

1. Plug in the USB-to-serial adapter (CH340 / CP2102)
2. Connect the servo controller (robot arm control board)
3. Power the servos (DC 5V 5A standard, DC 12V 5A Pro)

Check the COM port in Device Manager (`Win+X` → Device Manager):

```
Ports (COM & LPT)
  └─ USB-SERIAL CH340 (COM3)     ← your servo port
```

> **Note the COM number** to select it when starting.

## 6. Launch GUI

```bash
python -m src.gui.factory_calibration_tool
```

Or specify ports (if occupied):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

List available ports:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. Interface Workflow

### 7.1 Servo Calibration Tab

1. Select Port1/Port2 in the top bar → auto-scan servos (ID 1-6)
2. Common buttons:
   - **Middle Calibration**: set current position as center 2048
   - **Middle Test**: enable torque and move to center to verify
   - **Disable Servos**: turn off torque for manual rotation

### 7.2 Single Servo Control Tab

- Drag slider → servo moves to target position on release
- Torque switch controls individual servos

### 7.3 FT Debugger Tab

- **Serial Connection**: select port, baud rate (default 1M)
- **Scan Servos**: detect online servos
- **Read Params**: read all registers (EEPROM + SRAM)
- **Parameter Table**: 5 columns showing all 56 registers, **row-select linkage fills address/length/value**
- **Write Popup**: green "✅ Written successfully" on success, red "❌ Write failed" (with reason) on failure
- **Position Control**:
  - **Slider** to adjust target position (0-4095), value box updates live; or type directly in the box
  - After movement, prompt to turn off torque
- **Baud Rate / Factory Reset**: change baud rate, factory reset
- **xdat Params (EEPROM only)**:
  1. `💾 Save Current Servo`: save current servo EEPROM params to xdat file
  2. `📂 Open xdat`: load a backup file
  3. `📤 Restore to Servo`: write the backup back to the servo

### 7.4 Remote Control

> ⚠️ **Direction: Port1 controls Port2**. Port1 (master) only reads servo angles, Port2 (slave) is synchronized. Requires matching servo IDs on both ports.

- Top bar `🎮 Remote` button: Port1 reads → Port2 controls (same-ID servos)
- Click again to stop remote control

## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| No serial port | Check driver in Device Manager; try another USB port; install CH340 driver |
| Port in use | Close serial monitors; restart the tool |
| Chinese text blank | System has Microsoft YaHei; install CJK font if broken |
| Servo not found | Check power/wiring; confirm 1M baud |
| PermissionError opening port | Ensure no other process holds the COM port |

## 9. Command Line Tools (Optional)

```bash
# Scan servos
python -m src.tools.scan_id

# Quick middle calibration
python -m src.tools.servo_quick_calibration

# LeRobot calibration
python -m src.tools.lerobot_calibrate
```
