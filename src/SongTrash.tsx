import React,{useState} from 'react';
import {useWorkspace} from './context';
import {api} from './api';
import type {Song} from './types';
import {useAction} from './use-action';
import {Card,Copy,Button,Notice} from './ui';
export function SongTrash({song,onChanged,disabled=false}:{song:Song;onChanged:()=>Promise<void>|void;disabled?:boolean}){
 const {session,memberships}=useWorkspace(),a=useAction();const [confirm,setConfirm]=useState(false);
 const member=memberships.find(m=>m.band_id===song.band_id&&m.user_id===session?.user.id);
 if(!member||!(song.created_by===session?.user.id||['owner','admin'].includes(member.role)))return null;
 return <Card><Notice text={a.error} error/>{confirm?<><Copy>Move “{song.title}” to trash? It will leave the library. Recordings, lyrics, and discussion are preserved for restoration.</Copy><Button title="Confirm move to trash" disabled={a.busy||disabled} onPress={()=>a.run(async()=>{await api.setTrashed(song.id,true);setConfirm(false);await onChanged()})}/><Button secondary title="Cancel" disabled={a.busy} onPress={()=>setConfirm(false)}/></>:<Button secondary title={song.deleted_at?'Restore song':'Move to trash'} disabled={a.busy||disabled} onPress={()=>song.deleted_at?a.run(async()=>{await api.setTrashed(song.id,false);await onChanged()}):setConfirm(true)}/>}</Card>
}
