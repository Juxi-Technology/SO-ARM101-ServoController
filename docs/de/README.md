[English](../en/README.md) | [简体中文](../zh-hans/README.md) | [繁體中文](../zh-hant/README.md) | Deutsch | [Español](../es/README.md) | [Français](../fr/README.md) | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# Kalibrierungstool für die So-ARM-Serie

**Ein Werkzeug für Werkskalibrierung und LeRobot-Kalibrierung für FTServo-Servos der Roboterarm-Serie So-ARM 10X**

> ⚠️ **Kompatibilitätshinweis: Dieses System unterstützt derzeit ausschließlich Feetech-Servos (STS3215-Serie).** Die Registertabelle, das xdat-Parameterformat und die Baudraten-Tabelle sind auf die Feetech-STS3215-Serie ausgelegt; Servos anderer Marken oder Modelle sind nicht garantiert kompatibel.

> 📜 **Herkunft und Danksagung: Dieses Werkzeug baut auf dem [Seeed_RoboController von Seeed Studio](https://github.com/Seeed-Studio) auf und erweitert ihn**; das Original wurde unter der MIT-Lizenz veröffentlicht. Unter Beibehaltung der ursprünglichen Kernfunktionalität überarbeitet dieses Projekt die GUI und ergänzt einen FT-Debugger, xdat-Parameter-Backup/-Wiederherstellung, plattformübergreifende Unterstützung und weitere Verbesserungen. Details finden Sie in [LICENSE](../../LICENSE).

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[Funktionen](#-funktionen) · [Oberfläche im Überblick](#-oberfläche-im-überblick) · [Schnellstart](#-schnellstart) · [Arbeitsschritte](#-arbeitsschritte) · [Vorsichtsmaßnahmen](#-vorsichtsmaßnahmen) · [Fehlerbehebung](#-fehlerbehebung)

</div>

---

## ✨ Funktionen

| Funktion | Beschreibung |
| ---- | ---- |
| Automatische Porterkennung | Erkennt USB-Seriell-Ports und filtert virtuelle Geräte heraus |
| Plattformübergreifend | Läuft unter Windows / Ubuntu / macOS |
| Dual-Port-Synchronisation | Linker und rechter serieller Port arbeiten unabhängig, mit synchronisierter Master/Slave-Fernsteuerung über beide Ports |
| Umschaltung Chinesisch/Englisch | Die Oberfläche lässt sich mit einem Klick zwischen Chinesisch und Englisch umschalten; die Auswahl wird gespeichert |
| Mittelpunktkalibrierung | Brennt die aktuelle Servoposition als Mittelpunkt 2048 ein (dauerhaft im EEPROM gespeichert) |
| Mittelpunkttest | Aktiviert das Drehmoment und fährt die Servos in den Mittelpunkt, um die Kalibrierung zu prüfen |
| Motoren deaktivieren | Deaktiviert das Drehmoment aller Servos mit einem Klick zur manuellen Justierung |
| Automatischer Scan | Erkennt automatisch jeden online befindlichen Servo mit einer ID im Bereich 1–20 |
| Einzel-Servo-Steuerung | Echtzeit-Slider-Steuerung von Position und Drehmomentschalter eines einzelnen Servos |
| FT-Debugger | Serielle Verbindung, Scannen, Parameter lesen/schreiben, Positionssteuerung, Baudratenänderung, Werksreset, xdat-Parameter-Backup |
| xdat-Parameter | EEPROM-Parameter des aktuellen Servos speichern / ein Backup zum Wiederherstellen öffnen |
| LeRobot-Kalibrierung | Erzeugt Kalibrierungsdateien im LeRobot-JSON-Format |
| Aus Kalibrierungsdatei zum Mittelpunkt fahren | Fährt den Arm anhand einer Kalibrierungsdatei in den Mittelpunkt |

---

## 📚 Anleitungen pro Betriebssystem

| Betriebssystem | Anleitung |
|----|-------|
| Windows | [Windows-Anleitung](Windows.md) |
| Linux | [Linux-Anleitung](Linux.md) |
| macOS | [macOS-Anleitung](macOS.md) |

---

## 🖥️ Oberfläche im Überblick

Das Hauptprogramm enthält drei Tabs:

```
┌─────────────────────────────────────────────────────────────────┐
│ SoARM-Kalibrierungs-Tool [Port1▾] [Port2▾] [🔄] [🎮 Fernbed.][DE]│  ← Kopfleiste
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬──────────────────────────────┐ │
│  │ Port 1 - Servokalib.        │ Port 2 - Servokalib.         │ │
│  │ [🔴 Nicht verb.] Aktuell:…  │ [🔴 Nicht verb.] Aktuell:…   │ │
│  │ Servo 1–6 Statustabelle     │ Servo 1–6 Statustabelle      │ │
│  │ [Mittelkal.][Mitteltest]…   │ [Mittelkal.][Mitteltest]…    │ │
│  └─────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Kopfleiste**: Anwendungstitel, Seriell-Port-Dropdowns, Aktualisieren-Schaltfläche, Fernsteuerungsschaltfläche und Sprachumschalter.
- **🦾 Tab 1 — Servokalibrierung**: Schnellaktionen auf dem linken und rechten Panel (Mittelpunktkalibrierung, Mittelpunkttest, Motoren deaktivieren) sowie Live-Status.
- **🎚️ Tab 2 — Einzel-Servo-Steuerung**: Feinabstimmung der Position jedes online befindlichen Servos per Slider und Umschalten seines Drehmoments.
- **🔬 Tab 3 — FT-Debugger**: serielle Verbindung, Scannen, Parameter lesen/schreiben, Positionssteuerung, Baudratenänderung / Werksreset sowie xdat-Parameter-Backup und -Wiederherstellung.

---

## 🚀 Schnellstart

> Die vollständigen Schritt-für-Schritt-Anleitungen je System finden Sie unter [📚 Anleitungen pro Betriebssystem](#-anleitungen-pro-betriebssystem). Das Wesentliche für jedes System steht unten.

### Windows

1. Installieren Sie [Python 3.10+](https://www.python.org/downloads/) (Häkchen bei **Add to PATH** setzen).
2. Erstellen Sie eine virtuelle Umgebung und installieren Sie die Abhängigkeiten:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Prüfen Sie die Umgebung und starten Sie:

```bash
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Bestätigen Sie den COM-Port im Geräte-Manager (zum Beispiel `COM3`) und wählen Sie ihn in der Kopfleiste aus. Um die Ports manuell anzugeben:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. Installieren Sie die CJK-Schriften und Abhängigkeiten:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ Berechtigungen für den seriellen Port hinzufügen (dialout-Gruppe)** [erforderlich]:

```bash
sudo usermod -a -G dialout $USER
# Wird nach Abmelden und erneutem Anmelden wirksam
```

3. Erstellen Sie eine virtuelle Umgebung, installieren Sie die Abhängigkeiten und starten Sie:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Die seriellen Geräte sind `/dev/ttyUSB0` / `/dev/ttyACM0`. Um sie manuell anzugeben:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. Installieren Sie Python mit Homebrew:

```bash
brew install python
```

2. Erstellen Sie eine virtuelle Umgebung, installieren Sie die Abhängigkeiten und starten Sie:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ Benennung der seriellen Ports**: Verwenden Sie unter macOS `/dev/cu.usbserial-*` (**empfohlen, nicht blockierend**) statt `/dev/tty.*`. Zum Auflisten:

```bash
ls /dev/cu.*
```

Um sie manuell anzugeben:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### Allgemeine Kommandozeilen-Werkzeuge (ohne GUI erforderlich)

```bash
# Servos scannen
python -m src.tools.scan_id

# Schnelle Servo-Mittelpunktkalibrierung
python -m src.tools.servo_quick_calibration

# Servo-Mittelpunkttest
python -m src.tools.servo_center_test

# Alle Servos deaktivieren
python -m src.tools.servo_disable

# Kalibrierung im LeRobot-Stil
python -m src.tools.lerobot_calibrate

# Synchronisierte Fernsteuerung über zwei Ports
python -m src.tools.servo_remote_control
```

---

## 📖 Arbeitsschritte

### 1. Servos verbinden und erkennen

1. Verbinden Sie die Steuerplatine des Arms über einen USB-Seriell-Adapter und versorgen Sie die Servos mit Strom.
2. Öffnen Sie die GUI und wählen Sie den entsprechenden Port im Seriell-Dropdown der Kopfleiste aus (oder klicken Sie auf `🔄`, um zu aktualisieren).
3. Die Panel-Kopfzeile zeigt `🟢 Verbunden` an und scannt automatisch nach online befindlichen Servos mit IDs im Bereich 1–20 (üblicherweise 1–6).

> Wenn der Port als belegt gemeldet wird, stellen Sie sicher, dass kein anderes Programm ihn belegt (ein serieller Monitor oder ein vorheriger, nie beendeter Lauf des Werkzeugs).

### 2. Mittelpunktkalibrierung (aktuelle Position auf 2048 setzen)

> Positionieren Sie den Arm vor der Kalibrierung physisch so, dass sich jedes Gelenk in der gewünschten „Null- / Mittelpunkt“-Position befindet.

1. Klicken Sie im Panel auf die Schaltfläche **Seriell X Mittelpunktkalibrierung**.
2. Das Programm deaktiviert zunächst die Servos und fordert Sie auf, sie von Hand in den gewünschten Mittelpunkt zu bringen.
3. Nach Ihrer Bestätigung verarbeitet das Programm jeden Servo: EEPROM entsperren → Kalibrierbefehl schreiben (Wert 128 an Adresse 40) → EEPROM wieder sperren.
4. Prüfen Sie das Ergebnis mit „Mittelpunkttest“: Die Servos sollten ihre Position halten (sich nur geringfügig bewegen), was eine erfolgreiche Kalibrierung bestätigt.

### 3. Mittelpunkttest

1. Klicken Sie auf **Seriell X Mittelpunkttest**.
2. Das Programm aktiviert das Drehmoment und fährt alle Servos auf 2048.
3. Wenn sich ein Servo kaum von seiner aktuellen Position bewegt, ist die Kalibrierung korrekt; bewegt er sich stark, ist der Kalibrierwert unzuverlässig und muss erneut durchgeführt werden.

### 4. Motoren deaktivieren (manuelle Justierung)

- Klicken Sie auf **Seriell X Motoren deaktivieren**, um das Drehmoment aller Servos an diesem Port zu deaktivieren, sodass sie von Hand frei gedreht werden können.
- Ein einzelner Servo kann im Tab **Einzel-Servo-Steuerung** über den Drehmomentschalter unter seinem Slider umgeschaltet werden.

### 5. Servo-ID ändern

1. Öffnen Sie den Tab **🔬 FT-Debugger**, verbinden Sie den seriellen Port und scannen Sie nach Servos.
2. Wählen Sie den Zielservo aus, ändern Sie seinen Wert für „Servo-ID“ (Adresse 0x05) in der Parametertabelle und klicken Sie auf Schreiben.
3. Das Programm führt dann aus: entsperren → Adresse 5 schreiben → neue ID prüfen → wieder sperren.

> ⚠️ Stellen Sie vor dem Ändern einer ID stets sicher, dass dies der einzige Servo am Bus ist, um ID-Konflikte zu vermeiden.

### 6. Baudrate ändern / Werkseinstellungen wiederherstellen

- **Baudrate ändern**: Wählen Sie im Bereich „Baudrate / Werksreset“ des FT-Debugger-Tabs die neue Baudrate (38400 – 1000000 bps) und wenden Sie sie an. Nach dem Schreiben schaltet die serielle Baudrate automatisch um und wird per Ping überprüft; bei einem Fehler wird automatisch zurückgerollt.
- **Werkseinstellungen wiederherstellen**: Der Servo kehrt zu seinen Werkseinstellungen zurück (ID=1, Baudrate=1000000); anschließend müssen Sie erneut scannen.

### 7. xdat-Parameter-Backup und -Wiederherstellung

Im Bereich „xdat-Parameter (nur EEPROM speichern)“ des FT-Debugger-Tabs:

1. **💾 Aktuellen Servo speichern**: speichert die EEPROM-Parameter des ausgewählten Servos in eine xdat-Datei (ein Backup).
2. Wenn Sie die Parameter des Servos beliebig geändert haben und sie wiederherstellen möchten:
3. **📂 xdat öffnen**: lädt eine Backup-Datei.
4. **📤 Parameter auf Servo wiederherstellen**: schreibt das Backup zurück in das EEPROM des aktuellen Servos.

### 8. Synchronisierte Fernsteuerung über zwei Ports

> ⚠️ **Richtungshinweis: Port 1 steuert Port 2.** Port 1 (Master) liest nur die Servowinkel; Port 2 (Slave) wird synchron angesteuert.

1. Klicken Sie in der Kopfleiste auf **🎮 Fernbedienung** (Port 1 liest Winkel → Port 2 steuert die Servos mit denselben IDs synchron an).
2. Die beiden Ports müssen übereinstimmende Servo-IDs verwenden; nur Servos, die an beiden Ports vorhanden sind, werden synchronisiert.
3. Klicken Sie erneut auf dieselbe Schaltfläche, um zu stoppen; danach nehmen die Scan-Threads des linken und rechten Panels automatisch ihre Arbeit wieder auf.

### 9. LeRobot-Kalibrierung (Kommandozeile)

```bash
# Follower-Arm kalibrieren (gespeichert unter ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Leader-Arm kalibrieren
python -m src.tools.lerobot_calibrate --arm-type leader
```

Ablauf: Servos deaktivieren → jedes Gelenk in den Mittelpunkt stellen und `homing_offset` aufzeichnen → langsam den gesamten Bereich durchfahren, um `range_min/max` aufzuzeichnen (`wrist_roll` ist ein kontinuierlich drehendes Gelenk, dessen Bereich fest auf `[0,4095]` liegt) → die JSON speichern.

Aus einer Kalibrierungsdatei zum Mittelpunkt fahren:

```bash
python -m src.tools.run_calibration_middle <calibration_file.json> --mode zero
```

---

## ⚠️ Vorsichtsmaßnahmen

1. **Sicherheit geht vor**: Die Mittelpunktkalibrierung wird dauerhaft im EEPROM gespeichert. Vergewissern Sie sich vor der Kalibrierung, dass die Stromversorgung stabil ist und der Arm nicht mit Personen oder Gegenständen kollidiert.
2. **Stromversorgung**: Die Standard-Edition des SoARM 101 wird am besten mit DC 5V 5A und die Pro-Edition mit DC 12V 5A versorgt. Unzureichende Leistung verursacht Schrittverluste oder Kommunikationsfehler.
3. **Exklusiver serieller Port**: Unter Windows ist der serielle Port exklusiv, sodass derselbe Port nicht gleichzeitig vom Scan-Thread der GUI und einem Kalibrierungs-Subprozess genutzt werden kann. Das Werkzeug stoppt den Scan-Thread und beendet den alten Prozess, bevor es arbeitet; klicken Sie nicht wiederholt von Hand.
4. **Serielle Berechtigungen unter Linux**: Der Zugriff auf `/dev/ttyUSB*` / `/dev/ttyACM*` erfordert, dass Ihr Benutzer zur Gruppe `dialout` hinzugefügt wird (siehe [Linux-Anleitung](Linux.md)).
5. **Serielle Benennung unter macOS**: Verwenden Sie `/dev/cu.*` (nicht blockierend) statt `/dev/tty.*` (blockierend, kann hängen bleiben); siehe [macOS-Anleitung](macOS.md).
6. **Hot-Plugging**: Nach dem Abziehen des USB-Kabels versucht das Programm, sich automatisch neu zu verbinden; sobald es wieder eingesteckt ist, klicken Sie auf `🔄`, um die Portliste zu aktualisieren.
7. **Übertemperatur- / Überspannungsschutz**: Das Programm überwacht Spannung und Temperatur (Warnung über 60°C). Wenn ein Servo heiß bleibt, halten Sie an und lassen Sie ihn abkühlen.
8. **Die Mittelpunktkalibrierung ist unwiderruflich**: Der Schreibvorgang überschreibt den ursprünglichen Offset und kann nicht rückgängig gemacht werden. Notieren Sie die ursprüngliche Position vor der Kalibrierung.
9. **ID-Änderungsrisiko**: Wenn das Schreiben oder die Verifikation fehlschlägt, meldet das Programm einen Fehler und setzt das Scannen fort; in Extremfällen kann ein Servo jedoch „verloren gehen“. Tritt dies auf, versuchen Sie „Werkseinstellungen wiederherstellen“ (danach kehrt die ID zu 1 zurück).
10. **Kodierungsprobleme**: Wenn Emojis in einer Windows-Konsole verstümmelt erscheinen, setzen Sie `PYTHONIOENCODING=utf-8`, bevor Sie die Kommandozeilen-Werkzeuge ausführen. Linux/macOS verwenden natives UTF-8 und sind normalerweise nicht betroffen.

---

## 🛠️ Fehlerbehebung

| Symptom | Mögliche Ursache | Lösung |
| ---- | -------- | -------- |
| Serieller Port lässt sich nicht öffnen / Port belegt | Ein anderes Programm verwendet ihn | Schließen Sie Programme wie serielle Monitore oder wechseln Sie zu einem anderen Port und starten Sie das Werkzeug neu |
| Keine Servos gefunden | Unzureichende Leistung / falsche Verkabelung / Baudraten-Konflikt | Prüfen Sie Stromversorgung und Verkabelung und stellen Sie sicher, dass die Servos mit 1M Baud laufen |
| Servos drehen nach der Mittelpunktkalibrierung durch | Die Position wurde vor der Kalibrierung nicht gesetzt | Wiederholen Sie „deaktivieren → von Hand positionieren → Mittelpunktkalibrierung“ |
| Temperatur steigt zu schnell | Übermäßige Last oder ein blockiertes Gelenk | Prüfen Sie auf mechanische Blockaden und reduzieren Sie Geschwindigkeit/Beschleunigung |
| Servo nach Änderung seiner ID nicht gefunden | ID-Konflikt oder fehlgeschlagenes Schreiben | Werkseinstellungen wiederherstellen und erneut scannen |
| Fernsteuerung nicht synchron | Die IDs an den beiden Ports unterscheiden sich | Stellen Sie sicher, dass Servos mit denselben IDs am Master- und Slave-Port online sind |

---

## 📁 Projektstruktur

```
SO-ARM101-ServoController/
├── docs/                    # Dokumentation, ein Ordner pro Sprache
│   └── <lang>/              # en, zh-hans, zh-hant, de, es, fr, it, ja, ko, pt-br, pt-pt
│       ├── README.md        # Dieses Dokument
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── src/
│   ├── gui/                  # Grafische PySide6-Oberfläche
│   │   ├── factory_calibration_tool.py   # Hauptwerkzeug (Dual-Port-Kalibrierung + Fernsteuerung + Sprachumschaltung)
│   │   ├── ft_debugger.py                # FT-Debugger (Parameter lesen/schreiben / xdat-Backup)
│   │   ├── calibration_wizard.py         # LeRobot-Kalibrierungsassistent
│   │   ├── theme_utils.py                # Helles Theme
│   │   └── language_dialog.py            # Dialog zur Sprachauswahl
│   ├── tools/                # Kommandozeilen-Werkzeuge
│   ├── xdat_utils.py         # Lesen/Schreiben von xdat-Parameterdateien
│   ├── i18n*.py / i18n_translations/     # Internationalisierung Chinesisch/Englisch
│   ├── port_utils.py         # Erkennung serieller Ports
│   └── calibration_manager.py# Verwaltung von LeRobot-Kalibrierungsdateien
├── scservo_sdk/              # FTServo-Servo-Kommunikations-SDK
├── requirements.txt
└── setup.py                  # Skript zur Umgebungsprüfung
```
