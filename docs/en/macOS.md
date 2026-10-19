English | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# SoARM Series Calibration Tool — macOS Guide

For macOS 11 (Big Sur) and later. Key points: serial naming (`cu.*` vs `tty.*`), USB drivers.

> ⚠️ **Compatibility: This tool currently supports only Feetech (STS3215 series) servos**. Register table and xdat format are designed for Feetech STS3215; other brands/models are not guaranteed.

---

## 1. Requirements

| Dependency | Version |
|-----------|---------|
| Python | >= 3.8 (3.10+ recommended, via Homebrew) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | macOS 11+ (Apple Silicon / Intel) |

## 2. Install Python

Recommended via Homebrew:

```bash
# Install Homebrew if missing
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python
```

Verify:

```bash
python3 --version
```

## 3. Install Dependencies

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Create the virtual environment only ONCE**. Re-running it will reset/overwrite the environment (clearing installed deps). After that, just `source .venv/bin/activate`.

## 4. ⚠️ macOS Serial Naming [Key]

macOS places USB serial devices under `/dev` with **two naming conventions**:

| Prefix | Meaning | Usable |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | modem style (blocking) | can hang, not recommended |
| `/dev/cu.usbserial-*` | call/terminal style (**non-blocking**) | ✅ recommended |

**Find your port:**

```bash
ls /dev/cu.*
```

Typical output:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # onboard USB serial (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> The tool auto-prefers `cu.*` devices. If specifying a port manually, use `cu.` not `tty.`.

## 5. USB Drivers

Most common chips (CH340, CP2102, FTDI) have built-in macOS drivers. If the device is not recognized:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**: older batches need the WCH official driver
- Generally, `ls /dev/cu.*` showing the device is enough

## 6. Check Environment

```bash
python setup.py
```

## 7. Launch GUI

```bash
python main.py
# or
python -m src.gui.factory_calibration_tool
```

Specify ports:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> When only one serial port is present, the second port is automatically disabled.

## 8. Interface Workflow

### 8.1 Servo Calibration Tab
Select the leader/follower port; servos are scanned automatically.

- Center calibration opens the LeRobot calibration wizard: live monitor on the left (ID / Pos / slider), calibration table on the right.
- **Start Recording Middle** → pose the arm at its center → **Finish Recording Middle**; then **Record Range** (turns green) → sweep every joint limit to limit, including the gripper → click again to stop.
- Once all six joints are complete the calibration file is saved automatically and overwrites the previous one.

> ⚠️ Sweep both arms over the same travel, otherwise the follower's motion will not match the leader's.

### 8.2 Single Servo Control Tab
- Each row: ID / Pos / slider / L (target)
- **Pos and the slider are two-way bound**: dragging updates Pos; typing into Pos moves the slider and sends the command immediately
- The command is sent on release, not while dragging

### 8.3 FT Debugger Tab
- Serial connection (1M default), scan servos
- Read all registers, parameter table (56 registers), row-select linkage fills address/length/value
- Write popup: green success / red failure (with reason)
- Position control: slider (0-4095) with value box sync
- Baud rate / factory reset
- xdat params (EEPROM only): save → open → restore

### 8.4 Remote Control

> ⚠️ **Direction: the leader arm controls the follower arm**. The leader arm (master) reads angles; the follower arm (slave) is synchronized. Requires matching IDs on both ports.

Top bar `🎮 Remote`: leader reads → follower controls (matching servo IDs required on both ports)
## 9. Troubleshooting

| Problem | Solution |
|---------|----------|
| Port with `tty.` hangs | Use the `cu.` prefix instead |
| Device not found | `ls /dev/cu.*`; replug; `system_profiler SPUSBDataType` |
| Chinese UI blank | System PingFang is usually fine; install Noto Sans CJK if broken |
| Venv activation fails | `source .venv/bin/activate` (not `.bat`) |
| Apple Silicon build error | Python 3.10+ is native; avoid Rosetta old Python |

## 10. Command Line Tools (Optional)

```bash
# Scan servos
python -m src.tools.scan_id

# LeRobot calibration
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. Tips

- **Port name changes**: `cu.*` names may vary with different USB ports; select in the dropdown each launch
- **Sleep**: macOS may sleep and drop the serial; keep awake while operating
- **Privacy permission**: if asked to "access removable disks", allow it
