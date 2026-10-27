import React,{useState} from 'react';
import {Text,Platform} from 'react-native';
import {useAudioPlayer,useAudioPlayerStatus,useAudioRecorder,useAudioRecorderState,RecordingPresets,requestRecordingPermissionsAsync,setAudioModeAsync} from 'expo-audio';
import type {Song,Recording} from './types';
import {api,uploadFile} from './api';
import {partName} from './planning';
import {startLoopTake} from './loop-take';
import {readLocalFile} from './files';
import {useAction} from './use-action';
import {Card,Copy,Field,Button,Notice,s} from './ui';
export function LayerRecorder({song,recordings,onSaved}:{song:Song;recordings:Recording[];onSaved:()=>Promise<void>}){
 const guide=useAudioPlayer(null),playback=useAudioPlayerStatus(guide),recorder=useAudioRecorder(RecordingPresets.HIGH_QUALITY),state=useAudioRecorderState(recorder);
 const [selected,setSelected]=useState<Recording|null>(null),[part,setPart]=useState('Bass'),[pending,setPending]=useState<{uri:string;name:string}|null>(null);const a=useAction();
 const locked=a.busy||state.isRecording||!!pending;
 return <Card><Text style={s.cardTitle}>Build on a bandmate’s riff</Text><Copy>Use headphones so the guide does not bleed into your microphone. Pause other players first. Each part is saved separately; this does not automatically align or mix tracks.</Copy>
 <Field label="Your part or instrument" value={part} editable={!locked} maxLength={80} onChangeText={setPart}/>
 <Copy>Choose the recording to loop:</Copy>{recordings.map(r=><Button key={r.id} title={`v${r.version} · ${r.name}`} secondary={selected?.id!==r.id} disabled={locked} onPress={()=>a.run(async()=>{guide.pause();setSelected(null);guide.replace(await api.signedUrl(r.storage_path));guide.loop=true;guide.volume=.7;setSelected(r)})}/>)}
 {!recordings.length&&<Copy>Record or upload the first riff above, then choose it here.</Copy>}
 <Notice text={a.error||playback.error||''} error/><Notice text={a.notice}/>
 {selected&&<><Copy>{playback.isLoaded?`Guide: v${selected.version} · loop enabled`:'Loading guide…'}</Copy><Button secondary title={playback.playing?'Pause guide':'Preview guide loop'} disabled={locked||!playback.isLoaded} onPress={()=>a.run(async()=>{await setAudioModeAsync({playsInSilentMode:true});if(playback.playing)guide.pause();else guide.play()})}/></>}
 {state.isRecording?<><Copy>Recording your part · {Math.floor(state.durationMillis/1000)} seconds</Copy><Button title="Stop and keep my part" disabled={a.busy} onPress={()=>a.run(async()=>{guide.pause();await recorder.stop();if(!recorder.uri)throw Error('No recording was produced. Please try again.');setPending({uri:recorder.uri,name:partName(part,selected!.version,Platform.OS==='web')});await setAudioModeAsync({allowsRecording:false})})}/></>:pending?<><Copy>Your take is on this device. Upload it before leaving this screen.</Copy><Button title={a.busy?'Uploading part…':'Save my part to the band'} disabled={a.busy} onPress={()=>a.run(async()=>{await uploadFile(song,pending.name,Platform.OS==='web'?'audio/webm':'audio/mp4',await readLocalFile(pending.uri),'audio');setPending(null);await onSaved();a.setNotice('Your separate part is saved. The original riff is unchanged.')})}/></>:<Button title="Record my part over the loop" disabled={a.busy||!selected||!playback.isLoaded||!part.trim()} onPress={()=>a.run(async()=>{
 partName(part,selected!.version,Platform.OS==='web');
 await startLoopTake({permission:async()=>(await requestRecordingPermissionsAsync()).granted,mode:recording=>setAudioModeAsync({allowsRecording:recording,playsInSilentMode:true,interruptionMode:'mixWithOthers'}),prepare:()=>recorder.prepareToRecordAsync(),seek:()=>guide.seekTo(0),record:()=>recorder.record(),play:()=>guide.play(),pause:()=>guide.pause(),stop:()=>recorder.stop()});
 })}/>}
 </Card>;
}
