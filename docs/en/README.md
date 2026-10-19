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
| Dual-port synchronization | The leader-arm and follower-arm ports operate independently, with leader/follower synchronized remote control |
| Chinese/English toggle | Switch the interface between Chinese and English in one click; the choice is remembered |
| Single-servo center calibration | Burns one servo's current position as the 2048 center (persisted to EEPROM) |
| Center test | Enables torque and moves the servos to the center to verify calibration |
| Disable motors | Disables torque on all servos in one click for manual adjustment |
| Auto-scan | Automatically detects every online servo with an ID in the 1–20 range |
| Single-servo control | Real-time slider control of a single servo's position and torque switch |
| FT debugger | Serial connection, scanning, parameter read/write, position control, baud-rate change, factory reset, xdat parameter backup |
| xdat parameters | Save the current servo's EEPROM parameters / open a backup to restore |
| LeRobot calibration | One-click full calibration for the leader / follower arm (pose center + sweep range), creating and overwriting the calibration file automatically |
| Single-file build | PyInstaller packs everything into one exe; the target machine needs no Python, and every CLI tool is hosted in the same executable |
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
│  SoARM Calib. Suite   [Leader▾] [Follower▾] [🔄] [🎮 Remote][EN]│  ← Top bar
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬──────────────────────────────┐ │
│  │ Leader - Servo Calib.       │ Follower - Servo Calib.      │ │
│  │ [🔴 Not connected] Current:…│ [🔴 Not connected] Current:… │ │
│  │ Servo 1–6 status table      │ Servo 1–6 status table       │ │
│  │ [Center Cal][Center Test]…  │ [Center Cal][Center Test]…   │ │
│  └─────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Top bar**: application title, leader/follower port dropdowns, refresh, remote control and language toggle.
- **🦾 Tab 1 — Servo Calibration**: quick actions on the left and right panels (center calibration, center test, disable motors) plus live status. **Center calibration** opens the LeRobot calibration wizard (see section 2) for a one-shot whole-arm calibration.
- **🎚️ Tab 2 — Single-Servo Control**: one row per servo — ID / Pos value / slider / L (target). Pos and the slider are **two-way bound**: dragging the slider updates Pos; typing a value into Pos moves the slider and immediately sends the position command.
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

3. Check the environment and launch (both entry points are equivalent):

```bash
python setup.py
python main.py
# or
python -m src.gui.factory_calibration_tool
```

> **No-install option (Windows)**: double-click `dist\SO-ARM101-ServoController.exe` — no Python needed on the target machine. Rebuild with `pyinstaller -y SO-ARM101-ServoController.spec` (install it first with `pip install pyinstaller`). The same exe also hosts every command-line tool (see section 10).

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

### 2. Center calibration (leader arm / follower arm)

> Before calibrating, physically pose the arm so that each joint is at the "zero / center" position you want.

The **Leader Arm Center Calibration** / **Follower Arm Center Calibration** buttons in the top bar open the LeRobot calibration wizard. The window has two columns: a live monitor on the left (ID / Pos / slider for all six servos) and the calibration table plus actions on the right.

