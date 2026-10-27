import { test } from 'node:test';
import assert from 'node:assert/strict';
import { songInput, messageInput, uploadInput, externalSources, validateConfig, formatTime } from '../src/domain.ts';

test('new ideas retain musical metadata and use the five project statuses',()=>{
  assert.deepEqual(songInput({title:'  First riff ',bpm:'112',musical_key:'Am',time_signature:'4/4',kind:'idea'}),{title:'First riff',bpm:112,musical_key:'Am',time_signature:'4/4',kind:'idea',status:'New Idea'});
  assert.equal(songInput({title:'Song',status:'Completed'}).status,'Completed');
});
for(const value of [{title:''},{title:'x',bpm:0},{title:'x',bpm:301},{title:'x',bpm:1.5},{title:'x',status:'Ready'},{title:'x',time_signature:'abc'},{title:'x',kind:'other'}])test('invalid song metadata is rejected '+JSON.stringify(value),()=>assert.throws(()=>songInput(value)));
test('message validation preserves line breaks and rejects empty and oversized input',()=>{assert.equal(messageInput('  hello\nagain  '),'hello\nagain');assert.throws(()=>messageInput('   '));assert.throws(()=>messageInput('x'.repeat(4001)))});
test('uploads accept explicit audio/document formats and safe size limits',()=>{assert.equal(uploadInput('riff.m4a','audio/mp4',1024,'audio').extension,'m4a');assert.equal(uploadInput('song.pdf','application/pdf',1024,'document').extension,'pdf');assert.throws(()=>uploadInput('evil.html','text/html',200,'document'));assert.throws(()=>uploadInput('fake.wav','text/html',200,'audio'));assert.throws(()=>uploadInput('huge.wav','audio/wav',26*1024*1024,'audio'));assert.throws(()=>uploadInput('empty.wav','audio/wav',0,'audio'))});
test('known songs link to legitimate sources without offering unauthorized downloads',()=>{const sources=externalSources('AC/DC','Back in Black');assert.equal(sources.length,3);assert.ok(sources.every(s=>s.url.startsWith('https://')&&!s.canDownload));assert.ok(sources[0].url.includes('AC%2FDC'))});
test('configuration rejects missing credentials and server secret keys',()=>{assert.equal(validateConfig('','').ready,false);assert.equal(validateConfig('https://test.supabase.co','sb_publishable_test').ready,true);assert.equal(validateConfig('http://bad','sb_publishable_test').ready,false);assert.equal(validateConfig('https://test.supabase.co','sb_secret_never_ship').ready,false)});
test('timestamps are safe for zero, minutes, and invalid duration',()=>{assert.equal(formatTime(74),'1:14');assert.equal(formatTime(NaN),'0:00');assert.equal(formatTime(-1),'0:00')});
test('known cover metadata does not invent an unknown tempo',()=>{assert.equal(songInput({title:'Known song',kind:'cover'}).bpm,null)});
