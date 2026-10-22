import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function setup(hostname = "www.soniva.uk") {
  const jar = new Map();
  const writes = [];
  const document = {
    get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join("; "); },
    set cookie(value) {
      writes.push(value);
      const [pair] = value.split(";");
      const [key, val] = pair.split("=");
      if (value.includes("max-age=0")) jar.delete(key);
      else jar.set(key, val);
    },
  };
  const window = { location: { hostname, protocol: "https:" }, dispatchEvent() {} };
  const modules = new Map();
  function load(name) {
    if (modules.has(name)) return modules.get(name);
    const source = fs.readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(output, {
      exports, window, document, Event, localStorage: { removeItem() {} },
      require: (path) => load(path.replace("./", "")),
    });
    modules.set(name, exports);
    return exports;
  }
  return { api: load("website-analytics"), storage: load("shared-domain-storage"), window, jar, writes };
}

test("no consent: no initialization, queue or event", () => {
  const { api, window } = setup();
  assert.equal(api.initializeAnalytics(), false);
  api.trackWebsiteEvent("desktop_download_click", { source: "home", position: "header" });
  assert.equal(window.dataLayer, undefined);
});

test("accepted: configure once; rejected: discard and disable", () => {
  const { api, window, jar } = setup();
  api.setConsent("accepted");
  assert.equal(api.initializeAnalytics(), true);
  api.initializeAnalytics();
  assert.equal(window.dataLayer.length, 2);
  api.trackWebsiteEvent("desktop_download_click", { source: "home", position: "header" });
  assert.equal(window.dataLayer[2][1], "desktop_download_click");
  jar.set("_ga", "id");
  api.setConsent("rejected");
  assert.equal(window["ga-disable-G-MY14R4KCP5"], true);
  assert.equal(jar.has("_ga"), false);
  api.trackWebsiteEvent("page_view", { page_path: "/" });
  assert.equal(window.dataLayer.length, 0);
});

test("share only with exact domain or real subdomains, never lookalikes", () => {
  for (const host of ["soniva.uk", "help.soniva.uk"]) {
    const { storage, writes } = setup(host);
    storage.writeSharedCookie("soniva_app_lang", "en-US");
    assert.match(writes.at(-1), /domain=\.soniva\.uk/);
  }
  for (const host of ["evilsoniva.uk", "soniva.uk.example.org", "localhost"]) {
    const { storage, writes } = setup(host);
    storage.writeSharedCookie("soniva_app_lang", "en-US");
    assert.doesNotMatch(writes.at(-1), /domain=/);
  }
});

test("malformed cookie cannot crash consent", () => {
  const { api, jar } = setup();
  jar.set("soniva_cookie_consent", "%XX");
  assert.equal(api.readConsent(), "unset");
});
