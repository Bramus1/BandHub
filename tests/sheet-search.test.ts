import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchSheets} from '../src/sheet-search';
test('sheet search retrieves lyrics for in-app display and encodes query',async()=>{
 let url='';const rows=await searchSheets('A & B','My tune',async(input)=>{url=String(input);return new Response(JSON.stringify([{id:1,trackName:'My tune',artistName:'A & B',plainLyrics:'Original test words',albumName:'Demo'}]))});
 assert.ok(url.includes('A+%26+B'));assert.equal(rows[0].lyrics,'Original test words');
});
test('empty query and provider failures are visible',async()=>{
 await assert.rejects(searchSheets('',''));
 await assert.rejects(searchSheets('A','B',async()=>new Response('',{status:503})),/busy/);
 await assert.rejects(searchSheets('A','B',async()=>new Response('{}')),/invalid/);
});
test('instrumentals and missing lyrics are not invented',async()=>{
 const rows=await searchSheets('A','B',async()=>new Response(JSON.stringify([{id:2,trackName:'B',artistName:'A',instrumental:true,plainLyrics:null}])));
 assert.equal(rows[0].lyrics,'');assert.equal(rows[0].instrumental,true);
});
