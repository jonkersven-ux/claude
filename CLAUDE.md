# CLAUDE.md

This file provides guidance for AI assistants (Claude, etc.) working in this repository.

## Repository Overview

- **Repository**: `jonkersven-ux/claude`
- **Status**: Contains `dashboard/` — "Jonker Sports Media" (formerly "De Ploegleider"), a single-file freelancer dashboard published as a claude.ai Artifact (https://claude.ai/artifact/9ds3VAkoftHkmzcimXmaDw).

## Project Structure

```
.
├── CLAUDE.md          # AI assistant guidance (this file)
└── dashboard/
    └── index.html     # Jonker Sports Media dashboard: vanilla HTML/CSS/JS, data via Artifact `db` capability
```

This repository is in its initial state. Update this section as the project grows.

## Development Setup

_No dependencies or build tools configured yet._

When the project is initialized, document:
- Language and runtime versions
- Package manager (`npm`, `yarn`, `pnpm`, etc.)
- Install command (e.g., `npm install`)
- Environment variables (`.env` files, required keys)

## Common Commands

_No scripts configured yet._ Add entries here as the project develops:

```bash
# Build
# npm run build

# Test
# npm test

# Lint
# npm run lint

# Format
# npm run format

# Dev server
# npm run dev
```

## Code Conventions

When code is added to this repository, document the following:
- Language style guide (e.g., Airbnb, Google, StandardJS)
- Naming conventions (files, variables, functions, classes)
- Import ordering
- Error handling patterns
- Logging conventions

## Architecture

_Not yet defined._ Document the high-level architecture here once the project takes shape:
- Monorepo vs single package
- Frontend / backend / fullstack
- Key directories and their responsibilities
- Data flow and state management
- External service integrations

## Testing

_No test framework configured yet._ When tests are added, document:
- Test framework (Jest, Vitest, Mocha, pytest, etc.)
- How to run tests (`npm test`, `pytest`, etc.)
- Test file naming and location conventions
- Coverage requirements

## CI/CD

_No CI/CD pipeline configured yet._ When added, document:
- Pipeline tool (GitHub Actions, GitLab CI, etc.)
- Required checks before merge
- Deployment process

## Git Conventions

- Use clear, descriptive commit messages
- Keep commits focused on a single change
- Branch naming: `feature/`, `fix/`, `chore/` prefixes recommended

## AI Assistant Guidelines

- Read existing code before proposing changes
- Do not over-engineer; keep solutions minimal and focused
- Avoid introducing security vulnerabilities (OWASP Top 10)
- Do not add features, refactoring, or comments beyond what is requested
- Run tests and linters after making changes
- Update this CLAUDE.md when new tools, conventions, or architecture decisions are established
