import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const vinextBin = join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vinext.cmd" : "vinext"
);

const build = spawnSync(vinextBin, ["build"], {
  cwd: root,
  env: process.env,
  stdio: "inherit"
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const serverEntry = join(root, "dist", "server", "index.js");
if (!existsSync(serverEntry)) {
  console.error("Vinext sunucu giriş dosyası oluşturulamadı.");
  process.exit(1);
}

const hostingSource = join(root, ".openai", "hosting.json");
const hostingTargetDirectory = join(root, "dist", ".openai");
mkdirSync(hostingTargetDirectory, { recursive: true });
copyFileSync(hostingSource, join(hostingTargetDirectory, "hosting.json"));

console.log("Sites yayın paketi hazır: dist/server/index.js");
