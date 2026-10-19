#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""LeRobot 校准值的换算与舵机寄存器编码。

单独成模块是为了保持 Qt 无关：本文件不导入 PySide6，可以直接 import 做无头测试。

三处约定必须与 LeRobot 严格一致，否则 LeRobot 会认为机械臂未校准
（`lerobot/src/lerobot/motors/feetech/feetech.py` 的 `is_calibrated` 逐值比对
JSON 与舵机寄存器）：

* ``homing_offset`` 是**增量**，不是中位处的绝对位置：``pos - 2047``
  （见 ``_get_half_turn_homings``）。
* 寄存器 31（``SMS_STS_OFS_L``）是**符号-幅值**编码，符号位在第 11 位，
  幅值上限 2047 —— 不是补码。直接把负数交给 ``write2ByteTxRx`` 会发出补码，
  LeRobot 按符号-幅值解，两边永远对不上。
  对应 ``lerobot/src/lerobot/motors/encoding_utils.py`` 的
  ``encode_sign_magnitude(value, 11)``。
* ``range_min`` / ``range_max`` 是原始编码器值，直接写寄存器 9 / 11。
"""

# STS3215 是 12 位编码器
MAX_RES = 4095
SIGN_BIT_INDEX = 11
HALF_TURN = MAX_RES // 2          # 2047，LeRobot 的中位定义
MAX_MAGNITUDE = (1 << SIGN_BIT_INDEX) - 1   # 2047，符号-幅值能表示的最大幅值


def homing_offset_from_position(pos):
    """中位处读到的原始位置 -> LeRobot 的 homing_offset 增量。

    ``pos == 4095`` 会算出幅值 2048，超出符号-幅值的表示能力（LeRobot 的编码器
    在这种输入下会直接抛异常），这里钳到 4094，避免整个校准因为一个边界读数失败。
    """
    clamped = min(max(int(pos), 0), MAX_RES - 1)
    return clamped - HALF_TURN


def encode_homing_offset(offset):
    """把 homing_offset 增量编码成寄存器 31 的符号-幅值字节值。

    与 LeRobot ``encode_sign_magnitude(offset, 11)`` 逐值等价。超出幅值上限时
    抛 ValueError —— 这种情况宁可响一声，也不能悄悄写错让机械臂一直"未校准"。
    """
    offset = int(offset)
    magnitude = abs(offset)
    if magnitude > MAX_MAGNITUDE:
        raise ValueError(
            "homing_offset {} 超出符号-幅值可表示范围 ±{}".format(offset, MAX_MAGNITUDE)
        )
    direction_bit = 1 if offset < 0 else 0
    return (direction_bit << SIGN_BIT_INDEX) | magnitude


def decode_homing_offset(encoded):
    """寄存器 31 读回的字节值 -> homing_offset 增量（用于校验）。"""
    encoded = int(encoded)
    direction_bit = (encoded >> SIGN_BIT_INDEX) & 1
    magnitude = encoded & MAX_MAGNITUDE
    return -magnitude if direction_bit else magnitude
