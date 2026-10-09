[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | Italiano | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# Strumento di calibrazione della serie SoARM — Guida Linux

Per Ubuntu / Debian / altre distribuzioni principali. Punti chiave: permessi sulla porta seriale (dialout), rilevamento del dispositivo USB-seriale.

> ⚠️ **Compatibilità: questo strumento supporta attualmente solo servo Feetech (serie STS3215)**. La tabella dei registri e il formato xdat sono progettati per Feetech STS3215; altre marche/modelli non sono garantiti.

---

## 1. Requisiti

| Dipendenza | Versione |
|-----------|---------|
| Python | >= 3.8 (consigliato 3.10+) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| Sistema operativo | Ubuntu 20.04+ / Debian 11+ |

Font cinesi (necessari per l'interfaccia in cinese):

```bash
sudo apt install fonts-noto-cjk
```

Font delle icone emoji (per ✅⚠️ e simili nei log):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Installare le dipendenze Python

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Crea l'ambiente virtuale UNA SOLA VOLTA**. Rieseguirlo azzererà/sovrascriverà l'ambiente (cancellando le dipendenze installate). Dopodiché, basta `source .venv/bin/activate`.

> Se pip segnala "externally-managed-environment", usa un venv oppure `pip install --break-system-packages -r requirements.txt`.

## 3. ⚠️ Permessi seriali (dialout) [obbligatorio]

Per impostazione predefinita, gli utenti normali **non possono accedere** a `/dev/ttyUSB*` / `/dev/ttyACM*`. Aggiungi il tuo utente al gruppo `dialout`:

```bash
sudo usermod -a -G dialout $USER
```

**Disconnettiti e riconnettiti** (o riavvia). Verifica:

```bash
groups
# l'output dovrebbe includere dialout
```

> Alcune distribuzioni usano `uucp` (Arch) o `tty`.

## 4. Identificare il dispositivo seriale USB

Dopo averlo collegato:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

Output tipico:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # seriale USB nativa (Arduino/ESP32 integrata)
```

Per visualizzare informazioni dettagliate sul produttore:

```bash
dmesg | tail -20 | grep -i tty
# oppure
lsusb
```

> Con più dispositivi, ttyUSB0/ttyUSB1 vengono assegnati secondo l'ordine di collegamento e potrebbero risultare instabili. Si consiglia di **usare `/dev/ttyACM*` oppure fissare in base al produttore**.

## 5. Verificare l'ambiente

```bash
python setup.py
```

## 6. Avviare la GUI

```bash
python -m src.gui.factory_calibration_tool
```

Specificare le porte:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> Se è presente una sola porta seriale, lo strumento imposta automaticamente la seconda porta su "disabilitato".

## 7. Flusso dell'interfaccia

### 7.1 Scheda Calibrazione dei servo
Seleziona la porta, scansiona automaticamente i servo; calibrazione del centro / test del centro / disattivazione dei servo.

### 7.2 Scheda Controllo di un singolo servo
Controllo della posizione tramite cursore, interruttore di coppia.

### 7.3 Scheda Debugger FT
- Connessione seriale (1M predefinito), scansione dei servo
- Lettura di tutti i registri, tabella dei parametri (56 registri), selezione della riga con compilazione collegata di indirizzo/lunghezza/valore
- Popup di scrittura: verde in caso di successo / rosso in caso di errore (con motivo)
- Controllo della posizione: cursore (0-4095) sincronizzato con la casella del valore
- Baud rate / ripristino delle impostazioni di fabbrica
- Parametri xdat (solo EEPROM): salva → apri → ripristina

### 7.4 Telecomando

> ⚠️ **Direzione: la porta 1 controlla la porta 2**. La porta 1 (master) legge gli angoli, la porta 2 (slave) è sincronizzata. Richiede ID corrispondenti su entrambe le porte.

Barra superiore `🎮 Telecomando`: la porta 1 legge → la porta 2 controlla (servo con lo stesso ID su entrambe le porte)

## 8. Risoluzione dei problemi

| Problema | Soluzione |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | Non sei nel gruppo dialout, vedi la sezione 3; oppure `sudo chmod 666 /dev/ttyUSB0` (temporaneo) |
| Nessuna porta seriale | `ls /dev/ttyUSB* /dev/ttyACM*`; `lsusb` per identificare il dispositivo |
| Il nome del dispositivo cambia | La numerazione ttyUSB dipende dall'ordine di collegamento; usa una regola udev oppure seleziona la porta a ogni avvio |
| Interfaccia in cinese vuota | Installa `fonts-noto-cjk` |
| Le emoji mostrano quadratini | Installa `fonts-noto-color-emoji` |
| pip install non riesce | Usa un venv; oppure `--break-system-packages` |

## 9. Strumenti a riga di comando (facoltativo)

```bash
# Scansiona i servo
python -m src.tools.scan_id

# Calibrazione LeRobot
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. Avanzato: nome di dispositivo fisso con udev (facoltativo)

Crea `/etc/udev/rules.d/99-servo.rules` per fissare il nome del dispositivo tramite USB ID:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

Poi `ls -l /dev/ttyServo`. Ottieni il vendor ID con `lsusb`.
