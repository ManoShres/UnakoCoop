# Unako Saving & Credit Cooperative Ltd.
### उनको बचत तथा ऋण सहकारी संस्था लि.

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-676%20Passed-emerald?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-amber)](#)

> **Reg. No:** १२९०/०६७/०६८ (1290/067/068) &nbsp;|&nbsp; **PAN:** ३००१२४८९० (300124890)  
> **Head Office:** Gadhwa-5, Chainpur, Dang, Lumbini Province, Nepal (गढवा-५, चैनपुर, दाङ, नेपाल)  
> **Contact:** ०८२-४१२०५५ / ९८५७८२१००० &nbsp;|&nbsp; `info@unako.coop.np`

---

## 📖 Overview

**Unako SACCOS Core Banking & Cooperative Management Platform** is a modern, high-performance financial management web application purpose-built for Saving and Credit Cooperatives (SACCOS) in Nepal.

The platform aligns with the **Nepal Cooperative Act 2074 (सहकारी ऐन २०७४)**, the Department of Cooperatives regulatory frameworks, and the international **WOCCU PEARLS** financial monitoring standards. It features dual-mode architecture: operating seamlessly with **Supabase** cloud persistence when configured, while offering a self-contained local state engine for instant offline demo and uninterrupted operations.

---

## ✨ Key Capabilities & Modules

### 🏛️ 1. Core Banking & Cashier Teller System (CBS)
- **Fast Banking Counter**: High-speed teller terminal with comprehensive keyboard navigation (`F1`–`F9` hotkeys) for cash deposits, withdrawals, loan installments, and member search.
- **Daily Field Collection Sheet**: Batch entry module for field collectors operating across rural wards with one-click bulk posting, reconciliation checks, and voucher receipt printing.
- **Bank Statement Reconciliation**: Multi-source reconciliation system matching CBS internal ledgers with commercial bank statements, complete with mismatch resolution audit trails.
- **Internal & Member Transfers**: Instant wallet, savings, and inter-account transfers with transaction limits and real-time ledger verification.

### 📊 2. Regulatory Compliance & Prudential Standards
- **PEARLS Financial Ratio Monitoring**: Automatic evaluation of 15+ vital cooperative ratios across **P**rotection, **E**ffective Financial Structure, **A**sset Quality, **R**ates of Return & Costs, **L**iquidity, and **S**igns of Growth.
- **Loan Loss Provisioning (NPL)**: Built-in 5-tier risk provisioning complying with Nepal Cooperative Act 2074 & NRB directives:
  - *Pass Loan (असल कर्जा)* — 1% provision
  - *Watchlist (सुक्ष्म निगरानी)* — 5% provision
  - *Substandard (कमसल)* — 25% provision
  - *Doubtful (शंकास्पद)* — 50% provision
  - *Bad / Loss (खराब कर्जा)* — 100% provision
- **Statutory Funds Management**: Automated reserve tracking for General Reserve Fund (जगेडा कोष - min 25%), Cooperative Education Fund (शिक्षा कोष), Community Development Fund (सामुदायिक विकास कोष), and Employee Welfare Fund.
- **COPOMIS Reporting**: Export module structured for the Ministry of Land Management, Cooperatives and Poverty Alleviation COPOMIS reporting protocol.

### 🌾 3. Cooperative Operations & Agro-Trading
- **Trading Profit & Loss (P&L)**: Dedicated ledger for consumer goods, seed distribution, chemical fertilizers, and agricultural produce trading.
- **Self-Help Groups (SHG / Aama Samuha - आमा समूह)**: Ward-level group administration, joint liability monitoring, field officer assignments, and rural women's empowerment tracking.
- **Shares & Dividend Distribution**: Kitta (कित्ता) share certificate registry, bulk dividend distribution engine (cash & share bonuses), tax calculations, and member payout receipts.

### 📱 4. Member Digital Experience
- **Digital Passbook**: Real-time passbook ledger showing running balances, deposits, withdrawals, and interest postings with Bikram Sambat (BS) timestamps.
- **Loan Portfolio & Application**: Online loan requests with interactive EMI amortisation schedule simulator, interest payment tracking, and top-up eligibility calculator.
- **KYC & Biometric Verification**: Multi-document verification queue supporting Nepali Citizenship (*नागरिकता*), Land Ownership Deed (*लालपुर्जा*), Ward Recommendation (*सिफारिस*), and nominee signatures.
- **Governance & Notices**: Digital access to Annual General Meeting (AGM) reports, policy changes, and dividend declaration notices.

### 🌐 5. Public Portal & AI Member Assistance
- **Bilingual Interface**: Full real-time toggle between **Nepali (नेपाली)** and **English**, including Devanagari numerals and Nepali currency formatting (`रु. १,२५,०००.००`).
- **Nepali Bikram Sambat (BS) Calendar**: Integrated BS date picker and converter covering years 2000–2100 BS.
- **24/7 AI Support Assistant**: Integrated intelligent cooperative assistant powered by OpenRouter LLM (Llama 3.3 70B) with automatic offline rule-based fallback.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/) |
| **Build & Tooling** | [Vite 8](https://vitejs.dev/) with Fast Refresh & [Oxlint](https://oxc.rs/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with custom design system |
| **State Management** | [Zustand v5](https://github.com/pmndrs/zustand) with modular domain slices & persistence |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) + Canvas Confetti |
| **Validation** | [Zod v4](https://zod.dev/) schemas at boundary interfaces |
| **Testing** | [Vitest v4](https://vitest.dev/) (71 suites, 521 unit tests) |
| **Backend & Auth** | [Supabase](https://supabase.com/) client (`@supabase/supabase-js`) + LocalStorage mock engine |
| **AI Assistant** | [OpenRouter API](https://openrouter.ai/) with intelligent SACCOS system prompts |

---

## 📁 Architecture & Directory Structure

```
unako/
├── src/
│   ├── components/         # Reusable UI widgets, navigation, layout, & Fast Banking Terminal
│   ├── data/               # Seed registries (nepaliDistricts, products, mock reports)
│   ├── hooks/              # Custom React hooks (keyboard shortcuts, print, modals)
│   ├── lib/                # Supabase client bridge & cloud config
│   ├── pages/              # Role-partitioned page views
│   │   ├── admin/          # Admin CBS console (PEARLS, Teller, Loans, Audit, Shares, P&L)
│   │   ├── member/         # Member portal (Passbook, Loans, KYC, Transfers, Statements)
│   │   └── public/         # Public pages (Home, Products, About, Reports, Unified Login)
│   ├── schemas/            # Strict Zod validation schemas
│   ├── services/           # Business domain services (member, loan, transaction, report)
│   ├── store/              # Zustand global stores (coop, auth, language, design)
│   ├── types/              # Domain TypeScript types & interfaces
│   └── utils/              # Calculation engines (PEARLS, Bikram Sambat, Provisioning, Print)
├── scripts/                # Utility scripts (Supabase connectivity check)
└── dist/                   # Production build distribution
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.0.0` or higher)
- [npm](https://www.npmjs.com/) (version `9.0.0` or higher)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/ManoShres/UnakoCoop.git
cd UnakoCoop

# 2. Install dependencies
npm install

# 3. Create your environment configuration
cp .env.example .env
```

### Environment Configuration (`.env`)
Configure the live backend by copying `.env.example` to `.env`:

```env
# Demo mode MUST stay false for any real deployment.
# When true, the app boots pre-authenticated and exposes demo affordances.
VITE_DEMO_MODE=false

# Supabase Configuration (required for live auth & persistence)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenRouter AI Support Assistant — optional, model only.
# The API KEY is NEVER set here. It is a server-side secret on the
# `ai-assistant` Supabase Edge Function (see supabase/functions/ai-assistant).
VITE_OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
```

> ⚠️ **Never put a real API key in a `VITE_`-prefixed variable.** Vite inlines
> every `VITE_*` value into the client bundle, so it becomes readable by anyone
> who loads the site. All third-party keys belong in server-side secret stores
> (Supabase Edge Function secrets, e.g. `OPENROUTER_API_KEY`).

Deploy the AI proxy and set its secret:
```bash
supabase functions deploy ai-assistant
supabase secrets set OPENROUTER_API_KEY=your-openrouter-key
```

Run the schema and seed once against your project, in order:
```bash
# In the Supabase SQL editor (or via psql):
#   1. supabase/schema.sql   (tables, RLS policies, triggers)
#   2. supabase/seed.sql     (reference data)
```
Then verify connectivity without printing any secret:
```bash
npm run db:check
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note on demo mode:** with `VITE_DEMO_MODE=true` the app boots as a
> pre-authenticated member and exposes one-click demo logins. This is for local
> development only. Production builds must use `VITE_DEMO_MODE=false`; the
> production build script fails if demo mode is enabled.

### Running Test Suite
```bash
# Run all 521 unit tests (no DOM environment; pure logic & store tests)
npm test

# Run a single suite
npx vitest run src/utils/__tests__/loanProvisioning.test.ts

# Run tests in watch mode
npx vitest
```

> On some sandboxed/CI Windows environments Node's child-process pipe creation is
> blocked, which makes Vitest's default `forks` pool fail with `spawn EPERM`.
> Use `npx vitest run --pool=threads` there.

### Production Build
```bash
npm run build     # typecheck + build, fails if demo mode is on or a secret is inlined
npm run preview
```

---

## 🔒 Security & Code Standards

- **Server-side authorization boundary**: Supabase Row-Level Security is the
  authority for data access. The client UI gates are a UX layer only — they must
  never be the sole control. See `supabase/schema.sql`.
- **Fail-closed guards**: `ProtectedRoute` and `RequirePermission` deny access
  when a session is unresolved or a staff role is missing. Nothing is granted by
  default.
- **No secrets in client code**: no API key is read from `import.meta.env` for
  outbound third-party calls. Third-party keys live in server-side secret stores,
  and the production build gate fails if a known key pattern appears in `dist/`.
- **Input validation**: forms are validated with Zod schemas at the boundary
  (`src/schemas/`), and the service layer re-validates before any write.
- **HTML output encoding**: print/receipt helpers HTML-escape interpolated
  values before writing to a print iframe.
- **Isolated printing**: print helpers generate an isolated, temporary iframe to
  avoid style bleed or background artifacts.

### ⚠️ Known limitations (read before deploying)

This codebase is a **front-end implementation with a database layer, not yet a
complete core banking system**. Be aware of the following before any real use:

1. **There is no server-side ledger for balances.** Member, savings, loan and
   transaction state is held in a client-side Zustand store seeded from
   `src/data/mockData.ts`. The Supabase CRUD services in `src/services/` are not
   wired into the UI for money movement. Balances are therefore not durable,
   not authoritative, and must not be used for real financial records until
   writes are moved into transactional server-side functions.
2. **Only `employees` and auth sessions are persisted to Supabase today.**
3. **No MFA, password-reset, account-lockout or rate-limiting** is implemented.
4. **No Content-Security-Policy on a real server**; `index.html` carries
   best-effort meta hardening only. Set CSP/HSTS at the hosting layer.
5. **No test covers RLS policy behaviour.** `supabase/schema.sql` should be
   validated against the live project (e.g. via pgTAP) before go-live.

Treat the regulatory calculations (PEARLS, provisioning, TDS, dividends) as
**decision-support displays**, not as filing-grade output, until they are
independently verified against the current Act/Rules.

---

## 🗺️ Engineering Roadmap

Shipped:
- [x] Fast Banking Counter Terminal & Hotkey Navigation
- [x] Daily Field Collector Sheets & Bulk Posting
- [x] PEARLS Financial Monitoring Engine
- [x] Loan Provisioning & Subsidized Agriculture Window
- [x] Shares Management & Dividend Distribution Engine
- [x] Bilingual English / Nepali Devanagari Architecture
- [x] Thermal Print Engine (58mm / 80mm) for field & teller receipts
- [x] Nepal QR / Dynamic Fonepay payment slips for deposits and EMI
- [x] Member Digital Smart Card with QR Verification

Not yet shipped (do not assume these exist):
- [ ] **Server-side transactional ledger** — move all balance mutations into
      Supabase RPCs with idempotency keys. *Highest priority; required before any
      real money is handled.*
- [ ] **Persist member/savings/loan/transaction state to Supabase** (today only
      employees and auth sessions are persisted)
- [ ] **RLS policy test suite** (pgTAP or equivalent) for `supabase/schema.sql`
- [ ] **MFA, password reset, login lockout & rate limiting**
- [ ] **Offline PWA & Background Sync** for rural field collectors
- [ ] **Year-End Closing (*Asar Masanta*) & TDS Calculator** — engine exists, but
      needs regulatory sign-off before use
- [ ] **COPOMIS Official XML/Excel Validator & Exporter** — validator exists,
      official submission format not certified
- [ ] **Server-side CSP/HSTS headers** at the hosting layer

---

## 📄 License & Rights

Copyright © 2026 Unako Saving & Credit Cooperative Ltd. All rights reserved.  
Maintained by the Unako SACCOS Information Technology & Digital Banking Committee.
