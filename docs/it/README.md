[English](../en/README.md) | [简体中文](../zh-hans/README.md) | [繁體中文](../zh-hant/README.md) | [Deutsch](../de/README.md) | [Español](../es/README.md) | [Français](../fr/README.md) | Italiano | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# Strumento di calibrazione della serie So-ARM

**Un toolkit di calibrazione di fabbrica e di calibrazione LeRobot per i servo FTServo dei bracci robotici della serie So-ARM 10X**

> ⚠️ **Avviso di compatibilità: questo sistema supporta attualmente solo servo Feetech (serie STS3215).** La tabella dei registri, il formato dei parametri xdat e la tabella dei baud rate sono tutti progettati per la serie Feetech STS3215; non è garantita la compatibilità con servo di altre marche o modelli.

> 📜 **Origine e crediti: questo strumento è basato su [Seeed Studio's Seeed_RoboController](https://github.com/Seeed-Studio) e lo estende**, rilasciato con licenza MIT. Pur preservando le funzionalità principali originali, questo progetto rinnova l'interfaccia grafica e aggiunge un debugger FT, il backup/ripristino dei parametri xdat, il supporto multipiattaforma e altri miglioramenti. Per i dettagli, vedere [LICENSE](../../LICENSE).

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[Caratteristiche](#-caratteristiche) · [Panoramica dell'interfaccia](#-panoramica-dellinterfaccia) · [Avvio rapido](#-avvio-rapido) · [Passaggi di utilizzo](#-passaggi-di-utilizzo) · [Precauzioni](#-precauzioni) · [Risoluzione dei problemi](#-risoluzione-dei-problemi)

</div>

---

## ✨ Caratteristiche

| Caratteristica | Descrizione |
| ---- | ---- |
| Rilevamento automatico delle porte | Identifica le porte seriali USB e filtra i dispositivi virtuali |
| Supporto multipiattaforma | Funziona su Windows / Ubuntu / macOS |
| Sincronizzazione a doppia porta | Le porte seriali sinistra e destra funzionano in modo indipendente, con telecomando sincronizzato master/slave a doppia porta |
| Commutazione cinese/inglese | Cambia l'interfaccia tra cinese e inglese con un solo clic; la scelta viene memorizzata |
| Calibrazione del centro | Registra la posizione attuale del servo come centro 2048 (salvata in modo permanente nell'EEPROM) |
| Test del centro | Abilita la coppia e sposta i servo al centro per verificare la calibrazione |
| Disattivazione dei motori | Disattiva la coppia su tutti i servo con un solo clic per la regolazione manuale |
| Scansione automatica | Rileva automaticamente ogni servo in linea con un ID compreso tra 1 e 20 |
| Controllo di un singolo servo | Controllo in tempo reale, tramite cursore, della posizione di un singolo servo e del suo interruttore di coppia |
| Debugger FT | Connessione seriale, scansione, lettura/scrittura dei parametri, controllo della posizione, cambio di baud rate, ripristino delle impostazioni di fabbrica, backup dei parametri xdat |
| Parametri xdat | Salva i parametri EEPROM del servo corrente / apre un backup da ripristinare |
| Calibrazione LeRobot | Genera file di calibrazione JSON in formato LeRobot |
| Ritorno al centro da un file di calibrazione | Sposta il braccio al centro a partire da un file di calibrazione |

---

## 📚 Guide per sistema operativo

| Sistema operativo | Guida |
|----|-------|
| Windows | [Guida Windows](Windows.md) |
| Linux | [Guida Linux](Linux.md) |
| macOS | [Guida macOS](macOS.md) |

---

## 🖥️ Panoramica dell'interfaccia

Il programma principale comprende tre schede:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Suite di calibrazione SoARM    [Port1▾] [Port2▾] [🔄] [🎮 Telecomando][EN]│  ← Barra superiore
├──────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────┬──────────────────────────────────┐ │
│  │ Port 1 - Calib. servo            │ Port 2 - Calib. servo            │ │
│  │ [🔴 Non connesso] Pos:…           │ [🔴 Non connesso] Pos:…           │ │
│  │ Tabella stato servo 1–6          │ Tabella stato servo 1–6          │ │
│  │ [Cal. centro][Test centro]…      │ [Cal. centro][Test centro]…      │ │
│  └──────────────────────────────────┴──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Barra superiore**: titolo dell'applicazione, menu a discesa delle porte seriali, pulsante di aggiornamento, pulsante del telecomando e pulsante di commutazione della lingua.
- **🦾 Scheda 1 — Calibrazione dei servo**: azioni rapide sui pannelli sinistro e destro (calibrazione del centro, test del centro, disattivazione dei motori) più lo stato in tempo reale.
- **🎚️ Scheda 2 — Controllo di un singolo servo**: regola con precisione la posizione di ciascun servo in linea tramite un cursore e attiva o disattiva la sua coppia.
- **🔬 Scheda 3 — Debugger FT**: connessione seriale, scansione, lettura/scrittura dei parametri, controllo della posizione, baud rate / ripristino delle impostazioni di fabbrica, e backup e ripristino dei parametri xdat.

---

## 🚀 Avvio rapido

> Vedere le [📚 Guide per sistema operativo](#-guide-per-sistema-operativo) per le procedure complete per ciascun sistema. I punti essenziali per ogni sistema sono riportati di seguito.

### Windows

1. Installa [Python 3.10+](https://www.python.org/downloads/) (seleziona **Add to PATH**).
2. Crea un ambiente virtuale e installa le dipendenze:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Verifica l'ambiente e avvia:

```bash
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Conferma la porta COM nel Gestione dispositivi (ad esempio `COM3`) e selezionala nella barra superiore. Per specificare manualmente le porte:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. Installa i font CJK e le dipendenze:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ Aggiungi i permessi per la porta seriale (gruppo dialout)** [obbligatorio]:

```bash
sudo usermod -a -G dialout $USER
# Ha effetto dopo la disconnessione e la successiva riconnessione
```

3. Crea un ambiente virtuale, installa le dipendenze e avvia:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. I dispositivi seriali sono `/dev/ttyUSB0` / `/dev/ttyACM0`. Per specificarli manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. Installa Python con Homebrew:

```bash
brew install python
```

2. Crea un ambiente virtuale, installa le dipendenze e avvia:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ Denominazione delle porte seriali**: su macOS usa `/dev/cu.usbserial-*` (**consigliato, non bloccante**) invece di `/dev/tty.*`. Per elencarle:

```bash
ls /dev/cu.*
```

Per specificarle manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### Strumenti a riga di comando generali (senza GUI)

```bash
# Scansiona i servo
python -m src.tools.scan_id

# Calibrazione rapida del centro dei servo
python -m src.tools.servo_quick_calibration

# Test del centro dei servo
python -m src.tools.servo_center_test

# Disattiva tutti i servo
python -m src.tools.servo_disable

# Calibrazione in stile LeRobot
python -m src.tools.lerobot_calibrate

# Telecomando sincronizzato a doppia porta
python -m src.tools.servo_remote_control
```

---

## 📖 Passaggi di utilizzo

### 1. Collegare e rilevare i servo

1. Collega la scheda di controllo del braccio tramite un adattatore USB-seriale e alimenta i servo.
2. Apri l'interfaccia grafica e seleziona la porta corrispondente dal menu a discesa delle porte seriali nella barra superiore (oppure fai clic su `🔄` per aggiornare).
3. L'intestazione del pannello mostra `🟢 Connected` e scansiona automaticamente i servo in linea con ID compresi tra 1 e 20 (di solito 1–6).

> Se la porta risulta occupata, assicurati che nessun altro programma (un monitor seriale, o un'esecuzione precedente dello strumento mai terminata) la stia utilizzando.

### 2. Calibrazione del centro (impostare la posizione attuale su 2048)

> Prima di calibrare, posiziona fisicamente il braccio in modo che ogni articolazione si trovi nella posizione di "zero / centro" desiderata.

1. Fai clic sul pulsante **Calibrazione del centro della porta seriale X** sul pannello.
2. Il programma disattiva prima i servo e ti invita a spostarli a mano fino al centro desiderato.
3. Una volta confermato, il programma elabora ogni servo: sblocca l'EEPROM → scrive il comando di calibrazione (valore 128 all'indirizzo 40) → ri-blocca l'EEPROM.
4. Verifica con "Test del centro": i servo dovrebbero mantenere la posizione (muovendosi solo leggermente), il che conferma che la calibrazione è riuscita.

### 3. Test del centro

1. Fai clic su **Test del centro della porta seriale X**.
2. Il programma abilita la coppia e sposta tutti i servo su 2048.
3. Se un servo si sposta a malapena dalla sua posizione attuale, la calibrazione è corretta; se si sposta molto, il valore di calibrazione non è affidabile e deve essere rifatto.

### 4. Disattivazione dei motori (regolazione manuale)

- Fai clic su **Disattiva motori della porta seriale X** per disattivare la coppia su ogni servo di quella porta, in modo che possano essere ruotati liberamente a mano.
- Un singolo servo può essere attivato o disattivato nella scheda **Controllo di un singolo servo** tramite l'interruttore di coppia sotto il suo cursore.

### 5. Modificare l'ID di un servo

1. Apri la scheda **🔬 Debugger FT**, collega la porta seriale e scansiona i servo.
2. Seleziona il servo di destinazione, modifica il suo valore "Servo ID" (indirizzo 0x05) nella tabella dei parametri e fai clic su Scrivi.
3. Il programma esegue quindi: sblocca → scrive all'indirizzo 5 → verifica il nuovo ID → ri-blocca.

> ⚠️ Prima di modificare un ID, assicurati sempre che questo sia l'unico servo sul bus per evitare conflitti di ID.

### 6. Modificare il baud rate / ripristinare le impostazioni di fabbrica

- **Modificare il baud rate**: nell'area "Baud rate / Ripristino delle impostazioni di fabbrica" della scheda Debugger FT, seleziona il nuovo baud rate (38400 – 1000000 bps) e applicalo. Dopo la scrittura, il baud rate seriale cambia automaticamente e viene verificato con un ping; in caso di errore viene ripristinato automaticamente.
- **Ripristinare le impostazioni di fabbrica**: il servo torna alle impostazioni di fabbrica (ID=1, baud rate=1000000); è necessario ripetere la scansione in seguito.

### 7. Backup e ripristino dei parametri xdat

Nell'area "parametri xdat (salva solo EEPROM)" della scheda Debugger FT:

1. **💾 Salva servo corrente**: salva i parametri EEPROM del servo selezionato in un file xdat (un backup).
2. Dopo aver modificato i parametri del servo a piacere, se desideri ripristinarli:
3. **📂 Apri xdat**: carica un file di backup.
4. **📤 Ripristina parametri sul servo**: riscrive il backup nell'EEPROM del servo corrente.

### 8. Telecomando sincronizzato a doppia porta

> ⚠️ **Nota sulla direzione: la porta 1 controlla la porta 2.** La porta 1 (master) legge solo gli angoli dei servo; la porta 2 (slave) viene pilotata in sincronia.

1. Nella barra superiore, fai clic su **🎮 Telecomando** (la porta 1 legge gli angoli → la porta 2 pilota in sincronia i servo con gli stessi ID).
2. Le due porte devono usare ID servo corrispondenti; vengono sincronizzati solo i servo presenti su entrambe.
3. Fai clic di nuovo sullo stesso pulsante per fermare; dopodiché i thread di scansione dei pannelli sinistro e destro riprendono automaticamente.

### 9. Calibrazione LeRobot (riga di comando)

```bash
# Calibra il braccio follower (salvato in ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Calibra il braccio leader
python -m src.tools.lerobot_calibrate --arm-type leader
```

Procedura: disattiva i servo → porta ogni articolazione al centro e registra `homing_offset` → ruota lentamente su tutta la gamma per registrare `range_min/max` (`wrist_roll` è un'articolazione a rotazione continua la cui gamma è fissata a `[0,4095]`) → salva il JSON.

Ritorno al centro da un file di calibrazione:

```bash
python -m src.tools.run_calibration_middle <calibration_file.json> --mode zero
```

---

## ⚠️ Precauzioni

1. **La sicurezza prima di tutto**: la calibrazione del centro viene salvata in modo permanente nell'EEPROM. Prima di calibrare, verifica che l'alimentazione sia stabile e che il braccio non entri in collisione con persone o oggetti.
2. **Alimentazione**: l'edizione standard del SoARM 101 è alimentata preferibilmente a DC 5V 5A, e l'edizione Pro a DC 12V 5A. Un'alimentazione insufficiente provoca passi persi o errori di comunicazione.
3. **Porta seriale esclusiva**: su Windows la porta seriale è esclusiva, quindi la stessa porta non può essere usata contemporaneamente dal thread di scansione della GUI e da un sottoprocesso di calibrazione. Lo strumento arresta il thread di scansione e termina il vecchio processo prima di operare; non fare clic ripetutamente a mano.
4. **Permessi seriali su Linux**: l'accesso a `/dev/ttyUSB*` / `/dev/ttyACM*` richiede l'aggiunta del tuo utente al gruppo `dialout` (vedere la [Guida Linux](Linux.md)).
5. **Denominazione seriale su macOS**: usa `/dev/cu.*` (non bloccante) invece di `/dev/tty.*` (bloccante, può bloccarsi); vedere la [Guida macOS](macOS.md).
6. **Collegamento a caldo**: dopo aver scollegato il cavo USB il programma tenta di riconnettersi automaticamente; una volta ricollegato, fai clic su `🔄` per aggiornare l'elenco delle porte.
7. **Protezione da sovratemperatura / sovratensione**: il programma monitora tensione e temperatura (avviso oltre 60 °C). Se un servo rimane caldo, fermati e lascialo raffreddare.
8. **La calibrazione del centro è irreversibile**: la scrittura sovrascrive l'offset originale e non può essere annullata. Registra la posizione originale prima di calibrare.
9. **Rischio legato al cambio di ID**: se la scrittura o la verifica fallisce, il programma segnala un errore e riprende la scansione, ma in casi estremi un servo può andare "perso". In tal caso, prova "Ripristina le impostazioni di fabbrica" (dopodiché l'ID torna a 1).
10. **Problemi di codifica**: se le emoji risultano illeggibili in una console Windows, imposta `PYTHONIOENCODING=utf-8` prima di eseguire gli strumenti a riga di comando. Linux/macOS usano UTF-8 nativo e di norma non sono interessati.

---

## 🛠️ Risoluzione dei problemi

| Sintomo | Possibile causa | Soluzione |
| ---- | -------- | -------- |
| Impossibile aprire la porta seriale / porta occupata | Un altro programma la sta usando | Chiudi programmi come i monitor seriali, oppure passa a un'altra porta e riavvia lo strumento |
| Nessun servo trovato | Alimentazione insufficiente / cablaggio errato / baud rate non corrispondente | Controlla alimentazione e cablaggio e verifica che i servo siano a 1M baud |
| I servo si comportano in modo anomalo dopo la calibrazione del centro | La posa non è stata impostata prima della calibrazione | Ripeti "disattiva → posiziona a mano → calibrazione del centro" |
| Temperatura in aumento troppo rapido | Carico eccessivo o articolazione in stallo | Verifica eventuali blocchi meccanici e riduci velocità/accelerazione |
| Servo non trovato dopo aver cambiato il suo ID | Conflitto di ID o scrittura non riuscita | Ripristina le impostazioni di fabbrica e ripeti la scansione |
| Telecomando fuori sincronia | Gli ID sulle due porte sono diversi | Verifica che i servo con gli stessi ID siano in linea sulle porte master e slave |

---

## 📁 Struttura del progetto

```
SO-ARM101-ServoController/
├── docs/                    # Documentazione, una cartella per lingua
│   └── <lang>/              # en, zh-hans, zh-hant, de, es, fr, it, ja, ko, pt-br, pt-pt
│       ├── README.md        # Questo documento
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── src/
│   ├── gui/                  # Interfaccia grafica PySide6
│   │   ├── factory_calibration_tool.py   # Strumento principale (calibrazione a doppia porta + telecomando + commutazione lingua)
│   │   ├── ft_debugger.py                # Debugger FT (lettura/scrittura parametri / backup xdat)
│   │   ├── calibration_wizard.py         # Procedura guidata di calibrazione LeRobot
│   │   ├── theme_utils.py                # Tema chiaro
│   │   └── language_dialog.py            # Finestra di selezione della lingua
│   ├── tools/                # Strumenti a riga di comando
│   ├── xdat_utils.py         # Lettura/scrittura dei file di parametri xdat
│   ├── i18n*.py / i18n_translations/     # Internazionalizzazione cinese/inglese
│   ├── port_utils.py         # Rilevamento delle porte seriali
│   └── calibration_manager.py# Gestione dei file di calibrazione LeRobot
├── scservo_sdk/              # SDK di comunicazione per i servo FTServo
├── requirements.txt
└── setup.py                  # Script di verifica dell'ambiente
```
