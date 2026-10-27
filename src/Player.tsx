import React,{useEffect,useState} from 'react';
import {Text,View,Pressable} from 'react-native';
import Slider from '@react-native-community/slider';
import {useAudioPlayer,useAudioPlayerStatus,setAudioModeAsync} from 'expo-audio';
import type {Recording,Comment} from './types';
import {api} from './api';
import {useAction} from './use-action';
import {formatTime} from './domain';
import {exportPrivateFile} from './files';
import {Card,Copy,Field,Button,Notice,colors,s} from './ui';
export function Player({recording}:{recording:Recording}){
 const player=useAudioPlayer(null,{updateInterval:250});const status=useAudioPlayerStatus(player);const [loaded,setLoaded]=useState(false),[text,setText]=useState(''),[comments,setComments]=useState<Comment[]>([]);const a=useAction();
 useEffect(()=>{let active=true;api.comments(recording.id).then(d=>{if(active)setComments(d)}).catch(()=>{});return()=>{active=false}},[recording.id]);
 async function load(){await setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:true});player.replace(await api.signedUrl(recording.storage_path));setLoaded(true)}
 return <Card><Text style={s.pill}>VERSION {recording.version}</Text><Text style={s.cardTitle}>{recording.name}</Text><Copy>{(recording.size/1024/1024).toFixed(1)} MB · {new Date(recording.created_at).toLocaleDateString()}</Copy><Notice text={a.error||status.error||''} error/>
 {!loaded?<Button title="Load recording" disabled={a.busy} onPress={()=>a.run(load)}/>:<><Copy>{status.isBuffering?'Buffering…':!status.isLoaded?'Loading audio…':`${formatTime(status.currentTime)} / ${formatTime(status.duration)}`}</Copy><Slider accessibilityLabel="Playback position" minimumValue={0} maximumValue={Math.max(status.duration||0,1)} value={status.currentTime||0} minimumTrackTintColor={colors.accent} maximumTrackTintColor={colors.line} thumbTintColor={colors.accent} disabled={!status.isLoaded} onSlidingComplete={value=>a.run(async()=>{await player.seekTo(value)})}/><View style={s.row}><Button title={status.playing?'Pause':'Play'} disabled={!status.isLoaded} onPress={()=>a.run(async()=>{if(status.playing)player.pause();else{if(status.didJustFinish)await player.seekTo(0);player.play()}})}/><Button title={status.loop?'Repeat on':'Repeat off'} secondary onPress={()=>{player.loop=!player.loop}}/>{[.75,1,1.25].map(rate=><Button key={rate} title={`${rate}×`} secondary={status.playbackRate!==rate} onPress={()=>a.run(async()=>player.setPlaybackRate(rate))}/>)}</View><Button secondary title="Reload audio / renew access" disabled={a.busy} onPress={()=>a.run(load)}/></>}
 <Button title="Download authorized recording" secondary disabled={a.busy} onPress={()=>a.run(async()=>{await exportPrivateFile(await api.signedUrl(recording.storage_path),recording.name)})}/>
 <Text style={s.label}>Notes on this take</Text>{comments.map(c=><Pressable accessibilityRole="button" accessibilityLabel={`Jump to ${formatTime(Number(c.at_seconds))}`} key={c.id} disabled={!status.isLoaded} onPress={()=>a.run(async()=>{await player.seekTo(Number(c.at_seconds));player.play()})}><Copy>{formatTime(Number(c.at_seconds))} — {c.body}</Copy></Pressable>)}
 <Field label={`Comment at ${formatTime(status.currentTime||0)}`} multiline value={text} onChangeText={setText} maxLength={4000}/><Button title="Add timestamped comment" disabled={a.busy||!text.trim()||!status.isLoaded} onPress={()=>a.run(async()=>{await api.comment(recording.band_id,recording.id,text,Math.floor(status.currentTime||0));setText('');setComments(await api.comments(recording.id))})}/>
 </Card>
}
