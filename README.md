## Export Software Frontend

Built on top of [fe-zen-arch](git@github.com:shivamkj/fe-zen-arch.git) — the core shared architecture for B2B SaaS frontends.

### Libraries

- **React** [Docs](https://react.dev/reference/react)
- **Tailwind CSS** [Docs](https://tailwindcss.com/docs/installation)
- **React Query** [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- **React Hook Form** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand** [Docs](https://zustand.docs.pmnd.rs/)

### Setup

```bash
pnpm install   # fe-zen-arch is included as a git submodule, init it first if missing
pnpm dev       # dev server on port 5173
pnpm lint-check # prettier + tsc + eslint (cross-platform)
pnpm lint       # apply formatting and lint fixes to changed files, then type-check
pnpm build     # production build
```

### Notes

- `core`, `ui`, `auth`, `icons` are fe-zen-arch workspace packages, aliased via tsconfig paths & vite aliases.
- Forms are built directly with `useForm` from `core/form` + `Form` / `SubmitButton` from `core/form/components` — no generic form templates.
- Routing uses fe-zen-arch's zustand router: routes defined in `src/shared/routes.tsx`, paths in `src/shared/route-paths.ts`.
- Auth uses the fe-zen-arch auth module (routes, interceptors, login pages) out of the box.
- API base URL comes from `PUBLIC_API_URL` (`.env`).
- Don't use react-query mutation for react-hook-form submit handler.
- For HMR (hot refresh), the file must export only react component, and not any other constant or object.
- While most input elements use `...register('name')`, custom elements like select require `<Select<T> name="name" />` instead.

### AI Usage & Approach

- **AI tool:** Copilot SDK in VS Code assisted with repository inspection, refactoring, and validation.
- **Workflow:** reviewed the existing React/TypeScript/Vite structure, form model, shared `fe-zen-arch` submodule, and package scripts before editing. The submodule remains at its pinned revision; only a local Git URL override was needed to initialize it over HTTPS.
- **Engineering decisions:** retained the existing tabbed form, domain model, local draft store, and `.sb` export. Extracted asynchronous option loading, searchable party selection, and submission validation; moved list, draft, submit, party-save, and flat-file operations behind Promise-based mock services. No dependencies or backend calls were added.
- **Domain assumptions:** require a job date, exporter and branch, consignee and branch, loading and destination ports, at least one invoice, and at least one described/priced goods item per invoice. Dates must be real `YYYY-MM-DD` dates; quantities and unit prices must be positive; amounts and counts cannot be negative; counts must be whole numbers. Fractional quantities, prices, amounts, and weights are allowed. Net weight cannot exceed gross weight; packing range endpoints and RBI waiver number/date must be paired; added container and licence rows need their respective identifiers. These are basic data-quality checks, not a claim of customs or export-law compliance; no strict tariff-code or eligibility rule was inferred.
- **Reviewed and validated:** inspected the final change set and dependency/submodule diffs; exercised the local app in a browser for initial list loading, delayed dropdown results, required-field feedback, draft save/navigation, rejection of a negative quantity, a valid submission, and duplicate-submit protection. Completed a full sample bill (`QA-2026-1024`, Aarav Textiles Pvt Ltd to Gulf Retail LLC, INNSA1 to USLAX; 12 units at USD 25.50) and confirmed bill #3001 appeared in the dashboard with a calculated total of 306. This smoke testing is not an automated regression suite.
- **Commands and results:**
  - `corepack.cmd pnpm install --frozen-lockfile` — succeeded; no manifest or lockfile changes.
  - `corepack.cmd pnpm exec tsc --incremental` — succeeded.
  - `corepack.cmd pnpm run build` — succeeded on Windows with the portable Vite configuration.
  - `corepack.cmd pnpm run lint` — succeeded; formats and lints changed files without touching unrelated files.
  - `corepack.cmd pnpm run lint-check` — now runs without Bash. TypeScript passes and ESLint reports zero errors (364 warnings). Workspace-wide Prettier still reports existing formatting differences in 120 files, including the pinned submodule; those files were not reformatted.
  - `corepack.cmd pnpm exec eslint --quiet` on the extracted picker, options service, validation, party mock service, and party dialogs — succeeded.
  - `corepack.cmd pnpm run` — confirmed there is no test script or configured test runner; no automated test suite was run.
