[English](../en/README.md) | [简体中文](../zh-hans/README.md) | [繁體中文](../zh-hant/README.md) | [Deutsch](../de/README.md) | Español | [Français](../fr/README.md) | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# Herramienta de calibración de la serie So-ARM

**Un conjunto de herramientas de calibración de fábrica y calibración de LeRobot para servos FTServo de la serie So-ARM 10X de brazos robóticos**

> ⚠️ **Aviso de compatibilidad: actualmente este sistema solo admite servos Feetech (serie STS3215).** La tabla de registros, el formato de parámetros xdat y la tabla de velocidades en baudios están diseñados para la serie Feetech STS3215; no se garantiza la compatibilidad con servos de otras marcas o modelos.

> 📜 **Origen y créditos: esta herramienta se basa en [Seeed Studio's Seeed_RoboController](https://github.com/Seeed-Studio) y lo amplía**, publicado bajo la licencia MIT. Sin perder la funcionalidad esencial original, este proyecto reelabora la interfaz gráfica y añade un depurador FT, copia de seguridad y restauración de parámetros xdat, compatibilidad multiplataforma y otras mejoras. Consulte [LICENSE](../../LICENSE) para más detalles.

![Plataforma](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[Características](#-características) · [Descripción de la interfaz](#-descripción-de-la-interfaz) · [Inicio rápido](#-inicio-rápido) · [Pasos de uso](#-pasos-de-uso) · [Precauciones](#-precauciones) · [Solución de problemas](#-solución-de-problemas)

</div>

---

## ✨ Características

| Característica | Descripción |
| ---- | ---- |
| Detección automática de puertos | Identifica los puertos serie USB y descarta los dispositivos virtuales |
| Compatibilidad multiplataforma | Funciona en Windows / Ubuntu / macOS |
| Sincronización de doble puerto | Los puertos del brazo líder y del brazo seguidor funcionan de forma independiente, con control remoto sincronizado líder/seguidor |
| Conmutación chino/inglés | Cambia la interfaz entre chino e inglés con un solo clic; la elección se recuerda |
| Calibración de centro de un solo servo | Graba la posición actual de un solo servo como centro 2048 (persistida en la EEPROM) |
| Prueba de centro | Activa el par y mueve los servos al centro para verificar la calibración |
| Desactivar motores | Desactiva el par de todos los servos con un solo clic para el ajuste manual |
| Escaneo automático | Detecta automáticamente todos los servos en línea con un ID en el rango 1–20 |
| Control de un solo servo | Control deslizante en tiempo real de la posición de un servo y su interruptor de par |
| Depurador FT | Conexión serie, escaneo, lectura/escritura de parámetros, control de posición, cambio de velocidad en baudios, restablecimiento de fábrica, copia de seguridad de parámetros xdat |
| Parámetros xdat | Guarda los parámetros de la EEPROM del servo actual / abre una copia de seguridad para restaurarla |
| Calibración de LeRobot | Calibración completa con un clic para el brazo líder / seguidor (centro de postura + barrido de recorrido), creando y sobrescribiendo el archivo de calibración automáticamente |
| Compilación en un solo archivo | PyInstaller empaqueta todo en un único exe; la máquina de destino no necesita Python y todas las herramientas de línea de comandos se alojan en el mismo ejecutable |
| Ir al centro desde un archivo de calibración | Lleva el brazo al centro a partir de un archivo de calibración |

---

## 📚 Guías por sistema operativo

| SO | Guía |
|----|-------|
| Windows | [Guía de Windows](Windows.md) |
| Linux | [Guía de Linux](Linux.md) |
| macOS | [Guía de macOS](macOS.md) |

---

## 🖥️ Descripción de la interfaz

El programa principal contiene tres pestañas:

```
┌─────────────────────────────────────────────────────────────────┐
│  SoARM Calib. Suite   [Leader▾] [Follower▾] [🔄] [🎮 Remoto][EN]│  ← Barra superior
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬──────────────────────────────┐ │
│  │ Leader - Calib. servo       │ Follower - Calib. servo      │ │
│  │ [🔴 No conectado] Actual:…  │ [🔴 No conectado] Actual:…   │ │
│  │ Tabla de estado servo 1–6   │ Tabla de estado servo 1–6    │ │
│  │[Calib. centro][Test centro]…│ [Calib. centro][Test centro]…│ │
│  └─────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

- **Barra superior**: título de la aplicación, menús desplegables de puerto del brazo líder / brazo seguidor, botón de actualización, botón de control remoto y botón de cambio de idioma.
- **🦾 Pestaña 1 — Calibración de servos**: acciones rápidas en los paneles izquierdo y derecho (calibración de centro, prueba de centro, desactivar motores) y estado en vivo. La **calibración de centro** abre el asistente de calibración de LeRobot (véase la sección 2) para una calibración de todo el brazo en un solo paso.
- **🎚️ Pestaña 2 — Control de un solo servo**: una fila por servo — ID / valor Pos / control deslizante / L (objetivo). Pos y el control deslizante están **vinculados en ambos sentidos**: al arrastrar el control deslizante se actualiza Pos; al escribir un valor en Pos se mueve el control deslizante y se envía inmediatamente la orden de posición.
- **🔬 Pestaña 3 — Depurador FT**: conexión serie, escaneo, lectura/escritura de parámetros, control de posición, cambio de velocidad en baudios / restablecimiento de fábrica, y copia de seguridad y restauración de parámetros xdat.

---

## 🚀 Inicio rápido

> Consulte las [📚 Guías por sistema operativo](#-guías-por-sistema-operativo) para los tutoriales completos de cada sistema. A continuación se describen los aspectos esenciales de cada uno.

### Windows

1. Instale [Python 3.10+](https://www.python.org/downloads/) (marque **Add to PATH**).
2. Cree un entorno virtual e instale las dependencias:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Compruebe el entorno e inicie (ambos puntos de entrada son equivalentes):

```bash
python setup.py
python main.py
# o
python -m src.gui.factory_calibration_tool
```

> **Opción sin instalación (Windows)**: haga doble clic en `dist\SO-ARM101-ServoController.exe` — no se necesita Python en la máquina de destino. Recompílelo con `pyinstaller -y SO-ARM101-ServoController.spec`. El mismo exe también aloja todas las herramientas de línea de comandos (véase la sección 10).

4. Confirme el puerto COM en el Administrador de dispositivos (por ejemplo, `COM3`) y selecciónelo en la barra superior. Para especificar los puertos manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. Instale las fuentes CJK y las dependencias:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ Añada los permisos de puerto serie (grupo dialout)** [obligatorio]:

```bash
sudo usermod -a -G dialout $USER
# Tiene efecto tras cerrar y volver a iniciar sesión
```

3. Cree un entorno virtual, instale las dependencias e inicie:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Los dispositivos serie son `/dev/ttyUSB0` / `/dev/ttyACM0`. Para especificarlos manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. Instale Python con Homebrew:

```bash
brew install python
```

2. Cree un entorno virtual, instale las dependencias e inicie:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ Nomenclatura del puerto serie**: en macOS use `/dev/cu.usbserial-*` (**recomendado, sin bloqueo**) en lugar de `/dev/tty.*`. Para listarlos:

```bash
ls /dev/cu.*
```

Para especificarlos manualmente:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### Herramientas generales de línea de comandos (sin GUI)

```bash
# Escanear servos
python -m src.tools.scan_id

# Calibración rápida del centro del servo
python -m src.tools.servo_quick_calibration

# Prueba de centro del servo
python -m src.tools.servo_center_test

# Desactivar todos los servos
python -m src.tools.servo_disable

# Calibración estilo LeRobot
python -m src.tools.lerobot_calibrate

# Control remoto sincronizado de doble puerto
python -m src.tools.servo_remote_control
```

---

## 📖 Pasos de uso

### 1. Conectar y detectar los servos

1. Conecte la placa de control del brazo mediante un adaptador USB a serie y alimente los servos.
2. Abra la GUI y seleccione el puerto correspondiente en el menú desplegable de puertos de la barra superior (o haga clic en `🔄` para actualizar).
3. El encabezado del panel muestra `🟢 Conectado` y escanea automáticamente los servos en línea con ID en el rango 1–20 (normalmente 1–6).

> Si el puerto aparece como ocupado, asegúrese de que ningún otro programa (un monitor serie, o una ejecución anterior de la herramienta que nunca se cerró) lo esté usando.

### 2. Calibración de centro (brazo líder / brazo seguidor)

> Antes de calibrar, coloque físicamente el brazo de modo que cada articulación quede en la posición de "cero / centro" deseada.

Los botones **Calibración de centro del brazo líder** / **Calibración de centro del brazo seguidor** de la barra superior abren el asistente de calibración de LeRobot. La ventana tiene dos columnas: a la izquierda un monitor en vivo (ID / Pos / control deslizante para los seis servos) y a la derecha la tabla de calibración y las acciones.

1. Al conectar, el programa desactiva el par y restablece los servos: el desplazamiento de origen (homing offset) se pone a cero y los límites de ángulo se abren a `[0, 4095]` (equivalente a `reset_calibration` de LeRobot).
2. Haga clic en **Iniciar registro del centro** — el botón se vuelve naranja y la columna "Valor central" empieza a **seguir en vivo la Pos de la izquierda**. Coloque el brazo en su centro estándar; cuando las lecturas sean estables, haga clic en **Finalizar registro del centro** para congelar los valores y escribirlos de vuelta en los servos (el archivo guarda el delta `centro − 2047`).
3. Haga clic en **Registrar recorrido** — el botón se vuelve verde. **Mueva cada articulación de un límite al otro** (`wrist_roll` es una articulación de rotación continua con un recorrido fijo `[0,4095]`; **barra también el gripper**). Las columnas mín./máx. se actualizan en vivo. Haga clic en **Detener registro de recorrido** al terminar.
4. Cuando las seis articulaciones estén completas, el programa **guarda el archivo de calibración automáticamente y sobrescribe cualquier archivo anterior con el mismo nombre**, y escribe los desplazamientos y límites de vuelta en la EEPROM del servo, de modo que LeRobot dejará de pedirle que calibre de nuevo.

Ubicaciones de guardado (ID fijos):

| Brazo | ID del archivo de calibración | Ruta |
| --- | --- | --- |
| Líder | `my_leader_arm` | `~/.cache/huggingface/lerobot/calibration/teleoperators/so_leader/my_leader_arm.json` |
| Seguidor | `my_follower_arm` | `~/.cache/huggingface/lerobot/calibration/robots/so_follower/my_follower_arm.json` |

> Si cierra el asistente antes de tiempo, se le preguntará si desea guardar el progreso actual; elegir Sí también sobrescribe el mismo archivo.
> El botón **🎯 Centro** de cada servo sigue grabando la posición actual de ese servo como 2048 (persistida en la EEPROM); es una operación distinta de la calibración de todo el brazo descrita arriba.

> ⚠️ **Barra ambos brazos sobre el mismo recorrido**: la teleoperación normaliza cada brazo según su propio recorrido registrado. Si una articulación se barre solo a medias en un brazo (por ejemplo, shoulder_lift registrado con 107°) mientras el otro registra 208°, el seguidor se mueve casi el doble que el líder y las posturas de reposo no coinciden. Tras calibrar, compare la anchura de los recorridos de ambos brazos y vuelva a registrar cualquier articulación que difiera mucho.

### 3. Prueba de centro

1. Haga clic en **Prueba de centro del brazo líder** / **Prueba de centro del brazo seguidor**.
2. El programa activa el par y mueve todos los servos a 2048.
3. Si un servo apenas se mueve de su posición actual, la calibración es correcta; si se mueve mucho, el valor de calibración no es fiable y hay que rehacerlo.

### 4. Desactivar motores (ajuste manual)

- Haga clic en **Desactivar motores del brazo líder** / **Desactivar motores del brazo seguidor** para desactivar el par de todos los servos de ese puerto, de modo que puedan girarse libremente a mano.
- Un servo concreto puede activarse o desactivarse en la pestaña **Control de un solo servo** mediante el interruptor de par situado bajo su control deslizante.

### 5. Control de un solo servo (control deslizante / Pos)

En la pestaña **🎚️ Control de un solo servo** cada servo en línea tiene una fila:

- **Campo Pos**: muestra / acepta una posición objetivo (0–4095). **Editable**, vinculado en ambos sentidos con el control deslizante.
- **Control deslizante**: al arrastrarlo se actualiza Pos en vivo; la orden de posición se envía **al soltar**, no de forma continua mientras se arrastra.
- **Escribir en Pos**: Intro, salir del campo o los botones de incremento envían la orden inmediatamente; las pulsaciones no se envían dígito a dígito.
- **L**: el último objetivo ordenado.
- Mientras el servo se mueve, el control deslizante y Pos siguen la **posición real**; no se les toma el control mientras usted arrastra o escribe.
- Cada fila dispone además de **⚡ Par**, **🎯 Centro** y **🧹 Borrar límites** para ese servo concreto.

### 6. Cambiar el ID de un servo

1. Abra la pestaña **🔬 Depurador FT**, conecte el puerto serie y escanee los servos.
2. Seleccione el servo de destino, cambie su valor "ID del servo" (dirección 0x05) en la tabla de parámetros y haga clic en Escribir.
3. Después, el programa ejecuta: desbloquear → escribir la dirección 5 → verificar el nuevo ID → volver a bloquear.

> ⚠️ Antes de cambiar un ID, asegúrese siempre de que este sea el único servo del bus para evitar conflictos de ID.

### 7. Cambiar la velocidad en baudios / restaurar los valores de fábrica

- **Cambiar la velocidad en baudios**: en el área "Velocidad en baudios / Restablecimiento de fábrica" de la pestaña Depurador FT, seleccione la nueva velocidad en baudios (38400 – 1000000 bps) y aplíquela. Tras la escritura, la velocidad en baudios del puerto serie cambia automáticamente y se verifica con un ping; si falla, se revierte automáticamente.
- **Restaurar los valores de fábrica**: el servo vuelve a sus valores de fábrica (ID=1, velocidad en baudios=1000000); después deberá volver a escanear.

### 8. Copia de seguridad y restauración de parámetros xdat

En el área "Parámetros xdat (guardar solo la EEPROM)" de la pestaña Depurador FT:

1. **💾 Guardar servo actual**: guarda los parámetros de la EEPROM del servo seleccionado en un archivo xdat (una copia de seguridad).
2. Tras cambiar los parámetros del servo a voluntad, si desea restaurarlos:
3. **📂 Abrir xdat**: carga un archivo de copia de seguridad.
4. **📤 Restaurar parámetros en el servo**: vuelve a escribir la copia de seguridad en la EEPROM del servo actual.

### 9. Control remoto sincronizado de doble puerto

> ⚠️ **Nota sobre la dirección: el brazo líder controla el brazo seguidor.** El brazo líder (maestro) solo lee los ángulos de los servos; el brazo seguidor (esclavo) se acciona de forma sincronizada.

1. En la barra superior, haga clic en **🎮 Remoto** (el brazo líder lee los ángulos → el brazo seguidor acciona de forma sincronizada los servos con los mismos ID).
2. Los dos puertos deben usar ID de servo coincidentes; solo se sincronizan los servos presentes en ambos.
3. Vuelva a hacer clic en el mismo botón para detenerlo; después, los hilos de escaneo de ambos paneles se reanudan automáticamente.

### 10. Calibración de LeRobot (línea de comandos)

```bash
# Calibrar el brazo seguidor (se guarda en ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Calibrar el brazo líder
python -m src.tools.lerobot_calibrate --arm-type leader
```

Procedimiento: desactivar los servos → restablecer los parámetros de calibración (desplazamiento a cero, límites liberados) → colocar cada articulación en el centro y registrar `homing_offset` → girar lentamente por todo el recorrido para registrar `range_min/max` (`wrist_roll` es una articulación de rotación continua cuyo recorrido está fijado en `[0,4095]`) → volver a escribir los parámetros en los servos → guardar el JSON.

`homing_offset` es el **delta** de LeRobot (posición bruta del centro − 2047), no la posición bruta en sí.

> Los botones **Calibración de centro del brazo líder / Calibración de centro del brazo seguidor** de la GUI ejecutan el mismo procedimiento y, al terminar, guardan automáticamente con los ID fijos (consulte la sección 2 anterior).

Ir al centro desde un archivo de calibración:

```bash
python -m src.tools.run_calibration_middle <calibration_file.json> --mode zero
```

---

## ⚠️ Precauciones

1. **La seguridad es lo primero**: la calibración de centro se guarda en la EEPROM. Antes de calibrar, confirme que la alimentación es estable y que el brazo no colisionará con personas u objetos.
2. **Alimentación**: la edición estándar del SoARM 101 se alimenta mejor a 5V CC 5A, y la edición Pro a 12V CC 5A. Una alimentación insuficiente provoca pérdida de pasos o fallos de comunicación.
3. **Puerto serie en exclusiva**: en Windows el puerto serie es exclusivo, por lo que el mismo puerto no puede ser usado a la vez por el hilo de escaneo de la GUI y un subproceso de calibración. La herramienta detiene el hilo de escaneo y finaliza el proceso antiguo antes de operar; no haga clic repetidamente a mano.
4. **Permisos serie en Linux**: para acceder a `/dev/ttyUSB*` / `/dev/ttyACM*` hay que añadir su usuario al grupo `dialout` (consulte la [Guía de Linux](Linux.md)).
5. **Nomenclatura serie en macOS**: use `/dev/cu.*` (sin bloqueo) en lugar de `/dev/tty.*` (con bloqueo, puede colgarse); consulte la [Guía de macOS](macOS.md).
6. **Conexión en caliente**: cuando desconecta el cable USB, el programa intenta reconectarse automáticamente; una vez vuelto a conectar, haga clic en `🔄` para actualizar la lista de puertos.
7. **Protección contra sobretemperatura / sobretensión**: el programa supervisa la tensión y la temperatura (aviso por encima de 60 °C). Si un servo se mantiene caliente, deténgase y deje que se enfríe.
8. **La calibración de centro es irreversible**: la escritura sobrescribe el desplazamiento original y no puede deshacerse. Anote la posición original antes de calibrar.
9. **Riesgo al cambiar el ID**: si la escritura o la verificación fallan, el programa notifica un error y reanuda el escaneo, pero en casos extremos un servo puede quedar "perdido". Si eso ocurre, pruebe "Restaurar los valores de fábrica" (tras lo cual el ID vuelve a 1).
10. **Problemas de codificación**: si los emoji aparecen mal en una consola de Windows, establezca `PYTHONIOENCODING=utf-8` antes de ejecutar las herramientas de línea de comandos. Linux/macOS usan UTF-8 nativo y normalmente no se ven afectados.
11. **Mantenga coherentes los recorridos de ambos brazos**: la teleoperación normaliza cada brazo según su propio recorrido registrado. Si una articulación se barre solo a medias en un brazo mientras el otro se barre por completo, el movimiento del seguidor es notablemente mayor que el del líder y las posturas de reposo no coinciden. Compare la anchura de los recorridos de ambos brazos y vuelva a barrer cualquier articulación que difiera mucho.
12. **Barra también el gripper**: el gripper no es una articulación de rotación continua. Si lo omite, su recorrido vuelve al valor predeterminado `[0,4095]` y su carrera de apertura/cierre será incorrecta.

---

## 🛠️ Solución de problemas

| Síntoma | Posible causa | Solución |
| ---- | -------- | -------- |
| No se puede abrir el puerto serie / puerto ocupado | Otro programa lo está usando | Cierre programas como los monitores serie, o cambie a otro puerto y reinicie la herramienta |
| No se encuentran servos | Alimentación insuficiente / cableado incorrecto / velocidad en baudios no coincidente | Compruebe la alimentación y el cableado, y confirme que los servos están a 1M baud |
| Los servos se descontrolan tras la calibración de centro | No se estableció la postura antes de calibrar | Repita "desactivar → colocar a mano → calibración de centro" |
| La temperatura sube demasiado rápido | Carga excesiva o una articulación bloqueada | Compruebe si hay bloqueos mecánicos y reduzca la velocidad/aceleración |
| No se encuentra el servo tras cambiar su ID | Conflicto de ID o escritura fallida | Restaure los valores de fábrica y vuelva a escanear |
| Control remoto desincronizado | Los ID de los dos puertos son distintos | Confirme que hay servos con los mismos ID en línea en los puertos maestro y esclavo |
| Las posturas o el recorrido no coinciden durante la teleoperación | Los dos brazos registraron anchuras de recorrido muy distintas en alguna articulación | Vuelva a registrar esa articulación por todo su recorrido para que ambos brazos coincidan |
| La carrera del gripper es incorrecta | El gripper nunca se barrió; su recorrido es el predeterminado `[0,4095]` | Vuelva a registrar y barra el gripper de límite a límite |
| Pos no se actualiza en el asistente de calibración | El puerto está ocupado / un servo no responde | Cierre el programa que ocupa el puerto; confirme que los seis servos están en línea |

---

## 📁 Estructura del proyecto

```
SO-ARM101-ServoController/
├── docs/                    # Documentación, una carpeta por idioma
│   └── <lang>/              # en, zh-hans, zh-hant, de, es, fr, it, ja, ko, pt-br, pt-pt
│       ├── README.md        # Este documento
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── main.py                  # Punto de entrada unificado (GUI / subcomandos --run-tool)
├── SO-ARM101-ServoController.spec   # Configuración de compilación en un solo archivo con PyInstaller
├── src/
│   ├── gui/                  # Interfaz gráfica PySide6
│   │   ├── factory_calibration_tool.py   # Herramienta principal (calibración de doble puerto + control remoto + cambio de idioma)
│   │   ├── ft_debugger.py                # Depurador FT (lectura/escritura de parámetros / copia de seguridad xdat)
│   │   ├── calibration_wizard.py         # Asistente de calibración de LeRobot
│   │   ├── theme_utils.py                # Tema claro
│   │   └── language_dialog.py            # Diálogo de selección de idioma
│   ├── tools/                # Herramientas de línea de comandos
│   ├── launcher.py           # Autodespacho en subproceso (llamadas a herramientas en el exe empaquetado)
│   ├── calibration_math.py   # Conversión de homing_offset y codificación signo-magnitud
│   ├── servo_eeprom.py       # Escritura de los parámetros de calibración de vuelta en la EEPROM
│   ├── xdat_utils.py         # Lectura/escritura de archivos de parámetros xdat
│   ├── i18n*.py / i18n_translations/     # Internacionalización chino/inglés
│   ├── port_utils.py         # Detección de puertos serie
│   └── calibration_manager.py# Gestión de archivos de calibración de LeRobot
├── scservo_sdk/              # SDK de comunicación con servos FTServo
├── requirements.txt
└── setup.py                  # Script de comprobación del entorno
```
