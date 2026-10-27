import {useEffect,useState,useCallback} from 'react';
import {api} from './api';
import {supabase} from './supabase';
import type {Song} from './types';
// Each mounted screen owns its channel; Supabase reuses channels with equal names.
let subscriptionId=0;
export function useSongs(bandId?:string){const [songs,setSongs]=useState<Song[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const refresh=useCallback(async()=>{if(!bandId)return;setError('');setSongs(await api.songs(bandId))},[bandId]);
 useEffect(()=>{setSongs([]);if(!bandId||!supabase)return;let alive=true;setLoading(true);const load=()=>api.songs(bandId).then(data=>{if(alive){setSongs(data);setError('')}}).catch(e=>{if(alive)setError(e.message)}).finally(()=>{if(alive)setLoading(false)});load();const channel=supabase.channel('songs-'+bandId+'-'+(++subscriptionId)).on('postgres_changes',{event:'*',schema:'public',table:'songs',filter:'band_id=eq.'+bandId},load).subscribe(status=>{if(status==='CHANNEL_ERROR'&&alive)setError('Live updates disconnected. Tap Refresh to retry.')});return()=>{alive=false;void supabase?.removeChannel(channel)}},[bandId]);
 return {songs,error,loading,refresh};
}

