[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | 繁體中文 | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# SoARM 系列校正工具 — Linux 使用教學

適用於 Ubuntu / Debian / 其他主流發行版。重點:序列埠權限(dialout)、USB 轉序列埠裝置識別。

> ⚠️ **相容性說明:本系統目前僅支援 Feetech(STS3215 系列)伺服馬達**。寄存器表、xdat 參數格式均針對飛特 STS3215 系列設計,其他品牌/型號不保證相容。

---

## 1. 環境要求

| 依賴 | 版本 |
|------|------|
| Python | >= 3.8(建議 3.10+) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| 系統 | Ubuntu 20.04+ / Debian 11+ |

中文字型(顯示中文介面必需):

```bash
sudo apt install fonts-noto-cjk
```

emoji 圖示字型(日誌中的 ✅⚠️ 等):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. 安裝 Python 依賴

```bash
cd SO-ARM101-ServoController

# 创建虚拟环境
python3 -m venv .venv

# 激活
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

> 若 pip 報 externall managed environment,用 `pip install --break-system-packages -r requirements.txt` 或使用 venv。

## 3. ⚠️ 序列埠權限(dialout)【必需】

Linux 預設**普通使用者無法存取** `/dev/ttyUSB*` / `/dev/ttyACM*`。將當前使用者加入 `dialout` 群組:

```bash
sudo usermod -a -G dialout $USER
```

**登出並重新登入**(或重啟)後生效。驗證:

```bash
groups
# 输出应包含 dialout
```

> 不生效時:重啟電腦;部分發行版群組名稱是 `uucp`(Arch)或 `tty`。

## 4. 識別 USB 轉序列埠裝置

插入轉接器後,查看裝置:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

典型輸出:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # 原生 USB 串口(Arduino/ESP32 板载)
```

查看詳細製造商資訊:

```bash
dmesg | tail -20 | grep -i tty
# 或
lsusb
```

> 多個裝置時按插拔順序分配 ttyUSB0/ttyUSB1,可能不穩定。建議**用 /dev/ttyACM* 或按製造商固定**。

## 5. 檢查環境

```bash
python setup.py
```

## 6. 啟動 GUI

```bash
python main.py
# 或
python -m src.gui.factory_calibration_tool
```

指定連接埠:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> 若只有一個序列埠,工具會自動把第二個連接埠設為"禁用"。

## 7. 介面操作流程

### 7.1 伺服馬達校正頁
1. 頂欄選擇主動臂 / 從動臂序列埠 → 自動掃描伺服馬達
2. 點擊 **中位校正** 會開啟 LeRobot 校正精靈，視窗分左右兩欄：左側是 6 個伺服馬達的即時監視（ID / Pos / 滑桿），右側是校正表格和操作按鈕。連接後先失能力矩並重置（偏移歸零、限位放開到 `[0,4095]`）→ 點【開始中位值記錄】擺中位 → 點【完成中位值記錄】→ 點【記錄運動範圍】，把每個關節（**含夾爪**）從頭轉到尾 → 6 個關節完成後自動儲存並覆寫同名檔案
3. **中位測試 / 斷電馬達** 兩個按鈕

> ⚠️ **兩臂的行程要掃得一致**，否則遙操作時動作幅度會對不上；夾爪不掃行程會落成預設 `[0,4095]`。

### 7.2 單伺服馬達控制頁
每個線上伺服馬達一列：ID / Pos 數值 / 滑桿 / L（目標）。Pos 與滑桿雙向綁定：拖曳滑桿時 Pos 即時跟隨，**放開**後才發送位置命令；在 Pos 輸入數字（按 Enter、失焦或點上下箭頭）後滑桿跟著跳並立即發送，逐鍵輸入不會每敲一位就動一次。伺服馬達運動時兩者跟隨當前位置刷新，正在拖曳或輸入時不會被搶走。每列另有「⚡ 力矩」「🎯 中位」「🧹 清限位」。

### 7.3 FT 除錯器頁
- 序列埠連接(預設 1M 鮑率)、掃描伺服馬達
- 讀取參數、參數表(56 個寄存器)、點選連動填入位址/長度/值
- 寫入彈出視窗:成功彈出綠色"✅ 已成功寫入",失敗彈出紅色"❌ 寫入失敗"(含原因)
- 位置控制:滑動條拖曳調整目標位置(0-4095),數值框同步顯示
- 鮑率修改 / 恢復出廠
- xdat 參數(僅儲存 EEPROM):儲存當前伺服馬達 → 開啟備份 → 還原

### 7.4 遙控

> ⚠️ **方向說明:主動臂 控制 從動臂**。主動臂(主控)只讀取伺服馬達角度,從動臂(從控)被同步控制。需兩個連接埠存在相同 ID 的伺服馬達。

頂欄 `🎮 遙控`:主動臂 讀取 → 從動臂 控制(兩連接埠同 ID 伺服馬達)

## 8. 常見問題

| 問題 | 解決 |
|------|------|
| **Permission denied: /dev/ttyUSB0** | 未加入 dialout 群組,見第 3 節;或 `sudo chmod 666 /dev/ttyUSB0`(臨時) |
| 找不到序列埠 | `ls /dev/ttyUSB* /dev/ttyACM*`;`lsusb` 確認裝置 |
| 裝置名稱變化 | 插拔順序影響 ttyUSB 編號;用 `udev` 規則固定或每次啟動時選擇 |
| 中文介面空白 | 安裝 `fonts-noto-cjk` |
| emoji 顯示方塊 | 安裝 `fonts-noto-color-emoji` |
| pip 安裝失敗 | 用虛擬環境;或 `--break-system-packages` |
| 程式無法啟動 | `python3 --version` 確認版本;`pip list` 檢查依賴 |

## 9. 命令列工具(可選)

```bash
# 扫描舵机
python -m src.tools.scan_id

# LeRobot 校准
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. 進階:udev 固定裝置名稱(可選)

建立 `/etc/udev/rules.d/99-servo.rules` 按 USB ID 固定:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

`ls -l /dev/ttyServo` 即可用固定名稱。廠商 ID 用 `lsusb` 查詢。
