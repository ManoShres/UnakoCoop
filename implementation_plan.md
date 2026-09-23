# Implementation Plan

## [Overview]

Complete the Unako SACCOS operating loop so tellers can capture Mother Group meeting collections and post them into each member's personal savings account in the app, and close the statutory reporting gap (Trial Balance, Balance Sheet, P&L Account, Monthly Progress Report, Loan Collateral Register, Profit Distribution) on top of the reporting engines that already exist.

**Why this plan exists.** The repository already ships a substantial set of the requested features (commit `f047c9b` "feat: add admin management dashboard with reconciliation, trading P&L, and audit reports"). An audit of the current workspace shows:

| Capability | Status today | Where |
| --- | --- | --- |
| Mother Group registry (name needs location disambiguation) | **Done** — duplicate name+location guard | `src/pages/admin/MotherGroupsPage.tsx` (`handleSaveGroup` ~L97), `INITIAL_MOTHER_GROUPS` seeds two "Laliguras Mother Group" rows at different locations |
| Meeting recording | **Partial** — modal records meeting, but `totalCollected` stays `0` | `MotherGroupsPage.handleRecordMeeting` ~L140 |
| Deposit capture | **Partial** — free-text member name/no, records straight to `COMPLETED`, no meeting selection (picks `groupMeetings(groupId)[0]`) | `MotherGroupsPage.handleRecordDeposit` ~L157 |
| Money posted to member's personal account in the app | **Missing** — `recordDeposit` (useCoopStore ~L1021) only appends a row; no `Transaction`, no savings balance update, no reference number | `src/store/useCoopStore.ts` |
| PEARLS analysis ("money in ... %") | **Done** | `src/utils/pearlsAnalysis.ts`, `src/pages/admin/PearlsAnalysisPage.tsx` |
| Trading P&L | **Done** | `src/utils/tradingPL.ts`, `src/pages/admin/TradingPLPage.tsx` |
| Entry mismatch / bank reconciliation (+ duplicates) | **Done** | `src/utils/reconciliation.ts`, `src/pages/admin/ReconciliationPage.tsx` |
| Dynamic audit & transparency reports | **Done** (7 builders) | `src/services/reportService.ts`, `AdminAuditReportsPage.tsx` |
| Trial Balance ("trail balance") | **Missing** | — |
| Balance Sheet | **Missing** | — |
| P/L Account (cooperative income statement, not just trading) | **Missing** | — |
| Monthly Progress Report | **Missing** | — |
| All-loan collateral list | **Missing** — loans only carry a free-text `collateralDescription` | `src/types/index.ts` L66 |
| Profit Distributions (dividend + patronage + reserves + TDS) | **Missing** — only `sharePool.annualDividendPercent` / `patronageBonusPercent` config | `useCoopStore` `sharePool` |
| RBAC (teller vs accountant vs manager) | **Matrix exists but is never imported** — `src/utils/permissions.ts` unused | — |
| Supabase persistence for new domains | **Schema exists** (`mother_groups`, `mother_group_deposits`, `trading_transactions`, `bank_statements`, `reconciliation_entries`, `generated_reports`) but **no service layer** | `supabase/schema.sql`; `src/services/operationalService.ts` has no mappers |
| Audit trail (LOGS tab) | **Static demo rows** | `AdminAuditReportsPage.tsx` `auditLogs` ~L170 |

**Approach.** Extend the existing conventions only: Zustand `useCoopStore` slices/actions, pure testable engines in `src/utils/*`, admin pages in `src/pages/admin`, bilingual `t()` labels, Tailwind card/table styling, CSV export via the existing `triggerBrowserDownload` helper, Supabase services following the `employeeService.ts` / `operationalService.ts` mapper pattern, and Vitest tests colocated under `__tests__`. No new runtime dependencies.

## [Types]

All persistent (store/schema) types live in `src/types/index.ts`; report-output-only interfaces live next to their builder (same precedent as `TradingPLSummary` in `src/utils/tradingPL.ts`).

### Modified types — `src/types/index.ts`

