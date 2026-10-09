[English](../en/README.md) | [简体中文](../zh-hans/README.md) | [繁體中文](../zh-hant/README.md) | [Deutsch](../de/README.md) | [Español](../es/README.md) | [Français](../fr/README.md) | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | Português (BR) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# Ferramenta de Calibração da Série So-ARM

**Um kit de calibração de fábrica e de calibração LeRobot para servos FTServo na série So-ARM 10X de braços robóticos**

> ⚠️ **Aviso de compatibilidade: atualmente este sistema suporta apenas servos Feetech (série STS3215).** A tabela de registradores, o formato de parâmetros xdat e a tabela de baud rates foram todos projetados para a série Feetech STS3215; servos de outras marcas ou modelos não têm compatibilidade garantida.

> 📜 **Origem e créditos: esta ferramenta é construída sobre o [Seeed_RoboController da Seeed Studio](https://github.com/Seeed-Studio) e o estende**, que foi lançado sob a licença MIT. Preservando a funcionalidade central original, este projeto reformula a GUI e adiciona um depurador FT, backup/restauração de parâmetros xdat, suporte multiplataforma e outros aprimoramentos. Veja [LICENSE](../../LICENSE) para detalhes.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[Recursos](#-recursos) · [Visão Geral da Interface](#-visão-geral-da-interface) · [Início Rápido](#-início-rápido) · [Passos de Uso](#-passos-de-uso) · [Precauções](#-precauções) · [Solução de Problemas](#-solução-de-problemas)

</div>

---

## ✨ Recursos

| Recurso | Descrição |
| ---- | ---- |
| Detecção automática de porta | Identifica portas seriais USB e filtra dispositivos virtuais |
| Suporte multiplataforma | Funciona em Windows / Ubuntu / macOS |
| Sincronização de duas portas | As portas seriais esquerda e direita operam de forma independente, com controle remoto sincronizado mestre/escravo pelas duas portas |
| Alternância chinês/inglês | Alterna a interface entre chinês e inglês com um clique; a escolha é memorizada |
| Calibração central | Grava a posição atual do servo como o centro 2048 (persistido na EEPROM) |
| Teste central | Habilita o torque e move os servos até o centro para verificar a calibração |
| Desabilitar motores | Desabilita o torque de todos os servos com um clique para ajuste manual |
| Varredura automática | Detecta automaticamente todos os servos online com um ID na faixa de 1–20 |
| Controle de servo único | Controle em tempo real, por controle deslizante, da posição e da chave de torque de um único servo |
| Depurador FT | Conexão serial, varredura, leitura/gravação de parâmetros, controle de posição, alteração de baud rate, reset de fábrica, backup de parâmetros xdat |
| Parâmetros xdat | Salva os parâmetros de EEPROM do servo atual / abre um backup para restaurar |
| Calibração LeRobot | Gera arquivos de calibração em JSON no formato LeRobot |
| Ir para o centro a partir de um arquivo de calibração | Move o braço até o centro a partir de um arquivo de calibração |

---

## 📚 Guias por Sistema Operacional

| SO | Guia |
|----|-------|
| Windows | [Guia do Windows](Windows.md) |
| Linux | [Guia do Linux](Linux.md) |
| macOS | [Guia do macOS](macOS.md) |

---

## 🖥️ Visão Geral da Interface

O programa principal contém três abas:

```
┌─────────────────────────────────────────────────────────────────┐
│  Suíte de Calibração SoARM [Port1▾] [Port2▾] [🔄] [🎮 Remoto][EN]│  ← Barra superior
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬──────────────────────────────┐ │
│  │ Porta 1 - Calib. Servo      │ Porta 2 - Calib. Servo       │ │
│  │ [🔴 Não conectado] Atual:…  │ [🔴 Não conectado] Atual:…   │ │
│  │ Tabela de status servo 1–6  │ Tabela de status servo 1–6   │ │
│  │ [Calib. Central][Teste]…    │ [Calib. Central][Teste]…     │ │
│  └─────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Barra superior**: título do aplicativo, menus suspensos de portas seriais, botão de atualizar, botão de controle remoto e botão de alternância de idioma.
- **🦾 Aba 1 — Calibração de Servos**: ações rápidas nos painéis esquerdo e direito (calibração central, teste central, desabilitar motores) além do status ao vivo.
- **🎚️ Aba 2 — Controle de Servo Único**: ajuste fino da posição de cada servo online com um controle deslizante e alternância do seu torque.
- **🔬 Aba 3 — Depurador FT**: conexão serial, varredura, leitura/gravação de parâmetros, controle de posição, alteração de baud rate / reset de fábrica, e backup e restauração de parâmetros xdat.

---

## 🚀 Início Rápido

> Consulte [📚 Guias por Sistema Operacional](#-guias-por-sistema-operacional) para os tutoriais completos por sistema. O essencial para cada sistema está abaixo.

### Windows

1. Instale o [Python 3.10+](https://www.python.org/downloads/) (marque **Add to PATH**).
2. Crie um ambiente virtual e instale as dependências:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Verifique o ambiente e inicie:

```bash
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Confirme a porta COM no Gerenciador de Dispositivos (por exemplo `COM3`) e selecione-a na barra superior. Para especificar as portas manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. Instale as fontes CJK e as dependências:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ Adicione permissões de porta serial (grupo dialout)** [obrigatório]:

```bash
sudo usermod -a -G dialout $USER
# Passa a valer depois que você sair e entrar novamente
```

3. Crie um ambiente virtual, instale as dependências e inicie:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Os dispositivos seriais são `/dev/ttyUSB0` / `/dev/ttyACM0`. Para especificá-los manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. Instale o Python com o Homebrew:

```bash
brew install python
```

2. Crie um ambiente virtual, instale as dependências e inicie:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ Nomenclatura de porta serial**: no macOS use `/dev/cu.usbserial-*` (**recomendado, não bloqueante**) em vez de `/dev/tty.*`. Para listá-las:

```bash
ls /dev/cu.*
```

Para especificá-las manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### Ferramentas gerais de linha de comando (sem GUI)

```bash
# Varre servos
python -m src.tools.scan_id

# Calibração central rápida de servo
python -m src.tools.servo_quick_calibration

# Teste central de servo
python -m src.tools.servo_center_test

# Desabilita todos os servos
python -m src.tools.servo_disable

# Calibração no estilo LeRobot
python -m src.tools.lerobot_calibrate

# Controle remoto sincronizado por duas portas
python -m src.tools.servo_remote_control
```

---

## 📖 Passos de Uso

### 1. Conectar e detectar servos

1. Conecte a placa de controle do braço por meio de um adaptador USB-serial e ligue os servos.
2. Abra a GUI e selecione a porta correspondente no menu suspenso de portas da barra superior (ou clique em `🔄` para atualizar).
3. O cabeçalho do painel mostra `🟢 Conectado` e varre automaticamente os servos online com IDs na faixa de 1–20 (normalmente 1–6).

> Se a porta for reportada como ocupada, certifique-se de que nenhum outro programa (um monitor serial, ou uma execução anterior da ferramenta que nunca foi encerrada) esteja segurando-a.

### 2. Calibração central (definir a posição atual como 2048)

> Antes de calibrar, posicione fisicamente o braço de modo que cada junta fique na posição de "zero / centro" desejada.

1. Clique no botão **Calibração Central da Serial X** no painel.
2. O programa primeiro desabilita os servos e solicita que você os mova manualmente até o centro desejado.
3. Após você confirmar, o programa processa cada servo: destravar a EEPROM → gravar o comando de calibração (valor 128 no endereço 40) → travar a EEPROM novamente.
4. Verifique com o "Teste Central": os servos devem manter a posição (movendo-se apenas levemente), o que confirma uma calibração bem-sucedida.

### 3. Teste central

1. Clique em **Teste Central da Serial X**.
2. O programa habilita o torque e move todos os servos para 2048.
3. Se um servo quase não se mover da posição atual, a calibração está correta; se ele se mover muito, o valor de calibração não é confiável e precisa ser refeito.

### 4. Desabilitar motores (ajuste manual)

- Clique em **Desabilitar Motores da Serial X** para desabilitar o torque de todos os servos dessa porta, para que possam ser girados livremente à mão.
- Um servo individual pode ser alternado na aba **Controle de Servo Único** usando a chave de torque abaixo do seu controle deslizante.

### 5. Alterar o ID de um servo

1. Abra a aba **🔬 Depurador FT**, conecte a porta serial e varra os servos.
2. Selecione o servo desejado, altere o valor "Servo ID" (endereço 0x05) na tabela de parâmetros e clique em Gravar.
3. O programa então executa: destravar → gravar endereço 5 → verificar o novo ID → travar novamente.

> ⚠️ Antes de alterar um ID, sempre certifique-se de que este é o único servo no barramento, para evitar conflitos de ID.

### 6. Alterar o baud rate / restaurar padrões de fábrica

- **Alterar baud rate**: na área "Baud Rate / Redefinição de Fábrica" da aba Depurador FT, selecione o novo baud rate (38400 – 1000000 bps) e aplique-o. Após a gravação, o baud rate serial muda automaticamente e é verificado com um ping; em caso de falha, é revertido automaticamente.
- **Restaurar padrões de fábrica**: o servo volta aos padrões de fábrica (ID=1, baud rate=1000000); você deve refazer a varredura depois.

### 7. Backup e restauração de parâmetros xdat

Na área "parâmetros xdat (salvar apenas EEPROM)" da aba Depurador FT:

1. **💾 Salvar servo atual**: salva os parâmetros de EEPROM do servo selecionado em um arquivo xdat (um backup).
2. Depois de alterar os parâmetros do servo à vontade, se você quiser restaurá-los:
3. **📂 Abrir xdat**: carrega um arquivo de backup.
4. **📤 Restaurar parâmetros no servo**: grava o backup de volta na EEPROM do servo atual.

### 8. Controle remoto sincronizado por duas portas

> ⚠️ **Observação de direção: a Porta 1 controla a Porta 2.** A Porta 1 (mestre) apenas lê os ângulos dos servos; a Porta 2 (escrava) é acionada em sincronia.

1. Na barra superior, clique em **🎮 Remoto** (a Porta 1 lê os ângulos → a Porta 2 aciona em sincronia os servos com os mesmos IDs).
2. As duas portas devem usar IDs de servo correspondentes; apenas os servos presentes nas duas são sincronizados.
3. Clique no mesmo botão novamente para parar; depois disso, as threads de varredura dos painéis esquerdo e direito são retomadas automaticamente.

### 9. Calibração LeRobot (linha de comando)

```bash
# Calibra o braço follower (salvo em ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Calibra o braço leader
python -m src.tools.lerobot_calibrate --arm-type leader
```

Procedimento: desabilitar os servos → posicionar cada junta no centro e registrar `homing_offset` → girar lentamente por toda a faixa para registrar `range_min/max` (`wrist_roll` é uma junta de rotação contínua cuja faixa é fixada em `[0,4095]`) → salvar o JSON.

Executar até o centro a partir de um arquivo de calibração:

```bash
python -m src.tools.run_calibration_middle <calibration_file.json> --mode zero
```

---

## ⚠️ Precauções

1. **Segurança em primeiro lugar**: a calibração central é persistida na EEPROM. Antes de calibrar, confirme que a fonte de alimentação é estável e que o braço não vai colidir com pessoas ou objetos.
2. **Fonte de alimentação**: a edição padrão do SoARM 101 é alimentada idealmente com DC 5V 5A, e a edição Pro com DC 12V 5A. Alimentação insuficiente causa passos perdidos ou falhas de comunicação.
3. **Porta serial exclusiva**: no Windows a porta serial é exclusiva, então a mesma porta não pode ser usada ao mesmo tempo pela thread de varredura da GUI e por um subprocesso de calibração. A ferramenta para a thread de varredura e encerra o processo antigo antes de operar; não clique repetidamente à mão.
4. **Permissões seriais no Linux**: acessar `/dev/ttyUSB*` / `/dev/ttyACM*` exige adicionar seu usuário ao grupo `dialout` (veja o [Guia do Linux](Linux.md)).
5. **Nomenclatura serial no macOS**: use `/dev/cu.*` (não bloqueante) em vez de `/dev/tty.*` (bloqueante, pode travar); veja o [Guia do macOS](macOS.md).
6. **Hot-plug**: depois que você desconecta o cabo USB, o programa tenta se reconectar automaticamente; quando ele for reconectado, clique em `🔄` para atualizar a lista de portas.
7. **Proteção contra sobreaquecimento / sobretensão**: o programa monitora tensão e temperatura (aviso acima de 60°C). Se um servo continuar quente, pare e deixe esfriar.
8. **A calibração central é irreversível**: a gravação sobrescreve o offset original e não pode ser desfeita. Registre a posição original antes de calibrar.
9. **Risco na alteração de ID**: se a gravação ou a verificação falhar, o programa reporta um erro e retoma a varredura, mas em casos extremos um servo pode ficar "perdido". Se isso acontecer, tente "Restaurar padrões de fábrica" (após o que o ID volta a 1).
10. **Problemas de codificação**: se os emojis aparecerem corrompidos em um console do Windows, defina `PYTHONIOENCODING=utf-8` antes de executar as ferramentas de linha de comando. Linux/macOS usam UTF-8 nativo e normalmente não são afetados.

---

## 🛠️ Solução de Problemas

| Sintoma | Causa possível | Solução |
| ---- | -------- | -------- |
| Não consegue abrir a porta serial / porta ocupada | Outro programa está usando-a | Feche programas como monitores seriais, ou mude para outra porta e reinicie a ferramenta |
| Nenhum servo encontrado | Alimentação insuficiente / fiação incorreta / incompatibilidade de baud rate | Verifique a alimentação e a fiação, e confirme que os servos estão a 1M de baud |
| Servos disparados após a calibração central | A pose não foi definida antes de calibrar | Repita "desabilitar → posicionar à mão → calibração central" |
| Temperatura subindo rápido demais | Carga excessiva ou uma junta travada | Verifique se há travamento mecânico e reduza velocidade/aceleração |
| Servo não encontrado após alterar o ID | Conflito de ID ou falha na gravação | Restaure os padrões de fábrica e refaça a varredura |
| Controle remoto fora de sincronia | Os IDs nas duas portas são diferentes | Confirme que servos com os mesmos IDs estão online nas portas mestre e escrava |

---

## 📁 Estrutura do Projeto

```
SO-ARM101-ServoController/
├── docs/                    # Documentação, uma pasta por idioma
│   └── <lang>/              # en, zh-hans, zh-hant, de, es, fr, it, ja, ko, pt-br, pt-pt
│       ├── README.md        # Este documento
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── src/
│   ├── gui/                  # Interface gráfica PySide6
│   │   ├── factory_calibration_tool.py   # Ferramenta principal (calibração de duas portas + controle remoto + troca de idioma)
│   │   ├── ft_debugger.py                # Depurador FT (leitura/gravação de parâmetros / backup xdat)
│   │   ├── calibration_wizard.py         # Assistente de calibração LeRobot
│   │   ├── theme_utils.py                # Tema claro
│   │   └── language_dialog.py            # Diálogo de seleção de idioma
│   ├── tools/                # Ferramentas de linha de comando
│   ├── xdat_utils.py         # Leitura/gravação de arquivo de parâmetros xdat
│   ├── i18n*.py / i18n_translations/     # Internacionalização chinês/inglês
│   ├── port_utils.py         # Detecção de porta serial
│   └── calibration_manager.py# Gerenciamento de arquivos de calibração LeRobot
├── scservo_sdk/              # SDK de comunicação dos servos FTServo
├── requirements.txt
└── setup.py                  # Script de verificação do ambiente
```
