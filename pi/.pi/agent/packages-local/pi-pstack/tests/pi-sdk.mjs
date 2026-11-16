import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

// Use the installed host, not a second copy or a new dependency.
let sdkRoot = process.env.PI_SDK_PATH;
if (!sdkRoot) {
  let dir = dirname(realpathSync(execFileSync("which", ["pi"], { encoding: "utf8" }).trim()));
  while (dirname(dir) !== dir) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest, "utf8")).name === "@earendil-works/pi-coding-agent") {
      sdkRoot = dir;
      break;
    }
    dir = dirname(dir);
  }
}
if (!sdkRoot) throw new Error("Cannot locate Pi SDK; set PI_SDK_PATH to its package directory.");
export const sdk = await import(pathToFileURL(join(sdkRoot, "dist/index.js")).href);
export const { expandPromptTemplate } = await import(
  pathToFileURL(join(sdkRoot, "dist/core/prompt-templates.js")).href,
);
