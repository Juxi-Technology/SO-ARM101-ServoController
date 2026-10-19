[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | Português (BR) | [Português (PT)](../pt-pt/Linux.md)

# Ferramenta de Calibração da Série SoARM — Guia do Linux

Para Ubuntu / Debian / outras distribuições populares. Pontos-chave: permissões seriais (dialout), detecção de dispositivo USB-serial.

> ⚠️ **Compatibilidade: no momento, esta ferramenta suporta apenas servos Feetech (série STS3215)**. A tabela de registradores e o formato xdat foram projetados para o Feetech STS3215; outras marcas/modelos não têm garantia.

---

## 1. Requisitos

| Dependência | Versão |
|-----------|---------|
| Python | >= 3.8 (3.10+ recomendado) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| SO | Ubuntu 20.04+ / Debian 11+ |

Fontes chinesas (necessárias para a interface em chinês):

```bash
sudo apt install fonts-noto-cjk
```

Fontes de ícones emoji (para ✅⚠️ etc. nos logs):

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

> ⚠️ **Crie o ambiente virtual apenas UMA VEZ**. Executá-lo novamente vai redefinir/sobrescrever o ambiente (apagando as dependências instaladas). Depois disso, basta `source .venv/bin/activate`.

> Se o pip reportar "externally-managed-environment", use um venv ou `pip install --break-system-packages -r requirements.txt`.

## 3. ⚠️ Permissão Serial (dialout) [Obrigatório]

Por padrão, usuários comuns **não conseguem acessar** `/dev/ttyUSB*` / `/dev/ttyACM*`. Adicione seu usuário ao grupo `dialout`:

```bash
sudo usermod -a -G dialout $USER
```

**Saia e entre novamente** (ou reinicie). Verifique:

```bash
groups
# a saída deve incluir dialout
```

> Algumas distribuições usam `uucp` (Arch) ou `tty`.

## 4. Identificar o Dispositivo Serial USB

Após conectar:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

Saída típica:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # serial USB nativa (Arduino/ESP32 embarcado)
```

Ver informações detalhadas do fabricante:

```bash
dmesg | tail -20 | grep -i tty
# ou
lsusb
```

> Com vários dispositivos, ttyUSB0/ttyUSB1 são atribuídos na ordem de conexão e podem ficar instáveis. Recomenda-se **usar `/dev/ttyACM*` ou fixar por fabricante**.

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

Especificar as portas:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> Se houver apenas uma porta serial, a ferramenta define automaticamente a segunda porta como "desabilitada".

## 7. Fluxo de Trabalho da Interface

### 7.1 Aba de Calibração de Servos
Selecione a porta do braço líder/seguidor; os servos são varridos automaticamente.

- A calibração central abre o assistente de calibração LeRobot: monitor ao vivo à esquerda (ID / Pos / controle deslizante), tabela de calibração à direita.
- **Iniciar gravação do centro** → posicione o braço no centro → **Concluir gravação do centro**; depois **Registrar faixa** (fica verde) → percorra cada junta de um limite ao outro, incluindo a garra → clique novamente para parar.
- Quando as seis juntas estiverem completas, o arquivo de calibração é salvo automaticamente e sobrescreve o anterior.

> ⚠️ Percorra os dois braços na mesma faixa de movimento, caso contrário o movimento do seguidor não vai coincidir com o do líder.

### 7.2 Aba de Controle de Servo Único
Cada linha: ID / Pos / controle deslizante / L (alvo). **Pos e o controle deslizante são vinculados nos dois sentidos**: arrastar atualiza o Pos; digitar em Pos move o controle deslizante e envia o comando imediatamente. O comando é enviado ao soltar, não durante o arraste.

### 7.3 Aba do Depurador FT
- Conexão serial (1M por padrão), varredura de servos
- Ler todos os registradores, tabela de parâmetros (56 registradores), a seleção de linha preenche endereço/comprimento/valor
- Popup de gravação: verde sucesso / vermelho falha (com motivo)
- Controle de posição: controle deslizante (0-4095) com caixa de valor sincronizada
- Baud rate / reset de fábrica
- Parâmetros xdat (apenas EEPROM): salvar → abrir → restaurar

### 7.4 Controle Remoto

> ⚠️ **Direção: o braço líder controla o braço seguidor**. O braço líder (mestre) lê os ângulos; o braço seguidor (escravo) é sincronizado. Requer IDs correspondentes nas duas portas.

Barra superior `🎮 Remoto`: o líder lê → o seguidor controla (servos com o mesmo ID nas duas portas)

## 8. Solução de Problemas

| Problema | Solução |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | Não está no grupo dialout, veja a seção 3; ou `sudo chmod 666 /dev/ttyUSB0` (temporário) |
| Sem porta serial | `ls /dev/ttyUSB* /dev/ttyACM*`; `lsusb` para confirmar o dispositivo |
| O nome do dispositivo muda | A numeração ttyUSB depende da ordem de conexão; use uma regra udev ou selecione a cada inicialização |
| Interface em chinês em branco | Instale `fonts-noto-cjk` |
| Emoji aparece como quadrados | Instale `fonts-noto-color-emoji` |
| Falha no pip install | Use venv; ou `--break-system-packages` |

## 9. Ferramentas de Linha de Comando (Opcional)

```bash
# Varre servos
python -m src.tools.scan_id

# Calibração LeRobot
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. Avançado: Nome de Dispositivo Fixo via udev (Opcional)

Crie `/etc/udev/rules.d/99-servo.rules` para fixar o nome do dispositivo pelo ID USB:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

Depois `ls -l /dev/ttyServo`. Obtenha o ID do fornecedor com `lsusb`.
