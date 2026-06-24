---
name: agent-onboard
description: Onboard coding agents to a project by scanning the repository and generating platform-specific instruction files (AGENTS.md, CLAUDE.md). Use when the user asks to make a repository agent-ready, create agent instructions, onboard Codex, Claude Code, OpenCode, or other coding agents, or generate AGENTS.md or CLAUDE.md for an existing project.
---

# Agent Onboard

Onboard coding agents to the current repository by generating platform-specific instruction files.

The output files are internal engineering guides, not consulting reports.

## Core Rules

- Ask the user to describe the project before scanning.
- Scan before asking detailed questions.
- Separate confirmed facts, inferred details, and missing context.
- Ask the project owner targeted questions before generating files.
- Do not write guessed commands or conventions as facts.
- Keep generated files short, direct, and repository-specific.
- Preserve any existing instruction files unless the user confirms replacement.

## Workflow

### 0. Get Project Description

If the user invoked the skill with a project description or arguments, use that directly. Otherwise, ask:

> Briefly describe what this project does, its purpose, and any key context that would help me understand it.

Use the answer to guide the scan and enrich the generated files. This step significantly improves output quality.

### 1. Inspect Existing Agent Instructions

Check whether these files exist:

```bash
rg --files -g 'AGENTS.md' -g 'CLAUDE.md' -g 'GEMINI.md' -g '.opencode/*'
```

If any instruction file exists, read it before doing anything else. Ask whether to update it, replace it, or create a draft alongside it. Do not overwrite without confirmation.

### 2. Scan Repository Evidence

Use `rg --files` first. Read files that exist from this list:

