[English](../en/README.md) | [简体中文](../zh-hans/README.md) | 繁體中文 | [Deutsch](../de/README.md) | [Español](../es/README.md) | [Français](../fr/README.md) | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# So-ARM 系列校正工具

**專為 So-ARM 10X 系列機械手臂設計的 FTServo 伺服馬達工廠校正與 LeRobot 校正工具包**

> ⚠️ **相容性說明:本系統目前僅支援 Feetech(STS3215 系列)伺服馬達**。寄存器表、xdat 參數格式、鮑率表均針對飛特 STS3215 系列設計,其他品牌/型號伺服馬達不保證相容。

> 📜 **來源與致謝:本工具基於 [Seeed Studio 的 Seeed_RoboController](https://github.com/Seeed-Studio) 專案改造與升級**,原專案以 MIT 授權發布。本專案在保留原有核心功能基礎上,重構了 GUI 介面、新增了 FT 除錯器、xdat 參數備份/還原、跨平台支援等增強功能。詳見 [LICENSE](../../LICENSE)。

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[功能特性](#-功能特性) · [介面介紹](#-介面介紹) · [快速開始](#-快速開始) · [使用步驟](#-使用步驟) · [注意事項](#-注意事項) · [故障排除](#-故障排除)

</div>

---

## ✨ 功能特性

| 特性 | 說明 |
| ---- | ---- |
| 自動連接埠偵測 | 智慧識別 USB 序列埠，自動過濾虛擬裝置 |
| 跨平台支援 | Windows / Ubuntu / macOS 全平台相容 |
| 雙連接埠同步 | 主動臂、從動臂兩個序列埠獨立操作，支援主從雙連接埠同步遙控 |
| 中英文切換 | 介面內一鍵切換中 / 英文，選擇自動記憶 |
| 單一伺服馬達中位校正 | 將單一伺服馬達當前位置燒錄為 2048 中位（EEPROM 持久化） |
| 中位測試 | 啟動力矩並將伺服馬達移動到中位，驗證校正結果 |
| 失能馬達 | 一鍵關閉所有伺服馬達力矩，便於手動調整 |
| 自動掃描 | 自動偵測 ID 1–20 範圍內所有線上伺服馬達 |
| 單伺服馬達控制 | 滑桿即時控制單個伺服馬達位置與力矩開關 |
| FT 除錯器 | 序列埠連接、掃描、參數讀寫、位置控制、鮑率修改、恢復出廠、xdat 參數備份 |
| xdat 參數 | 儲存當前伺服馬達 EEPROM 參數 / 開啟備份還原 |
| LeRobot 校正 | 主動臂 / 從動臂一鍵完整校正（擺中位 + 掃行程），自動產生並覆寫校正檔案 |
| 單一檔案發布 | PyInstaller 打包成一個 exe，目標機器無需安裝 Python；命令列工具內建於同一個 exe 裡 |
| 校正檔案中位執行 | 根據校正檔案將機械手臂移動到中位 |

---

## 📚 系統教學

| 系統 | 教學 |
|------|------|
| Windows | [Windows 使用教學](Windows.md) |
| Linux | [Linux 使用教學](Linux.md) |
| macOS | [macOS 使用教學](macOS.md) |

---

## 🖥️ 介面介紹

主程式包含三個分頁:

```
┌────────────────────────────────────────────────────────────────┐
│  SoARM 系列校正工具    [主動臂▾]  [從動臂▾]  [🔄]  [🎮遙控][EN]│  ← 頂欄
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬─────────────────────────────┐ │
│  │ 主動臂 - 伺服馬達校正       │ 從動臂 - 伺服馬達校正       │ │
│  │  [🔴未連接] 當前伺服馬達:…  │  [🔴未連接] 當前伺服馬達:…  │ │
│  │  伺服馬達1~6 狀態表格       │  伺服馬達1~6 狀態表格       │ │
│  │  [中位校正][中位測試]…      │  [中位校正][中位測試]…      │ │
│  └─────────────────────────────┴─────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

- **頂欄**：應用標題、主動臂/從動臂序列埠選擇下拉式選單、重新整理按鈕、遙控按鈕、語言切換按鈕。
- **🦾 Tab1 伺服馬達校正**：主動臂 / 從動臂面板快捷操作（中位校正、中位測試、斷電馬達）及即時狀態。**中位校正**會開啟 LeRobot 校正精靈（見第 2 節），一鍵完成整臂校正。
- **🎚️ Tab2 單伺服馬達控制**：每個伺服馬達一列 —— ID / Pos 數值 / 滑桿 / L（目標）。Pos 與滑桿**雙向綁定**：拖曳滑桿時 Pos 跟著變；在 Pos 裡輸入數字，滑桿跟著跳並立刻把位置命令發給伺服馬達。
- **🔬 Tab3 FT 除錯器**：序列埠連接、掃描、參數讀寫、位置控制、鮑率/恢復出廠、xdat 參數備份還原。

---

## 🚀 快速開始

> 完整分系統教學見 [📚 詳細教學](#-詳細教學)。以下為各系統要點。

### Windows

1. 安裝 [Python 3.10+](https://www.python.org/downloads/)(勾選 **Add to PATH**)
2. 建立虛擬環境並安裝依賴:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. 檢查環境並啟動（兩種等價入口）:

```bash
python setup.py
python main.py
# 或
python -m src.gui.factory_calibration_tool
```

> **免安裝方式（Windows）**：直接雙擊 `dist/SO-ARM101-ServoController.exe`，無需 Python 環境。重新打包執行 `pyinstaller -y SO-ARM101-ServoController.spec`。exe 同時內建全部命令列工具（見第 10 節）。

4. 裝置管理員確認序列埠號(如 `COM3`)，頂欄選擇。手動指定連接埠:

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. 安裝中文字型與依賴:

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ 新增序列埠權限(dialout 群組)**【必需】:

```bash
sudo usermod -a -G dialout $USER
# 注销并重新登录后生效
```

3. 建立虛擬環境、安裝依賴、啟動:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. 序列埠裝置為 `/dev/ttyUSB0` / `/dev/ttyACM0`。手動指定:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. 用 Homebrew 安裝 Python:

```bash
brew install python
```

2. 建立虛擬環境、安裝依賴、啟動:

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ 序列埠命名**:macOS 用 `/dev/cu.usbserial-*`(**推薦,非阻塞**)而非 `/dev/tty.*`。查看:

```bash
ls /dev/cu.*
```

手動指定:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### 通用命令列工具(無需 GUI)

```bash
# 扫描舵机
python -m src.tools.scan_id

# 舵机快速中位校准
python -m src.tools.servo_quick_calibration

# 舵机中位测试
python -m src.tools.servo_center_test

# 失能全部舵机
python -m src.tools.servo_disable

# LeRobot 风格校准
python -m src.tools.lerobot_calibrate

# 双端口同步遥控
python -m src.tools.servo_remote_control
```

---

## 📖 使用步驟

### 1. 連接與識別伺服馬達

1. 透過 USB 轉序列埠轉接器連接機械手臂控制板，給伺服馬達供電。
2. 開啟 GUI，在頂欄序列埠下拉式選單中選擇對應連接埠（或點擊 `🔄` 重新整理）。
3. 面板頂部顯示 `🟢 已連接`，並自動掃描出 ID 1–20 範圍內的線上伺服馬達（通常為 1–6）。

> 若提示序列埠佔用，請確認沒有其他程式（序列埠監視器、上一個未結束的工具）佔用該連接埠。

### 2. 中位校正（主動臂 / 從動臂）

> 校正前請先物理擺好機械手臂姿態，使每個關節位於你期望的"零位 / 中位"。

頂欄的 **主動臂中位校正** / **從動臂中位校正** 會開啟 LeRobot 校正精靈。視窗分左右兩欄：左側是 6 個伺服馬達的即時監視（ID / Pos / 滑桿），右側是校正表格和操作按鈕。

1. 連接後程式先失能力矩，並重置伺服馬達：運動偏移歸零、角度限位放開到 `[0, 4095]`（與 LeRobot 的 `reset_calibration` 一致）。
2. 點【開始中位值記錄】——按鈕變橘色，表格的"中位值"欄開始**即時跟隨左側 Pos**。把機械手臂擺到標準中位、讀數穩定後，點【完成中位值記錄】凍結數值並寫回伺服馬達（檔案裡存的是 `中位值 − 2047` 的增量）。
3. 點【記錄運動範圍】——按鈕變綠色，開始記錄。**依序把每個關節從頭轉到尾**（`wrist_roll` 是連續旋轉關節，範圍固定 `[0,4095]`；**夾爪也要轉一次**），表格裡各關節的最小/最大值即時更新。再點一次【停止記錄範圍】結束。
4. 6 個關節全部完成後，程式**自動儲存校正檔案並覆寫同名舊檔案**，同時把偏移與限位寫回伺服馬達 EEPROM——這樣 LeRobot 不會再提示"未校正"。

儲存位置（ID 固定）：

| 臂 | 校正檔案 ID | 路徑 |
| --- | --- | --- |
| 主動臂 | `my_leader_arm` | `~/.cache/huggingface/lerobot/calibration/teleoperators/so_leader/my_leader_arm.json` |
| 從動臂 | `my_follower_arm` | `~/.cache/huggingface/lerobot/calibration/robots/so_follower/my_follower_arm.json` |

> 中途關閉精靈時會提示是否儲存當前進度；選擇"是"也會覆寫同名檔案。
> 單一伺服馬達的「🎯 中位」按鈕仍是把該伺服馬達當前位置燒錄為 2048（EEPROM 持久化），與上面的整臂校正為兩件事。

> ⚠️ **兩臂的行程要掃得一致**：遙操作按各自記錄的行程做歸一化映射。某個關節在一條臂上只轉了半程（例如 shoulder_lift 只記錄到 107°），另一條臂記錄到 208°，從動臂的動作幅度就會接近主動臂的兩倍，靜止姿勢也會對不上。校正後對照兩臂的行程寬度，差異大的關節重新記錄。

### 3. 中位測試

1. 點擊 **主動臂中位測試** / **從動臂中位測試**。
2. 程式啟動力矩並把所有伺服馬達移動到 2048。
3. 若伺服馬達從當前位置幾乎不動，說明校正正確；若大幅移動，說明該校正值不可靠，需要重新校正。

### 4. 斷電馬達（手動調整）

- 點擊 **主動臂斷電馬達** / **從動臂斷電馬達**，關閉該連接埠全部伺服馬達力矩，可自由手動旋轉。
- 單伺服馬達可在 **單伺服馬達控制** 頁透過滑桿下方的力矩開關單獨開關。

### 5. 單一伺服馬達控制（滑桿 / Pos）

在 **🎚️ 單一伺服馬達控制** 頁，每個線上伺服馬達一列：

- **Pos 數值框**：顯示 / 輸入目標位置（0–4095），**可編輯**，與滑桿雙向綁定。
- **滑桿**：拖曳時 Pos 即時跟隨；**放開**後才把位置命令發給伺服馬達，拖曳過程中不會一路亂發。
- **在 Pos 裡輸入數字**：按 Enter、失去焦點或點上下箭頭後立即發送命令；逐鍵輸入時不會每敲一位就動一次。
- **L**：最近一次下發的目標值。
- 伺服馬達實際運動時，滑桿和 Pos 會跟隨**當前位置**刷新；正在拖曳或正在輸入時不會被搶走。
- 每列還有「⚡ 力矩」「🎯 中位」「🧹 清限位」：分別控制單一伺服馬達的力矩、把當前位置燒錄為 2048、清除角度限位。

### 6. 修改伺服馬達 ID

1. 進入 **🔬 FT 除錯器** 頁，連接序列埠並掃描伺服馬達。
2. 選中目標伺服馬達，在參數表中修改"伺服馬達 ID"（位址 0x05）的值，點擊寫入。
3. 程式執行：解鎖 → 寫入位址 5 → 驗證新 ID → 重新鎖定。

> ⚠️ 修改 ID 前務必確保匯流排上只有這一個伺服馬達，避免 ID 衝突。

### 7. 修改鮑率 / 恢復出廠設定

- **修改鮑率**：在 FT 除錯器頁的"鮑率 / 恢復出廠"區，選擇新鮑率（38400 – 1000000 bps）後修改。寫入後自動切換序列埠鮑率並 ping 驗證，失敗自動回滾。
- **恢復出廠設定**：伺服馬達恢復為出廠預設（ID=1，鮑率=1000000），之後需重新掃描。

### 8. xdat 參數備份與還原

在 FT 除錯器頁"xdat 參數（僅儲存 EEPROM）"區：

1. **💾 儲存當前伺服馬達**：把當前選中伺服馬達的 EEPROM 參數儲存為 xdat 檔案（備份）。
2. 隨意修改伺服馬達參數後，如想還原：
3. **📂 開啟 xdat**：載入備份檔案。
4. **📤 還原參數到伺服馬達**：把備份寫回當前伺服馬達 EEPROM。

### 9. 雙連接埠同步遙控

> ⚠️ **方向說明:主動臂 控制 從動臂**。主動臂(主控)只讀取伺服馬達角度,從動臂(從控)被同步控制。

1. 頂欄點擊 **🎮 遙控**(主動臂 讀取角度 → 從動臂 同步控制同 ID 伺服馬達)。
2. 兩個連接埠的伺服馬達 ID 需一致;僅交集內的伺服馬達才會被同步。
3. 再次點擊同一按鈕停止,之後兩個面板掃描執行緒自動恢復。

### 10. LeRobot 校正（命令列）

```bash
# 校准从动臂（保存到 ~/.cache/huggingface/lerobot/calibration/robots/so_follower/）
python -m src.tools.lerobot_calibrate --arm-type follower

# 校準主動臂
python -m src.tools.lerobot_calibrate --arm-type leader
```

流程：斷電伺服馬達 → 重置校正參數（偏移歸零、限位放開）→ 每個關節擺到中位記錄 `homing_offset` → 緩慢轉動整個行程記錄 `range_min/max`（`wrist_roll` 為連續旋轉關節，範圍固定 `[0,4095]`）→ 把參數寫回伺服馬達 → 儲存 JSON。

`homing_offset` 是 LeRobot 口徑的**增量**（中位原始位置 − 2047），不是原始位置本身。

> GUI 裡的 **主動臂中位校正 / 從動臂中位校正** 走的是同一套流程，並會在完成後自動儲存到固定 ID（見上文第 2 節）。

按校正檔案執行到中位：

```bash
python -m src.tools.run_calibration_middle <校准文件.json> --mode zero
```

---

## ⚠️ 注意事項

1. **安全第一**：中位校正會把 EEPROM 持久化。校正前確認供電穩定、機械手臂不會碰撞到人或物。
2. **供電**：SoARM 101 標準版建議 DC 5V 5A，Pro 版建議 DC 12V 5A。供電不足會導致伺服馬達丟步或通訊失敗。
3. **序列埠獨佔**：Windows 下序列埠被程式獨佔，同一連接埠不能同時被 GUI 掃描執行緒和校正子行程佔用。工具會自動先停掃描執行緒、結束舊行程再操作，請勿手動重複點擊。
4. **Linux 序列埠權限**：存取 `/dev/ttyUSB*` / `/dev/ttyACM*` 需將使用者加入 `dialout` 群組（見 [Linux 教學](Linux.md)）。
5. **macOS 序列埠命名**：請使用 `/dev/cu.*`（非阻塞）而非 `/dev/tty.*`（阻塞，可能卡住），見 [macOS 教學](macOS.md)。
6. **熱插拔**：拔掉 USB 後程式會嘗試自動重新連接；重新插回後點擊 `🔄` 重新整理連接埠列表。
7. **過溫 / 過壓保護**：程式會監控電壓與溫度（溫度 > 60°C 告警）。若伺服馬達連續高溫，請停機散熱。
8. **中位校正不可逆**：寫入後原偏移被覆蓋，無法復原。建議先記錄原始位置再校正。
9. **ID 修改風險**：寫入失敗或驗證失敗時程式會報錯並恢復掃描，但極端情況下伺服馬達可能"失聯"。遇到失聯可嘗試"恢復出廠設定"（重置後 ID 回到 1）。
10. **編碼問題**：若在 Windows 終端機出現 emoji 亂碼，請設定 `PYTHONIOENCODING=utf-8` 後再執行命令列工具。Linux/macOS 原生 UTF-8 一般無此問題。
11. **兩臂行程要一致**：遙操作按各臂記錄的行程做歸一化。某個關節在一條臂上只轉了半程、另一條臂轉滿，從動臂的動作幅度就會明顯大於主動臂，靜止姿勢也對不上。校正後對照兩臂行程寬度，差異大的關節重掃。
12. **夾爪也要掃行程**：夾爪不是連續旋轉關節。不掃的話會落成預設 `[0,4095]`，夾爪的開合幅度會不準。

---

## 🛠️ 故障排除

| 現象 | 可能原因 | 解決辦法 |
| ---- | -------- | -------- |
| 無法開啟序列埠 / 連接埠被佔用 | 其他程式佔用 | 關閉序列埠監視器等程式，或更換連接埠後重啟工具 |
| 掃描不到伺服馬達 | 供電不足 / 接線錯誤 / 鮑率不符 | 檢查供電與接線，確認伺服馬達為 1M 鮑率 |
| 中位校正後伺服馬達亂跑 | 校正前未擺好姿態 | 重新執行"斷電→手動擺位→中位校正" |
| 溫升過快 | 負載過大或堵轉 | 檢查機構卡滯，降低速度/加速度 |
| 修改 ID 後找不到伺服馬達 | ID 衝突或寫入失敗 | 恢復出廠設定，重新掃描 |
| 遙控不同步 | 兩連接埠 ID 不一致 | 確認主從連接埠同 ID 伺服馬達線上 |
| 遙操作時兩臂姿勢 / 幅度對不上 | 兩臂某個關節記錄的行程寬度差異過大 | 重新記錄該關節的完整行程，使兩臂行程接近 |
| 夾爪動作幅度異常 | 夾爪未掃行程，範圍是預設 `[0,4095]` | 重新校正時把夾爪從頭轉到尾 |
| 校正精靈裡 Pos 不刷新 | 序列埠被佔用 / 伺服馬達未回應 | 關閉佔用程式；確認 6 個伺服馬達都在線上 |

---

## 📁 目錄結構

```
SO-ARM101-ServoController/
├── docs/                    # 文件，按語言分目錄
│   └── <語言>/              # en、zh-hans、zh-hant、de、es、fr、it、ja、ko、pt-br、pt-pt
│       ├── README.md        # 本文件
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── main.py                  # 統一入口（GUI / --run-tool 子命令）
├── SO-ARM101-ServoController.spec   # PyInstaller 單一檔案打包設定
├── src/
│   ├── gui/                  # PySide6 图形界面
│   │   ├── factory_calibration_tool.py   # 主工具（双串口标定 + 遥控 + 语言切换）
│   │   ├── ft_debugger.py                # FT 调试器（参数读写 / xdat 备份）
│   │   ├── calibration_wizard.py         # LeRobot 校准向导
│   │   ├── theme_utils.py                # 浅色主题
│   │   └── language_dialog.py            # 语言选择对话框
│   ├── tools/                # 命令行工具
│   ├── launcher.py           # 子行程自我派發（打包後工具呼叫）
│   ├── calibration_math.py   # homing_offset 換算與符號-幅值編碼
│   ├── servo_eeprom.py       # 校正參數寫回 EEPROM
│   ├── xdat_utils.py         # xdat 参数文件读写
│   ├── i18n*.py / i18n_translations/     # 中英文国际化
│   ├── port_utils.py         # 串口检测
│   └── calibration_manager.py# LeRobot 校准文件管理
├── scservo_sdk/              # FTServo 舵机通信 SDK
├── requirements.txt
└── setup.py                  # 环境检查脚本
```
