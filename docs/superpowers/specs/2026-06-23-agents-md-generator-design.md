# AGENTS.md Generator Skill Design

## Purpose

Create an `agents-md-generator` skill that helps teams turn a non-AI-native repository into an AI-friendly working environment.

The skill scans an existing project, asks the project owner targeted questions, and generates a project-specific `AGENTS.md` in an internal engineering style.

The generated document is not a consulting report. It is an operating guide for coding agents.

## Target Users

- Engineers introducing AI-assisted development into customer or team repositories.
- Project owners who need a quick, reliable `AGENTS.md` without hand-writing every convention.
- Coding agents that need clear project instructions before making changes.

## Non-Goals

- Do not score AI readiness in the first version.
- Do not modify project structure.
- Do not require network access.
- Do not assume a specific language, framework, package manager, or agent product.
- Do not generate broad best-practice advice that is not grounded in the project.

## Output Style

The generated `AGENTS.md` should be short, direct, and command-oriented.

Use engineering language:

- Prefer concrete instructions over explanation.
- Prefer repository-specific facts over generic advice.
- Mark unknowns as missing context.
- Keep inferred details separate from confirmed facts.
- Avoid marketing, consulting, and onboarding-document tone.

## Generated AGENTS.md Structure

```md
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
## Codex Notes
```

### Project Snapshot

Briefly state what the project appears to do, based on confirmed project files or owner input.

### Tech Stack

List languages, frameworks, package managers, runtime versions, and major tools found in the repository.

### Commands

List project commands for install, development, testing, linting, building, formatting, and deployment only when they are confirmed by repository files or owner answers.

### Repository Map

Describe important directories and ownership boundaries. Call out generated, vendored, build-output, or migration directories when detected.

### Development Rules

Capture project-specific coding conventions, architecture expectations, formatting rules, dependency rules, and review expectations.

### Testing and Verification

Define what agents must run before claiming a change is complete. Include known limitations when tests are slow, flaky, partial, or not available.

### Agent Workflow

Describe the expected workflow for AI-assisted changes:

1. Read relevant files first.
2. Identify the smallest safe change.
3. Preserve existing conventions.
4. Make focused edits.
5. Run the required checks.
6. Report what changed and what was verified.

### Risk Areas

List modules, files, workflows, or data paths that require extra care. These should come from project files, owner answers, or clear repository evidence.

### Do Not

List hard constraints, such as:

- Do not rewrite unrelated modules.
- Do not change generated files by hand.
- Do not alter migration history unless instructed.
- Do not reset or discard user changes.
- Do not invent commands that are not present in the project.

### Missing Context

List unresolved questions that affect safe agent work. This section should remain in the file when the owner cannot answer everything.

### Codex Notes

Add Codex-specific guidance while keeping the main document portable:

- Use `rg` or `rg --files` before slower search commands.
- Read nearby code before editing.
- Use the repository's documented commands for verification.
- Keep changes scoped.
- Do not revert user changes.
- For large or risky changes, write a short plan before editing.

## Skill Workflow

### 1. Scan the Repository

The skill should inspect project context before asking questions.

Read relevant files when present:

- `README*`
- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
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
- linter, formatter, and test configuration files

Also inspect top-level and second-level directory structure, while skipping large generated or dependency folders such as `node_modules`, `.git`, `dist`, `build`, `target`, `.venv`, and `vendor`.

### 2. Produce a Scan Summary

Before generating `AGENTS.md`, the skill should present a compact summary:

```md
## Confirmed
- Facts directly found in repository files.

## Inferred
- Likely facts based on file names, dependencies, or structure.

## Missing
- Information that could not be determined safely.

## Questions
- Questions for the project owner.
```

### 3. Ask Project Owner Questions

Ask 3-8 targeted questions. Prefer fewer questions when the repository is clear.

Prioritize questions about:

- Actual install, run, test, lint, and build commands.
- Whether existing tests and CI are trusted.
- High-risk modules or workflows.
- Directories agents should avoid or treat carefully.
- Generated files and migration rules.
- Required coding conventions not encoded in tooling.
- Deployment or release constraints.
- What "done" means for typical changes.

### 4. Generate AGENTS.md

Generate the document from:

- Confirmed repository evidence.
- Project owner answers.
- Clearly labeled missing context.

Do not write inferred details as facts. If a command is guessed from a common framework convention, either ask for confirmation or put it under missing context.

### 5. Self-Review

Before finishing, check the generated file for:

- Inferred details written as confirmed facts.
- Commands that do not appear in project files or owner answers.
- Generic advice that could apply to any repository.
- Missing testing or verification instructions.
- Missing risk areas.
- Contradictions between scan results and owner answers.
- Placeholder text such as `TODO`, `TBD`, or vague filler.

Fix issues before presenting the result.

## Error Handling

If the repository is too large to scan quickly, sample the top-level structure and the most important configuration files first.

If no project metadata is found, generate a minimal `AGENTS.md` with a prominent `Missing Context` section and ask for the required commands and constraints.

If an existing `AGENTS.md` is present, do not overwrite it without confirmation. Offer to update, replace, or write a draft file such as `AGENTS.generated.md`.

## Success Criteria

The first version is successful when:

- It can scan a typical repository and identify the main tech stack.
- It asks focused owner questions instead of generating from guesses.
- It produces a concise, usable `AGENTS.md`.
- It separates confirmed facts, inferred details, and missing context.
- It includes a portable main body plus a small `Codex Notes` section.
- It avoids generic AI guidance that is not tied to the project.
