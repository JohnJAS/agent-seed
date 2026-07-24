# Git Code Tracker Upload Default Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Bundle Git Code Tracker v1.0.4 and apply Agent Seed's default upload URL after upstream initialization without overwriting a project-specific URL.

**Architecture:** Keep the upstream v1.0.4 zip unchanged under packages/git-code-tracker/. Define the upload default and side effects in bundled-packages.json. The release-asset installer reads that package entry, runs the copied upstream installer, merges the URL into the generated config only when blank, then runs the upstream check command.

**Tech Stack:** Node.js ESM, node:test, Node filesystem APIs, GitHub release asset.

---

## File Structure

- Replace: skill/packages/git-code-tracker/ai-commit-statistic-skill-v1.0.4.zip - unmodified upstream v1.0.4 asset.
- Delete: skill/packages/git-code-tracker/ai-commit-statistic-skill-v1.0.3.zip - superseded release asset.
- Modify: skill/scripts/install-git-code-tracker.mjs - manifest loading and post-install config merge.
- Modify: skill/bundled-packages.json - v1.0.4 pin, upload metadata, and outbox write declaration.
- Modify: tools/git-code-tracker-release.test.mjs - v1.0.4 and upload configuration behavior.
- Modify: tools/release.test.mjs - manifest and minimal-package assertions.
- Modify: README.md and skill/references/output-assets.md - explain the pre-push upload behavior.
- Modify: docs/superpowers/specs/2026-07-24-git-code-tracker-upload-default-design.md - include in the feature branch.
- Create: docs/superpowers/plans/2026-07-24-git-code-tracker-upload-default.md - this plan.

### Task 1: Define v1.0.4 And Upload Configuration With Failing Tests

**Files:**
- Modify: tools/git-code-tracker-release.test.mjs
- Modify: tools/release.test.mjs

- [ ] **Step 1: Change the fixture asset and manifest expectations to v1.0.4**

~~~js
const archivePath = path.join(
  process.cwd(),
  "skill",
  "packages",
  "git-code-tracker",
  "ai-commit-statistic-skill-v1.0.4.zip",
);

assert.equal(tracker.version, "v1.0.4");
assert.equal(tracker.source.ref, "refs/tags/v1.0.4");
assert.equal(tracker.source.commit, "8cb0855155c8ad7483232e9d5679ee19d8714df8");
assert.equal(tracker.source.asset, "ai-commit-statistic-skill-v1.0.4.zip");
assert.equal(tracker.upload.default_url, "http://7.213.196.158:8088/v1/records");
assert.equal(tracker.upload.trigger, "git pre-push hook");
assert.equal(tracker.upload.outbox_path, ".ai-tracking/upload-outbox.json");
assert.equal(tracker.upload.preserve_existing_url, true);
~~~

- [ ] **Step 2: Add failing config merge tests**

~~~js
test("installGitCodeTracker applies the manifest upload default to a new config", async () => {
  const targetDir = await createGitRepository();
  await mkdir(path.join(targetDir, ".claude"));

  await installGitCodeTracker({ targetDir, env: {}, archivePath });

  const config = JSON.parse(await readFile(path.join(targetDir, ".ai-tracking", "config.json"), "utf8"));
  assert.equal(config.uploadUrl, "http://7.213.196.158:8088/v1/records");
});

test("installGitCodeTracker preserves a non-empty project upload URL", async () => {
  const targetDir = await createGitRepository();
  await mkdir(path.join(targetDir, ".claude"));
  await mkdir(path.join(targetDir, ".ai-tracking"));
  await writeFile(
    path.join(targetDir, ".ai-tracking", "config.json"),
    JSON.stringify({ enabled: true, uploadUrl: "https://project.example/records" }),
  );

  await installGitCodeTracker({ targetDir, env: {}, archivePath });

  const config = JSON.parse(await readFile(path.join(targetDir, ".ai-tracking", "config.json"), "utf8"));
  assert.equal(config.uploadUrl, "https://project.example/records");
});
~~~

- [ ] **Step 3: Run tests to verify red state**

Run: node --test tools/release.test.mjs tools/git-code-tracker-release.test.mjs

Expected: FAIL because the v1.0.4 asset and upload manifest block do not exist, and the installer does not apply uploadUrl.

- [ ] **Step 4: Commit the red tests**

~~~bash
git add tools/git-code-tracker-release.test.mjs tools/release.test.mjs
git commit -m "test: define tracker upload defaults"
~~~

### Task 2: Update Release Asset And Manifest

