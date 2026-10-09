[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | 日本語 | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# So-ARM シリーズ キャリブレーションツール — Linux ガイド

Ubuntu / Debian / その他の主要ディストリビューション向けです。要点：シリアル権限（dialout）、USB-シリアルデバイスの検出。

> ⚠️ **互換性：本ツールは現在、Feetech（STS3215 シリーズ）サーボのみに対応しています**。レジスタテーブルと xdat 形式は Feetech STS3215 向けに設計されています。他社製・他モデルについては互換性を保証しません。

---

## 1. 動作要件

| 依存関係 | バージョン |
|-----------|---------|
| Python | >= 3.8（3.10 以上を推奨） |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | Ubuntu 20.04+ / Debian 11+ |

中国語フォント（中国語 UI に必要）：

```bash
sudo apt install fonts-noto-cjk
```

絵文字アイコンフォント（ログの ✅⚠️ などに使用）：

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Python 依存関係のインストール

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **仮想環境は一度だけ作成してください**。再実行すると環境がリセット／上書きされます（インストール済みの依存関係が消去されます）。以降は `source .venv/bin/activate` を実行するだけでかまいません。

> pip が「externally-managed-environment」と報告する場合は、venv を使用するか、`pip install --break-system-packages -r requirements.txt` を実行してください。

## 3. ⚠️ シリアル権限（dialout）［必須］

既定では、一般ユーザーは `/dev/ttyUSB*` / `/dev/ttyACM*` に**アクセスできません**。ユーザーを `dialout` グループに追加します：

```bash
sudo usermod -a -G dialout $USER
```

**ログアウトして再ログイン**してください（または再起動）。確認：

```bash
groups
# 出力に dialout が含まれているはずです
```

> 一部のディストリビューションでは `uucp`（Arch）や `tty` を使用します。

## 4. USB シリアルデバイスの特定

接続後：

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

典型的な出力：

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # ネイティブ USB シリアル（Arduino/ESP32 オンボード）
```

詳細な製造元情報を確認するには：

```bash
dmesg | tail -20 | grep -i tty
# または
lsusb
```

> デバイスが複数ある場合、ttyUSB0/ttyUSB1 は接続順に割り当てられるため不安定になることがあります。**/dev/ttyACM* を使うか、製造元で固定する**ことをおすすめします。

## 5. 環境の確認

```bash
python setup.py
```

## 6. GUI の起動

```bash
python -m src.gui.factory_calibration_tool
```

ポートを指定する場合：

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> シリアルポートが 1 つだけの場合、ツールは自動的に 2 番目のポートを「無効」に設定します。

## 7. インターフェースの操作手順

### 7.1 サーボキャリブレーションタブ
ポートを選択し、サーボを自動スキャンします。中心キャリブレーション／中心テスト／サーボ無効化。

### 7.2 単一サーボ制御タブ
スライダーによる位置制御、トルクスイッチ。

### 7.3 FT デバッガータブ
- シリアル接続（既定 1M）、サーボのスキャン
- すべてのレジスタの読み取り、パラメータテーブル（56 レジスタ）、行選択の連動でアドレス／長さ／値を入力
- 書き込みポップアップ：成功は緑／失敗は赤（理由付き）
- 位置制御：スライダー（0-4095）、値ボックスと同期
- ボーレート／工場出荷時リセット
- xdat パラメータ（EEPROM のみ）：保存 → 開く → 復元

### 7.4 リモート操作

> ⚠️ **方向：Port1 が Port2 を制御します**。Port1（マスター）は角度を読み取り、Port2（スレーブ）が同期されます。両ポートで一致する ID が必要です。

トップバー `🎮 リモート`：Port1 が読み取り → Port2 が制御（両ポートで同一 ID のサーボ）

## 8. トラブルシューティング

| 問題 | 解決策 |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | dialout グループに所属していません。セクション 3 を参照。または `sudo chmod 666 /dev/ttyUSB0`（一時的） |
| シリアルポートが表示されない | `ls /dev/ttyUSB* /dev/ttyACM*` を実行。`lsusb` でデバイスを確認 |
| デバイス名が変わる | ttyUSB の番号は接続順に依存します。udev ルールを使用するか、起動のたびに選択してください |
| 中国語 UI が空白 | `fonts-noto-cjk` をインストール |
| 絵文字が四角で表示される | `fonts-noto-color-emoji` をインストール |
| pip install が失敗する | venv を使用。または `--break-system-packages` |

## 9. コマンドラインツール（任意）

```bash
# サーボをスキャン
python -m src.tools.scan_id

# LeRobot キャリブレーション
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. 応用：udev による固定デバイス名（任意）

`/etc/udev/rules.d/99-servo.rules` を作成し、USB ID によってデバイス名を固定します：

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

その後 `ls -l /dev/ttyServo` を実行します。ベンダー ID は `lsusb` で取得できます。
