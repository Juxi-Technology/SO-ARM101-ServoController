[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | Español | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# Herramienta de calibración de la serie SoARM — Guía de macOS

Para macOS 11 (Big Sur) y posteriores. Puntos clave: nomenclatura de puertos serie (`cu.*` frente a `tty.*`), controladores USB.

> ⚠️ **Compatibilidad: esta herramienta actualmente solo admite servos Feetech (serie STS3215)**. La tabla de registros y el formato xdat están diseñados para Feetech STS3215; no se garantiza la compatibilidad con otras marcas o modelos.

---

## 1. Requisitos

| Dependencia | Versión |
|-----------|---------|
| Python | >= 3.8 (se recomienda 3.10+, mediante Homebrew) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| SO | macOS 11+ (Apple Silicon / Intel) |

## 2. Instalar Python

Se recomienda hacerlo mediante Homebrew:

```bash
# Instale Homebrew si no lo tiene
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instale Python
brew install python
```

Verifique:

```bash
python3 --version
```

## 3. Instalar las dependencias

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Cree el entorno virtual solo UNA VEZ**. Volver a ejecutarlo restablecerá/sobrescribirá el entorno (borrando las dependencias instaladas). Después, basta con `source .venv/bin/activate`.

## 4. ⚠️ Nomenclatura de puertos serie en macOS [Clave]

macOS coloca los dispositivos serie USB en `/dev` con **dos convenciones de nombres**:

| Prefijo | Significado | Utilizable |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | estilo módem (con bloqueo) | puede colgarse, no recomendado |
| `/dev/cu.usbserial-*` | estilo llamada/terminal (**sin bloqueo**) | ✅ recomendado |

**Encuentre su puerto:**

```bash
ls /dev/cu.*
```

Salida típica:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # serie USB integrada (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> La herramienta prefiere automáticamente los dispositivos `cu.*`. Si especifica un puerto manualmente, use `cu.`, no `tty.`.

## 5. Controladores USB

Los chips más habituales (CH340, CP2102, FTDI) tienen controladores integrados en macOS. Si el dispositivo no se reconoce:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**: las tandas más antiguas necesitan el controlador oficial de WCH
- Por lo general, basta con que `ls /dev/cu.*` muestre el dispositivo

## 6. Comprobar el entorno

```bash
python setup.py
```

## 7. Iniciar la GUI

```bash
python -m src.gui.factory_calibration_tool
```

Especificar puertos:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> Cuando solo hay un puerto serie, el segundo puerto se deshabilita automáticamente.

## 8. Flujo de trabajo de la interfaz

### 8.1 Pestaña de calibración de servos
Seleccione el puerto y escanee los servos automáticamente; calibración de centro / prueba de centro / desactivar servos.

### 8.2 Pestaña de control de un solo servo
Control de posición con control deslizante, interruptor de par.

### 8.3 Pestaña del depurador FT
- Conexión serie (1M por defecto), escanear servos
- Leer todos los registros, tabla de parámetros (56 registros), la selección de fila rellena dirección/longitud/valor de forma vinculada
- Ventana emergente de escritura: verde éxito / rojo fallo (con motivo)
- Control de posición: control deslizante (0-4095) con caja de valor sincronizada
- Velocidad en baudios / restablecimiento de fábrica
- Parámetros xdat (solo EEPROM): guardar → abrir → restaurar

### 8.4 Control remoto

> ⚠️ **Dirección: el puerto 1 controla el puerto 2**. El puerto 1 (maestro) lee los ángulos, el puerto 2 (esclavo) se sincroniza. Requiere ID coincidentes en ambos puertos.

Barra superior `🎮 Remoto`: el puerto 1 lee → el puerto 2 controla (se requiere el mismo ID de servo en ambos puertos)

## 9. Solución de problemas

| Problema | Solución |
|---------|----------|
| Puerto con `tty.` se cuelga | Use el prefijo `cu.` en su lugar |
| Dispositivo no encontrado | `ls /dev/cu.*`; vuelva a conectarlo; `system_profiler SPUSBDataType` |
| Interfaz en chino en blanco | La PingFang del sistema suele bastar; instale Noto Sans CJK si se ve mal |
| Falla la activación del entorno virtual | `source .venv/bin/activate` (no `.bat`) |
| Error de compilación en Apple Silicon | Python 3.10+ es nativo; evite el Python antiguo con Rosetta |

## 10. Herramientas de línea de comandos (opcional)

```bash
# Escanear servos
python -m src.tools.scan_id

# Calibración de LeRobot
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. Consejos

- **El nombre del puerto cambia**: los nombres `cu.*` pueden variar según el puerto USB; seleccione el puerto en el menú desplegable en cada inicio
- **Suspensión**: macOS puede suspenderse y cortar la conexión serie; mantenga el equipo despierto durante el uso
- **Permiso de privacidad**: si le pide "acceder a discos extraíbles", concédalo
