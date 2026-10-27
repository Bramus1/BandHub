import React,{createContext,useContext,useEffect,useState,useCallback,useRef} from 'react';
import {AppState,Platform} from 'react-native';
import * as Linking from 'expo-linking';
import type {Session} from '@supabase/supabase-js';
import {supabase} from './supabase';
import {api} from './api';
import {createRequestGuard} from './request-guard';
import type {Band,Membership,Profile} from './types';
type Workspace={session:Session|null;loading:boolean;error:string;bands:Band[];band:Band|null;memberships:Membership[];profiles:Profile[];selectBand:(id:string)=>void;refresh:()=>Promise<void>;recovery:boolean;finishRecovery:()=>void};
const Context=createContext<Workspace|null>(null);
export const useWorkspace=()=>{const c=useContext(Context);if(!c)throw Error('Workspace context is missing');return c};
export function WorkspaceProvider({children}:React.PropsWithChildren){
 const [session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[bands,setBands]=useState<Band[]>([]),[memberships,setMemberships]=useState<Membership[]>([]),[profiles,setProfiles]=useState<Profile[]>([]),[bandId,setBandId]=useState(''),[recovery,setRecovery]=useState(false);
 const guard=useRef(createRequestGuard()); const userId=useRef<string|null>(null);
 const refresh=useCallback(async()=>{if(!supabase||!userId.current)return;const current=guard.current.begin();const [b,m,p]=await Promise.all([api.bands(),api.memberships(),api.profiles()]);if(!current())return;setBands(b);setMemberships(m);setProfiles(p);setBandId(current=>b.some(x=>x.id===current)?current:b[0]?.id??'')},[]);
 useEffect(()=>{
  if(!supabase){setLoading(false);return}
  let live=true;
  supabase.auth.getSession().then(({data,error})=>{if(!live)return;if(error)setError(error.message);userId.current=data.session?.user.id??null;setSession(data.session);setLoading(false)}).catch(e=>{if(live){setError(e.message);setLoading(false)}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,current)=>{if(userId.current!==(current?.user.id??null)){guard.current.invalidate();userId.current=current?.user.id??null;setBands([]);setMemberships([]);setProfiles([]);setBandId('' )}setSession(current);if(event==='PASSWORD_RECOVERY')setRecovery(true)});
  const state=AppState.addEventListener('change',state=>{if(state==='active')supabase!.auth.startAutoRefresh();else supabase!.auth.stopAutoRefresh()});
  if(AppState.currentState==='active')supabase.auth.startAutoRefresh();
  const callback=async(url:string)=>{try{if(Platform.OS==='web')return;const expected=Linking.createURL('auth/callback');if(url.split(/[?#]/)[0]!==expected)return;const params=new URLSearchParams(url.split('#')[1]||url.split('?')[1]||'');const access_token=params.get('access_token'),refresh_token=params.get('refresh_token');if(access_token&&refresh_token){const {error}=await supabase!.auth.setSession({access_token,refresh_token});if(error)throw error;if(params.get('type')==='recovery')setRecovery(true)}}catch(e){setError((e as Error).message)}};
  Linking.getInitialURL().then(url=>{if(url)return callback(url)});const links=Linking.addEventListener('url',({url})=>callback(url));
  return()=>{live=false;guard.current.invalidate();subscription.unsubscribe();state.remove();links.remove();supabase?.auth.stopAutoRefresh()};
 },[]);
 useEffect(()=>{setBands([]);setMemberships([]);setProfiles([]);setBandId('');if(session)refresh().catch(e=>setError(e.message))},[session?.user.id,refresh]);
 return <Context.Provider value={{session,loading,error,bands,band:bands.find(b=>b.id===bandId)??null,memberships,profiles,selectBand:setBandId,refresh,recovery,finishRecovery:()=>setRecovery(false)}}>{children}</Context.Provider>
}