**Files:**
- Replace: skill/packages/git-code-tracker/ai-commit-statistic-skill-v1.0.4.zip
- Delete: skill/packages/git-code-tracker/ai-commit-statistic-skill-v1.0.3.zip
- Modify: skill/bundled-packages.json
- Test: tools/release.test.mjs

- [ ] **Step 1: Download the unmodified v1.0.4 release asset**

Download https://github.com/yooocen/git-code-tracker/releases/download/v1.0.4/ai-commit-statistic-skill-v1.0.4.zip into skill/packages/git-code-tracker/. Remove the v1.0.3 asset. Verify that the archive has all three platform roots and v1.0.4 upload support before continuing.

- [ ] **Step 2: Update the package metadata**

Set version, tag, commit, asset name, and asset_path to v1.0.4. Add this metadata alongside default_install:

~~~json
"upload": {
  "config_path": ".ai-tracking/config.json",
  "default_url": "http://7.213.196.158:8088/v1/records",
  "trigger": "git pre-push hook",
  "outbox_path": ".ai-tracking/upload-outbox.json",
  "preserve_existing_url": true
}
~~~

Add both config_path and outbox_path to default_install.writes.

- [ ] **Step 3: Run manifest tests to verify green state**

Run: node --test tools/release.test.mjs

Expected: PASS, including the v1.0.4 pin, upload metadata, and minimal package directory assertions.

- [ ] **Step 4: Commit the asset and manifest update**

~~~bash
git add skill/packages/git-code-tracker/ai-commit-statistic-skill-v1.0.4.zip skill/packages/git-code-tracker/ai-commit-statistic-skill-v1.0.3.zip skill/bundled-packages.json tools/release.test.mjs
git commit -m "feat: update tracker release asset"
~~~

### Task 3: Apply Manifest Upload Defaults After Initialization

**Files:**
- Modify: skill/scripts/install-git-code-tracker.mjs
- Modify: tools/git-code-tracker-release.test.mjs

- [ ] **Step 1: Load the tracker upload block from bundled-packages.json**

Read the manifest at skill/bundled-packages.json, find the git-code-tracker entry, and validate that upload.default_url is a non-empty string. Return config_path, default_url, and preserve_existing_url. Throw a descriptive error for an unreadable manifest or invalid upload block.

- [ ] **Step 2: Merge uploadUrl after copied install.js succeeds**

After executing the selected copied install script and before its --check call, read targetDir/.ai-tracking/config.json. Parse the JSON object. If uploadUrl is a non-empty string after trim, retain it. Otherwise set uploadUrl to the manifest default and rewrite the JSON with a trailing newline. Do not add a network call in Agent Seed; upstream v1.0.4 performs the pre-push upload.

- [ ] **Step 3: Run targeted behavior tests**

Run: node --test tools/git-code-tracker-release.test.mjs

Expected: PASS for new config default creation and project-specific URL preservation, in addition to platform detection, scoped installation, and missing asset behavior.

- [ ] **Step 4: Commit the installer behavior**

~~~bash
git add skill/scripts/install-git-code-tracker.mjs tools/git-code-tracker-release.test.mjs
git commit -m "feat: configure tracker upload default"
~~~

### Task 4: Document Upload Side Effects And Verify The Package

**Files:**
- Modify: README.md
- Modify: skill/references/output-assets.md
- Modify: docs/superpowers/specs/2026-07-24-git-code-tracker-upload-default-design.md
- Create: docs/superpowers/plans/2026-07-24-git-code-tracker-upload-default.md

- [ ] **Step 1: Document the default, trigger, and override policy**

Describe the default URL, that the upstream pre-push hook sends records on later git push operations, that failures are queued in .ai-tracking/upload-outbox.json, and that an existing project uploadUrl is preserved.

- [ ] **Step 2: Run the full suite and a release build**

Run: make check

Expected: PASS.

Run: make release VERSION=v1.0.5-test

Expected: exit code 0; outputs/agent-seed/packages/git-code-tracker/ai-commit-statistic-skill-v1.0.4.zip and outputs/agent-seed/scripts/install-git-code-tracker.mjs exist.

- [ ] **Step 3: Commit documentation and verification coverage**

~~~bash
git add README.md skill/references/output-assets.md docs/superpowers/specs/2026-07-24-git-code-tracker-upload-default-design.md docs/superpowers/plans/2026-07-24-git-code-tracker-upload-default.md
git commit -m "docs: describe tracker upload default"
~~~
