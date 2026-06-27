---
name: agent-onboard
description: Use when the user asks to onboard coding agents to a project, make a repository AI-agent ready, generate or update AGENTS.md/agents.d/CLAUDE.md, prepare Codex/Claude/OpenCode to work in an existing codebase, capture project setup/build/test/debug/tooling knowledge from a knowledgeable developer, or add newly discovered project knowledge to reusable agent onboarding assets.
---

# Agent Onboard

Onboard coding agents to a project by scanning the repository, interviewing the knowledgeable project owner, and distilling project-specific knowledge into agent-usable instructions.

Default to senior-developer knowledge distillation. The normal output is `AGENTS.md` plus `agents.d/`; add platform-specific files only for platforms the owner uses, and generate or propose a project-specific skill when repeated workflows should trigger automatically.

The output files are internal engineering guides and automation runbooks, not consulting reports.

## Core Rules

- Treat the user as the knowledgeable project owner, senior developer, architect, tech lead, or operator unless they explicitly say otherwise.
- Scan before asking detailed questions.
- Separate confirmed facts, inferred details, and missing context.
- Ask targeted interview questions before generating files; use multiple rounds when major knowledge categories remain missing.
- Do not write guessed commands or conventions as facts.
- Preserve the source of knowledge: repository evidence, owner-confirmed fact, operational preference, risk judgment, observed run result, or unknown.
- Capture automation blockers as explicit breakpoints with owner-confirmed fixes or escalation rules.
- Capture approved skills, project scripts, and internal tools with trigger conditions, required inputs, success signals, and safety levels.
- Update existing onboarding assets when reusable project knowledge appears during later agent work.
- Distill tacit knowledge into executable instructions, recipes, playbooks, and handoff criteria, not background explanation.
- Preserve existing instruction files unless the user confirms replacement.
- Do not run install, build, test, migration, deploy, or service-start commands unless the user confirms they are safe in the current environment.
- Do not store secrets, personal machine paths, private account identifiers, one-off incident chatter, or temporary knowledge in onboarding assets.

## Progressive Disclosure

Read only the reference file needed for the current phase:

- For interview categories, source labels, tooling inventory, and automation breakpoint capture, read `references/knowledge-distillation.md`.
- For `AGENTS.md`, `agents.d/`, `CLAUDE.md`, and project-specific skill structures, read `references/output-assets.md` before generating files.
- When the user adds knowledge after initial onboarding or asks to update existing instructions, read `references/update-existing-assets.md`.
- Before claiming the project is agent-ready or automation-ready, read `references/fresh-agent-dry-run.md`.

Do not duplicate reference content in generated files. Put the concise entry point in `AGENTS.md` and route detailed runbooks into focused `agents.d/` files.

## Workflow

### 0. Identify The Knowledge Holder And Goal

If the user invoked the skill with a project description or arguments, use that directly. Otherwise ask:

> Briefly describe what this project does, which areas or workflows you know best, and what a new agent or developer should be able to do after this onboarding.

Ask early which workflows should become agent-runnable, which parts usually require a familiar human, which skills/scripts/tools agents should use, which agent platforms matter, and whether to generate a reusable project skill now or only propose its shape.

### 1. Inspect Existing Agent Instructions

Check whether instruction files already exist:

```bash
rg --files -g 'AGENTS.md' -g 'CLAUDE.md' -g 'GEMINI.md' -g '.opencode/*'
```

If any instruction file exists, read it before doing anything else. Ask whether to update it, replace it, or create a draft alongside it. Do not overwrite without confirmation.

If the user is adding new knowledge to existing onboarding assets, prefer a minimal update over regeneration and read `references/update-existing-assets.md`.

### 2. Scan Repository Evidence

Use `rg --files` first. Inspect top-level and second-level structure, skipping large generated or dependency folders such as `.git`, `node_modules`, `dist`, `build`, `target`, `.venv`, and `vendor`.

Read existing files from this evidence set when present:

- Project docs: `README*`, docs indexes, architecture docs.
- Language/package metadata: `package.json`, lockfiles, `pyproject.toml`, `requirements*.txt`, `Pipfile`, `poetry.lock`, `pom.xml`, Gradle files, `go.mod`, `Cargo.toml`.
- Build and runtime config: `Makefile`, `justfile`, `Taskfile.yml`, `Dockerfile`, `docker-compose*.yml`.
- CI/CD: `.github/workflows/*`, `.gitlab-ci.yml`, `Jenkinsfile`.
- Agent/tool config: `.opencode.yaml`, `.opencode/`, `.claude/settings.json`.
- Automation folders: `scripts/**`, `tools/**`, `bin/**`, `tasks/**`.
- Linter, formatter, type-checker, and test configuration.

Use the project description and knowledge-holder role from Step 0 to decide which files need deeper reading.

### 3. Present A Scan Summary

Before generating files, present a compact summary:

