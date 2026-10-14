#!/usr/bin/env node
// PPTX Native installer for Google Antigravity, any OS with Node.js.
//
//   npx github:siddharthrath1999/pptx-native            install for your user (all projects)
//   npx github:siddharthrath1999/pptx-native --project  install into ./.agents/skills of this folder
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SKILL = "pptx-native";
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log("Usage: npx github:siddharthrath1999/pptx-native [--project] [--skip-python]");
  process.exit(0);
}
const source = path.join(__dirname, "..", SKILL);
if (!fs.existsSync(path.join(source, "SKILL.md"))) {
  console.error("Skill files are missing from this package. Please try again.");
  process.exit(1);
}

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

console.log(bold("PPTX Native · installing the skill"));
const targets = args.includes("--project")
  ? [path.join(process.cwd(), ".agents", "skills")]
  : [path.join(os.homedir(), ".gemini", "antigravity", "skills"), path.join(os.homedir(), ".gemini", "config", "skills")];
for (const dir of targets) {
  const dest = path.join(dir, SKILL);
  fs.mkdirSync(dir, { recursive: true });
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(source, dest, { recursive: true });
  console.log(`  ${green("✓")} Skill copied to ${dest}`);
}

console.log(bold("Checking what the skill needs"));
const tryCmd = (cmd, cmdArgs) => spawnSync(cmd, cmdArgs, { stdio: "ignore", shell: false });
const python = ["python3", "python", "py"].find((p) => tryCmd(p, ["--version"]).status === 0);
if (!python) {
  console.log(`  ${yellow("!")} Python 3 not found. Install it from python.org, then run this again.`);
} else if (args.includes("--skip-python")) {
  console.log(`  ${yellow("!")} Skipped Python packages (--skip-python).`);
} else if (tryCmd(python, ["-c", "import pptx, PIL"]).status === 0) {
  console.log(`  ${green("✓")} Python packages already installed`);
} else {
  const base = ["-m", "pip", "install", "--user", "--quiet", "python-pptx", "pillow"];
  const done = tryCmd(python, base).status === 0 || tryCmd(python, [...base, "--break-system-packages"]).status === 0;
  console.log(done
    ? `  ${green("✓")} Installed python-pptx and Pillow`
    : `  ${yellow("!")} Could not install the Python packages. Run: ${python} -m pip install --user python-pptx pillow`);
}

const hasOffice = ["soffice", "libreoffice"].some((c) => tryCmd(c, ["--version"]).status === 0)
  || fs.existsSync("/Applications/LibreOffice.app/Contents/MacOS/soffice")
  || fs.existsSync("C:\\Program Files\\LibreOffice\\program\\soffice.exe");
console.log(hasOffice
  ? `  ${green("✓")} LibreOffice found (used to preview slides)`
  : `  ${yellow("!")} Optional: install LibreOffice so the agent can look at the slides it builds.`);

console.log(bold("Done"));
console.log('  Restart Antigravity (or start a new agent session), then ask: "Make me a 30-slide deck on ..."');
