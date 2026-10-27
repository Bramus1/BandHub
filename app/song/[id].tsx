import React,{useState,useEffect} from 'react';
import {View,Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {api,uploadFile} from '../../src/api';
import type {Song,Recording,Document} from '../../src/types';
import {statuses} from '../../src/domain';
import {useAction} from '../../src/use-action';
import {readLocalFile,exportText,exportPrivateFile} from '../../src/files';
import {Recorder} from '../../src/Recorder';
import {LayerRecorder} from '../../src/LayerRecorder';
import {TabEditor} from '../../src/TabEditor';
import {SongTrash} from '../../src/SongTrash';
import {Player} from '../../src/Player';
import {Chat} from '../../src/Chat';
import {Screen,Heading,Card,Copy,Field,Button,Notice,Busy,s} from '../../src/ui';
type TextTab='lyrics'|'chords'|'tabs';
export default function SongPage(){const {id}=useLocalSearchParams<{id:string}>();const [song,setSong]=useState<Song|null>(null),[recordings,setRecordings]=useState<Recording[]>([]),[documents,setDocuments]=useState<Document[]>([]),[tab,setTab]=useState('Recordings'),[draft,setDraft]=useState({lyrics:'',chords:'',tabs:''}),[dirty,setDirty]=useState(false),[rights,setRights]=useState<'owned'|'authorized'>('owned');const a=useAction();
 async function load(){const [song,recs,docs]=await Promise.all([api.song(id),api.recordings(id),api.documents(id)]);setSong(song);setRecordings(recs);setDocuments(docs);return song}
 useEffect(()=>{a.run(async()=>{const s=await load();setDraft({lyrics:s.lyrics,chords:s.chords,tabs:s.tabs})})},[id]);
 async function pick(kind:'audio'|'document'){
  const selected=await DocumentPicker.getDocumentAsync({type:kind==='audio'?'audio/*':['application/pdf','text/plain'],copyToCacheDirectory:true});if(selected.canceled)return;
  const file=selected.assets[0];if(file.size&&file.size>25*1024*1024)throw Error('Choose a file smaller than 25 MB.');
  const fallback:Record<string,string>={mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',webm:'audio/webm',pdf:'application/pdf',txt:'text/plain'};
  await uploadFile(song!,file.name,file.mimeType||fallback[file.name.split('.').pop()?.toLowerCase()??'']||'',await readLocalFile(file.uri),kind,rights);await load();a.setNotice(kind==='audio'?'New version uploaded. Earlier takes are preserved.':'Document uploaded.');
 }
 return <Screen><Button secondary title={dirty?'Save changes before leaving':'Back to music'} disabled={dirty} onPress={()=>router.canGoBack()?router.back():router.replace('/(tabs)/music')}/><Notice text={a.error} error/><Notice text={a.notice}/>{!song?<><Busy/><Button secondary title="Retry loading song" disabled={a.busy} onPress={()=>a.run(async()=>{const s=await load();setDraft({lyrics:s.lyrics,chords:s.chords,tabs:s.tabs})})}/></>:<>
 <Heading eyebrow={song.kind.toUpperCase()} title={song.title} subtitle={`${song.artist||'Your band'} · ${song.bpm??'—'} BPM · ${song.musical_key||'Key not set'} · ${song.time_signature}`}/>
 <SongTrash song={song} disabled={dirty} onChanged={async()=>{await load()}}/>{dirty&&<Copy>Save your edits before moving this song to trash.</Copy>}
 {song.deleted_at?<Copy>This song is in trash. Restore it to continue working.</Copy>:<>
 <View style={s.row}>{statuses.map(status=><Button key={status} title={status} secondary={song.status!==status} disabled={a.busy} onPress={()=>a.run(async()=>{setSong(await api.saveSong(id,{status}))})}/>)}</View>
 {song.kind==='idea'&&<Button title="Develop this idea into a song" disabled={a.busy} onPress={()=>a.run(async()=>{setSong(await api.saveSong(id,{kind:'song',status:'In Development'}));a.setNotice('Now a song project. All recordings and comments are preserved.')})}/>}
 <View style={s.row}>{['Recordings','Lyrics','Chords','Tabs','Documents','Discussion'].map(t=><Button key={t} title={t} secondary={tab!==t} onPress={()=>setTab(t)}/>)}</View>
 {tab==='Recordings'&&<><Button title="Upload audio · up to 25 MB" disabled={a.busy} onPress={()=>a.run(()=>pick('audio'))}/><Recorder song={song} onSaved={async()=>{await load()}}/><LayerRecorder song={song} recordings={recordings} onSaved={async()=>{await load()}}/><Copy>{recordings.length?`Latest: version ${recordings[0].version}. Select a take below.`:'No recordings yet. Upload a file or record the first take.'}</Copy>{recordings.map(r=><Player key={r.id} recording={r}/>)}</>}
 {['Lyrics','Chords','Tabs'].includes(tab)&&<Card><Text style={s.cardTitle}>{tab==='Lyrics'?'Find the words.':tab==='Tabs'?'Work out the riff.':'Shape the harmony.'}</Text><Copy>{dirty?'Unsaved changes':'Saved with this song'} · Text is saved explicitly; coordinate edits with your bandmates.</Copy>{tab==='Tabs'?<TabEditor value={draft.tabs} onChange={text=>{setDraft(d=>({...d,tabs:text}));setDirty(true)}}/>:<Field label={tab+' editor'} multiline value={draft[tab.toLowerCase() as TextTab]} onChangeText={text=>{setDraft(d=>({...d,[tab.toLowerCase()]:text}));setDirty(true)}} maxLength={50000}/>}<Button title="Save song documents" disabled={!dirty||a.busy} onPress={()=>a.run(async()=>{setSong(await api.saveSong(id,draft));setDirty(false);a.setNotice('Lyrics, chords, and tabs saved.')})}/><Button secondary title={'Export my '+tab.toLowerCase()+' as text'} onPress={()=>a.run(()=>exportText(song.title+'-'+tab.toLowerCase(),draft[tab.toLowerCase() as TextTab]))}/><Copy>Export only lyrics, chords, and tabs you own or have permission to copy.</Copy></Card>}
 {tab==='Documents'&&<><Card><Text style={s.cardTitle}>Bring your charts</Text><Copy>Upload PDF or text files that you own or are authorized to share with this band.</Copy><View style={s.row}><Button title="I own the content" secondary={rights!=='owned'} onPress={()=>setRights('owned')}/><Button title="I have permission" secondary={rights!=='authorized'} onPress={()=>setRights('authorized')}/></View><Button title="Upload PDF or text" disabled={a.busy} onPress={()=>a.run(()=>pick('document'))}/></Card>{documents.map(doc=><Card key={doc.id}><Text style={s.cardTitle}>{doc.name}</Text><Button secondary title="Download document" disabled={a.busy} onPress={()=>a.run(async()=>exportPrivateFile(await api.signedUrl(doc.storage_path),doc.name))}/></Card>)}</>}
 {tab==='Discussion'&&<Chat bandId={song.band_id} songId={song.id}/>}
 </>}</>}</Screen>
}



