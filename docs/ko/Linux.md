[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | [Français](../fr/Linux.md) | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | 한국어 | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# SoARM 시리즈 캘리브레이션 툴 — Linux 가이드

Ubuntu / Debian / 기타 주요 배포판용입니다. 핵심 사항: 시리얼 권한(dialout), USB-시리얼 장치 감지.

> ⚠️ **호환성: 본 툴은 현재 Feetech (STS3215 시리즈) 서보만 지원합니다**. 레지스터 테이블과 xdat 형식은 Feetech STS3215를 기준으로 설계되었으며, 다른 브랜드/모델은 보장하지 않습니다.

---

## 1. 요구 사항

| 의존성 | 버전 |
|-----------|---------|
| Python | >= 3.8 (3.10+ 권장) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| OS | Ubuntu 20.04+ / Debian 11+ |

중국어 폰트 (중국어 UI에 필요):

```bash
sudo apt install fonts-noto-cjk
```

이모지 아이콘 폰트 (로그의 ✅⚠️ 등):

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Python 의존성 설치

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **가상 환경은 한 번만 생성하십시오**. 다시 실행하면 환경이 초기화/덮어쓰여집니다(설치된 의존성 삭제). 이후에는 `source .venv/bin/activate`만 하면 됩니다.

> pip가 "externally-managed-environment"를 보고하면 venv를 사용하거나 `pip install --break-system-packages -r requirements.txt`를 사용하십시오.

## 3. ⚠️ 시리얼 권한 (dialout) [필수]

기본적으로 일반 사용자는 `/dev/ttyUSB*` / `/dev/ttyACM*`에 **접근할 수 없습니다**. 사용자를 `dialout` 그룹에 추가하십시오:

```bash
sudo usermod -a -G dialout $USER
```

**로그아웃한 뒤 다시 로그인**하십시오 (또는 재부팅). 확인:

```bash
groups
# 출력에 dialout이 포함되어야 합니다
```

> 일부 배포판에서는 `uucp`(Arch) 또는 `tty`를 사용합니다.

## 4. USB 시리얼 장치 확인

연결 후:

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

일반적인 출력:

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # 네이티브 USB 시리얼 (Arduino/ESP32 온보드)
```

자세한 제조사 정보 보기:

```bash
dmesg | tail -20 | grep -i tty
# 또는
lsusb
```

> 장치가 여러 개일 때 ttyUSB0/ttyUSB1은 연결 순서에 따라 할당되어 불안정할 수 있습니다. **`/dev/ttyACM*`를 사용하거나 제조사별로 고정**하는 것을 권장합니다.

## 5. 환경 확인

```bash
python setup.py
```

## 6. GUI 실행

```bash
python main.py
# 또는
python -m src.gui.factory_calibration_tool
```

포트 지정:

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> 시리얼 포트가 하나만 있으면 도구가 자동으로 두 번째 포트를 "비활성"으로 설정합니다.

## 7. 인터페이스 워크플로

### 7.1 서보 캘리브레이션 탭
리더/팔로워 포트를 선택하면 서보가 자동으로 스캔됩니다.

- 센터 캘리브레이션은 LeRobot 캘리브레이션 마법사를 엽니다: 왼쪽은 실시간 모니터(ID / Pos / 슬라이더), 오른쪽은 캘리브레이션 테이블입니다.
- **중간 기록 시작** → 암을 센터 자세로 잡기 → **중간 기록 완료**; 그런 다음 **범위 기록**(녹색으로 바뀜) → 그리퍼를 포함한 모든 관절을 한계에서 한계까지 스윕 → 다시 클릭하여 중지.
- 6개 관절을 모두 완료하면 캘리브레이션 파일이 자동으로 저장되어 이전 파일을 덮어씁니다.

> ⚠️ 두 암을 동일한 이동 범위로 스윕하십시오. 그렇지 않으면 팔로워의 움직임이 리더와 일치하지 않습니다.

### 7.2 단일 서보 제어 탭
각 행: ID / Pos / 슬라이더 / L (목표). **Pos와 슬라이더는 양방향으로 연동됨**: 드래그하면 Pos가 갱신되고, Pos에 입력하면 슬라이더가 이동하며 명령이 즉시 전송됩니다. 명령은 드래그 중이 아니라 놓을 때 전송됩니다.

### 7.3 FT 디버거 탭
- 시리얼 연결 (기본 1M), 서보 스캔
- 모든 레지스터 읽기, 파라미터 테이블 (56개 레지스터), 행 선택 연동으로 주소/길이/값 채우기
- 쓰기 팝업: 녹색 성공 / 적색 실패 (사유 포함)
- 위치 제어: 슬라이더 (0-4095), 값 상자 동기화
- 보드레이트 / 공장 초기화
- xdat 파라미터 (EEPROM 전용): 저장 → 열기 → 복원

### 7.4 원격 제어

> ⚠️ **방향: 리더 암이 팔로워 암을 제어합니다**. 리더 암(마스터)이 각도를 읽고, 팔로워 암(슬레이브)이 동기화됩니다. 두 포트의 ID가 일치해야 합니다.

상단 바 `🎮 원격`: 리더가 읽기 → 팔로워가 제어 (두 포트에 동일 ID의 서보 필요)

## 8. 문제 해결

| 문제 | 해결 방법 |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | dialout 그룹에 속해 있지 않음, 3절 참조; 또는 `sudo chmod 666 /dev/ttyUSB0` (임시) |
| 시리얼 포트 없음 | `ls /dev/ttyUSB* /dev/ttyACM*`; `lsusb`로 장치 확인 |
| 장치 이름이 바뀜 | ttyUSB 번호는 연결 순서에 따라 달라집니다; udev 규칙을 사용하거나 매번 실행 시 선택하십시오 |
| 중국어 UI 공백 | `fonts-noto-cjk` 설치 |
| 이모지가 네모로 표시됨 | `fonts-noto-color-emoji` 설치 |
| pip install 실패 | venv 사용; 또는 `--break-system-packages` |

## 9. 명령줄 도구 (선택 사항)

```bash
# 서보 스캔
python -m src.tools.scan_id

# LeRobot 캘리브레이션
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. 고급: udev 고정 장치 이름 (선택 사항)

USB ID로 장치 이름을 고정하려면 `/etc/udev/rules.d/99-servo.rules`를 생성하십시오:

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

그런 다음 `ls -l /dev/ttyServo`. 벤더 ID는 `lsusb`로 확인합니다.
