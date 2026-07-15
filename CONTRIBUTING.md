# AnglerMY Contribution Guide

## Repository Access

The repository is private: `https://github.com/Mysyafiq93/angler-app`.

The owner can invite a partner from **Settings > Collaborators > Add people**. The partner must accept the GitHub invitation before cloning.

## First-Time Setup

```bash
git clone https://github.com/Mysyafiq93/angler-app.git
cd angler-app
npm install
```

Create `.env.local` from `.env.example` and add development credentials. Never commit `.env.local` or production secrets.

## Daily Workflow

```bash
git pull origin main
git switch -c feature/short-description
npm run lint
npm run build
git add .
git commit -m "feat: describe the change"
git push -u origin feature/short-description
```

Open a pull request from the feature branch into `main`. Explain what changed, how it was tested, and include screenshots for interface changes. Merge only after review and a passing build.

## Branch and Commit Rules

- `feature/...` for new functionality
- `fix/...` for bug fixes
- `docs/...` for documentation
- `chore/...` for maintenance
- Use imperative, focused commit messages such as `fix: restore forecast tab`
- Do not push directly to `main` for normal feature work.

## Reusable Codex Prompt

Copy and adapt this prompt for each task:

```text
You are working in the AnglerMY repository.

Task: [describe one specific change]

Requirements:
- Preserve existing application behavior outside this task.
- Inspect the relevant files before editing.
- Follow the existing Next.js, TypeScript, and styling patterns.
- Do not expose or commit secrets, .env files, service-role keys, passwords, or tokens.
- Keep the change focused and mobile-responsive.
- Add or update tests when behavior changes.

Before finishing:
1. Run npm run lint.
2. Run npm run build.
3. Run the relevant Playwright test, or explain why it cannot run.
4. Review git diff and list every changed file.
5. Report any failures and remaining risks.

Do not commit or push unless I explicitly ask. If I ask you to commit, use:
  [type]: [short imperative description]
If I ask you to push, push only the current feature branch and report the branch name and commit ID.
```

## Environment Variables

Required names are documented in `.env.example`. Store actual values only in local `.env.local` or the hosting provider's environment settings.
