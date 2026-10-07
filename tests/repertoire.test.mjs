import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {activeRepertoire,backingTracks} from '../public/repertoire.mjs';
import {parseMidi} from '../public/midi-score.mjs';
import {PracticeEngine,generatedScore,playablePosition} from '../public/practice-engine.mjs';
test('six traceable beta entries, two actual MIDI scores, four honest source references',()=>{
 const entries=activeRepertoire();assert.equal(entries.length,6);assert.equal(entries.filter(r=>r.midi).length,2);
 for(const r of entries){assert.equal(r.collection,'beta-standards-v1');assert.match(r.source,/^https:/);assert.ok(r.license&&r.edition);}
});
test('downloaded assets match their pinned provenance hashes',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/repertoire/asset-manifest.json',import.meta.url)));
 for(const asset of manifest.assets){const data=readFileSync(new URL('../public/'+asset.path,import.meta.url));assert.equal(data.length,asset.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),asset.sha256);}
});
test('full Joplin MIDI files yield bounded playable reductions and independent accompaniment',()=>{
 for(const entry of activeRepertoire().filter(r=>r.midi)){
  const bytes=readFileSync(new URL('../public/'+entry.midi,import.meta.url));const s=parseMidi(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
  assert.ok(s.bars.length>100);assert.ok(s.notes.length>400);assert.ok(s.backing.length>1000);
  for(const n of s.notes){assert.ok(playablePosition(n.midi));assert.ok(n.duration>0&&n.beat+n.duration<=s.totalBeats);}
  assert.ok(s.bars.every(b=>b.root===null&&b.chord==='')); // Never fabricate chords.
 }
 assert.throws(()=>parseMidi(new ArrayBuffer(32)));
});
test('mix modes independently schedule bass and accompaniment; solo has no backing',()=>{
 for(const mix of ['full','no-bass','bass-only']){
  const e=new PracticeEngine();e.score=generatedScore('swing-major');e.mix=mix;e.metronome=false;e.anchorBeat=0;e.anchorTime=0;e.end=e.score.totalBeats;
  const bass=[],backing=[];e.tone=(...a)=>bass.push(a);e.sample=(...a)=>backing.push(a);e.schedule();
  assert.equal(bass.length>0,mix!=='no-bass');assert.equal(backing.length>0,mix!=='bass-only');
 }
 assert.equal(backingTracks.length,4);
});
test('legacy VCSL C3 sample is rooted at middle C, not an octave above the requested note',()=>{
 const e=new PracticeEngine(),source={playbackRate:{},connect(){},start(){},stop(){}};
 e.buffers={'piano-c3':{}};e.context={createBufferSource:()=>source,createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
 e.sample('piano-c3',60,0,1,.1);assert.equal(source.playbackRate.value,1);
 e.sample('piano-c3',48,0,1,.1);assert.equal(source.playbackRate.value,.5);
});
