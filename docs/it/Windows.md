[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | Italiano | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# Strumento di calibrazione della serie SoARM — Guida Windows

Per Windows 10 / 11. Copre dall'installazione alla calibrazione completa dei servo.

> ⚠️ **Compatibilità: questo strumento supporta attualmente solo servo Feetech (serie STS3215)**. La tabella dei registri e il formato xdat sono progettati per Feetech STS3215; altre marche/modelli non sono garantiti.

---

## 1. Requisiti

| Dipendenza | Versione | Note |
|-----------|---------|-------|
| Python | >= 3.8 | Consigliato 3.10+, scaricalo da [python.org](https://www.python.org/downloads/) |
| PySide6 | >= 6.0 | Framework per la GUI |
| pyserial | >= 3.5 | Comunicazione seriale |
| Sistema operativo | Win10 / Win11 | Qualsiasi edizione |

## 2. Installare Python

1. Visita <https://www.python.org/downloads/>
2. Scarica l'installer di Python 3.10+
3. **Seleziona "Add Python to PATH"** durante l'installazione (altrimenti python non verrà trovato nel terminale)

Verifica:

```bash
python --version
```

## 3. Installare le dipendenze

Installa in un ambiente virtuale per non inquinare il Python di sistema:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **Crea l'ambiente virtuale UNA SOLA VOLTA**. Rieseguirlo azzererà/sovrascriverà l'ambiente (cancellando le dipendenze installate). Dopodiché, basta attivarlo ogni volta con `activate`.

> Dopo l'attivazione il prompt mostrerà `(.venv)`.

## 4. Verificare l'ambiente

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目` significa che l'ambiente è pronto.

## 5. Collegare l'hardware

1. Collega l'adattatore USB-seriale (CH340 / CP2102)
2. Collega il controller dei servo (scheda di controllo del braccio robotico)
3. Alimenta i servo (DC 5V 5A standard, DC 12V 5A Pro)

Controlla la porta COM nel Gestione dispositivi (`Win+X` → Gestione dispositivi):

```
Ports (COM & LPT)
  └─ USB-SERIAL CH340 (COM3)     ← la tua porta servo
```

> **Annota il numero COM** per selezionarlo all'avvio.

## 6. Avviare la GUI

```bash
python -m src.gui.factory_calibration_tool
```

Oppure specifica le porte (se sono occupate):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

Elenca le porte disponibili:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. Flusso dell'interfaccia

### 7.1 Scheda Calibrazione dei servo

1. Seleziona Port1/Port2 nella barra superiore → scansione automatica dei servo (ID 1-6)
2. Pulsanti comuni:
   - **Calibrazione del centro**: imposta la posizione attuale come centro 2048
   - **Test del centro**: abilita la coppia e sposta al centro per verificare
   - **Disattiva servo**: disattiva la coppia per la rotazione manuale

### 7.2 Scheda Controllo di un singolo servo

- Trascina il cursore → il servo si sposta nella posizione di destinazione al rilascio
- L'interruttore di coppia controlla i singoli servo

### 7.3 Scheda Debugger FT

- **Connessione seriale**: seleziona la porta, il baud rate (1M predefinito)
- **Scansiona servo**: rileva i servo in linea
- **Leggi parametri**: legge tutti i registri (EEPROM + SRAM)
- **Tabella dei parametri**: 5 colonne che mostrano tutti i 56 registri, **la selezione della riga compila automaticamente indirizzo/lunghezza/valore**
- **Popup di scrittura**: verde "✅ Written successfully" in caso di successo, rosso "❌ Write failed" (con motivo) in caso di errore
- **Controllo della posizione**:
  - **Cursore** per regolare la posizione di destinazione (0-4095), la casella del valore si aggiorna in tempo reale; oppure digita direttamente nella casella
  - Dopo lo spostamento, viene richiesto di disattivare la coppia
- **Baud rate / Ripristino delle impostazioni di fabbrica**: modifica il baud rate, ripristino delle impostazioni di fabbrica
- **Parametri xdat (solo EEPROM)**:
  1. `💾 Save Current Servo`: salva i parametri EEPROM del servo corrente in un file xdat
  2. `📂 Open xdat`: carica un file di backup
  3. `📤 Restore to Servo`: riscrive il backup nel servo

### 7.4 Telecomando

> ⚠️ **Direzione: la porta 1 controlla la porta 2**. La porta 1 (master) legge solo gli angoli dei servo, la porta 2 (slave) è sincronizzata. Richiede ID servo corrispondenti su entrambe le porte.

- Pulsante `🎮 Remote` della barra superiore: la porta 1 legge → la porta 2 controlla (servo con lo stesso ID)
- Fai clic di nuovo per fermare il telecomando

## 8. Risoluzione dei problemi

| Problema | Soluzione |
|---------|----------|
| Nessuna porta seriale | Controlla il driver nel Gestione dispositivi; prova un'altra porta USB; installa il driver CH340 |
| Porta in uso | Chiudi i monitor seriali; riavvia lo strumento |
| Testo cinese vuoto | Il sistema dispone di Microsoft YaHei; se non funziona, installa un font CJK |
| Servo non trovato | Controlla alimentazione/cablaggio; verifica 1M baud |
| PermissionError all'apertura della porta | Assicurati che nessun altro processo occupi la porta COM |

## 9. Strumenti a riga di comando (facoltativo)

```bash
# Scansiona i servo
python -m src.tools.scan_id

# Calibrazione rapida del centro
python -m src.tools.servo_quick_calibration

# Calibrazione LeRobot
python -m src.tools.lerobot_calibrate
```
