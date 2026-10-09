/**
 * 통합 지도 — MARVEL-RUN(프론트) + MARVEL-Backend-develop(user/admin/common-entity) 전체.
 * 백엔드 경로의 "…"는 src/main/java/kr/co/teambrain/marvelrun/{user|admin} 입니다.
 */
import type { IconName } from "@/components/WireIcon";

export type EdgeKind =
  | "nav"
  | "http"
  | "sdk"
  | "redirect"
  | "call"
  | "db"
  | "config"
  | "deploy";

export type WireZone = {
  id: string;
  label: string;
  accent: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type WireNodeDetail = {
  summary: string;
  files?: string[];
  endpoints?: string[];
  env?: string[];
  notes?: string[];
};

export type WireNode = {
  id: string;
  label: string;
  sub?: string;
  icon: IconName;
  accent: string;
  zone: string;
  x: number;
  y: number;
  external?: boolean;
  detail: WireNodeDetail;
};

export type WireEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind: EdgeKind;
  dashed?: boolean;
};

export type ScenarioStep = {
  edge: string;
  title: string;
  detail: string;
};

export type Scenario = {
  id: string;
  title: string;
  summary: string;
  steps: ScenarioStep[];
};

const C = {
  user: "#818cf8",
  page: "#5b8cff",
  admin: "#f472b6",
  lib: "#7c5cff",
  api: "#22c55e",
  ctrl: "#14b8a6",
  svc: "#f59e0b",
  data: "#a78bfa",
  ext: "#38bdf8",
  deploy: "#94a3b8",
};

export const WIRE_SIZE = { w: 2660, h: 1560 };

export const WIRE_ZONES: WireZone[] = [
  { id: "users", label: "사용자", accent: C.user, x: 40, y: 80, w: 220, h: 1200 },
  { id: "pages", label: "MARVEL-RUN 페이지 · Next.js static export", accent: C.page, x: 300, y: 80, w: 460, h: 1200 },
  { id: "lib", label: "프론트 라이브러리 · SDK", accent: C.lib, x: 800, y: 80, w: 240, h: 1200 },
  { id: "entry", label: "API 진입점", accent: C.api, x: 1080, y: 80, w: 240, h: 1200 },
  { id: "ctrl", label: "Controller", accent: C.ctrl, x: 1360, y: 80, w: 460, h: 1200 },
  { id: "svc", label: "Service · 트랜잭션", accent: C.svc, x: 1860, y: 80, w: 460, h: 1200 },
  { id: "data", label: "데이터 · 외부 서비스", accent: C.data, x: 2360, y: 80, w: 260, h: 1200 },
  { id: "deploy", label: "배포 파이프라인", accent: C.deploy, x: 300, y: 1330, w: 2320, h: 180 },
];

const A = 420;
const B = 640;
const L = 920;
const E = 1200;
const CA = 1480;
const CB = 1700;
const SA = 1980;
const SB = 2200;
const D = 2490;

