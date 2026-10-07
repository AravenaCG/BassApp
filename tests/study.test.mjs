import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextLesson,LESSON_IDS,reminderDue,sessionPlan} from '../lib/study.mjs';
import {generatedScore,playablePosition,catalog,PracticeEngine,PRACTICE_MUSIC_BOOST} from '../public/practice-engine.mjs';
test('progress skips completed lessons, revisits earlier gaps, ends only at 40',()=>{
 assert.equal(nextLesson('B01',['B01']),'B02');
 assert.equal(nextLesson('B01',['B01','B02']),'B03');
 assert.equal(nextLesson('A12',['A12']),'B01');
 assert.equal(nextLesson('A12',LESSON_IDS),null);
});
test('plans distribute time without negative durations',()=>{
 for(const minutes of [15,30,60,120,240,600,1200]){
  const p=sessionPlan(minutes);assert.equal(p.warmup+p.concept+p.play,p.total);assert.ok(p.play>0);
 }
});
test('reminders respect timezone, weekly cadence, catch-up and snooze',()=>{
 const now=new Date('2026-10-07T01:00:00Z');
 const u={reminder_enabled:true,time_zone:'America/Argentina/Buenos_Aires',reminder_day:2,created_at:new Date('2026-10-06')};
 assert.equal(reminderDue(u,now),true);
 assert.equal(reminderDue({...u,reminder_enabled:false},now),false);
 assert.equal(reminderDue({...u,last_reminder_at:now},now),false);
 assert.equal(reminderDue({...u,reminder_snoozed_until:new Date('2026-10-08')},now),false);
 assert.equal(reminderDue({...u,reminder_day:4,created_at:new Date('2026-09-20')},now),true);
});
test('every generated difficulty is playable and fits its bars',()=>{
 for(const item of catalog.filter(c=>c.generated))for(const difficulty of ['roots','fifths','arpeggios','walking']){
  const score=generatedScore(item.generated,difficulty);
  assert.ok(score.totalBeats>0);
  for(const n of score.notes){assert.ok(n.beat+n.duration<=score.totalBeats);assert.ok(playablePosition(n.midi));}
 }
});
test('difficulty changes real note sequences',()=>{
 const root=generatedScore('blues','roots'),walk=generatedScore('blues','walking');
 assert.equal(root.bars.length,12);assert.equal(walk.notes.length,48);
 assert.notDeepEqual(root.notes,walk.notes);
 assert.notDeepEqual(generatedScore('song1').notes,generatedScore('song2').notes);
});

test('practice music is 4 dB louder, clicks stay unchanged and generated mixes retain headroom',()=>{
 assert.ok(Math.abs(20*Math.log10(PRACTICE_MUSIC_BOOST)-4)<1e-9);
 for(const item of catalog.filter(c=>c.generated))for(const difficulty of ['roots','fifths','arpeggios','walking']){
  const engine=new PracticeEngine();engine.score=generatedScore(item.generated,difficulty);
  engine.anchorBeat=0;engine.anchorTime=0;engine.end=engine.score.totalBeats;engine.volume=1;
  const events=[];engine.tone=(midi,start,duration,gain)=>events.push({midi,start,end:start+duration+.03,gain});
  engine.schedule();
  assert.ok(events.some(e=>e.gain===.13*PRACTICE_MUSIC_BOOST));
  assert.ok(events.filter(e=>Math.abs(e.end-e.start-.065)<1e-8).every(e=>e.gain===.08));
  for(const event of events){
   // Conservative upper bound: sum peak amplitudes of all overlapping voices.
   const peak=events.filter(e=>e.start<=event.start&&e.end>event.start).reduce((sum,e)=>sum+e.gain,0);
   assert.ok(peak<.9,`${item.id}/${difficulty}: insufficient headroom`);
  }
 }
});

test('zero practice volume does not create audible oscillators',()=>{
 const engine=new PracticeEngine();engine.volume=0;
 engine.context={createOscillator(){throw Error('Muted playback must not create a voice');}};
 engine.tone(36,0,1,.13*PRACTICE_MUSIC_BOOST);
});
