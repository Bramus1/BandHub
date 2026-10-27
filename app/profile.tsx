import React,{useState} from 'react';
import {router} from 'expo-router';
import {useWorkspace} from '../src/context';
import {client} from '../src/supabase';
import {result} from '../src/api';
import {useAction} from '../src/use-action';
import {Screen,Heading,Card,Field,Button,Notice} from '../src/ui';
export default function Profile(){const w=useWorkspace();const profile=w.profiles.find(p=>p.id===w.session?.user.id);const [name,setName]=useState(profile?.display_name??''),[main,setMain]=useState(profile?.main_instrument??''),[extra,setExtra]=useState(profile?.additional_instruments.join(', ')??''),[bio,setBio]=useState(profile?.biography??'');const a=useAction();return <Screen><Button title="Back" secondary onPress={()=>router.back()}/><Heading title="Who’s making the music?"/><Card><Field label="Display name" value={name} onChangeText={setName} maxLength={80}/><Field label="Main instrument" value={main} onChangeText={setMain} maxLength={80}/><Field label="Other instruments (comma-separated)" value={extra} onChangeText={setExtra} maxLength={200}/><Field label="Biography" multiline value={bio} onChangeText={setBio} maxLength={1000}/><Notice text={a.error} error/><Notice text={a.notice}/><Button title="Save profile" disabled={a.busy||!w.session||!name.trim()} onPress={()=>a.run(async()=>{await result(client().from('profiles').upsert({id:w.session!.user.id,display_name:name.trim(),main_instrument:main.trim(),additional_instruments:extra.split(',').map(s=>s.trim()).filter(Boolean),biography:bio}));await w.refresh();a.setNotice('Profile saved.')})}/></Card></Screen>}
