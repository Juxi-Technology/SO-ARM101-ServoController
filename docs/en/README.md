English | [简体中文](../zh-hans/README.md) | [繁體中文](../zh-hant/README.md) | [Deutsch](../de/README.md) | [Español](../es/README.md) | [Français](../fr/README.md) | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# So-ARM Series Calibration Tool

**A factory-calibration and LeRobot calibration toolkit for FTServo servos on the So-ARM 10X series of robotic arms**

> ⚠️ **Compatibility notice: this system currently supports Feetech (STS3215 series) servos only.** The register table, the xdat parameter format and the baud-rate table are all designed for the Feetech STS3215 series; servos from other brands or models are not guaranteed to be compatible.

> 📜 **Origin and credits: this tool is built on and extends [Seeed Studio's Seeed_RoboController](https://github.com/Seeed-Studio)**, which was released under the MIT license. While preserving the original core functionality, this project reworks the GUI and adds an FT debugger, xdat parameter backup/restore, cross-platform support and other enhancements. See [LICENSE](../../LICENSE) for details.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[Features](#-features) · [Interface Overview](#-interface-overview) · [Quick Start](#-quick-start) · [Usage Steps](#-usage-steps) · [Precautions](#-precautions) · [Troubleshooting](#-troubleshooting)

</div>

---

## ✨ Features

| Feature | Description |
| ---- | ---- |
| Automatic port detection | Identifies USB serial ports and filters out virtual devices |
| Cross-platform support | Works on Windows / Ubuntu / macOS |
| Dual-port synchronization | Left and right serial ports operate independently, with master/slave dual-port synchronized remote control |
| Chinese/English toggle | Switch the interface between Chinese and English in one click; the choice is remembered |
| Center calibration | Burns the servo's current position as the 2048 center (persisted to EEPROM) |
| Center test | Enables torque and moves the servos to the center to verify calibration |
| Disable motors | Disables torque on all servos in one click for manual adjustment |
| Auto-scan | Automatically detects every online servo with an ID in the 1–20 range |
| Single-servo control | Real-time slider control of a single servo's position and torque switch |
| FT debugger | Serial connection, scanning, parameter read/write, position control, baud-rate change, factory reset, xdat parameter backup |
| xdat parameters | Save the current servo's EEPROM parameters / open a backup to restore |
| LeRobot calibration | Generates LeRobot-format JSON calibration files |
| Run to center from a calibration file | Moves the arm to the center from a calibration file |

---

## 📚 Per-OS Guides

| OS | Guide |
|----|-------|
| Windows | [Windows Guide](Windows.md) |
| Linux | [Linux Guide](Linux.md) |
| macOS | [macOS Guide](macOS.md) |

---

## 🖥️ Interface Overview

The main program contains three tabs:

```
┌─────────────────────────────────────────────────────────────────┐
│  SoARM Calibration Suite   [Port1▾] [Port2▾] [🔄] [🎮 Remote][EN]│  ← Top bar
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬──────────────────────────────┐ │
│  │ Port 1 - Servo Calib.       │ Port 2 - Servo Calib.        │ │
│  │ [🔴 Not connected] Current:…│ [🔴 Not connected] Current:… │ │
│  │ Servo 1–6 status table      │ Servo 1–6 status table       │ │
│  │ [Center Cal][Center Test]…  │ [Center Cal][Center Test]…   │ │
│  └─────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Top bar**: application title, serial-port dropdowns, refresh button, remote-control button and language-toggle button.
- **🦾 Tab 1 — Servo Calibration**: quick actions on the left and right panels (center calibration, center test, disable motors) plus live status.
- **🎚️ Tab 2 — Single-Servo Control**: fine-tune the position of each online servo with a slider and toggle its torque.
- **🔬 Tab 3 — FT Debugger**: serial connection, scanning, parameter read/write, position control, baud-rate / factory reset, and xdat parameter backup and restore.

---

## 🚀 Quick Start

> See [📚 Per-OS Guides](#-per-os-guides) for the complete per-system walkthroughs. The essentials for each system are below.

### Windows

1. Install [Python 3.10+](https://www.python.org/downloads/) (check **Add to PATH**).
2. Create a virtual environment and install the dependencies:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Check the environment and launch:

```bash
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Confirm the COM port in Device Manager (for example `COM3`) and select it in the top bar. To specify the ports manually:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. Install the CJK fonts and dependencies:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ Add serial-port permissions (dialout group)** [required]:

```bash
sudo usermod -a -G dialout $USER
# Takes effect after you log out and back in
```

3. Create a virtual environment, install the dependencies and launch:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. The serial devices are `/dev/ttyUSB0` / `/dev/ttyACM0`. To specify them manually:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. Install Python with Homebrew:

```bash
brew install python
```

2. Create a virtual environment, install the dependencies and launch:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ Serial-port naming**: on macOS use `/dev/cu.usbserial-*` (**recommended, non-blocking**) rather than `/dev/tty.*`. To list them:

```bash
ls /dev/cu.*
```

To specify them manually:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### General command-line tools (no GUI required)

```bash
# Scan servos
python -m src.tools.scan_id

# Quick servo center calibration
python -m src.tools.servo_quick_calibration

# Servo center test
python -m src.tools.servo_center_test

# Disable all servos
python -m src.tools.servo_disable

# LeRobot-style calibration
python -m src.tools.lerobot_calibrate

# Dual-port synchronized remote control
python -m src.tools.servo_remote_control
```

---

## 📖 Usage Steps

### 1. Connect and detect servos

1. Connect the arm's control board through a USB-to-serial adapter and power the servos.
2. Open the GUI and select the corresponding port from the serial dropdown in the top bar (or click `🔄` to refresh).
3. The panel header shows `🟢 Connected` and automatically scans for online servos with IDs in the 1–20 range (usually 1–6).

> If the port is reported as busy, make sure no other program (a serial monitor, or a previous run of the tool that never exited) is holding it.

### 2. Center calibration (set the current position to 2048)

> Before calibrating, physically pose the arm so that each joint is at the "zero / center" position you want.

1. Click the **Serial X Center Calibration** button on the panel.
2. The program first disables the servos and prompts you to move them by hand to the desired center.
3. Once you confirm, the program processes each servo: unlock EEPROM → write the calibration command (value 128 to address 40) → re-lock EEPROM.
4. Verify with "Center Test": the servos should hold their position (moving only slightly), which confirms a successful calibration.

### 3. Center test

1. Click **Serial X Center Test**.
2. The program enables torque and moves all servos to 2048.
3. If a servo barely moves from its current position, the calibration is correct; if it moves a lot, the calibration value is unreliable and must be redone.

### 4. Disable motors (manual adjustment)

- Click **Serial X Disable Motors** to disable torque on every servo on that port, so they can be rotated freely by hand.
- An individual servo can be toggled on the **Single-Servo Control** tab using the torque switch below its slider.

### 5. Change a servo ID

1. Open the **🔬 FT Debugger** tab, connect the serial port and scan for servos.
2. Select the target servo, change its "Servo ID" value (address 0x05) in the parameter table and click Write.
3. The program then runs: unlock → write address 5 → verify the new ID → re-lock.

> ⚠️ Before changing an ID, always make sure this is the only servo on the bus to avoid ID conflicts.

### 6. Change the baud rate / restore factory defaults

- **Change baud rate**: in the "Baud Rate / Factory Reset" area of the FT Debugger tab, select the new baud rate (38400 – 1000000 bps) and apply it. After the write, the serial baud rate switches automatically and is verified with a ping; on failure it rolls back automatically.
- **Restore factory defaults**: the servo returns to its factory defaults (ID=1, baud rate=1000000); you must rescan afterwards.

### 7. xdat parameter backup and restore

In the "xdat parameters (save EEPROM only)" area of the FT Debugger tab:

1. **💾 Save current servo**: saves the selected servo's EEPROM parameters to an xdat file (a backup).
2. After changing the servo's parameters at will, if you want to restore them:
3. **📂 Open xdat**: loads a backup file.
4. **📤 Restore parameters to servo**: writes the backup back to the current servo's EEPROM.

### 8. Dual-port synchronized remote control

> ⚠️ **Direction note: Port 1 controls Port 2.** Port 1 (master) only reads servo angles; Port 2 (slave) is driven in sync.

1. In the top bar, click **🎮 Remote** (Port 1 reads angles → Port 2 drives the servos with the same IDs in sync).
2. The two ports must use matching servo IDs; only servos present on both are synchronized.
3. Click the same button again to stop, after which the left and right panel scan threads resume automatically.

### 9. LeRobot calibration (command line)

```bash
# Calibrate the follower arm (saved to ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Calibrate the leader arm
python -m src.tools.lerobot_calibrate --arm-type leader
```

Procedure: disable the servos → pose each joint to the center and record `homing_offset` → slowly rotate through the full range to record `range_min/max` (`wrist_roll` is a continuous-rotation joint whose range is fixed at `[0,4095]`) → save the JSON.

Run to center from a calibration file:

```bash
python -m src.tools.run_calibration_middle <calibration_file.json> --mode zero
```

---

## ⚠️ Precautions

1. **Safety first**: center calibration persists to EEPROM. Before calibrating, confirm the power supply is stable and the arm will not collide with people or objects.
2. **Power supply**: the SoARM 101 standard edition is best powered at DC 5V 5A, and the Pro edition at DC 12V 5A. Insufficient power causes missed steps or communication failures.
3. **Exclusive serial port**: on Windows the serial port is exclusive, so the same port cannot be used by the GUI scan thread and a calibration subprocess at the same time. The tool stops the scan thread and ends the old process before operating; do not click repeatedly by hand.
4. **Linux serial permissions**: accessing `/dev/ttyUSB*` / `/dev/ttyACM*` requires adding your user to the `dialout` group (see the [Linux Guide](Linux.md)).
5. **macOS serial naming**: use `/dev/cu.*` (non-blocking) rather than `/dev/tty.*` (blocking, may hang); see the [macOS Guide](macOS.md).
6. **Hot-plugging**: after you unplug the USB cable the program tries to reconnect automatically; once it is plugged back in, click `🔄` to refresh the port list.
7. **Over-temperature / over-voltage protection**: the program monitors voltage and temperature (warning above 60°C). If a servo stays hot, stop and let it cool.
8. **Center calibration is irreversible**: the write overwrites the original offset and cannot be undone. Record the original position before calibrating.
9. **ID-change risk**: if the write or the verification fails, the program reports an error and resumes scanning, but in extreme cases a servo may become "lost". If that happens, try "Restore factory defaults" (after which the ID returns to 1).
10. **Encoding issues**: if emoji appear garbled in a Windows console, set `PYTHONIOENCODING=utf-8` before running the command-line tools. Linux/macOS use native UTF-8 and are normally unaffected.

---

## 🛠️ Troubleshooting

| Symptom | Possible cause | Solution |
| ---- | -------- | -------- |
| Cannot open the serial port / port busy | Another program is using it | Close programs such as serial monitors, or switch to another port and restart the tool |
| No servos found | Insufficient power / incorrect wiring / baud-rate mismatch | Check the power and wiring, and confirm the servos are at 1M baud |
| Servos run wild after center calibration | The pose was not set before calibrating | Repeat "disable → pose by hand → center calibration" |
| Temperature rising too fast | Excessive load or a stalled joint | Check for mechanical binding and reduce speed/acceleration |
| Servo not found after changing its ID | ID conflict or a failed write | Restore factory defaults and rescan |
| Remote control out of sync | The IDs on the two ports differ | Confirm that servos with the same IDs are online on the master and slave ports |

---

## 📁 Project Structure

```
SO-ARM101-ServoController/
├── docs/                    # Documentation, one folder per language
│   └── <lang>/              # en, zh-hans, zh-hant, de, es, fr, it, ja, ko, pt-br, pt-pt
│       ├── README.md        # This document
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── src/
│   ├── gui/                  # PySide6 graphical interface
│   │   ├── factory_calibration_tool.py   # Main tool (dual-port calibration + remote control + language switch)
│   │   ├── ft_debugger.py                # FT debugger (parameter read/write / xdat backup)
│   │   ├── calibration_wizard.py         # LeRobot calibration wizard
│   │   ├── theme_utils.py                # Light theme
│   │   └── language_dialog.py            # Language-selection dialog
│   ├── tools/                # Command-line tools
│   ├── xdat_utils.py         # xdat parameter file read/write
│   ├── i18n*.py / i18n_translations/     # Chinese/English internationalization
│   ├── port_utils.py         # Serial-port detection
│   └── calibration_manager.py# LeRobot calibration file management
├── scservo_sdk/              # FTServo servo communication SDK
├── requirements.txt
└── setup.py                  # Environment check script
```
