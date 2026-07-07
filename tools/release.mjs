import { spawn } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_PACKAGE_NAME = "agent-seed";

export async function releaseSkill({
  rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  skillDir = path.join(rootDir, "skill"),
  outputDir = path.join(rootDir, "outputs"),
  packageName = DEFAULT_PACKAGE_NAME,
} = {}) {
  await assertDirectory(skillDir, "skill source");

  const expandedDir = path.join(outputDir, packageName);
  const zipPath = path.join(outputDir, `${packageName}.zip`);

  await mkdir(outputDir, { recursive: true });
  await rm(expandedDir, { recursive: true, force: true });
  await rm(zipPath, { force: true });
  await cp(skillDir, expandedDir, { recursive: true });
  await createZip(expandedDir, zipPath);
  const bundledSkillArtifacts = await releaseBundledDirectSkills({ skillDir, outputDir });

  return { expandedDir, zipPath, bundledSkillArtifacts };
}

async function releaseBundledDirectSkills({ skillDir, outputDir }) {
  const manifest = await readJsonIfExists(path.join(skillDir, "bundled-skills.json"));
  const bundledOutputDir = path.join(outputDir, "bundled-skills");

  await rm(bundledOutputDir, { recursive: true, force: true });

  if (!manifest) {
    return [];
  }

  const bundledSkills = Array.isArray(manifest.bundled_skills) ? manifest.bundled_skills : [];
  if (bundledSkills.length === 0) {
    return [];
  }

  await mkdir(bundledOutputDir, { recursive: true });

  const artifacts = [];

  for (const bundledSkill of bundledSkills) {
    const name = assertSafeArtifactName(bundledSkill.name, "bundled skill name");
    const sourceDir = resolveInside(skillDir, bundledSkill.source_path, `${name} source path`);
    const universalDir = path.join(bundledOutputDir, name);
    const universalZipPath = path.join(bundledOutputDir, `${name}.zip`);

    await assertDirectory(sourceDir, `${name} bundled skill source`);
    await cp(sourceDir, universalDir, { recursive: true });
    await createZip(universalDir, universalZipPath);
    artifacts.push({ name, platform: "universal", expandedDir: universalDir, zipPath: universalZipPath });

    const codexPlatform = bundledSkill.platforms?.find((platform) => platform.platform === "codex");
    if (!codexPlatform) {
      continue;
    }

    const codexDir = path.join(bundledOutputDir, `${name}-codex`);
    const codexZipPath = path.join(bundledOutputDir, `${name}-codex.zip`);

    await cp(sourceDir, codexDir, { recursive: true });

    if (codexPlatform.overlay_path) {
      const codexOverlayDir = resolveInside(skillDir, codexPlatform.overlay_path, `${name} Codex overlay path`);
      await assertDirectory(codexOverlayDir, `${name} Codex overlay`);
      await copyDirectoryContents(codexOverlayDir, codexDir);
    }

    await createZip(codexDir, codexZipPath);
    artifacts.push({ name, platform: "codex", expandedDir: codexDir, zipPath: codexZipPath });
  }

  return artifacts;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function assertSafeArtifactName(name, label) {
  if (typeof name !== "string" || name.trim() === "" || name.includes("/") || name.includes("\\")) {
    throw new Error(`Invalid ${label}: ${name}`);
  }

  return name;
}

function resolveInside(rootDir, relativePath, label) {
  if (typeof relativePath !== "string" || relativePath.trim() === "") {
    throw new Error(`Invalid ${label}: ${relativePath}`);
  }

  const resolvedPath = path.resolve(rootDir, relativePath);
  const relativeToRoot = path.relative(rootDir, resolvedPath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error(`${label} must stay inside skill source: ${relativePath}`);
  }

  return resolvedPath;
}

async function copyDirectoryContents(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });

  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    await cp(path.join(sourceDir, entry.name), path.join(targetDir, entry.name), { recursive: true, force: true });
  }
}

async function assertDirectory(directory, label) {
  try {
    const entry = await stat(directory);
    if (!entry.isDirectory()) {
      throw new Error(`${label} is not a directory: ${directory}`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Missing ${label}: ${directory}`);
    }

    throw error;
  }
}

async function createZip(sourceDir, zipPath) {
  const command = [
    "-NoProfile",
    "-Command",
    [
      "& { param($sourceDir, $zipPath)",
      "Add-Type -AssemblyName System.IO.Compression.FileSystem;",
      "[System.IO.Compression.ZipFile]::CreateFromDirectory($sourceDir, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)",
      "}",
    ].join(" "),
    sourceDir,
    zipPath,
  ];

  await run("powershell", command);
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", windowsHide: true });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  releaseSkill()
    .then(({ expandedDir, zipPath, bundledSkillArtifacts }) => {
      console.log(`Expanded release: ${expandedDir}`);
      console.log(`Zip package: ${zipPath}`);
      for (const artifact of bundledSkillArtifacts) {
        console.log(`Bundled skill ${artifact.platform}: ${artifact.expandedDir}`);
        console.log(`Bundled skill zip ${artifact.platform}: ${artifact.zipPath}`);
      }
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
