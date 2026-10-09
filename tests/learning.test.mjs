import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planFingering,tuning,positions,routeHTML} from '../public/fingering.mjs';
import {ATLAS_FAMILIES,TONICS,atlasItem} from '../public/atlas-engine.mjs';
import {GENRES,generatedScore} from '../public/practice-engine.mjs';
import {sessionPlan,reviewAfter,readLearning,TECHNIQUE} from '../public/learning-tools.mjs';
test('every atlas family preserves exact pitches and valid positions on four/five strings and conceptual contrabass',()=>{
 for(const root of TONICS)for(const f of ATLAS_FAMILIES)for(const instrument of ['electricBass','electricBass5','doubleBass']){
  const notes=atlasItem(f.id,root).pitches,route=planFingering(notes,instrument);
  assert.equal(route.length,notes.length);
  route.forEach((p,i)=>{assert.equal(tuning(instrument)[p.string]+p.fret,notes[i].midi);assert.equal(p.step,i+1);assert.ok(p.fret>=0&&p.fret<=24);if(instrument==='doubleBass')assert.equal(p.finger,null);else assert.ok(p.finger>=0&&p.finger<=4);});
 }
 assert.equal(planFingering([{midi:23}],'electricBass').length,0);assert.equal(planFingering([{midi:23}],'electricBass5')[0].string,4);
 const notes=atlasItem('blues-major','D').pitches;
 for(let i=0;i<positions(notes[0].midi).length;i++)assert.equal(planFingering(notes,'electricBass',i)[0].string,positions(notes[0].midi)[i].string);
 assert.ok(routeHTML(planFingering(notes)).includes('INICIO'));assert.ok(routeHTML(planFingering(notes)).includes('FIN'));
});
test('eight original genres produce bounded, rhythmically different bass and backing events',()=>{
 const rhythms=new Set();for(const [id] of GENRES){const s=generatedScore('genre-'+id,'arpeggios');assert.ok(s.backing.length);assert.ok(s.notes.every(n=>n.beat+n.duration<=s.totalBeats));assert.ok(s.backing.every(n=>n.beat+n.duration<=s.totalBeats));assert.ok(planFingering(s.notes).length);rhythms.add(s.notes.map(n=>n.beat%4).join());}assert.ok(rhythms.size>=4);assert.equal(GENRES.length,8);
});
test('sessions and local review schedules stay bounded and malformed storage does not inject lessons',()=>{
 for(const m of [5,10,15,30,45,60])assert.equal(sessionPlan(m).reduce((a,b)=>a+b),m);
 assert.equal(reviewAfter('hard',new Date('2026-10-09T12:00:00Z')),'2026-10-10T12:00:00.000Z');
 assert.deepEqual(readLearning({getItem(){throw Error();}},'x'),{reviews:{}});
 assert.deepEqual(readLearning({getItem(){return '{"reviews":{"<script>":{}}}';}},'x'),{reviews:{}});assert.equal(TECHNIQUE.length,5);
});
