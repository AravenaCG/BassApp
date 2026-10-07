import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {journeyState,journeyHTML,readingExercisesHTML} from '../public/course-ui.mjs';
const course=JSON.parse(readFileSync(new URL('../public/course/course.json',import.meta.url)));
test('journey follows first real gap, handles revisits and completed levels without inventing progress',()=>{
 const lessons=course.levels[0].lessons;
 assert.equal(journeyState(lessons)[0].state,'current');
 const state=journeyState(lessons,['B01','B03','unknown','B01']);
 assert.equal(state[1].lessonId,'B02');assert.equal(state[1].state,'current');assert.equal(state[2].state,'done');
 assert.equal(state.filter(l=>l.state==='current').length,1);
 assert.ok(journeyState(lessons,lessons.map(l=>l.lessonId)).every(l=>l.state==='done'));
 assert.equal((journeyHTML(lessons,['B01']).match(/journey-player/g)||[]).length,1);
 assert.equal((journeyHTML(lessons,lessons.map(l=>l.lessonId)).match(/journey-player/g)||[]).length,0);
});
test('every reading exercise has its actual score and bar reference beside its prompt across all 40 lessons',()=>{
 for(const lesson of course.levels.flatMap(l=>l.lessons)){
  const id=lesson.lessonId,base=`course/lessons/${id}/`,data=JSON.parse(readFileSync(new URL(`../public/${base}${id}.lesson.json`,import.meta.url))),html=readingExercisesHTML(data,base);
  for(const exercise of data.readingExercises){
   const material=data.musicalMaterials.find(m=>m.materialId===exercise.materialId);
   assert.ok(material?.renderAssetIds.length,`${id}: ${exercise.exerciseId}`);
   for(const assetId of material.renderAssetIds){const a=data.assets.find(a=>a.assetId===assetId);assert.ok(html.includes(base+a.relativePath));assert.ok(existsSync(new URL('../public/'+base+a.relativePath,import.meta.url)));}
   assert.ok(html.includes(exercise.exerciseId));
   assert.ok(html.includes(['formAndRoots','barChordMapping'].includes(exercise.responseType)?'Forma completa':'Compás '+exercise.bar));
   if(Array.isArray(exercise.answerKey?.bars))for(const bar of exercise.answerKey.bars)assert.ok(html.includes(`Compás ${bar.bar} · ${bar.symbol} · Fundamental: ${bar.latinRoot}`));
  }
  assert.ok(!html.includes('No se encontró'));
 }
});
test('reading and station labels escape HTML instead of injecting text content',()=>{
 assert.ok(journeyHTML([{lessonId:'B01',title:'<script>bad</script>'}]).includes('&lt;script&gt;'));
 const html=readingExercisesHTML({readingExercises:[{exerciseId:'L01',materialId:'x',bar:1,prompt:'<img onerror=x>',answerKey:{},feedback:'<script>'}],musicalMaterials:[],assets:[]},'course/');
 assert.ok(html.includes('&lt;img onerror=x&gt;'));assert.ok(!html.includes('<script>'));
});
