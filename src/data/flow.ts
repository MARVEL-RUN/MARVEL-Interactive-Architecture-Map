import type { IconName } from "@/components/WireIcon";

export type FlowNode = {
  id: string;
  label: string;
  sub: string;
  accent: string;
  icon: IconName;
};

export type TraceLayer = "client" | "api" | "db" | "pg" | "env";

export type TraceLine = {
  id: string;
  layer: TraceLayer;
  title: string;
  detail: string;
};

export type StackGroup = {
  title: string;
  accent: string;
  items: { name: string; desc: string }[];
};

export type SceneTable = {
  caption?: string;
  head: string[];
  rows: string[][];
};

/** wire: 통합 지도 노드 id · env: ENV 스위치 id("" = 목록) · scene: 같은 탭의 장면 id */
export type SceneLink = {
  label: string;
  wire?: string;
  env?: string;
  scene?: string;
};

export type FlowStep = {
  id: string;
  chapter?: string;
  reelTitle: string;
  headline: string;
  body: string;
  activePath: string[];
  packetFrom?: string;
  packetTo?: string;
  envHighlight?: "frontend" | "backend" | "both";
  serverLoad: "idle" | "api" | "db" | "pg";
  traces: TraceLine[];
  highlights?: string[];
  stacks?: StackGroup[];
  table?: SceneTable;
  links?: SceneLink[];
  code: {
    file: string;
    lines: string[];
  };
};

export const NODES: FlowNode[] = [
  {
    id: "browser",
    label: "브라우저",
    sub: "MARVEL-RUN (Next.js)",
    accent: "#5b8cff",
    icon: "browser",
  },
  {
    id: "env-fe",
    label: ".env.local",
    sub: "NEXT_PUBLIC_*",
    accent: "#7c5cff",
    icon: "file",
  },
  {
    id: "toss",
    label: "Toss Payments",
    sub: "결제창 · PG API",
    accent: "#38bdf8",
    icon: "wallet",
  },
  {
    id: "api",
    label: "User API",
    sub: "context-path /api",
    accent: "#22c55e",
    icon: "server",
  },
  {
    id: "env-be",
    label: "application.yml",
    sub: "TOSS_SECRET_KEY",
    accent: "#f59e0b",
    icon: "key",
  },
  {
    id: "db",
    label: "MySQL",
    sub: "Payment · Reservation · Log",
    accent: "#a78bfa",
    icon: "database",
  },
];

const CH_PREP = "준비";
const CH_PAY = "결제창";
const CH_CONFIRM = "승인";
const CH_BRANCH = "실패·예외";
const CH_AFTER = "상태·이후";

