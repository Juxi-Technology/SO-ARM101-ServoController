[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | 日本語 | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# So-ARM シリーズ キャリブレーションツール — macOS ガイド

macOS 11（Big Sur）以降向けです。要点：シリアルの命名（`cu.*` と `tty.*`）、USB ドライバー。

> ⚠️ **互換性：本ツールは現在、Feetech（STS3215 シリーズ）サーボのみに対応しています**。レジスタテーブルと xdat 形式は Feetech STS3215 向けに設計されています。他社製・他モデルについては互換性を保証しません。

---

## 1. 動作要件

| 依存関係 | バージョン |
|-----------|---------|
| Python | >= 3.8（3.10 以上を推奨、Homebrew 経由） |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | macOS 11+（Apple Silicon / Intel） |

## 2. Python のインストール

Homebrew 経由でのインストールを推奨します：

```bash
# Homebrew が未導入の場合はインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Python をインストール
brew install python
```

確認：

```bash
python3 --version
```

## 3. 依存関係のインストール

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **仮想環境は一度だけ作成してください**。再実行すると環境がリセット／上書きされます（インストール済みの依存関係が消去されます）。以降は `source .venv/bin/activate` を実行するだけでかまいません。

## 4. ⚠️ macOS のシリアル命名［重要］

macOS は USB シリアルデバイスを `/dev` 配下に**2 つの命名規則**で配置します：

| プレフィックス | 意味 | 使用可否 |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | モデム方式（ブロッキング） | ハングする可能性あり。非推奨 |
| `/dev/cu.usbserial-*` | call/terminal 方式（**ノンブロッキング**） | ✅ 推奨 |

**ポートを見つける：**

```bash
ls /dev/cu.*
```

典型的な出力：

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # オンボード USB シリアル（Arduino/ESP32）
/dev/cu.wchusbserial1420    # CH340
```

> 本ツールは `cu.*` デバイスを自動的に優先します。ポートを手動で指定する場合は、`tty.` ではなく `cu.` を使用してください。

## 5. USB ドライバー

一般的なチップ（CH340、CP2102、FTDI）には macOS の組み込みドライバーがあります。デバイスが認識されない場合：

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**：古いロットでは WCH 公式ドライバーが必要です
- 通常は、`ls /dev/cu.*` でデバイスが表示されれば十分です

## 6. 環境の確認

```bash
python setup.py
```

## 7. GUI の起動

```bash
python -m src.gui.factory_calibration_tool
```

ポートを指定する場合：

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> シリアルポートが 1 つだけの場合、2 番目のポートは自動的に無効になります。

## 8. インターフェースの操作手順

### 8.1 サーボキャリブレーションタブ
ポートを選択し、サーボを自動スキャンします。中心キャリブレーション／中心テスト／サーボ無効化。

### 8.2 単一サーボ制御タブ
スライダーによる位置制御、トルクスイッチ。

### 8.3 FT デバッガータブ
- シリアル接続（既定 1M）、サーボのスキャン
- すべてのレジスタの読み取り、パラメータテーブル（56 レジスタ）、行選択の連動でアドレス／長さ／値を入力
- 書き込みポップアップ：成功は緑／失敗は赤（理由付き）
- 位置制御：スライダー（0-4095）、値ボックスと同期
- ボーレート／工場出荷時リセット
- xdat パラメータ（EEPROM のみ）：保存 → 開く → 復元

### 8.4 リモート操作

> ⚠️ **方向：Port1 が Port2 を制御します**。Port1（マスター）は角度を読み取り、Port2（スレーブ）が同期されます。両ポートで一致する ID が必要です。

トップバー `🎮 リモート`：Port1 が読み取り → Port2 が制御（両ポートで同一 ID のサーボ）

## 9. トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| `tty.` のポートがハングする | `cu.` プレフィックスを使用してください |
| デバイスが見つからない | `ls /dev/cu.*` を実行。再接続。`system_profiler SPUSBDataType` |
| 中国語 UI が空白 | システムの PingFang で通常は問題ありません。崩れる場合は Noto Sans CJK をインストール |
| venv の有効化が失敗する | `source .venv/bin/activate` を実行（`.bat` ではなく） |
| Apple Silicon でのビルドエラー | Python 3.10 以上はネイティブ対応です。Rosetta の古い Python を避けてください |

## 10. コマンドラインツール（任意）

```bash
# サーボをスキャン
python -m src.tools.scan_id

# LeRobot キャリブレーション
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. ヒント

- **ポート名の変化**：`cu.*` の名前は USB ポートの違いによって変わることがあります。起動のたびにドロップダウンで選択してください
- **スリープ**：macOS がスリープしてシリアル接続が切れることがあります。操作中はスリープさせないでください
- **プライバシー権限**：「取り外し可能なディスクへのアクセス」を求められた場合は許可してください
