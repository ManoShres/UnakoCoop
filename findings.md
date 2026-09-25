# Findings & Domain Research: Share & Dividend Distribution

## 1. Domain Context & Statutory Framework (Nepal Cooperatives)

### Cooperative Act 2074 (सहकारी ऐन २०७४) & Cooperative Rules 2075
- **Section 68 - Reserve Funds & Appropriation (जगेडा तथा अन्य कोषहरू)**:
  - Minimum **25%** of annual net profit must be allocated to the **General Reserve Fund (साधारण जगेडा कोष)**.
  - **Cooperative Promotion Fund (सहकारी प्रवर्द्धन कोष)**: 0.5% - 1%.
  - **Cooperative Education Fund (सहकारी शिक्षा कोष)**: 5%.
  - **Community Development / Disaster Fund (सामुदायिक विकास / राहत कोष)**: 5% - 10%.
  - **Employees Bonus Fund (कर्मचारी बोनस कोष)**: Up to 10% (under Bonus Act / Coop bylaws).
  - **Share Dividend Stabilization Fund (लाभांश स्थिरीकरण कोष)**: Retained buffer to maintain predictable dividends in lean years.
  - **Patronage Refund Fund (संरक्षित पुँजी फिर्ता कोष)**: Minimum 25% of distributable surplus returned according to transaction volume / interest paid.
- **Section 68(2) - Share Dividend Ceiling**:
  - Maximum dividend on paid-up share capital cannot exceed **18% per annum**. Unako SACCOS currently has an AGM-approved rate of **14.5%**.
- **Nepal Income Tax Act 2058 - Dividend Withholding Tax (TDS)**:
  - Cash dividends distributed to individual members are subject to a **5% final withholding tax (TDS)**.
  - Bonus shares issued from capitalization of reserves/surplus are allotted at par value (NPR 100 per kitta).

---

## 2. Current Architecture & Gap Analysis in Unako Codebase

### Where Share & Dividend Features Currently Live:
1. **Types (`src/types/financial.ts`)**:
   - Defines `ProfitDistribution`, `ProfitAllocationLine`, `ProfitPayoutLine`, `ProfitDistributionStatus`.
   - Defines `SharePool` in `src/types/index.ts` (`parValue: 100, totalAllottedKitta, annualDividendPercent, patronageBonusPercent`).
   - Member type has `shareCapital`, `shareKitta`, `accruedDividend`.
2. **Admin Shares Management (`src/pages/admin/SharesManagementPage.tsx`)**:
   - Displays share capital stats, FD schemes, and member share holdings.
   - Action buttons present:
     - `+ Issue Share Certificate` (single member allotment)
     - `+ Open FD Account`
     - `Update Parameters` (edits `parValue`, `annualDividendPercent`, `patronageBonusPercent`, `sharePurchaseOpen`).
   - Member row action: Only `+ Allot More` (`+ थप सेयर`).
   - **GAP**: There is **no on-click button to distribute dividends** (neither bulk AGM distribution nor per-member payout).
   - **GAP**: There is **no on-click button to distribute bonus shares** (capitalization of dividend/reserves into kitta).
3. **Member Portal (`src/pages/member/SharesFixedDepositsPage.tsx` & `ShareCapitalSection.tsx`)**:
   - Displays member's share count, certificate number, and a static list of past AGM dividend records.
   - Feature toggle `enableDividendClaim: true` exists in `useDesignStore.ts` with description: *"Allows members to review dividend distributions and withdraw to savings accounts."*
   - **GAP**: There is **no interactive on-click button for members to claim, withdraw to savings, or reinvest** their accrued dividend (`accruedDividend`).
4. **Zustand Core Store (`src/store/`)**:
   - `operationsSlice.ts` has `updateSharePool` and `issueShareCertificate`.
   - **GAP**: Missing store actions:
     - `executeBulkDividendDistribution`
     - `executeSingleMemberDividend`
     - `executeBonusShareDistribution`
     - `claimMemberDividend`
5. **Statutory Funds (`src/pages/admin/StatutoryFundsPage.tsx`)**:
   - Displays Section 68 reserve funds with manual allocation/utilization modals.
   - **GAP**: Missing 1-click execution for AGM profit distribution & appropriation connecting surplus to member dividends.

---

## 3. UI/UX & Interaction Design Benchmarks (2026 Standards)

### Modern Fintech / Cooperative Principles:
- **Two-Step Confirmation & Preview (Guard against Accidental Payouts)**:
  - Bulk dividend disbursement directly affects member passbooks and cooperative cash reserves.
  - An on-click button must open a clear, transparent modal showing:
    1. Parameter inputs (Dividend % rate, Statutory 5% TDS toggle, Target: Direct to Regular Savings vs Accrue to Member Ledger).
    2. Comprehensive batch summary: Total Shareholders, Total Share Capital, Gross Dividend Amount, Total TDS Withheld (5%), Net Distribution Amount.
    3. Member-by-member breakdown table with search and pagination/scroll.
    4. Two-factor / confirmation trigger: "Execute Distribution" with loading indicator and confetti / success toast upon completion.
- **Single-Member Micro-Actions**:
  - In the Share Holdings table, a clean button `Pay Dividend` (`लाभांश भुक्तानी`) allows immediate teller settlement for visiting members.
- **Member Portal Self-Service (Empowerment & High Engagement)**:
  - Prominent card banner when `accruedDividend > 0`:
    - Shows "NPR 27,800.00 Unclaimed AGM Dividend".
    - Two quick CTA buttons:
      - 1-Click: "Transfer to Savings (बचतमा जम्मा)"
      - 1-Click: "Reinvest in Bonus Shares (सेयरमा पुँजीकरण)"
- **Auditability & COPOMIS Alignment**:
  - Every distribution must generate an official transaction code (`DIV-2081-XXXX` or `BSH-2081-XXXX`), stamp dates, update member balances, and create a system notification.
