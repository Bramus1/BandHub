import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequestGuard} from '../src/request-guard.ts';
test('a sign-out or account change invalidates pending workspace responses',()=>{const guard=createRequestGuard();const old=guard.begin();guard.invalidate();assert.equal(old(),false);assert.equal(guard.begin()(),true)});
test('the most recent workspace refresh wins when responses arrive out of order',()=>{const guard=createRequestGuard();const first=guard.begin();const second=guard.begin();assert.equal(first(),false);assert.equal(second(),true)});
