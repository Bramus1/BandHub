import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
// Read production migration before importing the test engine: an absent migration is the intended RED signal.
const migration=readFileSync(new NodeURL('../supabase/migrations/202610220001_core.sql',import.meta.url),'utf8');
const {PGlite}=await import('@electric-sql/pglite');
const db=new PGlite();
const A='10000000-0000-4000-8000-000000000001', B='10000000-0000-4000-8000-000000000002', C='10000000-0000-4000-8000-000000000003';
let bandA:string,bandB:string,songA:string;
async function as(user:string,sql:string,params:unknown[]=[]){await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${user}',false);`);try{return await db.query<Record<string,unknown>>(sql,params)}finally{await db.exec('RESET ROLE')}}
before(async()=>{
 await db.exec(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE SCHEMA auth; CREATE SCHEMA storage; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,bucket_id text,name text,owner_id text,metadata jsonb); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; GRANT USAGE ON SCHEMA auth,storage TO authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO authenticated;`);
 await db.exec(migration);
 await db.exec(readFileSync(new NodeURL('../supabase/migrations/202610230002_song_trash.sql',import.meta.url),'utf8'));
 await db.exec(readFileSync(new NodeURL('../supabase/migrations/202610230001_calendar.sql',import.meta.url),'utf8'));
 await db.query('INSERT INTO auth.users VALUES ($1,$2,now()),($3,$4,now()),($5,$6,now())',[A,'a@band.test',B,'b@band.test',C,'c@band.test']);
 bandA=(await as(A,`select public.create_band('Band A','Rock','Private A') as id`)).rows[0].id as string;
 bandB=(await as(B,`select public.create_band('Band B','Jazz','Private B') as id`)).rows[0].id as string;
 songA=(await as(A,`insert into public.songs(band_id,title,created_by) values ($1,'First riff',$2) returning id`,[bandA,A])).rows[0].id as string;
});
after(()=>db.close());
test('band owner is created atomically and unrelated bands are invisible',async()=>{const a=await as(A,'select * from public.bands');assert.equal(a.rows.length,1);assert.equal(a.rows[0].name,'Band A');assert.equal((await as(A,'select role from public.memberships')).rows[0].role,'owner')});
test('Band B cannot read or update Band A projects',async()=>{assert.equal((await as(B,'select * from public.songs where id=$1',[songA])).rows.length,0);assert.equal((await as(B,"update public.songs set title='stolen' where id=$1 returning id",[songA])).rows.length,0)});
test('Band B cannot insert content in Band A',async()=>{await assert.rejects(as(B,'insert into public.songs(band_id,title,created_by) values ($1,$2,$3)',[bandA,'intrusion',B]));await assert.rejects(as(B,'insert into public.messages(band_id,author_id,body) values ($1,$2,$3)',[bandA,B,'intrusion']))});
test('membership self-promotion and self-joining are denied',async()=>{await assert.rejects(as(B,'insert into public.memberships(band_id,user_id,role) values ($1,$2,$3)',[bandA,B,'owner']));await assert.rejects(as(B,"update public.memberships set role='owner' where band_id=$1",[bandA]))});
test('invites are email-bound, single-use and permit shared band access',async()=>{const token=(await as(A,"select public.create_invite($1,'c@band.test','member') as token",[bandA])).rows[0].token as string;await assert.rejects(as(B,'select public.accept_invite($1)',[token]));await as(C,'select public.accept_invite($1)',[token]);assert.equal((await as(C,'select * from public.songs')).rows.length,1);await assert.rejects(as(C,'select public.accept_invite($1)',[token]));await assert.rejects(as(C,"select public.create_invite($1,'b@band.test','admin')",[bandA]));});
test('message author cannot be spoofed and cross-band song references are rejected',async()=>{await assert.rejects(as(C,'insert into public.messages(band_id,author_id,body) values ($1,$2,$3)',[bandA,A,'spoof']));await assert.rejects(as(B,'insert into public.messages(band_id,author_id,body,song_id) values ($1,$2,$3,$4)',[bandB,B,'wrong song',songA]));await as(C,'insert into public.messages(band_id,author_id,body) values ($1,$2,$3)',[bandA,C,'hello band']);assert.equal((await as(B,'select * from public.messages')).rows.length,0)});
test('private storage reads and writes require matching membership and uploader path',async()=>{const key=`${bandA}/${A}/${songA}/take.wav`;await as(A,"insert into storage.objects(bucket_id,name,owner_id) values ('band-files',$1,$2)",[key,A]);assert.equal((await as(B,'select * from storage.objects')).rows.length,0);await assert.rejects(as(B,"insert into storage.objects(bucket_id,name,owner_id) values ('band-files',$1,$2)",[key,B]));assert.equal((await as(C,'select * from storage.objects')).rows.length,1)});
test('recording versions append and reject nonexistent objects',async()=>{const key=`${bandA}/${A}/${songA}/take.wav`;await as(A,'select public.add_recording($1,$2,$3,$4,$5)',[songA,key,'Riff v1','audio/wav',500]);await assert.rejects(as(A,'select public.add_recording($1,$2,$3,$4,$5)',[songA,key+'missing','bad','audio/wav',500]));const key2=`${bandA}/${A}/${songA}/take2.wav`;await as(A,"insert into storage.objects(bucket_id,name,owner_id) values ('band-files',$1,$2)",[key2,A]);await as(A,'select public.add_recording($1,$2,$3,$4,$5)',[songA,key2,'Riff v2','audio/wav',500]);assert.deepEqual((await as(A,'select version from public.recordings order by version')).rows.map(r=>r.version),[1,2]);await assert.rejects(as(A,'update public.recordings set version=9'));});
test('timestamp comments cannot target recordings outside the band',async()=>{const rec=(await as(A,'select id from public.recordings limit 1')).rows[0].id;await assert.rejects(as(B,'insert into public.comments(band_id,recording_id,author_id,body,at_seconds) values ($1,$2,$3,$4,14)',[bandB,rec,B,'outside']));await as(C,'insert into public.comments(band_id,recording_id,author_id,body,at_seconds) values ($1,$2,$3,$4,14)',[bandA,rec,C,'Drums here']);});
test('removed members lose read access immediately',async()=>{await as(A,'select public.remove_member($1,$2)',[bandA,C]);assert.equal((await as(C,'select * from public.songs')).rows.length,0);assert.equal((await as(C,'select * from storage.objects')).rows.length,0)});
test('owner cannot be removed and band ids cannot be reassigned',async()=>{await assert.rejects(as(A,'select public.remove_member($1,$2)',[bandA,A]));await assert.rejects(as(A,'update public.songs set band_id=$1 where id=$2',[bandB,songA]))});

test('calendar events are private and prevent spoofed authors',async()=>{const e=(await as(A,"insert into public.calendar_events(band_id,title,starts_at,ends_at,created_by) values ($1,'Rehearsal',now(),now()+interval '1 hour',$2) returning id",[bandA,A])).rows[0].id;assert.equal((await as(B,'select * from public.calendar_events')).rows.length,0);await assert.rejects(as(B,"insert into public.calendar_events(band_id,title,starts_at,ends_at,created_by) values ($1,'Intrusion',now(),now()+interval '1 hour',$2)",[bandA,B]));await assert.rejects(as(A,"insert into public.calendar_events(band_id,title,starts_at,ends_at,created_by) values ($1,'Spoof',now(),now()+interval '1 hour',$2)",[bandA,B]));await as(A,'delete from public.calendar_events where id=$1',[e]);assert.equal((await as(A,'select * from public.calendar_events')).rows.length,0)});

test('trash preserves takes, supports restore and enforces creator or manager permissions',async()=>{
 await db.query("insert into public.memberships(band_id,user_id,role) values ($1,$2,'member')",[bandA,C]);
 await assert.rejects(as(B,'select public.set_song_trashed($1,true)',[songA]));
 await assert.rejects(as(C,'select public.set_song_trashed($1,true)',[songA]));
 await as(A,'select public.set_song_trashed($1,true)',[songA]);
 assert.equal((await as(A,'select id from public.songs where deleted_at is null and id=$1',[songA])).rows.length,0);
 assert.equal((await as(A,'select * from public.recordings where song_id=$1',[songA])).rows.length,2);
 await assert.rejects(as(C,'update public.songs set deleted_at=null where id=$1',[songA]));
 await assert.rejects(as(C,"insert into public.songs(band_id,title,deleted_at) values ($1,'Hidden',now())",[bandA]));
 await as(A,'select public.set_song_trashed($1,false)',[songA]);
 assert.equal((await as(A,'select id from public.songs where deleted_at is null and id=$1',[songA])).rows.length,1);
 const own=(await as(C,"insert into public.songs(band_id,title) values ($1,'My idea') returning id",[bandA])).rows[0].id;
 await as(C,'select public.set_song_trashed($1,true)',[own]);
 await as(A,'select public.set_song_trashed($1,false)',[own]);
 await as(A,"select public.change_member_role($1,$2,'admin')",[bandA,C]);
 await as(C,'select public.set_song_trashed($1,true)',[songA]);
 await as(C,'select public.set_song_trashed($1,false)',[songA]);
 assert.equal((await db.query<{allowed:boolean}>("select has_function_privilege('anon','public.set_song_trashed(uuid,boolean)','EXECUTE') as allowed")).rows[0].allowed,false);
});


