const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { initNetlifyForm } = require("../netlify-form.js");

const html = readFileSync(join(__dirname, "../index.html"), "utf8");
const formMarkup = html.match(/<form\b([^>]*)>([\s\S]*?)<\/form>/);
function attributes(markup) {
  return Object.fromEntries([...markup.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}

function fixture(t, { hostname = "example.netlify.app", protocol = "https:" } = {}) {
  const original = { window: global.window, fetch: global.fetch, FormData: global.FormData };
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  });
  const controls = [...formMarkup[2].matchAll(/<(input|select)\b([^>]*)>/g)].map((match) => {
    const attrs = attributes(match[2]);
    const defaultValue = attrs.value || "";
    return { ...attrs, defaultValue, value: defaultValue, disabled: false };
  });
  for (const field of controls) {
    if (field.type !== "hidden" && field.name !== "bot-field") field.value = field.name === "email" ? "preview@example.com" : "Preview + Test & تیم";
  }
  const button = { textContent: "Send request", type: "submit", disabled: false };
  controls.push(button);
  const listeners = {};
  const state = new Map();
  const form = {
    action: "https://example.netlify.app/",
    controls,
    valid: true,
    resets: 0,
    querySelector: () => button,
    querySelectorAll: () => controls,
    addEventListener: (name, listener) => { listeners[name] = listener; },
    reportValidity() { return this.valid; },
    setAttribute: (name, value) => state.set(name, value),
    removeAttribute: (name) => state.delete(name),
    reset() {
      this.resets++;
      controls.filter((field) => field.name).forEach((field) => { field.value = field.defaultValue; });
    },
  };
  const status = { textContent: "", dataset: {} };
  global.window = { location: { hostname, protocol } };
  global.FormData = class {
    constructor(target) {
      return target.controls.filter((field) => field.name && !field.disabled).map((field) => [field.name, field.value]);
    }
  };
  const requests = [];
  global.fetch = async (...args) => { requests.push(args); return { ok: true }; };
  const api = initNetlifyForm(form, status, { successMessage: "Request received." });
  return { form, status, button, requests, state, api, submit: () => listeners.submit({ preventDefault() {} }) };
}

test("static HTML declares a complete Netlify form", () => {
  assert.ok(formMarkup);
  const attrs = attributes(formMarkup[1]);
  assert.equal(attrs.method, "POST");
  assert.equal(attrs.action, "/");
  assert.equal(attrs["data-netlify"], "true");
  assert.equal(attrs["netlify-honeypot"], "bot-field");
  const fields = [...formMarkup[2].matchAll(/<input\b([^>]*)>/g)].map((m) => attributes(m[1]));
  assert.equal(fields.find((field) => field.name === "form-name").value, attrs.name);
  assert.ok(fields.some((field) => field.name === "bot-field"));
  assert.ok(fields.some((field) => field.name === "email" && field.type === "email"));
});

test("local preview validates without sending or clearing details", async (t) => {
  const f = fixture(t, { hostname: "localhost", protocol: "http:" });
  await f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(f.form.resets, 0);
  assert.equal(f.status.dataset.state, "preview");
  assert.match(f.status.textContent, /does not send or save/);
});

test("invalid input never starts a request", async (t) => {
  const f = fixture(t);
  f.form.valid = false;
  await f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(f.form.resets, 0);
});

test("successful POST includes encoded fields, form-name and honeypot", async (t) => {
  const f = fixture(t);
  const expected = f.form.controls.filter((field) => field.name).map((field) => [field.name, field.value]);
  await f.submit();
  const [url, request] = f.requests[0];
  assert.equal(url, f.form.action);
  assert.equal(request.method, "POST");
  assert.equal(request.headers["Content-Type"], "application/x-www-form-urlencoded");
  assert.deepEqual([...new URLSearchParams(request.body)], expected);
  assert.equal(f.form.resets, 1);
  assert.equal(f.status.dataset.state, "success");
  assert.equal(f.button.textContent, "Send request");
  assert.equal(f.state.has("aria-busy"), false);
  assert.ok(f.form.controls.every((field) => !field.disabled));
});

for (const failure of ["HTTP error", "network error"]) {
  test(`${failure} keeps input and allows retry`, async (t) => {
    const f = fixture(t);
    const input = f.form.controls.find((field) => field.name === "email");
    const before = input.value;
    global.fetch = async () => {
      if (failure === "network error") throw new Error("Offline");
      return { ok: false, status: 500 };
    };
    await f.submit();
    assert.equal(f.status.dataset.state, "error");
    assert.equal(f.form.resets, 0);
    assert.equal(input.value, before);
    assert.equal(f.button.disabled, false);
    global.fetch = async () => ({ ok: true });
    await f.submit();
    assert.equal(f.status.dataset.state, "success");
  });
}

test("an in-flight request blocks duplicate submissions and edits", async (t) => {
  const f = fixture(t);
  let finish;
  let count = 0;
  global.fetch = () => { count++; return new Promise((resolve) => { finish = resolve; }); };
  const pending = f.submit();
  await f.submit();
  assert.equal(count, 1);
  assert.equal(f.status.dataset.state, "sending");
  assert.equal(f.state.get("aria-busy"), "true");
  assert.ok(f.form.controls.every((field) => field.disabled));
  finish({ ok: true });
  await pending;
  assert.equal(f.status.dataset.state, "success");
});

test("a pre-disabled control stays disabled after submission", async (t) => {
  const f = fixture(t);
  const disabled = { name: "unavailable-option", value: "ignored", disabled: true };
  f.form.controls.push(disabled);
  await f.submit();
  assert.equal(disabled.disabled, true);
  assert.equal(new URLSearchParams(f.requests[0][1].body).has(disabled.name), false);
});
