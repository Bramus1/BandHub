export type KnownSong={id:string;title:string;artist:string;album:string;durationSeconds:number|null;sourceUrl:string};
type MBRecording={id:string;title:string;length?:number;'artist-credit'?:{name:string}[];releases?:{title:string}[]};
export async function searchKnownSongs(artist:string,title:string,fetcher:typeof fetch=fetch):Promise<KnownSong[]>{
  const clean=(s:string)=>s.trim().slice(0,160).replace(/[\\"+\-!(){}\[\]^~*?:/]/g,' ');
  if(!artist.trim()&&!title.trim())throw new Error('Enter an artist or title.');
  const query=[title.trim()?`recording:"${clean(title)}"`:'',artist.trim()?`artist:"${clean(artist)}"`:''].filter(Boolean).join(' AND ');
  const response=await fetcher(`https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=12`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(response.status===429||response.status===503)throw new Error('The music provider is busy. Please wait a moment and try again.');
  if(!response.ok)throw new Error('Music search is unavailable. Try again later or use the source links.');
  const data=await response.json();
  if(!Array.isArray(data.recordings))throw new Error('The music provider returned an invalid response.');
  return data.recordings.filter((r:MBRecording)=>r.id&&r.title).map((r:MBRecording)=>({id:r.id,title:r.title,artist:r['artist-credit']?.map(a=>a.name).join(', ')||'Unknown artist',album:r.releases?.[0]?.title||'',durationSeconds:typeof r.length==='number'?Math.round(r.length/1000):null,sourceUrl:`https://musicbrainz.org/recording/${encodeURIComponent(r.id)}`}));
}
