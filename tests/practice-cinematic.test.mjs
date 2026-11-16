import test from 'node:test';
import assert from 'node:assert/strict';
import {supportsCinematic,fretboardSVG,tablatureSVG,compactScoreSVG,CINEMATIC_EXERCISES} from '../public/practice-cinematic.mjs';

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
 assert.match(fretboardSVG(planned,0,planned[0],color,['Do']),/>2<\/text>/);
 assert.match(tablatureSVG(score,planned,0,planned[0],color),/>8<\/text>/);
 assert.match(compactScoreSVG(score,0,score.notes[0],color),/𝄢/);
});
