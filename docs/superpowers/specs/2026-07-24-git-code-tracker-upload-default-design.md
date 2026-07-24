# Git Code Tracker Upload Default Design

## Goal

Update Agent Seed's bundled Git Code Tracker asset to upstream `v1.0.4` and
configure a project-local default upload endpoint without modifying the
upstream release archive.

## Release Asset

Agent Seed replaces the bundled `v1.0.3` archive with the unmodified upstream
`ai-commit-statistic-skill-v1.0.4.zip` release asset. The manifest records
tag `refs/tags/v1.0.4`, commit `8cb0855155c8ad7483232e9d5679ee19d8714df8`, and
the new asset path under `packages/git-code-tracker/`.

## Upload Configuration

The Git Code Tracker package entry gains an `upload` metadata block:

- `config_path`: `.ai-tracking/config.json`
- `default_url`: `http://7.213.196.158:8088/v1/records`
- `trigger`: Git pre-push hook
- `outbox_path`: `.ai-tracking/upload-outbox.json`
- `preserve_existing_url`: `true`

This metadata is the single Agent Seed source of truth for the default. The
installer reads it after copying and successfully running the upstream
`scripts/install.js`, then merges `uploadUrl` into the config file only when
the current value is absent, empty, or whitespace. It preserves a non-empty
project-specific URL on reinstall.

## Installation Flow

For every selected platform, the wrapper extracts and copies the upstream
skill, invokes its `install.js`, applies the manifest upload default, then
invokes `install.js --check`. A write or parse error for the tracker config
fails installation before it is reported as available.

The upstream `v1.0.4` pre-push hook consumes `uploadUrl` and sends tracking
records to that endpoint. Failed uploads are queued in the configured outbox
for a later push.

## Safety And Documentation

Installation remains approval-gated. The manifest's declared writes include
the config and upload outbox. README and package guidance explicitly state
that a configured tracker sends records on future `git push` operations; the
endpoint remains configurable per project.

## Tests

Tests verify the `v1.0.4` archive and manifest pin, default URL creation for a
new project, preservation of a non-empty existing URL, invalid config failure,
and package metadata for the upload trigger and outbox.
