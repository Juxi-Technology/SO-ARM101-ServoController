English | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# SoARM Series Calibration Tool — Linux Guide

For Ubuntu / Debian / other mainstream distros. Key points: serial permissions (dialout), USB-to-serial device detection.

> ⚠️ **Compatibility: This tool currently supports only Feetech (STS3215 series) servos**. Register table and xdat format are designed for Feetech STS3215; other brands/models are not guaranteed.

---

## 1. Requirements

| Dependency | Version |
|-----------|---------|
| Python | >= 3.8 (3.10+ recommended) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | Ubuntu 20.04+ / Debian 11+ |

Chinese fonts (required for the Chinese UI):

```bash
sudo apt install fonts-noto-cjk
```

Emoji icon fonts (for ✅⚠️ etc. in logs):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Install Python Dependencies

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Create the virtual environment only ONCE**. Re-running it will reset/overwrite the environment (clearing installed deps). After that, just `source .venv/bin/activate`.

> If pip reports "externally-managed-environment", use a venv or `pip install --break-system-packages -r requirements.txt`.

## 3. ⚠️ Serial Permission (dialout) [Required]

By default, normal users **cannot access** `/dev/ttyUSB*` / `/dev/ttyACM*`. Add your user to the `dialout` group:

```bash
sudo usermod -a -G dialout $USER
```

**Log out and back in** (or reboot). Verify:

```bash
groups
# output should include dialout
```

> Some distros use `uucp` (Arch) or `tty`.

## 4. Identify USB Serial Device

After plugging in:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

Typical output:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # native USB serial (Arduino/ESP32 onboard)
```

Get detailed manufacturer information:

```bash
dmesg | tail -20 | grep -i tty
# or
lsusb
```

> With multiple devices, ttyUSB0/ttyUSB1 are assigned in plug order and may be unstable. Prefer **`/dev/ttyACM*` or pinning by manufacturer**.

## 5. Check Environment

```bash
python setup.py
```

## 6. Launch GUI

```bash
python -m src.gui.factory_calibration_tool
```

Specify ports:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> If only one serial port is present, the tool automatically sets the second port to "disabled".

## 7. Interface Workflow

### 7.1 Servo Calibration Tab
Select port, auto-scan servos; middle calibration / middle test / disable servos.

### 7.2 Single Servo Control Tab
Slider position control, torque switch.

### 7.3 FT Debugger Tab
- Serial connection (1M default), scan servos
- Read all registers, parameter table (56 registers), row-select linkage fills address/length/value
- Write popup: green success / red failure (with reason)
- Position control: slider (0-4095) with value box sync
- Baud rate / factory reset
- xdat params (EEPROM only): save → open → restore

### 7.4 Remote Control

> ⚠️ **Direction: Port1 controls Port2**. Port1 (master) reads angles, Port2 (slave) is synchronized. Requires matching IDs on both ports.

Top bar `🎮 Remote`: Port1 reads → Port2 controls (matching servo IDs required on both ports)
## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | Not in dialout group, see section 3; or `sudo chmod 666 /dev/ttyUSB0` (temporary) |
| No serial port | `ls /dev/ttyUSB* /dev/ttyACM*`; `lsusb` to confirm device |
| Device name changes | ttyUSB numbering depends on plug order; use a udev rule or select each launch |
| Chinese UI blank | Install `fonts-noto-cjk` |
| Emoji shows boxes | Install `fonts-noto-color-emoji` |
| pip install fails | Use venv; or `--break-system-packages` |

## 9. Command Line Tools (Optional)

```bash
# Scan servos
python -m src.tools.scan_id

# LeRobot calibration
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. Advanced: udev Fixed Device Name (Optional)

Create `/etc/udev/rules.d/99-servo.rules` to fix the device name by USB ID:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

Then `ls -l /dev/ttyServo`. Get vendor ID with `lsusb`.
