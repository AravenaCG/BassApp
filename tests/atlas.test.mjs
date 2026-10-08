import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ATLAS_FAMILIES,TONICS,atlasItem,atlasScore,searchAtlas,dailyChallenge,challengeURL,spellDegree,degreeOffset} from '../public/atlas-engine.mjs';
import {atlasStaff,atlasMap} from '../public/atlas-ui.mjs';
import {atlasTheory,atlasTheoryHTML} from '../public/atlas-theory.mjs';
test('every scale and arpeggio has distinct theory with concrete transposed examples and interval distances',()=>{
 for(const root of TONICS)for(const family of ATLAS_FAMILIES){const item=atlasItem(family.id,root),t=atlasTheory(item);
  assert.ok(t.construction.length>40);assert.ok(t.color.length>40);assert.ok(t.application.length>40);
  assert.ok(t.example.length>5);assert.equal(t.rows.length,item.pitches.length);
  assert.ok(t.rows.every(row=>row.interval&&Number.isInteger(row.semitones)));
  if(item.kind==='scale')assert.equal(t.steps.reduce((a,b)=>a+b,0),12);
  assert.ok(atlasTheoryHTML(item).includes('Cómo se construye'));
 }
 const pent=atlasTheory(atlasItem('pent-minor','Bb'));
 assert.equal(pent.stepText,'3S – T – T – 3S – T');assert.ok(pent.example.includes('Re bemol'));
 assert.equal(pent.rows.find(r=>r.degree==='b3').derivation,'Re → Re bemol');
 assert.equal(atlasTheory(atlasItem('maj9','C')).rows.at(-1).semitones,14);
 assert.ok(atlasTheory(atlasItem('melodic-minor')).construction.includes('jazz'));
 assert.ok(atlasTheory(atlasItem('altered')).construction.includes('dominante'));
});
test('all catalog families transpose to every tonic with valid spellings, pitches and maps',()=>{
 assert.equal(new Set(ATLAS_FAMILIES.map(f=>f.id)).size,ATLAS_FAMILIES.length);
 for(const root of TONICS)for(const f of ATLAS_FAMILIES){
  const item=atlasItem(f.id,root),score=atlasScore(item);
  assert.equal(item.pitches.length,f.degrees.length);assert.ok(score.notes.length>0);
  assert.ok(score.notes.every(n=>Number.isInteger(n.midi)&&n.midi>=28&&n.midi<=80&&n.duration>0&&n.beat+n.duration<=score.totalBeats));
  assert.ok(atlasMap(item).includes('data-map-midi'));assert.ok(atlasStaff(item).includes('data-atlas-midi'));
  if(f.kind==='scale'){assert.equal(item.pitches.at(-1).midi-item.pitches[0].midi,12);assert.ok(item.pitches.every((n,i)=>!i||n.midi>item.pitches[i-1].midi));}
 }
});
test('Bb pentatonics, flat spelling, chord-first names, enharmonics and extensions stay musically correct',()=>{
 const bb=atlasItem('pent-major','Bb');assert.deepEqual(bb.pitches.map(p=>p.symbol),['Bb','C','D','F','G','Bb']);
 assert.deepEqual(atlasItem('pent-minor','Bb').pitches.map(p=>p.symbol),['Bb','Db','Eb','F','Ab','Bb']);
 assert.deepEqual(atlasItem('major','F#').pitches.map(p=>p.symbol),['F#','G#','A#','B','C#','D#','E#','F#']);
 assert.equal(atlasItem('maj7','C').title,'Cmaj7 / Do · mayor séptima');
 assert.equal(atlasItem('first-inversion','Bb').symbol,'Bb/D');
 assert.equal(spellDegree('C','bb7').symbol,'Bbb');assert.equal(degreeOffset('b9'),13);
 assert.equal(atlasItem('maj9','C').pitches.at(-1).midi,50);
 assert.throws(()=>atlasItem('unknown','C'));assert.throws(()=>atlasItem('major','invalid'));
});
test('search resolves Spanish aliases, symbols and accidental tonics without ignoring the family selector',()=>{
 for(const q of ['Sib pentatónica','Si bemol pentatonica','Bb pentatonic','Si♭ pentatónica']){const found=searchAtlas(q);assert.equal(found.length,2);assert.ok(found.every(i=>i.root==='Bb'));}
 assert.ok(searchAtlas('Bbmaj7').some(i=>i.root==='Bb'&&i.id==='maj7'));
 assert.ok(searchAtlas('C# dórica').some(i=>i.root==='C#'&&i.id==='dorian'));
 assert.ok(searchAtlas('','G','arpeggio').every(i=>i.kind==='arpeggio'&&i.root==='G'));
 assert.equal(searchAtlas('not a scale').length,0);
});
test('daily challenge is deterministic, rotates, validates dates and shares the same challenge',()=>{
 const c=dailyChallenge('2026-10-07');assert.deepEqual(dailyChallenge(c.date),c);assert.equal(c.families.length,3);
 assert.notEqual(c.root,dailyChallenge('2026-10-08').root);
 const url=new URL(challengeURL(c,'https://example.test/appbass.html#escalas'));
 assert.equal(url.hash,`#escalas?reto=modos&fecha=${c.date}`);
 for(const date of ['2026-02-30','not-a-date','<script>'])assert.throws(()=>dailyChallenge(date));
 assert.ok(TONICS.includes(dailyChallenge('1900-01-01').root));
});
