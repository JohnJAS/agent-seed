---
name: agent-onboard
description: Use when the user asks to make a repository AI-agent ready, create AGENTS.md/agents.d/CLAUDE.md, onboard Codex/Claude/OpenCode, interview a knowledgeable developer, distill tacit project knowledge, capture setup/build/test/debug breakpoints, prepare new agents or new developers to run a project, or generate project-specific agent instructions, automation runbooks, or reusable project skills.
---

# Agent Onboard

Distill knowledge from a repository and a knowledgeable project owner into agent-usable onboarding assets.

The output files are internal engineering guides, not consulting reports.

## Core Rules

- Identify the knowledgeable project owner or senior developer before scanning.
- Scan before asking detailed questions.
- Separate confirmed facts, inferred details, and missing context.
- Ask targeted interview questions before generating files.
- Do not write guessed commands or conventions as facts.
- Preserve the source of knowledge: repository evidence, owner-confirmed fact, operational preference, risk judgment, or unknown.
- Capture automation blockers as explicit breakpoints with owner-confirmed fixes.
- Distill tacit knowledge into executable instructions, not background explanation.
- Keep generated files short, direct, and repository-specific.
- Preserve any existing instruction files unless the user confirms replacement.
- Do not run install, build, test, migration, deploy, or service-start commands unless the user confirms they are safe to run in the current environment.

## Workflow

### 0. Identify Knowledge Holder And Goal

If the user invoked the skill with a project description or arguments, use that directly. Otherwise, ask:

> Briefly describe what this project does, your role or familiarity with it, and what a new agent or developer should be able to do after onboarding.

Use the answer to guide the scan and decide whether this is simple instruction-file onboarding or senior-developer knowledge distillation.

If the user is a knowledgeable maintainer, senior developer, tech lead, or operator, treat the session as knowledge distillation. Ask early:

- Which workflows should a new agent perform without rediscovering project knowledge?
- Which parts of the project usually require a familiar human to explain?
- Is the desired output only `AGENTS.md`, or also `agents.d/` and a reusable project skill?

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

Use the project description and knowledge-holder role from Step 0 to prioritize which files and directories to inspect more deeply.

### 3. Present Scan Summary

Before generating files, present a compact summary:

```markdown
## Confirmed
- Facts directly found in repository files.

## Inferred
- Likely facts based on file names, dependencies, or structure.

## Missing
- Information that could not be determined safely.

## Knowledge To Distill
- Tacit project knowledge that likely needs owner confirmation.

## Questions
- Questions for the project owner.
```

Keep `Inferred` conservative. If a command is not found in project files, list it as missing instead of guessing.

### 4. Decide Onboarding Depth

Choose the depth from the user's request and repository evidence:

- **Instruction-file onboarding**: Generate concise `AGENTS.md` and optional platform files so agents can work safely in an already understood project.
- **Automation-ready onboarding**: Also capture the path for a fresh agent or new developer to install dependencies, configure environment, run the project, build, test, debug failures, and hand off for human review.
- **Knowledge-distillation onboarding**: Interview a knowledgeable developer to capture tacit setup, architecture, change, debug, review, and risk knowledge that is not fully present in repository files.
- **Reusable project skill**: In addition to instruction files, generate or update a project-specific skill when the user asks for a reusable installable skill, the project has repeated workflows, or the distilled knowledge should guide future agents beyond one repository checkout.

If the request mentions new developers, fully automated development, running the project from scratch, setup failures, local environment, build/test/debug loops, senior developer knowledge, knowledge distillation, `agents.d`, reusable skills, or "breakpoints", use knowledge-distillation onboarding.

### 5. Distill Senior Developer Knowledge

For knowledge-distillation onboarding, interview in rounds. Ask 3-8 questions per round, but do not stop after one round if major knowledge categories are still missing.

Use this knowledge map:

- **Golden path**: The shortest reliable path from fresh checkout to a useful development loop.
- **Bootstrap blockers**: Local tools, versions, credentials, services, data, network access, generated files, and machine-specific assumptions.
- **Architecture map**: Module boundaries, key entry points, data flow, ownership boundaries, and where not to make cross-cutting changes.
- **Change recipes**: Where to edit for common tasks, which files must change together, and which checks prove the change worked.
- **Debug playbooks**: Common symptoms, logs to inspect, diagnostic commands, likely causes, and recovery steps.
- **Risk invariants**: Rules that protect data, compatibility, migrations, releases, security, costs, or user-visible behavior.
- **Review heuristics**: What a senior reviewer would inspect before trusting an agent's change.
- **Escalation rules**: Situations where an agent must stop and ask a human instead of continuing.

For each item, label the source:

- `Repo-confirmed`: Found directly in project files.
- `Owner-confirmed`: Stated by the knowledgeable developer as an operational fact.
- `Preference`: Team or maintainer preference.
- `Risk judgment`: Human judgment about danger, blast radius, or review priority.
- `Unknown`: Still unresolved.

Convert knowledge into agent-usable instructions:

- Prefer commands, file paths, decision rules, expected signals, and "if symptom, do action" playbooks.
- Do not keep long explanations unless they prevent a likely wrong edit.
- Do not include secrets, personal machine paths, private account names, or one-off incident logs.

