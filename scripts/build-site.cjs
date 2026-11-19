const { cpSync, mkdirSync, rmSync } = require("node:fs");
const { basename, dirname, join, resolve } = require("node:path");

const root = resolve(__dirname, "..");
const output = resolve(root, "dist");
if (dirname(output) !== root || basename(output) !== "dist") {
  throw new Error("Build output must be the checkout's dist directory.");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output);
for (const asset of ["index.html", "script.js", "netlify-form.js", "manifest.webmanifest", "css", "img"]) {
  cpSync(join(root, asset), join(output, asset), { recursive: true });
}
console.log("Static site prepared in dist/");
