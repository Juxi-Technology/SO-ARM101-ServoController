<div align="center">

# SO-ARM101 Servo Controller

**FTServo factory-calibration and LeRobot calibration toolkit for the So-ARM 10X series**

> ⚠️ **Compatibility:** this tool currently supports **Feetech (STS3215 series) servos only**. The register table, `xdat` parameter format and baud-rate table are all designed for the Feetech STS3215 series; other brands/models are not guaranteed to work.

> 📜 **Origin & credits:** this tool is derived from and upgrades [Seeed Studio's Seeed_RoboController](https://github.com/Seeed-Studio) project, released under the MIT licence. The core functionality is retained, with a rebuilt GUI, an added FT debugger, `xdat` parameter backup/restore and cross-platform support. See [LICENSE](LICENSE).

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

</div>

---

## 🌐 Web edition (browser)

The same GUI also runs as a static site in the browser — no Python, no installation — using the
**Web Serial API**:

**https://juxi-technology.github.io/SO-ARM101-ServoController/**

- Serve this repository over HTTPS (or run `python -m http.server` locally and open it) — ES
  modules do not load from `file://`.
- **Chrome or Edge 89+ only**: Firefox and Safari do not implement Web Serial.
- Every tab is available: servo calibration, the LeRobot calibration wizard, single-servo control
  (Pos ↔ slider two-way binding), the FT debugger and remote control. Tick **Demo mode** to try the
  whole interface without hardware.
- Calibration JSON is **downloaded** (browsers cannot write into LeRobot's cache); the wizard shows
  the target path to move it to.

The web app lives at the repository root (`index.html`, `styles.css`, `js/`). To publish it:
**Settings → Pages → Deploy from a branch → main / (root)**.

---

## 📚 Documentation

The full guide — features, interface tour, quick start, step-by-step usage, precautions and troubleshooting — is available in **11 languages**:

| Language | Documentation |
|----------|---------------|
| English | [docs/en/README.md](docs/en/README.md) |
| Deutsch | [docs/de/README.md](docs/de/README.md) |
| Español | [docs/es/README.md](docs/es/README.md) |
| Français | [docs/fr/README.md](docs/fr/README.md) |
| Italiano | [docs/it/README.md](docs/it/README.md) |
| 日本語 | [docs/ja/README.md](docs/ja/README.md) |
| 한국어 | [docs/ko/README.md](docs/ko/README.md) |
| Português (BR) | [docs/pt-br/README.md](docs/pt-br/README.md) |
| Português (PT) | [docs/pt-pt/README.md](docs/pt-pt/README.md) |
| 简体中文 | [docs/zh-hans/README.md](docs/zh-hans/README.md) |
| 繁體中文 | [docs/zh-hant/README.md](docs/zh-hant/README.md) |

Per-OS setup guides live alongside each language's README as `Windows.md`, `Linux.md` and `macOS.md`.

---

## 🚀 Quick start

```bash
cd SO-ARM101-ServoController
python -m venv .venv
# Windows:  .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python main.py          # or: python -m src.gui.factory_calibration_tool
```

**Single-file build (Windows):** `pip install pyinstaller` then `pyinstaller -y SO-ARM101-ServoController.spec`;
this produces `dist/SO-ARM101-ServoController.exe` (~46 MB) — no Python needed on the target machine. The same
executable also hosts every CLI tool via `SO-ARM101-ServoController.exe --run-tool <tool> ...`
(see the per-language guides for the list). PyInstaller does not cross-compile: build on the OS you
want to target.

On Linux, add your user to the `dialout` group first (`sudo usermod -a -G dialout $USER`, then log out and back in).

For per-platform detail — Python install, serial-port naming, permissions and the command-line tools — see your language's guide above.

---

## 📄 License

See [LICENSE](LICENSE).
