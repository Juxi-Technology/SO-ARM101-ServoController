[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | Português (PT)

# Ferramenta de Calibração da Série SoARM — Guia do macOS

Para macOS 11 (Big Sur) e posterior. Pontos-chave: nomenclatura de série (`cu.*` vs `tty.*`), controladores USB.

> ⚠️ **Compatibilidade: esta ferramenta suporta atualmente apenas servos Feetech (série STS3215)**. A tabela de registos e o formato xdat são concebidos para a Feetech STS3215; não é garantida a compatibilidade com outras marcas/modelos.

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
# Instalar o Homebrew se não estiver presente
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar o Python
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

> ⚠️ **Crie o ambiente virtual apenas UMA VEZ**. Executá-lo novamente irá reiniciar/substituir o ambiente (apagando as dependências instaladas). Depois disso, basta `source .venv/bin/activate`.

## 4. ⚠️ Nomenclatura de Série no macOS [Importante]

O macOS coloca os dispositivos série USB em `/dev` com **duas convenções de nomenclatura**:

| Prefixo | Significado | Utilizável |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | estilo modem (bloqueante) | pode bloquear, não recomendado |
| `/dev/cu.usbserial-*` | estilo call/terminal (**não bloqueante**) | ✅ recomendado |

**Encontre a sua porta:**

```bash
ls /dev/cu.*
```

Saída típica:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # série USB integrada (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> A ferramenta prefere automaticamente os dispositivos `cu.*`. Se especificar uma porta manualmente, use `cu.` e não `tty.`.

## 5. Controladores USB

Os chips mais comuns (CH340, CP2102, FTDI) têm controladores macOS incorporados. Se o dispositivo não for reconhecido:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**: os lotes mais antigos precisam do controlador oficial da WCH
- Em geral, basta que `ls /dev/cu.*` mostre o dispositivo

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

Especificar portas:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> Quando existe apenas uma porta série, a segunda porta é desativada automaticamente.

## 8. Fluxo da Interface

### 8.1 Separador de Calibração de Servo
Selecione a porta do braço leader/follower; os servos são procurados automaticamente.

- A calibração de centro abre o assistente de calibração LeRobot: monitor em tempo real à esquerda (ID / Pos / deslizador), tabela de calibração à direita.
- **Iniciar registo do centro** → coloque o braço no centro → **Terminar registo do centro**; depois **Registar intervalo** (fica verde) → varra cada articulação de limite a limite, incluindo a garra → clique novamente para parar.
- Quando as seis articulações estiverem completas, o ficheiro de calibração é guardado automaticamente e substitui o anterior.

> ⚠️ Varra os dois braços pelo mesmo curso, caso contrário o movimento do follower não coincidirá com o do leader.

### 8.2 Separador de Controlo de Servo Individual
- Cada linha: ID / Pos / deslizador / L (destino)
- **Pos e o deslizador estão ligados nos dois sentidos**: arrastar atualiza Pos; introduzir em Pos move o deslizador e envia o comando imediatamente
- O comando é enviado ao largar, não durante o arrastamento

### 8.3 Separador do Depurador FT
- Ligação série (1M por predefinição), procurar servos
- Ler todos os registos, tabela de parâmetros (56 registos), a seleção de linha preenche automaticamente endereço/comprimento/valor
- Janela de escrita: verde para sucesso / vermelho para falha (com motivo)
- Controlo de posição: deslizador (0-4095) sincronizado com a caixa de valor
- Velocidade de transmissão / reposição de fábrica
- Parâmetros xdat (apenas EEPROM): guardar → abrir → restaurar

### 8.4 Controlo Remoto

> ⚠️ **Direção: o braço leader controla o braço follower**. O braço leader (mestre) lê os ângulos; o braço follower (escravo) é sincronizado. Requer IDs correspondentes em ambas as portas.

Barra superior `🎮 Remoto`: o leader lê → o follower controla (servos com o mesmo ID em ambas as portas)

## 9. Resolução de Problemas

| Problema | Solução |
|---------|----------|
| Porta com `tty.` bloqueia | Use o prefixo `cu.` |
| Dispositivo não encontrado | `ls /dev/cu.*`; volte a ligar; `system_profiler SPUSBDataType` |
| Interface chinesa em branco | O PingFang do sistema costuma ser suficiente; instale o Noto Sans CJK se estiver danificado |
| Falha na ativação do venv | `source .venv/bin/activate` (não `.bat`) |
| Erro de compilação no Apple Silicon | O Python 3.10+ é nativo; evite o Python antigo com Rosetta |

## 10. Ferramentas de Linha de Comandos (Opcional)

```bash
# Procurar servos
python -m src.tools.scan_id

# Calibração LeRobot
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. Dicas

- **O nome da porta muda**: os nomes `cu.*` podem variar com portas USB diferentes; selecione na lista pendente em cada arranque
- **Suspensão**: o macOS pode suspender e perder a porta série; mantenha-o acordado durante a operação
- **Permissão de privacidade**: se lhe for pedido para "aceder a discos amovíveis", autorize
