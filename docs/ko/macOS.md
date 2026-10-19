[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | [Français](../fr/macOS.md) | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | 한국어 | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# SoARM 시리즈 캘리브레이션 툴 — macOS 가이드

macOS 11 (Big Sur) 이상용입니다. 핵심 사항: 시리얼 이름 지정 (`cu.*` 대 `tty.*`), USB 드라이버.

> ⚠️ **호환성: 본 툴은 현재 Feetech (STS3215 시리즈) 서보만 지원합니다**. 레지스터 테이블과 xdat 형식은 Feetech STS3215를 기준으로 설계되었으며, 다른 브랜드/모델은 보장하지 않습니다.

---

## 1. 요구 사항

| 의존성 | 버전 |
|-----------|---------|
| Python | >= 3.8 (3.10+ 권장, Homebrew 사용) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | macOS 11+ (Apple Silicon / Intel) |

## 2. Python 설치

Homebrew 사용을 권장합니다:

```bash
# Homebrew가 없으면 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Python 설치
brew install python
```

확인:

```bash
python3 --version
```

## 3. 의존성 설치

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **가상 환경은 한 번만 생성하십시오**. 다시 실행하면 환경이 초기화/덮어쓰여집니다(설치된 의존성 삭제). 이후에는 `source .venv/bin/activate`만 하면 됩니다.

## 4. ⚠️ macOS 시리얼 이름 지정 [중요]

macOS는 USB 시리얼 장치를 `/dev` 아래에 **두 가지 이름 규칙**으로 배치합니다:

| 접두사 | 의미 | 사용 가능 여부 |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | 모뎀 방식 (블로킹) | 멈출 수 있음, 권장하지 않음 |
| `/dev/cu.usbserial-*` | call/terminal 방식 (**비블로킹**) | ✅ 권장 |

**포트 찾기:**

```bash
ls /dev/cu.*
```

일반적인 출력:

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # 온보드 USB 시리얼 (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> 본 툴은 `cu.*` 장치를 자동으로 우선합니다. 포트를 직접 지정할 때는 `tty.`가 아니라 `cu.`를 사용하십시오.

## 5. USB 드라이버

가장 흔한 칩(CH340, CP2102, FTDI)은 macOS 내장 드라이버가 있습니다. 장치가 인식되지 않으면:

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340**: 구형 배치는 WCH 공식 드라이버가 필요합니다
- 일반적으로 `ls /dev/cu.*`에서 장치가 표시되면 충분합니다

## 6. 환경 확인

```bash
python setup.py
```

## 7. GUI 실행

```bash
python main.py
# 또는
python -m src.gui.factory_calibration_tool
```

포트 지정:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> 시리얼 포트가 하나만 있으면 두 번째 포트는 자동으로 비활성화됩니다.

## 8. 인터페이스 워크플로

### 8.1 서보 캘리브레이션 탭
리더/팔로워 포트를 선택하면 서보가 자동으로 스캔됩니다.

- 센터 캘리브레이션은 LeRobot 캘리브레이션 마법사를 엽니다: 왼쪽은 실시간 모니터(ID / Pos / 슬라이더), 오른쪽은 캘리브레이션 테이블입니다.
- **중간 기록 시작** → 암을 센터 자세로 잡기 → **중간 기록 완료**; 그런 다음 **범위 기록**(녹색으로 바뀜) → 그리퍼를 포함한 모든 관절을 한계에서 한계까지 스윕 → 다시 클릭하여 중지.
- 6개 관절을 모두 완료하면 캘리브레이션 파일이 자동으로 저장되어 이전 파일을 덮어씁니다.

> ⚠️ 두 암을 동일한 이동 범위로 스윕하십시오. 그렇지 않으면 팔로워의 움직임이 리더와 일치하지 않습니다.

### 8.2 단일 서보 제어 탭
- 각 행: ID / Pos / 슬라이더 / L (목표)
- **Pos와 슬라이더는 양방향으로 연동됨**: 드래그하면 Pos가 갱신되고, Pos에 입력하면 슬라이더가 이동하며 명령이 즉시 전송됩니다
- 명령은 드래그 중이 아니라 슬라이더를 놓을 때 전송됩니다

### 8.3 FT 디버거 탭
- 시리얼 연결 (기본 1M), 서보 스캔
- 모든 레지스터 읽기, 파라미터 테이블 (56개 레지스터), 행 선택 연동으로 주소/길이/값 채우기
- 쓰기 팝업: 녹색 성공 / 적색 실패 (사유 포함)
- 위치 제어: 슬라이더 (0-4095), 값 상자 동기화
- 보드레이트 / 공장 초기화
- xdat 파라미터 (EEPROM 전용): 저장 → 열기 → 복원

### 8.4 원격 제어

> ⚠️ **방향: 리더 암이 팔로워 암을 제어합니다**. 리더 암(마스터)이 각도를 읽고, 팔로워 암(슬레이브)이 동기화됩니다. 두 포트의 ID가 일치해야 합니다.

상단 바 `🎮 원격`: 리더가 읽기 → 팔로워가 제어 (두 포트에 동일 ID의 서보 필요)

## 9. 문제 해결

| 문제 | 해결 방법 |
|---------|----------|
| `tty.` 포트가 멈춤 | `cu.` 접두사를 사용하십시오 |
| 장치를 찾을 수 없음 | `ls /dev/cu.*`; 다시 연결; `system_profiler SPUSBDataType` |
| 중국어 UI 공백 | 시스템 PingFang이 보통 문제없음; 깨지면 Noto Sans CJK 설치 |
| venv 활성화 실패 | `source .venv/bin/activate` (`.bat` 아님) |
| Apple Silicon 빌드 오류 | Python 3.10+는 네이티브; Rosetta 구형 Python을 피하십시오 |

## 10. 명령줄 도구 (선택 사항)

```bash
# 서보 스캔
python -m src.tools.scan_id

# LeRobot 캘리브레이션
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. 팁

- **포트 이름 변경**: `cu.*` 이름은 USB 포트에 따라 달라질 수 있습니다; 실행할 때마다 드롭다운에서 선택하십시오
- **슬립**: macOS가 슬립하면서 시리얼 연결이 끊길 수 있습니다; 작업 중에는 슬립을 방지하십시오
- **개인정보 권한**: "이동식 디스크 접근"을 요청하면 허용하십시오
