import React from 'react';
import {router,useLocalSearchParams} from 'expo-router';
import {useWorkspace} from '../src/context';
import {client} from '../src/supabase';
import {result} from '../src/api';
import {useAction} from '../src/use-action';
import {Screen,Heading,Card,Copy,Button,Notice} from '../src/ui';
export default function Invite(){const {token}=useLocalSearchParams<{token:string}>();const w=useWorkspace(),a=useAction();return <Screen><Heading title="Your band is waiting."/><Card><Copy>Accept this invitation with the verified email address it was sent to. If you need to sign in first, reopen the invitation afterward.</Copy><Notice text={a.error} error/>{w.session?<Button title="Accept invitation" disabled={a.busy||!token} onPress={()=>a.run(async()=>{const id=await result(client().rpc('accept_invite',{invite_token:token}));await w.refresh();w.selectBand(String(id));router.replace('/(tabs)/home')})}/>:<Button title="Go to sign in" onPress={()=>router.push('/auth')}/>}</Card></Screen>}
