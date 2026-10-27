import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startLoopTake} from '../src/loop-take.ts';
function fixture(allowed=true,fail=false){const calls:string[]=[];return {calls,io:{permission:async()=>allowed,mode:async(recording:boolean)=>{calls.push(recording?'record mode':'play mode')},prepare:async()=>{calls.push('prepare')},seek:async()=>{calls.push('seek')},record:()=>{calls.push('record')},play:()=>{calls.push('play');if(fail)throw Error('audio focus failed')},pause:()=>{calls.push('pause')},stop:async()=>{calls.push('stop')}}}}
test('loop take prepares recording and seeks before starting both streams',async()=>{const {calls,io}=fixture();await startLoopTake(io);assert.deepEqual(calls,['pause','record mode','prepare','seek','record','play'])});
test('denied microphone permission never starts recording or playback',async()=>{const {calls,io}=fixture(false);await assert.rejects(startLoopTake(io),/Microphone/);assert.deepEqual(calls,['pause'])});
test('guide playback failure stops recording and restores playback mode',async()=>{const {calls,io}=fixture(true,true);await assert.rejects(startLoopTake(io),/audio focus/);assert.deepEqual(calls.slice(-3),['pause','stop','play mode'])});
