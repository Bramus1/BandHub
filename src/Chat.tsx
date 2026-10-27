import React,{useEffect,useState,useCallback} from 'react';
import {Text} from 'react-native';
import {api} from './api';
import {supabase} from './supabase';
import {useWorkspace} from './context';
import {useAction} from './use-action';
import type {Message} from './types';
import {Card,Copy,Field,Button,Notice,Empty,s} from './ui';
export function Chat({bandId,songId}:{bandId:string;songId?:string}){const {profiles}=useWorkspace();const [messages,setMessages]=useState<Message[]>([]),[text,setText]=useState(''),[error,setError]=useState(''),[live,setLive]=useState(false);const a=useAction();const reload=useCallback(async()=>setMessages(await api.messages(bandId,songId)),[bandId,songId]);
 useEffect(()=>{let active=true;setMessages([]);const load=()=>api.messages(bandId,songId).then(d=>{if(active)setMessages(d)}).catch(e=>{if(active)setError(e.message)});load();const channel=supabase?.channel(`chat-${bandId}-${songId??'general'}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`band_id=eq.${bandId}`},load).subscribe(status=>{if(active)setLive(status==='SUBSCRIBED')});return()=>{active=false;if(channel)void supabase?.removeChannel(channel)}},[bandId,songId]);
 return <><Copy>{live?'● Live updates connected':'Connecting live updates… You can refresh manually.'}</Copy><Notice text={error||a.error} error/>
 {messages.length?messages.map(m=><Card key={m.id}><Text style={s.label}>{profiles.find(p=>p.id===m.author_id)?.display_name||'Band member'}</Text><Text style={{color:'#f3f4f1',fontSize:15,lineHeight:23}}>{m.body}</Text><Text style={s.small}>{new Date(m.created_at).toLocaleString()}</Text></Card>):<Empty title="Start the conversation" body={songId?'Keep arrangement notes and song discussion here.':'Share an idea, plan the next session, or just say hello.'}/>}
 <Card><Field label="Message" multiline value={text} onChangeText={setText} maxLength={4000} placeholder="What’s on your mind?"/><Button title={a.busy?'Sending…':'Send message'} disabled={a.busy||!text.trim()} onPress={()=>a.run(async()=>{await api.send(bandId,text,songId);setText('');await reload()})}/><Button secondary title="Refresh messages" disabled={a.busy} onPress={()=>a.run(reload)}/></Card>
 </>}