```ts
// MotherGroupDeposit (L356) — add posting/audit linkage
export interface MotherGroupDeposit {
  // ...existing fields (id, meetingId, motherGroupId, memberId?, memberName,
  //    memberNo, amount, depositDate, recordedBy, recordedByName, status,
  //    referenceNo?, notes?, createdAt) remain unchanged, plus:
  /** Member savings account number the collection was posted into (set on posting). */
  savingsAccountNo?: string;
  /** Teller-ledger transaction reference created when posted (e.g. MGCOL-2081-000142). */
  transactionRef?: string;
  /** Bank deposit slip / voucher number entered by the teller for the group deposit. */
  bankDepositSlipNo?: string;
  /** ISO timestamp when the deposit was posted to the member passbook. */
  postedAt?: string;
}

// MotherGroupMeeting (L340) — add minutes/expected attendance (used by collection sheet)
export interface MotherGroupMeeting {
  // ...existing fields remain, plus:
  /** Free-text minutes / agenda outcome captured by the conductor. */
  minutes?: string;
  /** Expected members from the group roster at meeting-open time. */
  expectedMembers?: number;
}

// Collateral (new unions + Loan extensions, L54)
export type CollateralType =
  | 'LAND_LALPURJA' | 'BUILDING' | 'CASH_FD_PLEDGE' | 'SHARE_PLEDGE'
  | 'LIVESTOCK' | 'GOLD_JEWELLERY' | 'VEHICLE' | 'GUARANTOR' | 'GROUP_GUARANTEE' | 'OTHER';
export type CollateralCoverStatus = 'PLEDGED' | 'INSURED' | 'RELEASED' | 'UNDER_REVIEW';

export interface Loan {
  // ...existing fields remain, plus optional collateral register columns:
  collateralType?: CollateralType;
  /** Assessed market value of the collateral in NPR. */
  collateralValue?: number;
  /** Registered owner / guarantor of the collateral. */
  collateralOwner?: string;
  /** Livestock/agri insurance or asset policy number. */
  insurancePolicyNo?: string;
  collateralStatus?: CollateralCoverStatus;
}
```

### New types — profit distribution (persistent, `src/types/index.ts`)

```ts
export type ProfitDistributionStatus = 'DRAFT' | 'APPROVED' | 'DISTRIBUTED';

/** One statutory/appropriation line of the profit distribution plan. */
export interface ProfitAllocationLine {
  key: 'GENERAL_RESERVE' | 'RISK_FUND' | 'MEMBER_DIVIDEND' | 'PATRONAGE_BONUS'
     | 'STAFF_BONUS' | 'WELFARE_FUND' | 'RETAINED_SURPLUS';
  label: string;
  labelNepali: string;
  /** Allocation basis in percent of net distributable profit. */
  percent: number;
  amount: number;
}

/** Per-member payout row (dividend + patronage − dividend tax). */
export interface ProfitPayoutLine {
  memberId?: string;
  memberNo: string;
  memberName: string;
  shareCapital: number;
  dividendAmount: number;
  patronageAmount: number;
  /** 5% dividend tax withheld per prevailing Nepal practice. */
  taxDeduction: number;
  netPayable: number;
  /** Teller-ledger reference once distributed (DIVIDEND transaction). */
  transactionRef?: string;
}

export interface ProfitDistribution {
  id: string;
  fiscalYear: string;                 // e.g. '2081/82'
  periodLabel: string;                // e.g. 'FY 2081/82 (Shrawan–Asar)'
  netProfit: number;                  // computed surplus before appropriation
  allocations: ProfitAllocationLine[];
  payouts: ProfitPayoutLine[];
  status: ProfitDistributionStatus;
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  distributedAt?: string;
  createdAt: string;
  notes?: string;
}
```

### New computed-report types (module-local, mirrors `TradingPLSummary` precedent)

- `src/utils/financialStatements.ts`: `LedgerAccount`, `LedgerLine`, `JournalEntry`, `TrialBalanceRow`, `TrialBalance`, `BalanceSheetLine`, `BalanceSheet`, `IncomeStatementLine`, `IncomeStatement`, `MonthlyProgressReport`, `MonthlyProgressMetric`.
- `src/utils/collectionPosting.ts`: `CollectionPostingTarget` (`{ memberId?; accountNo?; error? }`), `CollectionPostingResult` (`{ ok: boolean; transactionRef?: string; error?: string }`).

