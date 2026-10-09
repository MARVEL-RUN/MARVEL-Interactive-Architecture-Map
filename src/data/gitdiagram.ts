/** Based on GitDiagram exports — marvel-run/marvel-frontend & marvel-backend */

import type { IconName } from "@/components/WireIcon";

export type DiagramTone =
  | "blue"
  | "amber"
  | "mint"
  | "rose"
  | "indigo"
  | "teal"
  | "neutral";

export type DiagramGroup = {
  id: string;
  label: string;
  tone: DiagramTone;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const TONE_ACCENT: Record<DiagramTone, string> = {
  blue: "#5b8cff",
  amber: "#f59e0b",
  mint: "#22c55e",
  rose: "#f43f5e",
  indigo: "#818cf8",
  teal: "#14b8a6",
  neutral: "#94a3b8",
};

export type DiagramNode = {
  id: string;
  label: string;
  hint?: string;
  tone: DiagramTone;
  icon: IconName;
  x: number;
  y: number;
  external?: boolean;
};

export type DiagramEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
};

export type GitRepoDiagram = {
  id: "frontend" | "backend";
  title: string;
  gitdiagramUrl: string;
  githubUrl: string;
  overview: string;
  viewBox: { w: number; h: number };
  groups: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  flows: {
    id: string;
    title: string;
    summary: string;
    edgeIds: string[];
  }[];
};

