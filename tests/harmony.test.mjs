import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {harmonyModules,harmonyUnits,unitsForLesson,nextHarmonyUnit} from '../public/harmony-curriculum.mjs';
import {lessonHarmonyHTML,HarmonyAudio} from '../public/harmony-ui.mjs';
import {catalog} from '../public/practice-engine.mjs';
const course=JSON.parse(readFileSync(new URL('../public/course/course.json',import.meta.url)));
const lessonIds=course.levels.flatMap(l=>l.lessons.map(l=>l.lessonId));
test('harmony curriculum is progressive, substantial, linked and complete',()=>{
 assert.equal(harmonyUnits.length,16);assert.equal(new Set(harmonyUnits.map(u=>u.id)).size,16);
 const seen=new Set();
 for(const u of harmonyUnits){
  assert.ok(harmonyModules.some(m=>m.id===u.module));
  for(const id of u.prerequisiteIds)assert.ok(seen.has(id));seen.add(u.id);
  assert.ok(u.sections.length>=3&&u.sections.every(([title,text])=>title&&text.length>180));
  assert.ok(u.examples.length&&u.tasks.length>=3&&u.checkpoint&&u.caution);
  assert.equal(u.questions.length,2);
  for(const q of u.questions){assert.ok(q.answer>=0&&q.answer<q.choices.length);assert.ok(q.explanation.length>20);}
  assert.ok(catalog.some(c=>c.id===u.practice));
  for(const id of u.lessons)assert.ok(lessonIds.includes(id));
  assert.ok(u.listen.midi.length>1);
  for(const event of u.listen.midi)for(const pitch of Array.isArray(event)?event:[event])assert.ok(Number.isInteger(pitch)&&pitch>=28&&pitch<=76);
 }
 for(const m of harmonyModules)assert.ok(harmonyUnits.some(u=>u.module===m.id));
});
test('recommendations skip completed units and course IDs remain unchanged',()=>{
 assert.equal(nextHarmonyUnit([]).id,'H01');assert.equal(nextHarmonyUnit(['H01','H03']).id,'H02');
 assert.equal(nextHarmonyUnit(harmonyUnits.map(u=>u.id)),null);assert.equal(lessonIds.length,40);
 assert.ok(unitsForLesson('B03').some(u=>u.id==='H04'));assert.deepEqual(unitsForLesson('X99'),[]);
 assert.match(lessonHarmonyHTML('B04'),/data-harmony-open/);assert.equal(lessonHarmonyHTML('X99'),'');
});
test('demonstrations include correct thirds, dominant resolution and inversion bass notes',()=>{
 const demo=id=>harmonyUnits.find(u=>u.id===id).listen.midi;
 assert.deepEqual(demo('H02'),[36,40,36,39]);assert.deepEqual(demo('H03'),[[47,53],[48,52]]);
 assert.deepEqual(demo('H13').slice(3),[36,35,33]);
 assert.deepEqual(demo('H16'),[36,33,38,31,40,41,43,36]);
});
test('audio stop cancels pending resume and scheduled oscillators',async()=>{
 const a=new HarmonyAudio();let resolve;
 a.context={resume:()=>new Promise(r=>{resolve=r;}),createOscillator(){throw Error('Cancelled audio should not schedule');}};
 const pending=a.play(harmonyUnits[0],()=>{});a.stop();resolve();await pending;
 let stopped=0;a.nodes.add({stop(){stopped++;}});a.stop();assert.equal(stopped,1);assert.equal(a.nodes.size,0);
});
test('private docs excluded from Git and Docker and no source document URLs shipped',()=>{
 assert.match(readFileSync(new URL('../.gitignore',import.meta.url),'utf8'),/^\/docs\/$/m);
 assert.match(readFileSync(new URL('../.dockerignore',import.meta.url),'utf8'),/^docs$/m);
 for(const file of ['harmony-curriculum.mjs','harmony-ui.mjs'])assert.doesNotMatch(readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),/(?:href|src)=["']\/?docs\//);
});
