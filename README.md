# Template Monorepo

AI ready starter template monorepo with API, web app, landing pages, docs and specs.

## Repository Layout

- `code/api` - Backend API project
- `code/web` - Frontend web application
- `code/landing` - Public landing/marketing pages
- `docs` - Documentation (API docs, design system, etc.)
- `specs` - Architecture and product specifications
- `.agents/skills` - Local skills used for project workflows

## Getting Started

This repository is a template. Create your own project from it, then configure the apps for your product.

## Template Setup

### 1. Create a new project from this template

- Use this repo as a template (GitHub) or clone/copy it into a new repository.
- Rename the repository and update app/package names to match your product.

### 2. Prerequisites

- `bun` (runtime + package manager)
- PostgreSQL (for the API)
- Cloudflare account/tools if you plan to use the default Workers/Pages deployment approach

### 3. Environment configuration

Before running the apps, configure environment variables:

- API (`code/api`): create a local `.env` from the example file and fill in database/auth/provider values
- Web (`code/web`): set the API base URL and any frontend environment variables needed by your app

### 4. Install and run apps locally

Each app is managed independently from its own folder.

### API

```bash
cd code/api
bun install
bun run dev
```

### Web

```bash
cd code/web
bun install
bun run dev
```

### Landing

```bash
cd code/landing
bunx wrangler dev
```

## First Customization Checklist

- Update branding (app name, logo, colors, copy)
- Review authentication configuration and cookie/session domain settings
- Configure billing providers and plans (or remove billing if not needed)
- Replace or remove template example features
- Update `docs/` and `specs/` to reflect your product scope

## Documentation

- API documentation: `docs/API.md`
- Design system: `docs/DESIGN_SYSTEM.md`

## Notes

- Agent instructions are defined in `AGENTS.md` files (with `CLAUDE.md` symlinks).
- This repository is organized so code lives under `code/` and supporting material stays at the root.
- Treat template defaults as examples, not requirements.
