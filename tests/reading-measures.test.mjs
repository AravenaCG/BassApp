import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {READING_MEASURES,measureSVG} from '../public/reading-measures.mjs';
import {recommendationForLesson} from '../public/lesson-recommendations.mjs';
import {ATLAS_FAMILIES,TONICS} from '../public/atlas-engine.mjs';
import {catalog} from '../public/practice-engine.mjs';
test('all reading bars fill 4/4, respect written range and render each event',()=>{
 for(const bar of READING_MEASURES){
  assert.equal(bar.events.reduce((sum,e)=>sum+e.beats,0),4);
  for(const e of bar.events){assert.ok([.5,1,2,4].includes(e.beats));assert.ok(e.midi===null||e.midi>=40&&e.midi<=57);}
  assert.equal((measureSVG(bar).match(/data-measure-event=/g)||[]).length,bar.events.length);
 }
 assert.ok(READING_MEASURES.some(b=>b.events.some(e=>e.midi===null)));
 assert.ok(READING_MEASURES.some(b=>b.events.some(e=>e.beats===.5)));
});
test('all forty course lessons have valid curated recommendations',()=>{
 const course=JSON.parse(readFileSync(new URL('../public/course/course.json',import.meta.url)));
 const lessons=course.levels.flatMap(l=>l.lessons);assert.equal(lessons.length,40);
 for(const lesson of lessons){const r=recommendationForLesson(lesson.lessonId);assert.ok(r,lesson.lessonId);assert.ok(ATLAS_FAMILIES.some(f=>f.id===r.family));assert.ok(TONICS.includes(r.tonic));assert.ok(catalog.some(c=>c.id===r.exercise));assert.ok(r.reason.length>30);}
 assert.equal(recommendationForLesson('B06').family,'natural-minor');
 assert.equal(recommendationForLesson('I04').exercise,'blues-minor-walking');
 assert.equal(recommendationForLesson('A02').family,'altered');
 assert.equal(recommendationForLesson('unknown'),null);
});