export const STEPS: FlowStep[] = [
  {
    id: "env",
    chapter: CH_PREP,
    reelTitle: "01 · ENV",
    headline: "공개 키 ↔ 시크릿 키 분리",
    body: "프론트는 NEXT_PUBLIC_ 만 번들에 포함됩니다. TOSS_SECRET_KEY는 Spring Boot 런타임(API-KEY.yml·배포 시크릿)으로만 주입되고, 브라우저 JS는 절대 볼 수 없습니다.",
    activePath: ["browser", "env-fe", "api", "env-be"],
    envHighlight: "both",
    serverLoad: "idle",
    traces: [
      {
        id: "fe-read",
        layer: "client",
        title: "Next.js 빌드/실행",
        detail: "config.ts → MAIN_API_BASE, TOSS_CLIENT_KEY 읽기",
      },
      {
        id: "be-read",
        layer: "env",
        title: "Spring Boot 기동",
        detail: "toss.payments.secret-key ← 환경변수 TOSS_SECRET_KEY",
      },
    ],
    links: [
      { label: "ENV 스위치: 토스 클라이언트 키", env: "toss-client-key" },
      { label: "ENV 스위치: API base URL", env: "api-base" },
    ],
    code: {
      file: "MARVEL-RUN/.env.example · user/application.yml",
      lines: [
        "NEXT_PUBLIC_API_BASE_URL=https://host/api",
        "NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...",
        "",
        "server.servlet.context-path: /api",
        "toss.payments.base-url: https://api.tosspayments.com",
        "toss.payments.secret-key: ${TOSS_SECRET_KEY}",
        "# connect-timeout 3s · read-timeout 10s",
      ],
    },
  },
  {
    id: "register",
    chapter: CH_PREP,
    reelTitle: "02 · REGISTER",
    headline: "신청 API가 정원을 잡고 Payment(READY)를 만든다",
    body: "RegisterFlow가 mainFetch로 참가 신청을 보내면 User API가 대회 접수 기간을 검사한 뒤 Registration(PAYMENT_PENDING)을 저장하고, Reservation을 HELD로 만들어 정원(heldCount)을 먼저 확보합니다. PaymentCreator가 Payment(READY)와 PaymentAllocation(참가자별 금액)을 만들고 PAYMENT_PREPARED 로그를 남깁니다.",
    activePath: ["browser", "env-fe", "api", "db"],
    packetFrom: "browser",
    packetTo: "api",
    envHighlight: "frontend",
    serverLoad: "db",
    traces: [
      {
        id: "req",
        layer: "client",
        title: "POST mainFetch",
        detail: "/api/v1/public/events/{eventId}/registrations (단체는 …/registrations/organization)",
      },
      {
        id: "policy",
        layer: "api",
        title: "RegistrationPolicyValidator",
        detail: "Event OPEN · registStartDate~registDeadline 밖이면 NOT_STARTED / CLOSED",
      },
      {
        id: "hold",
        layer: "db",
        title: "Reservation.createHeld",
        detail: "HELD · expiresAt=null · Capacity heldCount +1",
      },
      {
        id: "pay",
        layer: "db",
        title: "Payment + PaymentAllocation",
        detail: "processStatus=READY · 참가자별 allocatedAmount 합 = amount",
      },
      {
        id: "log",
        layer: "db",
        title: "INSERT PaymentProcessLog",
        detail: "processType=PAYMENT_PREPARED, source=API",
      },
      {
        id: "res",
        layer: "api",
        title: "200 JSON",
        detail: "orderId, orderName, paymentAmount → 결제 페이지로 이동",
      },
    ],
    links: [
      { label: "통합 지도: 신청 서비스", wire: "s-register" },
      { label: "통합 지도: 정원(Capacity)", wire: "s-capacity" },
      { label: "ENV 스위치: 접수 오픈 0/1/3", env: "registration-open" },
    ],
    code: {
      file: "RegisterFlow.tsx · PaymentCreator.java · Reservation.java",
      lines: [
        'mainFetch(`v1/public/events/${eventId}/registrations`, {',
        '  method: "POST", body: JSON.stringify(payload) })',
        "",
        "Reservation.createHeld(registration) // HELD, expiresAt(null)",
        "paymentCreator.createInitialPayment(...) // READY",
        "savePaymentPreparedLog() // PAYMENT_PREPARED",
      ],
    },
  },
  {
    id: "pending",
    chapter: CH_PREP,
    reelTitle: "03 · SESSION",
    headline: "승인 전 주문을 sessionStorage에 고정",
    body: "결제 페이지로 가기 전 savePendingPayment()로 orderId·orderName·금액·customerName을 저장합니다. PaymentPage는 pending이 있어야 위젯을 그리고, 없으면 「결제할 신청이 없습니다」를 보여줍니다. success 페이지는 pending을 주문명 표시·「다시 결제」 노출 판단에만 씁니다.",
    activePath: ["browser"],
    serverLoad: "idle",
    traces: [
      {
        id: "save",
        layer: "client",
        title: "sessionStorage.setItem",
        detail: "키 marvelrun_payment_pending · { registration, customerName, savedAt }",
      },
      {
        id: "page",
        layer: "client",
        title: "PaymentPage 마운트",
        detail: "readPendingPayment() → 있으면 PaymentWidget, 없으면 빈 상태",
      },
      {
        id: "read-later",
        layer: "client",
        title: "PaymentSuccessPage",
        detail: "pending.orderName 표시 · canRetry=Boolean(pending)",
      },
    ],
    links: [{ label: "통합 지도: 결제 세션", wire: "l-session" }],
    code: {
      file: "src/lib/payment/session.ts",
      lines: [
        'const STORAGE_KEY = "marvelrun_payment_pending";',
        "savePendingPayment({ registration, customerName, savedAt })",
        "readPendingPayment()  // PaymentPage · success · fail",
        "clearPendingPayment() // 승인 성공 후에만",
        "paymentOrderFromRetry(order) // 조회 화면 재결제",
      ],
    },
  },
  {
    id: "widget",
    chapter: CH_PAY,
    reelTitle: "04 · WIDGET",
    headline: "결제 UI는 SDK + 클라이언트 키",
    body: "createPaymentWidgets() → setAmount → renderPaymentMethods·renderAgreement(동시). 이 구간 HTTP는 MARVEL Backend가 아니라 브라우저가 Toss SDK와 직접 통신합니다.",
    activePath: ["browser", "env-fe", "toss"],
    packetFrom: "browser",
    packetTo: "toss",
    envHighlight: "frontend",
    serverLoad: "idle",
    traces: [
      {
        id: "load",
        layer: "client",
        title: "loadTossPayments(TOSS_CLIENT_KEY)",
        detail: "키 없으면 즉시 throw → hasTossClientKey 가드",
      },
      {
        id: "render",
        layer: "client",
        title: "widgets.render*",
        detail: "Promise.all — 결제수단(DEFAULT)·약관(AGREEMENT) DOM 마운트",
      },
    ],
    links: [{ label: "통합 지도: Toss SDK", wire: "l-toss" }],
    code: {
      file: "toss.ts · PaymentWidget.tsx",
      lines: [
        "await widgets.setAmount({ currency: 'KRW', value: amount })",
        "await Promise.all([",
        "  widgets.renderPaymentMethods({ selector, variantKey: 'DEFAULT' }),",
        "  widgets.renderAgreement({ selector, variantKey: 'AGREEMENT' }),",
        "])",
      ],
    },
  },
  {
    id: "auth",
    chapter: CH_PAY,
    reelTitle: "05 · AUTH",
    headline: "requestPayment → 토스 결제창",
    body: "사용자가 결제하기를 누르면 orderId·successUrl·failUrl과 함께 토스 인증 UI로 넘어갑니다. URL은 origin + withAppBase(basePath)라 미리보기 경로에서도 맞게 돌아옵니다. 아직 승인(confirm) API는 호출되지 않습니다.",
    activePath: ["browser", "toss"],
    packetFrom: "browser",
    packetTo: "toss",
    serverLoad: "idle",
    traces: [
      {
        id: "req-pay",
        layer: "client",
        title: "widgets.requestPayment(...)",
        detail: "successUrl=/payment/success · failUrl=/payment/fail",
      },
      {
        id: "toss-ui",
        layer: "pg",
        title: "Toss 결제창",
        detail: "카드/간편결제 인증 · paymentKey 발급 (승인 전)",
      },
    ],
    code: {
      file: "PaymentWidget.tsx",
      lines: [
        "await widgets.requestPayment({",
        "  orderId: registration.orderId,",
        "  orderName: registration.orderName,",
        '  successUrl: origin + withAppBase(base, "/payment/success"),',
        '  failUrl: origin + withAppBase(base, "/payment/fail"),',
        "  customerName,",
        "});",
      ],
    },
  },
  {
    id: "redirect",
    chapter: CH_PAY,
    reelTitle: "06 · REDIRECT",
    headline: "success URL 쿼리 = 승인 입력값",
    body: "인증이 끝나면 토스가 브라우저를 successUrl로 돌려보내며 paymentKey, orderId, amount를 붙입니다. PaymentSuccessPage가 authFromParams()로 파싱한 뒤 confirmPayment()를 자동 호출합니다. 금액 위변조 검사는 프론트가 아니라 서버(Tx1)가 DB 금액과 비교해 막습니다.",
    activePath: ["toss", "browser"],
    packetFrom: "toss",
    packetTo: "browser",
    serverLoad: "idle",
    traces: [
      {
        id: "302",
        layer: "pg",
        title: "브라우저 리다이렉트",
        detail: "GET /payment/success?paymentKey=...&orderId=...&amount=...",
      },
      {
        id: "parse",
        layer: "client",
        title: "authFromParams()",
        detail: "누락 / 숫자 아닌 amount → phase=error (승인 API 미호출)",
      },
    ],
    links: [{ label: "통합 지도: 결제 성공 페이지", wire: "p-success" }],
    code: {
      file: "PaymentSuccessPage.tsx",
      lines: [
        "const auth = authFromParams(params);",
        "if (!auth) { setPhase('error'); return; }",
        "confirmPayment({ paymentKey, orderId, amount })",
        "// useEffect([params]) · cancelled 플래그로 늦은 응답 무시",
      ],
    },
  },
  {
    id: "confirm-fe",
    chapter: CH_CONFIRM,
    reelTitle: "07 · CONFIRM FE",
    headline: "프론트 → User API 승인 요청",
    body: "mainFetch POST v1/public/payments/confirm. 본문은 PaymentConfirmRequest 3필드뿐이고 시크릿 키는 포함되지 않습니다. 백엔드 CORS는 localhost:3000 · 테스트 · 운영 도메인 3개만 허용합니다.",
    activePath: ["browser", "env-fe", "api"],
    packetFrom: "browser",
    packetTo: "api",
    envHighlight: "frontend",
    serverLoad: "api",
    traces: [
      {
        id: "join",
        layer: "client",
        title: "joinUrl(endpoint)",
        detail: "${MAIN_API_BASE}/v1/public/payments/confirm",
      },
      {
        id: "post",
        layer: "client",
        title: "fetch POST JSON",
        detail: "Content-Type: application/json · Accept: application/json",
      },
      {
        id: "hit",
        layer: "api",
        title: "Spring MVC 수신",
        detail: "전체 경로 /api/v1/public/payments/confirm · /v1/public/** permitAll",
      },
    ],
    links: [{ label: "통합 지도: mainFetch", wire: "l-mainfetch" }],
    code: {
      file: "payments.ts · PaymentConfirmRequest.java",
      lines: [
        '{ "paymentKey": "...", "orderId": "...", "amount": 50000 }',
        "",
        "public record PaymentConfirmRequest(",
        "  @NotBlank String paymentKey, @NotBlank String orderId,",
        "  @Positive long amount) {}",
      ],
    },
  },
  {
    id: "confirm-ctrl",
    chapter: CH_CONFIRM,
    reelTitle: "08 · CONTROLLER",
    headline: "PaymentCommandController.confirm",
    body: "@Valid PaymentConfirmRequest → PaymentConfirmService.confirm(). 컨트롤러와 서비스 진입점에는 트랜잭션이 없습니다. 서비스가 Tx1 → 토스 HTTP(트랜잭션 밖) → Tx2 세 구간을 직접 조율합니다.",
    activePath: ["api"],
    serverLoad: "api",
    traces: [
      {
        id: "map",
        layer: "api",
        title: '@PostMapping("/confirm")',
        detail: "PaymentCommandController · JSON 역직렬화·검증",
      },
      {
        id: "svc-entry",
        layer: "api",
        title: "PaymentConfirmService.confirm",
        detail: "now=ServerTimeProvider · correlationId=UUID (로그 묶음 키)",
      },
    ],
    links: [{ label: "통합 지도: 승인 서비스", wire: "s-confirm" }],
    code: {
      file: "PaymentCommandController.java · PaymentConfirmService.java",
      lines: [
        '@RequestMapping("/v1/public/payments")',
        '@PostMapping("/confirm")',
        "",
        "ctx  = tx.beginConfirm(req, now, correlationId);   // Tx1",
        "toss = tossPaymentClient.confirm(req, ctx.key());  // 트랜잭션 밖",
        "return tx.completeConfirm(ctx, toss, now);         // Tx2",
      ],
    },
  },
  {
    id: "tx1",
    chapter: CH_CONFIRM,
    reelTitle: "09 · TX1",
    headline: "잠금 · 검증 → CONFIRMING 커밋",
    body: "beginConfirm(): orderId로 잠근 뒤 금액·상태·대상·납부 마감·배분 합계를 검사하고, Reservation을 PROCESSING으로, Payment를 CONFIRMING으로 바꾼 뒤 CONFIRM_REQUESTED 로그와 함께 커밋합니다. 동시에 들어온 두 번째 승인은 낙관적 락 충돌로 PAYMENT_NOT_CONFIRMABLE이 됩니다.",
    activePath: ["api", "db"],
    packetFrom: "api",
    packetTo: "db",
    envHighlight: "backend",
    serverLoad: "db",
    traces: [
      {
        id: "lock",
        layer: "db",
        title: "lockForStart(orderId)",
        detail: "요청 amount ≠ Payment.amount → PAYMENT_AMOUNT_MISMATCH (400)",
      },
      {
        id: "state",
        layer: "db",
        title: "상태·대상 검증",
        detail: "READY만 허용 · 개인/단체 대상은 둘 중 하나(XOR)",
      },
      {
        id: "policy",
        layer: "api",
        title: "validateForPurpose(event, now)",
        detail: "대회 납부 마감 이후 승인 차단",
      },
      {
        id: "alloc",
        layer: "db",
        title: "배분 검증",
        detail: "allocation 합 = amount · 삭제된 신청 없음 · 같은 대회",
      },
      {
        id: "resv",
        layer: "db",
        title: "Reservation.startPayment",
        detail: "HELD → PROCESSING (수량은 그대로 홀딩)",
      },
      {
        id: "log-req",
        layer: "db",
        title: "CONFIRMING + CONFIRM_REQUESTED",
        detail: "payment.startConfirm(paymentKey) · idempotencyKey·correlationId 기록",
      },
    ],
    code: {
      file: "PaymentConfirmTransactionService.beginConfirm",
      lines: [
        "allocationSupport.lockForStart(orderId);",
        "if (amount != payment.amount) throw PAYMENT_AMOUNT_MISMATCH;",
        "if (status != READY) throw PAYMENT_NOT_CONFIRMABLE;",
        "eventPaymentPolicyValidator.validateForPurpose(event, now, purpose);",
        "reservationPaymentService.startPayment(...); // HELD→PROCESSING",
        "payment.startConfirm(paymentKey);           // CONFIRMING",
        "// COMMIT — 토스 응답을 기다리는 동안 DB 잠금 없음",
      ],
    },
  },
  {
    id: "toss-http",
    chapter: CH_CONFIRM,
    reelTitle: "10 · TOSS HTTP",
    headline: "RestClient + Basic Auth 승인",
    body: "TossPaymentClient.confirm() → POST /v1/payments/confirm. Idempotency-Key 헤더에 Payment의 confirmIdempotencyKey를 실어 같은 주문이 두 번 승인되지 않게 합니다. 이 호출은 트랜잭션 밖이라 실패해도 DB가 자동 롤백되지 않고, 예외 종류에 따라 FAILED / UNKNOWN으로 나뉩니다.",
    activePath: ["api", "env-be", "toss"],
    packetFrom: "api",
    packetTo: "toss",
    envHighlight: "backend",
    serverLoad: "pg",
    traces: [
      {
        id: "client",
        layer: "api",
        title: "TossPaymentClient",
        detail: "RestClient tossPaymentRestClient · connect 3s / read 10s",
      },
      {
        id: "auth-h",
        layer: "env",
        title: "Authorization: Basic",
        detail: "secretKey + 빈 password (setBasicAuth)",
      },
      {
        id: "pg",
        layer: "pg",
        title: "api.tosspayments.com",
        detail: "200 → TossPaymentConfirmResponse · 4xx/5xx → TossPaymentApiException",
      },
    ],
    links: [
      { label: "실패 분기: 명확한 거절", scene: "confirm-failed" },
      { label: "실패 분기: 결과 모름(UNKNOWN)", scene: "confirm-unknown" },
    ],
    code: {
      file: "TossPaymentClient.java",
      lines: [
        '.uri("/v1/payments/confirm")',
        '.header("Idempotency-Key", idempotencyKey)',
        ".body(tossRequest) // paymentKey · orderId · amount",
        "// 연결·타임아웃 → TossPaymentTransportException",
        "// HTTP 오류 응답 → TossPaymentApiException(status, code)",
      ],
    },
  },
  {
    id: "tx2",
    chapter: CH_CONFIRM,
    reelTitle: "11 · TX2",
    headline: "승인 확정 · 정원 확정 · 참가 상태 반영",
    body: "completeConfirm(): 대회 → 단체 → 결제 순으로 잠그고 토스 응답(paymentKey·orderId·totalAmount·status=DONE)을 검증합니다. Payment는 COMPLETED, Reservation은 PROCESSING → CONSUMED(heldCount → confirmedCount), 각 신청은 배분 금액만큼 paidAmount가 늘어 CONFIRMED 또는 ADDITIONAL_PAYMENT_REQUIRED가 됩니다.",
    activePath: ["api", "db"],
    packetFrom: "api",
    packetTo: "db",
    serverLoad: "db",
    traces: [
      {
        id: "verify",
        layer: "api",
        title: "validateSuccessResponse",
        detail: "응답 키·주문·금액 불일치 또는 status≠DONE → UNKNOWN 처리",
      },
      {
        id: "idem",
        layer: "db",
        title: "이미 COMPLETED?",
        detail: "기존 결과를 그대로 반환 (중복 반영 없음) · CONFIRMING/UNKNOWN만 진행",
      },
      {
        id: "consume",
        layer: "db",
        title: "Reservation.consumeAfterPayment",
        detail: "PROCESSING → CONSUMED · Capacity heldCount → confirmedCount",
      },
      {
        id: "reg",
        layer: "db",
        title: "registration.applySuccessfulPayment",
        detail: "paidAmount ≥ 계약금액 → CONFIRMED · 부족 → ADDITIONAL_PAYMENT_REQUIRED",
      },
      {
        id: "log-ok",
        layer: "db",
        title: "CONFIRM_SUCCEEDED",
        detail: "Payment COMPLETED · 응답 비교 메타데이터와 함께 로그",
      },
    ],
    code: {
      file: "PaymentConfirmTransactionService.completeConfirm",
      lines: [
        "allocationSupport.lockForResult(...); // 대회 → 단체 → 결제",
        "validateSuccessResponse(ctx, toss);   // status == \"DONE\"",
        "if (status == COMPLETED) return /* 기존 응답 */;",
        "reservationPaymentService.confirmPayment(...); // → CONSUMED",
        "payment.completeConfirm(toss);                 // COMPLETED",
        "allocations.forEach(a -> a.registration()",
        "    .applySuccessfulPayment(a.allocatedAmount()));",
      ],
    },
  },
  {
    id: "response",
    chapter: CH_CONFIRM,
    reelTitle: "12 · RESPONSE",
    headline: "프론트 완료 UI",
    body: "200 JSON 수신 → clearPendingPayment() → 결제 금액·주문번호(복사)·영수증을 보여줍니다. 영수증은 데스크톱에서 iframe 모달, 모바일에서 페이지 이동으로 엽니다.",
    activePath: ["api", "browser"],
    packetFrom: "api",
    packetTo: "browser",
    serverLoad: "idle",
    traces: [
      {
        id: "json",
        layer: "client",
        title: "PaymentConfirmResponse",
        detail: "fromRegistration / fromOrganization · pickReceiptUrl()",
      },
      {
        id: "ui",
        layer: "client",
        title: "phase=done",
        detail: "sessionStorage pending 삭제 · paidAmount 표시 · 주문번호 복사",
      },
    ],
    code: {
      file: "PaymentSuccessPage.tsx",
      lines: [
        "const data = await confirmPayment(auth);",
        "clearPendingPayment();",
        "setResult(data); setPhase('done');",
        "receiptUrl = pickReceiptUrl(result) // 중첩 receipt.url 대응",
      ],
    },
  },
  {
    id: "fail-url",
    chapter: CH_BRANCH,
    reelTitle: "13 · FAIL URL",
    headline: "결제창에서 취소·거절 → failUrl (서버 호출 없음)",
    body: "사용자가 결제창을 닫거나 인증이 거절되면 토스가 failUrl로 code·message·orderId를 붙여 보냅니다. PaymentFailPage는 사유만 보여주고 백엔드를 부르지 않습니다. 그래서 DB는 Payment READY · Reservation HELD 그대로이고, pending이 남아 있으면 같은 orderId로 「다시 결제」할 수 있습니다.",
    activePath: ["toss", "browser"],
    packetFrom: "toss",
    packetTo: "browser",
    serverLoad: "idle",
    traces: [
      {
        id: "redirect",
        layer: "pg",
        title: "GET /payment/fail",
        detail: "?code=PAY_PROCESS_CANCELED&message=...&orderId=...",
      },
      {
        id: "ui",
        layer: "client",
        title: "PaymentFailPage",
        detail: "사유 표시 · pending 있으면 「다시 결제」 → 같은 주문으로 위젯 재진입",
      },
      {
        id: "db",
        layer: "db",
        title: "DB 변화 없음",
        detail: "READY · HELD 유지 — 승인 API가 한 번도 호출되지 않음",
      },
    ],
    links: [{ label: "통합 지도: 결제 실패 페이지", wire: "p-fail" }],
    code: {
      file: "PaymentFailPage.tsx",
      lines: [
        'const code = params.get("code");',
        'const message = params.get("message");',
        'const orderId = params.get("orderId");',
        "// confirm 호출 없음 → 서버 상태 READY 유지",
      ],
    },
  },
  {
    id: "confirm-failed",
    chapter: CH_BRANCH,
    reelTitle: "14 · FAILED",
    headline: "토스가 명확히 거절 → FAILED, 정원은 유지",
    body: "토스 오류 중 허용 목록에 있는 코드(400 카드 거절·한도 초과·세션 만료 등 13개, 403 카드사/계좌 거절 3개)만 「확정 실패」로 봅니다. failConfirm이 Payment를 FAILED로, Reservation을 PROCESSING → HELD로 되돌립니다. 결제 실패는 신청 취소가 아니므로 정원은 반환하지 않습니다.",
    activePath: ["api", "toss", "db"],
    packetFrom: "toss",
    packetTo: "api",
    serverLoad: "db",
    traces: [
      {
        id: "classify",
        layer: "api",
        title: "TossConfirmFailureClassifier",
        detail: "isDefiniteFailure(status, code) — 코드 없음·미등록 코드는 false",
      },
      {
        id: "fail",
        layer: "db",
        title: "failConfirm",
        detail: "CONFIRMING → FAILED · 이미 FAILED면 그대로 (중복 안전)",
      },
      {
        id: "restore",
        layer: "db",
        title: "restoreHeldAfterPaymentFailure",
        detail: "PROCESSING → HELD · heldCount·confirmedCount 변화 없음",
      },
      {
        id: "res",
        layer: "client",
        title: "400 PAYMENT_CONFIRM_FAILED",
        detail: "success 페이지 error 화면 · 신청조회에서 재결제 → 새 주문(orderId) 생성",
      },
    ],
    table: {
      caption: "확정 실패로 보는 토스 코드 (그 외는 전부 UNKNOWN)",
      head: ["HTTP", "코드 예시"],
      rows: [
        ["400", "INVALID_REJECT_CARD · EXCEED_MAX_AMOUNT · INVALID_PASSWORD"],
        ["400", "PAY_PROCESS_CANCELED · PAY_PROCESS_ABORTED · NOT_FOUND_PAYMENT_SESSION"],
        ["403", "REJECT_CARD_PAYMENT · REJECT_CARD_COMPANY · REJECT_ACCOUNT_PAYMENT"],
        ["그 외", "ALREADY_PROCESSED_PAYMENT · PROVIDER_ERROR · 5xx → UNKNOWN"],
      ],
    },
    links: [{ label: "재결제 흐름 보기", scene: "retry" }],
    code: {
      file: "PaymentConfirmService.java · TossConfirmFailureClassifier.java",
      lines: [
        "catch (TossPaymentApiException e) {",
        "  if (!classifier.isDefiniteFailure(e)) return markUnknown(...);",
        "  tx.failConfirm(ctx, e);  // FAILED + CONFIRM_FAILED 로그",
        "  throw PAYMENT_CONFIRM_FAILED;",
        "}",
        "// failConfirm 커밋 실패 → LOCAL_CONFIRM_FAILURE_COMMIT_FAILED (UNKNOWN)",
      ],
    },
  },
  {
    id: "confirm-unknown",
    chapter: CH_BRANCH,
    reelTitle: "15 · UNKNOWN",
    headline: "결과를 모르면 실패로 단정하지 않는다",
    body: "돈이 빠져나갔는지 확실하지 않은 경우(네트워크 끊김, 분류 불가 오류, 로컬 커밋 실패)는 FAILED가 아니라 UNKNOWN으로 표시합니다. Reservation은 PROCESSING에 묶여 재결제도 막힙니다. 자동 재조회·재승인 스케줄러나 웹훅 처리는 아직 없어서(enum만 존재) 운영자가 토스 내역으로 확인해야 합니다.",
    activePath: ["api", "toss", "db"],
    packetFrom: "api",
    packetTo: "db",
    serverLoad: "db",
    traces: [
      {
        id: "mark",
        layer: "db",
        title: "markConfirmUnknown",
        detail: "findByIdForUpdate · CONFIRMING일 때만 UNKNOWN + CONFIRM_UNKNOWN 로그",
      },
      {
        id: "resv",
        layer: "db",
        title: "Reservation 그대로 PROCESSING",
        detail: "정원 홀딩 유지 · 다른 결제로 사용 불가",
      },
      {
        id: "res",
        layer: "client",
        title: "503 PAYMENT_CONFIRM_UNKNOWN",
        detail: "「이미 승인됐을 수 있습니다. 신청조회로 확인…」 안내",
      },
      {
        id: "retry-block",
        layer: "api",
        title: "재결제 API 거절",
        detail: "UNKNOWN 주문은 retry 시 PAYMENT_NOT_CONFIRMABLE",
      },
    ],
    table: {
      caption: "UNKNOWN 사유 코드 (CONFIRM_UNKNOWN 로그 reason)",
      head: ["reason", "언제"],
      rows: [
        ["TOSS_CONFIRM_TRANSPORT_ERROR", "연결 실패·타임아웃 (응답 못 받음)"],
        ["(분류 불가 API 오류)", "허용 목록 밖 토스 코드 · 5xx"],
        ["TOSS_CONFIRM_RESPONSE_PROCESSING_ERROR", "응답 파싱 등 기타 런타임 예외"],
        ["LOCAL_CONFIRM_COMMIT_FAILED", "토스는 성공, Tx2 커밋 실패 (응답은 증거로 저장)"],
        ["LOCAL_CONFIRM_FAILURE_COMMIT_FAILED", "토스는 거절, failConfirm 커밋 실패"],
      ],
    },
    code: {
      file: "PaymentConfirmService.java",
      lines: [
        "catch (TossPaymentTransportException e) {",
        '  markUnknownSafely(ctx, "TOSS_CONFIRM_TRANSPORT_ERROR");',
        "  throw PAYMENT_CONFIRM_UNKNOWN; // 503",
        "}",
        "// WEBHOOK_RECEIVED · RECONCILIATION_* 는 enum만 정의 (미구현)",
      ],
    },
  },
  {
    id: "idempotent",
    chapter: CH_BRANCH,
    reelTitle: "16 · 중복 승인",
    headline: "새로고침·더블 클릭·동시 요청",
    body: "success 페이지는 마운트될 때마다 confirm을 다시 보냅니다. 첫 요청이 Tx1을 커밋하면 Payment가 READY가 아니므로 이후 요청은 409 PAYMENT_NOT_CONFIRMABLE을 받습니다. 토스 쪽은 Idempotency-Key, DB 쪽은 상태 검사·낙관적 락·Tx2의 COMPLETED 재반환이 이중 반영을 막습니다.",
    activePath: ["browser", "api", "db"],
    packetFrom: "browser",
    packetTo: "api",
    serverLoad: "db",
    traces: [
      {
        id: "refresh",
        layer: "client",
        title: "success 새로고침",
        detail: "pending은 이미 삭제됐지만 URL 쿼리는 남아 있어 confirm 재호출",
      },
      {
        id: "conflict",
        layer: "db",
        title: "Tx1 상태 검사",
        detail: "CONFIRMING/COMPLETED → 409 · 동시 커밋 충돌 → 409",
      },
      {
        id: "pg",
        layer: "pg",
        title: "Idempotency-Key",
        detail: "같은 키로 재요청돼도 토스가 한 번만 승인",
      },
      {
        id: "dev",
        layer: "client",
        title: "개발 모드 주의",
        detail: "React StrictMode가 effect를 두 번 실행 → 두 번째 요청이 409로 보일 수 있음",
      },
    ],
    code: {
      file: "PaymentSuccessPage.tsx · PaymentConfirmService.java",
      lines: [
        "useEffect(() => { confirmPayment(auth) ... }, [params]);",
        "",
        "catch (ObjectOptimisticLockingFailureException e) {",
        "  throw PAYMENT_NOT_CONFIRMABLE; // 409",
        "}",
      ],
    },
  },
  {
    id: "retry",
    chapter: CH_AFTER,
    reelTitle: "17 · RETRY",
    headline: "신청조회 → 재결제 주문 준비",
    body: "조회 화면의 「결제하기」는 retry API로 주문을 다시 준비합니다. 아직 유효한 READY 주문은 그대로 재사용하고, FAILED·INVALIDATED 주문만 같은 참가자 배분으로 새 Payment(새 orderId)를 만듭니다. 금액·명단은 프론트 값을 받지 않고 DB 기준으로 다시 계산합니다.",
    activePath: ["browser", "api", "db"],
    packetFrom: "browser",
    packetTo: "api",
    serverLoad: "db",
    traces: [
      {
        id: "call",
        layer: "client",
        title: "retryIndividualPayment",
        detail: "POST …/registrations/{rid}/payments/{pid}/retry (+ 본인확인)",
      },
      {
        id: "decide",
        layer: "api",
        title: "PaymentRetryPreparationService",
        detail: "READY → 재사용 · FAILED/INVALIDATED → 새 주문 · 그 외 409",
      },
      {
        id: "save",
        layer: "client",
        title: "savePendingPayment",
        detail: "paymentOrderFromRetry(order) → /payment 위젯으로",
      },
    ],
    table: {
      head: ["원 주문 상태", "retry 결과"],
      rows: [
        ["READY", "같은 orderId 재사용"],
        ["FAILED", "새 Payment + 같은 배분"],
        ["INVALIDATED", "새 Payment (수정·관리자 해제로 무효화된 주문)"],
        ["CONFIRMING · UNKNOWN · COMPLETED", "409 PAYMENT_NOT_CONFIRMABLE"],
      ],
    },
    links: [{ label: "통합 지도: 신청조회 페이지", wire: "p-lookup" }],
    code: {
      file: "LookupPage.tsx · PaymentRetryPreparationService.java",
      lines: [
        "const retried = await retryIndividualPayment(eventId, rid, pid, access);",
        "savePendingPayment({ registration: paymentOrderFromRetry(retried), ... });",
        "router.push(paymentHref);",
        "",
        "// 단체: POST …/organizations/{oid}/payments/{pid}/retry",
        "// 추가금: POST …/payments/additional/prepare (백엔드 준비 API)",
      ],
    },
  },
  {
    id: "states",
    chapter: CH_AFTER,
    reelTitle: "18 · STATE",
    headline: "세 가지 상태가 함께 움직인다",
    body: "결제 한 건에는 Payment(결제 진행) · Reservation(정원 점유) · Registration(참가 신청) 세 상태가 같이 바뀝니다. 아래 표는 장면별로 각 상태가 어떻게 이동하는지 정리한 것입니다. 시간 경과로 자동 만료되는 로직은 없고(expiresAt=null), 미결제 정리는 관리자 「미결제 신청 취소」로 합니다.",
    activePath: ["api", "db"],
    serverLoad: "db",
    traces: [
      {
        id: "pay",
        layer: "db",
        title: "PaymentProcessStatus",
        detail: "READY → CONFIRMING → COMPLETED | FAILED | UNKNOWN · INVALIDATED",
      },
      {
        id: "resv",
        layer: "db",
        title: "ReservationStatus",
        detail: "HELD → PROCESSING → CONSUMED · RELEASED(취소·제거)",
      },
      {
        id: "reg",
        layer: "db",
        title: "RegistrationStatus",
        detail: "PAYMENT_PENDING → CONFIRMED | ADDITIONAL_PAYMENT_REQUIRED …",
      },
    ],
    table: {
      head: ["장면", "Payment", "Reservation", "Registration"],
      rows: [
        ["신청", "READY", "HELD", "PAYMENT_PENDING"],
        ["결제창 취소", "READY", "HELD", "PAYMENT_PENDING"],
        ["Tx1", "CONFIRMING", "PROCESSING", "—"],
        ["승인 성공", "COMPLETED", "CONSUMED", "CONFIRMED / 추가납부"],
        ["확정 실패", "FAILED", "HELD", "PAYMENT_PENDING"],
        ["결과 모름", "UNKNOWN", "PROCESSING", "PAYMENT_PENDING"],
        ["미결제 취소(관리자)", "INVALIDATED", "RELEASED", "EXPIRED"],
        ["전액 환불(관리자)", "COMPLETED · 토스 CANCELED", "RELEASED (준비 시)", "CANCELLATION_PENDING → CANCELED"],
      ],
    },
    code: {
      file: "common-entity · inheritance_enum",
      lines: [
        "enum PaymentProcessStatus { READY, CONFIRMING, COMPLETED,",
        "  FAILED, UNKNOWN, INVALIDATED }",
        "enum ReservationStatus { HELD, PROCESSING, CONSUMED, RELEASED }",
        "enum RegistrationStatus { PENDING, PAYMENT_PENDING, CONFIRMED,",
        "  ADDITIONAL_PAYMENT_REQUIRED, PARTIAL_REFUND_REQUIRED,",
        "  CANCELLATION_PENDING, CANCELED, EXPIRED }",
      ],
    },
  },
  {
    id: "process-log",
    chapter: CH_AFTER,
    reelTitle: "19 · LOG",
    headline: "PaymentProcessLog — 모든 단계의 감사 기록",
    body: "상태를 덮어쓰는 Payment와 달리 PaymentProcessLog는 단계마다 한 줄씩 쌓입니다. 같은 승인 시도는 correlationId로 묶이고, source(API·ADMIN)로 누가 일으켰는지 구분합니다. 문제가 생기면 이 로그와 토스 내역을 맞춰 봅니다.",
    activePath: ["api", "db"],
    serverLoad: "db",
    traces: [
      {
        id: "user",
        layer: "db",
        title: "User API (source=API)",
        detail: "PAYMENT_PREPARED · CONFIRM_REQUESTED/SUCCEEDED/FAILED/UNKNOWN",
      },
      {
        id: "admin",
        layer: "db",
        title: "Admin API (source=ADMIN)",
        detail: "CANCEL_PREPARED · CANCEL_REQUESTED/SUCCEEDED/FAILED/UNKNOWN",
      },
      {
        id: "todo",
        layer: "db",
        title: "정의만 있음",
        detail: "WEBHOOK_RECEIVED · RECONCILIATION_STARTED/MATCHED/CORRECTED",
      },
    ],
    table: {
      head: ["processType", "기록 시점"],
      rows: [
        ["PAYMENT_PREPARED", "신청·재결제로 주문 생성"],
        ["CONFIRM_REQUESTED", "Tx1 커밋 (idempotencyKey 포함)"],
        ["CONFIRM_SUCCEEDED", "Tx2 커밋 (응답 비교 메타데이터)"],
        ["CONFIRM_FAILED", "확정 거절 (httpStatus · errorCode)"],
        ["CONFIRM_UNKNOWN", "결과 불명 (reason)"],
        ["CANCEL_*", "관리자 환불 준비·요청·결과"],
      ],
    },
    code: {
      file: "PaymentProcessLog · PaymentProcessType",
      lines: [
        "PaymentProcessLog.builder()",
        "  .processType(CONFIRM_REQUESTED)",
        "  .source(PaymentProcessSource.API)",
        "  .correlationId(correlationId)",
        "  .idempotencyKey(payment.getConfirmIdempotencyKey())",
      ],
    },
  },
  {
    id: "refund",
    chapter: CH_AFTER,
    reelTitle: "20 · REFUND",
    headline: "환불은 Admin API만 토스를 호출한다",
    body: "참가자의 취소 요청은 User API에서 신청 상태만 바꾸고, 실제 환불(토스 cancel)은 관리자가 Admin API의 환불 배치로 실행합니다. 준비(CANCEL_PREPARED) → 요청(CANCEL_REQUESTED) → 토스 POST /v1/payments/{paymentKey}/cancel → 결과 로그 순이고, 증빙은 토스 결제 조회로 대조합니다.",
    activePath: ["api", "env-be", "toss", "db"],
    packetFrom: "api",
    packetTo: "toss",
    envHighlight: "backend",
    serverLoad: "pg",
    traces: [
      {
        id: "prep",
        layer: "db",
        title: "AdminRefundPreparation",
        detail: "CONSUMED 예약만 대상 · 제거 참가자 정원 반환 · 신청 CANCELLATION_PENDING",
      },
      {
        id: "batch",
        layer: "api",
        title: "POST …/payment-refunds",
        detail: "전액 · …/payment-partial-refunds 부분 — AdminRefundBatchWorker",
      },
      {
        id: "cancel",
        layer: "pg",
        title: "TossPaymentCancelClient",
        detail: "/v1/payments/{paymentKey}/cancel · Idempotency-Key · read 30s",
      },
      {
        id: "result",
        layer: "db",
        title: "CANCEL_SUCCEEDED / FAILED / UNKNOWN",
        detail: "응답 CANCELED · PARTIAL_CANCELED 검증 후 반영",
      },
      {
        id: "evidence",
        layer: "pg",
        title: "환불 증빙 조회",
        detail: "GET /v1/payments/{paymentKey} 로 취소 내역 대조",
      },
    ],
    links: [
      { label: "통합 지도: 관리자 환불", wire: "s-refund" },
      { label: "ENV 스위치: 관리자 환불 배치", env: "be-refund-batch" },
    ],
    code: {
      file: "admin · TossPaymentCancelClient.java",
      lines: [
        '.uri("/v1/payments/{paymentKey}/cancel", attempt.paymentKey())',
        '.header("Idempotency-Key", attempt.idempotencyKey())',
        "",
        "@PostMapping(\"/payment-refunds\")",
        "@PostMapping(\"/payment-partial-refunds\")",
      ],
    },
  },
];

