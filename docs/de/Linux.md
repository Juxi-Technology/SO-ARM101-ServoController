[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | Deutsch | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# SoARM-Kalibrierungstool — Linux-Anleitung

Für Ubuntu / Debian / andere gängige Distributionen. Wichtige Punkte: serielle Berechtigungen (dialout), Erkennung von USB-Seriell-Geräten.

> ⚠️ **Kompatibilität: Dieses Werkzeug unterstützt derzeit nur Feetech-Servos (STS3215-Serie)**. Registertabelle und xdat-Format sind für Feetech STS3215 ausgelegt; andere Marken/Modelle sind nicht garantiert.

---

## 1. Voraussetzungen

| Abhängigkeit | Version |
|-----------|---------|
| Python | >= 3.8 (3.10+ empfohlen) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | Ubuntu 20.04+ / Debian 11+ |

Chinesische Schriften (für die chinesische Oberfläche erforderlich):

```bash
sudo apt install fonts-noto-cjk
```

Emoji-Icon-Schriften (für ✅⚠️ usw. in den Protokollen):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Python-Abhängigkeiten installieren

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Erstellen Sie die virtuelle Umgebung nur EINMAL**. Ein erneuter Aufruf setzt die Umgebung zurück bzw. überschreibt sie (löscht die installierten Abhängigkeiten). Führen Sie danach einfach `source .venv/bin/activate` aus.

> Wenn pip „externally-managed-environment“ meldet, verwenden Sie ein venv oder `pip install --break-system-packages -r requirements.txt`.

## 3. ⚠️ Serielle Berechtigung (dialout) [erforderlich]

Standardmäßig können normale Benutzer **nicht** auf `/dev/ttyUSB*` / `/dev/ttyACM*` zugreifen. Fügen Sie Ihren Benutzer zur Gruppe `dialout` hinzu:

```bash
sudo usermod -a -G dialout $USER
```

**Melden Sie sich ab und wieder an** (oder starten Sie neu). Prüfen:

```bash
groups
# Die Ausgabe sollte dialout enthalten
```

> Einige Distributionen verwenden `uucp` (Arch) oder `tty`.

## 4. USB-Seriell-Gerät identifizieren

Nach dem Einstecken:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

Typische Ausgabe:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # nativer USB-Seriell-Anschluss (Arduino/ESP32 onboard)
```

Detaillierte Herstellerinformationen anzeigen:

```bash
dmesg | tail -20 | grep -i tty
# oder
lsusb
```

> Bei mehreren Geräten werden ttyUSB0/ttyUSB1 in Einsteckreihenfolge zugewiesen und können instabil sein. Bevorzugen Sie **`/dev/ttyACM*` oder eine Festlegung nach Hersteller**.

## 5. Umgebung prüfen

```bash
python setup.py
```

## 6. GUI starten

```bash
python -m src.gui.factory_calibration_tool
```

Ports angeben:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> Wenn nur ein serieller Port vorhanden ist, setzt das Werkzeug den zweiten Port automatisch auf „deaktiviert".

## 7. Oberflächen-Workflow

### 7.1 Tab Servokalibrierung
Port auswählen, Servos automatisch scannen; Mittelpunktkalibrierung / Mittelpunkttest / Servos deaktivieren.

### 7.2 Tab Einzel-Servo-Steuerung
Slider-Positionssteuerung, Drehmomentschalter.

### 7.3 Tab FT-Debugger
- Serielle Verbindung (Standard 1M), Servos scannen
- Alle Register lesen, Parametertabelle (56 Register), die Zeilenauswahl verknüpft Adresse/Länge/Wert
- Schreib-Popup: grün Erfolg / rot Fehler (mit Grund)
- Positionssteuerung: Slider (0-4095) mit synchronem Wertfeld
- Baudrate / Werksreset
- xdat-Parameter (nur EEPROM): speichern → öffnen → wiederherstellen

### 7.4 Fernsteuerung

> ⚠️ **Richtung: Port1 steuert Port2**. Port1 (Master) liest die Winkel, Port2 (Slave) wird synchronisiert. Erfordert übereinstimmende IDs an beiden Ports.

Obere Leiste `🎮 Fernsteuerung`: Port1 liest → Port2 steuert (übereinstimmende Servo-IDs an beiden Ports erforderlich)

## 8. Fehlerbehebung

| Problem | Lösung |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | Nicht in der dialout-Gruppe, siehe Abschnitt 3; oder `sudo chmod 666 /dev/ttyUSB0` (temporär) |
| Kein serieller Port | `ls /dev/ttyUSB* /dev/ttyACM*`; `lsusb` zur Bestätigung des Geräts |
| Gerätename ändert sich | Die ttyUSB-Nummerierung hängt von der Einsteckreihenfolge ab; verwenden Sie eine udev-Regel oder wählen Sie bei jedem Start neu aus |
| Chinesische Oberfläche bleibt leer | Installieren Sie `fonts-noto-cjk` |
| Emoji werden als Kästchen angezeigt | Installieren Sie `fonts-noto-color-emoji` |
| pip install schlägt fehl | Verwenden Sie ein venv; oder `--break-system-packages` |

## 9. Kommandozeilen-Werkzeuge (optional)

```bash
# Servos scannen
python -m src.tools.scan_id

# LeRobot-Kalibrierung
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. Erweitert: Fester Gerätename per udev (optional)

Erstellen Sie `/etc/udev/rules.d/99-servo.rules`, um den Gerätenamen anhand der USB-ID festzulegen:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

Dann `ls -l /dev/ttyServo`. Ermitteln Sie die Vendor-ID mit `lsusb`.
