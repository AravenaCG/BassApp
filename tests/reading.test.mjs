import {test} from 'node:test';
import assert from 'node:assert/strict';
import {READING_LEVELS,readingPosition,readingReference} from '../public/reading-ui.mjs';
test('reading range fits standard four string bass and expands from three notes',()=>{
 assert.deepEqual(READING_LEVELS[0].notes,[50,52,53]);
 for(const l of READING_LEVELS.filter(l=>l.notes))for(const n of l.notes)assert.ok(n>=40&&n<=57);
 assert.equal(readingPosition(53),'línea 4, contando desde abajo');
 assert.equal(readingPosition(48),'espacio 2, contando desde abajo');
 assert.equal(readingPosition(40),'primera línea adicional inferior');
 assert.equal((readingReference().match(/<ellipse/g)||[]).length,5);
 assert.equal((readingReference(true).match(/<ellipse/g)||[]).length,4);
});