## [Files]

### New files

| File | Purpose |
| --- | --- |
| `src/utils/collectionPosting.ts` | Pure helpers for the teller collection flow: resolve a `MotherGroupDeposit` to a cooperative `Member` + `SavingsAccount`, build `MGCOL-<FY>-<seq>` references, duplicate detection (same member + meeting + amount already posted), and meeting-total recompute. Keeps posting logic unit-testable outside the store. |
| `src/utils/financialStatements.ts` | Chart of accounts + double-entry journal builder from store data; `buildTrialBalance`, `buildBalanceSheet`, `buildIncomeStatement` (cooperative P&L), `buildMonthlyProgressReport`, plus `generateFinancialStatementCsv` and BS fiscal-month helpers (reuse `src/utils/nepaliDate.ts`). |
| `src/utils/profitDistribution.ts` | `computeDistributableProfit`, `buildProfitDistributionPlan` (default appropriations: General Reserve 25%, Risk Fund 10%, Member Dividend from `sharePool.annualDividendPercent`, Patronage from `sharePool.patronageBonusPercent`, Staff Bonus 5%, Welfare Fund 2%, remainder to Retained Surplus — all editable inputs), 5% dividend-tax withholding, `generatePayoutCsv`. |
| `src/pages/admin/CollectionEntryPage.tsx` | Teller "Meeting Collection Sheet": pick group (search by name **and** location — same names exist in different places), pick/create today's meeting with conductor from `employees`, roster grid with monthly-contribution defaults, per-member amounts + payment mode, running cash total, bank deposit slip fields, Save (draft `PENDING` rows), Post All (to member passbooks), duplicate warnings, recent collections for the group, CSV voucher. |
| `src/pages/admin/FinancialStatementsPage.tsx` | Tabs `TRIAL_BALANCE` / `BALANCE_SHEET` / `INCOME_STATEMENT` / `MONTHLY_PROGRESS`; period selector, balanced-check badges, CSV + print export, bilingual labels. |
| `src/pages/admin/CollateralRegisterPage.tsx` | "All Loan Collateral List": every loan with collateral columns (member, loan no, type, description, owner, assessed value, outstanding, cover ratio, insurance policy, status), filters (type/status/overdue), totals footer, CSV export; edit modal for the new collateral fields (staff with `manage_loans`). |
| `src/pages/admin/ProfitDistributionPage.tsx` | FY selector, distributable-profit breakdown, editable allocation percentages with live totals, member-wise payout table (dividend/patronage/TDS/net), status workflow DRAFT → APPROVED → DISTRIBUTED (distribution posts `DIVIDEND` transactions to member accounts), CSV export of the payout sheet. |
| `src/services/motherGroupService.ts` | Supabase row↔model mappers + CRUD for `mother_groups`, `mother_group_members`, `mother_group_meetings`, `mother_group_deposits` (mirrors `employeeService.ts`: `MotherGroupRow` / `rowToMotherGroup` / `fetch...` / `create...` / `update...`). |
| `src/services/financeService.ts` | Same pattern for `trading_transactions`, `bank_statements`, `reconciliation_entries`, `profit_distributions` (new table) and `generated_reports` upsert. |
| `src/utils/__tests__/collectionPosting.test.ts` | Unit tests for member/account resolution, reference format, duplicate detection. |
| `src/utils/__tests__/financialStatements.test.ts` | Trial balance balances, Balance Sheet `assets = liabilities + equity`, P&L sign conventions, MPR month bucketing. |
| `src/utils/__tests__/profitDistribution.test.ts` | Allocation totals equal net profit, TDS math, payout sum equals member-dividend + patronage allocation. |
| `src/services/__tests__/motherGroupService.test.ts` | Row ↔ model mapping including the new posting columns. |
| `src/components/ui/StaffRoleSwitcher.tsx` | Demo-mode staff role selector (Teller / Accountant / Branch Manager / Super Admin) following the existing `RoleSwitcher.tsx` preset pattern, so RBAC can be demonstrated offline. |

### Modified files

