[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | Português (PT)

# Ferramenta de Calibração da Série SoARM — Guia do Windows

Para Windows 10 / 11. Abrange desde a instalação até à calibração completa dos servos.

> ⚠️ **Compatibilidade: esta ferramenta suporta atualmente apenas servos Feetech (série STS3215)**. A tabela de registos e o formato xdat são concebidos para a Feetech STS3215; não é garantida a compatibilidade com outras marcas/modelos.

---

## 1. Requisitos

| Dependência | Versão | Notas |
|-----------|---------|-------|
| Python | >= 3.8 | 3.10+ recomendado, descarregue em [python.org](https://www.python.org/downloads/) |
| PySide6 | >= 6.0 | Framework de GUI |
| pyserial | >= 3.5 | Comunicação série |
| SO | Win10 / Win11 | Qualquer edição |

## 2. Instalar o Python

1. Visite <https://www.python.org/downloads/>
2. Descarregue o instalador do Python 3.10+
3. **Assinale "Add Python to PATH"** durante a instalação (caso contrário, o python não será encontrado no terminal)

Verifique:

```bash
python --version
```

## 3. Instalar as Dependências

Instale num ambiente virtual para não poluir o Python do sistema:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **Crie o ambiente virtual apenas UMA VEZ**. Executá-lo novamente irá reiniciar/substituir o ambiente (apagando as dependências instaladas). Depois disso, basta `activate`-lo de cada vez.

> O prompt mostrará `(.venv)` após a ativação.

## 4. Verificar o Ambiente

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目` significa que o ambiente está pronto.

## 5. Ligar o Hardware

1. Ligue o adaptador USB-série (CH340 / CP2102)
2. Ligue o controlador dos servos (placa de controlo do braço robótico)
3. Alimente os servos (DC 5V 5A standard, DC 12V 5A Pro)

Verifique a porta COM no Gestor de Dispositivos (`Win+X` → Gestor de Dispositivos):

```
Ports (COM & LPT)
  └─ USB-SERIAL CH340 (COM3)     ← a sua porta do servo
```

> **Anote o número da COM** para a selecionar ao iniciar.

## 6. Iniciar a GUI

```bash
python -m src.gui.factory_calibration_tool
```

Ou especifique as portas (se estiverem ocupadas):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

Listar as portas disponíveis:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. Fluxo da Interface

### 7.1 Separador de Calibração de Servo

1. Selecione Port1/Port2 na barra superior → procure servos automaticamente (ID 1-6)
2. Botões comuns:
   - **Calibração de Centro**: define a posição atual como centro 2048
   - **Teste de Centro**: ativa o binário e move para o centro para verificar
   - **Desativar Servos**: desliga o binário para rotação manual

### 7.2 Separador de Controlo de Servo Individual

- Arraste o deslizador → o servo move-se para a posição de destino ao largar
- O interruptor de binário controla servos individuais

### 7.3 Separador do Depurador FT

- **Ligação Série**: selecione a porta, velocidade de transmissão (1M por predefinição)
- **Procurar Servos**: deteta servos online
- **Ler Parâmetros**: lê todos os registos (EEPROM + SRAM)
- **Tabela de Parâmetros**: 5 colunas que mostram os 56 registos, **a seleção de linha preenche automaticamente endereço/comprimento/valor**
- **Janela de Escrita**: verde "✅ Written successfully" em caso de sucesso, vermelho "❌ Write failed" (com motivo) em caso de falha
- **Controlo de Posição**:
  - **Deslizador** para ajustar a posição de destino (0-4095), a caixa de valor atualiza em tempo real; ou escreva diretamente na caixa
  - Após o movimento, surge um pedido para desligar o binário
- **Velocidade de Transmissão / Reposição de Fábrica**: alterar a velocidade de transmissão, reposição de fábrica
- **Parâmetros xdat (apenas EEPROM)**:
  1. `💾 Save Current Servo`: guarda os parâmetros EEPROM do servo atual num ficheiro xdat
  2. `📂 Open xdat`: carrega um ficheiro de cópia de segurança
  3. `📤 Restore to Servo`: escreve a cópia de segurança de volta no servo

### 7.4 Controlo Remoto

> ⚠️ **Direção: a Port1 controla a Port2**. A Port1 (mestre) apenas lê os ângulos dos servos, a Port2 (escravo) é sincronizada. Requer IDs de servo correspondentes em ambas as portas.

- Botão `🎮 Remote` da barra superior: Port1 lê → Port2 controla (servos com o mesmo ID)
- Clique novamente para parar o controlo remoto

## 8. Resolução de Problemas

| Problema | Solução |
|---------|----------|
| Sem porta série | Verifique o controlador (driver) no Gestor de Dispositivos; experimente outra porta USB; instale o controlador CH340 |
| Porta em uso | Feche os monitores série; reinicie a ferramenta |
| Texto chinês em branco | O sistema tem o Microsoft YaHei; instale um tipo de letra CJK se estiver danificado |
| Servo não encontrado | Verifique a alimentação/cablagem; confirme a velocidade de transmissão de 1M |
| PermissionError ao abrir a porta | Certifique-se de que nenhum outro processo detém a porta COM |

## 9. Ferramentas de Linha de Comandos (Opcional)

```bash
# Procurar servos
python -m src.tools.scan_id

# Calibração de centro rápida
python -m src.tools.servo_quick_calibration

# Calibração LeRobot
python -m src.tools.lerobot_calibrate
```
