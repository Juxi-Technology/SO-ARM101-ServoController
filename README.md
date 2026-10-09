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
python -m src.gui.factory_calibration_tool
```

On Linux, add your user to the `dialout` group first (`sudo usermod -a -G dialout $USER`, then log out and back in).

For per-platform detail — Python install, serial-port naming, permissions and the command-line tools — see your language's guide above.

---

## 📄 License

See [LICENSE](LICENSE).
