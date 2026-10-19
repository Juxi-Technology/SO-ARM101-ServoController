[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | Deutsch | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# SoARM-Kalibrierungstool — Windows-Anleitung

Für Windows 10 / 11. Deckt alles von der Installation bis zur vollständigen Servokalibrierung ab.

> ⚠️ **Kompatibilität: Dieses Werkzeug unterstützt derzeit nur Feetech-Servos (STS3215-Serie)**. Registertabelle und xdat-Format sind für Feetech STS3215 ausgelegt; andere Marken/Modelle sind nicht garantiert.

---

## 1. Voraussetzungen

| Abhängigkeit | Version | Hinweise |
|-----------|---------|-------|
| Python | >= 3.8 | 3.10+ empfohlen, Download von [python.org](https://www.python.org/downloads/) |
| PySide6 | >= 6.0 | GUI-Framework |
| pyserial | >= 3.5 | Serielle Kommunikation |
| OS | Win10 / Win11 | Jede Edition |

## 2. Python installieren

1. Rufen Sie <https://www.python.org/downloads/> auf
2. Laden Sie den Installer für Python 3.10+ herunter
3. **Setzen Sie während der Installation das Häkchen bei „Add Python to PATH“** (andernfalls wird python im Terminal nicht gefunden)

Prüfen:

```bash
python --version
```

## 3. Abhängigkeiten installieren

Installieren Sie die Abhängigkeiten in einer virtuellen Umgebung, um das System-Python nicht zu verändern:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **Erstellen Sie die virtuelle Umgebung nur EINMAL**. Ein erneuter Aufruf setzt die Umgebung zurück bzw. überschreibt sie (löscht die installierten Abhängigkeiten). Aktivieren Sie sie danach bei jedem Mal einfach mit `activate`.

> Nach der Aktivierung zeigt die Eingabeaufforderung `(.venv)` an.

## 4. Umgebung prüfen

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目` bedeutet, dass die Umgebung bereit ist.

## 5. Hardware anschließen

1. Stecken Sie den USB-Seriell-Adapter ein (CH340 / CP2102)
2. Verbinden Sie den Servo-Controller (die Steuerplatine des Roboterarms)
3. Versorgen Sie die Servos mit Strom (DC 5V 5A Standard, DC 12V 5A Pro)

Prüfen Sie den COM-Port im Geräte-Manager (`Win+X` → Geräte-Manager):

```
Ports (COM & LPT)
  └─ USB-SERIAL CH340 (COM3)     ← your servo port
```

> **Merken Sie sich die COM-Nummer**, um sie beim Start auszuwählen.

## 6. GUI starten

```bash
python main.py
# or
python -m src.gui.factory_calibration_tool
```

> **Option ohne Installation (Windows)**: Doppelklicken Sie auf `dist\SO-ARM101-ServoController.exe`; auf dem Zielrechner wird kein Python benötigt. Neu bauen mit `pyinstaller -y SO-ARM101-ServoController.spec`.

Oder geben Sie die Ports an (falls belegt):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

Verfügbare Ports auflisten:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. Oberflächen-Workflow

### 7.1 Tab Servokalibrierung

1. Wählen Sie den Leader-/Follower-Port in der Kopfleiste aus → Servos werden automatisch gescannt (ID 1-6).
2. Gängige Schaltflächen:
   - **Mittelpunktkalibrierung Leader-Arm / Follower-Arm**: öffnet den LeRobot-Kalibrierungsassistenten
     - Linke Spalte: Live-Anzeige für alle sechs Servos (ID / Pos / Slider)
     - **Mittelpunkt aufzeichnen** (wird orange) → Arm in seinen Mittelpunkt stellen → **Mittelpunktaufzeichnung beenden**
     - **Bereich aufzeichnen** (wird grün) → jedes Gelenk von Grenze zu Grenze durchfahren, einschließlich des Greifers → erneut klicken zum Stoppen
     - Sobald alle sechs Gelenke fertig sind, wird die Kalibrierungsdatei automatisch gespeichert und überschreibt die vorherige; außerdem werden Offsets/Grenzen zurück in das Servo-EEPROM geschrieben
   - **Mittelpunkttest Leader-Arm / Follower-Arm**: aktiviert das Drehmoment und fährt in den Mittelpunkt, um zu prüfen
   - **Motoren deaktivieren Leader-Arm / Follower-Arm**: deaktiviert das Drehmoment für manuelles Bewegen

> ⚠️ Fahren Sie beide Arme über denselben Verfahrweg durch, sonst stimmt die Bewegung des Followers bei der Fernsteuerung nicht mit der des Leaders überein.

### 7.2 Tab Einzel-Servo-Steuerung

- Jede Zeile: ID / Pos / Slider / L (Zielposition)
- **Pos und Slider sind beidseitig gebunden**: Das Ziehen des Sliders aktualisiert Pos; die Eingabe in Pos bewegt den Slider und sendet den Befehl sofort
- Der Befehl wird beim Loslassen des Sliders gesendet, nicht kontinuierlich während des Ziehens
- Während sich der Servo bewegt, folgen Slider und Pos der tatsächlichen Position
- ⚡ Drehmoment / 🎯 Mittelpunkt / 🧹 Grenzen löschen wirken auf diesen einzelnen Servo

### 7.3 Tab FT-Debugger

- **Serielle Verbindung**: Port auswählen, Baudrate (Standard 1M)
- **Servos scannen**: online befindliche Servos erkennen
- **Parameter lesen**: alle Register lesen (EEPROM + SRAM)
- **Parametertabelle**: 5 Spalten mit allen 56 Registern, **die Zeilenauswahl verknüpft Adresse/Länge/Wert**
- **Schreib-Popup**: bei Erfolg grün „✅ Erfolgreich geschrieben“, bei Fehler rot „❌ Schreiben fehlgeschlagen“ (mit Grund)
- **Positionssteuerung**:
  - **Slider** zum Einstellen der Zielposition (0-4095), das Wertfeld wird live aktualisiert; oder tippen Sie direkt in das Feld
  - Nach der Bewegung erfolgt eine Aufforderung, das Drehmoment abzuschalten
- **Baudrate / Werksreset**: Baudrate ändern, Werksreset
- **xdat-Parameter (nur EEPROM)**:
  1. `💾 Aktuellen Servo speichern`: aktuelle EEPROM-Parameter des Servos in eine xdat-Datei speichern
  2. `📂 xdat öffnen`: eine Backup-Datei laden
  3. `📤 Auf Servo wiederherstellen`: das Backup zurück auf den Servo schreiben

### 7.4 Fernsteuerung

> ⚠️ **Richtung: Der Leader-Arm steuert den Follower-Arm**. Der Leader-Arm (Master) liest nur die Servowinkel, der Follower-Arm (Slave) wird synchronisiert. Erfordert übereinstimmende Servo-IDs an beiden Ports.

- Schaltfläche `🎮 Fernbedienung` in der Kopfleiste: der Leader-Arm liest → der Follower-Arm steuert (Servos mit gleicher ID)
- Erneut klicken, um die Fernsteuerung zu beenden

## 8. Fehlerbehebung

| Problem | Lösung |
|---------|----------|
| Kein serieller Port | Prüfen Sie den Treiber im Geräte-Manager; versuchen Sie einen anderen USB-Port; installieren Sie den CH340-Treiber |
| Port wird verwendet | Schließen Sie serielle Monitore; starten Sie das Werkzeug neu |
| Chinesischer Text bleibt leer | Das System hat Microsoft YaHei; installieren Sie eine CJK-Schrift, falls fehlerhaft |
| Servo nicht gefunden | Prüfen Sie Stromversorgung/Verkabelung; bestätigen Sie 1M Baud |
| PermissionError beim Öffnen des Ports | Stellen Sie sicher, dass kein anderer Prozess den COM-Port belegt |

## 9. Kommandozeilen-Werkzeuge (optional)

```bash
# Servos scannen
python -m src.tools.scan_id

# Schnelle Mittelpunktkalibrierung
python -m src.tools.servo_quick_calibration

# LeRobot-Kalibrierung
python -m src.tools.lerobot_calibrate
```