| File | Change |
| --- | --- |
| `src/store/useCoopStore.ts` | (1) `recordDeposit` accepts `memberId`/`savingsAccountNo` and defaults status `PENDING`; (2) new posting actions `postDepositToMemberAccount`, `postMeetingCollections`, `voidMotherGroupDeposit`, `getMemberDepositHistory`; (3) meeting `totalCollected`/`memberCount` recomputed when deposits change; (4) new `profitDistributions` slice + `addProfitDistribution`/`approveProfitDistribution`/`distributeProfitDistribution`/`removeProfitDistribution`; (5) seed imports for the new slices; (6) optional Supabase sync hooks calling `motherGroupService`/`financeService` when `isSupabaseConfigured()`. |
| `src/pages/admin/MotherGroupsPage.tsx` | Deposit modal upgrade: member dropdown from the selected group's roster (`motherGroupMembers`) instead of free text (free-text fallback kept for unregistered savers), explicit meeting selector, bank slip number field, saves as `PENDING`, toast links to the new Collection Entry page; Deposits tab shows new columns (posted account, `transactionRef`, posted badge) and a Post action. |
| `src/pages/admin/AdminAuditReportsPage.tsx` | Consume the new `reportService` builders automatically (already generated via `generateReportsForPeriod`); replace the static `auditLogs` array (~L170) with a derived audit trail built from domain records (collections posted/voided, reconciliation resolutions, profit distributions, trading voids). |
| `src/services/reportService.ts` | Add builders + registry entries: Trial Balance, Balance Sheet, P&L (Income Statement), Monthly Progress Report, Loan Collateral Register, Profit Distribution Statement; extend `summariseReport` key cases for their headline figures. |
| `src/components/layout/AdminLayout.tsx` | Nav items for `/admin/collection-entry` (badge = pending deposits, already computed at L44-46), `/admin/financial-statements`, `/admin/collateral-register`, `/admin/profit-distribution`; filter items through `hasPermission` using the signed-in staff role. |
| `src/App.tsx` | Routes for the four new pages (imports + `<Route>` entries under `/admin`). |
| `src/store/useAuthStore.ts` | Add `staffAccessRole: EmployeeAccessRole` + `setStaffAccessRole` (persisted, defaults `SUPER_ADMIN` in offline demo; resolved from the staff employee record in live mode). |
| `src/data/mockData.ts` | Seed the new collateral fields on `INITIAL_LOANS` (type, value, owner, insurance, status). |
| `src/data/motherGroupDepositsMockData.ts` | Add `memberId`, `savingsAccountNo`, `transactionRef`, `postedAt` on posted rows and keep 1–2 `PENDING` rows so the AdminLayout badge and posting flow have demo data. |
| `src/data/reconciliationMockData.ts` | Add one seeded mismatch demonstrating a group collection posted with a wrong slip amount (exercises the reconciliation queue with collection data). |
| `supabase/schema.sql` | `alter table ... add column if not exists` for deposit posting columns (`savings_account_no`, `transaction_ref`, `bank_deposit_slip_no`, `posted_at`), loan collateral columns (`collateral_type`, `collateral_value`, `collateral_owner`, `insurance_policy_no`, `collateral_status`), new `profit_distributions` table (jsonb `allocations`/`payouts`), and all new tables added to the `staff_data` RLS loop. |
| `supabase/seed.sql` | Collateral values on seeded loans; one sample approved/distributed profit distribution row (idempotent `on conflict`). |

### Deleted or moved files

None. No existing file is removed or renamed.

## [Functions]

### New store actions — `src/store/useCoopStore.ts`

