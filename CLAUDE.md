# CLAUDE.md — mystyleKPOP

> AI assistant guide for the **beyondfashion-ai/mystyleKPOP** repository.

---

## Project Overview

**mystyleKPOP** is a project by **beyondfashion-ai** focused on KPOP-inspired fashion and styling. The repository is currently in its initial setup phase with no source code yet committed.

### Repository Details

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Organization   | beyondfashion-ai                           |
| Repository     | mystyleKPOP                                |
| Status         | Initial setup — empty repository           |
| Remote         | `origin` configured via local proxy        |

---

## Codebase Structure

> **Note:** The repository is currently empty. Update this section as files and directories are added.

```
mystyleKPOP/
├── CLAUDE.md          # This file — AI assistant guide
└── (project files to be added)
```

### Planned / Expected Structure

As the project develops, maintain this directory map. Example structure for a typical web application:

```
mystyleKPOP/
├── CLAUDE.md
├── README.md
├── package.json        # or requirements.txt, Cargo.toml, etc.
├── src/                # Application source code
│   ├── components/     # UI components
│   ├── pages/          # Page-level views/routes
│   ├── services/       # API clients, business logic
│   ├── utils/          # Shared utilities
│   └── styles/         # Stylesheets / themes
├── tests/              # Test files
├── public/             # Static assets
├── docs/               # Documentation
└── .github/            # CI/CD workflows
```

---

## Technology Stack

> **To be determined.** Update this section once the tech stack is chosen.

When selecting technologies, document:
- **Language(s):** (e.g., TypeScript, Python)
- **Framework:** (e.g., Next.js, Django, FastAPI)
- **Styling:** (e.g., Tailwind CSS, styled-components)
- **Database:** (e.g., PostgreSQL, MongoDB)
- **Testing:** (e.g., Jest, Pytest, Vitest)
- **Package manager:** (e.g., npm, pnpm, yarn, pip, poetry)

---

## Development Workflow

### Git Conventions

- **Default branch:** `main` (to be created with first commit)
- **Feature branches:** Use `feature/<description>` naming
- **Bug fix branches:** Use `fix/<description>` naming
- **Commit messages:** Use clear, imperative mood (e.g., "Add user profile component")
- **Commit signing:** Enabled (GPG/SSH signing is configured)

### Branch Strategy

1. Create feature branches from `main`
2. Make small, focused commits
3. Open pull requests for review before merging
4. Keep `main` in a deployable state

### Code Review Checklist

- [ ] Code follows project style conventions
- [ ] Tests pass and new tests cover changes
- [ ] No secrets or credentials committed
- [ ] Documentation updated if needed

---

## Build & Run

> **To be configured.** Update with actual commands once the project scaffolding is in place.

```bash
# Install dependencies
# npm install / pip install -r requirements.txt / etc.

# Run development server
# npm run dev / python manage.py runserver / etc.

# Run tests
# npm test / pytest / etc.

# Build for production
# npm run build / etc.

# Lint / format
# npm run lint / black . / etc.
```

---

## Testing

> **To be configured.** Update this section when the test framework is set up.

- Run all tests before committing
- Aim for meaningful test coverage on business logic
- Use descriptive test names that explain the expected behavior

---

## Environment Variables

> **To be configured.** Document required environment variables here.

```bash
# .env.example (create this file when env vars are needed)
# DATABASE_URL=
# API_KEY=
# NODE_ENV=development
```

**Important:** Never commit `.env` files or secrets. Use `.env.example` for documentation.

---

## AI Assistant Guidelines

### General Principles

1. **Read before writing** — Always read existing code before proposing changes
2. **Minimal changes** — Make only the changes requested; avoid unnecessary refactoring
3. **No over-engineering** — Keep solutions simple and focused on the task
4. **Security first** — Never commit secrets, credentials, or API keys
5. **Test coverage** — Add tests for new functionality when a test framework exists

### File Operations

- Prefer editing existing files over creating new ones
- Do not create documentation files unless explicitly requested
- Keep file sizes manageable; split large files logically

### Code Style

- Follow whatever linter/formatter configuration exists in the project
- Match the style of surrounding code when making edits
- Use clear, descriptive names for variables and functions
- Add comments only where logic is non-obvious

### Commit Practices

- Write clear, concise commit messages in imperative mood
- Stage specific files rather than using `git add -A`
- Never commit `.env`, credentials, or large binary files
- Verify changes with `git diff` before committing

### What to Avoid

- Do not add unnecessary dependencies
- Do not modify CI/CD pipelines without explicit permission
- Do not force-push or rewrite shared branch history
- Do not generate or guess URLs
- Do not add emojis unless the user explicitly requests them

---

## Deployment

> **To be configured.** Document deployment procedures once established.

---

## Useful Links

- **Organization:** beyondfashion-ai
- **Repository:** mystyleKPOP

---

## Changelog

| Date       | Change                                      |
| ---------- | ------------------------------------------- |
| 2026-02-10 | Initial CLAUDE.md created for empty repository |

---

*This file should be kept up to date as the project evolves. When new tools, frameworks, or conventions are adopted, update the relevant sections above.*