export const GIT_REPOS: Record<"frontend" | "backend", GitRepoDiagram> = {
  frontend: {
    id: "frontend",
    title: "marvel-run / marvel-frontend",
    gitdiagramUrl: "https://gitdiagram.com/marvel-run/marvel-frontend",
    githubUrl: "https://github.com/marvel-run/marvel-frontend",
    overview:
      "Next.js 공개·관리자 UI. README·소스 샘플 기준 GitDiagram — Mode Router에서 참가/결제/Admin Shell로 갈라지고 External Services(Public API, Admin API, Toss, Kakao)로 연결됩니다.",
    viewBox: { w: 1520, h: 1160 },
    groups: [
      { id: "site", label: "Site Modes", tone: "blue", x: 450, y: 125, w: 600, h: 120 },
      { id: "public", label: "Public Experience", tone: "amber", x: 40, y: 290, w: 420, h: 330 },
      { id: "entry", label: "Registration & Payment", tone: "mint", x: 40, y: 670, w: 660, h: 300 },
      { id: "admin", label: "Operations Console", tone: "rose", x: 760, y: 290, w: 720, h: 530 },
      { id: "api", label: "External Services", tone: "indigo", x: 40, y: 1010, w: 1440, h: 120 },
    ],
    nodes: [
      { id: "visitor", label: "Attendee", tone: "indigo", icon: "user", x: 750, y: 60 },
      { id: "coming", label: "Coming Soon", tone: "blue", icon: "clock", x: 560, y: 192 },
      { id: "mode", label: "Mode Router", hint: "page.tsx", tone: "blue", icon: "route", x: 750, y: 192 },
      { id: "home", label: "Event Home", hint: "HomePage.tsx", tone: "blue", icon: "home", x: 940, y: 192 },
      { id: "guide", label: "Guide & Kit", tone: "amber", icon: "book", x: 150, y: 370 },
      { id: "eventinfo", label: "Event Information", hint: "event.ts", tone: "amber", icon: "info", x: 350, y: 370 },
      { id: "directions", label: "Directions", tone: "amber", icon: "pin", x: 150, y: 460 },
      { id: "boards", label: "Public Boards", tone: "amber", icon: "chat", x: 150, y: 550 },
      { id: "register", label: "Registration", tone: "mint", icon: "form", x: 150, y: 750 },
      { id: "regoptions", label: "Registration Options", tone: "mint", icon: "list", x: 365, y: 750 },
      { id: "payment", label: "Payment", tone: "mint", icon: "card", x: 580, y: 750 },
      { id: "registrationapi", label: "Registration Service", hint: "registrations.ts", tone: "mint", icon: "server", x: 365, y: 860 },
      { id: "paymentlib", label: "Payment Integration", hint: "lib/payment", tone: "mint", icon: "plug", x: 580, y: 860 },
      { id: "lookup", label: "Application Lookup", tone: "mint", icon: "search", x: 150, y: 900 },
      { id: "adminlayout", label: "Admin Shell", hint: "AdminLayout.tsx", tone: "rose", icon: "layout", x: 1120, y: 370 },
      { id: "adminauth", label: "Admin Authentication", hint: "auth.ts", tone: "rose", icon: "shield", x: 890, y: 470 },
      { id: "applications", label: "Application Management", tone: "rose", icon: "inbox", x: 1350, y: 470 },
      { id: "members", label: "Member Management", tone: "rose", icon: "users", x: 890, y: 570 },
      { id: "capacity", label: "Capacity Management", tone: "rose", icon: "gauge", x: 1350, y: 570 },
      { id: "adminboards", label: "Board Management", tone: "rose", icon: "chat", x: 890, y: 670 },
      { id: "admincontent", label: "Content & Legal", tone: "rose", icon: "file", x: 1350, y: 670 },
      { id: "dashboard", label: "Reports & Dashboard", tone: "rose", icon: "chart", x: 1120, y: 760 },
      { id: "publicapi", label: "Public API", tone: "indigo", icon: "cloud", x: 300, y: 1080, external: true },
      { id: "toss", label: "Toss Payments", tone: "indigo", icon: "wallet", x: 700, y: 1080, external: true },
      { id: "adminapi", label: "Admin API", tone: "indigo", icon: "lock", x: 1120, y: 1080, external: true },
      { id: "kakao", label: "Kakao Maps", tone: "indigo", icon: "map", x: 1370, y: 1080, external: true },
    ],
    edges: [
      { id: "e1", from: "visitor", to: "mode", label: "visits" },
      { id: "e2", from: "mode", to: "coming", label: "selects mode" },
      { id: "e3", from: "mode", to: "home", label: "selects mode" },
      { id: "e4", from: "home", to: "eventinfo", label: "uses event data", dashed: true },
      { id: "e5", from: "visitor", to: "guide", label: "browses" },
      { id: "e6", from: "visitor", to: "directions", label: "browses" },
      { id: "e7", from: "visitor", to: "boards", label: "reads or writes" },
      { id: "e8", from: "visitor", to: "register", label: "applies" },
      { id: "e9", from: "register", to: "regoptions", label: "loads options" },
      { id: "e10", from: "regoptions", to: "publicapi", label: "fetches options" },
      { id: "e11", from: "register", to: "registrationapi", label: "submits", dashed: true },
      { id: "e12", from: "registrationapi", to: "publicapi", label: "calls API" },
      { id: "e13", from: "visitor", to: "payment", label: "pays" },
      { id: "e14", from: "payment", to: "toss", label: "uses widget" },
      { id: "e15", from: "payment", to: "paymentlib", label: "payment logic", dashed: true },
      { id: "e16", from: "visitor", to: "lookup", label: "checks application" },
      { id: "e17", from: "lookup", to: "publicapi", label: "queries API" },
      { id: "e18", from: "directions", to: "kakao", label: "shows map" },
      { id: "e19", from: "visitor", to: "adminlayout", label: "administers" },
      { id: "e20", from: "adminlayout", to: "adminauth", label: "checks session", dashed: true },
      { id: "e21", from: "adminauth", to: "adminapi", label: "authenticates" },
      { id: "e22", from: "adminlayout", to: "applications", label: "hosts routes", dashed: true },
      { id: "e23", from: "applications", to: "adminapi", label: "loads/updates" },
      { id: "e24", from: "members", to: "adminapi", label: "manages members" },
      { id: "e25", from: "capacity", to: "adminapi", label: "manages capacity" },
      { id: "e26", from: "adminboards", to: "adminapi", label: "manages boards" },
      { id: "e27", from: "admincontent", to: "adminapi", label: "updates content" },
      { id: "e28", from: "dashboard", to: "adminapi", label: "loads reports" },
    ],
    flows: [
      {
        id: "payment",
        title: "참가 · 결제 경로",
        summary:
          "Registration → registrations.ts → Public API · Payment → Toss SDK + lib/payment · confirm은 서버(WIRE 결제 탭) 참고",
        edgeIds: ["e8", "e9", "e10", "e11", "e12", "e13", "e14", "e15"],
      },
      {
        id: "admin",
        title: "운영 콘솔 경로",
        summary: "Admin Shell → auth.ts → Admin API · 신청/정원/게시판/리포트",
        edgeIds: ["e19", "e20", "e21", "e22", "e23", "e28"],
      },
      {
        id: "public",
        title: "공개 탐색",
        summary: "Mode → Home/Coming Soon · Guide · Directions → Kakao",
        edgeIds: ["e1", "e2", "e3", "e5", "e6", "e18"],
      },
    ],
  },
  backend: {
    id: "backend",
    title: "marvel-run / marvel-backend",
    gitdiagramUrl: "https://gitdiagram.com/marvel-run/marvel-backend",
    githubUrl: "https://github.com/marvel-run/marvel-backend",
    overview:
      "User API·Admin API 분리. GitDiagram은 query/command 서비스와 Registration·Payment 도메인, Redis를 묶어 보여줍니다. 로컬 MARVEL-Backend-develop과 동일 계열 코드베이스입니다.",
    viewBox: { w: 1520, h: 1000 },
    groups: [
      { id: "user", label: "User services", tone: "blue", x: 40, y: 130, w: 660, h: 300 },
      { id: "admin", label: "Admin operations", tone: "amber", x: 760, y: 130, w: 720, h: 400 },
      { id: "community", label: "Community", tone: "mint", x: 40, y: 580, w: 1440, h: 130 },
      { id: "shared", label: "Shared domain", tone: "rose", x: 400, y: 790, w: 720, h: 150 },
    ],
    nodes: [
      { id: "user_actor", label: "User", tone: "indigo", icon: "user", x: 370, y: 60 },
      { id: "admin_actor", label: "Administrator", tone: "indigo", icon: "admin", x: 1120, y: 60 },
      { id: "user_registration", label: "Registration queries", tone: "blue", icon: "search", x: 160, y: 220 },
      { id: "user_reg_repo", label: "Registration query data", tone: "blue", icon: "database", x: 370, y: 220 },
      { id: "user_receipt", label: "Registration receipts", tone: "blue", icon: "receipt", x: 580, y: 220 },
      { id: "user_reg_command", label: "Organization registration", tone: "blue", icon: "form", x: 160, y: 350 },
      { id: "capacity_hold", label: "Capacity holds", tone: "blue", icon: "gauge", x: 370, y: 350 },
      { id: "user_payment", label: "Payment confirmation", hint: "PaymentConfirm*", tone: "blue", icon: "card", x: 580, y: 350 },
      { id: "admin_auth", label: "Admin authentication", tone: "amber", icon: "shield", x: 880, y: 220 },
      { id: "admin_registration", label: "Registration administration", tone: "amber", icon: "inbox", x: 1120, y: 220 },
      { id: "admin_reg_repo", label: "Registration records", tone: "amber", icon: "database", x: 1360, y: 220 },
      { id: "admin_capacity", label: "Capacity reporting", tone: "amber", icon: "chart", x: 880, y: 340 },
      { id: "admin_payment", label: "Payment queries", tone: "amber", icon: "wallet", x: 1120, y: 340 },
      { id: "admin_org", label: "Organization queries", tone: "amber", icon: "building", x: 1360, y: 340 },
      { id: "admin_offline", label: "Offline imports", tone: "amber", icon: "upload", x: 880, y: 460 },
      { id: "notice_user", label: "Notice browsing", tone: "mint", icon: "bell", x: 200, y: 655 },
      { id: "community_user", label: "User community", tone: "mint", icon: "chat", x: 500, y: 655 },
      { id: "notice_admin", label: "Notice management", tone: "mint", icon: "bell", x: 1000, y: 655 },
      { id: "community_admin", label: "Community administration", tone: "mint", icon: "chat", x: 1300, y: 655 },
      { id: "registration", label: "Registration domain", hint: "Registration.java", tone: "rose", icon: "layers", x: 560, y: 870 },
      { id: "payment", label: "Payment domain", hint: "Payment.java", tone: "rose", icon: "card", x: 760, y: 870 },
      { id: "redis", label: "Redis service", hint: "RedisService.java", tone: "rose", icon: "bolt", x: 960, y: 870 },
    ],
    edges: [
      { id: "b1", from: "user_actor", to: "user_registration", label: "requests registration", dashed: true },
      { id: "b2", from: "user_registration", to: "user_reg_repo", label: "reads registrations" },
      { id: "b3", from: "user_registration", to: "registration", label: "maps data" },
      { id: "b4", from: "user_actor", to: "user_receipt", label: "requests receipt", dashed: true },
      { id: "b5", from: "user_receipt", to: "registration", label: "resolves receipts", dashed: true },
      { id: "b6", from: "user_actor", to: "user_reg_command", label: "submits registration", dashed: true },
      { id: "b7", from: "user_reg_command", to: "capacity_hold", label: "coordinates capacity", dashed: true },
      { id: "b8", from: "user_reg_command", to: "user_payment", label: "coordinates payment", dashed: true },
      { id: "b9", from: "admin_actor", to: "admin_auth", label: "authenticates", dashed: true },
      { id: "b10", from: "admin_actor", to: "admin_registration", label: "reviews registrations", dashed: true },
      { id: "b11", from: "admin_registration", to: "admin_reg_repo", label: "queries registrations" },
      { id: "b12", from: "admin_registration", to: "registration", label: "reads state" },
      { id: "b13", from: "admin_registration", to: "payment", label: "uses payment data" },
      { id: "b14", from: "admin_actor", to: "admin_payment", label: "reviews payments", dashed: true },
      { id: "b15", from: "user_actor", to: "notice_user", label: "reads notices", dashed: true },
      { id: "b16", from: "user_actor", to: "community_user", label: "reads questions", dashed: true },
      { id: "b17", from: "admin_actor", to: "community_admin", label: "manages questions", dashed: true },
      { id: "b18", from: "admin_actor", to: "notice_admin", label: "manages notices", dashed: true },
    ],
    flows: [
      {
        id: "payment",
        title: "신청 · 결제 승인",
        summary:
          "Organization registration → Capacity holds → Payment confirmation → Payment/Registration 도메인",
        edgeIds: ["b6", "b7", "b8", "b12", "b13"],
      },
      {
        id: "admin-reg",
        title: "운영 · 신청 검수",
        summary: "Admin auth → Registration administration → records + domain",
        edgeIds: ["b9", "b10", "b11", "b12", "b13"],
      },
      {
        id: "community",
        title: "커뮤니티",
        summary: "공지·문의 User/Admin query 서비스",
        edgeIds: ["b15", "b16", "b17", "b18"],
      },
    ],
  },
};

export const GIT_BADGE_SVG = "https://gitdiagram.com/diagram-badge.svg";