```ts
// Teller collection posting — creates a DEPOSIT Transaction on the member's
// savings account, bumps the balance, stamps savingsAccountNo/transactionRef/
// postedAt on the deposit and flips its status to COMPLETED.
// Returns an error when the member has no linked savings account.
postDepositToMemberAccount: (depositId: string) => CollectionPostingResult;

// Bulk version used by the Collection Entry sheet: posts every PENDING deposit
// of the meeting, then recomputes meeting.totalCollected.
postMeetingCollections: (meetingId: string) => { posted: number; failed: number };

// Voids a deposit. PENDING rows void directly; COMPLETED rows also post a
// compensating WITHDRAWAL transaction (ref `MGVOID-...`) so the passbook stays
// truthful. Records the reason in `notes`.
voidMotherGroupDeposit: (depositId: string, reason: string) => void;

// Convenience selector for the member passbook / statement pages.
getMemberDepositHistory: (memberId: string) => MotherGroupDeposit[];

// Profit distribution lifecycle.
addProfitDistribution: (data: Omit<ProfitDistribution, 'id' | 'createdAt'>) => ProfitDistribution;
approveProfitDistribution: (id: string) => void;
distributeProfitDistribution: (id: string) => void; // posts DIVIDEND transactions + updates member.accruedDividend
removeProfitDistribution: (id: string) => void;
getProfitDistributionForYear: (fiscalYear: string) => ProfitDistribution | undefined;
```

### Modified store functions — `src/store/useCoopStore.ts`

- `recordDeposit(data)` (~L1021): signature gains `memberId?` and `savingsAccountNo?`; created row now uses `status: data.status ?? 'PENDING'` and generates `referenceNo` (`MGCOL-<fy>-<seq>`) via `buildCollectionReference` unless supplied. No balance mutation here — posting is explicit.
- `updateDepositStatus(id, status, notes?)`: adds guards — `COMPLETED` cannot be set manually without a `transactionRef` (must use `postDepositToMemberAccount`), `VOID` requires notes, and any change recomputes the parent meeting totals via `summariseMeetingDeposits`.
- (unchanged, reused) `adjustSavingsBalance` (~L760) and the `recordLoanRepayment` transaction-append pattern (~L734) are the in-repo precedent the new posting action follows; `MotherGroupsPage` and the new `CollectionEntryPage` both route through the new actions.

### New utility functions

`src/utils/collectionPosting.ts`

```ts
/** Matches the roster row / deposit to a cooperative member and their default savings account. */
resolveCollectionTarget(
  entry: { memberId?: string; memberNo: string },
  members: Member[],
  savings: SavingsAccount[]
): CollectionPostingTarget;

/** `MGCOL-2081-000142` style teller reference (fiscal year derived via getFiscalYear). */
buildCollectionReference(fiscalYear: string, sequence: number): string;

/** True when an identical posted collection already exists for member+meeting+amount. */
isDuplicateCollection(
  candidate: Pick<MotherGroupDeposit, 'motherGroupId' | 'meetingId' | 'memberNo' | 'amount'>,
  existing: MotherGroupDeposit[]
): boolean;

/** Sum + non-void count for a meeting's deposits (used to recompute meeting totals). */
summariseMeetingDeposits(deposits: MotherGroupDeposit[]): { totalCollected: number; memberCount: number };

/** Roster defaults: group members joined with their monthly contribution for the entry grid. */
buildCollectionSheet(
  groupId: string,
  motherGroupMembers: MotherGroupMember[],
  deposits: MotherGroupDeposit[],
  meetingId: string
): CollectionSheetRow[];
```

`src/utils/financialStatements.ts`

```ts
export const CHART_OF_ACCOUNTS: LedgerAccount[];
export interface StatementsInput {
  members: Member[]; savings: SavingsAccount[]; loans: Loan[]; transactions: Transaction[];
  motherGroupDeposits: MotherGroupDeposit[]; tradingTransactions: TradingTransaction[];
  employees: Employee[]; sharePool: SharePool; coopSettings: CoopSettings;
}
export function buildJournal(input: StatementsInput): JournalEntry[];      // maps ledger events to debits/credits
export function buildTrialBalance(input: StatementsInput): TrialBalance;   // Dr/Cr per account + balanced flag + totals
export function buildBalanceSheet(input: StatementsInput): BalanceSheet;   // assets / liabilities / equity + balancing check
export function buildIncomeStatement(input: StatementsInput, from: string, to: string): IncomeStatement;
export function buildMonthlyProgressReport(input: StatementsInput, monthKey: string): MonthlyProgressReport;
export function listStatementPeriods(input: StatementsInput): string[];    // 'YYYY-MM' keys from transactions
export function generateFinancialStatementCsv(rows: (string | number)[][], title: string): string;
```

