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
python main.py
# or
python -m src.gui.factory_calibration_tool
```

Specificare le porte:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> Se è presente una sola porta seriale, lo strumento imposta automaticamente la seconda porta su "disabilitato".

## 7. Flusso dell'interfaccia

### 7.1 Scheda Calibrazione dei servo
Seleziona la porta del braccio leader/follower; i servo vengono scansionati automaticamente.

- La calibrazione del centro apre la procedura guidata di calibrazione LeRobot: monitor in tempo reale a sinistra (ID / Pos / cursore), tabella di calibrazione a destra.
- **Avvia registrazione centro** → porta il braccio al centro → **Termina registrazione centro**; poi **Registra corsa** (diventa verde) → muovi ogni articolazione da un limite all'altro, pinza inclusa → fai clic di nuovo per fermare.
- Una volta completate tutte e sei le articolazioni, il file di calibrazione viene salvato automaticamente e sovrascrive il precedente.

> ⚠️ Registra la stessa corsa su entrambi i bracci, altrimenti il movimento del follower non corrisponderà a quello del leader.

### 7.2 Scheda Controllo di un singolo servo
Ogni riga: ID / Pos / cursore / L (destinazione). **Pos e il cursore sono bidirezionalmente collegati**: trascinando si aggiorna Pos; digitando in Pos si sposta il cursore e si invia subito il comando. Il comando viene inviato al rilascio, non durante il trascinamento.

### 7.3 Scheda Debugger FT
- Connessione seriale (1M predefinito), scansione dei servo
- Lettura di tutti i registri, tabella dei parametri (56 registri), selezione della riga con compilazione collegata di indirizzo/lunghezza/valore
- Popup di scrittura: verde in caso di successo / rosso in caso di errore (con motivo)
- Controllo della posizione: cursore (0-4095) sincronizzato con la casella del valore
- Baud rate / ripristino delle impostazioni di fabbrica
- Parametri xdat (solo EEPROM): salva → apri → ripristina

### 7.4 Telecomando

> ⚠️ **Direzione: il braccio leader controlla il braccio follower**. Il braccio leader (master) legge gli angoli, il braccio follower (slave) è sincronizzato. Richiede ID corrispondenti su entrambe le porte.

Barra superiore `🎮 Telecomando`: il leader legge → il follower controlla (servo con lo stesso ID su entrambe le porte)

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
