# Agent Onboard

This repository contains the source and release tooling for the `agent-onboard`
Codex skill.

`agent-onboard` helps coding agents onboard to a project by scanning repository
evidence, interviewing the project owner, and distilling reusable project
knowledge into agent-facing instructions such as `AGENTS.md`, `agents.d/`, and
platform-specific skill assets.

## Repository Layout

```text
.
|-- skill/                 # Source content that is packaged as the skill
|   |-- SKILL.md           # Skill entry point
|   |-- references/        # Detailed workflow references used by the skill
|   |-- agents/            # Platform agent metadata
|   |-- bundled-skills/    # Direct skills distributed by agent-onboard
|   |-- packages/          # Bundled multi-platform skill packages
|   |-- bundled-skills.json
|   `-- bundled-packages.json
|-- tools/                 # Maintainer tooling, not included in the skill package
|   |-- release.mjs
|   `-- release.test.mjs
|-- outputs/               # Generated release artifacts, ignored by Git
|-- Makefile               # Thin command entry point
`-- README.md
```

The release package is built from `skill/` only. Root-level files such as this
README, `Makefile`, and `tools/` are maintainer assets and are not copied into
the published skill artifact.

## Requirements

- Node.js with the built-in `node:test` runner.
- GNU Make, for the `make` convenience targets.
- Windows PowerShell available as `powershell`, used by the release script to
  create the zip archive with .NET compression APIs.

## Common Commands

Run the release test:

```sh
make check
```

Build the expanded release directory and zip package:

```sh
make release
```

Equivalent direct commands:

```sh
node --test tools/release.test.mjs
node tools/release.mjs
```

## Release Artifacts

`make release` writes:

```text
outputs/agent-onboard/
outputs/agent-onboard.zip
```

The expanded directory is useful for inspection. The zip file is the distributable
artifact. The zip root contains `SKILL.md` directly, not an extra nested wrapper
directory.

## Development Notes

- Edit source files under `skill/`.
- Do not edit generated files under `outputs/`.
- Keep bundled direct skills registered in `skill/bundled-skills.json`.
- Keep bundled packages registered in `skill/bundled-packages.json`.
- Run `make release` before publishing changes so the test and package build
  both exercise the current tree.
