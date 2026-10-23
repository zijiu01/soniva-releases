import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = fs.readFileSync(new URL("../src/components/site-shell/copy.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const api = {};
const language = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/lib/website-language.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: language, URL });
const origins = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL("../src/lib/website-urls.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: origins, process: { env: { NODE_ENV: "production" } } });
vm.runInNewContext(output, { exports: api, URL, require: (name) => name.includes("website-urls") ? origins : language });

test("all four presentation sites have the same five navigation items", () => {
  for (const site of ["home", "help", "download", "plugin"]) {
    assert.deepEqual(Array.from(api.shellNavigation(site, "header"), (x) => x.id),
      ["product", "pricing", "download", "help", "plugin"]);
  }
});

test("cross-site links have source and preserve product anchor", () => {
  const url = new URL(api.shellHref("plugin", "home", "/#product", "header"));
  assert.equal(url.searchParams.get("from"), "plugin-header");
  assert.equal(url.hash, "#product");
  assert.equal(api.shellHref("help", "home", "/pricing", "header"), "/pricing");
  assert.equal(new URL(api.shellHref("home", "download", "/", "footer")).hostname, "download.soniva.uk");
});

test("both languages cover every navigation and theme label", () => {
  assert.deepEqual(Object.keys(api.shellCopy["zh-CN"]), Object.keys(api.shellCopy["en-US"]));
  for (const locale of ["zh-CN", "en-US"]) {
    for (const item of api.shellNavigation("home", "header")) assert.ok(api.shellCopy[locale][item.id]);
    for (const mode of ["light", "dark", "system"]) assert.ok(api.shellCopy[locale].theme[mode]);
  }
});

test("download site's own download action returns to package card", () => {
  assert.equal(api.shellHref("download", "download", "/", "header"), "/#download");
  assert.equal(api.shellHref("download", "download", "/#timeline", "footer"), "/#timeline");
});
