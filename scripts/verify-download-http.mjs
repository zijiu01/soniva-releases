// Read-only checks. Never click downloads, send tracking, or start/stop a service.
import assert from "node:assert/strict";
const base = "http://127.0.0.1:3002";
const response = await fetch(base, { signal: AbortSignal.timeout(45000) });
assert.equal(response.status, 200);
const raw = await response.text();
const html = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
assert.equal((html.match(/id="download"/g) ?? []).length, 1);
for (const text of ["下载 Soniva", "data-download-hero", "data-download-card", "data-install-steps", "data-download-timeline", "一直在更新", "http://localhost:3001", "site-rail"]) {
  assert.ok(html.includes(text), text);
}
assert.ok(html.indexOf("data-download-card") < html.indexOf("data-install-steps"));
assert.ok(html.indexOf("data-install-steps") < html.indexOf("data-download-timeline"));
assert.match(html, /https:\/\/github\.com\/[^"<>]+\/releases\/download\/v[\d.]+\/Soniva-[\d.]+-arm64\.dmg/);
assert.match(html, /<link rel="canonical" href="https:\/\/download\.soniva\.uk\//);
console.log("PASS download-first homepage, real release asset, one anchor, local cross-links, production canonical");
for (const path of ["/docs/install-macos/", "/docs/first-launch/"]) {
  const page = await fetch(base + path, { signal: AbortSignal.timeout(45000) });
  assert.equal(page.status, 200, path);
}
const release = html.match(/href="(\/releases\/[\d.]+\/?)"/);
assert.ok(release);
assert.equal((await fetch(base + release[1])).status, 200);
console.log("PASS installation, first-launch and latest release routes");
const styles = [];
for (const [, href] of raw.matchAll(/href="([^\"]+\.css[^\"]*)"/g)) {
  styles.push(await (await fetch(new URL(href, base))).text());
}
const css = styles.join("\n");
assert.match(css, /--site-max-width:\s*1600px/);
assert.match(css, /--foreground:\s*#1d1d1f/i);
assert.match(css, /--foreground:\s*#f5f5f4/i);
assert.match(css, /--grid-marker-offset:/);
console.log("PASS served 1600px rail, light/dark tokens and centred marker CSS");
console.log("Browser, device selection, theme interactions and actual installation still require UI verification.");
