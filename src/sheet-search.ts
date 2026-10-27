export type SongSheet={id:number;title:string;artist:string;album:string;lyrics:string;instrumental:boolean};
let retryAt=0;
export async function searchSheets(artist:string,title:string,fetcher:typeof fetch=fetch):Promise<SongSheet[]>{
 if(!artist.trim()&&!title.trim())throw Error('Enter an artist or song title.');
 if(Date.now()<retryAt)throw Error('The lyrics provider is busy. Please try again later.');
 const params=new URLSearchParams();
 if(title.trim()){params.set('track_name',title.trim().slice(0,160));if(artist.trim())params.set('artist_name',artist.trim().slice(0,160))}else params.set('q',artist.trim().slice(0,160));
 const response=await fetcher('https://lrclib.net/api/search?'+params,{headers:{Accept:'application/json','Lrclib-Client':'BandHub/0.2.0 (https://expo.dev/accounts/giuliano_taurone)'},signal:AbortSignal.timeout(15000)});
 if(response.status===429||response.status===503){const raw=response.headers.get('Retry-After');const seconds=raw?Number(raw):0;retryAt=Date.now()+(Number.isFinite(seconds)?Math.max(0,seconds)*1000:Math.max(0,Date.parse(raw!)-Date.now()));throw Error('The lyrics provider is busy. Please try again later.')}
 if(!response.ok)throw Error('Lyrics search is unavailable. Please try again later.');
 const data:unknown=await response.json();if(!Array.isArray(data))throw Error('The lyrics provider returned an invalid response.');
 return data.filter(r=>typeof r.id==='number'&&typeof r.trackName==='string'&&typeof r.artistName==='string').slice(0,20).map(r=>({id:r.id,title:r.trackName,artist:r.artistName,album:typeof r.albumName==='string'?r.albumName:'',lyrics:typeof r.plainLyrics==='string'?r.plainLyrics:'',instrumental:r.instrumental===true}));
}
