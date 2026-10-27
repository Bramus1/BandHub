export const statuses=['New Idea','In Development','Ready for Rehearsal','Completed','Archived'] as const;
export type Status=typeof statuses[number];
export type Role='owner'|'admin'|'member';
export function required(value:unknown,label:string,max=120):string {
  if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new Error(`${label} must contain 1–${max} characters.`);
  return value.trim();
}
export function songInput(input:Record<string,unknown>){
  const title=required(input.title,'Title');
  const bpm=input.kind==='cover'&&input.bpm==null?null:Number(input.bpm??120);
  if(bpm!==null&&(!Number.isInteger(bpm)||bpm<1||bpm>300))throw new Error('BPM must be a whole number from 1 to 300.');
  const status=input.status??'New Idea';
  if(!statuses.includes(status as Status))throw new Error('Choose a valid song status.');
  const kind=input.kind??'song';if(!['idea','song','cover'].includes(String(kind)))throw new Error('Choose a song type.');
  const signature=String(input.time_signature??'4/4');
  if(!/^(?:[1-9]|1[0-6])\/(?:2|4|8|16)$/.test(signature))throw new Error('Use a time signature such as 4/4 or 6/8.');
  return {title,bpm,musical_key:String(input.musical_key??'').trim().slice(0,20),time_signature:signature,kind:kind as 'idea'|'song'|'cover',status:status as Status};
}
export const messageInput=(value:unknown)=>required(value,'Message',4000);
const audioTypes:Record<string,string[]>={mp3:['audio/mpeg'],wav:['audio/wav','audio/x-wav','audio/wave'],m4a:['audio/mp4','audio/x-m4a'],webm:['audio/webm']};
const documentTypes:Record<string,string[]>={pdf:['application/pdf'],txt:['text/plain']};
export function uploadInput(name:string,mime:string,size:number,kind:'audio'|'document'){
  const extension=name.split('.').pop()?.toLowerCase()??'';
  const formats=kind==='audio'?audioTypes:documentTypes;
  if(!formats[extension]?.includes(mime.split(';')[0]))throw new Error(kind==='audio'?'Choose MP3, WAV, M4A or WebM audio.':'Choose a PDF or text document.');
  if(!Number.isFinite(size)||size<=0||size>25*1024*1024)throw new Error('Files must be between 1 byte and 25 MB.');
  return {extension,mime:mime.split(';')[0],size,name:required(name,'File name',200)};
}
export function externalSources(artist:string,title:string){
  const q=encodeURIComponent(`${artist} ${title}`.trim());
  return [
    {label:'Lyrics on Genius',url:`https://genius.com/search?q=${q}`,canDownload:false},
    {label:'Tabs on Ultimate Guitar',url:`https://www.ultimate-guitar.com/search.php?search_type=title&value=${q}`,canDownload:false},
    {label:'Tabs on Songsterr',url:`https://www.songsterr.com/?pattern=${q}`,canDownload:false}
  ];
}
export function validateConfig(url:string|undefined,key:string|undefined){
  if(!url||!key)return {ready:false,reason:'Supabase is not connected. Follow the setup guide to enable your private workspace.'};
  let valid=false;try{valid=new URL(url).protocol==='https:'}catch{}
  if(!valid||key.startsWith('sb_secret_'))return {ready:false,reason:'Use an HTTPS Supabase URL and a publishable key. Never use a server secret.'};
  if(key.startsWith('eyJ')) {
    try{const payload=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(payload.role!=='anon')return {ready:false,reason:'Only a publishable or anon key belongs in the app.'}}catch{return {ready:false,reason:'Invalid anon key.'}}
  }else if(!key.startsWith('sb_publishable_'))return {ready:false,reason:'Use a Supabase publishable key.'};
  return {ready:true,reason:''};
}
export const formatTime=(seconds:number)=>{const n=Number.isFinite(seconds)?Math.max(0,Math.floor(seconds)):0;return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`};
