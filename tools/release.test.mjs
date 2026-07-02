import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { releaseSkill } from "./release.mjs";

test("releaseSkill creates an expanded skill directory and zip package", async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), "agent-runbook-distiller-release-"));

  try {
    const skillDir = path.join(rootDir, "skill");
    await mkdir(path.join(skillDir, "references"), { recursive: true });
    await writeFile(path.join(skillDir, "SKILL.md"), "---\nname: agent-runbook-distiller\n---\n");
    await writeFile(path.join(skillDir, "references", "guide.md"), "# Guide\n");

    const result = await releaseSkill({
      rootDir,
      skillDir: path.join(rootDir, "skill"),
      outputDir: path.join(rootDir, "outputs"),
    });

    assert.equal(path.basename(result.expandedDir), "agent-runbook-distiller");
    assert.equal(path.basename(result.zipPath), "agent-runbook-distiller.zip");
    assert.equal(await readFile(path.join(result.expandedDir, "SKILL.md"), "utf8"), "---\nname: agent-runbook-distiller\n---\n");
    assert.equal(await readFile(path.join(result.expandedDir, "references", "guide.md"), "utf8"), "# Guide\n");

    const zipStat = await stat(result.zipPath);
    assert.ok(zipStat.size > 0);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("recommended external plugins config includes install metadata", async () => {
  const configPath = path.join(process.cwd(), "skill", "recommended-external-plugins.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));

  assert.ok(Array.isArray(config.recommended_external_plugins));
  assert.ok(config.recommended_external_plugins.length > 0);

  for (const plugin of config.recommended_external_plugins) {
    assert.equal(typeof plugin.name, "string");
    assert.notEqual(plugin.name.trim(), "");
    assert.equal(typeof plugin.display_name, "string");
    assert.notEqual(plugin.display_name.trim(), "");
    assert.equal(typeof plugin.purpose, "string");
    assert.notEqual(plugin.purpose.trim(), "");
    assert.equal(typeof plugin.use_when, "string");
    assert.notEqual(plugin.use_when.trim(), "");
    assert.equal(typeof plugin.do_not_vendor_unless_explicitly_requested, "boolean");

    assert.equal(typeof plugin.default_recommendation.requires_network, "boolean");
    assert.equal(typeof plugin.default_recommendation.requires_user_approval, "boolean");
    assert.equal(typeof plugin.default_recommendation.safety_level, "string");
    assert.notEqual(plugin.default_recommendation.safety_level.trim(), "");

    assert.ok(Array.isArray(plugin.platforms));
    assert.ok(plugin.platforms.length > 0);

    for (const platform of plugin.platforms) {
      assert.equal(typeof platform.platform, "string");
      assert.notEqual(platform.platform.trim(), "");
      assert.equal(typeof platform.install_action, "string");
      assert.notEqual(platform.install_action.trim(), "");
      assert.ok(Array.isArray(platform.detection_evidence));
      assert.ok(platform.detection_evidence.length > 0);
      assert.ok(platform.detection_evidence.every((entry) => typeof entry === "string" && entry.trim() !== ""));
      assert.equal(typeof platform.verification, "string");
      assert.notEqual(platform.verification.trim(), "");
    }
  }
});

test("external plugin prose stays configuration driven", async () => {
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, "skill", "recommended-external-plugins.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const pluginTerms = config.recommended_external_plugins.flatMap((plugin) => [plugin.name, plugin.display_name]);
  const files = [path.join(rootDir, "README.md"), ...(await markdownFiles(path.join(rootDir, "skill")))]
    .filter((filePath) => path.normalize(filePath) !== path.normalize(configPath));

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    for (const term of pluginTerms) {
      assert.equal(
        content.toLowerCase().includes(term.toLowerCase()),
        false,
        `${path.relative(rootDir, filePath)} hardcodes external plugin term "${term}"`
      );
    }
  }
});

async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await markdownFiles(entryPath)));
    } else if (entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}
