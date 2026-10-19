[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | Italiano | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# Strumento di calibrazione della serie SoARM — Guida macOS

Per macOS 11 (Big Sur) e versioni successive. Punti chiave: denominazione delle porte seriali (`cu.*` vs `tty.*`), driver USB.

> ⚠️ **Compatibilità: questo strumento supporta attualmente solo servo Feetech (serie STS3215)**. La tabella dei registri e il formato xdat sono progettati per Feetech STS3215; altre marche/modelli non sono garantiti.

---

## 1. Requisiti

| Dipendenza | Versione |
|-----------|---------|
| Python | >= 3.8 (consigliato 3.10+, tramite Homebrew) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| Sistema operativo | macOS 11+ (Apple Silicon / Intel) |

## 2. Installare Python

Consigliato tramite Homebrew:

```bash
# Installa Homebrew se mancante
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installa Python
brew install python
```

Verifica:

```bash
python3 --version
```

## 3. Installare le dipendenze

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Crea l'ambiente virtuale UNA SOLA VOLTA**. Rieseguirlo azzererà/sovrascriverà l'ambiente (cancellando le dipendenze installate). Dopodiché, basta `source .venv/bin/activate`.

## 4. ⚠️ Denominazione delle porte seriali su macOS [importante]

macOS colloca i dispositivi seriali USB sotto `/dev` secondo **due convenzioni di denominazione**:

| Prefisso | Significato | Utilizzabile |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | stile modem (bloccante) | può bloccarsi, non consigliato |
| `/dev/cu.usbserial-*` | stile call/terminal (**non bloccante**) | ✅ consigliato |

**Trova la tua porta:**

```bash
ls /dev/cu.*
```

Output tipico:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # seriale USB integrata (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> Lo strumento preferisce automaticamente i dispositivi `cu.*`. Se specifichi una porta manualmente, usa `cu.` e non `tty.`.

## 5. Driver USB

Le puce più comuni (CH340, CP2102, FTDI) dispongono di driver macOS integrati. Se il dispositivo non viene riconosciuto:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**: i lotti più vecchi richiedono il driver ufficiale WCH
- In generale, è sufficiente che `ls /dev/cu.*` mostri il dispositivo

## 6. Verificare l'ambiente

```bash
python setup.py
```

## 7. Avviare la GUI

```bash
python main.py
# or
python -m src.gui.factory_calibration_tool
```

Specificare le porte:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> Quando è presente una sola porta seriale, la seconda porta viene disabilitata automaticamente.

## 8. Flusso dell'interfaccia

### 8.1 Scheda Calibrazione dei servo
Seleziona la porta del braccio leader/follower; i servo vengono scansionati automaticamente.

- La calibrazione del centro apre la procedura guidata di calibrazione LeRobot: monitor in tempo reale a sinistra (ID / Pos / cursore), tabella di calibrazione a destra.
- **Avvia registrazione centro** → porta il braccio al centro → **Termina registrazione centro**; poi **Registra corsa** (diventa verde) → muovi ogni articolazione da un limite all'altro, pinza inclusa → fai clic di nuovo per fermare.
- Una volta completate tutte e sei le articolazioni, il file di calibrazione viene salvato automaticamente e sovrascrive il precedente.

> ⚠️ Registra la stessa corsa su entrambi i bracci, altrimenti il movimento del follower non corrisponderà a quello del leader.

### 8.2 Scheda Controllo di un singolo servo
- Ogni riga: ID / Pos / cursore / L (destinazione)
- **Pos e il cursore sono bidirezionalmente collegati**: trascinando il cursore si aggiorna Pos; digitando in Pos si sposta il cursore e si invia subito il comando
- Il comando viene inviato al rilascio, non durante il trascinamento

### 8.3 Scheda Debugger FT
- Connessione seriale (1M predefinito), scansione dei servo
- Lettura di tutti i registri, tabella dei parametri (56 registri), selezione della riga con compilazione collegata di indirizzo/lunghezza/valore
- Popup di scrittura: verde in caso di successo / rosso in caso di errore (con motivo)
- Controllo della posizione: cursore (0-4095) con sincronizzazione della casella del valore
- Baud rate / ripristino delle impostazioni di fabbrica
- Parametri xdat (solo EEPROM): salva → apri → ripristina

### 8.4 Telecomando

> ⚠️ **Direzione: il braccio leader controlla il braccio follower**. Il braccio leader (master) legge gli angoli, il braccio follower (slave) è sincronizzato. Richiede ID corrispondenti su entrambe le porte.

Barra superiore `🎮 Telecomando`: il leader legge → il follower controlla (servo con lo stesso ID su entrambe le porte)

## 9. Risoluzione dei problemi

| Problema | Soluzione |
|---------|----------|
| Porta con `tty.` che si blocca | Usa invece il prefisso `cu.` |
| Dispositivo non trovato | `ls /dev/cu.*`; ricollega; `system_profiler SPUSBDataType` |
| Interfaccia in cinese vuota | PingFang di sistema di solito va bene; se non funziona, installa Noto Sans CJK |
| Attivazione del venv non riuscita | `source .venv/bin/activate` (non `.bat`) |
| Errore di compilazione su Apple Silicon | Python 3.10+ è nativo; evita i vecchi Python via Rosetta |

## 10. Strumenti a riga di comando (facoltativo)

```bash
# Scansiona i servo
python -m src.tools.scan_id

# Calibrazione LeRobot
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. Suggerimenti

- **Il nome della porta cambia**: i nomi `cu.*` possono variare a seconda delle porte USB; selezionalo nel menu a discesa a ogni avvio
- **Sospensione**: macOS può sospendersi e perdere la seriale; mantieni il sistema attivo durante l'uso
- **Autorizzazione alla privacy**: se viene richiesto di "accedere ai dischi rimovibili", consentilo
