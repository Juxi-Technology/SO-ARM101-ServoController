[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | Português (BR) | [Português (PT)](../pt-pt/macOS.md)

# Ferramenta de Calibração da Série SoARM — Guia do macOS

Para macOS 11 (Big Sur) e posteriores. Pontos-chave: nomenclatura serial (`cu.*` vs `tty.*`), drivers USB.

> ⚠️ **Compatibilidade: no momento, esta ferramenta suporta apenas servos Feetech (série STS3215)**. A tabela de registradores e o formato xdat foram projetados para o Feetech STS3215; outras marcas/modelos não têm garantia.

---

## 1. Requisitos

| Dependência | Versão |
|-----------|---------|
| Python | >= 3.8 (3.10+ recomendado, via Homebrew) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| SO | macOS 11+ (Apple Silicon / Intel) |

## 2. Instalar o Python

Recomendado via Homebrew:

```bash
# Instale o Homebrew caso não o tenha
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instale o Python
brew install python
```

Verifique:

```bash
python3 --version
```

## 3. Instalar as Dependências

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Crie o ambiente virtual apenas UMA VEZ**. Executá-lo novamente vai redefinir/sobrescrever o ambiente (apagando as dependências instaladas). Depois disso, basta `source .venv/bin/activate`.

## 4. ⚠️ Nomenclatura Serial no macOS [Importante]

O macOS coloca os dispositivos seriais USB em `/dev` com **duas convenções de nomenclatura**:

| Prefixo | Significado | Utilizável |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | estilo modem (bloqueante) | pode travar, não recomendado |
| `/dev/cu.usbserial-*` | estilo call/terminal (**não bloqueante**) | ✅ recomendado |

**Encontre a sua porta:**

```bash
ls /dev/cu.*
```

Saída típica:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # serial USB embarcada (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> A ferramenta prefere automaticamente dispositivos `cu.*`. Se especificar uma porta manualmente, use `cu.` e não `tty.`.

## 5. Drivers USB

Os chips mais comuns (CH340, CP2102, FTDI) têm drivers integrados no macOS. Se o dispositivo não for reconhecido:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**: lotes mais antigos precisam do driver oficial da WCH
- Em geral, `ls /dev/cu.*` mostrando o dispositivo já basta

## 6. Verificar o Ambiente

```bash
python setup.py
```

## 7. Iniciar a GUI

```bash
python main.py
# ou
python -m src.gui.factory_calibration_tool
```

Especifique as portas:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> Quando houver apenas uma porta serial, a segunda porta é desabilitada automaticamente.

## 8. Fluxo de Trabalho da Interface

### 8.1 Aba de Calibração de Servos
Selecione a porta do braço líder/seguidor; os servos são varridos automaticamente.

- A calibração central abre o assistente de calibração LeRobot: monitor ao vivo à esquerda (ID / Pos / controle deslizante), tabela de calibração à direita.
- **Iniciar gravação do centro** → posicione o braço no centro → **Concluir gravação do centro**; depois **Registrar faixa** (fica verde) → percorra cada junta de um limite ao outro, incluindo a garra → clique novamente para parar.
- Quando as seis juntas estiverem completas, o arquivo de calibração é salvo automaticamente e sobrescreve o anterior.

> ⚠️ Percorra os dois braços na mesma faixa de movimento, caso contrário o movimento do seguidor não vai coincidir com o do líder.

### 8.2 Aba de Controle de Servo Único
- Cada linha: ID / Pos / controle deslizante / L (alvo)
- **Pos e o controle deslizante são vinculados nos dois sentidos**: arrastar atualiza o Pos; digitar em Pos move o controle deslizante e envia o comando imediatamente
- O comando é enviado ao soltar, não durante o arraste

### 8.3 Aba do Depurador FT
- Conexão serial (1M por padrão), varredura de servos
- Ler todos os registradores, tabela de parâmetros (56 registradores), a seleção de linha preenche endereço/comprimento/valor
- Popup de gravação: verde sucesso / vermelho falha (com motivo)
- Controle de posição: controle deslizante (0-4095) com caixa de valor sincronizada
- Baud rate / reset de fábrica
- Parâmetros xdat (apenas EEPROM): salvar → abrir → restaurar

### 8.4 Controle Remoto

> ⚠️ **Direção: o braço líder controla o braço seguidor**. O braço líder (mestre) lê os ângulos; o braço seguidor (escravo) é sincronizado. Requer IDs correspondentes nas duas portas.

Barra superior `🎮 Remoto`: o líder lê → o seguidor controla (servos com o mesmo ID nas duas portas)

## 9. Solução de Problemas

| Problema | Solução |
|---------|----------|
| Porta com `tty.` trava | Use o prefixo `cu.` em vez disso |
| Dispositivo não encontrado | `ls /dev/cu.*`; reconecte; `system_profiler SPUSBDataType` |
| Interface em chinês em branco | A PingFang do sistema normalmente basta; instale Noto Sans CJK se estiver quebrado |
| Falha ao ativar o venv | `source .venv/bin/activate` (não `.bat`) |
| Erro de build no Apple Silicon | O Python 3.10+ é nativo; evite o Python antigo via Rosetta |

## 10. Ferramentas de Linha de Comando (Opcional)

```bash
# Varre servos
python -m src.tools.scan_id

# Calibração LeRobot
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. Dicas

- **Mudança do nome da porta**: os nomes `cu.*` podem variar conforme a porta USB; selecione no menu suspenso a cada inicialização
- **Suspensão**: o macOS pode suspender e derrubar a serial; mantenha-o acordado durante a operação
- **Permissão de privacidade**: se for solicitado "acessar discos removíveis", permita