- `README*`
- `package.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `package-lock.json`
- `pyproject.toml`
- `requirements*.txt`
- `Pipfile`
- `poetry.lock`
- `pom.xml`
- `build.gradle`
- `settings.gradle`
- `go.mod`
- `Cargo.toml`
- `Makefile`
- `Dockerfile`
- `docker-compose*.yml`
- `.github/workflows/*`
- `.gitlab-ci.yml`
- `Jenkinsfile`
- `.opencode.yaml` or `.opencode/`
- `.claude/settings.json`
- linter, formatter, and test configuration files

Inspect top-level and second-level directory structure. Skip large generated or dependency folders such as `.git`, `node_modules`, `dist`, `build`, `target`, `.venv`, and `vendor`.

Use the project description from Step 0 to prioritize which files and directories to inspect more deeply.

### 3. Present Scan Summary

Before generating files, present a compact summary:

```markdown
## Confirmed
- Facts directly found in repository files.

## Inferred
- Likely facts based on file names, dependencies, or structure.

## Missing
- Information that could not be determined safely.

## Questions
- Questions for the project owner.
```

Keep `Inferred` conservative. If a command is not found in project files, list it as missing instead of guessing.

### 4. Ask Owner Questions

Ask 3-8 questions. Prefer fewer questions when repository evidence is strong.

Prioritize:

- Actual install, run, test, lint, format, build, and deploy commands.
- Whether tests and CI are trusted.
- High-risk modules, data flows, or workflows.
- Directories agents should avoid or treat carefully.
- Generated files and migration rules.
- Coding conventions not encoded in tooling.
- What "done" means for typical changes.
- Which agent platforms the user works with (Codex, Claude Code, OpenCode, other).

Do not ask all questions at once if the answer will be hard to provide. Group related command questions together when that reduces back-and-forth.

### 5. Generate Agent Instruction Files

Always generate `AGENTS.md`. Generate additional platform files based on which platforms the user works with (asked in Step 4). If the user did not specify, generate both `AGENTS.md` and `CLAUDE.md` by default.

#### AGENTS.md (portable, platform-agnostic)

Generate this structure:

```markdown
# AGENTS.md

## Project Snapshot
## Tech Stack
## Commands
## Repository Map
## Development Rules
## Testing and Verification
## Agent Workflow
## Risk Areas
## Do Not
## Missing Context
```

Write in short imperative prose.

Section guidance:

- `Project Snapshot`: State what the project does using confirmed files, owner input, and the project description from Step 0.
- `Tech Stack`: List languages, frameworks, runtimes, package managers, and major tools.
- `Commands`: Include only commands found in project files or confirmed by the owner.
- `Repository Map`: Describe important directories and boundaries.
- `Development Rules`: Capture project-specific style, architecture, dependency, and review rules.
- `Testing and Verification`: State exactly what agents must run before claiming completion.
- `Agent Workflow`: Tell agents to read context, make focused edits, preserve conventions, verify, and report changes.
- `Risk Areas`: List modules, files, workflows, or data paths needing extra care.
- `Do Not`: List hard constraints and forbidden actions.
- `Missing Context`: Keep unresolved questions that affect safe agent work.

This file must be portable. Do not include platform-specific agent notes in visible sections. Both OpenAI Codex and OpenCode CLI read this file as project rules.

If the user works with Codex, add Codex-specific tips as an HTML comment at the end of `AGENTS.md`:

```markdown
<!-- Codex: prefer rg over find; read nearby code before editing; keep changes scoped -->
```

#### CLAUDE.md (Claude Code specific)

Generate a concise file (80-120 lines maximum) following Claude Code best practices:

```markdown
# CLAUDE.md

## Project Overview
## Tech Stack
## Critical Commands
## Code Style & Conventions
## Workflow Preferences
## Architecture Notes
```

Section guidance:

- `Project Overview`: 2-3 sentences on what the project does and its purpose, drawn from the project description in Step 0 and confirmed evidence.
- `Tech Stack`: Concise list of languages, frameworks, and key tools with versions when known.
- `Critical Commands`: The exact commands for install, build, test, lint, format. One command per line, in code blocks. Only confirmed commands.
- `Code Style & Conventions`: Naming conventions, file organization, import ordering, formatting rules. Focus on what is not already enforced by tooling.
- `Workflow Preferences`: How the team works (branch strategy, commit message format, PR process, review expectations).
- `Architecture Notes`: Key architectural decisions, module boundaries, data flow patterns. Only include what helps an agent make safe changes.

If the project is large enough that 80-120 lines cannot cover everything, use `@import` directives to pull in additional files. For example: `@docs/architecture.md` or `@AGENTS.md`.

Keep this file focused on what Claude Code needs to work safely. Do not include personality or tone instructions, generic best practices not specific to this project, or duplicated content that is already in AGENTS.md (use `@AGENTS.md` import instead when significant overlap exists).

### 6. Self-Review Before Finishing

Check each generated file for:

- Inferred details written as confirmed facts.
- Commands not found in project files or owner answers.
- Generic advice that could apply to any repository.
- Missing testing or verification instructions.
- Missing risk areas.
- Contradictions between repository evidence and owner answers.
- Placeholder text such as `TODO`, `TBD`, or vague filler.
- CLAUDE.md exceeding 120 lines (trim or move content to @imports).
- Platform-specific content leaking into AGENTS.md.
- Duplicated content between AGENTS.md and CLAUDE.md.

Fix issues before presenting the result.

## Edge Cases

- If the repository is too large, sample top-level structure and the most important config files first.
- If no metadata files exist, generate minimal files with prominent `Missing Context` sections.
- If the owner cannot answer a question, keep it in `Missing Context`.
- If commands are discovered but may be unsafe or expensive, ask before running them.
- If the user only asks for a template, provide the structure without scanning or writing repository-specific facts.
- If the user only wants one specific file (e.g., "just generate CLAUDE.md"), generate only that file.
- If a CLAUDE.md already exists and is well-maintained, offer to update it rather than replacing it.
- If the project already has an AGENTS.md and the user wants CLAUDE.md only, use the existing AGENTS.md as input context.

## Final Response

Summarize:

- Which files were generated and their paths.
- Whether existing files were updated or new files were created.
- Which facts came from owner answers if that matters.
- Any unresolved missing context.
- Verification performed, such as self-review or file inspection.
- Which platforms are now covered by the generated files.
