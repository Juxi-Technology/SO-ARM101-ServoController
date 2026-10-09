[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | [Français](../fr/Windows.md) | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | 한국어 | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# SoARM 시리즈 캘리브레이션 툴 — Windows 가이드

Windows 10 / 11용입니다. 설치부터 전체 서보 캘리브레이션까지 다룹니다.

> ⚠️ **호환성: 본 툴은 현재 Feetech (STS3215 시리즈) 서보만 지원합니다**. 레지스터 테이블과 xdat 형식은 Feetech STS3215를 기준으로 설계되었으며, 다른 브랜드/모델은 보장하지 않습니다.

---

## 1. 요구 사항

| 의존성 | 버전 | 비고 |
|-----------|---------|-------|
| Python | >= 3.8 | 3.10+ 권장, [python.org](https://www.python.org/downloads/)에서 다운로드 |
| PySide6 | >= 6.0 | GUI 프레임워크 |
| pyserial | >= 3.5 | 시리얼 통신 |
| OS | Win10 / Win11 | 모든 에디션 |

## 2. Python 설치

1. <https://www.python.org/downloads/>를 방문합니다
2. Python 3.10+ 설치 프로그램을 다운로드합니다
3. 설치 중 **"Add Python to PATH"를 체크**합니다 (그렇지 않으면 터미널에서 python을 찾을 수 없습니다)

확인:

```bash
python --version
```

## 3. 의존성 설치

시스템 Python을 오염시키지 않도록 가상 환경에 설치하십시오:

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **가상 환경은 한 번만 생성하십시오**. 다시 실행하면 환경이 초기화/덮어쓰여집니다(설치된 의존성 삭제). 이후에는 매번 `activate`만 하면 됩니다.

> 활성화하면 프롬프트에 `(.venv)`가 표시됩니다.

## 4. 환경 확인

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目`는 환경이 준비되었음을 의미합니다.

## 5. 하드웨어 연결

1. USB-시리얼 어댑터를 연결합니다 (CH340 / CP2102)
2. 서보 컨트롤러(로봇 암 제어 보드)를 연결합니다
3. 서보에 전원을 공급합니다 (표준판 DC 5V 5A, Pro판 DC 12V 5A)

장치 관리자에서 COM 포트를 확인합니다 (`Win+X` → 장치 관리자):

```
Ports (COM & LPT)
  └─ USB-SERIAL CH340 (COM3)     ← your servo port
```

> 시작할 때 선택할 수 있도록 **COM 번호를 기억해 두십시오**.

## 6. GUI 실행

```bash
python -m src.gui.factory_calibration_tool
```

또는 포트를 지정합니다 (사용 중인 경우):

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

사용 가능한 포트 나열:

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. 인터페이스 워크플로

### 7.1 서보 캘리브레이션 탭

1. 상단 바에서 Port1/Port2 선택 → 서보 자동 스캔 (ID 1-6)
2. 자주 쓰는 버튼:
   - **중간 캘리브레이션**: 현재 위치를 센터 2048로 설정
   - **중간 테스트**: 토크를 활성화하고 센터로 이동하여 검증
   - **서보 비활성화**: 토크를 꺼서 수동 회전 가능

### 7.2 단일 서보 제어 탭

- 슬라이더를 드래그 → 놓으면 서보가 목표 위치로 이동
- 토크 스위치로 개별 서보 제어

### 7.3 FT 디버거 탭

- **시리얼 연결**: 포트, 보드레이트 선택 (기본 1M)
- **서보 스캔**: 온라인 서보 감지
- **파라미터 읽기**: 모든 레지스터 읽기 (EEPROM + SRAM)
- **파라미터 테이블**: 56개 레지스터를 모두 표시하는 5개 열, **행 선택 연동으로 주소/길이/값 채우기**
- **쓰기 팝업**: 성공 시 녹색 "✅ Written successfully", 실패 시 적색 "❌ Write failed" (사유 포함)
- **위치 제어**:
  - **슬라이더**로 목표 위치 (0-4095) 조정, 값 상자는 실시간 갱신; 또는 상자에 직접 입력
  - 이동 후 토크를 끄도록 안내
- **보드레이트 / 공장 초기화**: 보드레이트 변경, 공장 초기화
- **xdat 파라미터 (EEPROM 전용)**:
  1. `💾 Save Current Servo`: 현재 서보의 EEPROM 파라미터를 xdat 파일로 저장
  2. `📂 Open xdat`: 백업 파일 불러오기
  3. `📤 Restore to Servo`: 백업을 서보에 다시 기록

### 7.4 원격 제어

> ⚠️ **방향: Port1이 Port2를 제어합니다**. Port1(마스터)은 서보 각도만 읽고, Port2(슬레이브)가 동기화됩니다. 두 포트의 서보 ID가 일치해야 합니다.

- 상단 바 `🎮 Remote` 버튼: Port1이 읽기 → Port2가 제어 (동일 ID 서보)
- 다시 클릭하면 원격 제어 중지

## 8. 문제 해결

| 문제 | 해결 방법 |
|---------|----------|
| 시리얼 포트 없음 | 장치 관리자에서 드라이버 확인; 다른 USB 포트 시도; CH340 드라이버 설치 |
| 포트 사용 중 | 시리얼 모니터 종료; 툴 재시작 |
| 중국어 텍스트 공백 | 시스템에 Microsoft YaHei가 있음; 깨지면 CJK 폰트 설치 |
| 서보를 찾을 수 없음 | 전원/배선 확인; 1M 보드레이트 확인 |
| 포트를 열 때 PermissionError | 다른 프로세스가 COM 포트를 점유하고 있지 않은지 확인 |

## 9. 명령줄 도구 (선택 사항)

```bash
# 서보 스캔
python -m src.tools.scan_id

# 빠른 중간 캘리브레이션
python -m src.tools.servo_quick_calibration

# LeRobot 캘리브레이션
python -m src.tools.lerobot_calibrate
```
