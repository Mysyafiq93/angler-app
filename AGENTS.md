# AnglerMY Agent Instructions

These instructions apply to the entire repository. They are for Codex and any developer automation working on AnglerMY.

## Project

- Framework: Next.js App Router with React and TypeScript.
- Backend: Supabase.
- External services: Open-Meteo and OpenStreetMap/Leaflet.
- Package manager: npm.
- Do not change application behavior or visual design outside the requested task.

## Before Editing

1. Read the relevant files and nearby components first.
2. Check `git status --short --branch` and preserve unrelated user changes.
3. Search for an existing component, helper, style, or data pattern before creating a new one.
4. Confirm whether the task affects UI, authentication, database access, or deployment.

## Implementation Rules

- Keep changes focused and use the existing Next.js/TypeScript patterns.
- Use structured APIs and typed data instead of fragile string parsing.
- Keep layouts responsive for desktop and Android-sized screens.
- Preserve accessibility: semantic controls, labels, keyboard use, and useful error states.
- Do not add secrets, tokens, passwords, service-role keys, certificates, or real `.env` files.
- Use `.env.example` for variable names only and `.env.local` for local values.
- Do not edit `.next`, `node_modules`, `.vercel`, test output, or generated files.
- Add a short comment only where code is genuinely non-obvious.

## Verification

Run from the repository root after implementation:

```bash
npm run lint
npm run build
```

When behavior changes, run the smallest relevant Playwright test. For a full smoke check:

```bash
npx playwright test
```

Report warnings, failures, skipped tests, and any test not run. Do not claim a check passed unless it actually ran.

## Git Workflow

1. Start from an up-to-date `main`:

   ```bash
   git pull origin main
   git switch -c feature/short-description
   ```

2. Review the diff and secret status:

   ```bash
   git diff --check
   git status --short
   git diff --stat
   ```

3. Use a Conventional Commit message:

   ```text
   feat: add fishing spot filters
   fix: restore forecast tab
   docs: update contributor workflow
   chore: update dependencies
   ```

4. Commit only files related to the task. Push the feature branch and open a pull request into `main`:

   ```bash
   git add <files>
   git commit -m "type: short imperative description"
   git push -u origin feature/short-description
   gh pr create --base main --fill
   ```

5. Never force-push or push directly to `main` unless the repository owner explicitly requests it. Include the commit ID, test results, and any follow-up risks in the handoff.

## Task Prompt Template

Use this format when assigning work to an agent or Codex:

```text
Task: [one specific outcome]

Context: [relevant page, component, bug, or user flow]

Constraints:
- Preserve unrelated behavior and existing design.
- Do not expose or commit secrets.
- Keep the change responsive and accessible.

Acceptance criteria:
- [observable requirement]
- [observable requirement]

Before handoff:
- Run npm run lint.
- Run npm run build.
- Run relevant Playwright tests.
- Summarize files changed, tests run, commit ID, and remaining risks.
```

## Handoff Format

Every completed task should report:

- Summary of the change
- Files changed
- Commands/tests run and results
- Commit ID and branch
- Whether it was pushed or a pull request was opened
- Known limitations or next steps