export const WIRE_NODES: WireNode[] = [
  // ── 사용자
  {
    id: "u-runner",
    label: "참가자 브라우저",
    sub: "marvelrunkorea2026.com",
    icon: "user",
    accent: C.user,
    zone: "users",
    x: 150,
    y: 340,
    detail: {
      summary:
        "참가자가 정적 HTML/JS를 받아 실행합니다. 공개 API는 로그인 없이 호출하고, 본인 확인이 필요한 조회·수정은 신청 시 정한 비밀번호를 요청 본문에 넣습니다.",
      notes: [
        "React 19 · Next 15 App Router · Tailwind 4",
        "GA(gtag) · Naver Analytics 스크립트 로드",
      ],
    },
  },
  {
    id: "u-admin",
    label: "운영자 브라우저",
    sub: "/admin",
    icon: "admin",
    accent: C.admin,
    zone: "users",
    x: 150,
    y: 1000,
    detail: {
      summary:
        "같은 정적 사이트의 /admin 경로를 씁니다. 로그인 후 JWT access/refresh 토큰을 localStorage에 보관하고 Admin API(/admin-api)만 호출합니다.",
      files: ["MARVEL-RUN/src/app/admin/layout.tsx", "MARVEL-RUN/src/layouts/admin/AdminLayout.tsx"],
    },
  },

  // ── 공개 페이지
  {
    id: "p-home",
    label: "홈 · 대회안내",
    sub: "/ · /guide · /kit · /directions",
    icon: "home",
    accent: C.page,
    zone: "pages",
    x: A,
    y: 170,
    detail: {
      summary:
        "APP_MODE가 coming-soon이면 ComingSoon만, main이면 HomePage + MainShell을 보여줍니다. 오시는길은 Kakao 지도 SDK를 씁니다.",
      files: [
        "MARVEL-RUN/src/app/page.tsx",
        "MARVEL-RUN/src/app/(main)/layout.tsx",
        "MARVEL-RUN/src/app/(main)/guide/page.tsx",
        "MARVEL-RUN/src/app/(main)/directions/page.tsx",
        "MARVEL-RUN/src/lib/event.ts",
      ],
      notes: ["/virtual · /precautions · /terms · /privacy 도 같은 그룹", "robots.ts가 /admin, /entry-preview 차단"],
    },
  },
  {
    id: "p-register",
    label: "참가신청",
    sub: "/register",
    icon: "form",
    accent: C.page,
    zone: "pages",
    x: A,
    y: 300,
    detail: {
      summary:
        "개인(RegisterFlow)·단체(GroupFlow) 신청서. RegistrationGate가 접수 기간을 확인하고, 제출하면 백엔드가 Payment(READY)를 만들어 orderId·금액을 돌려줍니다.",
      files: [
        "MARVEL-RUN/src/app/(main)/register/page.tsx",
        "MARVEL-RUN/src/app/(main)/register/layout.tsx",
        "MARVEL-RUN/src/services/main/registrations.ts",
        "MARVEL-RUN/src/services/main/registration-options.ts",
        "MARVEL-RUN/src/lib/payment/individual.ts",
        "MARVEL-RUN/src/lib/payment/organization.ts",
      ],
      endpoints: [
        "GET v1/public/events/{eventId}/registration-options",
        "POST v1/public/events/{eventId}/registrations",
        "POST v1/public/events/{eventId}/registrations/organization",
        "GET …/registrations/organization/duplicate-name-check",
        "GET …/registrations/organization/duplicate-id-check",
      ],
      notes: ["주소 입력은 Daum Postcode (lib/daumPostcode.ts)", "/entry-preview/register 는 접수 강제 오픈 미리보기"],
    },
  },
  {
    id: "p-payment",
    label: "결제",
    sub: "/payment",
    icon: "card",
    accent: C.page,
    zone: "pages",
    x: B,
    y: 300,
    detail: {
      summary:
        "sessionStorage의 pending 주문을 읽어 Toss 결제위젯을 렌더합니다. pending이 없으면 결제할 수 없습니다.",
      files: [
        "MARVEL-RUN/src/app/(main)/payment/page.tsx",
        "MARVEL-RUN/src/components/main/payment/PaymentWidget.tsx",
      ],
    },
  },
  {
    id: "p-success",
    label: "결제 성공",
    sub: "/payment/success",
    icon: "receipt",
    accent: C.page,
    zone: "pages",
    x: B,
    y: 430,
    detail: {
      summary:
        "Toss가 paymentKey·orderId·amount 쿼리로 리다이렉트하는 페이지. 이 값으로 백엔드 confirm을 호출하고, 성공하면 pending을 지웁니다. 실패했는데 pending이 남아 있으면 '다시 결제'를 보여줍니다.",
      files: ["MARVEL-RUN/src/app/(main)/payment/success/page.tsx", "MARVEL-RUN/src/services/main/payments.ts"],
      endpoints: ["POST v1/public/payments/confirm { paymentKey, orderId, amount }"],
    },
  },
  {
    id: "p-fail",
    label: "결제 실패",
    sub: "/payment/fail",
    icon: "info",
    accent: C.page,
    zone: "pages",
    x: B,
    y: 560,
    detail: {
      summary:
        "Toss가 code·message·orderId로 리다이렉트합니다. pending이 있으면 '다시 결제'(→ /payment), 없으면 '다시 신청'으로 안내합니다.",
      files: ["MARVEL-RUN/src/app/(main)/payment/fail/page.tsx"],
    },
  },
  {
    id: "p-lookup",
    label: "신청조회",
    sub: "/lookup",
    icon: "search",
    accent: C.page,
    zone: "pages",
    x: A,
    y: 430,
    detail: {
      summary:
        "이름·연락처·비밀번호로 본인 확인 후 조회합니다. 여기서 수정·취소·비밀번호 변경·결제 재시도를 합니다.",
      files: ["MARVEL-RUN/src/app/(main)/lookup/page.tsx", "MARVEL-RUN/src/services/main/registrations.ts"],
      endpoints: [
        "POST …/registrations/lookup · …/organizations/lookup",
        "PATCH …/registrations/{id} · …/organizations/{id}/registrations",
        "POST …/registrations/{id}/cancellation",
        "POST …/registrations/{id}/payments/{paymentId}/retry",
        "PATCH …/registrations/{id}/password",
      ],
    },
  },
  {
    id: "p-community",
    label: "공지 · 문의",
    sub: "/notices · /inquiry · /faq",
    icon: "chat",
    accent: C.page,
    zone: "pages",
    x: A,
    y: 560,
    detail: {
      summary:
        "공지 목록·상세, 1:1 문의 작성·수정·삭제. FAQ는 백엔드가 아니라 localStorage 시드 데이터입니다.",
      files: [
        "MARVEL-RUN/src/app/(main)/notices/page.tsx",
        "MARVEL-RUN/src/app/(main)/inquiry/page.tsx",
        "MARVEL-RUN/src/services/main/notices.ts",
        "MARVEL-RUN/src/services/main/questions.ts",
      ],
      endpoints: [
        "GET v1/public/notices · POST v1/public/notices/{id}/detail",
        "GET/POST v1/public/questions · PATCH/DELETE …/{id}",
        "POST v1/public/questions/{id}/detail (비밀글 비밀번호)",
        "POST v1/public/answers/{id}/detail",
      ],
    },
  },

  // ── 관리자 페이지
  {
    id: "a-login",
    label: "관리자 로그인",
    sub: "/admin/login",
    icon: "lock",
    accent: C.admin,
    zone: "pages",
    x: A,
    y: 870,
    detail: {
      summary:
        "loginId/password로 로그인합니다. AuthInitializer가 토큰 없는 접근을 /admin/login?next= 로 돌려보냅니다.",
      files: ["MARVEL-RUN/src/app/admin/login/page.tsx", "MARVEL-RUN/src/services/admin/auth.ts"],
      endpoints: ["POST v1/admin/public/login", "POST v1/admin/public/refresh", "POST v1/admin/logout"],
    },
  },
  {
    id: "a-dashboard",
    label: "운영 대시보드",
    sub: "/admin",
    icon: "chart",
    accent: C.admin,
    zone: "pages",
    x: B,
    y: 870,
    detail: {
      summary: "대회별 신청 통계, 일별 결제 그래프, 일별 집계·배송명단 엑셀, 미답변 문의 수.",
      files: ["MARVEL-RUN/src/app/admin/page.tsx", "MARVEL-RUN/src/services/admin/stats.ts"],
      endpoints: [
        "GET v1/admin/registrations/{eventId}/statistics",
        "GET …/graph/payment-daily",
        "GET …/daily-report/excel/download · …/delivery-list/excel/download",
      ],
    },
  },
  {
    id: "a-applications",
    label: "신청 · 결제 관리",
    sub: "/admin/applications",
    icon: "inbox",
    accent: C.admin,
    zone: "pages",
    x: A,
    y: 990,
    detail: {
      summary:
        "신청 목록·상세·엑셀, 기본정보 수정, 비밀번호 초기화, 미결제 일괄 취소, 결제·환불 이력과 환불 배치 실행.",
      files: [
        "MARVEL-RUN/src/app/admin/applications/list/page.tsx",
        "MARVEL-RUN/src/services/admin/applications.ts",
        "MARVEL-RUN/src/services/admin/payments.ts",
        "MARVEL-RUN/src/services/admin/refunds.ts",
      ],
      endpoints: [
        "GET v1/admin/registrations · GET …/{id}",
        "POST v1/admin/events/{eid}/registrations/unpaid-cancellations",
        "POST v1/admin/events/{eid}/payment-refunds · payment-partial-refunds",
        "GET …/payments/{pid}/logs",
      ],
      env: ["NEXT_PUBLIC_ADMIN_REFUND_BATCH (\"0\"이면 환불 배치 끔)"],
    },
  },
  {
    id: "a-members",
    label: "단체 관리",
    sub: "/admin/members",
    icon: "users",
    accent: C.admin,
    zone: "pages",
    x: B,
    y: 990,
    detail: {
      summary: "단체 목록·상세, 대표 로그인 ID·비밀번호·기본정보 변경, 단체 결제 이력.",
      files: ["MARVEL-RUN/src/app/admin/members/list/page.tsx", "MARVEL-RUN/src/services/admin/organizations.ts"],
      endpoints: ["GET v1/admin/organizations · …/{id}", "PUT …/{id}/password · …/{id}/loginId", "PATCH …/{id}/basic-info"],
    },
  },
  {
    id: "a-capacities",
    label: "정원 관리",
    sub: "/admin/capacities",
    icon: "gauge",
    accent: C.admin,
    zone: "pages",
    x: A,
    y: 1110,
    detail: {
      summary: "대회·종목·기념품별 정원(limit/held/confirmed)과 정원별 참가자 목록.",
      files: ["MARVEL-RUN/src/app/admin/capacities/page.tsx", "MARVEL-RUN/src/services/admin/capacities.ts"],
      endpoints: ["GET v1/admin/events/{eid}/capacities", "GET …/capacities/{capacityId}/registrations"],
    },
  },
  {
    id: "a-boards",
    label: "공지 · 문의 관리",
    sub: "/admin/boards/*",
    icon: "bell",
    accent: C.admin,
    zone: "pages",
    x: B,
    y: 1110,
    detail: {
      summary: "공지 작성·수정·삭제, 문의 목록과 답변 작성.",
      files: [
        "MARVEL-RUN/src/services/admin/boards/notices.ts",
        "MARVEL-RUN/src/services/admin/boards/inquiries.ts",
        "MARVEL-RUN/src/services/admin/boards/answers.ts",
      ],
      endpoints: ["POST v1/notice · PUT/DELETE v1/notice/{id}", "GET v1/admin/questions", "POST v1/questions/{id}/answer"],
    },
  },
  {
    id: "a-local",
    label: "FAQ · 팝업 · 약관",
    sub: "localStorage 전용",
    icon: "file",
    accent: C.admin,
    zone: "pages",
    x: A,
    y: 1230,
    detail: {
      summary:
        "FAQ·팝업·약관·관리자 계정 관리 화면은 서버 API 없이 브라우저 localStorage에만 저장합니다. 다른 브라우저와 공유되지 않습니다.",
      files: [
        "MARVEL-RUN/src/services/admin/faqs.ts",
        "MARVEL-RUN/src/services/admin/popups.ts",
        "MARVEL-RUN/src/services/admin/legal.ts",
        "MARVEL-RUN/src/lib/admin/store.ts",
      ],
    },
  },

  // ── 프론트 라이브러리
  {
    id: "l-mode",
    label: "사이트 모드 · 접수 토글",
    sub: "lib/mode.ts",
    icon: "route",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 170,
    detail: {
      summary:
        "APP_MODE(coming-soon | main)와 REGISTRATION_OPEN(0 닫힘 · 1 열림 · 그 외 EVENT.openAt 일정)을 해석합니다.",
      files: ["MARVEL-RUN/src/lib/mode.ts", "MARVEL-RUN/src/lib/preview.ts"],
      env: ["NEXT_PUBLIC_APP_MODE", "NEXT_PUBLIC_REGISTRATION_OPEN"],
    },
  },
  {
    id: "l-mainfetch",
    label: "mainFetch",
    sub: "lib/main/fetch.ts",
    icon: "plug",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 300,
    detail: {
      summary:
        "공개 API 공통 클라이언트. MAIN_API_BASE에 경로를 붙여 JSON을 주고받습니다. 인증 헤더가 없고, base URL이 비어 있으면 status 0 오류로 즉시 실패합니다.",
      files: ["MARVEL-RUN/src/lib/main/fetch.ts", "MARVEL-RUN/src/lib/main/config.ts"],
      env: ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_EVENT_ID"],
    },
  },
  {
    id: "l-session",
    label: "결제 대기 세션",
    sub: "lib/payment/session.ts",
    icon: "layers",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 430,
    detail: {
      summary:
        "sessionStorage 키 marvelrun_payment_pending에 { registration: { orderId, orderName, paymentAmount }, customerName, savedAt }을 저장합니다. 탭을 닫으면 사라집니다.",
      files: ["MARVEL-RUN/src/lib/payment/session.ts"],
      notes: ["savePendingPayment · readPendingPayment · clearPendingPayment"],
    },
  },
  {
    id: "l-toss",
    label: "Toss 위젯 SDK",
    sub: "lib/payment/toss.ts",
    icon: "wallet",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 560,
    detail: {
      summary:
        "loadTossPayments(clientKey) → widgets({ customerKey: ANONYMOUS }) → setAmount · renderPaymentMethods · renderAgreement · requestPayment. 클라이언트 키만 쓰고 승인은 하지 않습니다.",
      files: ["MARVEL-RUN/src/lib/payment/toss.ts", "MARVEL-RUN/src/components/main/payment/PaymentWidget.tsx"],
      env: ["NEXT_PUBLIC_TOSS_CLIENT_KEY"],
      notes: ["@tosspayments/tosspayments-sdk ^2.8.1"],
    },
  },
  {
    id: "l-env",
    label: "프론트 env",
    sub: ".env · Docker ARG",
    icon: "file",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 690,
    detail: {
      summary:
        "NEXT_PUBLIC_* 값은 next build 시점에 JS 번들에 박힙니다. 그래서 브라우저에서 누구나 볼 수 있고, 시크릿은 절대 넣지 않습니다.",
      files: ["MARVEL-RUN/.env.example", "MARVEL-RUN/Dockerfile", "MARVEL-RUN/src/lib/main/config.ts", "MARVEL-RUN/src/lib/admin/config.ts"],
      env: [
        "NEXT_PUBLIC_API_BASE_URL · NEXT_PUBLIC_API_BASE_URL_ADMIN",
        "NEXT_PUBLIC_TOSS_CLIENT_KEY · NEXT_PUBLIC_EVENT_ID",
        "NEXT_PUBLIC_APP_MODE · NEXT_PUBLIC_REGISTRATION_OPEN",
        "NEXT_PUBLIC_KAKAO_MAP_KEY · NEXT_PUBLIC_BGM",
        "GA_MEASUREMENT_ID · NAVER_ANALYTICS_ID",
      ],
    },
  },
  {
    id: "x-kakao",
    label: "Kakao Maps",
    sub: "dapi.kakao.com",
    icon: "map",
    accent: C.ext,
    zone: "lib",
    x: L,
    y: 800,
    external: true,
    detail: {
      summary: "오시는길 페이지의 대회장 지도. 브라우저가 Kakao JS SDK를 직접 불러옵니다.",
      files: ["MARVEL-RUN/src/components/main/directions/KakaoVenueMap.tsx"],
      env: ["NEXT_PUBLIC_KAKAO_MAP_KEY"],
    },
  },
  {
    id: "l-adminfetch",
    label: "adminFetch",
    sub: "lib/admin/fetch.ts",
    icon: "shield",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 990,
    detail: {
      summary:
        "Authorization: Bearer {access}를 붙여 호출합니다. 401이면 refresh를 한 번 시도하고 재요청하며, 그래도 실패하면 세션 만료 모달을 띄웁니다.",
      files: [
        "MARVEL-RUN/src/lib/admin/fetch.ts",
        "MARVEL-RUN/src/lib/admin/session.ts",
        "MARVEL-RUN/src/lib/admin/jwt.ts",
        "MARVEL-RUN/src/components/admin/QueryProvider.tsx",
      ],
      env: ["NEXT_PUBLIC_API_BASE_URL_ADMIN"],
      notes: ["화면 데이터는 TanStack Query로 캐시"],
    },
  },
  {
    id: "l-adminauth",
    label: "관리자 토큰 저장소",
    sub: "token.ts · zustand",
    icon: "key",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 1110,
    detail: {
      summary:
        "localStorage mrAdminAccessToken / mrAdminRefreshToken + zustand persist(mr-admin-auth-storage). refresh 요청은 refreshToken 헤더(Bearer 없음)로 보냅니다.",
      files: ["MARVEL-RUN/src/lib/admin/token.ts", "MARVEL-RUN/src/stores/adminAuthStore.ts"],
    },
  },
  {
    id: "l-localstore",
    label: "localStorage 저장소",
    sub: "lib/admin/store.ts",
    icon: "database",
    accent: C.lib,
    zone: "lib",
    x: L,
    y: 1230,
    detail: {
      summary: "FAQ·팝업·약관·관리자 계정 데이터를 브라우저에만 저장하는 CRUD 헬퍼.",
      files: ["MARVEL-RUN/src/lib/admin/store.ts"],
    },
  },

  // ── API 진입점
  {
    id: "api-user",
    label: "User API",
    sub: "user-app.jar · /api",
    icon: "server",
    accent: C.api,
    zone: "entry",
    x: E,
    y: 360,
    detail: {
      summary:
        "공개 API Spring Boot 앱(context-path /api, 포트 8080, actuator 9090). SecurityConfig가 /v1/public/** 를 permitAll로 열어 JWT 없이 받습니다.",
      files: [
        "user/src/main/resources/application.yml",
        "user/…/common/security/config/SecurityConfig.java",
        "user/…/common/exception/in_service/GlobalExceptionHandler.java",
        "user/Dockerfile",
      ],
      notes: [
        "Spring Boot 3.5.4 · Java 21 · JPA · springdoc",
        "CORS: localhost:3000 · marathontest2026.duckdns.org · marvelrunkorea2026.com",
        "노출 헤더: Authorization · refreshToken · Content-Disposition",
      ],
    },
  },
  {
    id: "api-admin",
    label: "Admin API",
    sub: "admin-app.jar · /admin-api",
    icon: "server",
    accent: C.api,
    zone: "entry",
    x: E,
    y: 990,
    detail: {
      summary:
        "운영용 Spring Boot 앱(context-path /admin-api). /v1/admin/public/login·refresh 외에는 JWT가 필요하고, 일부는 @PreAuthorize로 역할(총관리자·게시판 관리자)을 확인합니다.",
      files: [
        "admin/src/main/resources/application.yml",
        "admin/…/security/config/SecurityConfig.java",
        "admin/…/common/exception/GlobalExceptionHandler.java",
        "admin/Dockerfile",
      ],
      notes: ["Apache POI 5.5.1로 엑셀 생성", "Toss 타임아웃 connect 5s / read 30s (user는 3s / 10s)"],
    },
  },
  {
    id: "sec-jwt",
    label: "JwtFilter",
    sub: "stateless JWT",
    icon: "shield",
    accent: C.api,
    zone: "entry",
    x: E,
    y: 1110,
    detail: {
      summary:
        "요청의 Bearer access 토큰을 검증하고, Redis blacklist:access:{token}에 있으면(로그아웃된 토큰) 거부합니다. 세션은 쓰지 않습니다(STATELESS).",
      files: [
        "admin/…/security/filter/JwtFilter.java",
        "admin/…/security/JwtTokenProvider.java · JwtUtil.java",
        "admin/…/security/JwtAuthenticationEntryPoint.java",
      ],
      env: ["token.secret · token.issuer · token.expirationTime.* (API-KEY.yml)"],
    },
  },

  // ── User Controller
  {
    id: "c-registration",
    label: "신청 Controller",
    sub: "Registration · OrgRegistration",
    icon: "form",
    accent: C.ctrl,
    zone: "ctrl",
    x: CA,
    y: 170,
    detail: {
      summary: "개인·단체 신청 생성, 단체 ID/이름 중복 확인, 비밀번호 변경.",
      files: [
        "user/…/event/command/application/controller/RegistrationCommandController.java",
        "user/…/event/command/application/controller/OrgRegistrationCommandController.java",
      ],
      endpoints: [
        "POST /api/v1/public/events/{eventId}/registrations",
        "POST /api/v1/public/events/{eventId}/registrations/organization",
        "PATCH …/registrations/{id}/password · …/organizations/{id}/password",
      ],
    },
  },
  {
    id: "c-query",
    label: "조회 Controller",
    sub: "RegistrationQuery · OrgQuery",
    icon: "search",
    accent: C.ctrl,
    zone: "ctrl",
    x: CB,
    y: 170,
    detail: {
      summary: "본인 확인(비밀번호) 후 개인·단체 접수 내역과 결제 상태를 돌려줍니다.",
      files: ["user/…/event/query/controller/RegistrationQueryController.java", "user/…/event/query/controller/OrgRegistrationQueryController.java"],
      endpoints: ["POST /api/v1/public/events/{eventId}/registrations/lookup", "POST /api/v1/public/events/{eventId}/organizations/lookup"],
    },
  },
  {
    id: "c-modify",
    label: "수정 · 재시도 · 취소",
    sub: "Modification · Cancellation",
    icon: "list",
    accent: C.ctrl,
    zone: "ctrl",
    x: CA,
    y: 300,
    detail: {
      summary: "신청 수정, 결제 재준비(retry), 추가결제 준비, 개인·단체 취소.",
      files: [
        "user/…/event/command/application/controller/RegistrationModificationController.java",
        "user/…/event/command/application/controller/RegistrationCancellationController.java",
        "user/…/AdditionalPaymentController.java",
      ],
      endpoints: [
        "PATCH …/registrations/{id} · …/organizations/{id}/registrations",
        "POST …/registrations/{id}/payments/{paymentId}/retry",
        "POST …/registrations/{id}/payments/additional/prepare",
        "POST …/registrations/{id}/cancellation · …/organizations/{id}/cancellation",
      ],
    },
  },
  {
    id: "c-payment",
    label: "PaymentCommandController",
    sub: "/payments/confirm",
    icon: "card",
    accent: C.ctrl,
    zone: "ctrl",
    x: CB,
    y: 300,
    detail: {
      summary: "프론트의 승인 요청을 받아 PaymentConfirmService.confirm에 넘깁니다.",
      files: ["user/…/payment/command/application/controller/PaymentCommandController.java"],
      endpoints: ["POST /api/v1/public/payments/confirm { paymentKey, orderId, amount }"],
    },
  },
  {
    id: "c-event",
    label: "EventQueryController",
    sub: "registration-options",
    icon: "list",
    accent: C.ctrl,
    zone: "ctrl",
    x: CA,
    y: 430,
    detail: {
      summary: "신청서에 필요한 종목·기념품·가격 옵션을 내려줍니다.",
      files: ["user/…/event/query/controller/EventQueryController.java"],
      endpoints: ["GET /api/v1/public/events/{eventId}/registration-options"],
    },
  },
  {
    id: "c-community",
    label: "공지 · 문의 Controller",
    sub: "Notice · Question · Answer",
    icon: "chat",
    accent: C.ctrl,
    zone: "ctrl",
    x: CB,
    y: 430,
    detail: {
      summary: "공지 조회, 문의 작성·수정·삭제·상세, 답변 상세.",
      files: [
        "user/…/community/…/NoticeQueryController.java",
        "user/…/community/…/QuestionCommandController.java",
        "user/…/community/…/QuestionQueryController.java",
        "user/…/community/…/AnswerQueryController.java",
      ],
      endpoints: ["GET /api/v1/public/notices", "POST /api/v1/public/questions", "POST /api/v1/public/questions/{id}/detail"],
    },
  },

  // ── Admin Controller
  {
    id: "ac-auth",
    label: "AdminCommandController",
    sub: "login · refresh · logout",
    icon: "lock",
    accent: C.ctrl,
    zone: "ctrl",
    x: CA,
    y: 870,
    detail: {
      summary: "관리자 로그인·토큰 갱신·로그아웃.",
      files: ["admin/…/auth/command/application/controller/AdminCommandController.java"],
      endpoints: [
        "POST /admin-api/v1/admin/public/login",
        "POST /admin-api/v1/admin/public/refresh",
        "POST /admin-api/v1/admin/logout",
      ],
    },
  },
  {
    id: "ac-registration",
    label: "신청 관리 Controller",
    sub: "Query · Command · Excel · Graph",
    icon: "inbox",
    accent: C.ctrl,
    zone: "ctrl",
    x: CB,
    y: 870,
    detail: {
      summary: "신청 목록·상세·통계·엑셀·일별 결제 그래프, 기본정보 수정, 미결제 취소.",
      files: [
        "admin/…/event/query/controller/RegistrationQueryController.java",
        "admin/…/event/command/application/controller/RegistrationCommandController.java",
        "admin/…/RegistrationExcelController.java",
        "admin/…/PaymentDailyGraphController.java",
        "admin/…/event/query/controller/EventQueryController.java",
      ],
      endpoints: [
        "GET /admin-api/v1/admin/registrations · …/{id} · …/{eventId}/statistics",
        "GET/POST …/registrations/excel/download",
        "PATCH …/registrations/{id}/basic-info · PUT …/password",
        "POST …/events/{eventId}/registrations/unpaid-cancellations",
      ],
    },
  },
  {
    id: "ac-org",
    label: "단체 Controller",
    sub: "OrganizationQuery · Command",
    icon: "building",
    accent: C.ctrl,
    zone: "ctrl",
    x: CA,
    y: 990,
    detail: {
      summary: "단체 목록·상세, 비밀번호·로그인 ID·기본정보 변경.",
      files: ["admin/…/user/query/controller/OrganizationQueryController.java", "admin/…/OrganizationCommandController.java"],
      endpoints: ["GET /admin-api/v1/admin/organizations", "PUT …/{id}/password · …/{id}/loginId"],
    },
  },
  {
    id: "ac-capacity",
    label: "정원 Controller",
    sub: "AdminCapacityQuery",
    icon: "gauge",
    accent: C.ctrl,
    zone: "ctrl",
    x: CB,
    y: 990,
    detail: {
      summary: "정원 현황과 정원별 참가자 조회.",
      files: ["admin/…/capacity/query/controller/AdminCapacityQueryController.java"],
      endpoints: ["GET /admin-api/v1/admin/events/{eventId}/capacities", "GET …/capacities/{capacityId}/registrations"],
    },
  },
  {
    id: "ac-refund",
    label: "환불 배치 · 증거",
    sub: "AdminRefundBatch · Evidence",
    icon: "wallet",
    accent: C.ctrl,
    zone: "ctrl",
    x: CA,
    y: 1110,
    detail: {
      summary:
        "전액·부분 환불을 요청 단위 배치로 처리하고 requestId로 결과를 다시 조회합니다. cron이 아니라 HTTP 요청으로 도는 배치입니다.",
      files: [
        "admin/…/payment/command/batch/AdminRefundBatchController.java",
        "admin/…/AdminRefundEvidenceController.java",
      ],
      endpoints: [
        "POST /admin-api/v1/admin/events/{eid}/payment-refunds",
        "POST …/payment-partial-refunds",
        "GET …/payment-refund-results?requestId=",
        "GET …/payment-refund-batches/{batchId}[/items]",
        "POST/GET …/payment-refunds/{paymentCancelId}/evidence",
      ],
    },
  },
  {
    id: "ac-payment",
    label: "결제 조회 Controller",
    sub: "AdminPaymentQuery",
    icon: "receipt",
    accent: C.ctrl,
    zone: "ctrl",
    x: CB,
    y: 1110,
    detail: {
      summary: "개인·단체 결제/환불 내역과 결제 처리 로그(PaymentProcessLog) 조회.",
      files: ["admin/…/payment/query/AdminPaymentQueryController.java"],
      endpoints: ["GET …/registrations/{rid}/payments", "GET …/organizations/{oid}/payments", "GET …/payments/{pid}/logs"],
    },
  },
  {
    id: "ac-community",
    label: "공지 · 답변 Controller",
    sub: "NoticeCommand · AnswerCommand",
    icon: "bell",
    accent: C.ctrl,
    zone: "ctrl",
    x: CA,
    y: 1230,
    detail: {
      summary: "공지 생성·수정·삭제, 문의 답변 작성·수정·삭제. @PreAuthorize(총관리자·게시판 관리자).",
      files: ["admin/…/community/command/application/controller/NoticeCommandController.java", "admin/…/AnswerCommandController.java"],
      endpoints: ["POST /admin-api/v1/notice · PUT/DELETE …/{id}", "POST /admin-api/v1/questions/{id}/answer"],
    },
  },
  {
    id: "ac-offline",
    label: "오프라인 import",
    sub: "offline-payments/import",
    icon: "upload",
    accent: C.ctrl,
    zone: "ctrl",
    x: CB,
    y: 1230,
    detail: {
      summary: "현장·외부 결제분을 엑셀로 올려 신청으로 등록합니다.",
      files: ["admin/…/event/command/application/controller/RegistrationCommandController.java"],
      endpoints: ["POST /admin-api/v1/admin/events/{eventId}/registrations/offline-payments/import"],
    },
  },

  // ── User Service
  {
    id: "s-register",
    label: "RegistrationCommandService",
    sub: "개인 · 단체 신청",
    icon: "form",
    accent: C.svc,
    zone: "svc",
    x: SA,
    y: 170,
    detail: {
      summary:
        "@Transactional register: 대회 잠금 → 신청 검증 → 가격 계산 → 정원 홀드 → Registration 저장 → Payment(READY)·PaymentAllocation 생성. 재시도(prepareRepayment)와 예약 반환(releaseReservation)도 여기서 합니다.",
      files: [
        "user/…/event/command/application/service/RegistrationCommandService.java",
        "user/…/event/command/application/service/OrgRegistrationCommandService.java",
        "user/…/RegistrationPricingService.java · RegistrationApplyValidator.java",
        "user/…/PaymentCreator.java · PaymentAllocationCreator.java",
      ],
    },
  },
  {
    id: "s-capacity",
    label: "CapacityHoldService",
    sub: "Reservation · Capacity",
    icon: "gauge",
    accent: C.svc,
    zone: "svc",
    x: SB,
    y: 170,
    detail: {
      summary:
        "정원 홀드는 Redis가 아니라 MySQL입니다. capacity 카운터를 조건부 UPDATE로 올리고 Reservation을 HELD로 저장합니다. 호출자 트랜잭션 안에서만 동작합니다(MANDATORY).",
      files: [
        "user/…/capacity/command/application/service/CapacityHoldService.java",
        "user/…/capacity/command/application/service/ReservationPaymentService.java",
        "user/…/capacity/command/application/domain/Capacity.java · Reservation.java",
      ],
      notes: [
        "ReservationStatus: HELD → PROCESSING → CONSUMED | RELEASED",
        "CapacityType: EVENT_TOTAL · CATEGORY · CHILD_CATEGORY · CATEGORY_GROUP · SOUVENIR",
        "expiresAt 자동 만료는 MVP에서 미사용",
      ],
    },
  },
  {
    id: "s-confirm",
    label: "PaymentConfirmService",
    sub: "Tx1 → Toss → Tx2",
    icon: "bolt",
    accent: C.svc,
    zone: "svc",
    x: SA,
    y: 300,
    detail: {
      summary:
        "승인 오케스트레이터. 트랜잭션을 두 개로 나누고 Toss HTTP 호출은 반드시 트랜잭션 밖에서 합니다. 그래서 외부 호출이 느려도 DB 잠금을 오래 잡지 않습니다.",
      files: [
        "user/…/payment/command/application/PaymentConfirmService.java",
        "user/…/payment/command/infrastructure/toss/client/TossPaymentClient.java",
      ],
      notes: [
        "성공: Tx2 completeConfirm",
        "명확한 실패: failConfirm (FAILED · 예약 HELD 복원)",
        "결과 불명: markConfirmUnknown (UNKNOWN · 수동 확인 전제)",
      ],
    },
  },
  {
    id: "s-tx",
    label: "PaymentConfirmTransactionService",
    sub: "@Transactional 경계",
    icon: "layers",
    accent: C.svc,
    zone: "svc",
    x: SB,
    y: 300,
    detail: {
      summary:
        "Tx1 beginConfirm: orderId로 Payment 잠금, 금액·READY·결제 마감 검증, READY→CONFIRMING, Reservation HELD→PROCESSING, 로그 CONFIRM_REQUESTED. Tx2 completeConfirm: Toss 응답(DONE) 검증 → COMPLETED, Reservation CONSUMED, allocation paidAmount, 로그 CONFIRM_SUCCEEDED.",
      files: ["user/…/payment/command/application/PaymentConfirmTransactionService.java", "user/…/EventPaymentPolicyValidator.java"],
      notes: ["PaymentProcessStatus: READY · CONFIRMING · COMPLETED · FAILED · UNKNOWN · INVALIDATED"],
    },
  },
  {
    id: "s-query",
    label: "RegistrationQueryService",
    sub: "조회 · 결제 상태",
    icon: "search",
    accent: C.svc,
    zone: "svc",
    x: SA,
    y: 430,
    detail: {
      summary: "비밀번호로 본인 확인 후 접수·결제 정보를 조립합니다. 세션이나 토큰 없이 요청마다 검증합니다.",
      files: [
        "user/…/event/query/service/RegistrationQueryService.java",
        "user/…/RegistrationQueryRepository.java",
        "user/…/RegistrationPaymentQueryResolver.java",
      ],
      notes: ["RegistrationReceiptQueryService는 존재하지만 현재 어떤 Controller에서도 호출하지 않음"],
    },
  },
  {
    id: "s-community",
    label: "공지 · 문의 Service",
    sub: "Question · Notice · Answer",
    icon: "chat",
    accent: C.svc,
    zone: "svc",
    x: SB,
    y: 430,
    detail: {
      summary: "문의 CRUD와 공지·답변 조회. 첨부파일은 로컬 디스크에 저장합니다.",
      files: [
        "user/…/community/command/application/service/QuestionCommandService.java",
        "user/…/community/query/service/NoticeQueryService.java",
        "user/…/AttachmentCommandService.java",
      ],
    },
  },

  // ── Admin Service
  {
    id: "s-adminauth",
    label: "AdminCommandService",
    sub: "BCrypt · JWT",
    icon: "key",
    accent: C.svc,
    zone: "svc",
    x: SA,
    y: 870,
    detail: {
      summary:
        "login: BCrypt 비밀번호 확인 → access/refresh JWT 발급 → Redis refresh:{adminId} 저장. refresh: 화이트리스트 대조 후 재발급. logout: access를 blacklist에 넣고 refresh 삭제.",
      files: ["admin/…/auth/command/application/service/AdminCommandService.java", "admin/…/AdminCommandRepository.java"],
    },
  },
  {
    id: "s-adminreg",
    label: "신청 관리 Service",
    sub: "조회 · 통계 · 엑셀",
    icon: "chart",
    accent: C.svc,
    zone: "svc",
    x: SB,
    y: 870,
    detail: {
      summary: "관리자용 신청·단체 조회, 통계 집계, POI 엑셀 생성, 기본정보 수정과 미결제 취소.",
      files: ["admin/…/event/query/service/RegistrationQueryService.java", "admin/…/event/command/application/service/RegistrationCommandService.java"],
    },
  },
  {
    id: "s-refund",
    label: "AdminRefundBatchService",
    sub: "Toss cancel",
    icon: "wallet",
    accent: C.svc,
    zone: "svc",
    x: SA,
    y: 1110,
    detail: {
      summary:
        "환불 배치 항목마다 Toss 취소를 호출하고 PaymentCancel·PaymentCancelAllocation에 결과를 남깁니다. Toss 호출 중 트랜잭션이 열려 있으면 클라이언트가 막습니다.",
      files: [
        "admin/…/payment/command/batch/AdminRefundBatchService.java",
        "admin/…/payment/command/infrastructure/toss/refund/TossPaymentCancelClient.java",
      ],
      notes: ["PaymentCancelStatus: PROCESSING · DONE · FAILED · UNKNOWN"],
    },
  },
  {
    id: "s-evidence",
    label: "AdminRefundEvidenceClient",
    sub: "Toss 결제 조회",
    icon: "search",
    accent: C.svc,
    zone: "svc",
    x: SB,
    y: 1110,
    detail: {
      summary: "환불 근거를 남기기 위해 Toss 결제 상태를 직접 조회해 저장합니다.",
      files: ["admin/…/payment/command/evidence/AdminRefundEvidenceClient.java"],
      endpoints: ["GET https://api.tosspayments.com/v1/payments/{paymentKey}"],
    },
  },
  {
    id: "s-offline",
    label: "OfflineRegistrationImportService",
    sub: "엑셀 → 신청",
    icon: "upload",
    accent: C.svc,
    zone: "svc",
    x: SB,
    y: 1230,
    detail: {
      summary:
        "엑셀을 읽어 검증하고, admin 쪽 CapacityHoldService로 정원을 잡은 뒤 Toss 필드 없는 외부결제 Payment로 저장합니다.",
      files: [
        "admin/…/event/command/application/service/OfflineRegistrationImportService.java",
        "admin/…/OfflineRegistrationCapacityService.java · OfflineRegistrationPersistenceService.java",
        "admin/…/capacity/command/application/service/CapacityHoldService.java",
      ],
    },
  },

  // ── 데이터 · 외부
  {
    id: "d-mysql",
    label: "MySQL",
    sub: "JPA · common-entity",
    icon: "database",
    accent: C.data,
    zone: "data",
    x: D,
    y: 300,
    detail: {
      summary:
        "user·admin 두 앱이 같은 DB를 씁니다. 공통 컬럼은 common-entity의 @MappedSuperclass(*Base)이고, 각 앱이 같은 테이블명으로 @Entity를 따로 둡니다.",
      files: ["common-entity/build.gradle", "common-entity/…/entity/*Base.java", "common-entity/…/inheritance_enum/*"],
      notes: [
        "신청: registration · event · event_category · organization · souvenir",
        "결제: payment · payment_allocation · payment_cancel · payment_process_log",
        "정원: capacity · capacity_category · reservation · reservation_item",
        "게시판: notice · question · answer · attachment",
        "계정: user · admin · role",
        "datasource 설정은 API-KEY.yml에서 import",
      ],
    },
  },
  {
    id: "d-files",
    label: "첨부파일 디스크",
    sub: "/app/data/attachments",
    icon: "file",
    accent: C.data,
    zone: "data",
    x: D,
    y: 430,
    detail: {
      summary: "문의 첨부는 S3가 아니라 컨테이너 로컬 디스크(LOCAL)에 저장합니다. 파일당 5MB, 최대 3개.",
      files: ["user/src/main/resources/application.yml (attachment.storage.default-type: LOCAL)"],
    },
  },
  {
    id: "x-toss",
    label: "Toss Payments",
    sub: "api.tosspayments.com",
    icon: "wallet",
    accent: C.ext,
    zone: "data",
    x: D,
    y: 600,
    external: true,
    detail: {
      summary:
        "브라우저는 클라이언트 키로 결제창만 띄우고, 승인·취소·조회는 서버가 시크릿 키로 호출합니다. 인증은 HTTP Basic(시크릿키 + 빈 비밀번호)이고 승인·취소에는 Idempotency-Key를 붙입니다.",
      endpoints: [
        "POST /v1/payments/confirm (user)",
        "POST /v1/payments/{paymentKey}/cancel (user 수정환불 · admin 배치)",
        "GET /v1/payments/{paymentKey} (admin 증거)",
      ],
      notes: ["TossPaymentStatus: READY · IN_PROGRESS · DONE · CANCELED · PARTIAL_CANCELED · ABORTED · EXPIRED", "Webhook 엔드포인트는 없음"],
    },
  },
  {
    id: "d-secrets",
    label: "백엔드 시크릿",
    sub: "API-KEY.yml",
    icon: "key",
    accent: C.data,
    zone: "data",
    x: D,
    y: 760,
    detail: {
      summary:
        "datasource, JWT(token.*), TOSS_SECRET_KEY, Redis 비밀번호 등은 repo에 없고 배포 시 /opt/marvelrun/secrets/API-KEY.yml로 들어가 optional:file:/app/API-KEY.yml로 import됩니다.",
      env: [
        "TOSS_SECRET_KEY",
        "token.secret · token.issuer · token.expirationTime.*",
        "redis.secret.compose_name · redis.secret.password",
        "otp-phnum-hash-secret · infra.admin-server.from-secret-key",
      ],
    },
  },
  {
    id: "d-redis",
    label: "Redis",
    sub: "관리자 JWT 전용",
    icon: "bolt",
    accent: C.data,
    zone: "data",
    x: D,
    y: 1050,
    detail: {
      summary:
        "정원·세션·캐시용이 아닙니다. 관리자 토큰만 다룹니다: refresh:{adminId} (refresh 화이트리스트), blacklist:access:{token} (로그아웃된 access).",
      files: ["admin/…/common/redis/RedisService.java", "user/…/common/redis/RedisService.java"],
    },
  },

  // ── 배포
  {
    id: "dp-gh",
    label: "GitHub Actions",
    sub: "prod-deploy · test-deploy",
    icon: "bolt",
    accent: C.deploy,
    zone: "deploy",
    x: A,
    y: 1430,
    detail: {
      summary:
        "프론트: main push → prod-deploy.yml, PR→develop → test-deploy.yml. 백엔드: prod-deploy-user.yml · prod-admin-deploy.yml 등 앱별 워크플로. AWS는 OIDC 역할로 접근합니다.",
      files: [
        "MARVEL-RUN/.github/workflows/prod-deploy.yml",
        "MARVEL-RUN/.github/workflows/test-deploy.yml",
        "MARVEL-Backend-develop/.github/workflows/prod-deploy-user.yml",
        "MARVEL-Backend-develop/.github/workflows/prod-admin-deploy.yml",
      ],
    },
  },
  {
    id: "dp-ecr",
    label: "Amazon ECR",
    sub: "marvelrun/frontend · backend",
    icon: "layers",
    accent: C.deploy,
    zone: "deploy",
    x: 1200,
    y: 1430,
    detail: {
      summary:
        "프론트는 node:22 빌드 → nginx:alpine 이미지(out/ 정적 파일), 백엔드는 Temurin 21로 jar를 빌드한 이미지를 올립니다.",
      files: ["MARVEL-RUN/Dockerfile", "MARVEL-RUN/frontend-nginx.conf", "user/Dockerfile", "admin/Dockerfile"],
    },
  },
  {
    id: "dp-ec2",
    label: "서버 · docker compose",
    sub: "테스트 EC2 · 운영 Cafe24",
    icon: "server",
    accent: C.deploy,
    zone: "deploy",
    x: SA,
    y: 1430,
    detail: {
      summary:
        "SSM Run Command로 서버에 명령을 보내 compose로 frontend(nginx) · user-backend · admin-backend 컨테이너를 갱신합니다. 테스트는 AWS EC2(i-…), 운영은 SSM Hybrid Managed Node로 등록된 Cafe24 서버(mi-…)입니다.",
      notes: [
        "프론트 배포에 S3/CloudFront는 쓰지 않음",
        "nginx: try_files $uri $uri.html $uri/ =404",
        "테스트 API-KEY.yml: EC2 Instance Connect + scp로 전달",
        "운영 API-KEY.yml: age로 암호화 → SSM 명령 안에서 복호화·sha256 검증",
        "도메인: 운영 marvelrunkorea2026.com · 테스트 marathontest2026.duckdns.org",
      ],
    },
  },
];

