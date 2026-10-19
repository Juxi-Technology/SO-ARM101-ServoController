[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | 繁體中文 | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# SoARM 系列校正工具 — Windows 使用教學

適用於 Windows 10 / 11。本教學涵蓋從環境安裝到完整校正的每一步。

> ⚠️ **相容性說明:本系統目前僅支援 Feetech(STS3215 系列)伺服馬達**。寄存器表、xdat 參數格式均針對飛特 STS3215 系列設計,其他品牌/型號不保證相容。

---

## 1. 環境要求

| 依賴 | 版本 | 說明 |
|------|------|------|
| Python | >= 3.8 | 建議 3.10+，從 [python.org](https://www.python.org/downloads/) 下載 |
| PySide6 | >= 6.0 | GUI 框架 |
| pyserial | >= 3.5 | 序列埠通訊 |
| 系統 | Win10 / Win11 | 任意版本 |

## 2. 安裝 Python

1. 造訪 <https://www.python.org/downloads/>
2. 下載 Python 3.10+ 安裝程式
3. 安裝時**務必勾選 "Add Python to PATH"**(否則命令列找不到 python)

驗證安裝:

```bash
python --version
```

## 3. 安裝依賴

建議在虛擬環境中安裝,避免污染系統 Python:

```bash
# 进入项目目录
cd SO-ARM101-ServoController

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境(Windows)
.venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

> 提示:啟用後命令列前綴會出現 `(.venv)`。

## 4. 檢查環境

```bash
python setup.py
```

看到 `[OK] 环境检查通过，可以运行项目` 即表示環境正確。

## 5. 連接硬體

1. 將 USB 轉序列埠轉接器(如 CH340 / CP2102)插入電腦
2. 連接伺服馬達控制器(機械手臂控制板)
3. 給伺服馬達供電(建議 DC 5V 5A,Pro 版 DC 12V 5A)

打開裝置管理員(`Win+X` → 裝置管理員)確認序列埠號:

```
端口 (COM 和 LPT)
  └─ USB-SERIAL CH340 (COM3)     ← 你的舵机串口
```

> **記下 COM 號**,啟動程式時選擇。

## 6. 啟動 GUI

```bash
python main.py
# 或
python -m src.gui.factory_calibration_tool
```

> **免安裝方式**:直接雙擊 `dist\SO-ARM101-ServoController.exe`，目標機器無需 Python 環境。重新打包執行 `pyinstaller -y SO-ARM101-ServoController.spec`（需先 `pip install pyinstaller`）。exe 同時內建全部命令列工具。

或手動指定連接埠(序列埠被佔用時):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

查看可用連接埠:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. 介面操作流程

### 7.1 伺服馬達校正頁

1. 頂欄選擇主動臂 / 從動臂序列埠 → 自動掃描出伺服馬達(ID 1-6)
2. 點擊 **中位校正** 會開啟 LeRobot 校正精靈，視窗分左右兩欄：左側是 6 個伺服馬達的即時監視（ID / Pos / 滑桿），右側是校正表格和操作按鈕。
3. 連接後程式先失能力矩，並重置伺服馬達：運動偏移歸零、角度限位放開到 `[0, 4095]`（與 LeRobot 的 `reset_calibration` 一致）。
4. 點【開始中位值記錄】——按鈕變橘色，表格的"中位值"欄開始即時跟隨左側 Pos。把機械手臂擺到標準中位、讀數穩定後，點【完成中位值記錄】凍結數值並寫回伺服馬達（檔案裡存的是 `中位值 − 2047` 的增量）。
5. 點【記錄運動範圍】——按鈕變綠色。依序把每個關節從頭轉到尾（`wrist_roll` 是連續旋轉關節，範圍固定 `[0,4095]`；**夾爪也要轉一次**），再點一次【停止記錄範圍】結束。
6. 6 個關節全部完成後，程式自動儲存校正檔案並覆寫同名舊檔案，同時把偏移與限位寫回伺服馬達 EEPROM。
7. 其他常用按鈕:
   - **主動臂 / 從動臂 中位測試**:啟動力矩並移動到中位驗證
   - **主動臂 / 從動臂 斷電馬達**:關閉力矩,可手動旋轉

> ⚠️ **兩臂的行程要掃得一致**，否則遙操作時動作幅度會對不上（例如一邊的 shoulder_lift 只記錄到 107°、另一邊記錄到 208°）。夾爪也要掃行程，否則會落成預設 `[0,4095]`。

### 7.2 單伺服馬達控制頁

每個線上伺服馬達一列：ID / Pos 數值 / 滑桿 / L（目標）。

- **Pos 數值框**：顯示 / 輸入目標位置（0–4095），可編輯，與滑桿雙向綁定。
- **滑桿**：拖曳時 Pos 即時跟隨；**放開**後才把位置命令發給伺服馬達。
- **在 Pos 裡輸入數字**：按 Enter、失去焦點或點上下箭頭後立即發送命令；逐鍵輸入時不會每敲一位就動一次。
- **L**：最近一次下發的目標值。
- 伺服馬達實際運動時，滑桿和 Pos 會跟隨當前位置刷新；正在拖曳或輸入時不會被搶走。
- 每列還有「⚡ 力矩」「🎯 中位」「🧹 清限位」，分別控制單一伺服馬達的力矩、把當前位置燒錄為 2048、清除角度限位。

### 7.3 FT 除錯器頁

- **序列埠連接**:選擇連接埠、鮑率(預設 1M)
- **掃描伺服馬達**:偵測線上伺服馬達
- **讀取參數**:讀取全部寄存器(EEPROM + SRAM)
- **參數表**:5 欄顯示全部 56 個寄存器,**點選連動填入"寫入位址""長度""值"**
- **寫入彈出視窗**:寫入成功彈出綠色"✅ 已成功寫入",失敗彈出紅色"❌ 寫入失敗"(含原因)
- **位置控制**:
  - **滑動條**拖曳調整目標位置(0-4095),數值框同步顯示;也可直接在數值框輸入
  - 移動完成後提示關閉力矩
- **鮑率/恢復出廠**:修改鮑率、恢復出廠設定
- **xdat 參數(僅儲存 EEPROM)**:
  1. `💾 儲存當前伺服馬達`:儲存當前 ID 伺服馬達的 EEPROM 參數到 xdat 檔案
  2. `📂 開啟 xdat`:載入備份檔案
  3. `📤 還原參數到伺服馬達`:把備份寫回伺服馬達

### 7.4 遙控

> ⚠️ **方向說明:主動臂 控制 從動臂**。主動臂(主控)只讀取伺服馬達角度,從動臂(從控)被同步控制。需兩個連接埠存在相同 ID 的伺服馬達。

- 頂欄 `🎮 遙控` 按鈕:主動臂 讀取 → 從動臂 控制(兩連接埠同 ID 伺服馬達)
- 再次點擊按鈕停止遙控

## 8. 常見問題

| 問題 | 解決 |
|------|------|
| 找不到序列埠 | 裝置管理員檢查驅動程式;換 USB 埠;安裝 CH340 驅動程式 |
| 序列埠被佔用 | 關閉序列埠監視器等程式;重啟工具 |
| 中文字型顯示空白 | 系統預設微軟雅黑,若異常安裝中文字型 |
| 伺服馬達掃描不到 | 檢查供電/接線;確認鮑率 1M |
| PermissionError 開啟序列埠失敗 | 確保沒有其他行程佔用該 COM 埠 |

## 9. 命令列工具(可選)

```bash
# 扫描舵机
python -m src.tools.scan_id

# 快速中位校准
python -m src.tools.servo_quick_calibration

# LeRobot 校准
python -m src.tools.lerobot_calibrate
```
