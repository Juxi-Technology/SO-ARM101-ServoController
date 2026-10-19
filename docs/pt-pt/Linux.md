[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | Português (PT)

# Ferramenta de Calibração da Série SoARM — Guia do Linux

Para Ubuntu / Debian / outras distribuições populares. Pontos-chave: permissões de série (dialout), deteção de dispositivos USB-série.

> ⚠️ **Compatibilidade: esta ferramenta suporta atualmente apenas servos Feetech (série STS3215)**. A tabela de registos e o formato xdat são concebidos para a Feetech STS3215; não é garantida a compatibilidade com outras marcas/modelos.

---

## 1. Requisitos

| Dependência | Versão |
|-----------|---------|
| Python | >= 3.8 (3.10+ recomendado) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| SO | Ubuntu 20.04+ / Debian 11+ |

Tipos de letra chineses (necessários para a interface em chinês):

```bash
sudo apt install fonts-noto-cjk
```

Tipos de letra de ícones emoji (para ✅⚠️, etc., nos registos):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Instalar as Dependências do Python

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Crie o ambiente virtual apenas UMA VEZ**. Executá-lo novamente irá reiniciar/substituir o ambiente (apagando as dependências instaladas). Depois disso, basta `source .venv/bin/activate`.

> Se o pip reportar "externally-managed-environment", use um venv ou `pip install --break-system-packages -r requirements.txt`.

## 3. ⚠️ Permissão de Série (dialout) [Obrigatório]

Por predefinição, os utilizadores normais **não conseguem aceder** a `/dev/ttyUSB*` / `/dev/ttyACM*`. Adicione o seu utilizador ao grupo `dialout`:

```bash
sudo usermod -a -G dialout $USER
```

**Termine e inicie sessão novamente** (ou reinicie). Verifique:

```bash
groups
# a saída deve incluir dialout
```

> Algumas distribuições usam `uucp` (Arch) ou `tty`.

## 4. Identificar o Dispositivo Série USB

Depois de ligar:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

Saída típica:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # série USB nativa (Arduino/ESP32 integrado)
```

Ver informações detalhadas do fabricante:

```bash
dmesg | tail -20 | grep -i tty
# ou
lsusb
```

> Com vários dispositivos, os ttyUSB0/ttyUSB1 são atribuídos pela ordem de ligação e podem ser instáveis. Recomenda-se **utilizar `/dev/ttyACM*` ou fixar pelo fabricante**.

## 5. Verificar o Ambiente

```bash
python setup.py
```

## 6. Iniciar a GUI

```bash
python main.py
# ou
python -m src.gui.factory_calibration_tool
```

Especificar portas:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> Se existir apenas uma porta série, a ferramenta define automaticamente a segunda porta como "desativada".

## 7. Fluxo da Interface

### 7.1 Separador de Calibração de Servo
Selecione a porta do braço leader/follower; os servos são procurados automaticamente.

- A calibração de centro abre o assistente de calibração LeRobot: monitor em tempo real à esquerda (ID / Pos / deslizador), tabela de calibração à direita.
- **Iniciar registo do centro** → coloque o braço no centro → **Terminar registo do centro**; depois **Registar intervalo** (fica verde) → varra cada articulação de limite a limite, incluindo a garra → clique novamente para parar.
- Quando as seis articulações estiverem completas, o ficheiro de calibração é guardado automaticamente e substitui o anterior.

> ⚠️ Varra os dois braços pelo mesmo curso, caso contrário o movimento do follower não coincidirá com o do leader.

### 7.2 Separador de Controlo de Servo Individual
Cada linha: ID / Pos / deslizador / L (destino). **Pos e o deslizador estão ligados nos dois sentidos**: arrastar atualiza Pos; introduzir em Pos move o deslizador e envia o comando imediatamente. O comando é enviado ao largar, não durante o arrastamento.

### 7.3 Separador do Depurador FT
- Ligação série (1M por predefinição), procurar servos
- Ler todos os registos, tabela de parâmetros (56 registos), a seleção de linha preenche automaticamente endereço/comprimento/valor
- Janela de escrita: verde para sucesso / vermelho para falha (com motivo)
- Controlo de posição: deslizador (0-4095) sincronizado com a caixa de valor
- Velocidade de transmissão / reposição de fábrica
- Parâmetros xdat (apenas EEPROM): guardar → abrir → restaurar

### 7.4 Controlo Remoto

> ⚠️ **Direção: o braço leader controla o braço follower**. O braço leader (mestre) lê os ângulos; o braço follower (escravo) é sincronizado. Requer IDs correspondentes em ambas as portas.

Barra superior `🎮 Remoto`: o leader lê → o follower controla (servos com o mesmo ID em ambas as portas)

## 8. Resolução de Problemas

| Problema | Solução |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | Não está no grupo dialout, ver a secção 3; ou `sudo chmod 666 /dev/ttyUSB0` (temporário) |
| Sem porta série | `ls /dev/ttyUSB* /dev/ttyACM*`; `lsusb` para confirmar o dispositivo |
| O nome do dispositivo muda | A numeração ttyUSB depende da ordem de ligação; use uma regra udev ou selecione em cada arranque |
| Interface chinesa em branco | Instale `fonts-noto-cjk` |
| Emoji aparece como quadrados | Instale `fonts-noto-color-emoji` |
| Falha no pip install | Use um venv; ou `--break-system-packages` |

## 9. Ferramentas de Linha de Comandos (Opcional)

```bash
# Procurar servos
python -m src.tools.scan_id

# Calibração LeRobot
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. Avançado: Nome de Dispositivo Fixo via udev (Opcional)

Crie `/etc/udev/rules.d/99-servo.rules` para fixar o nome do dispositivo pelo ID USB:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

Depois `ls -l /dev/ttyServo`. Obtenha o ID do fabricante com `lsusb`.