export const WIRE_EDGES: WireEdge[] = [
  // 참가자 흐름
  { id: "u-home", from: "u-runner", to: "p-home", label: "방문", kind: "nav" },
  { id: "u-reg", from: "u-runner", to: "p-register", label: "신청서 작성", kind: "nav" },
  { id: "u-lookup", from: "u-runner", to: "p-lookup", label: "내 신청 조회", kind: "nav" },
  { id: "u-comm", from: "u-runner", to: "p-community", label: "공지 · 문의", kind: "nav" },
  { id: "mode-home", from: "l-mode", to: "p-home", label: "coming-soon / main", kind: "config", dashed: true },
  { id: "env-mode", from: "l-env", to: "l-mode", label: "APP_MODE · REGISTRATION_OPEN", kind: "config", dashed: true },
  { id: "env-fetch", from: "l-env", to: "l-mainfetch", label: "API_BASE_URL", kind: "config", dashed: true },
  { id: "env-toss", from: "l-env", to: "l-toss", label: "TOSS_CLIENT_KEY", kind: "config", dashed: true },
  { id: "home-kakao", from: "p-home", to: "x-kakao", label: "지도 SDK", kind: "sdk" },
  { id: "reg-fetch", from: "p-register", to: "l-mainfetch", label: "createRegistration", kind: "http" },
  { id: "reg-session", from: "p-register", to: "l-session", label: "savePendingPayment", kind: "call" },
  { id: "reg-pay", from: "p-register", to: "p-payment", label: "router.push(/payment)", kind: "nav" },
  { id: "pay-session", from: "p-payment", to: "l-session", label: "pending 읽기", kind: "call" },
  { id: "pay-toss", from: "p-payment", to: "l-toss", label: "renderPaymentMethods", kind: "sdk" },
  { id: "toss-pg", from: "l-toss", to: "x-toss", label: "requestPayment", kind: "sdk" },
  { id: "pg-success", from: "x-toss", to: "p-success", label: "successUrl?paymentKey&orderId&amount", kind: "redirect" },
  { id: "pg-fail", from: "x-toss", to: "p-fail", label: "failUrl?code&message", kind: "redirect", dashed: true },
  { id: "success-fetch", from: "p-success", to: "l-mainfetch", label: "confirmPayment", kind: "http" },
  { id: "fail-pay", from: "p-fail", to: "p-payment", label: "다시 결제", kind: "nav", dashed: true },
  { id: "lookup-fetch", from: "p-lookup", to: "l-mainfetch", label: "lookup · retry · cancel", kind: "http" },
  { id: "lookup-session", from: "p-lookup", to: "l-session", label: "재시도 pending 저장", kind: "call" },
  { id: "comm-fetch", from: "p-community", to: "l-mainfetch", label: "notices · questions", kind: "http" },
  { id: "fetch-api", from: "l-mainfetch", to: "api-user", label: "HTTPS /api/v1/public/**", kind: "http" },

  // User API 내부
  { id: "api-creg", from: "api-user", to: "c-registration", label: "POST …/registrations", kind: "http" },
  { id: "api-cquery", from: "api-user", to: "c-query", label: "POST …/lookup", kind: "http" },
  { id: "api-cmod", from: "api-user", to: "c-modify", label: "PATCH · retry · cancellation", kind: "http" },
  { id: "api-cpay", from: "api-user", to: "c-payment", label: "POST /payments/confirm", kind: "http" },
  { id: "api-cevent", from: "api-user", to: "c-event", label: "GET registration-options", kind: "http" },
  { id: "api-ccomm", from: "api-user", to: "c-community", label: "notices · questions", kind: "http" },
  { id: "creg-sreg", from: "c-registration", to: "s-register", label: "register()", kind: "call" },
  { id: "sreg-cap", from: "s-register", to: "s-capacity", label: "holdAll (MANDATORY)", kind: "call" },
  { id: "sreg-db", from: "s-register", to: "d-mysql", label: "registration · payment READY", kind: "db" },
  { id: "cap-db", from: "s-capacity", to: "d-mysql", label: "capacity UPDATE · reservation HELD", kind: "db" },
  { id: "cpay-conf", from: "c-payment", to: "s-confirm", label: "confirm()", kind: "call" },
  { id: "conf-tx", from: "s-confirm", to: "s-tx", label: "Tx1 begin / Tx2 complete", kind: "call" },
  { id: "tx-db", from: "s-tx", to: "d-mysql", label: "상태 전이 · process_log", kind: "db" },
  { id: "conf-toss", from: "s-confirm", to: "x-toss", label: "POST /v1/payments/confirm", kind: "http" },
  { id: "secret-conf", from: "d-secrets", to: "s-confirm", label: "TOSS_SECRET_KEY", kind: "config", dashed: true },
  { id: "cquery-squery", from: "c-query", to: "s-query", label: "본인 확인 · 조회", kind: "call" },
  { id: "squery-db", from: "s-query", to: "d-mysql", label: "SELECT", kind: "db" },
  { id: "cmod-sreg", from: "c-modify", to: "s-register", label: "prepareRepayment · release", kind: "call" },
  { id: "cevent-db", from: "c-event", to: "d-mysql", label: "종목 · 기념품 옵션", kind: "db" },
  { id: "ccomm-scomm", from: "c-community", to: "s-community", label: "문의 CRUD", kind: "call" },
  { id: "scomm-db", from: "s-community", to: "d-mysql", label: "notice · question · answer", kind: "db" },
  { id: "scomm-files", from: "s-community", to: "d-files", label: "첨부 저장", kind: "db" },

  // 관리자 흐름
  { id: "a-login", from: "u-admin", to: "a-login", label: "로그인", kind: "nav" },
  { id: "a-dash", from: "u-admin", to: "a-dashboard", kind: "nav" },
  { id: "a-apps", from: "u-admin", to: "a-applications", label: "신청 관리", kind: "nav" },
  { id: "a-members", from: "u-admin", to: "a-members", kind: "nav" },
  { id: "a-cap", from: "u-admin", to: "a-capacities", kind: "nav" },
  { id: "a-boards", from: "u-admin", to: "a-boards", label: "게시판", kind: "nav" },
  { id: "a-local", from: "u-admin", to: "a-local", kind: "nav" },
  { id: "login-fetch", from: "a-login", to: "l-adminfetch", label: "{ loginId, password }", kind: "http" },
  { id: "dash-fetch", from: "a-dashboard", to: "l-adminfetch", label: "statistics · graph", kind: "http" },
  { id: "apps-fetch", from: "a-applications", to: "l-adminfetch", label: "registrations · refunds", kind: "http" },
  { id: "members-fetch", from: "a-members", to: "l-adminfetch", label: "organizations", kind: "http" },
  { id: "cap-fetch", from: "a-capacities", to: "l-adminfetch", label: "capacities", kind: "http" },
  { id: "boards-fetch", from: "a-boards", to: "l-adminfetch", label: "notice · answer", kind: "http" },
  { id: "local-store", from: "a-local", to: "l-localstore", label: "서버 없음", kind: "call", dashed: true },
  { id: "adminfetch-auth", from: "l-adminfetch", to: "l-adminauth", label: "access / refresh 저장", kind: "call" },
  { id: "adminfetch-api", from: "l-adminfetch", to: "api-admin", label: "Bearer · 401→refresh 1회", kind: "http" },
  { id: "apiadmin-auth", from: "api-admin", to: "ac-auth", label: "public/login · refresh", kind: "http" },
  { id: "apiadmin-jwt", from: "api-admin", to: "sec-jwt", label: "인증 필요 요청", kind: "call" },
  { id: "jwt-redis", from: "sec-jwt", to: "d-redis", label: "blacklist 확인", kind: "db" },
  { id: "jwt-acreg", from: "sec-jwt", to: "ac-registration", kind: "call" },
  { id: "jwt-acorg", from: "sec-jwt", to: "ac-org", kind: "call" },
  { id: "jwt-accap", from: "sec-jwt", to: "ac-capacity", kind: "call" },
  { id: "jwt-acrefund", from: "sec-jwt", to: "ac-refund", kind: "call" },
  { id: "jwt-acpay", from: "sec-jwt", to: "ac-payment", kind: "call" },
  { id: "jwt-accomm", from: "sec-jwt", to: "ac-community", label: "@PreAuthorize", kind: "call" },
  { id: "jwt-acoffline", from: "sec-jwt", to: "ac-offline", kind: "call" },
  { id: "acauth-sauth", from: "ac-auth", to: "s-adminauth", label: "login()", kind: "call" },
  { id: "sauth-db", from: "s-adminauth", to: "d-mysql", label: "admin BCrypt", kind: "db" },
  { id: "sauth-redis", from: "s-adminauth", to: "d-redis", label: "refresh:{adminId}", kind: "db" },
  { id: "acreg-sadminreg", from: "ac-registration", to: "s-adminreg", kind: "call" },
  { id: "acorg-sadminreg", from: "ac-org", to: "s-adminreg", kind: "call" },
  { id: "sadminreg-db", from: "s-adminreg", to: "d-mysql", label: "조회 · 통계 · 엑셀", kind: "db" },
  { id: "accap-db", from: "ac-capacity", to: "d-mysql", label: "capacity 조회", kind: "db" },
  { id: "acpay-db", from: "ac-payment", to: "d-mysql", label: "payment · process_log", kind: "db" },
  { id: "acrefund-srefund", from: "ac-refund", to: "s-refund", label: "배치 실행", kind: "call" },
  { id: "srefund-toss", from: "s-refund", to: "x-toss", label: "POST …/{paymentKey}/cancel", kind: "http" },
  { id: "srefund-db", from: "s-refund", to: "d-mysql", label: "payment_cancel", kind: "db" },
  { id: "acrefund-evid", from: "ac-refund", to: "s-evidence", label: "evidence", kind: "call" },
  { id: "evid-toss", from: "s-evidence", to: "x-toss", label: "GET /v1/payments/{key}", kind: "http" },
  { id: "accomm-db", from: "ac-community", to: "d-mysql", label: "notice · answer", kind: "db" },
  { id: "acoffline-soffline", from: "ac-offline", to: "s-offline", label: "엑셀 업로드", kind: "call" },
  { id: "soffline-cap", from: "s-offline", to: "s-capacity", label: "정원 홀드 (admin 미러)", kind: "call" },
  { id: "soffline-db", from: "s-offline", to: "d-mysql", label: "외부결제 Payment", kind: "db" },

  // 배포
  { id: "gh-ecr", from: "dp-gh", to: "dp-ecr", label: "docker build · push", kind: "deploy" },
  { id: "ecr-ec2", from: "dp-ecr", to: "dp-ec2", label: "SSM · compose pull/up", kind: "deploy" },
  { id: "ec2-user", from: "dp-ec2", to: "api-user", label: "user-backend", kind: "deploy", dashed: true },
  { id: "ec2-admin", from: "dp-ec2", to: "api-admin", label: "admin-backend", kind: "deploy", dashed: true },
  { id: "ec2-secrets", from: "dp-ec2", to: "d-secrets", label: "age 복호화", kind: "deploy", dashed: true },
  { id: "gh-env", from: "dp-gh", to: "l-env", label: "build-arg 주입", kind: "deploy", dashed: true },
];

