# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

---

# Unako SACCOS Portal — Supabase Backend

The portal runs **with or without** Supabase:

| Mode | When | Behaviour |
| --- | --- | --- |
| **Supabase live** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set in `.env` | The HR registry loads from PostgreSQL, every create/update/delete is written through to Supabase, and the Staff/Admin login uses Supabase Auth |
| **Local demo** | env vars empty | Zustand + localStorage + mock seeds (original offline behaviour, nothing breaks) |

## 1. Create the database objects

Open **Supabase Dashboard → SQL Editor → New query** and run, in order:

1. `supabase/schema.sql` — creates `employees`, `members`, `savings_accounts`, `loans`,
   `loan_applications`, `transactions`, `inquiries`, `notifications`, `notices`,
   `coop_settings`, `share_pool`, `agm_details`, `loan_schemes`, `gateway_rails`,
   `field_officers` + indexes, `updated_at` triggers and row-level security policies.
2. `supabase/seed.sql` — 6 staff records, 2 members, CMS settings, share pool, AGM
   details, 5 loan schemes, 5 payment rails and 2 field officers.

Both scripts are idempotent — safe to re-run at any time.

## 2. Wire the credentials

Paste your project values into `.env` (get them from **Project Settings → API**):

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

Only `VITE_`-prefixed variables reach the browser, and the anon key is safe to ship
publicly because RLS protects the data. Restart `npm run dev` after editing `.env`.

## 3. Create staff logins (Supabase Auth)

**Authentication → Users → Add user** (email + password, enable *Auto Confirm User*).
Those credentials then work in the portal's **Staff / Admin** login tab.

The two “Quick Demo” buttons always bypass Supabase, so the offline demo can never
be locked out. Logging out calls `supabase.auth.signOut()`.

## 4. Verify the connection

```bash
npm run db:check      # hits the REST API and prints sample rows / RLS errors
npm run dev           # /admin/employees shows a green "Supabase live - connected" badge
```

## Security model (RLS)

- `anon` → read-only on public website tables (notices, loan schemes, coop
  settings, share pool, AGM details, field officers, generated reports); may
  only insert a `PENDING` membership application row and public inquiries
- `authenticated` member (row linked via `members.auth_user_id`) → reads/updates
  **only their own** members row, savings, loans, transactions, notifications
  and loan applications; a trigger freezes financial/KYC columns on self-updates
- `authenticated` staff (no members row linked) → full read/write on every table
- `public.employees` → staff only

`public.is_staff()` = signed in **and** not linked to a members row;
`public.current_member_id()` = the member id bound to `auth.uid()`.

## Member self-service login

1. Run the updated `supabase/schema.sql` (idempotent - it adds
   `members.auth_user_id`, the auto-link trigger and the member RLS policies).
2. **Authentication → Users → Add user** with the member's email (must match the
   `members.email` row, e.g. `ram.shrestha@unako.coop.np`), a password, and
   *Auto Confirm User* enabled. The `trg_auth_user_member_link` trigger binds
   the login to the member automatically (or link manually:
   `update members set auth_user_id = '<auth-uuid>' where member_no = 'UK-88219';`).
3. The member signs in through the portal's **Member** tab with that email.
   Session restore on refresh, `/member` + `/admin` route guards, and logout are
   all wired through `src/services/memberAuthService.ts`.
4. Verify with `npm run db:check`.

Note: in live mode the member identity comes from Supabase, while the member
portal's transaction lists still read the local demo store until those services
are wired (see "Data flow today" below).

## Data flow today

- **Supabase-backed:** HR / employee registry (`/admin/employees`) and staff login.
- **Still local demo:** members roster UI, savings, loans, shares, transfers, notices.
  Their tables already exist in `supabase/schema.sql`; add services next to
  `src/services/employeeService.ts` and swap the store mutations the same way.

Key files: `src/lib/supabase.ts` (client + feature detection),
`src/services/employeeService.ts` (typed row ↔ model mappers and CRUD),
`scripts/check-supabase.mjs` (connectivity check), `supabase/schema.sql`, `supabase/seed.sql`.

