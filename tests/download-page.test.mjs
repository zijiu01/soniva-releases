import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import matter from "gray-matter";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const compile = (path, extra = {}) => {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports, ...extra });
  return exports;
};
const { detectDevice } = compile("src/components/download/architecture.ts");
const mac = { platform: "MacIntel", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)", maxTouchPoints: 0 };

test("all download and installation text is available in both languages", () => {
  const { downloadCopy } = compile("src/components/download/copy.ts");
  assert.deepEqual(Object.keys(downloadCopy["zh-CN"]), Object.keys(downloadCopy["en-US"]));
  for (const language of Object.values(downloadCopy)) for (const text of Object.values(language)) assert.ok(text.trim());
});

test("ambiguous MacIntel defaults honestly to Apple, never pretends to detect Intel", async () => {
  const result = await detectDevice(mac);
  assert.equal(result.mac, true);
  assert.equal(result.architecture, "arm64");
  assert.equal(result.detected, false);
});

test("client hints detect both architectures and tolerate denied access", async () => {
  for (const [value, expected] of [["arm", "arm64"], ["x86", "x64"]]) {
    const result = await detectDevice({ ...mac, userAgentData: { getHighEntropyValues: async () => ({ architecture: value }) } });
    assert.equal(result.architecture, expected); assert.equal(result.detected, true);
  }
  const denied = await detectDevice({ ...mac, userAgentData: { getHighEntropyValues: async () => { throw Error("denied"); } } });
  assert.equal(denied.architecture, "arm64"); assert.equal(denied.detected, false);
});

test("Windows, Android, iPhone and desktop-UA iPad are not offered a Mac download", async () => {
  for (const nav of [
    { platform: "Win32", userAgent: "Windows" }, { platform: "Linux armv8l", userAgent: "Android" },
    { platform: "iPhone", userAgent: "iPhone" }, { ...mac, maxTouchPoints: 5 },
  ]) assert.equal((await detectDevice(nav)).mac, false);
});

test("new download assembly uses published release data and preserves original install docs", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /getReleases\(\)\.find/); assert.match(page, /release\.channel === "released"/);
  assert.ok(page.indexOf("<DownloadHero") < page.indexOf("<InstallSteps"));
  assert.ok(page.indexOf("<InstallSteps") < page.indexOf("<TimelineView"));
  const card = read("src/components/download/mac-download-card.tsx");
  assert.match(card, /<DownloadLink/); assert.match(card, /manuallySelected\.current/);
  assert.match(card, /device === "other"/); assert.match(card, /aria-pressed/);
  assert.match(card, /\/docs\/install-macos\//);
  assert.ok(fs.existsSync(new URL("../public/docs/install-macos.md", import.meta.url)));
  assert.ok(fs.existsSync(new URL("../public/docs/first-launch.md", import.meta.url)));
  const { data } = matter(read("public/releases/0.1.22.md"));
  assert.equal(data.downloads[0].filename, "Soniva-0.1.22-arm64.dmg");
  assert.equal(data.downloads[1].filename, "Soniva-0.1.22.dmg");
  assert.doesNotMatch(card, /Soniva-0\.1|151 MB|144 MB|sha256|SHA256/);
});

test("download geometry shares 1600px rails without duplicate markers or footer separator", () => {
  const frame = read("src/app/site-frame.css");
  assert.match(frame, /--site-max-width: 1600px/);
  assert.match(frame, /repeating-linear-gradient\(315deg/);
  assert.doesNotMatch(read("src/app/layout.tsx"), /GridJunctionOverlay/);
  assert.match(read("src/components/download/mac-download-card.tsx"), /RiAppleFill, RiWindowsFill/);
  const globals = read("src/app/globals.css");
  assert.match(globals, /@import "\.\/site-theme.css"/);
  assert.doesNotMatch(globals, /\.marketing-grid-frame::before|--foreground:/);
  const timeline = read("src/components/devlog/timeline-view.tsx");
  assert.doesNotMatch(timeline, /max-w-\[440px\]|border-b/);
  assert.doesNotMatch(read("src/components/devlog/package-list.tsx"), /id="download"/);
});

test("local cross-site links stay local and production links retain real domains", () => {
  const dev = compile("src/lib/website-urls.ts", { process: { env: { NODE_ENV: "development" } } });
  const prod = compile("src/lib/website-urls.ts", { process: { env: { NODE_ENV: "production" } } });
  assert.equal(dev.downloadUrl, "http://localhost:3002"); assert.equal(dev.marketingUrl, "http://localhost:3001");
  assert.equal(prod.downloadUrl, "https://download.soniva.uk");
});
