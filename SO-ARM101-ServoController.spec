# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller 打包配置：产出单个 exe。

    pyinstaller -y SO-ARM101-ServoController.spec

产出 dist/SO-ARM101-ServoController.exe。该 exe 既是 GUI，也是所有命令行工具的
宿主（见 src/launcher.py 的 --run-tool 自派发）。
"""

import os
import sys

_ROOT = globals().get("SPECPATH") or os.getcwd()
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from src.launcher import TOOL_MODULES  # noqa: E402

# --run-tool 是按名字动态导入的，静态分析看不到，必须显式声明
hiddenimports = sorted(set(TOOL_MODULES.values()))
hiddenimports += [
    "src.gui.ft_debugger",
    "src.gui.theme_utils",
    "src.gui.language_dialog",
    "src.gui.calibration_wizard",
]

# 只用到 QtWidgets / QtCore / QtGui，其余 Qt 模块整包剔除以压缩体积
excludes = [
    "PySide6.QtWebEngineCore",
    "PySide6.QtWebEngineWidgets",
    "PySide6.QtWebEngineQuick",
    "PySide6.QtWebChannel",
    "PySide6.QtWebSockets",
    "PySide6.QtQuick",
    "PySide6.QtQuick3D",
    "PySide6.QtQml",
    "PySide6.Qt3DCore",
    "PySide6.Qt3DRender",
    "PySide6.Qt3DAnimation",
    "PySide6.QtCharts",
    "PySide6.QtDataVisualization",
    "PySide6.QtGraphs",
    "PySide6.QtMultimedia",
    "PySide6.QtMultimediaWidgets",
    "PySide6.QtPdf",
    "PySide6.QtPdfWidgets",
    "PySide6.QtSql",
    "PySide6.QtTest",
    "PySide6.QtDesigner",
    "PySide6.QtHelp",
    "PySide6.QtBluetooth",
    "PySide6.QtNfc",
    "PySide6.QtPositioning",
    "PySide6.QtLocation",
    "PySide6.QtSensors",
    "PySide6.QtScxml",
    "PySide6.QtStateMachine",
    "PySide6.QtRemoteObjects",
    "PySide6.QtSpatialAudio",
    "PySide6.QtTextToSpeech",
    "PySide6.QtNetworkAuth",
    "PySide6.QtHttpServer",
    "PySide6.QtUiTools",
    "PySide6.QtConcurrent",
    "PySide6.QtSerialPort",
    "tkinter",
    "unittest",
]

a = Analysis(
    [os.path.join(_ROOT, "main.py")],
    pathex=[_ROOT],
    binaries=[],
    datas=[],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="SO-ARM101-ServoController",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
