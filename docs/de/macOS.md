[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | Deutsch | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# SoARM-Kalibrierungstool — macOS-Anleitung

Für macOS 11 (Big Sur) und neuer. Wichtige Punkte: serielle Benennung (`cu.*` vs. `tty.*`), USB-Treiber.

> ⚠️ **Kompatibilität: Dieses Werkzeug unterstützt derzeit nur Feetech-Servos (STS3215-Serie)**. Registertabelle und xdat-Format sind für Feetech STS3215 ausgelegt; andere Marken/Modelle sind nicht garantiert.

---

## 1. Voraussetzungen

| Abhängigkeit | Version |
|-----------|---------|
| Python | >= 3.8 (3.10+ empfohlen, via Homebrew) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | macOS 11+ (Apple Silicon / Intel) |

## 2. Python installieren

Empfohlen über Homebrew:

```bash
# Homebrew installieren, falls nicht vorhanden
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Python installieren
brew install python
```

Prüfen:

```bash
python3 --version
```

## 3. Abhängigkeiten installieren

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Erstellen Sie die virtuelle Umgebung nur EINMAL**. Ein erneuter Aufruf setzt die Umgebung zurück bzw. überschreibt sie (löscht die installierten Abhängigkeiten). Führen Sie danach einfach `source .venv/bin/activate` aus.

## 4. ⚠️ macOS serielle Benennung [wichtig]

macOS legt USB-Seriell-Geräte unter `/dev` mit **zwei Benennungskonventionen** an:

| Präfix | Bedeutung | Nutzbar |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | Modem-Stil (blockierend) | kann hängen bleiben, nicht empfohlen |
| `/dev/cu.usbserial-*` | Call-/Terminal-Stil (**nicht blockierend**) | ✅ empfohlen |

**Port finden:**

```bash
ls /dev/cu.*
```

Typische Ausgabe:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # integriertes USB-Seriell (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> Das Werkzeug bevorzugt automatisch `cu.*`-Geräte. Wenn Sie einen Port manuell angeben, verwenden Sie `cu.`, nicht `tty.`.

## 5. USB-Treiber

Die gängigsten Chips (CH340, CP2102, FTDI) haben integrierte macOS-Treiber. Wenn das Gerät nicht erkannt wird:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**: ältere Chargen benötigen den offiziellen WCH-Treiber
- Im Allgemeinen genügt es, wenn `ls /dev/cu.*` das Gerät anzeigt

## 6. Umgebung prüfen

```bash
python setup.py
```

## 7. GUI starten

```bash
python -m src.gui.factory_calibration_tool
```

Ports angeben:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> Wenn nur ein serieller Port vorhanden ist, wird der zweite Port automatisch deaktiviert.

## 8. Oberflächen-Workflow

### 8.1 Tab Servokalibrierung
Port auswählen, Servos automatisch scannen; Mittelpunktkalibrierung / Mittelpunkttest / Servos deaktivieren.

### 8.2 Tab Einzel-Servo-Steuerung
Slider-Positionssteuerung, Drehmomentschalter.

### 8.3 Tab FT-Debugger
- Serielle Verbindung (Standard 1M), Servos scannen
- Alle Register lesen, Parametertabelle (56 Register), die Zeilenauswahl verknüpft Adresse/Länge/Wert
- Schreib-Popup: grün Erfolg / rot Fehler (mit Grund)
- Positionssteuerung: Slider (0-4095) mit synchronem Wertfeld
- Baudrate / Werksreset
- xdat-Parameter (nur EEPROM): speichern → öffnen → wiederherstellen

### 8.4 Fernsteuerung

> ⚠️ **Richtung: Port1 steuert Port2**. Port1 (Master) liest die Winkel, Port2 (Slave) wird synchronisiert. Erfordert übereinstimmende IDs an beiden Ports.

Obere Leiste `🎮 Fernsteuerung`: Port1 liest → Port2 steuert (übereinstimmende Servo-IDs an beiden Ports erforderlich)

## 9. Fehlerbehebung

| Problem | Lösung |
|---------|----------|
| Port mit `tty.` bleibt hängen | Verwenden Sie stattdessen das Präfix `cu.` |
| Gerät nicht gefunden | `ls /dev/cu.*`; erneut einstecken; `system_profiler SPUSBDataType` |
| Chinesische Oberfläche bleibt leer | System-PingFang ist meist in Ordnung; installieren Sie Noto Sans CJK, falls fehlerhaft |
| venv-Aktivierung schlägt fehl | `source .venv/bin/activate` (nicht `.bat`) |
| Build-Fehler unter Apple Silicon | Python 3.10+ ist nativ; vermeiden Sie altes Python unter Rosetta |

## 10. Kommandozeilen-Werkzeuge (optional)

```bash
# Servos scannen
python -m src.tools.scan_id

# LeRobot-Kalibrierung
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. Tipps

- **Portname ändert sich**: `cu.*`-Namen können je nach USB-Port variieren; wählen Sie bei jedem Start im Dropdown aus
- **Ruhezustand**: macOS kann in den Ruhezustand wechseln und die serielle Verbindung trennen; halten Sie das System während des Betriebs wach
- **Datenschutzberechtigung**: Wenn nach „Zugriff auf Wechseldatenträger“ gefragt wird, erlauben Sie es
