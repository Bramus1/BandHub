import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire,Module} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const React=require('react'),{create,act}=require('react-test-renderer'),{buildSync}=require('esbuild');
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
test('Home and Music can subscribe together; leaving one keeps the other live',async()=>{
 const channels=new Map<string,any>();let loads=0;
 (globalThis as any).__songTest={api:{songs:async()=>{loads++;return []}},supabase:{channel:(name:string)=>{
 if(channels.has(name))return channels.get(name);
 const c={subscribed:false,on(_event:any,_filter:any,callback:any){if(this.subscribed)throw Error('cannot add postgres_changes callbacks after subscribe()');(this as any).callback=callback;return this},subscribe(){this.subscribed=true;return this}};channels.set(name,c);return c;
 },removeChannel:async(c:any)=>{for(const [k,v] of channels)if(v===c)channels.delete(k)}}};
 const base=path.resolve('src/use-songs.ts');
 const result=buildSync({entryPoints:[base],bundle:true,write:false,format:'cjs',platform:'node',external:['react','./api','./supabase']});
 const m=new (Module as any)(base);m.filename=base;m.paths=(Module as any)._nodeModulePaths(path.dirname(base));m.require=(id:string)=>id==='./api'?{api:(globalThis as any).__songTest.api}:id==='./supabase'?{supabase:(globalThis as any).__songTest.supabase}:require(id);m._compile(result.outputFiles[0].text,base);
 function Screen(){m.exports.useSongs('same-band');return null}
 let home:any,music:any;
 try{
 await act(async()=>{home=create(React.createElement(Screen))});
 await act(async()=>{music=create(React.createElement(Screen))});
 assert.equal(channels.size,2);
 await act(async()=>home.unmount());assert.equal(channels.size,1);
 const before=loads;await act(async()=>{await [...channels.values()][0].callback()});assert.equal(loads,before+1);
 await act(async()=>music.unmount());assert.equal(channels.size,0);
 await act(async()=>{music=create(React.createElement(Screen))});assert.equal(channels.size,1);
 }finally{await act(async()=>{home?.unmount();music?.unmount()});delete (globalThis as any).__songTest}
});