export const WIRE_SCENARIOS: Scenario[] = [
  {
    id: "pay",
    title: "참가신청 → 결제 → 승인",
    summary: "신청서 제출부터 Toss 승인 확정까지, 화면·API·트랜잭션·DB를 한 줄로 따라갑니다.",
    steps: [
      { edge: "u-reg", title: "신청서 작성", detail: "참가자가 /register에서 개인 또는 단체 신청서를 씁니다. RegistrationGate가 접수 기간인지 먼저 확인합니다." },
      { edge: "reg-fetch", title: "신청 제출", detail: "createRegistration이 POST v1/public/events/{eventId}/registrations 를 만듭니다." },
      { edge: "fetch-api", title: "공개 API 호출", detail: "mainFetch가 NEXT_PUBLIC_API_BASE_URL(/api)로 보냅니다. /v1/public/** 는 permitAll이라 토큰이 없습니다." },
      { edge: "api-creg", title: "Controller 도착", detail: "RegistrationCommandController가 요청 DTO를 @Valid로 검증합니다." },
      { edge: "creg-sreg", title: "신청 트랜잭션 시작", detail: "RegistrationCommandService.register(@Transactional): 대회를 잠그고 신청 정책과 가격을 계산합니다." },
      { edge: "sreg-cap", title: "정원 홀드", detail: "CapacityHoldService.holdAll이 같은 트랜잭션 안에서 capacity 카운터를 조건부 UPDATE합니다. 남는 자리가 없으면 여기서 실패합니다." },
      { edge: "cap-db", title: "예약 HELD", detail: "Reservation이 HELD 상태로 저장됩니다. Redis가 아니라 MySQL입니다." },
      { edge: "sreg-db", title: "결제 대기 생성", detail: "Registration과 Payment(READY)·PaymentAllocation을 저장하고 orderId와 금액을 응답합니다." },
      { edge: "reg-session", title: "주문 보관", detail: "프론트가 orderId·orderName·금액을 sessionStorage marvelrun_payment_pending에 저장합니다." },
      { edge: "reg-pay", title: "결제 화면 이동", detail: "router.push로 /payment에 갑니다." },
      { edge: "pay-toss", title: "위젯 렌더", detail: "PaymentWidget이 setAmount → renderPaymentMethods → renderAgreement 순서로 결제창을 그립니다." },
      { edge: "toss-pg", title: "결제 요청", detail: "requestPayment로 Toss 결제창이 뜹니다. 여기까지는 공개 클라이언트 키만 씁니다." },
      { edge: "pg-success", title: "성공 리다이렉트", detail: "Toss가 /payment/success?paymentKey&orderId&amount 로 돌려보냅니다. 아직 돈이 확정된 것은 아닙니다." },
      { edge: "success-fetch", title: "승인 요청", detail: "confirmPayment가 POST v1/public/payments/confirm 에 paymentKey·orderId·amount를 보냅니다." },
      { edge: "api-cpay", title: "승인 Controller", detail: "PaymentCommandController가 PaymentConfirmService.confirm을 호출합니다." },
      { edge: "conf-tx", title: "Tx1 · beginConfirm", detail: "orderId로 Payment를 잠그고 금액·READY 상태·결제 마감을 검증한 뒤 READY→CONFIRMING, 예약 HELD→PROCESSING으로 바꿉니다." },
      { edge: "tx-db", title: "Tx1 커밋", detail: "PaymentProcessLog에 CONFIRM_REQUESTED를 남기고 커밋합니다. DB 잠금은 여기서 풀립니다." },
      { edge: "secret-conf", title: "시크릿 키 사용", detail: "TOSS_SECRET_KEY는 API-KEY.yml에서만 옵니다. 브라우저 번들에는 절대 들어가지 않습니다." },
      { edge: "conf-toss", title: "Toss 승인 (트랜잭션 밖)", detail: "POST /v1/payments/confirm, Basic 인증(시크릿키:) + Idempotency-Key. 트랜잭션 밖이라 느려도 DB를 붙잡지 않습니다." },
      { edge: "conf-tx", title: "Tx2 · completeConfirm", detail: "응답의 paymentKey·orderId·amount·DONE을 검증하고 COMPLETED, 예약 CONSUMED, allocation paidAmount를 반영합니다." },
      { edge: "tx-db", title: "Tx2 커밋 (또는 보상)", detail: "성공이면 CONFIRM_SUCCEEDED. 명확한 실패면 FAILED + 예약 HELD 복원, 결과가 불명확하면 UNKNOWN으로 남겨 수동 확인합니다." },
      { edge: "success-fetch", title: "완료", detail: "응답이 성공이면 프론트가 clearPendingPayment로 pending을 지우고 완료 화면을 보여줍니다." },
    ],
  },
  {
    id: "retry",
    title: "결제 실패 · 재시도",
    summary: "결제창에서 실패했거나 나중에 다시 결제하는 두 갈래.",
    steps: [
      { edge: "pg-fail", title: "실패 리다이렉트", detail: "Toss가 /payment/fail?code&message&orderId 로 돌려보냅니다." },
      { edge: "fail-pay", title: "바로 다시 결제", detail: "pending이 남아 있으면 '다시 결제'로 /payment에 돌아갑니다. 같은 주문(READY)을 그대로 씁니다." },
      { edge: "u-lookup", title: "나중에 조회", detail: "탭을 닫아 pending이 없어졌다면 /lookup에서 본인 확인을 합니다." },
      { edge: "lookup-fetch", title: "재시도 요청", detail: "retryIndividualPayment → POST …/registrations/{id}/payments/{paymentId}/retry" },
      { edge: "fetch-api", title: "User API", detail: "공개 API이므로 토큰 대신 요청 본문의 비밀번호로 본인 확인합니다." },
      { edge: "api-cmod", title: "재준비 Controller", detail: "RegistrationModificationController가 받습니다." },
      { edge: "cmod-sreg", title: "prepareRepayment", detail: "정원을 다시 확보(reacquire)하고 새 Payment(READY)를 만듭니다." },
      { edge: "sreg-db", title: "새 주문 저장", detail: "새 orderId와 금액을 응답합니다." },
      { edge: "lookup-session", title: "pending 다시 저장", detail: "paymentOrderFromRetry로 주문을 만들어 sessionStorage에 넣습니다." },
      { edge: "pay-toss", title: "결제창 재진입", detail: "/payment에서 위젯을 다시 그리고, 이후는 '참가신청 → 결제 → 승인'과 같습니다." },
    ],
  },
  {
    id: "lookup",
    title: "신청 조회 · 수정 · 취소",
    summary: "로그인 없이 비밀번호로 본인 확인하는 조회·변경 경로.",
    steps: [
      { edge: "u-lookup", title: "조회 화면", detail: "/lookup에서 개인 또는 단체를 고르고 이름·연락처·비밀번호를 넣습니다." },
      { edge: "lookup-fetch", title: "lookup 요청", detail: "POST …/registrations/lookup (단체는 …/organizations/lookup). 세션·토큰은 없습니다." },
      { edge: "fetch-api", title: "User API", detail: "mainFetch → /api/v1/public/**" },
      { edge: "api-cquery", title: "조회 Controller", detail: "RegistrationQueryController" },
      { edge: "cquery-squery", title: "본인 확인", detail: "RegistrationQueryService가 요청마다 비밀번호를 검증합니다." },
      { edge: "squery-db", title: "접수 · 결제 조립", detail: "RegistrationPaymentQueryResolver가 결제 상태까지 합쳐 돌려줍니다." },
      { edge: "api-cmod", title: "수정 · 취소", detail: "PATCH …/registrations/{id} 또는 POST …/cancellation" },
      { edge: "cmod-sreg", title: "예약 반환", detail: "취소·종목 변경 시 releaseReservation·CapacityModificationService로 정원 수량을 되돌립니다. 결제된 건은 Toss 취소로 환불합니다." },
    ],
  },
  {
    id: "admin-auth",
    title: "관리자 로그인 · 토큰",
    summary: "JWT 발급, Redis 화이트리스트·블랙리스트, 401 자동 갱신.",
    steps: [
      { edge: "a-login", title: "로그인 화면", detail: "토큰이 없으면 AuthInitializer가 /admin/login?next= 로 보냅니다." },
      { edge: "login-fetch", title: "로그인 요청", detail: "POST v1/admin/public/login { loginId, password }" },
      { edge: "adminfetch-api", title: "Admin API", detail: "NEXT_PUBLIC_API_BASE_URL_ADMIN(/admin-api)로 갑니다." },
      { edge: "apiadmin-auth", title: "공개 인증 경로", detail: "/v1/admin/public/** 는 토큰 없이 받습니다." },
      { edge: "acauth-sauth", title: "AdminCommandService", detail: "BCrypt로 비밀번호를 확인합니다." },
      { edge: "sauth-db", title: "관리자 계정", detail: "admin · role 테이블" },
      { edge: "sauth-redis", title: "refresh 화이트리스트", detail: "Redis refresh:{adminId} 에 refresh 토큰을 저장합니다." },
      { edge: "adminfetch-auth", title: "토큰 보관", detail: "응답 본문 또는 authorization/refreshtoken 헤더의 토큰을 localStorage + zustand에 저장합니다." },
      { edge: "adminfetch-api", title: "이후 요청 · 401", detail: "Bearer access로 호출하다 401이면 refreshToken 헤더로 /public/refresh를 한 번 시도하고 재요청합니다." },
      { edge: "apiadmin-jwt", title: "JwtFilter", detail: "access 토큰 서명·만료를 검증합니다." },
      { edge: "jwt-redis", title: "블랙리스트", detail: "로그아웃 시 access는 blacklist:access:{token}에 들어가 남은 수명 동안 거부됩니다." },
    ],
  },
  {
    id: "refund",
    title: "관리자 환불 배치",
    summary: "운영자가 환불을 요청하면 서버가 Toss 취소를 건별로 처리합니다.",
    steps: [
      { edge: "a-apps", title: "신청 관리", detail: "/admin/applications에서 환불할 신청을 고릅니다." },
      { edge: "apps-fetch", title: "환불 요청", detail: "postFullRefund / postPartialRefund (NEXT_PUBLIC_ADMIN_REFUND_BATCH가 \"0\"이면 비활성)" },
      { edge: "adminfetch-api", title: "Admin API", detail: "Bearer 토큰과 함께 /admin-api 로 갑니다." },
      { edge: "apiadmin-jwt", title: "인증", detail: "JwtFilter 통과" },
      { edge: "jwt-acrefund", title: "환불 배치 Controller", detail: "POST …/payment-refunds · …/payment-partial-refunds — 요청 단위 배치(크론 아님)" },
      { edge: "acrefund-srefund", title: "배치 실행", detail: "AdminRefundBatchService가 항목마다 처리합니다." },
      { edge: "srefund-toss", title: "Toss 취소", detail: "POST /v1/payments/{paymentKey}/cancel + Idempotency-Key. 트랜잭션 안에서는 호출을 막아 둡니다." },
      { edge: "srefund-db", title: "취소 기록", detail: "payment_cancel · payment_cancel_allocation에 PROCESSING/DONE/FAILED/UNKNOWN을 남깁니다." },
      { edge: "acrefund-evid", title: "증거 저장", detail: "POST …/payment-refunds/{paymentCancelId}/evidence" },
      { edge: "evid-toss", title: "Toss 상태 조회", detail: "GET /v1/payments/{paymentKey} 결과를 근거로 저장합니다." },
    ],
  },
  {
    id: "community",
    title: "공지 · 문의",
    summary: "참가자 문의와 운영자 답변이 같은 DB를 거쳐 만나는 경로.",
    steps: [
      { edge: "u-comm", title: "게시판", detail: "/notices · /inquiry. FAQ는 서버가 아니라 localStorage 시드입니다." },
      { edge: "comm-fetch", title: "문의 작성", detail: "POST v1/public/questions?eventId= (비밀글은 비밀번호 포함)" },
      { edge: "fetch-api", title: "User API", detail: "공개 경로" },
      { edge: "api-ccomm", title: "문의 Controller", detail: "QuestionCommandController" },
      { edge: "ccomm-scomm", title: "QuestionCommandService", detail: "문의 저장" },
      { edge: "scomm-files", title: "첨부 저장", detail: "/app/data/attachments (LOCAL, 5MB × 3)" },
      { edge: "scomm-db", title: "question 테이블", detail: "문의가 저장됩니다." },
      { edge: "a-boards", title: "운영자 확인", detail: "/admin/boards/inquiry 에서 미답변 문의를 봅니다." },
      { edge: "boards-fetch", title: "답변 작성", detail: "POST v1/questions/{id}/answer" },
      { edge: "adminfetch-api", title: "Admin API", detail: "Bearer 토큰" },
      { edge: "jwt-accomm", title: "권한 확인", detail: "@PreAuthorize(총관리자 · 게시판 관리자)" },
      { edge: "accomm-db", title: "answer 저장", detail: "참가자가 POST v1/public/answers/{id}/detail 로 답변을 봅니다." },
    ],
  },
  {
    id: "offline",
    title: "오프라인 결제 import",
    summary: "현장·외부 결제분을 엑셀로 한 번에 등록합니다.",
    steps: [
      { edge: "a-apps", title: "신청 관리", detail: "운영자가 엑셀 파일을 준비합니다." },
      { edge: "apps-fetch", title: "업로드", detail: "POST …/registrations/offline-payments/import" },
      { edge: "adminfetch-api", title: "Admin API", detail: "Bearer 토큰" },
      { edge: "apiadmin-jwt", title: "인증", detail: "JwtFilter" },
      { edge: "jwt-acoffline", title: "import Controller", detail: "admin RegistrationCommandController" },
      { edge: "acoffline-soffline", title: "엑셀 파싱 · 검증", detail: "OfflineRegistrationImportService가 ExcelReader + Validator로 행을 검사합니다." },
      { edge: "soffline-cap", title: "정원 홀드", detail: "admin 쪽 CapacityHoldService(user와 같은 로직의 미러)로 자리를 잡습니다." },
      { edge: "soffline-db", title: "외부결제 저장", detail: "Toss 필드가 없는 외부결제 Payment로 registration과 함께 저장합니다." },
    ],
  },
  {
    id: "deploy",
    title: "배포 파이프라인",
    summary: "코드가 컨테이너가 되어 서버(테스트 EC2 · 운영 Cafe24)에서 뜨기까지.",
    steps: [
      { edge: "gh-env", title: "프론트 빌드 인자", detail: "GitHub vars/secrets가 NEXT_PUBLIC_* 를 Docker build-arg로 넣습니다. 이 값은 번들에 박힙니다." },
      { edge: "env-mode", title: "모드 결정", detail: "APP_MODE=main이면 build:main, 아니면 coming-soon 빌드." },
      { edge: "gh-ecr", title: "이미지 빌드 · 푸시", detail: "프론트: next build(output: export) → nginx:alpine. 백엔드: Temurin 21로 user-app.jar / admin-app.jar." },
      { edge: "ecr-ec2", title: "서버 반영", detail: "SSM Run Command로 서버에서 docker compose pull/up을 실행합니다. 테스트는 EC2(i-…), 운영은 Cafe24 Hybrid Managed Node(mi-…). 프론트 배포에 S3는 쓰지 않습니다." },
      { edge: "ec2-secrets", title: "시크릿 배치", detail: "API-KEY.yml을 /opt/marvelrun/secrets/ 에 둡니다. 운영은 age 암호문을 SSM 명령 안에서 풀고 sha256으로 검증, 테스트는 EC2 Instance Connect + scp." },
      { edge: "ec2-user", title: "user-backend", detail: "context-path /api, 8080 (actuator 9090)" },
      { edge: "ec2-admin", title: "admin-backend", detail: "context-path /admin-api" },
    ],
  },
];

