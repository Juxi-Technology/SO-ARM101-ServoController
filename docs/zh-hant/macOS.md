[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | 繁體中文 | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# SoARM 系列校正工具 — macOS 使用教學

適用於 macOS 11 (Big Sur) 及以上。重點:序列埠命名(`cu.*` vs `tty.*`)、USB 驅動。

> ⚠️ **相容性說明:本系統目前僅支援 Feetech(STS3215 系列)伺服馬達**。寄存器表、xdat 參數格式均針對飛特 STS3215 系列設計,其他品牌/型號不保證相容。

---

## 1. 環境要求

| 依賴 | 版本 |
|------|------|
| Python | >= 3.8(建議 3.10+,Homebrew 安裝) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| 系統 | macOS 11+ (Apple Silicon / Intel) |

## 2. 安裝 Python

建議用 Homebrew 安裝,避免系統內建 Python 版本過舊:

```bash
# 安装 Homebrew(如果没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Python
brew install python
```

驗證:

```bash
python3 --version
```

## 3. 安裝依賴

```bash
cd SO-ARM101-ServoController

# 创建虚拟环境
python3 -m venv .venv

# 激活(macOS 用 source,不是 .bat)
source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

## 4. ⚠️ macOS 序列埠命名【關鍵】

macOS 把 USB 轉序列埠裝置放在 `/dev` 下,有**兩套命名**:

| 前綴 | 含義 | 是否可用 |
|------|------|---------|
| `/dev/tty.usbserial-*` | 數據機風格(阻塞式) | 可能卡住,不推薦 |
| `/dev/cu.usbserial-*` | 呼叫/終端風格(**非阻塞**) | ✅ 推薦使用 |

**查看你的序列埠名稱:**

```bash
ls /dev/cu.*
```

典型輸出:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # 板载 USB 串口(Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> 程式會自動優先選擇 `cu.*` 裝置。若手動指定連接埠,請用 `cu.` 而非 `tty.`。

## 5. USB 驅動

大部分常見晶片(CH340、CP2102、FTDI)macOS 內建驅動,即插即用。若裝置不識別:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**:較舊批次需安裝 WCH 官方驅動
- 一般 `ls /dev/cu.*` 能看到裝置即可

## 6. 檢查環境

```bash
python setup.py
```

## 7. 啟動 GUI

```bash
python -m src.gui.factory_calibration_tool
```

指定連接埠:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> 只有一個序列埠時,第二個連接埠自動停用。

## 8. 介面操作流程

### 8.1 伺服馬達標定頁
- 選擇序列埠 → 自動掃描伺服馬達(ID 1-6)
- 中位校正 / 中位測試 / 斷電馬達

### 8.2 單伺服馬達控制頁
- 滑桿控制位置、力矩開關

### 8.3 FT 除錯器頁
- 序列埠連接(預設 1M)、掃描伺服馬達、讀取參數
- 參數表(56 寄存器)、點選連動填入位址/長度/值
- 寫入彈出視窗:成功彈出綠色"✅ 已成功寫入",失敗彈出紅色"❌ 寫入失敗"(含原因)
- 位置控制:滑動條拖曳調整目標位置(0-4095),數值框同步顯示
- 鮑率 / 恢復出廠
- xdat 參數(僅儲存 EEPROM):儲存 → 開啟 → 還原

### 8.4 遙控

> ⚠️ **方向說明:序列埠1 控制 序列埠2**。序列埠1(主控)只讀取伺服馬達角度,序列埠2(從控)被同步控制。需兩個連接埠存在相同 ID 的伺服馬達。

頂欄 `🎮 遙控`:序列埠1 讀取 → 序列埠2 控制(兩連接埠同 ID 伺服馬達)

## 9. 常見問題

| 問題 | 解決 |
|------|------|
| 序列埠名稱帶 `tty.` 卡住 | 改用 `cu.` 前綴 |
| 找不到裝置 | `ls /dev/cu.*`;插拔後重插;`system_profiler SPUSBDataType` |
| 中文介面空白 | 系統內建 PingFang,一般正常;異常時安裝 Noto Sans CJK |
| 權限問題 | macOS 一般無需額外權限;若彈出存取控制,允許終端存取 |
| 虛擬環境啟用失敗 | `source .venv/bin/activate`(不是 `.bat`) |
| Apple Silicon 編譯錯誤 | Python 3.10+ 原生支援,避免用 Rosetta 的舊 Python |

## 10. 命令列工具(可選)

```bash
# 扫描舵机
python -m src.tools.scan_id

# LeRobot 校准
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. 提示

- **序列埠名稱會變**:不同 USB 埠插拔後 `cu.*` 名稱可能變化,每次啟動時在頂欄下拉式選單選擇即可
- **省電**:macOS 可能休眠導致序列埠斷開,操作時保持喚醒或調高睡眠時間
- **隱私權限**:首次執行如提示"存取可移除磁碟",點擊允許
