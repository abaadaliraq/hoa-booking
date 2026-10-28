import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function module(file, overrides = {}) {
 const output = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 const result = { exports: {} };
 vm.runInNewContext("(function(require,module,exports){"+output+"})", { process: { env: overrides.env || {} }, fetch: overrides.fetch, AbortSignal, Response })(id => overrides[id] || {}, result, result.exports);
 return result.exports;
}
const { visitTimeChoices, timeWindowLabel } = module("../lib/exhibition/schedule.ts");
const slot = (start, remaining = 60, date = "2026-10-31") => ({ id: "slot-"+start, visit_date: date, start_time: start+":00:00", end_time: (start+1)+":00:00", remaining });
test("the visible schedule uses the four natural evening windows from 5 to 9", () => {
 assert.equal(timeWindowLabel("17:00", "18:00"), "5 – 6 مساءً");
 assert.deepEqual([...visitTimeChoices([], "2026-10-31", 1)].map(x=>x.label), ["5 – 6 مساءً","6 – 7 مساءً","7 – 8 مساءً","8 – 9 مساءً"]);
});
test("network failure cannot invent selectable slots or booking identifiers", () => {
 assert.ok(visitTimeChoices([], "2026-10-31", 1).every(x=>x.disabled && x.slot === undefined));
});
test("only inventory for the selected day and sufficient remaining party capacity is selectable", () => {
 const choices = visitTimeChoices([slot(17, 10), slot(18, 2), slot(19, 60, "2026-11-01")], "2026-10-31", 3);
 assert.equal(choices[0].disabled, false); assert.equal(choices[0].slot.id, "slot-17");
 assert.equal(choices[1].disabled, true); assert.equal(choices[2].disabled, true); assert.equal(choices[3].disabled, true);
});
test("opaque secret API keys use apikey header without an invalid Bearer JWT", async () => {
 let headers;
 const { rpc } = module("../lib/exhibition/server.ts", {
  env: { EXHIBITION_SUPABASE_URL: "https://pwlwelxnrrignapdsyiw.supabase.co", EXHIBITION_SUPABASE_SERVICE_ROLE_KEY: " sb_secret_test_fixture_only\n", EXHIBITION_BOOKING_SECRET: "fixture-only-signing-secret-length-at-least32" },
  fetch: async (url, init) => { headers=init.headers; return Response.json([]); },
 });
 await rpc("booking_slots", {});
 assert.equal(headers.apikey,"sb_secret_test_fixture_only"); assert.equal(headers.Authorization,undefined);
});

test("availability diagnostics distinguish missing configuration without exposing credentials", async () => {
 const env = { EXHIBITION_SUPABASE_URL: "https://pwlwelxnrrignapdsyiw.supabase.co", EXHIBITION_SUPABASE_SERVICE_ROLE_KEY: "sb_secret_fixture_only", EXHIBITION_BOOKING_SECRET: "fixture-only-signing-secret-length-at-least32" };
 for (const [field, code] of [["EXHIBITION_SUPABASE_URL", "CONFIG_URL"], ["EXHIBITION_SUPABASE_SERVICE_ROLE_KEY", "CONFIG_KEY"], ["EXHIBITION_BOOKING_SECRET", "CONFIG_SIGNING"]]) {
  const { config } = module("../lib/exhibition/server.ts", { env: { ...env, [field]: "" } });
  assert.throws(config, error => error.supportCode === code && !error.message.includes(env.EXHIBITION_SUPABASE_SERVICE_ROLE_KEY));
 }
 const { rpc } = module("../lib/exhibition/server.ts", { env, fetch: async () => new Response("private upstream response", { status: 401 }) });
 await assert.rejects(rpc("booking_slots", {}), error => error.supportCode === "DATABASE_401" && !error.message.includes("private upstream response"));
});
