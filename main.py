#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""SO-ARM101 Servo Controller 统一入口（同时是 PyInstaller 打包入口）。

同一个可执行文件承担两种角色：

* 不带 ``--run-tool``：启动工厂标定 GUI
* 带 ``--run-tool <工具名> ...``：在子进程中运行某个命令行工具

源码模式下 ``python main.py`` 等价于 ``python -m src.gui.factory_calibration_tool``，
原有的 ``python -m ...`` 启动方式也仍然可用。
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def main():
    from src.launcher import RUN_TOOL_FLAG, run_tool

    if len(sys.argv) > 2 and sys.argv[1] == RUN_TOOL_FLAG:
        sys.exit(run_tool(sys.argv[2], sys.argv[3:]))

    from src.gui.factory_calibration_tool import main as gui_main

    gui_main()


if __name__ == "__main__":
    main()