1. On connect the program disables torque and resets the servos: the homing offset is zeroed and the angle limits are opened to `[0, 4095]` (equivalent to LeRobot's `reset_calibration`).
2. Click **Start Recording Middle** — the button turns orange and the "Middle Value" column starts **tracking the live Pos on the left**. Pose the arm at its standard center; once the readings are stable, click **Finish Recording Middle** to freeze the values and write them back to the servos (the file stores the delta `middle − 2047`).
3. Click **Record Range** — the button turns green. **Move every joint from one limit to the other** (`wrist_roll` is a continuous-rotation joint with a fixed `[0,4095]` range; **sweep the gripper too**). The min/max columns update live. Click **Stop Recording Range** when done.
4. Once all six joints are complete, the program **saves the calibration file automatically, overwriting any previous file with the same name**, and writes the offsets and limits back to the servo EEPROM — so LeRobot will no longer ask you to calibrate again.

Save locations (fixed IDs):

| Arm | Calibration file ID | Path |
| --- | --- | --- |
| Leader | `my_leader_arm` | `~/.cache/huggingface/lerobot/calibration/teleoperators/so_leader/my_leader_arm.json` |
| Follower | `my_follower_arm` | `~/.cache/huggingface/lerobot/calibration/robots/so_follower/my_follower_arm.json` |

> If you close the wizard early, it asks whether to save the current progress; choosing Yes also overwrites the same file.
> The per-servo **🎯 Center** button still burns that servo's current position as 2048 (persisted to EEPROM) — that is a different operation from the whole-arm calibration above.

> ⚠️ **Sweep both arms over the same travel**: teleoperation normalizes each arm against its own recorded range. If a joint is swept only half-way on one arm (e.g. shoulder_lift recorded over 107°) while the other records 208°, the follower moves almost twice as far as the leader and the resting poses do not line up. After calibrating, compare the range widths of the two arms and re-record any joint that differs a lot.

### 3. Center test

1. Click **Leader Arm Center Test** / **Follower Arm Center Test**.
2. The program enables torque and moves all servos to 2048.
3. If a servo barely moves from its current position, the calibration is correct; if it moves a lot, the calibration value is unreliable and must be redone.

### 4. Disable motors (manual adjustment)

- Click **Leader Arm Disable Motors** / **Follower Arm Disable Motors** to disable torque on every servo on that port, so they can be rotated freely by hand.
- An individual servo can be toggled on the **Single-Servo Control** tab using the torque switch below its slider.

### 5. Single-servo control (slider / Pos)

On the **🎚️ Single-Servo Control** tab each online servo gets a row:

- **Pos field**: shows / accepts a target position (0–4095). **Editable**, two-way bound to the slider.
- **Slider**: dragging updates Pos live; the position command is sent **on release**, not continuously while dragging.
- **Typing into Pos**: Enter, focus-out or the spin buttons send the command immediately; keystrokes are not sent one digit at a time.
- **L**: the most recently commanded target.
- While the servo moves, the slider and Pos follow the **actual position**; they are not taken over while you are dragging or typing.
- Each row also has **⚡ Torque**, **🎯 Center** and **🧹 Clear limits** for that single servo.

### 6. Change a servo ID

1. Open the **🔬 FT Debugger** tab, connect the serial port and scan for servos.
2. Select the target servo, change its "Servo ID" value (address 0x05) in the parameter table and click Write.
3. The program then runs: unlock → write address 5 → verify the new ID → re-lock.

> ⚠️ Before changing an ID, always make sure this is the only servo on the bus to avoid ID conflicts.

### 7. Change the baud rate / restore factory defaults

- **Change baud rate**: in the "Baud Rate / Factory Reset" area of the FT Debugger tab, select the new baud rate (38400 – 1000000 bps) and apply it. After the write, the serial baud rate switches automatically and is verified with a ping; on failure it rolls back automatically.
- **Restore factory defaults**: the servo returns to its factory defaults (ID=1, baud rate=1000000); you must rescan afterwards.

### 8. xdat parameter backup and restore

In the "xdat parameters (save EEPROM only)" area of the FT Debugger tab:

1. **💾 Save current servo**: saves the selected servo's EEPROM parameters to an xdat file (a backup).
2. After changing the servo's parameters at will, if you want to restore them:
3. **📂 Open xdat**: loads a backup file.
4. **📤 Restore parameters to servo**: writes the backup back to the current servo's EEPROM.

### 9. Dual-port synchronized remote control

> ⚠️ **Direction note: the leader arm drives the follower arm.** The leader arm (master) only reads servo angles; the follower arm (slave) is driven in sync.

1. In the top bar, click **🎮 Remote** (the leader arm reads angles → the follower arm drives the servos with the same IDs in sync).
2. The two ports must use matching servo IDs; only servos present on both are synchronized.
3. Click the same button again to stop, after which both panel scan threads resume automatically.

### 10. LeRobot calibration (command line)

```bash
# Calibrate the follower arm (saved to ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Calibrate the leader arm
python -m src.tools.lerobot_calibrate --arm-type leader
```

Procedure: disable the servos → reset the calibration parameters (offset zeroed, limits released) → pose each joint to the center and record `homing_offset` → slowly rotate through the full range to record `range_min/max` (`wrist_roll` is a continuous-rotation joint whose range is fixed at `[0,4095]`) → write the parameters back to the servos → save the JSON.

`homing_offset` is LeRobot's **delta** (center raw position − 2047), not the raw position itself.

> The **Leader Arm Center Calibration / Follower Arm Center Calibration** buttons in the GUI run the same procedure and save automatically to the fixed IDs on completion (see section 2 above).

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
11. **Keep both arms' ranges consistent**: teleoperation normalizes each arm by its own recorded range. If one joint is swept only half-way on one arm while the other is swept fully, the follower's motion is noticeably larger than the leader's and the resting poses do not line up. Compare the range widths of the two arms and re-sweep any joint that differs a lot.
12. **Sweep the gripper too**: the gripper is not a continuous-rotation joint. If you skip it, its range falls back to the default `[0,4095]` and its open/close travel will be wrong.

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
| Poses / travel mismatch during teleoperation | The two arms recorded very different range widths for some joint | Re-record that joint over its full travel so both arms match |
| Gripper travel is wrong | The gripper was never swept; its range is the default `[0,4095]` | Re-record and sweep the gripper from limit to limit |
| Pos does not update in the calibration wizard | The port is busy / a servo is not responding | Close the program holding the port; confirm all six servos are online |

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
├── main.py                  # Unified entry point (GUI / --run-tool subcommands)
├── SO-ARM101-ServoController.spec   # PyInstaller single-file build config
├── src/
│   ├── gui/                  # PySide6 graphical interface
│   │   ├── factory_calibration_tool.py   # Main tool (dual-port calibration + remote control + language switch)
│   │   ├── ft_debugger.py                # FT debugger (parameter read/write / xdat backup)
│   │   ├── calibration_wizard.py         # LeRobot calibration wizard
│   │   ├── theme_utils.py                # Light theme
│   │   └── language_dialog.py            # Language-selection dialog
│   ├── tools/                # Command-line tools
│   ├── launcher.py           # Child-process self-dispatch (tool calls in the packaged exe)
│   ├── calibration_math.py   # homing_offset conversion and sign-magnitude encoding
│   ├── servo_eeprom.py       # Writes calibration parameters back to EEPROM
│   ├── xdat_utils.py         # xdat parameter file read/write
│   ├── i18n*.py / i18n_translations/     # Chinese/English internationalization
│   ├── port_utils.py         # Serial-port detection
│   └── calibration_manager.py# LeRobot calibration file management
├── scservo_sdk/              # FTServo servo communication SDK
├── requirements.txt
└── setup.py                  # Environment check script
```
