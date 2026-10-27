import React,{useEffect,useState} from 'react';
import {router} from 'expo-router';
import {useWorkspace} from '../src/context';
import {api} from '../src/api';
import type {Song} from '../src/types';
import {SongTrash} from '../src/SongTrash';
import {useAction} from '../src/use-action';
import {Screen,Heading,Copy,Button,Notice,Card} from '../src/ui';
export default function Trash(){
 const {band,session}=useWorkspace(),a=useAction();const [songs,setSongs]=useState<Song[]>([]);
 async function refresh(){setSongs(band?await api.trash(band.id):[])}
 useEffect(()=>{let active=true;setSongs([]);if(band)a.run(async()=>{const rows=await api.trash(band.id);if(active)setSongs(rows)});return()=>{active=false}},[band?.id,session?.user.id]);
 return <Screen><Button secondary title="Back" onPress={()=>router.canGoBack()?router.back():router.replace('/(tabs)/home')}/><Heading title="Song trash" subtitle={band?.name??'Choose a band first.'}/><Copy>Creators and band administrators can restore songs. Saved files are preserved.</Copy><Notice text={a.error} error/><Button secondary title="Refresh trash" disabled={!band||a.busy} onPress={()=>a.run(refresh)}/>{songs.map(song=><Card key={song.id}><Heading title={song.title}/><SongTrash song={song} onChanged={refresh}/></Card>)}{!a.busy&&!songs.length&&<Copy>No songs in trash.</Copy>}</Screen>
}
