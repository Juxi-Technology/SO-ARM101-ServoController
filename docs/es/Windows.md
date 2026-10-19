[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | Español | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# Herramienta de calibración de la serie SoARM — Guía de Windows

Para Windows 10 / 11. Abarca desde la instalación hasta la calibración completa de los servos.

> ⚠️ **Compatibilidad: esta herramienta actualmente solo admite servos Feetech (serie STS3215)**. La tabla de registros y el formato xdat están diseñados para Feetech STS3215; no se garantiza la compatibilidad con otras marcas o modelos.

---

## 1. Requisitos

| Dependencia | Versión | Notas |
|-----------|---------|-------|
| Python | >= 3.8 | Se recomienda 3.10+, descárguelo de [python.org](https://www.python.org/downloads/) |
| PySide6 | >= 6.0 | Framework de interfaz gráfica |
| pyserial | >= 3.5 | Comunicación serie |
| SO | Win10 / Win11 | Cualquier edición |

## 2. Instalar Python

1. Visite <https://www.python.org/downloads/>
2. Descargue el instalador de Python 3.10+
3. **Marque "Add Python to PATH"** durante la instalación (de lo contrario no se encontrará python en la terminal)

Verifique:

```bash
python --version
```

## 3. Instalar las dependencias

Instale en un entorno virtual para no contaminar el Python del sistema:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **Cree el entorno virtual solo UNA VEZ**. Volver a ejecutarlo restablecerá/sobrescribirá el entorno (borrando las dependencias instaladas). Después, basta con activarlo (`activate`) cada vez.

> El indicador mostrará `(.venv)` tras la activación.

## 4. Comprobar el entorno

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目` significa que el entorno está listo.

## 5. Conectar el hardware

1. Conecte el adaptador USB a serie (CH340 / CP2102)
2. Conecte el controlador de servos (placa de control del brazo robótico)
3. Alimente los servos (5V CC 5A versión estándar, 12V CC 5A versión Pro)

Compruebe el puerto COM en el Administrador de dispositivos (`Win+X` → Administrador de dispositivos):

```
Ports (COM & LPT)
  └─ USB-SERIAL CH340 (COM3)     ← su puerto de servo
```

> **Anote el número de COM** para seleccionarlo al iniciar.

## 6. Iniciar la GUI

```bash
python main.py
# o
python -m src.gui.factory_calibration_tool
```

> **Opción sin instalación (Windows)**: haga doble clic en `dist\SO-ARM101-ServoController.exe`; la máquina de destino no necesita Python. Recompílelo con `pyinstaller -y SO-ARM101-ServoController.spec`.

O especifique los puertos (si están ocupados):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

Liste los puertos disponibles:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. Flujo de trabajo de la interfaz

### 7.1 Pestaña de calibración de servos

1. Seleccione el puerto del brazo líder/seguidor en la barra superior → los servos se escanean automáticamente (ID 1-6).
2. Botones habituales:
   - **Calibración de centro del brazo líder/seguidor**: abre el asistente de calibración de LeRobot
     - Columna izquierda: monitor en vivo de los seis servos (ID / Pos / control deslizante)
     - **Iniciar registro del centro** (se vuelve naranja) → coloque el brazo en su centro → **Finalizar registro del centro**
     - **Registrar recorrido** (se vuelve verde) → mueva cada articulación de límite a límite, incluido el gripper → vuelva a hacer clic para detener
     - Cuando las seis articulaciones estén completas, el archivo de calibración se guarda automáticamente y sobrescribe el anterior, y los desplazamientos/límites se escriben de vuelta en la EEPROM del servo
   - **Prueba de centro del brazo líder/seguidor**: activa el par y mueve al centro para verificar
   - **Desactivar motores del brazo líder/seguidor**: desactiva el par para poder moverlo a mano

> ⚠️ Barra ambos brazos sobre el mismo recorrido; de lo contrario, el movimiento del seguidor no coincidirá con el del líder durante la teleoperación.

### 7.2 Pestaña de control de un solo servo

- Cada fila: ID / Pos / control deslizante / L (objetivo)
- **Pos y el control deslizante están vinculados en ambos sentidos**: al arrastrar el control deslizante se actualiza Pos; al escribir en Pos se mueve el control deslizante y se envía la orden inmediatamente
- La orden se envía al soltar el control deslizante, no de forma continua mientras se arrastra
- Mientras el servo se mueve, el control deslizante y Pos siguen la posición real
- ⚡ Par / 🎯 Centro / 🧹 Borrar límites actúan sobre ese servo concreto

### 7.3 Pestaña del depurador FT

- **Conexión serie**: seleccione el puerto y la velocidad en baudios (1M por defecto)
- **Escanear servos**: detecta los servos en línea
- **Leer parámetros**: lee todos los registros (EEPROM + SRAM)
- **Tabla de parámetros**: 5 columnas que muestran los 56 registros, **la selección de fila rellena dirección/longitud/valor de forma vinculada**
- **Ventana emergente de escritura**: verde "✅ Escritura correcta" si tiene éxito, rojo "❌ Escritura fallida" (con el motivo) si falla
- **Control de posición**:
  - **Control deslizante** para ajustar la posición objetivo (0-4095), la caja de valor se actualiza en vivo; o escriba directamente en la caja
  - Tras el movimiento, se le pide desactivar el par
- **Velocidad en baudios / Restablecimiento de fábrica**: cambiar la velocidad en baudios, restablecer los valores de fábrica
- **Parámetros xdat (solo EEPROM)**:
  1. `💾 Guardar servo actual`: guarda los parámetros de EEPROM del servo actual en un archivo xdat
  2. `📂 Abrir xdat`: carga un archivo de copia de seguridad
  3. `📤 Restaurar en el servo`: vuelve a escribir la copia de seguridad en el servo

### 7.4 Control remoto

> ⚠️ **Dirección: el brazo líder controla el brazo seguidor**. El brazo líder (maestro) solo lee los ángulos de los servos, el brazo seguidor (esclavo) se sincroniza. Requiere ID de servo coincidentes en ambos puertos.

- Botón `🎮 Remoto` de la barra superior: el líder lee → el seguidor controla (servos con el mismo ID)
- Vuelva a hacer clic para detener el control remoto

## 8. Solución de problemas

| Problema | Solución |
|---------|----------|
| No hay puerto serie | Compruebe el controlador en el Administrador de dispositivos; pruebe otro puerto USB; instale el controlador CH340 |
| Puerto en uso | Cierre los monitores serie; reinicie la herramienta |
| Texto en chino en blanco | El sistema incluye Microsoft YaHei; instale una fuente CJK si se ve mal |
| No se encuentra el servo | Compruebe la alimentación/cableado; confirme 1M baud |
| PermissionError al abrir el puerto | Asegúrese de que ningún otro proceso use el puerto COM |

## 9. Herramientas de línea de comandos (opcional)

```bash
# Escanear servos
python -m src.tools.scan_id

# Calibración rápida de centro
python -m src.tools.servo_quick_calibration

# Calibración de LeRobot
python -m src.tools.lerobot_calibrate
```