Ledger treatment the engine follows (standard SACCOS practice): member savings deposits → **Cr Member Savings (liability)** / **Dr Cash or Bank**; loan EMI split into principal (Dr Cash / Cr Loan Portfolio) and interest income at the loan's rate; group collections are ordinary deposits once posted; share purchases → **Cr Share Capital**; dividends posted → **Dr Retained Earnings / Cr Member Savings**; savings interest expense and staff salaries come from `employees`; trading income/cost feed `4010 Trading Income` / `5040 Trading Cost`; a `Suspense / Entry Mismatch` account absorbs any members-vs-ledger variance so the trial balance always proves — that suspense balance is exactly what the Reconciliation page investigates.

`src/utils/profitDistribution.ts`

```ts
export function computeDistributableProfit(input: StatementsInput, fiscalYear: string): {
  totalIncome: number; totalExpense: number; netProfit: number;
};
export const DEFAULT_ALLOCATION_PERCENTS: Record<ProfitAllocationLine['key'], number>;
export function buildProfitDistributionPlan(
  input: StatementsInput,
  fiscalYear: string,
  periodLabel: string,
  allocationPercents?: Partial<Record<ProfitAllocationLine['key'], number>>
): Omit<ProfitDistribution, 'id' | 'createdAt' | 'status' | 'createdBy'>;
export function generatePayoutCsv(distribution: ProfitDistribution): string;
```

Patronage basis: each member's share is derived from recorded activity (loan interest paid + savings contributed over the year) — computed inside `buildProfitDistributionPlan` and documented in JSDoc so the formula is auditable.

### Modified report functions — `src/services/reportService.ts`

- `generateReportsForPeriod(inputs)` (existing, ~L310): register six new builders — `buildTrialBalanceReport`, `buildBalanceSheetReport`, `buildIncomeStatementReport`, `buildMonthlyProgressReportReport`, `buildCollateralRegisterReport`, `buildProfitDistributionReport` — and pass their output as `data`.
- `summariseReport(report, lang)` (~L349): new key cases (`balanced`, `netProfit`, `collectionEfficiency`, `collateralCoverRatio`, …) so each new card renders a one-line bilingual summary.

## [Classes]

No class changes. The codebase has no classes — it uses:

- **Zustand stores** (`useCoopStore`, `useAuthStore`, …) for state + actions; the plan only adds slices/actions to `useCoopStore` and one field to `useAuthStore`.
- **React function components** for pages (`export function MotherGroupsPage()`, `export const TradingPLPage: React.FC = () => …`); the four new pages follow that pattern and are registered in `src/App.tsx`.
- **Pure module functions** for engines (`src/utils/*.ts`); the new `collectionPosting`, `financialStatements`, `profitDistribution` modules follow the `tradingPL.ts` / `pearlsAnalysis.ts` precedent.
- **Row-mapper service modules** for Supabase (`src/services/*Service.ts`); the two new services follow `employeeService.ts`.

No inheritance, no decorators, no DI container — none exist in this project.

## [Dependencies]

**No new packages.** Everything required already exists in `package.json`:

- State: `zustand` ^5.0.15 (store slices).
- UI: `react` / `react-dom` 19, `lucide-react` (icons used by the new pages: `Wallet`, `Banknote`, `ScrollText`, `TrendingUp`, `Scale`, `ShieldCheck`, `FileSpreadsheet`, `Landmark`), Tailwind CSS v4 for the card/table styling.
- Routing: `react-router-dom` ^7.18.4 (new routes).
- Persistence: `@supabase/supabase-js` ^2.116.0 (new services).
- Testing: `vitest` ^4.1.11 (new tests run through the existing `npm run test`).
- Reused helpers: `src/utils/nepaliDate.ts` (`formatNPR`, `formatBSDate`, `getFiscalYear`, `toNepaliDigits`), `src/utils/copomisExport.ts` (`triggerBrowserDownload`), `src/utils/permissions.ts` (RBAC matrix).

No version bumps. No polyfills. CSV generation stays hand-rolled string building (the established convention in `tradingPL.ts` / `copomisExport.ts`) rather than adding a CSV library.

## [Testing]

### New test files (Vitest, colocated `__tests__` folders)

