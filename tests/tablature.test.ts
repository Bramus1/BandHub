import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appendBar} from '../src/tablature';
test('bars append horizontally to all six strings without losing notes',()=>{
 const first=appendBar('');const second=appendBar(first.replace('e|----------------|','e|0---2-----------|'));
 assert.equal(second.split('\n').length,6);assert.equal(second.split('\n')[0],'e|0---2-----------|----------------|');
});
test('headings are preserved and a new system is explicit',()=>{
 const first=appendBar('[Intro]');assert.ok(first.startsWith('[Intro]\n\n'));
 assert.equal(appendBar(first,true).split('\n').filter(l=>l.startsWith('e|')).length,2);
});
test('malformed string blocks are preserved instead of extended incorrectly',()=>{
 assert.ok(appendBar('e|---|\nB|--|').startsWith('e|---|\nB|--|\n\n'));
});