```markdown
## Confirmed
- Facts directly found in repository files.

## Inferred
- Likely facts based on filenames, dependencies, or structure.

## Missing
- Information that could not be determined safely.

## Knowledge To Distill
- Tacit project knowledge that likely needs owner confirmation.

## Questions
- Questions for the project owner.
```

Keep `Inferred` conservative. If a command is not found in project files, list it as missing instead of guessing.

### 4. Set The Distillation Scope

Default to knowledge distillation, not a template fill-in.

Normal scope:

- `AGENTS.md` as the concise portable entry point.
- `agents.d/` as the default home for split runbooks, maps, recipes, playbooks, risks, and handoff rules.
- Platform-specific files such as `CLAUDE.md`, `GEMINI.md`, or `.opencode/` only when the owner uses or requests those agents.
- A project-specific skill recommendation, and the skill itself when repeated workflows should be shared across future agents or checkouts.

Use a lightweight `AGENTS.md`-only flow only when the user explicitly asks for a small instruction file or template and does not want a knowledge-distillation session.

### 5. Distill Project Knowledge

Read `references/knowledge-distillation.md`.

Interview in rounds. Ask 3-8 questions per round. Prefer fewer questions when repository evidence is strong, but continue when answers reveal missing bootstrap, architecture, change, debug, review, tooling, or risk knowledge.

Prioritize executable answers: exact commands, required inputs, expected success signals, known failure symptoms, owner-approved recovery steps, when agents may act autonomously, and when they must stop for human input.

### 6. Generate Or Update Agent Knowledge Assets

For new onboarding assets, read `references/output-assets.md`.

Always generate or update `AGENTS.md` unless the user explicitly asks for another file only. Generate `agents.d/` by default for distilled knowledge. Generate platform-specific files only for requested or owner-used platforms.

For later knowledge additions, read `references/update-existing-assets.md`, classify the new knowledge into the right file, and use the smallest coherent edit.

### 7. Validate With A Fresh-Agent Dry Run

Read `references/fresh-agent-dry-run.md`.

Before finishing, simulate how a fresh agent would use the generated or updated assets. Walk through bootstrap, approved tool selection, run/build/test, debug, at least one representative change path when applicable, and human-review handoff.

Do not claim the assets are automation-ready unless each known failure has a clear next action or an explicit escalation rule.

### 8. Self-Review Before Finishing

Check generated or updated files for:

- Inferred details written as confirmed facts.
- Commands not found in project files or owner answers.
- Generic advice that could apply to any repository.
- Setup, run, build, or test steps without expected success signals.
- Debugging advice that names symptoms but not next actions.
- Unclear automation permissions: autonomous, ask first, or never run.
- Missing source labels where repo evidence and owner judgment differ.
- Tacit knowledge left as explanation instead of executable instructions.
- Approved skills or scripts without trigger conditions, inputs, expected output, and safety level.
- Manual workflow prose that should point to an approved script or tool.
- `AGENTS.md` becoming too long when content belongs in `agents.d/`.
- Missing testing, verification, human-review handoff, change recipes, tooling inventory, or risk areas.
- New knowledge appended as chat transcript instead of distilled instructions.
- Duplicated or contradictory guidance across `AGENTS.md`, `agents.d/`, platform files, or a project skill.
- Placeholder text such as `TODO`, `TBD`, or vague filler.

Fix issues before presenting the result.

## Edge Cases

- If the repository is too large, sample top-level structure and the most important config files first.
- If no metadata files exist, generate minimal files with prominent `Missing Context` sections.
- If the owner cannot answer a question, keep it in `Missing Context`.
- If commands are discovered but may be unsafe, destructive, expensive, or slow, ask before running them.
- If automation commands cannot be run in the current environment, record them as confirmed instructions only when the owner confirms them, and note they were not executed.
- If a breakpoint requires secrets, credentials, private accounts, VPNs, hardware, paid services, or production access, document the requirement and safe escalation path without exposing the secret or attempting access.
- If the owner gives broad background context, convert it into rules, recipes, playbooks, or escalation triggers before writing files.
- If new knowledge is temporary, personal, secret-bearing, or not reusable by future agents, do not write it into onboarding assets; summarize why and ask whether a safe generalized rule exists.
- If the user only asks for a template, provide the structure without scanning or writing repository-specific facts.
- If the user only wants one specific file, generate only that file.
- If a platform file already exists and is well-maintained, offer to update it rather than replacing it.

## Final Response

Summarize:

- Files generated or updated and their paths.
- Whether existing files were updated or new files were created.
- Where owner-confirmed knowledge, newly supplied knowledge, and unresolved missing context were placed.
- Verification performed, including self-review and fresh-agent dry run results.
- Platforms covered by the generated files.
- Whether knowledge distillation, automation runbooks, breakpoints, `agents.d/`, and a project-specific skill were generated, updated, proposed, or intentionally skipped.
