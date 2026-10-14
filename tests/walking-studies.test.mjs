import {test} from 'node:test';
import assert from 'node:assert/strict';
import {walkingCatalog,walkingScore,studyNotation} from '../public/walking-studies.mjs';
test('all ten studies have complete bars, playable bass and matching harmony events',()=>{
 assert.equal(walkingCatalog.length,10);
 for(const item of walkingCatalog){const score=walkingScore(item.study,item.mode);
  assert.equal(score.notes.reduce((sum,n)=>sum+n.duration,0),score.totalBeats);
  assert.ok(score.notes.every(n=>Number.isInteger(n.midi)&&n.midi>=28&&n.midi<=55));
  for(const event of score.chordEvents){const note=score.notes.find(n=>n.beat===event.beat);assert.equal(note.midi%12,event.bass);}
  for(const bar of score.bars)assert.equal(score.notes.filter(n=>n.beat>=bar.beat&&n.beat<bar.beat+4).reduce((s,n)=>s+n.duration,0),4);
  assert.ok(studyNotation(score).includes('data-beat'));
 }
});
test('forms retain supplied slash basses, turnarounds and minor thirds',()=>{
 const am=walkingScore('manha-am','simple');assert.equal(am.bars.length,36);
 assert.equal(am.notes.find(n=>n.beat===28*4+2).midi%12,0);
 assert.equal(am.notes.find(n=>n.beat===30*4+2).midi%12,7);
 const em=walkingScore('manha-em','simple');assert.equal(em.notes.find(n=>n.beat===28*4+2).midi%12,7);
 const dont=walkingScore('dont-get-around');assert.equal(dont.bars.length,32);assert.equal(dont.bars[15].chord,'Gm7 C7');
 const minor=walkingScore('blues-minor');assert.equal(minor.notes[1].midi%12,3);assert.equal(minor.notes[9*4+1].midi%12,11);
 assert.equal(walkingScore('birks').bars[11].chord,'Cm7');
});
