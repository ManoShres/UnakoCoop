# Task Plan: Interactive Distribution of Shares & Dividends Suite

## 1. Objective & Scope
Build a complete, end-to-end, on-click distribution engine for **Shares, Dividends, and Statutory Allocations** across all applicable areas of Unako SACCOS (Admin Management, Member Portal, Teller Operations, and Statutory Reserves).

---

## 2. MoSCoW Roadmap & Prioritization

### Must Have (P0)
- [x] **Pure Calculation & Distribution Engine (`src/utils/dividendDistribution.ts`)**:
  - Net dividend computation with 5% statutory TDS deduction.
  - Bonus share allotment computation (bonus kitta = `Math.floor(shareKitta * bonusPercent / 100)`).
  - Reference number generators (`DIV-<FY>-<SEQ>`, `BSH-<FY>-<SEQ>`).
  - Unit tests with 100% logic coverage in `src/utils/__tests__/dividendDistribution.test.ts`.
- [x] **Zustand Core Actions in `useCoopStore` (`src/store/`)**:
  - `executeBulkDividendDistribution`: Crediting active members' savings accounts or accrued dividend ledger, creating `DIVIDEND` transactions, updating total savings, posting announcements & notifications.
  - `executeSingleMemberDividend`: Teller-level single member payout (direct to passbook or cash counter voucher).
  - `executeBonusShareDistribution`: Crediting new share kitta to all shareholders, updating `shareCapital`, updating `sharePool.totalAllottedKitta`, and logging share transactions.
  - `claimMemberDividend`: Member self-service transfer from `accruedDividend` to savings or reinvestment into shares.
- [x] **Admin Portal On-Click Buttons & Modals (`src/pages/admin/SharesManagementPage.tsx`)**:
  - **Header Button 1**: `Distribute AGM Dividends` (`वार्षिक लाभांश वितरण`) -> opens `BulkDividendDistributionModal`.
  - **Header Button 2**: `Distribute Bonus Shares` (`बोनस सेयर कित्ता बाँडफाँड`) -> opens `BonusShareDistributionModal`.
  - **Table Row Action**: `Pay Dividend` (`लाभांश भुक्तानी`) per member -> opens `MemberDividendPayoutModal`.
- [x] **Member Portal On-Click Action (`src/pages/member/components/ShareCapitalSection.tsx`)**:
  - Dynamic Claim / Reinvest CTA banner when member has accrued dividend.
  - On-click modal `MemberDividendClaimModal`: Transfer to savings or reinvest in additional shares.

### Should Have (P1)
- [x] **Statutory Funds Appropriation Integration (`src/pages/admin/StatutoryFundsPage.tsx`)**:
  - On-click button: `Execute Annual Profit Appropriation` (आ.व. नाफा तथा कोष बाँडफाँड).
  - Links net surplus to 25% General Reserve, Dividend Stabilization Fund, and Member Dividend pool.
- [x] **Export & Dossier Print**:
  - Export CSV of dividend distribution register.
  - Printable dividend payment voucher / share certificate update.

### Could Have (P2)
- [x] Visual confetti animation upon successful bulk dividend distribution.
- [x] Quick filter in savings table for dividend credit transactions.

### Won't Have (Deferred)
- External bank payment gateway automated bulk-clearing via ConnectIPS (requires actual banking API keys; simulated in-app ledger posting).

---

## 3. Applicable Areas & Button Placement Matrix

| Area / Page | Component / Placement | Button Label (Nepali / English) | On-Click Behavior / Dialog | Impacted State / Models |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Shares Management** | Top Header Action Bar | `वार्षिक लाभांश वितरण` / `Distribute AGM Dividends` | Opens `BulkDividendDistributionModal` with 2-step preview, rate, 5% TDS toggle, savings credit | Updates all members' savings/accrued dividends, appends `DIVIDEND` transactions, updates notifications |
| **Admin Shares Management** | Top Header Action Bar | `बोनस सेयर बाँडफाँड` / `Distribute Bonus Shares` | Opens `BonusShareDistributionModal` with bonus ratio calculator & member kitta preview | Increases `shareKitta` & `shareCapital` for all members, updates `sharePool.totalAllottedKitta` |
| **Admin Shares Management** | Member Register Table (Row Action) | `लाभांश भुक्तानी` / `Pay Dividend` | Opens `MemberDividendPayoutModal` for instant teller-assisted disbursement | Credits member savings account or generates cash voucher, clears accrued balance |
| **Member Portal** | `ShareCapitalSection.tsx` (Dividend History Card) | `लाभांश बचतमा जम्मा` / `Claim Dividend to Savings` | Opens `MemberDividendClaimModal` to transfer accrued dividend directly into member savings | Decrements `accruedDividend`, increments savings balance, records transaction |
| **Member Portal** | `ShareCapitalSection.tsx` (Dividend History Card) | `सेयरमा पुँजीकरण` / `Reinvest in Shares` | Direct 1-click conversion of accrued dividend into new equity shares at par (NPR 100/kitta) | Decrements `accruedDividend`, increases `shareKitta` & `shareCapital`, issues cert update |
| **Statutory Funds Page** | Header Banner Action | `आ.व. नाफा बाँडफाँड` / `Appropriate AGM Surplus` | Opens profit distribution wizard allocating statutory reserves & member dividend pool | Updates statutory funds balances, dividend equalization fund, and distributable surplus |

---

## 4. Phase-by-Phase Execution Plan

### Phase 1: Engine & Testing (TDD)
- Create `src/utils/dividendDistribution.ts` with pure calculation functions.
- Create unit test suite in `src/utils/__tests__/dividendDistribution.test.ts`.

### Phase 2: Zustand Store Slices
- Add distribution actions to `src/store/slices/operationsSlice.ts` and `src/store/storeTypes.ts`.
- Ensure strict immutability (ECC compliance, spread operator, non-mutating updates).

### Phase 3: Admin Shares Management Suite
- Build `BulkDividendDistributionModal.tsx`.
- Build `BonusShareDistributionModal.tsx`.
- Build `MemberDividendPayoutModal.tsx`.
- Integrate on-click triggers and buttons into `SharesManagementPage.tsx`.

### Phase 4: Member Portal Self-Service
- Build `MemberDividendClaimModal.tsx`.
- Enhance `ShareCapitalSection.tsx` with dynamic claim / reinvest buttons and live balance indicators.

### Phase 5: Statutory Funds Page Integration
- Add profit appropriation distribution trigger to `StatutoryFundsPage.tsx`.

### Phase 6: Review, Build & Verification
- Run TypeScript compilation checks (`tsc -b`).
- Run Vitest tests for the new distribution engine.
- Verify bilingual support (Nepali & English) and dark/light modes.
