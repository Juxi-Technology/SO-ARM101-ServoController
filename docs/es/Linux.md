[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | Español | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# Herramienta de calibración de la serie SoARM — Guía de Linux

Para Ubuntu / Debian / otras distribuciones principales. Puntos clave: permisos de puerto serie (dialout), detección de dispositivos USB a serie.

> ⚠️ **Compatibilidad: esta herramienta actualmente solo admite servos Feetech (serie STS3215)**. La tabla de registros y el formato xdat están diseñados para Feetech STS3215; no se garantiza la compatibilidad con otras marcas o modelos.

---

## 1. Requisitos

| Dependencia | Versión |
|-----------|---------|
| Python | >= 3.8 (se recomienda 3.10+) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| SO | Ubuntu 20.04+ / Debian 11+ |

Fuentes chinas (necesarias para la interfaz en chino):

```bash
sudo apt install fonts-noto-cjk
```

Fuentes de iconos emoji (para ✅⚠️ etc. en los registros):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Instalar las dependencias de Python

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Cree el entorno virtual solo UNA VEZ**. Volver a ejecutarlo restablecerá/sobrescribirá el entorno (borrando las dependencias instaladas). Después, basta con `source .venv/bin/activate`.

> Si pip indica "externally-managed-environment", use un entorno virtual o `pip install --break-system-packages -r requirements.txt`.

## 3. ⚠️ Permisos de puerto serie (dialout) [Obligatorio]

Por defecto, los usuarios normales **no pueden acceder** a `/dev/ttyUSB*` / `/dev/ttyACM*`. Añada su usuario al grupo `dialout`:

```bash
sudo usermod -a -G dialout $USER
```

**Cierre la sesión y vuelva a iniciarla** (o reinicie). Verifique:

```bash
groups
# la salida debe incluir dialout
```

> Algunas distribuciones usan `uucp` (Arch) o `tty`.

## 4. Identificar el dispositivo serie USB

Tras conectarlo:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

Salida típica:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # serie USB nativa (integrada en Arduino/ESP32)
```

Ver información detallada del fabricante:

```bash
dmesg | tail -20 | grep -i tty
# o
lsusb
```

> Con varios dispositivos, ttyUSB0/ttyUSB1 se asignan según el orden de conexión y pueden ser inestables. Se recomienda **usar `/dev/ttyACM*` o fijarlos por fabricante**.

## 5. Comprobar el entorno

```bash
python setup.py
```

## 6. Iniciar la GUI

```bash
python main.py
# o
python -m src.gui.factory_calibration_tool
```

Especificar puertos:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> Si solo hay un puerto serie, la herramienta establece automáticamente el segundo puerto como "deshabilitado".

## 7. Flujo de trabajo de la interfaz

### 7.1 Pestaña de calibración de servos
Seleccione el puerto del brazo líder/seguidor; los servos se escanean automáticamente.

- La calibración de centro abre el asistente de calibración de LeRobot: monitor en vivo a la izquierda (ID / Pos / control deslizante), tabla de calibración a la derecha.
- **Iniciar registro del centro** → coloque el brazo en su centro → **Finalizar registro del centro**; después **Registrar recorrido** (se vuelve verde) → mueva cada articulación de límite a límite, incluido el gripper → vuelva a hacer clic para detener.
- Cuando las seis articulaciones estén completas, el archivo de calibración se guarda automáticamente y sobrescribe el anterior.

> ⚠️ Barra ambos brazos sobre el mismo recorrido; de lo contrario, el movimiento del seguidor no coincidirá con el del líder.

### 7.2 Pestaña de control de un solo servo
Cada fila: ID / Pos / control deslizante / L (objetivo). **Pos y el control deslizante están vinculados en ambos sentidos**: al arrastrar se actualiza Pos; al escribir en Pos se mueve el control deslizante y se envía la orden inmediatamente. La orden se envía al soltar, no mientras se arrastra.

### 7.3 Pestaña del depurador FT
- Conexión serie (1M por defecto), escanear servos
- Leer todos los registros, tabla de parámetros (56 registros), la selección de fila rellena dirección/longitud/valor de forma vinculada
- Ventana emergente de escritura: verde éxito / rojo fallo (con motivo)
- Control de posición: control deslizante (0-4095) con caja de valor sincronizada
- Velocidad en baudios / restablecimiento de fábrica
- Parámetros xdat (solo EEPROM): guardar → abrir → restaurar

### 7.4 Control remoto

> ⚠️ **Dirección: el brazo líder controla el brazo seguidor**. El brazo líder (maestro) lee los ángulos, el brazo seguidor (esclavo) se sincroniza. Requiere ID coincidentes en ambos puertos.

Barra superior `🎮 Remoto`: el líder lee → el seguidor controla (se requiere el mismo ID de servo en ambos puertos)

## 8. Solución de problemas

| Problema | Solución |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | No está en el grupo dialout, consulte la sección 3; o `sudo chmod 666 /dev/ttyUSB0` (temporal) |
| No hay puerto serie | `ls /dev/ttyUSB* /dev/ttyACM*`; `lsusb` para confirmar el dispositivo |
| El nombre del dispositivo cambia | La numeración de ttyUSB depende del orden de conexión; use una regla udev o seleccione el puerto en cada inicio |
| Interfaz en chino en blanco | Instale `fonts-noto-cjk` |
| Los emoji se ven como cuadros | Instale `fonts-noto-color-emoji` |
| Falla `pip install` | Use un entorno virtual; o `--break-system-packages` |

## 9. Herramientas de línea de comandos (opcional)

```bash
# Escanear servos
python -m src.tools.scan_id

# Calibración de LeRobot
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. Avanzado: nombre de dispositivo fijo con udev (opcional)

Cree `/etc/udev/rules.d/99-servo.rules` para fijar el nombre del dispositivo por ID de USB:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

Después, `ls -l /dev/ttyServo`. Obtenga el ID del fabricante con `lsusb`.
