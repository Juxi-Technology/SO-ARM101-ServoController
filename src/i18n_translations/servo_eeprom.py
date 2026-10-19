#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""src/servo_eeprom.py 的英文翻译表（key 为中文原文）。

注意：``EEPROM解锁失败: {}`` 在 factory.py 里已有一条同名条目，共用一个键，
不要在此重复定义。
"""

TRANSLATIONS = {
    "串口未连接": "Serial port not connected",
    "写入寄存器 {} 失败: {}": "Failed to write register {}: {}",
    "EEPROM重新锁定失败: {}": "Failed to re-lock EEPROM: {}",
    "读取寄存器 {} 失败: {}": "Failed to read register {}: {}",
    "写入后回读寄存器 {} 失败: {}": "Failed to read back register {} after writing: {}",
    "写入寄存器 {} 后回读不一致（写入 {}，读回 {}）":
        "Register {} read back differently after writing (wrote {}, read {})",
    "[DEBUG] {} (ID{}) 写入寄存器 {} 失败: {}":
        "[DEBUG] {} (ID{}) failed to write register {}: {}",
}
