/**
 * Behaviour switches read from env / application config in MARVEL-RUN and
 * MARVEL-Backend-develop. Each value lists what actually changes and which
 * integrated-map nodes are affected.
 */

export type SwitchValue = {
  value: string;
  label: string;
  effect: string;
  /** Extra nodes lit only for this value. */
  nodes?: string[];
  /** Nodes that stop working with this value — drawn red on the map. */
  off?: string[];
};

export type EnvSwitch = {
  id: string;
  name: string;
  side: "frontend" | "backend";
  title: string;
  summary: string;
  files: string[];
  values: SwitchValue[];
  /** Value used when the variable is missing. */
  fallback: string;
  /** Where the value is set today, as found in the repos. */
  current: { where: string; value: string }[];
  notes?: string[];
  nodes: string[];
};

export const ENV_SWITCHES: EnvSwitch[] = [
  {
    id: "app-mode",
    name: "NEXT_PUBLIC_APP_MODE",
    side: "frontend",
    title: "사이트 모드 전환",
    summary:
      "오픈 전 안내 페이지(coming-soon)와 본 사이트(main) 중 무엇을 빌드할지 정합니다. \"main\"이 아니면 전부 coming-soon으로 취급합니다.",
    files: [
      "MARVEL-RUN/src/lib/mode.ts",
      "MARVEL-RUN/src/app/page.tsx",
      "MARVEL-RUN/src/app/(main)/layout.tsx",
      "MARVEL-RUN/package.json (build:main)",
      "MARVEL-RUN/Dockerfile (ARG APP_MODE)",
    ],
    values: [
      {
        value: "coming-soon",
        label: "coming-soon",
        effect:
          "`/`와 (main) 레이아웃이 ComingSoon만 렌더합니다. BGM·사이트 줌이 꺼지고 404도 헤더 없이 나옵니다. 단, /entry-preview/** 경로는 미리보기로 본 페이지를 그대로 보여 줍니다.",
        off: ["p-register", "p-payment", "p-success", "p-fail", "p-lookup", "p-community"],
      },
      {
        value: "main",
        label: "main",
        effect:
          "HomePage + MainShell(헤더·내비)로 본 사이트가 열립니다. BGM 플레이어와 사이트 줌이 켜집니다.",
        nodes: ["p-register", "p-lookup", "p-community"],
      },
    ],
    fallback: "coming-soon",
    current: [
      { where: ".env.local", value: "coming-soon" },
      { where: ".env.production", value: "coming-soon" },
      { where: "Dockerfile ARG APP_MODE 기본값", value: "coming-soon" },
      { where: "GitHub Variables", value: "PROD_/TEST_FRONTEND_APP_MODE" },
    ],
    notes: [
      "Docker에서는 NEXT_PUBLIC_APP_MODE가 아니라 ARG APP_MODE를 받습니다. main이면 `pnpm run build:main`(= NEXT_PUBLIC_APP_MODE=main next build), 아니면 `pnpm run build`.",
      "CI가 coming-soon | main 외의 값이면 배포를 실패시킵니다. 이미지 태그에도 모드가 들어갑니다(sha-모드-설정해시).",
      "빌드 시점에 번들에 박히므로 바꾸려면 다시 빌드·배포해야 합니다.",
    ],
    nodes: ["l-env", "l-mode", "p-home", "dp-gh"],
  },
  {
    id: "registration-open",
    name: "NEXT_PUBLIC_REGISTRATION_OPEN",
    side: "frontend",
    title: "참가 접수 열기 / 닫기",
    summary:
      "/register · /payment · /lookup 을 감싸는 RegistrationGate와 참가신청 CTA가 열려 있는지 결정합니다.",
    files: [
      "MARVEL-RUN/src/lib/mode.ts (registrationForced · isRegistrationOpen)",
      "MARVEL-RUN/src/components/main/register/useRegistrationOpen.ts",
      "MARVEL-RUN/src/components/main/register/RegistrationGate.tsx",
      "MARVEL-RUN/src/app/(main)/{register,payment,lookup}/layout.tsx",
    ],
    values: [
      {
        value: "0",
        label: "0 · 강제 닫힘",
        effect: "시각과 상관없이 접수 화면을 막습니다. 참가신청·결제·신청조회 페이지가 게이트에 걸립니다.",
        off: ["p-register", "p-payment", "p-lookup"],
      },
      {
        value: "1",
        label: "1 · 강제 열림",
        effect:
          "시각과 상관없이 화면을 엽니다. 하지만 서버는 별도로 대회 상태(OPEN)와 DB의 registStartDate~registDeadline을 검사하므로, 기간 밖이면 신청 API가 EVENT_REGISTRATION_NOT_STARTED / CLOSED로 거절합니다.",
        nodes: ["p-payment", "p-lookup", "c-registration", "s-register"],
      },
      {
        value: "3",
        label: "3 · 일정대로",
        effect:
          "EVENT.openAt(2026-09-22 14:00 KST) 이전엔 닫혀 있다가, 그 시각이 되면 타이머로 자동으로 열립니다. 0·1이 아닌 값이나 미설정도 같은 동작입니다.",
        nodes: ["p-payment", "p-lookup"],
      },
    ],
    fallback: "3",
    current: [
      { where: ".env.local", value: "1" },
      { where: ".env.production", value: "0" },
      { where: ".env.example · Dockerfile 기본값", value: "3" },
      { where: "GitHub Variables", value: "PROD_/TEST_FRONTEND_REGISTRATION_OPEN" },
    ],
    notes: [
      "CI는 0 | 1 | 3 만 허용합니다.",
      "/entry-preview/** 미리보기 경로에서는 이 값과 무관하게 항상 열립니다.",
      "프론트 게이트일 뿐이고, 최종 접수 가능 여부는 백엔드 RegistrationPolicyValidator가 판단합니다.",
    ],
    nodes: ["l-env", "l-mode", "p-register"],
  },
  {
    id: "bgm",
    name: "NEXT_PUBLIC_BGM",
    side: "frontend",
    title: "배경음악 on / off",
    summary: "본 사이트에서 BgmPlayer를 붙일지, 어떤 음원을 쓸지 정합니다.",
    files: ["MARVEL-RUN/src/lib/main/config.ts (BGM_SRC)", "MARVEL-RUN/src/app/layout.tsx"],
    values: [
      { value: "on", label: "on", effect: "/audio/bgm.mp3를 재생합니다. 미설정도 on과 같습니다." },
      { value: "off", label: "off", effect: "BgmPlayer를 렌더하지 않습니다. 지도에 따로 그린 노드는 없고 홈 화면의 플레이어만 사라집니다." },
      {
        value: "/audio/…",
        label: "/audio/… 경로",
        effect: "지정한 음원 파일을 재생합니다.",
      },
    ],
    fallback: "on",
    current: [
      { where: ".env.local · .env.example", value: "off" },
      { where: "Dockerfile 기본값", value: "on" },
      { where: "GitHub Variables", value: "PROD_/TEST_FRONTEND_BGM" },
    ],
    notes: [
      "APP_MODE=main일 때만 의미가 있습니다. coming-soon에서는 값과 무관하게 재생하지 않습니다.",
      "CI는 on | off | /audio/* 만 허용합니다.",
    ],
    nodes: ["l-env", "p-home"],
  },
  {
    id: "admin-refund-batch",
    name: "NEXT_PUBLIC_ADMIN_REFUND_BATCH",
    side: "frontend",
    title: "관리자 환불 기능 on / off",
    summary: "관리자 화면의 전액·부분 환불 버튼과 단체 결제 조정을 보여 줄지 정합니다.",
    files: [
      "MARVEL-RUN/src/lib/admin/config.ts (hasAdminRefundBatch)",
      "MARVEL-RUN/src/components/admin/applications/ApplicationDetailDrawer.tsx",
      "MARVEL-RUN/src/components/admin/members/OrganizationDetailPage.tsx",
    ],
    values: [
      {
        value: "0",
        label: "0 · 끔",
        effect: "환불 버튼이 사라지고 환불 요청을 보내지 않습니다. 단체 결제 조정도 막힙니다. 백엔드 환불 API 자체는 그대로 있습니다.",
        off: ["ac-refund", "s-refund"],
      },
      {
        value: "(그 외)",
        label: "미설정 · 그 외 · 켬",
        effect: "환불 기능이 켜집니다. \"0\"만 끄는 값이라 비워 두면 켜진 상태입니다.",
        nodes: ["ac-refund", "s-refund", "x-toss"],
      },
    ],
    fallback: "(그 외)",
    current: [{ where: "Dockerfile · CI", value: "전달 안 함 → 배포 빌드는 항상 켜짐" }],
    notes: [
      "Dockerfile ARG와 GitHub 워크플로에 이 변수가 없어서, 지금 배포 파이프라인으로는 끌 방법이 없습니다. 로컬 .env에서만 끌 수 있습니다.",
    ],
    nodes: ["l-env", "a-applications", "a-members"],
  },
  {
    id: "api-base",
    name: "NEXT_PUBLIC_API_BASE_URL",
    side: "frontend",
    title: "공개 API 주소 (비면 연동 꺼짐)",
    summary: "값이 비어 있으면 hasMainApi=false가 되어 신청·조회·옵션 조회가 API를 부르지 않습니다.",
    files: ["MARVEL-RUN/src/lib/main/config.ts", "MARVEL-RUN/src/lib/main/fetch.ts"],
    values: [
      {
        value: "",
        label: "비어 있음",
        effect:
          "신청 제출·신청조회가 \"API 주소가 설정되지 않았습니다\" 오류를 냅니다. mainFetch는 status 0으로 즉시 실패하므로 공지·문의·결제 승인 호출도 함께 멈춥니다.",
        off: ["l-mainfetch", "api-user", "c-registration", "c-query", "c-modify", "c-payment", "c-event", "c-community"],
      },
      {
        value: "url",
        label: "주소 있음",
        effect: "mainFetch가 이 주소(예: …/api)에 경로를 붙여 User API를 호출합니다.",
        nodes: ["api-user", "c-registration", "c-query", "c-event"],
      },
    ],
    fallback: "",
    current: [{ where: "CI", value: "비어 있으면 배포 실패" }],
    nodes: ["l-env", "l-mainfetch", "p-register", "p-lookup"],
  },
  {
    id: "toss-client-key",
    name: "NEXT_PUBLIC_TOSS_CLIENT_KEY",
    side: "frontend",
    title: "Toss 클라이언트 키 (비면 결제 불가)",
    summary: "결제위젯을 띄우는 공개 키입니다. 비어 있으면 결제 단계로 넘어갈 수 없습니다.",
    files: ["MARVEL-RUN/src/lib/main/config.ts (hasTossClientKey)", "MARVEL-RUN/src/components/main/register/RegisterFlow.tsx"],
    values: [
      {
        value: "",
        label: "비어 있음",
        effect:
          "결제 버튼에서 \"결제 연동 설정(NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_TOSS_CLIENT_KEY)이 필요합니다\" 오류가 납니다. 신청조회의 재결제도 막힙니다.",
        off: ["l-toss", "x-toss", "p-payment"],
      },
      {
        value: "test_ck_…",
        label: "테스트 키",
        effect: "테스트 결제창이 뜹니다. 실제 돈이 나가지 않습니다. test-deploy가 secrets.NEXT_PUBLIC_TOSS_CLIENT_KEY_TEST를 씁니다.",
        nodes: ["l-toss", "x-toss"],
      },
      {
        value: "live_ck_…",
        label: "라이브 키",
        effect: "실결제가 됩니다. prod-deploy가 secrets.NEXT_PUBLIC_TOSS_CLIENT_KEY를 씁니다.",
        nodes: ["l-toss", "x-toss"],
      },
    ],
    fallback: "",
    current: [
      { where: "test-deploy", value: "NEXT_PUBLIC_TOSS_CLIENT_KEY_TEST" },
      { where: "prod-deploy", value: "NEXT_PUBLIC_TOSS_CLIENT_KEY" },
    ],
    notes: ["클라이언트 키와 짝이 맞는 시크릿 키(TOSS_SECRET_KEY)가 백엔드에 있어야 승인이 됩니다."],
    nodes: ["l-env", "p-payment", "p-lookup"],
  },
  {
    id: "event-id",
    name: "NEXT_PUBLIC_EVENT_ID",
    side: "frontend",
    title: "대상 대회 ID (테스트 / 운영)",
    summary: "공개 API 경로의 {eventId}에 들어가는 기본 대회입니다.",
    files: ["MARVEL-RUN/src/lib/main/config.ts (DEFAULT_EVENT_ID)"],
    values: [
      { value: "test-marvelrun", label: "test-marvelrun", effect: "테스트 대회 데이터로 신청·조회합니다." },
      { value: "marvelrun2026", label: "marvelrun2026", effect: "운영 대회로 신청·조회합니다." },
    ],
    fallback: "",
    current: [
      { where: ".env.local", value: "test-marvelrun" },
      { where: ".env.production", value: "marvelrun2026" },
      { where: "CI", value: "비어 있으면 배포 실패" },
    ],
    nodes: ["l-env", "l-mainfetch", "c-event", "d-mysql"],
  },
  {
    id: "admin-api-base",
    name: "NEXT_PUBLIC_API_BASE_URL_ADMIN",
    side: "frontend",
    title: "관리자 API 주소 (비면 로컬 모드)",
    summary: "비어 있으면 hasAdminApi=false가 되어 관리자 화면이 서버 없이 동작하는 로컬 모드가 됩니다.",
    files: ["MARVEL-RUN/src/lib/admin/config.ts", "MARVEL-RUN/src/services/admin/auth.ts"],
    values: [
      {
        value: "",
        label: "비어 있음 · 로컬",
        effect:
          "로그인이 서버 확인 없이 가짜 토큰(mr-dev-…, local-admin)으로 통과합니다. 신청·단체·정원·문의 목록 쿼리는 비활성이라 빈 화면입니다. refresh도 하지 않습니다.",
        nodes: ["l-localstore"],
        off: ["l-adminfetch", "api-admin", "ac-auth", "s-adminauth"],
      },
      {
        value: "url",
        label: "주소 있음",
        effect: "adminFetch가 Bearer 토큰으로 Admin API(…/admin-api)를 부르고, 401이면 한 번 refresh합니다.",
        nodes: ["api-admin", "ac-auth", "s-adminauth", "d-redis"],
      },
    ],
    fallback: "",
    current: [{ where: "GitHub Variables", value: "PROD_/TEST_FRONTEND_API_BASE_URL_ADMIN" }],
    nodes: ["l-env", "l-adminfetch", "l-adminauth", "a-login"],
  },
  {
    id: "be-refund-batch",
    name: "admin.refund.batch.enabled",
    side: "backend",
    title: "환불 배치 안전 검사 (백엔드)",
    summary:
      "이름과 달리 환불 API를 켜고 끄는 스위치가 아닙니다. true이면 기동할 때 spring.jpa.open-in-view=false인지 확인하고, 아니면 서버가 뜨지 않습니다.",
    files: ["admin/…/payment/command/batch/AdminRefundBatchConfiguration.java"],
    values: [
      {
        value: "true",
        label: "true",
        effect: "OSIV가 켜져 있으면 IllegalStateException으로 기동 실패. 긴 동기 환불 요청에 엔티티가 쌓이지 않게 강제합니다.",
      },
      {
        value: "false",
        label: "false · 미설정",
        effect: "검사를 건너뜁니다. AdminRefundBatchController는 어느 쪽이든 등록됩니다.",
      },
    ],
    fallback: "false",
    current: [{ where: "application.yml", value: "없음 (서버의 API-KEY.yml 값은 저장소에서 확인 불가)" }],
    nodes: ["ac-refund", "s-refund", "d-secrets"],
  },
  {
    id: "be-attachment",
    name: "attachment.storage.default-type",
    side: "backend",
    title: "첨부파일 저장소 종류 (백엔드)",
    summary: "문의 첨부 이미지를 어디에 저장할지 정합니다.",
    files: [
      "user/src/main/resources/application.yml",
      "user/…/common/attachment/storage/AttachmentStorageRegistry.java",
      "common-entity/…/inheritance_enum/AttachmentStorageType.java",
    ],
    values: [
      {
        value: "LOCAL",
        label: "LOCAL",
        effect: "LocalAttachmentStorage가 /app/data/attachments에 저장합니다. 현재 유일한 구현체입니다.",
        nodes: ["d-files"],
      },
      {
        value: "OBJECT_STORAGE",
        label: "OBJECT_STORAGE",
        effect: "enum에는 있지만 구현체가 없어 AttachmentStorageNotFoundException이 납니다.",
        off: ["d-files"],
      },
    ],
    fallback: "LOCAL",
    current: [{ where: "user application.yml", value: "LOCAL" }],
    notes: ["업로드 제한: 최대 3장, 장당 5MB, 합계 15MB, JPEG·PNG만 (attachment.upload.*)."],
    nodes: ["c-community", "s-community"],
  },
];

export const ENV_SWITCH_MAP = new Map(ENV_SWITCHES.map((s) => [s.id, s]));

export function switchesForNode(nodeId: string) {
  return ENV_SWITCHES.filter(
    (s) => s.nodes.includes(nodeId) || s.values.some((v) => v.nodes?.includes(nodeId)),
  );
}
