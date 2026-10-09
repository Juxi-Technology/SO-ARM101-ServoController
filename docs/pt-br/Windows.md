[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | Português (BR) | [Português (PT)](../pt-pt/Windows.md)

# Ferramenta de Calibração da Série SoARM — Guia do Windows

Para Windows 10 / 11. Cobre desde a instalação até a calibração completa dos servos.

> ⚠️ **Compatibilidade: no momento, esta ferramenta suporta apenas servos Feetech (série STS3215)**. A tabela de registradores e o formato xdat foram projetados para o Feetech STS3215; outras marcas/modelos não têm garantia.

---

## 1. Requisitos

| Dependência | Versão | Observações |
|-----------|---------|-------|
| Python | >= 3.8 | 3.10+ recomendado, baixe em [python.org](https://www.python.org/downloads/) |
| PySide6 | >= 6.0 | Framework de GUI |
| pyserial | >= 3.5 | Comunicação serial |
| SO | Win10 / Win11 | Qualquer edição |

## 2. Instalar o Python

1. Acesse <https://www.python.org/downloads/>
2. Baixe o instalador do Python 3.10+
3. **Marque "Add Python to PATH"** durante a instalação (caso contrário o python não será encontrado no terminal)

Verifique:

```bash
python --version
```

## 3. Instalar as Dependências

Instale em um ambiente virtual para não poluir o Python do sistema:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **Crie o ambiente virtual apenas UMA VEZ**. Executá-lo novamente vai redefinir/sobrescrever o ambiente (apagando as dependências instaladas). Depois disso, basta ativá-lo (`activate`) a cada vez.

> O prompt mostrará `(.venv)` após a ativação.

## 4. Verificar o Ambiente

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目` significa que o ambiente está pronto.

## 5. Conectar o Hardware

1. Conecte o adaptador USB-serial (CH340 / CP2102)
2. Conecte o controlador de servos (placa de controle do braço robótico)
3. Alimente os servos (DC 5V 5A padrão, DC 12V 5A Pro)

Verifique a porta COM no Gerenciador de Dispositivos (`Win+X` → Gerenciador de Dispositivos):

```
Portas (COM e LPT)
  └─ USB-SERIAL CH340 (COM3)     ← a sua porta do servo
```

> **Anote o número da COM** para selecioná-la ao iniciar.

## 6. Iniciar a GUI

```bash
python -m src.gui.factory_calibration_tool
```

Ou especifique as portas (se estiverem ocupadas):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

Liste as portas disponíveis:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. Fluxo de Trabalho da Interface

### 7.1 Aba de Calibração de Servos

1. Selecione Port1/Port2 na barra superior → varredura automática dos servos (ID 1-6)
2. Botões comuns:
   - **Calibração do Meio**: define a posição atual como o centro 2048
   - **Teste do Meio**: habilita o torque e move até o centro para verificar
   - **Desabilitar Servos**: desliga o torque para rotação manual

### 7.2 Aba de Controle de Servo Único

- Arraste o controle deslizante → o servo se move até a posição alvo ao soltar
- A chave de torque controla servos individuais

### 7.3 Aba do Depurador FT

- **Conexão Serial**: selecione a porta, o baud rate (padrão 1M)
- **Varrer Servos**: detecta servos online
- **Ler Parâmetros**: lê todos os registradores (EEPROM + SRAM)
- **Tabela de Parâmetros**: 5 colunas mostrando todos os 56 registradores, **a seleção de linha preenche endereço/comprimento/valor**
- **Popup de Gravação**: verde "✅ Gravado com sucesso" em caso de sucesso, vermelho "❌ Falha na gravação" (com motivo) em caso de falha
- **Controle de Posição**:
  - **Controle deslizante** para ajustar a posição alvo (0-4095), a caixa de valor é atualizada ao vivo; ou digite diretamente na caixa
  - Após o movimento, solicita desligar o torque
- **Baud Rate / Reset de Fábrica**: alterar o baud rate, reset de fábrica
- **Parâmetros xdat (apenas EEPROM)**:
  1. `💾 Salvar Servo Atual`: salva os parâmetros de EEPROM do servo atual em um arquivo xdat
  2. `📂 Abrir xdat`: carrega um arquivo de backup
  3. `📤 Restaurar no Servo`: grava o backup de volta no servo

### 7.4 Controle Remoto

> ⚠️ **Direção: a Porta1 controla a Porta2**. A Porta1 (mestre) apenas lê os ângulos dos servos, a Porta2 (escrava) é sincronizada. Requer IDs de servo correspondentes nas duas portas.

- Botão `🎮 Remoto` na barra superior: a Porta1 lê → a Porta2 controla (servos com o mesmo ID)
- Clique novamente para parar o controle remoto

## 8. Solução de Problemas

| Problema | Solução |
|---------|----------|
| Sem porta serial | Verifique o driver no Gerenciador de Dispositivos; tente outra porta USB; instale o driver CH340 |
| Porta em uso | Feche monitores seriais; reinicie a ferramenta |
| Texto em chinês em branco | O sistema tem o Microsoft YaHei; instale uma fonte CJK se estiver quebrado |
| Servo não encontrado | Verifique alimentação/fiação; confirme 1M de baud |
| PermissionError ao abrir a porta | Certifique-se de que nenhum outro processo esteja segurando a porta COM |

## 9. Ferramentas de Linha de Comando (Opcional)

```bash
# Varre servos
python -m src.tools.scan_id

# Calibração rápida do meio
python -m src.tools.servo_quick_calibration

# Calibração LeRobot
python -m src.tools.lerobot_calibrate
```