1. `src/utils/__tests__/collectionPosting.test.ts`
   - `resolveCollectionTarget` finds member by `memberNo` and returns the linked savings account (by `savings.memberId`); returns `error` for an unregistered saver.
   - `buildCollectionReference('2081/82', 142)` → `MGCOL-2081-000142`.
   - `isDuplicateCollection` flags same member+meeting+amount, ignores different meetings/amounts.
   - `summariseMeetingDeposits` excludes `VOID` rows from totals.
2. `src/utils/__tests__/financialStatements.test.ts`
   - Trial balance: debits equal credits (`balanced === true`) on the seeded store snapshot.
   - Balance sheet: `assets === liabilities + equity`; suspence variance flows to the suspense line.
   - Income statement: income/expense sign conventions and net profit for a period window.
   - Monthly progress report: month bucketing of deposits/EMI/collections for the seeded dates.
3. `src/utils/__tests__/profitDistribution.test.ts`
   - Allocation lines sum to `netProfit`; only the remainder line absorbs rounding.
   - TDS = 5% of member dividend; `netPayable = dividend + patronage − tax`.
   - Sum of `payouts.memberDividend` equals the `MEMBER_DIVIDEND` allocation amount.
4. `src/services/__tests__/motherGroupService.test.ts`
   - Row ↔ model round-trip including the new `savings_account_no`, `transaction_ref`, `bank_deposit_slip_no`, `posted_at` columns; nulls collapse to `undefined` (same assertions style as `employeeService.test.ts`).

### Extended existing tests

- `src/store/__tests__/coopStore.test.ts` — add a `Mother Group collection posting` describe block:
  - `recordDeposit` creates a `PENDING` row with `MGCOL-…` reference and does **not** change savings balances.
  - `postDepositToMemberAccount` increases the member's savings balance by the exact amount, prepends a `DEPOSIT` transaction with `memberId`, stamps `transactionRef`/`savingsAccountNo`/`postedAt`, flips status to `COMPLETED`, and is idempotent for a second call.
  - `postMeetingCollections` posts all pending rows and updates `meeting.totalCollected`.
  - `voidMotherGroupDeposit` on a posted row adds the compensating `WITHDRAWAL` and restores the balance.
  - `distributeProfitDistribution` credits member savings with `DIVIDEND` transactions and sets `accruedDividend`.

### Validation strategy (run after each phase)

1. `npm run build` — TypeScript project build must stay clean (`tsc -b && vite build`).
2. `npm run test` — all Vitest suites green (currently 25 tests in 4 files; expect ~60+ after this plan).
3. `npm run lint` — oxlint clean (config at `.oxlintrc.json`).
4. Manual QA (offline demo mode) — the teller walkthrough: register two same-named groups at different locations → add roster members (linked + unregistered) → open Collection Entry → select group by "name — location" → enter per-member amounts → Save (PENDING + badge) → Post All → verify member passbook/transactions show `MGCOL-…` credits and balances moved → void one posting → run Admin → Reconciliation auto-match against a seeded statement line → open the four new pages and export CSVs → run Profit Distribution draft → approve → distribute → verify dividend transactions. Repeat in Supabase mode after running the updated `schema.sql` + `seed.sql` (idempotent re-runs).

## [Implementation Order]

Each numbered step ends running `npm run build` + `npm run test` and is independently committable. Steps 1–3 deliver the user's core question ("how do staff enter money collected through Mother Groups and get it into the member's account"); steps 4–7 deliver the missing report suite; steps 8–10 harden and persist.

