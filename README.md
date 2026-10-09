# MARVEL Interactive Architecture Map

**MARVEL-RUN** 프론트엔드와 **MARVEL-Backend** User/Admin API가 어떻게 연결되는지, 결제·정원·ENV·배포까지 **한 화면에서 탐색할 수 있는 인터랙티브 아키텍처 맵**입니다.

로컬 워킹 디렉터리 이름은 `MARVEL-RUN-WIRE`이고, GitHub 저장소 이름은 [MARVEL-Interactive-Architecture-Map](https://github.com/MARVEL-RUN/MARVEL-Interactive-Architecture-Map)입니다.

---

## 이게 뭔가요?

| 구분 | 설명 |
|------|------|
| **정식 영어 표현** | Interactive architecture map / explorable system map |
| **역할** | README·GitDiagram을 **지도 + 시나리오 재생 + 노드 상세**로 확장한 **팀 내부용 라이브 문서** |
| **대상** | MARVEL-RUN·백엔드 코드를 처음 보는 개발자, 결제/승인 흐름을 빠르게 맞춰 볼 때 |

실제 서비스 앱이 아니며, **설명과 다이어그램 데이터**(`src/data/*`)가 소스입니다. 내용은 `MARVEL-RUN`, `MARVEL-Backend-develop` 코드와 워크플로를 기준으로 수동 동기화합니다.

---

## 화면 구성 (4탭)

| 탭 | 내용 |
|----|------|
| **통합** | FE ↔ BE ↔ Toss ↔ DB ↔ 운영 서버를 한 지도(72 노드·112 엣지·9 시나리오). 노드 클릭 → 파일·엔드포인트·ENV·연관 노드. **ENV 스위치** 패널(on/off, 0/1/3, 모드). |
| **아키텍처** | 11장면 — 개요, 프론트/백엔드, 보안·CORS, ENV 매트릭스, API 표면, 배포, 운영 서버(구성 · 방화벽 · 점검), 통신 4갈래. |
| **결제·DB** | 20장면 — 신청→위젯→승인(Tx1/토스/Tx2), fail URL, FAILED/UNKNOWN, 재결제, 상태표, ProcessLog, Admin 환불. |
| **GitDiagram** | [gitdiagram.com](https://gitdiagram.com) 스타일 FE/BE 플로우 (외부 URL 연동). |

공통 UX: **드래그·휠 줌**, 플로팅 설명 패널, 장면 **재생/이전/다음**, 키보드(← → Space, Esc).

---

## 기술 스택

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- CSS Modules (`src/components/wire.module.css`)
- 빌드/실행: webpack dev (`next dev`). Turbopack은 `npm run dev:turbo` (선택)

---

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저: [http://localhost:3000](http://localhost:3000)

```bash
npx tsc --noEmit
npm run lint
```

- `npm run lint`는 `ESLINT_USE_FLAT_CONFIG=false`로 `.eslintrc.json`을 사용합니다.
- **dev 서버가 이미 떠 있을 때** 같은 프로젝트에서 `next build`를 돌리지 마세요 (`.next` 충돌). 검증은 위 두 명령으로 충분합니다.

---

## 프로젝트 구조

```
src/
├── app/                 # App Router (page, layout)
├── components/          # WireExperience, PannableMap, WireMap, NodeDrawer, EnvSwitchPanel …
├── data/
│   ├── integrated.ts    # 통합 지도 노드·엣지·시나리오
│   ├── architecture.ts  # 아키텍처 탭 장면
│   ├── flow.ts          # 결제·DB 탭 장면 + NODES
│   ├── switches.ts      # ENV 스위치 정의
│   ├── network.ts       # 네트워크 탭 노드 좌표
│   └── gitdiagram.ts    # GitDiagram 메타
├── hooks/               # useIntegrated, useGitDiagram
└── lib/details.ts       # 노드 클릭 시 drawer 내용
```

---

## 참조하는 실제 코드 (로컬 경로 예시)

이 저장소만 clone해도 앱은 동작하지만, **설명의 근거**는 아래 리포지토리입니다.

| 리포 | 용도 |
|------|------|
| [MARVEL-RUN](https://github.com/MARVEL-RUN/MARVEL-RUN) (또는 로컬 `MARVEL-RUN`) | Next.js 참가·결제 UI, `mainFetch`, Toss 위젯 |
| MARVEL-Backend-develop | Spring Boot user(`/api`) · admin(`/admin-api`), 결제 승인·환불 |

다이어그램·장면 문구를 바꿀 때는 위 코드와 맞는지 확인한 뒤 `src/data/*.ts`를 수정합니다.

---

## 데이터·정확도 메모

- 결제 승인: `PaymentConfirmService` — Tx1 → Toss HTTP(트랜잭션 밖) → Tx2, UNKNOWN/FAILED 분기, Idempotency-Key 등 반영.
- 정원: `Reservation` HELD → PROCESSING → CONSUMED; 시간 기반 자동 만료 스케줄러는 **없음** (미결제 정리는 관리자 API 등).
- 배포: 테스트 EC2 · 운영 Cafe24 Hybrid Managed Node + SSM, `API-KEY.yml` age 배치 등 통합 지도에 반영.
- 운영 서버: Cafe24 개발언어 VPS(DEV D, Ubuntu 24.04) 패널 화면 기준 — 사양, 방화벽(80·443 공개, 22·3306 관리 IP 제한), 호스트 Nginx, MariaDB 11.4, 기본 systemd 스택.
  - 서버 IP · 허용 IP · 계정 아이디는 **일부러 넣지 않았습니다** (공개 저장소).
  - compose 파일 · Nginx 설정은 서버에만 있어, 지도에서 **점선**으로 그린 연결(80 포트 주인, `/api` 라우팅, DB 연결 대상 등)은 서버에서 확인이 필요합니다. 아키텍처 탭 「A10 · CHECK」에 확인 명령을 정리했습니다.

---

## GitHub에 올릴 때

```bash
git init
git remote add origin https://github.com/MARVEL-RUN/MARVEL-Interactive-Architecture-Map.git
git add .
git commit -m "Initial commit: interactive architecture map"
git branch -M main
git push -u origin main
```

`.gitignore`에 `node_modules/`, `.next/`, `tsconfig.tsbuildinfo` 등이 포함되어 있어야 합니다.

---

## 이름 정리

| 이름 | 의미 |
|------|------|
| **MARVEL Interactive Architecture Map** | GitHub·공식 프로젝트명 |
| **MARVEL-RUN WIRE** | UI 브랜드 / 로컬 패키지명 `marvel-run-wire` |
| **와이어 / arch map** | 팀 내 줄임말 (표준 업계 약어는 없음) |

---

## 라이선스

`package.json`의 `"private": true` — MARVEL-RUN 팀 내부용으로 관리하는 것을 권장합니다.
