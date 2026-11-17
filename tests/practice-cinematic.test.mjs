import test from 'node:test';
import assert from 'node:assert/strict';
import {supportsCinematic,fretWindow,realNeckPoint,fretboardSVG,tablatureSVG,compactScoreSVG,CINEMATIC_EXERCISES} from '../public/practice-cinematic.mjs';

const score={bars:[{beat:0,length:4,chord:'C',root:36}],notes:[{beat:0,duration:1,midi:36},{beat:1,duration:1,midi:38}]};
const planned=[{...score.notes[0],string:3,fret:8,finger:2},{...score.notes[1],string:2,fret:5,finger:1}];
const color=()=> '#48e3ed';

test('cinematic practice is a four-string view with the five proposed exercises',()=>{
 assert.equal(supportsCinematic('electricBass'),true);
 assert.equal(supportsCinematic('electricBass5'),false);
 assert.equal(supportsCinematic('doubleBass'),false);
 assert.deepEqual(CINEMATIC_EXERCISES.map(row=>row[0]),['major-scale','pentatonic','blues','walking','first-groove']);
});

test('cinematic renderers expose active fingering, tab and bass-clef score',()=>{
 assert.deepEqual(fretWindow(3),{first:1,last:5,size:5});
 assert.deepEqual(fretWindow(15),{first:13,last:17,size:5});
 assert.match(fretboardSVG(planned,0,planned[0],color,['Do']),/>2<\/text>/);
 assert.match(fretboardSVG([{...planned[0],fret:15}],0,{...planned[0],fret:15},color,['Do']),/TRASTES 13–17/);
 const tab=tablatureSVG(score,planned,0,planned[0],color);
 assert.match(tab,/>8<\/text>/);
 assert.match(tab,/fill="#f4f7fb" stroke="#48e3ed"/);
 assert.match(tab,/font-size="16" font-weight="900" stroke="none">8<\/text>/);
 assert.match(compactScoreSVG(score,0,score.notes[0],color),/𝄢/);
});

test('real neck lights use measured string columns and physical fret centers',()=>{
 assert.deepEqual(realNeckPoint({string:0,fret:4}),{x:65.16,y:35.19});
 assert.deepEqual(realNeckPoint({string:1,fret:3}),{x:54.89,y:26.53});
 assert.deepEqual(realNeckPoint({string:3,fret:1}),{x:35.08,y:6.83});
});