1. **Type & seed foundation** — `src/types/index.ts`: extend `MotherGroupDeposit` (+4 fields), `MotherGroupMeeting` (+2), `Loan` (+5 collateral fields), add collateral unions + `ProfitDistribution` types. Update `src/data/mockData.ts`, `src/data/motherGroupDepositsMockData.ts`, `src/data/reconciliationMockData.ts` seeds. `npm run build` must pass — nothing consumes the new optional fields yet.
2. **Posting engine + store actions** — create `src/utils/collectionPosting.ts`; add `postDepositToMemberAccount`, `postMeetingCollections`, `voidMotherGroupDeposit`, `getMemberDepositHistory` to `useCoopStore`; modify `recordDeposit`/`updateDepositStatus`; recompute meeting totals. Write `collectionPosting.test.ts` + extend `coopStore.test.ts`.
3. **Teller UI** — create `CollectionEntryPage.tsx`; upgrade the `MotherGroupsPage` deposit modal (roster picker, meeting selector, PENDING default, post action, new deposit columns); add `/admin/collection-entry` route (`App.tsx`) and nav item (`AdminLayout.tsx`, badge already computed). Manual QA of the full teller walkthrough.
4. **Financial statements engine** — create `src/utils/financialStatements.ts` (chart of accounts, journal builder, trial balance, balance sheet, income statement, MPR) + `financialStatements.test.ts`.
5. **Statements UI + report registry** — create `FinancialStatementsPage.tsx`, route `/admin/financial-statements`, nav item; add the six `reportService` builders (`buildTrialBalanceReport`, `buildBalanceSheetReport`, `buildIncomeStatementReport`, `buildMonthlyProgressReportReport`, `buildCollateralRegisterReport`, `buildProfitDistributionReport`) + `summariseReport` cases so Admin → Audit & Transparency lists them. *(Collateral/profit builders go live here as stubs returning registry-ready data; their dedicated pages follow in 6–7 — or reorder 6–7 before 5 if a single pass is preferred.)*
6. **Collateral register** — create `CollateralRegisterPage.tsx` (list, filters, totals, CSV, edit modal wired to `updateLoan`-style store action or `addTransaction`-free direct loan update), route `/admin/collateral-register`, nav item; schema/seed collateral columns.
7. **Profit distribution** — create `src/utils/profitDistribution.ts` + tests; store slice + lifecycle actions (distribution posts `DIVIDEND` transactions via the same savings-posting pattern); `ProfitDistributionPage.tsx`; route `/admin/profit-distribution`; nav item; schema `profit_distributions` table.
8. **RBAC wiring** — `useAuthStore.staffAccessRole` + `setStaffAccessRole`; `StaffRoleSwitcher` in the Admin header (demo mode); filter `AdminLayout` nav and guard the four new pages plus Mother Groups / Reconciliation / Trading with `hasPermission` (`record_deposits`, `reconcile_entries`, `record_trading`, `manage_mother_groups`, `view_reports`).
9. **Supabase persistence** — `supabase/schema.sql` migrations (deposit posting columns, collateral columns, `profit_distributions`, RLS `staff_data` additions); `supabase/seed.sql` updates; `src/services/motherGroupService.ts` + `src/services/financeService.ts` + service tests; store sync hooks mirroring the `syncEmployees` pattern (`employeeSync` status badge reuse).
10. **Live audit trail & polish** — replace the static `auditLogs` array in `AdminAuditReportsPage.tsx` with a derived trail from domain records; full `npm run build && npm run test && npm run lint`; end-to-end demo-mode and Supabase-mode QA; update `README.md` "Data flow today" section to move the new domains from "Still local demo" to "Supabase-backed" where services exist.

### Out of scope for this plan (documented, deliberately deferred — "what a cooperative still needs later")

Savings interest accrual & posting run, loan aging buckets with provisioning percentages, cash denomination / day-book closing per teller shift, fixed-asset register and depreciation, HR payroll, SMS/email member alerts, TDS remittance filing, member e-signature capture, and multi-branch consolidation. These are natural phase-2 items; nothing in this plan blocks them, and the new `financialStatements` chart of accounts already reserves the ledger codes they would extend.

### Assumptions & risks

- **Assumption:** the cooperative's dividend tax and reserve percentages used in `DEFAULT_ALLOCATION_PERCENTS` are editable defaults, not legal advice — confirm with the client's AGM resolution before going live.
- **Assumption:** "Trading P/L" means the investment/FX/commodity ledger the `TradingTransaction` model already captures (per clarification), not a separate trading company's books.
- **Risk:** posting collections creates member savings credits; if the teller collects cash but the bank deposit bounces, the `voidMotherGroupDeposit` reversal path (compensating WITHDRAWAL) is the remedy — call this out in teller training and the System Tutorial content.
- **Risk:** same group names in different locations are handled by the unique `(name, location)` index and the "name — location" selector; renaming a location later could collide — the duplicate guard in `handleSaveGroup` stays authoritative.







