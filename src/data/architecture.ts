import type { FlowStep } from "./flow";

export type ArchScene = FlowStep;

const CH_STRUCT = "구조";
const CH_CONFIG = "설정·보안";
const CH_OPS = "통신·배포";

export const ARCH_STEPS: ArchScene[] = [
  {
    id: "big-picture",
    chapter: CH_STRUCT,
    reelTitle: "A1 · OVERVIEW",
    headline: "3계층: 정적 프론트 · User/Admin API · MySQL/Redis",
    body: "MARVEL-RUN은 Next.js static export(out/)를 nginx 컨테이너에 담아 배포하고, 브라우저가 MARVEL-Backend의 user(/api)·admin(/admin-api) 두 Spring Boot 앱과 HTTPS JSON으로 통신합니다. 결제 승인·환불·시크릿 키는 항상 백엔드에서만 Toss PG와 맞닿습니다.",
    activePath: ["browser", "env-fe", "api", "db"],
    serverLoad: "idle",
    traces: [
      {
        id: "u",
        layer: "client",
        title: "참가자 브라우저",
        detail: "marvelrunkorea2026.com — React 19 · Next 15 · Tailwind 4",
      },
      {
        id: "s",
        layer: "api",
        title: "User API (공개)",
        detail: "Spring Boot 3.5 · Java 21 · context-path /api",
      },
      {
        id: "a",
        layer: "api",
        title: "Admin API (운영)",
        detail: "context-path /admin-api · JWT · 환불 배치 · 엑셀",
      },
      {
        id: "d",
        layer: "db",
        title: "MySQL + Redis",
        detail: "MySQL: 신청·결제·정원 · Redis: 관리자 JWT refresh/blacklist",
      },
    ],
    stacks: [
      {
        title: "Presentation",
        accent: "#5b8cff",
        items: [
          { name: "Next.js 15 · React 19", desc: "App Router · output: export" },
          { name: "TanStack Query · zustand", desc: "관리자 데이터 캐시 · 클라이언트 상태" },
          { name: "Toss SDK v2", desc: "결제위젯 (클라이언트 키)" },
        ],
      },
      {
        title: "Application",
        accent: "#22c55e",
        items: [
          { name: "user 앱", desc: "v1/public/* 신청·조회·결제·게시판" },
          { name: "admin 앱", desc: "JWT 보호 · 신청·정원·환불·통계" },
          { name: "common-entity", desc: "공유 JPA 베이스 · 상태 enum" },
        ],
      },
      {
        title: "Data & Integration",
        accent: "#a78bfa",
        items: [
          { name: "MySQL", desc: "Payment · Reservation · Capacity · Log" },
          { name: "Redis", desc: "refresh:{adminId} · blacklist:access:*" },
          { name: "Toss PG", desc: "RestClient · Basic Auth secret" },
        ],
      },
    ],
    links: [
      { label: "통합 지도: User API", wire: "api-user" },
      { label: "통합 지도: Admin API", wire: "api-admin" },
      { label: "통합 지도: MySQL", wire: "d-mysql" },
    ],
    code: {
      file: "MARVEL-RUN/next.config.ts · user/application.yml",
      lines: [
        'output: "export"  // 정적 HTML/JS → nginx',
        "server.servlet.context-path: /api        # user",
        "server.servlet.context-path: /admin-api  # admin",
      ],
    },
  },
  {
    id: "frontend",
    chapter: CH_STRUCT,
    reelTitle: "A2 · FRONTEND",
    headline: "공개용 mainFetch · 관리자용 adminFetch",
    body: "공개 화면은 src/lib/main/config.ts의 MAIN_API_BASE와 mainFetch로만 User API에 붙고, 관리자 화면은 adminFetch가 Bearer 토큰을 붙여 Admin API로 갑니다. base URL이 비어 있으면 status 0으로 즉시 실패합니다. Toss 위젯만 SDK로 PG와 직접 통신하고, 승인(confirm)은 반드시 백엔드 POST입니다.",
    activePath: ["browser", "env-fe"],
    envHighlight: "frontend",
    serverLoad: "idle",
    traces: [
      {
        id: "cfg",
        layer: "client",
        title: "config.ts",
        detail: "MAIN_API_BASE · TOSS_CLIENT_KEY · EVENT_ID · APP_MODE",
      },
      {
        id: "svc",
        layer: "client",
        title: "services/main/*",
        detail: "registrations · payments · notices · questions — v1/public/...",
      },
      {
        id: "adm",
        layer: "client",
        title: "services/admin/*",
        detail: "adminFetch · 401이면 refresh 1회 후 재요청",
      },
      {
        id: "pay-ui",
        layer: "client",
        title: "PaymentWidget",
        detail: "@tosspayments/tosspayments-sdk · requestPayment",
      },
    ],
    stacks: [
      {
        title: "mainFetch 규칙",
        accent: "#7c5cff",
        items: [
          { name: "GET", desc: "cache: no-store" },
          { name: "body 있음", desc: "Content-Type: application/json" },
          { name: "오류", desc: "{message, code} → MainHttpError" },
          { name: "204·빈 body", desc: "undefined 반환" },
        ],
      },
      {
        title: "앱 모드",
        accent: "#5b8cff",
        items: [
          { name: "coming-soon", desc: "기본값 · 오픈 전 랜딩만" },
          { name: "main", desc: "npm run dev:main / build:main" },
        ],
      },
    ],
    links: [
      { label: "통합 지도: mainFetch", wire: "l-mainfetch" },
      { label: "통합 지도: adminFetch", wire: "l-adminfetch" },
      { label: "ENV 스위치: 앱 모드", env: "app-mode" },
    ],
    code: {
      file: "src/lib/main/fetch.ts",
      lines: [
        "if (!MAIN_API_BASE) throw new MainHttpError(0, ...)",
        'joinUrl("v1/public/...") → fetch JSON',
        "isServerDownError: 408 · 429 · 5xx · AbortError · TypeError",
      ],
    },
  },
  {
    id: "backend",
    chapter: CH_STRUCT,
    reelTitle: "A3 · BACKEND",
    headline: "Spring Boot user / admin · 공유 엔티티",
    body: "독립 Gradle 프로젝트 3개: user(공개 REST), admin(운영), common-entity(@MappedSuperclass·enum, 두 앱이 함께 씀). 같은 MySQL을 바라보지만 배포·포트·경로는 따로입니다. 도메인은 event(신청) · capacity(정원) · payment(결제) · community(게시판)로 나뉩니다.",
    activePath: ["api", "env-be", "db"],
    envHighlight: "backend",
    serverLoad: "api",
    traces: [
      {
        id: "ctrl",
        layer: "api",
        title: "@RestController",
        detail: "Registration* · OrgRegistration* · PaymentCommand · Notice/Question",
      },
      {
        id: "svc",
        layer: "api",
        title: "Application Service",
        detail: "트랜잭션 경계 · 잠금 순서(대회 → 단체 → 결제 → 신청 → 예약)",
      },
      {
        id: "infra",
        layer: "api",
        title: "Infrastructure",
        detail: "TossPaymentClient(user) · TossPaymentCancelClient(admin)",
      },
      {
        id: "jpa",
        layer: "db",
        title: "JPA + MySQL",
        detail: "Payment @Version · PaymentProcessLog · Reservation history(JSON)",
      },
    ],
    stacks: [
      {
        title: "user 도메인",
        accent: "#22c55e",
        items: [
          { name: "event", desc: "개인·단체 신청 · 조회 · 수정 · 취소" },
          { name: "capacity", desc: "Reservation HELD/PROCESSING/CONSUMED" },
          { name: "payment", desc: "승인 Tx1/Tx2 · 재결제 · 추가금" },
          { name: "community", desc: "공지 · Q&A · 답변" },
        ],
      },
      {
        title: "admin 도메인",
        accent: "#f59e0b",
        items: [
          { name: "auth", desc: "로그인 · refresh · logout (Redis)" },
          { name: "event", desc: "신청 관리 · 엑셀 · 오프라인 입금 · 미결제 취소" },
          { name: "payment", desc: "환불 배치 · 부분환불 · 증빙" },
          { name: "capacity · user", desc: "정원 조회 · 단체 정보" },
        ],
      },
      {
        title: "부가 의존성",
        accent: "#38bdf8",
        items: [
          { name: "SpringDoc", desc: "Swagger UI /swagger-ui/**" },
          { name: "Thymeleaf + openhtmltopdf", desc: "PDF 증명서" },
          { name: "WebFlux", desc: "의존성만 존재" },
        ],
      },
    ],
    links: [
      { label: "통합 지도: 승인 서비스", wire: "s-confirm" },
      { label: "통합 지도: 관리자 환불", wire: "s-refund" },
    ],
    code: {
      file: "user/build.gradle",
      lines: [
        "id 'org.springframework.boot' version '3.5.4'",
        "implementation 'kr.co.teambrain.marvelrun:marvelrun-common-entity:1.0.0'",
        "implementation 'spring-boot-starter-data-jpa' · '-security' · '-data-redis'",
      ],
    },
  },
  {
    id: "security",
    chapter: CH_CONFIG,
    reelTitle: "A4 · SECURITY",
    headline: "공개 경로 · JWT · CORS",
    body: "두 앱 모두 세션 없는(STATELESS) Spring Security에 JwtFilter를 붙입니다. 참가자 API는 /v1/public/** 전체가 permitAll이라 토큰 없이 쓰고, 대신 이름·생년월일·전화번호·비밀번호 같은 본인확인 값을 요청 본문으로 받습니다. 관리자 API는 로그인·refresh만 열려 있습니다.",
    activePath: ["browser", "api"],
    packetFrom: "browser",
    packetTo: "api",
    serverLoad: "api",
    traces: [
      {
        id: "user",
        layer: "api",
        title: "user SecurityConfig",
        detail: "permitAll: /v1/public/** · /health · /actuator/health · swagger",
      },
      {
        id: "admin",
        layer: "api",
        title: "admin SecurityConfig",
        detail: "permitAll: /v1/admin/public/login · refresh · /v1/public/**",
      },
      {
        id: "jwt",
        layer: "api",
        title: "JwtFilter",
        detail: "Bearer access 검증 · Redis blacklist 확인 · 실패 시 EntryPoint 401",
      },
      {
        id: "cors",
        layer: "client",
        title: "CORS allowedOrigins",
        detail: "localhost:3000 · marathontest2026.duckdns.org · marvelrunkorea2026.com",
      },
    ],
    table: {
      head: ["구분", "User API", "Admin API"],
      rows: [
        ["인증", "없음 (본인확인 값)", "JWT Bearer"],
        ["공개 경로", "/v1/public/**", "/v1/admin/public/**"],
        ["세션", "STATELESS", "STATELESS"],
        ["CSRF", "disable", "disable"],
        ["credentials", "allow", "allow"],
      ],
    },
    links: [
      { label: "통합 지도: JWT 필터", wire: "sec-jwt" },
      { label: "통합 지도: 관리자 인증", wire: "s-adminauth" },
    ],
    code: {
      file: "SecurityConfig.java (user · admin)",
      lines: [
        '.requestMatchers("/v1/public/**", ...).permitAll()',
        ".anyRequest().authenticated()",
        "SessionCreationPolicy.STATELESS",
        "http.addFilterBefore(new JwtFilter(...), UsernamePassword...)",
        "config.setAllowedOrigins(List.of(localhost, test, prod))",
      ],
    },
  },
  {
    id: "env-matrix",
    chapter: CH_CONFIG,
    reelTitle: "A5 · ENV",
    headline: "어디에 어떤 키가 붙는지 — 한눈에",
    body: "프론트 env는 빌드 타임에 JS에 박히므로 공개돼도 되는 값만 둡니다. 백엔드 시크릿은 API-KEY.yml(배포 시 서버에 배치)을 spring.config.import로 읽어 주입합니다. on/off · 0/1/3 같은 전환 값은 통합 탭의 ENV 스위치에서 값별 효과를 볼 수 있습니다.",
    activePath: ["browser", "env-fe", "api", "env-be"],
    envHighlight: "both",
    serverLoad: "idle",
    traces: [
      {
        id: "fe",
        layer: "env",
        title: ".env.local / Docker ARG",
        detail: "NEXT_PUBLIC_* → next build 결과물에 고정",
      },
      {
        id: "be",
        layer: "env",
        title: "optional:file:/app/API-KEY.yml",
        detail: "TOSS_SECRET_KEY · DB · Redis · JWT · 해시 키",
      },
      {
        id: "ci",
        layer: "env",
        title: "GitHub Actions",
        detail: "Variables(공개 값) · Secrets(키·API-KEY.yml 내용)",
      },
    ],
    table: {
      caption: "키 위치",
      head: ["위치", "예시", "주입 시점"],
      rows: [
        ["프론트 번들", "API_BASE_URL(_ADMIN) · TOSS_CLIENT_KEY · EVENT_ID", "next build"],
        ["프론트 스위치", "APP_MODE · REGISTRATION_OPEN · BGM · ADMIN_REFUND_BATCH", "next build"],
        ["프론트 기타", "KAKAO_MAP_KEY", "next build"],
        ["User API", "TOSS_SECRET_KEY · otp-phnum-hash-secret · redis.secret.*", "JVM 기동"],
        ["User API", "infra.admin-server.from-secret-key (내부 API 키)", "JVM 기동"],
        ["Admin API", "TOSS_SECRET_KEY · JWT secret · Redis", "JVM 기동"],
        ["절대 금지", "시크릿 키를 NEXT_PUBLIC_ 로", "—"],
      ],
    },
    links: [
      { label: "ENV 스위치 전체 보기", env: "" },
      { label: "통합 지도: 시크릿 파일", wire: "d-secrets" },
    ],
    code: {
      file: "user/application.yml",
      lines: [
        "spring.config.import: optional:file:/app/API-KEY.yml",
        "phone-hmac-secret: ${otp-phnum-hash-secret}",
        "infra.internal-api.secret-key: ${infra.admin-server.from-secret-key}",
        "toss.payments.secret-key: ${TOSS_SECRET_KEY}",
      ],
    },
  },
  {
    id: "api-surface",
    chapter: CH_OPS,
    reelTitle: "A6 · API",
    headline: "URL 조립 규칙과 공개 API 지도",
    body: "브라우저는 MAIN_API_BASE(보통 https://host/api)에 endpoint를 붙입니다. 예: v1/public/payments/confirm → 최종 POST …/api/v1/public/payments/confirm. 관리자 화면은 NEXT_PUBLIC_API_BASE_URL_ADMIN(…/admin-api)을 씁니다. 공지 조회는 user 앱의 /v1/public/notices에서 받습니다.",
    activePath: ["browser", "api"],
    packetFrom: "browser",
    packetTo: "api",
    serverLoad: "api",
    traces: [
      {
        id: "pub",
        layer: "client",
        title: "공개 mainFetch",
        detail: "신청·조회·결제·게시판 — 토큰 없음, 본인확인 값으로 접근",
      },
      {
        id: "adm",
        layer: "client",
        title: "adminFetch + JWT",
        detail: "POST v1/admin/public/login → Bearer access",
      },
      {
        id: "err",
        layer: "client",
        title: "MainHttpError",
        detail: "0=설정 없음 · 408/429/5xx=장애로 분류",
      },
    ],
    table: {
      caption: "User API — /v1/public/events/{eventId}/ 아래",
      head: ["메서드", "경로", "용도"],
      rows: [
        ["POST", "registrations", "개인 신청 + 주문"],
        ["POST", "registrations/organization", "단체 신청 + 주문"],
        ["GET", "registrations/organization/duplicate-*-check", "단체명·ID 중복"],
        ["POST", "registrations/lookup · organizations/lookup", "신청 조회"],
        ["PATCH", "registrations/{rid} · organizations/{oid}/registrations", "수정"],
        ["POST", "…/payments/{pid}/retry", "재결제 준비"],
        ["POST", "…/cancellation", "취소 요청"],
        ["PATCH", "…/password", "비밀번호 변경"],
        ["POST", "/v1/public/payments/confirm", "결제 승인"],
      ],
    },
    links: [
      { label: "통합 지도: 신청 컨트롤러", wire: "c-registration" },
      { label: "통합 지도: 결제 컨트롤러", wire: "c-payment" },
    ],
    code: {
      file: "services/main/registrations.ts · payments.ts",
      lines: [
        "`v1/public/events/${eventId}/registrations`",
        "`v1/public/events/${eventId}/registrations/${rid}/payments/${pid}/retry`",
        '"v1/public/payments/confirm"',
      ],
    },
  },
  {
    id: "deploy",
    chapter: CH_OPS,
    reelTitle: "A7 · DEPLOY",
    headline: "GitHub Actions → ECR → SSM → docker compose",
    body: "프론트·user·admin이 각각 따로 워크플로를 가집니다. 이미지를 ECR에 올린 뒤 SSM Run Command로 서버에서 compose pull/up을 실행합니다. 테스트는 AWS EC2, 운영은 SSM Hybrid Managed Node로 등록한 Cafe24 서버입니다. 백엔드 운영 배포는 API-KEY.yml을 age로 암호화해 SSM 명령 안에서만 풉니다.",
    activePath: ["api", "env-be"],
    envHighlight: "backend",
    serverLoad: "idle",
    traces: [
      {
        id: "build",
        layer: "env",
        title: "Docker 빌드",
        detail: "프론트: next build → nginx · 백엔드: Temurin 21 → user-app.jar / admin-app.jar",
      },
      {
        id: "push",
        layer: "env",
        title: "ECR push",
        detail: "태그 = git sha + latest · 같은 sha 이미지가 있으면 재사용",
      },
      {
        id: "secret",
        layer: "env",
        title: "API-KEY.yml 배치",
        detail: "운영: age 암호문 → 복호화 · sha256 검증 · 테스트: EC2 Instance Connect + scp",
      },
      {
        id: "up",
        layer: "api",
        title: "compose up --force-recreate",
        detail: "user-backend / admin-backend 컨테이너만 교체 → Running 확인",
      },
    ],
    table: {
      head: ["워크플로", "대상", "서버"],
      rows: [
        ["MARVEL-RUN test-deploy / prod-deploy", "frontend (nginx)", "EC2 / Cafe24"],
        ["test-deploy-user / prod-deploy-user", "user-backend", "EC2 / Cafe24"],
        ["test-admin-deploy / prod-admin-deploy", "admin-backend", "EC2 / Cafe24"],
      ],
    },
    stacks: [
      {
        title: "런타임 포트",
        accent: "#22c55e",
        items: [
          { name: "8080", desc: "API · /livez · /readyz" },
          { name: "9090", desc: "Actuator health · info · metrics" },
          { name: "forward-headers", desc: "framework — 프록시 X-Forwarded-* 신뢰" },
          { name: "TZ", desc: "Asia/Seoul" },
        ],
      },
    ],
    links: [
      { label: "통합 지도: 배포 서버", wire: "dp-ec2" },
      { label: "통합 지도: GitHub Actions", wire: "dp-gh" },
    ],
    code: {
      file: "user/Dockerfile · prod-deploy-user.yml",
      lines: [
        "FROM eclipse-temurin:21-jre-jammy",
        "EXPOSE 8080  EXPOSE 9090",
        "",
        "age -d -i /etc/marvelrun/age/production.key ...",
        "docker compose -f backend-compose.yml up -d --no-deps --force-recreate user-backend",
      ],
    },
  },
  {
    id: "comm-model",
    chapter: CH_OPS,
    reelTitle: "A8 · 통신",
    headline: "4종 통신 경로 (env · REST · SDK · PG secret)",
    body: "(1) env는 각 런타임이 읽기만 합니다. (2) REST는 CORS로 허용된 도메인에서 JSON over HTTPS. (3) Toss SDK는 클라이언트 키로 결제창만 엽니다. (4) PG 승인·취소는 서버 RestClient + secret만 합니다. 이 네 갈래가 섞이지 않는 것이 전체 설계의 핵심입니다.",
    activePath: ["browser", "env-fe", "toss", "api", "env-be"],
    envHighlight: "both",
    serverLoad: "pg",
    packetFrom: "api",
    packetTo: "toss",
    traces: [
      {
        id: "c1",
        layer: "env",
        title: "Config 경로",
        detail: "NEXT_PUBLIC_* ↔ application.yml — 네트워크 없음",
      },
      {
        id: "c2",
        layer: "client",
        title: "REST JSON",
        detail: "mainFetch · adminFetch",
      },
      {
        id: "c3",
        layer: "pg",
        title: "Toss SDK",
        detail: "결제위젯 · redirect success/fail URL",
      },
      {
        id: "c4",
        layer: "pg",
        title: "Toss Server API",
        detail: "Idempotency-Key · /v1/payments/confirm · /{paymentKey}/cancel",
      },
    ],
    table: {
      head: ["경로", "누가", "무엇을"],
      rows: [
        ["env", "빌드·기동", "주입 (호출 아님)"],
        ["REST", "브라우저 → API", "비즈니스 로직·DB"],
        ["SDK", "브라우저 → 토스", "카드 입력·인증 UI"],
        ["PG REST", "API → 토스", "금전 승인·취소 확정"],
      ],
    },
    code: {
      file: "통신 요약",
      lines: [
        "브라우저 ─REST─► User API ─secret─► Toss",
        "브라우저 ──SDK──► Toss (승인 전)",
        "브라우저 ◄redirect─ Toss (paymentKey)",
        "Admin API ─secret─► Toss (환불)",
      ],
    },
  },
];