### 6. Capture Automation Breakpoints

For automation-ready or knowledge-distillation onboarding, build a checkpoint table before generating files:

```markdown
## Automation Checkpoints
- Environment prerequisites:
- Dependency installation:
- Configuration and secrets:
- Local services and databases:
- First run / dev server:
- Build:
- Test:
- Lint / format:
- Common failures:
- Debug workflow:
- Human review handoff:
```

For each checkpoint, record:

- Confirmed command or action.
- Expected success signal, such as a port, log line, generated artifact, passing test output, or health check.
- Required files, environment variables, local services, accounts, credentials, or data.
- Known failure symptoms and the exact recovery step.
- Whether an agent may run the command autonomously, must ask first, or must never run it.

When evidence is missing, ask the owner for executable answers. Prefer questions like:

- "What exact command installs dependencies, and what output means it succeeded?"
- "What environment variables or local files are required before first run?"
- "If this build/test command fails with the common error, what should the agent try next?"
- "Which services must be started manually, and how can the agent tell they are ready?"
- "What checks must pass before the agent hands work to a human reviewer?"

Do not collapse breakpoints into vague advice. Each captured breakpoint should help a future agent continue without rediscovering the same failure.

### 7. Ask Owner Questions

Ask 3-8 questions per round. Prefer fewer questions when repository evidence is strong. Continue with another focused round when the answers reveal missing bootstrap, architecture, change, debug, review, or risk knowledge.

Prioritize:

- Actual install, run, test, lint, format, build, and deploy commands.
- Environment setup, runtime versions, package manager versions, local service startup, seed data, secrets, and offline/online requirements.
- Expected success signals for install, run, build, and test steps.
- Known failure modes and the owner-approved debug or recovery steps.
- Whether tests and CI are trusted.
- High-risk modules, data flows, or workflows.
- Directories agents should avoid or treat carefully.
- Generated files and migration rules.
- Coding conventions not encoded in tooling.
- What "done" means for typical changes.
- What "ready for human review" means after automated development.
- Common change recipes a new agent should be able to execute.
- Senior-review heuristics and risk invariants that are not encoded in tests.
- Which agent platforms the user works with (Codex, Claude Code, OpenCode, other).

Do not ask all questions at once if the answer will be hard to provide. Group related command questions together when that reduces back-and-forth.

### 8. Generate Agent Knowledge Assets

Always generate `AGENTS.md`. Generate additional platform files based on which platforms the user works with (asked in Step 7). If the user did not specify, generate both `AGENTS.md` and `CLAUDE.md` by default.

For knowledge-distillation onboarding, also generate `agents.d/` when the distilled knowledge would make `AGENTS.md` too long or when the user wants reusable onboarding assets.

#### AGENTS.md (portable, platform-agnostic)

Generate this structure:

```markdown
# AGENTS.md

## Project Snapshot
## Tech Stack
## Commands
## Environment Setup
## Automation Runbook
## agents.d Index
## Repository Map
## Development Rules
## Testing and Verification
## Debugging Playbook
## Change Recipes
## Agent Workflow
## Human Review Handoff
## Risk Areas
## Do Not
## Missing Context
```

Write in short imperative prose.

Section guidance:

- `Project Snapshot`: State what the project does using confirmed files, owner input, and the project description from Step 0.
- `Tech Stack`: List languages, frameworks, runtimes, package managers, and major tools.
- `Commands`: Include only commands found in project files or confirmed by the owner.
- `Environment Setup`: List prerequisites, runtime versions, package manager setup, local services, required files, and environment variables. Do not include secret values.
- `Automation Runbook`: Provide the shortest confirmed path from fresh checkout to running, building, and testing. Include expected success signals.
- `agents.d Index`: Link to split-out knowledge files when generated. Omit this section when no `agents.d/` files are generated.
- `Repository Map`: Describe important directories and boundaries.
- `Development Rules`: Capture project-specific style, architecture, dependency, and review rules.
- `Testing and Verification`: State exactly what agents must run before claiming completion.
- `Debugging Playbook`: Capture common failure symptoms, diagnostic commands, logs to inspect, and owner-confirmed recovery steps.
- `Change Recipes`: List common change workflows and the files/checks they involve, or point to `agents.d/change-recipes.md`.
- `Agent Workflow`: Tell agents to read context, make focused edits, preserve conventions, verify, and report changes.
- `Human Review Handoff`: State what evidence the agent must provide before human review, including commands run, outputs observed, known skipped checks, and remaining risks.
- `Risk Areas`: List modules, files, workflows, or data paths needing extra care.
- `Do Not`: List hard constraints and forbidden actions.
- `Missing Context`: Keep unresolved questions that affect safe agent work.

This file must be portable. Do not include platform-specific agent notes in visible sections. Both OpenAI Codex and OpenCode CLI read this file as project rules.

If the user works with Codex, add Codex-specific tips as an HTML comment at the end of `AGENTS.md`:

```markdown
<!-- Codex: prefer rg over find; read nearby code before editing; keep changes scoped -->
```

#### agents.d/ (split knowledge assets)

