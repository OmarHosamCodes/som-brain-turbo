# AGENT.md

This file defines working conventions for coding agents in this repository.

## Scope

- Applies to the full repository rooted at this file.

## Environment

- Package manager/runtime: `bun`
- Monorepo orchestration: `turbo`
- Primary language: TypeScript

## Working Rules

- Keep changes minimal and task-focused.
- Prefer fixing root causes over adding workaround logic.
- Preserve existing architecture and naming patterns.
- Do not modify unrelated files.
- Add or update tests when behavior changes.

## Rules for Creating Anything New

- NEVER create more than one component per file
- NEVER put state, hooks or validators in apps/web. Instead put it in packages/
- NEVER uses ussState or useEffect. Use zustand
- put all types in the types folder in apps/web/src/types/

## Commands

- Install deps: `bun install`
- Build all: `bun run build`
- Lint all: `bun run lint`
- Typecheck all: `bun run typecheck`
- Test all: `bun run test`

If scripts differ across packages, use workspace/package-level scripts as needed.

## Code Style

- Follow repository linting/formatting configuration (`biome.json`).
- Prefer explicit, readable code over clever abstractions.
- Avoid premature optimization.
- Keep functions cohesive and small where practical.

## Validation Before Handoff

- Run lint and typecheck for touched packages.
- Run relevant tests for changed behavior.
- If full-suite execution is expensive, run targeted checks and state what was run.

## Notes for Multi-Package Changes

- Update shared types/contracts first, then consuming packages.
- Keep API and schema changes backward-compatible unless the task requires breaking changes.
- Document migration steps in PR/task notes when breaking changes are introduced.