/** 다른 탭의 노드 → 통합 지도 노드 */
export const NETWORK_TO_WIRE: Record<string, string> = {
  browser: "u-runner",
  "env-fe": "l-env",
  toss: "x-toss",
  api: "api-user",
  "env-be": "d-secrets",
  db: "d-mysql",
};

export const GIT_TO_WIRE: Record<string, string> = {
  "frontend:visitor": "u-runner",
  "frontend:mode": "l-mode",
  "frontend:coming": "l-mode",
  "frontend:home": "p-home",
  "frontend:eventinfo": "p-home",
  "frontend:guide": "p-home",
  "frontend:directions": "x-kakao",
  "frontend:boards": "p-community",
  "frontend:register": "p-register",
  "frontend:regoptions": "c-event",
  "frontend:registrationapi": "l-mainfetch",
  "frontend:lookup": "p-lookup",
  "frontend:payment": "p-payment",
  "frontend:paymentlib": "l-toss",
  "frontend:adminlayout": "u-admin",
  "frontend:adminauth": "l-adminfetch",
  "frontend:applications": "a-applications",
  "frontend:members": "a-members",
  "frontend:capacity": "a-capacities",
  "frontend:adminboards": "a-boards",
  "frontend:admincontent": "a-local",
  "frontend:dashboard": "a-dashboard",
  "frontend:publicapi": "api-user",
  "frontend:adminapi": "api-admin",
  "frontend:toss": "x-toss",
  "frontend:kakao": "x-kakao",
  "backend:user_actor": "u-runner",
  "backend:admin_actor": "u-admin",
  "backend:user_registration": "c-query",
  "backend:user_reg_repo": "s-query",
  "backend:user_receipt": "s-query",
  "backend:user_reg_command": "s-register",
  "backend:capacity_hold": "s-capacity",
  "backend:user_payment": "s-confirm",
  "backend:admin_auth": "s-adminauth",
  "backend:admin_registration": "s-adminreg",
  "backend:admin_reg_repo": "d-mysql",
  "backend:admin_capacity": "ac-capacity",
  "backend:admin_payment": "ac-payment",
  "backend:admin_offline": "s-offline",
  "backend:admin_org": "ac-org",
  "backend:community_user": "s-community",
  "backend:notice_user": "s-community",
  "backend:community_admin": "ac-community",
  "backend:notice_admin": "ac-community",
  "backend:registration": "d-mysql",
  "backend:payment": "d-mysql",
  "backend:redis": "d-redis",
};

export const WIRE_NODE_MAP = new Map(WIRE_NODES.map((n) => [n.id, n]));
export const WIRE_EDGE_MAP = new Map(WIRE_EDGES.map((e) => [e.id, e]));
export const WIRE_ZONE_MAP = new Map(WIRE_ZONES.map((z) => [z.id, z]));
