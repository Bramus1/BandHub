import React,{useState} from 'react';
import {Text,Platform} from 'react-native';
import {useAudioRecorder,useAudioRecorderState,RecordingPresets,requestRecordingPermissionsAsync,setAudioModeAsync} from 'expo-audio';
import type {Song} from './types';
import {uploadFile} from './api';
import {readLocalFile} from './files';
import {formatTime} from './domain';
import {useAction} from './use-action';
import {Card,Copy,Button,Notice,s} from './ui';
export function Recorder({song,onSaved}:{song:Song;onSaved:()=>Promise<void>}){
 const recorder=useAudioRecorder(RecordingPresets.HIGH_QUALITY);const state=useAudioRecorderState(recorder);const [pending,setPending]=useState<string|null>(null);const a=useAction();
 return <Card><Text style={s.cardTitle}>Capture a take</Text><Copy>{state.isRecording?'● Recording '+formatTime(state.durationMillis/1000):pending?'Your take is on this device. Upload it before leaving this screen.':'Microphone access is requested only when you start recording.'}</Copy><Notice text={a.error} error/><Notice text={a.notice}/>
 {state.isRecording?<Button title="Stop recording" disabled={a.busy} onPress={()=>a.run(async()=>{await recorder.stop();setPending(recorder.uri);await setAudioModeAsync({allowsRecording:false})})}/>:!pending?<Button title="Record with microphone" disabled={a.busy} onPress={()=>a.run(async()=>{const permission=await requestRecordingPermissionsAsync();if(!permission.granted)throw Error('Microphone permission was not granted. You can still upload an existing audio file.');await setAudioModeAsync({allowsRecording:true,playsInSilentMode:true});await recorder.prepareToRecordAsync();recorder.record()})}/>:<Button title={a.busy?'Uploading…':'Upload this take'} disabled={a.busy} onPress={()=>a.run(async()=>{const bytes=await readLocalFile(pending);const web=Platform.OS==='web';await uploadFile(song,`${song.title.slice(0,80)} take.${web?'webm':'m4a'}`,web?'audio/webm':'audio/mp4',bytes,'audio');setPending(null);await onSaved();a.setNotice('Recording uploaded as a new version.')})}/>}
 </Card>
}
