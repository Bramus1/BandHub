import {client} from './supabase';
import {randomUUID} from 'expo-crypto';
import {songInput,messageInput,uploadInput} from './domain';
import type {Song,Recording,Document,Message,Comment,Band,Membership,Profile} from './types';
export async function result<T>(request:PromiseLike<{data:T;error:unknown}>):Promise<NonNullable<T>>{const {data,error}=await request;if(error)throw error;return data!}
export const api={
  bands:()=>result(client().from('bands').select('*').order('created_at')).then(d=>d as Band[]),
  memberships:()=>result(client().from('memberships').select('*')).then(d=>d as Membership[]),
  profiles:()=>result(client().from('profiles').select('*')).then(d=>d as Profile[]),
  createBand:(name:string,genre:string,description:string)=>result(client().rpc('create_band',{band_name:name,band_genre:genre,band_description:description})),
  songs:(band:string)=>result(client().from('songs').select('*').eq('band_id',band).is('deleted_at',null).order('updated_at',{ascending:false})).then(d=>d as Song[]),
  trash:(band:string)=>result(client().from('songs').select('*').eq('band_id',band).not('deleted_at','is',null).order('deleted_at',{ascending:false})).then(d=>d as Song[]),
  setTrashed:(id:string,trashed:boolean)=>result(client().rpc('set_song_trashed',{target_song:id,trashed})),
  song:(id:string)=>result(client().from('songs').select('*').eq('id',id).single()).then(d=>d as Song),
  createSong:(band:string,input:Record<string,unknown>)=>result(client().from('songs').insert({...songInput(input),band_id:band,artist:input.artist??''}).select().single()).then(d=>d as Song),
  createSheet:(band:string,title:string,artist:string,lyrics:string,tabs:string)=>result(client().from('songs').insert({...songInput({title,kind:'cover'}),band_id:band,artist,lyrics,tabs}).select().single()).then(d=>d as Song),
  saveSong:(id:string,patch:Partial<Pick<Song,'lyrics'|'chords'|'tabs'|'status'|'kind'|'description'>>)=>result(client().from('songs').update(patch).eq('id',id).select().single()).then(d=>d as Song),
  recordings:(id:string)=>result(client().from('recordings').select('*').eq('song_id',id).order('version',{ascending:false})).then(d=>d as Recording[]),
  documents:(id:string)=>result(client().from('documents').select('*').eq('song_id',id)).then(d=>d as Document[]),
  comments:(id:string)=>result(client().from('comments').select('*').eq('recording_id',id).order('at_seconds')).then(d=>d as Comment[]),
  comment:(band:string,recording:string,body:string,at_seconds:number)=>result(client().from('comments').insert({band_id:band,recording_id:recording,body:messageInput(body),at_seconds})),
  messages:(band:string,song?:string)=>{let q=client().from('messages').select('*').eq('band_id',band);q=song?q.eq('song_id',song):q.is('song_id',null);return result(q.order('created_at',{ascending:false}).limit(100)).then(d=>(d as Message[]).reverse())},
  send:(band:string,body:string,song?:string)=>result(client().from('messages').insert({band_id:band,song_id:song??null,body:messageInput(body)})),
  signedUrl:async(path:string)=>{const d=await result(client().storage.from('band-files').createSignedUrl(path,60));return d.signedUrl},
};
export async function uploadFile(song:Song,name:string,mime:string,bytes:ArrayBuffer,kind:'audio'|'document',rights:'owned'|'authorized'='owned'){
  const file=uploadInput(name,mime,bytes.byteLength,kind);
  const {data:{user},error}=await client().auth.getUser();if(error||!user)throw new Error('Sign in to upload files.');
  // Random file names plus upsert:false make recording uploads append-only.
  const path=`${song.band_id}/${user.id}/${song.id}/${randomUUID()}.${file.extension}`;
  await result(client().storage.from('band-files').upload(path,bytes,{contentType:file.mime,upsert:false}));
  try{
    if(kind==='audio')await result(client().rpc('add_recording',{target_song:song.id,object_path:path,file_name:file.name,file_mime:file.mime,file_size:file.size}));
    else await result(client().from('documents').insert({song_id:song.id,band_id:song.band_id,name:file.name,storage_path:path,mime:file.mime,size:file.size,rights}));
  }catch(error){await client().storage.from('band-files').remove([path]);throw error}
}