export const LAYER_LABEL: Record<TraceLayer, string> = {
  client: "CLIENT",
  api: "SERVER",
  db: "DATABASE",
  pg: "TOSS PG",
  env: "ENV",
};

export const FLOW_LEGEND = [
  "장면 목록에서 원하는 단계로 바로 이동할 수 있어요",
  "Tx1 커밋 후 Toss HTTP → DB lock 없이 PG 대기",
  "Transport/모호 오류 → UNKNOWN (즉시 FAILED 아님)",
];

export const PAYMENT_HIGHLIGHTS: Record<string, string[]> = {
  env: [
    "클라이언트 키(test_ck/live_ck)는 위젯·SDK 전용",
    "시크릿 키는 user/admin JVM에만 — Git에 커밋 금지",
    "API-KEY.yml optional import로 로컬·운영 분리",
  ],
  register: [
    "결제 전에 정원부터 HELD로 확보 — 결제 중 매진 방지",
    "orderId는 토스 requestPayment와 DB Payment.orderId 일치",
    "PAYMENT_PREPARED가 감사 추적 시작점",
  ],
  pending: [
    "sessionStorage — 탭 닫으면 사라짐 (영구 저장 아님)",
    "프론트는 금액을 대조하지 않음 — 서버가 PAYMENT_AMOUNT_MISMATCH로 차단",
    "조회 화면 재결제도 같은 pending 패턴",
  ],
  widget: [
    "hasTossClientKey / hasMainApi 가드 — RegisterFlow·Lookup",
    "setAmount 후 결제수단·약관을 동시에 렌더",
    "variantKey DEFAULT / AGREEMENT",
  ],
  auth: [
    "승인 API 호출 전 단계 — paymentKey만 발급",
    "failUrl은 PaymentFailPage에서 사유 표시",
    "customerName은 위젯 옵션으로 전달",
  ],
  redirect: [
    "GET 쿼리 paymentKey, orderId, amount 필수",
    "URL amount를 조작해도 Tx1에서 DB 금액과 비교해 거절",
    "clearPendingPayment는 성공 후에만",
  ],
  "confirm-fe": [
    "CORS 허용: localhost:3000 · marathontest2026.duckdns.org · marvelrunkorea2026.com",
    "4xx → message/code JSON · MainHttpError",
    "408·429·5xx·네트워크 오류는 isServerDownError로 분류",
  ],
  "confirm-ctrl": [
    "PaymentConfirmRequest @NotBlank @Positive validation",
    "Controller·서비스 진입점 모두 @Transactional 없음",
    "Tx1 · HTTP · Tx2 세 구간을 서비스가 조율",
  ],
  tx1: [
    "금액 불일치 400 · 상태 불가 409",
    "납부 마감은 접수 마감과 별개로 다시 검사",
    "토스 대기 중에는 DB 잠금을 잡지 않음",
  ],
  "toss-http": [
    "TossPaymentClient — @Transactional 금지 주석",
    "API 오류 → classifier가 FAILED / UNKNOWN 판정",
    "연결·타임아웃 → 무조건 UNKNOWN",
  ],
  tx2: [
    "토스 응답의 키·주문·금액·DONE을 다시 검증",
    "이미 COMPLETED면 기존 결과 반환 (멱등)",
    "단체 결제는 배분 금액만큼 구성원별 paidAmount 증가",
  ],
  response: [
    "pickReceiptUrl — 중첩 receipt 객체 처리",
    "에러 시 「이미 승인됐을 수 있습니다」 + 신청조회 링크",
    "pending 있으면 「다시 결제」, 없으면 「다시 신청」",
  ],
  "fail-url": [
    "서버 호출 없음 → Payment READY 그대로",
    "같은 orderId로 다시 결제 가능",
    "정원(HELD)도 계속 잡혀 있음",
  ],
  "confirm-failed": [
    "허용 목록 방식 — 모르는 코드는 실패로 단정하지 않음",
    "정원은 HELD로 복구, 반환하지 않음",
    "재결제는 신청조회 retry → 새 orderId",
  ],
  "confirm-unknown": [
    "돈은 빠졌는데 DB는 실패로 보이는 사고를 막는 상태",
    "자동 대사(reconciliation) 미구현 — 운영 확인 필요",
    "UNKNOWN 주문은 재결제 불가",
  ],
  idempotent: [
    "중복 승인 방어: 토스 Idempotency-Key + DB 상태 검사",
    "새로고침하면 성공 후에도 오류 화면이 뜰 수 있음",
    "dev StrictMode에서 이중 호출 주의",
  ],
  retry: [
    "프론트 금액·명단을 신뢰하지 않음",
    "READY 재사용으로 주문이 불필요하게 늘지 않음",
    "단체는 원 주문의 구성원 전체를 함께 재준비",
  ],
  states: [
    "Reservation이 정원의 단일 진실 원천",
    "시간 기반 자동 만료 없음 (스케줄러 없음)",
    "결제 실패 ≠ 신청 취소",
  ],
  "process-log": [
    "Payment는 현재 상태, Log는 이력",
    "correlationId로 한 번의 승인 시도를 묶음",
    "웹훅·대사 타입은 향후용",
  ],
  refund: [
    "User API는 토스 cancel을 호출하지 않음",
    "관리자 타임아웃 connect 5s / read 30s",
    "환불 결과 불명도 CANCEL_UNKNOWN으로 보존",
  ],
};
