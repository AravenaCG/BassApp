import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";
import { completeLesson, readProgress } from "../lib/progress-service.mjs";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../drizzle/0000_illegal_fallen_one.sql", import.meta.url), "utf8"));
const db = { prepare(sql) { return { bind(...params) { return {
  async all() { return { results: sqlite.prepare(sql).all(...params) }; },
  async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...params).changes) } }; },
}; } }; } };

assert.equal((await completeLesson(db, "alice", "B01")).awardedPoints, 100);
const replay = await completeLesson(db, "alice", "B01");
assert.equal(replay.awardedPoints, 0);
assert.equal(replay.nextLessonId, "B02");
assert.equal((await completeLesson(db, "alice", "B02")).totalPoints, 200);
assert.equal((await completeLesson(db, "bob", "B01")).totalPoints, 100);
await assert.rejects(() => completeLesson(db, "alice", "B99"));
const concurrent = await Promise.all(Array.from({ length: 8 }, () => completeLesson(db, "alice", "B03")));
assert.equal(concurrent.reduce((sum, result) => sum + result.awardedPoints, 0), 100);
assert.deepEqual((await readProgress(db, "alice")).completed, ["B01", "B02", "B03"]);

const html = readFileSync(new URL("../public/appbass.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
assert(html.includes('symbol id="play-icon"'));
assert(!html.includes('id="play"'));
assert(js.includes('id="play"'));
assert(!js.includes('href="#play"'));
const button = { innerHTML: "", setAttribute(key, value) { this[key] = value; } };
const audio = { paused: true, play() { this.paused = false; return Promise.resolve(); }, pause() { this.paused = true; } };
const context = { backing: audio, $: () => button, toast: () => { throw new Error("Unexpected playback error"); } };
vm.createContext(context);
vm.runInContext(js.slice(js.indexOf("function setPlayButton()"), js.indexOf("$('#play').addEventListener")), context);
await vm.runInContext("togglePlayback()", context);
assert.equal(audio.paused, false);
assert.equal(button["aria-label"], "Pausar acompañamiento");
await vm.runInContext("togglePlayback()", context);
assert.equal(audio.paused, true);
assert.equal(button["aria-label"], "Reproducir acompañamiento");
console.log("PASS: playback toggle, B01→B02, idempotent points, concurrent completion, user isolation and invalid lessons");