Generate `agents.d/` when knowledge-distillation output is too detailed for a concise `AGENTS.md`. Keep each file focused and directly actionable.

Recommended structure:

```text
agents.d/
  bootstrap.md
  development-loop.md
  architecture-map.md
  debug-playbook.md
  change-recipes.md
  review-handoff.md
  risk-areas.md
```

File guidance:

- `bootstrap.md`: Fresh checkout, prerequisites, environment files, local services, seed data, and success signals.
- `development-loop.md`: Daily run/build/test/lint commands, fast checks, slow checks, and when each is required.
- `architecture-map.md`: Entry points, module boundaries, data flow, generated code, and files that change together.
- `debug-playbook.md`: Symptom -> diagnosis -> recovery tables with logs and commands.
- `change-recipes.md`: Common tasks, likely files, required tests, and review notes.
- `review-handoff.md`: What the agent must report before human review and what evidence to include.
- `risk-areas.md`: Dangerous workflows, invariants, migration rules, security/cost/data risks, and escalation triggers.

In `AGENTS.md`, point agents to the relevant `agents.d/` file instead of duplicating the full content.

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

#### Project-specific skill (optional)

Generate a project-specific skill when the user requests it, when repeated workflows should trigger automatically, or when knowledge-distillation output should be reused across future agents and checkouts.

The project skill should:

- Live in the location the user wants for installation or sharing. If unspecified, propose a repository-local `skills/<project>-onboard/` folder.
- Include a concise `SKILL.md` with trigger metadata for working in this exact project.
- Point agents to `AGENTS.md` and `agents.d/` for stable project rules instead of duplicating all content.
- Include only durable setup, run, build, test, debug, change, review, and handoff procedures.
- Avoid secrets, personal machine paths, one-off troubleshooting logs, or broad AI behavior advice.
- Include `agents/openai.yaml` when creating a Codex-discoverable skill.

Use this structure:

```markdown
---
name: <project>-onboard
description: Use when working in <project>, especially for setup, running, building, testing, debugging, or preparing changes for review.
---

# <Project> Onboard

## Read First
## Bootstrap
## Development Loop
## Change Recipes
## Debugging
## Verification
## Handoff
## Escalate To Human
```

### 9. Validate With A Fresh-Agent Dry Run

Before finishing knowledge-distillation onboarding, simulate how a fresh agent would use the generated assets:

1. Start from a fresh checkout mental model: the agent only knows the repository, `AGENTS.md`, optional `agents.d/`, and optional project skill.
2. Walk through bootstrap, run, build, test, debug, a representative change recipe, and human-review handoff.
3. Mark any step that still relies on "ask someone who knows" as a remaining breakpoint.
4. Ask the owner targeted follow-up questions for remaining breakpoints when practical.
5. Update the generated assets with resolved answers.

Do not claim the onboarding is automation-ready unless the dry run has a clear next action for each known failure or an explicit escalation rule.

### 10. Self-Review Before Finishing

Check each generated file for:

- Inferred details written as confirmed facts.
- Commands not found in project files or owner answers.
- Generic advice that could apply to any repository.
- Setup, run, build, or test steps without expected success signals.
- Debugging advice that names symptoms but not next actions.
- Automation permissions that are unclear: autonomous, ask first, or never run.
- Knowledge entries without a source label when the distinction matters.
- Tacit knowledge left as explanation instead of executable instructions.
- `AGENTS.md` becoming too long when the content should be split into `agents.d/`.
- Missing testing or verification instructions.
- Missing human-review handoff criteria for automation-ready onboarding.
- Missing change recipes for common work if the user asked for new agents or new developers to become productive.
- Missing fresh-agent dry run results for knowledge-distillation onboarding.
- Missing risk areas.
- Contradictions between repository evidence and owner answers.
- Placeholder text such as `TODO`, `TBD`, or vague filler.
- CLAUDE.md exceeding 120 lines (trim or move content to @imports).
- Platform-specific content leaking into AGENTS.md.
- Duplicated content between AGENTS.md and CLAUDE.md.
- Project-specific skill duplicating too much of `AGENTS.md` or `agents.d/` instead of referencing them.

Fix issues before presenting the result.

## Edge Cases

- If the repository is too large, sample top-level structure and the most important config files first.
- If no metadata files exist, generate minimal files with prominent `Missing Context` sections.
- If the owner cannot answer a question, keep it in `Missing Context`.
- If commands are discovered but may be unsafe or expensive, ask before running them.
- If automation commands cannot be run in the current environment, record them as confirmed instructions only when the owner confirms them, and note that they were not executed.
- If a breakpoint requires secrets, credentials, private accounts, VPNs, hardware, paid services, or production access, document the requirement and safe escalation path without exposing the secret or attempting access.
- If the owner gives broad background context, convert it into rules, recipes, playbooks, or escalation triggers before writing files.
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
- Whether automation-ready onboarding was captured.
- Whether senior-developer knowledge distillation was performed.
- Which `agents.d/` files were generated, if any.
- Whether fresh-agent dry run validation found unresolved breakpoints.
- Whether a project-specific skill was generated, updated, or intentionally skipped.
