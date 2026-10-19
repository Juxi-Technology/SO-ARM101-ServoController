[English](../en/README.md) | [简体中文](../zh-hans/README.md) | [繁體中文](../zh-hant/README.md) | [Deutsch](../de/README.md) | [Español](../es/README.md) | [Français](../fr/README.md) | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | Português (PT)

<div align="center">

# Ferramenta de Calibração da Série So-ARM

**Um conjunto de ferramentas de calibração de fábrica e calibração LeRobot para servos FTServo nas séries So-ARM 10X de braços robóticos**

> ⚠️ **Aviso de compatibilidade: este sistema suporta atualmente apenas servos Feetech (série STS3215).** A tabela de registos, o formato de parâmetros xdat e a tabela de velocidades de transmissão são todos concebidos para a série Feetech STS3215; não é garantida a compatibilidade com servos de outras marcas ou modelos.

> 📜 **Origem e créditos: esta ferramenta baseia-se e expande o [Seeed_RoboController da Seeed Studio](https://github.com/Seeed-Studio)**, que foi lançado sob a licença MIT. Preservando a funcionalidade principal original, este projeto reformula a GUI e acrescenta um depurador FT, cópia de segurança/restauro de parâmetros xdat, suporte multiplataforma e outras melhorias. Consulte o [LICENSE](../../LICENSE) para mais detalhes.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[Funcionalidades](#-funcionalidades) · [Vista Geral da Interface](#-vista-geral-da-interface) · [Início Rápido](#-início-rápido) · [Passos de Utilização](#-passos-de-utilização) · [Precauções](#-precauções) · [Resolução de Problemas](#-resolução-de-problemas)

</div>

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
| ---- | ---- |
| Deteção automática de portas | Identifica portas série USB e filtra dispositivos virtuais |
| Suporte multiplataforma | Funciona em Windows / Ubuntu / macOS |
| Sincronização de dupla porta | As portas do braço leader e do braço follower funcionam de forma independente, com controlo remoto sincronizado leader/follower |
| Alternância chinês/inglês | Muda a interface entre chinês e inglês com um clique; a escolha é memorizada |
| Calibração de centro de servo individual | Grava a posição atual de um servo como o centro 2048 (persistido na EEPROM) |
| Teste de centro | Ativa o binário e move os servos para o centro para verificar a calibração |
| Desativar motores | Desativa o binário em todos os servos com um clique para ajuste manual |
| Varrimento automático | Deteta automaticamente todos os servos online com um ID no intervalo 1–20 |
| Controlo de servo individual | Controlo em tempo real, por deslizador, da posição de um servo individual e do interruptor de binário |
| Depurador FT | Ligação série, varrimento, leitura/escrita de parâmetros, controlo de posição, alteração da velocidade de transmissão, reposição de fábrica, cópia de segurança de parâmetros xdat |
| Parâmetros xdat | Guarda os parâmetros EEPROM do servo atual / abre uma cópia de segurança para restaurar |
| Calibração LeRobot | Calibração completa do braço leader / braço follower com um clique (centro da pose + varrimento do curso), criando e substituindo automaticamente o ficheiro de calibração |
| Compilação num único ficheiro | O PyInstaller integra tudo num único exe; a máquina de destino não precisa de Python e todas as ferramentas de linha de comandos estão no mesmo executável |
| Executar até ao centro a partir de um ficheiro de calibração | Move o braço até ao centro a partir de um ficheiro de calibração |

---

## 📚 Guias por Sistema Operativo

| SO | Guia |
|----|-------|
| Windows | [Guia do Windows](Windows.md) |
| Linux | [Guia do Linux](Linux.md) |
| macOS | [Guia do macOS](macOS.md) |

---

## 🖥️ Vista Geral da Interface

O programa principal contém três separadores:

```
┌─────────────────────────────────────────────────────────────────┐
│  Suite Calib. SoARM   [Leader▾] [Follower▾] [🔄] [🎮 Remoto][EN]│  ← Barra superior
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬──────────────────────────────┐ │
│  │ Leader - Calib. servo       │ Follower - Calib. servo      │ │
│  │ [🔴 Não ligado] Atual:…     │ [🔴 Não ligado] Atual:…      │ │
│  │ Tabela de estado servo 1–6  │ Tabela de estado servo 1–6   │ │
│  │ [Calib. Centro][Teste Cent]…│ [Calib. Centro][Teste Cent]… │ │
│  └─────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Barra superior**: título da aplicação, listas pendentes de portas do braço leader/follower, botão de atualizar, botão de controlo remoto e botão de alternância de idioma.
- **🦾 Separador 1 — Calibração de Servo**: ações rápidas nos painéis esquerdo e direito (calibração de centro, teste de centro, desativar motores) e estado em tempo real. **A calibração de centro** abre o assistente de calibração LeRobot (ver a secção 2) para calibrar o braço completo de uma só vez.
- **🎚️ Separador 2 — Controlo de Servo Individual**: uma linha por servo — ID / valor Pos / deslizador / L (destino). Pos e o deslizador estão **ligados nos dois sentidos**: arrastar o deslizador atualiza Pos; introduzir um valor em Pos move o deslizador e envia imediatamente o comando de posição.
- **🔬 Separador 3 — Depurador FT**: ligação série, varrimento, leitura/escrita de parâmetros, controlo de posição, velocidade de transmissão / reposição de fábrica e cópia de segurança e restauro de parâmetros xdat.

---

## 🚀 Início Rápido

> Consulte os [📚 Guias por Sistema Operativo](#-guias-por-sistema-operativo) para os guias completos de cada sistema. O essencial para cada sistema está abaixo.

### Windows

1. Instale o [Python 3.10+](https://www.python.org/downloads/) (assinale **Add to PATH**).
2. Crie um ambiente virtual e instale as dependências:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Verifique o ambiente e inicie (os dois pontos de entrada são equivalentes):

```bash
python setup.py
python main.py
# ou
python -m src.gui.factory_calibration_tool
```

> **Opção sem instalação (Windows)**: faça duplo clique em `dist\SO-ARM101-ServoController.exe` — não é necessário Python na máquina de destino. Recompile com `pyinstaller -y SO-ARM101-ServoController.spec`. O mesmo exe também integra todas as ferramentas de linha de comandos (ver a secção 10).

4. Confirme a porta COM no Gestor de Dispositivos (por exemplo `COM3`) e selecione-a na barra superior. Para especificar as portas manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. Instale os tipos de letra CJK e as dependências:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ Adicione permissões de porta série (grupo dialout)** [obrigatório]:

```bash
sudo usermod -a -G dialout $USER
# Tem efeito após terminar e iniciar sessão novamente
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

4. Os dispositivos série são `/dev/ttyUSB0` / `/dev/ttyACM0`. Para os especificar manualmente:

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

3. **⚠️ Nomenclatura das portas série**: no macOS use `/dev/cu.usbserial-*` (**recomendado, não bloqueante**) em vez de `/dev/tty.*`. Para os listar:

```bash
ls /dev/cu.*
```

Para os especificar manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### Ferramentas de linha de comandos gerais (sem GUI necessária)

```bash
# Procurar servos
python -m src.tools.scan_id

# Calibração rápida do centro do servo
python -m src.tools.servo_quick_calibration

# Teste de centro do servo
python -m src.tools.servo_center_test

# Desativar todos os servos
python -m src.tools.servo_disable

# Calibração ao estilo LeRobot
python -m src.tools.lerobot_calibrate

# Controlo remoto sincronizado de dupla porta
python -m src.tools.servo_remote_control
```

---

## 📖 Passos de Utilização

### 1. Ligar e detetar servos

1. Ligue a placa de controlo do braço através de um adaptador USB-série e alimente os servos.
2. Abra a GUI e selecione a porta correspondente na lista pendente de portas série da barra superior (ou clique em `🔄` para atualizar).
3. O cabeçalho do painel mostra `🟢 Connected` e procura automaticamente servos online com IDs no intervalo 1–20 (normalmente 1–6).

> Se a porta for reportada como ocupada, certifique-se de que nenhum outro programa (um monitor série ou uma execução anterior da ferramenta que nunca terminou) a está a ocupar.

### 2. Calibração de centro (braço leader / braço follower)

> Antes de calibrar, coloque fisicamente o braço de modo a que cada articulação esteja na posição "zero / centro" pretendida.

Os botões **Calibração de Centro do Braço Leader** / **Calibração de Centro do Braço Follower** na barra superior abrem o assistente de calibração LeRobot. A janela tem duas colunas: um monitor em tempo real à esquerda (ID / Pos / deslizador para os seis servos) e a tabela de calibração e as ações à direita.

1. Ao ligar, o programa desativa o binário e repõe os servos: o desvio de homing é zerado e os limites de ângulo são abertos para `[0, 4095]` (equivalente ao `reset_calibration` do LeRobot).
2. Clique em **Iniciar registo do centro** — o botão fica laranja e a coluna "Valor central" começa a **acompanhar o Pos em tempo real à esquerda**. Coloque o braço na posição central padrão; quando as leituras estiverem estáveis, clique em **Terminar registo do centro** para fixar os valores e escrevê-los de volta nos servos (o ficheiro guarda o delta `central − 2047`).
3. Clique em **Registar intervalo** — o botão fica verde. **Mova cada articulação de um limite ao outro** (`wrist_roll` é uma articulação de rotação contínua com um intervalo fixo `[0,4095]`; **varra também a garra**). As colunas de mínimo/máximo são atualizadas em tempo real. Clique em **Parar registo de intervalo** quando terminar.
4. Quando as seis articulações estiverem completas, o programa **guarda o ficheiro de calibração automaticamente, substituindo qualquer ficheiro anterior com o mesmo nome**, e escreve os desvios e limites de volta na EEPROM dos servos — para que o LeRobot deixe de pedir para calibrar.

Locais de gravação (IDs fixos):

| Braço | ID do ficheiro de calibração | Caminho |
| --- | --- | --- |
| Leader | `my_leader_arm` | `~/.cache/huggingface/lerobot/calibration/teleoperators/so_leader/my_leader_arm.json` |
| Follower | `my_follower_arm` | `~/.cache/huggingface/lerobot/calibration/robots/so_follower/my_follower_arm.json` |

> Se fechar o assistente antes do fim, é-lhe perguntado se quer guardar o progresso atual; escolher "Sim" também substitui o mesmo ficheiro.
> O botão **🎯 Centro** de cada servo continua a gravar a posição atual desse servo como 2048 (persistido na EEPROM) — é uma operação diferente da calibração integral do braço acima.

> ⚠️ **Varra os dois braços pelo mesmo curso**: a teleoperação normaliza cada braço pelo seu próprio intervalo registado. Se uma articulação for varrida apenas até meio num braço (por exemplo, shoulder_lift registado em 107°) enquanto o outro regista 208°, o follower move-se quase o dobro do leader e as poses de repouso não coincidem. Depois de calibrar, compare a largura dos intervalos dos dois braços e volte a registar qualquer articulação que difira muito.

### 3. Teste de centro

1. Clique em **Teste de Centro do Braço Leader** / **Teste de Centro do Braço Follower**.
2. O programa ativa o binário e move todos os servos para 2048.
3. Se um servo quase não se mover da sua posição atual, a calibração está correta; se se mover muito, o valor de calibração não é fiável e tem de ser refeito.

### 4. Desativar motores (ajuste manual)

- Clique em **Desativar Motores do Braço Leader** / **Desativar Motores do Braço Follower** para desativar o binário de todos os servos dessa porta, para que possam ser rodados livremente à mão.
- Um servo individual pode ser alternado no separador **Controlo de Servo Individual** através do interruptor de binário por baixo do respetivo deslizador.

### 5. Controlo de servo individual (deslizador / Pos)

No separador **🎚️ Controlo de Servo Individual**, cada servo online tem uma linha:

- **Campo Pos**: mostra / aceita uma posição de destino (0–4095). **Editável**, ligado nos dois sentidos ao deslizador.
- **Deslizador**: arrastar atualiza Pos em tempo real; o comando de posição é enviado **ao largar**, não continuamente durante o arrastamento.
- **Introduzir em Pos**: Enter, perda de foco ou os botões de incremento enviam o comando imediatamente; as teclas não são enviadas dígito a dígito.
- **L**: o último destino comandado.
- Enquanto o servo se move, o deslizador e Pos acompanham a **posição real**; não são tomados enquanto está a arrastar ou a introduzir.
- Cada linha tem também **⚡ Binário**, **🎯 Centro** e **🧹 Limpar limites** para esse servo individual.

### 6. Alterar o ID de um servo

1. Abra o separador **🔬 Depurador FT**, ligue a porta série e procure servos.
2. Selecione o servo de destino, altere o valor "Servo ID" (endereço 0x05) na tabela de parâmetros e clique em Escrever.
3. O programa executa então: desbloquear → escrever no endereço 5 → verificar o novo ID → voltar a bloquear.

> ⚠️ Antes de alterar um ID, certifique-se sempre de que este é o único servo no barramento, para evitar conflitos de ID.

### 7. Alterar a velocidade de transmissão / restaurar as predefinições de fábrica

- **Alterar a velocidade de transmissão**: na área "Velocidade de Transmissão / Reposição de Fábrica" do separador Depurador FT, selecione a nova velocidade de transmissão (38400 – 1000000 bps) e aplique-a. Após a escrita, a velocidade de transmissão série muda automaticamente e é verificada com um ping; em caso de falha, é revertida automaticamente.
- **Restaurar as predefinições de fábrica**: o servo volta às predefinições de fábrica (ID=1, velocidade de transmissão=1000000); é necessário voltar a procurar depois.

### 8. Cópia de segurança e restauro de parâmetros xdat

Na área "parâmetros xdat (guardar apenas a EEPROM)" do separador Depurador FT:

1. **💾 Guardar servo atual**: guarda os parâmetros EEPROM do servo selecionado num ficheiro xdat (uma cópia de segurança).
2. Depois de alterar os parâmetros do servo à vontade, se os quiser restaurar:
3. **📂 Abrir xdat**: carrega um ficheiro de cópia de segurança.
4. **📤 Restaurar parâmetros no servo**: escreve a cópia de segurança de volta na EEPROM do servo atual.

### 9. Controlo remoto sincronizado de dupla porta

> ⚠️ **Nota de direção: o braço leader controla o braço follower.** O braço leader (mestre) apenas lê os ângulos dos servos; o braço follower (escravo) é acionado em sincronia.

1. Na barra superior, clique em **🎮 Remoto** (o braço leader lê os ângulos → o braço follower aciona em sincronia os servos com os mesmos IDs).
2. As duas portas têm de usar IDs de servo correspondentes; apenas os servos presentes em ambas são sincronizados.
3. Clique novamente no mesmo botão para parar, após o que as threads de varrimento de ambos os painéis são retomadas automaticamente.

### 10. Calibração LeRobot (linha de comandos)

```bash
# Calibrar o braço follower (guardado em ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Calibrar o braço leader
python -m src.tools.lerobot_calibrate --arm-type leader
```

Procedimento: desativar os servos → repor os parâmetros de calibração (desvio zerado, limites libertados) → posicionar cada articulação no centro e registar `homing_offset` → rodar lentamente por todo o curso para registar `range_min/max` (`wrist_roll` é uma articulação de rotação contínua cujo intervalo está fixado em `[0,4095]`) → escrever os parâmetros de volta nos servos → guardar o JSON.

`homing_offset` é o **delta** no sentido do LeRobot (posição bruta do centro − 2047), não a posição bruta em si.

> Os botões **Calibração de Centro do Braço Leader / Calibração de Centro do Braço Follower** na GUI executam o mesmo procedimento e guardam automaticamente nos IDs fixos ao concluir (ver a secção 2 acima).

Executar até ao centro a partir de um ficheiro de calibração:

```bash
python -m src.tools.run_calibration_middle <calibration_file.json> --mode zero
```

---

## ⚠️ Precauções

1. **Segurança em primeiro lugar**: a calibração de centro é persistida na EEPROM. Antes de calibrar, confirme que a alimentação é estável e que o braço não colidirá com pessoas ou objetos.
2. **Alimentação**: a edição standard do SoARM 101 é melhor alimentada a DC 5V 5A, e a edição Pro a DC 12V 5A. Alimentação insuficiente provoca passos perdidos ou falhas de comunicação.
3. **Porta série exclusiva**: no Windows a porta série é exclusiva, pelo que a mesma porta não pode ser usada simultaneamente pela thread de varrimento da GUI e por um subprocesso de calibração. A ferramenta para a thread de varrimento e termina o processo antigo antes de operar; não clique repetidamente à mão.
4. **Permissões de série no Linux**: o acesso a `/dev/ttyUSB*` / `/dev/ttyACM*` exige adicionar o seu utilizador ao grupo `dialout` (consulte o [Guia do Linux](Linux.md)).
5. **Nomenclatura de série no macOS**: use `/dev/cu.*` (não bloqueante) em vez de `/dev/tty.*` (bloqueante, pode bloquear); consulte o [Guia do macOS](macOS.md).
6. **Ligação a quente**: depois de desligar o cabo USB, o programa tenta reconectar automaticamente; quando este for ligado novamente, clique em `🔄` para atualizar a lista de portas.
7. **Proteção contra sobretemperatura / sobretensão**: o programa monitoriza a tensão e a temperatura (aviso acima de 60°C). Se um servo continuar quente, pare e deixe-o arrefecer.
8. **A calibração de centro é irreversível**: a escrita substitui o desvio original e não pode ser anulada. Registe a posição original antes de calibrar.
9. **Risco na alteração do ID**: se a escrita ou a verificação falhar, o programa comunica um erro e retoma o varrimento, mas, em casos extremos, um servo pode ficar "perdido". Se isso acontecer, experimente "Restaurar as predefinições de fábrica" (após o que o ID volta a 1).
10. **Problemas de codificação**: se os emoji aparecerem corrompidos numa consola Windows, defina `PYTHONIOENCODING=utf-8` antes de executar as ferramentas de linha de comandos. O Linux/macOS usam UTF-8 nativo e normalmente não são afetados.
11. **Manter os intervalos dos dois braços consistentes**: a teleoperação normaliza cada braço pelo seu próprio intervalo registado. Se uma articulação for varrida apenas até meio num braço enquanto o outro é varrido por completo, o movimento do follower é visivelmente maior do que o do leader e as poses de repouso não coincidem. Compare a largura dos intervalos dos dois braços e volte a varrer qualquer articulação que difira muito.
12. **Varra também a garra**: a garra não é uma articulação de rotação contínua. Se a ignorar, o intervalo cai para o valor predefinido `[0,4095]` e o curso de abertura/fecho ficará errado.

---

## 🛠️ Resolução de Problemas

| Sintoma | Causa possível | Solução |
| ---- | -------- | -------- |
| Não é possível abrir a porta série / porta ocupada | Outro programa está a utilizá-la | Feche programas como monitores série ou mude para outra porta e reinicie a ferramenta |
| Nenhum servo encontrado | Alimentação insuficiente / cablagem incorreta / velocidade de transmissão incorreta | Verifique a alimentação e a cablagem e confirme que os servos estão a 1M de velocidade de transmissão |
| Os servos descontrolam-se após a calibração de centro | A posição não foi definida antes de calibrar | Repita "desativar → posicionar à mão → calibração de centro" |
| Temperatura a subir demasiado depressa | Carga excessiva ou uma articulação bloqueada | Verifique se há bloqueio mecânico e reduza a velocidade/aceleração |
| Servo não encontrado após alterar o seu ID | Conflito de ID ou escrita falhada | Restaure as predefinições de fábrica e volte a procurar |
| Controlo remoto dessincronizado | Os IDs das duas portas diferem | Confirme que os servos com os mesmos IDs estão online nas portas mestre e escrava |
| Poses / amplitude desalinhadas durante a teleoperação | Os dois braços registaram larguras de intervalo muito diferentes para alguma articulação | Volte a registar essa articulação ao longo de todo o curso para que ambos os braços coincidam |
| Curso da garra errado | A garra nunca foi varrida; o intervalo é o predefinido `[0,4095]` | Volte a registar e varra a garra de limite a limite |
| Pos não atualiza no assistente de calibração | A porta está ocupada / um servo não responde | Feche o programa que ocupa a porta; confirme que os seis servos estão online |

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
├── main.py                  # Ponto de entrada unificado (GUI / subcomandos --run-tool)
├── SO-ARM101-ServoController.spec   # Configuração de compilação num único ficheiro PyInstaller
├── src/
│   ├── gui/                  # Interface gráfica PySide6
│   │   ├── factory_calibration_tool.py   # Ferramenta principal (calibração de dupla porta + controlo remoto + alternância de idioma)
│   │   ├── ft_debugger.py                # Depurador FT (leitura/escrita de parâmetros / cópia de segurança xdat)
│   │   ├── calibration_wizard.py         # Assistente de calibração LeRobot
│   │   ├── theme_utils.py                # Tema claro
│   │   └── language_dialog.py            # Diálogo de seleção de idioma
│   ├── tools/                # Ferramentas de linha de comandos
│   ├── launcher.py           # Auto-despacho em subprocesso (chamadas de ferramentas no exe compilado)
│   ├── calibration_math.py   # Conversão de homing_offset e codificação sinal-magnitude
│   ├── servo_eeprom.py       # Escrita dos parâmetros de calibração de volta na EEPROM
│   ├── xdat_utils.py         # Leitura/escrita de ficheiros de parâmetros xdat
│   ├── i18n*.py / i18n_translations/     # Internacionalização chinês/inglês
│   ├── port_utils.py         # Deteção de portas série
│   └── calibration_manager.py# Gestão de ficheiros de calibração LeRobot
├── scservo_sdk/              # SDK de comunicação com servos FTServo
├── requirements.txt
└── setup.py                  # Script de verificação do ambiente
```
