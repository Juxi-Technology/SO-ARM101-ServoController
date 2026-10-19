#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""单文件打包支持：子进程自派发与命令行构造。

打包成 exe 后 ``sys.executable`` 指向 exe 自身而不是 python 解释器，
原先的 ``[sys.executable, '-m', 'src.tools.X']`` 会重新拉起一个 GUI，
因此所有工具调用统一改走本模块：

* 源码模式 -> ``python -m src.tools.X``（与改造前完全一致）
* 冻结模式 -> ``<exe> --run-tool X``，由 main.py 在子进程内派发

``--run-tool`` 只被 main.py 识别，两者必须成对使用。
"""

import os
import sys

IS_FROZEN = bool(getattr(sys, "frozen", False))
RUN_TOOL_FLAG = "--run-tool"

_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 工具名 -> 模块路径。这是打包 hidden-import 与 --run-tool 派发的唯一来源。
TOOL_MODULES = {
    "servo_remote_control": "src.tools.servo_remote_control",
    "servo_quick_calibration": "src.tools.servo_quick_calibration",
    "servo_middle_calibration": "src.tools.servo_middle_calibration",
    "servo_center_test": "src.tools.servo_center_test",
    "servo_disable": "src.tools.servo_disable",
    "servo_register_diag": "src.tools.servo_register_diag",
    "scan_id": "src.tools.scan_id",
    "lerobot_calibrate": "src.tools.lerobot_calibrate",
    "run_calibration_middle": "src.tools.run_calibration_middle",
    "change_single_servo_id": "src.tools.change_single_servo_id",
    "servo_angle_limit_set": "src.gui.servo_angle_limit_set",
}


def project_root():
    """项目根目录：源码模式为仓库根，冻结模式为打包资源的解压目录。"""
    if IS_FROZEN:
        return getattr(sys, "_MEIPASS", _PROJECT_ROOT)
    return _PROJECT_ROOT


def child_workdir():
    """子进程的工作目录。

    冻结模式下 project_root() 是单文件 exe 的临时解压目录，
    父进程退出即被删除，不能交给子进程当工作目录，因此改用 exe 所在目录。
    """
    if IS_FROZEN:
        return os.path.dirname(os.path.abspath(sys.executable))
    return _PROJECT_ROOT


def build_tool_command(tool, *args):
    """构造启动某个命令行工具的子进程命令行。"""
    if tool not in TOOL_MODULES:
        raise ValueError(
            "未知工具: {}（可选: {}）".format(tool, ", ".join(sorted(TOOL_MODULES)))
        )
    argv = [str(a) for a in args]
    if IS_FROZEN:
        return [sys.executable, RUN_TOOL_FLAG, tool] + argv
    return [sys.executable, "-m", TOOL_MODULES[tool]] + argv


def build_restart_command(extra_args=()):
    """构造重启界面的命令行。"""
    argv = [str(a) for a in extra_args]
    if IS_FROZEN:
        return [sys.executable] + argv
    script = getattr(sys.modules.get("__main__"), "__file__", None)
    if not script:
        script = os.path.join(_PROJECT_ROOT, "src", "gui", "factory_calibration_tool.py")
    return [sys.executable, os.path.abspath(script)] + argv


def _reopen_stream(fd):
    """把文件描述符重新包成文本流，失败时退化为空设备。"""
    try:
        return os.fdopen(
            os.dup(fd), "w", encoding="utf-8", errors="replace", buffering=1
        )
    except OSError:
        pass
    if sys.platform == "win32":
        try:
            import ctypes
            import msvcrt

            handle = ctypes.windll.kernel32.GetStdHandle(-10 - fd)
            if handle and handle != -1:
                return os.fdopen(
                    msvcrt.open_osfhandle(handle, os.O_WRONLY),
                    "w",
                    encoding="utf-8",
                    errors="replace",
                    buffering=1,
                )
        except Exception:
            pass
    return open(os.devnull, "w", encoding="utf-8")


def _ensure_stdio():
    """保证工具子进程有可用的 stdout / stderr。

    --windowed 打包的 exe 没有控制台，Python 会把 sys.stdout / sys.stderr 置为
    None。此时 print() 不报错但也不产生任何输出，父进程（GUI 日志面板）会一无所获。
    子进程的 fd 1/2 实际仍是父进程接好的管道，这里把它们重新包回文本流。

    冻结模式下再统一改成 UTF-8 行缓冲：父进程按 UTF-8 解码，且工具日志带 emoji，
    否则会以系统 ANSI 代码页（中文 Windows 为 cp936）编码，emoji 直接抛异常。
    """
    for fd, name in ((1, "stdout"), (2, "stderr")):
        stream = getattr(sys, name)
        if stream is None:
            stream = _reopen_stream(fd)
            setattr(sys, name, stream)
        if not IS_FROZEN:
            continue
        try:
            stream.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
        except (AttributeError, ValueError):
            pass


def run_tool(tool, args):
    """在子进程模式下运行指定工具，返回进程退出码。"""
    import importlib

    if tool not in TOOL_MODULES:
        sys.stderr.write("未知工具: {}\n".format(tool))
        return 2

    _ensure_stdio()
    sys.argv = [TOOL_MODULES[tool]] + list(args)
    module = importlib.import_module(TOOL_MODULES[tool])
    try:
        module.main()
    except SystemExit as exc:
        code = exc.code
        if isinstance(code, int):
            return code
        return 0 if code is None else 1
    return 0
