import React,{useState,useRef} from 'react';
import {Text,ScrollView,Platform} from 'react-native';
import {router} from 'expo-router';
import {searchSheets,type SongSheet} from '../src/sheet-search';
import {useWorkspace} from '../src/context';
import {api} from '../src/api';
import {useAction} from '../src/use-action';
import {Screen,Heading,Card,Copy,Field,Button,Notice,s} from '../src/ui';
export default function Songbook(){
 const {band}=useWorkspace(),a=useAction(),last=useRef(0);
 const [artist,setArtist]=useState(''),[title,setTitle]=useState(''),[results,setResults]=useState<SongSheet[]>([]),[searched,setSearched]=useState(false),[selected,setSelected]=useState<SongSheet|null>(null),[pasted,setPasted]=useState(''),[saved,setSaved]=useState<string|null>(null);
 async function save(t:string,ar:string,lyrics:string,tabs:string){if(!band)return;const song=await api.createSheet(band.id,t,ar,lyrics,tabs);setSaved(song.id);router.push({pathname:'/song/[id]',params:{id:song.id}})}
 return <Screen><Button secondary title="Back" onPress={()=>router.canGoBack()?router.back():router.replace('/')}/><Heading title="Find a song sheet" subtitle="Search and read lyrics here in BandHub."/><Card><Field label="Artist" value={artist} onChangeText={setArtist} maxLength={120}/><Field label="Song title" value={title} onChangeText={setTitle} maxLength={120}/><Button title={a.busy?'Searching…':'Search online'} disabled={a.busy||(!artist.trim()&&!title.trim())} onPress={()=>a.run(async()=>{if(Date.now()-last.current<1200)throw Error('Wait a moment before searching again.');last.current=Date.now();setSelected(null);setResults([]);setSearched(false);setSaved(null);setResults(await searchSheets(artist,title));setSearched(true)})}/></Card><Notice text={a.error} error/>
 <Copy>Lyrics source: LRCLIB. Automatic guitar-tab and chord-sheet retrieval is not available yet. You can paste a sheet below or into a song’s Tabs editor.</Copy>
 {searched&&!results.length&&<Copy>No lyrics found. Try another title or paste a song sheet below.</Copy>}
 {results.map(song=><Card key={song.id}><Text style={s.cardTitle}>{song.title}</Text><Copy>{song.artist}{song.album?' · '+song.album:''}</Copy><Button secondary title="Read lyrics here" onPress={()=>{setSelected(song);setSaved(null)}}/></Card>)}
 {selected&&<Card><Heading title={selected.title} subtitle={selected.artist}/><Text selectable style={[s.body,{color:'#f3f4f1'}]}>{selected.lyrics||(selected.instrumental?'Instrumental recording.':'No plain-text lyrics available for this version.')}</Text>{band&&<Button title={saved?'Saved to band':'Save as a band song'} disabled={a.busy||!!saved||selected.lyrics.length>50000} onPress={()=>a.run(()=>save(selected.title,selected.artist,selected.lyrics,''))}/>}</Card>}
 <Card><Heading title="Paste a song sheet" subtitle="Keep tuning, capo, key, chords and tab notation together."/><Copy>Enter its title and artist above, then paste plain text with its original line breaks.</Copy><ScrollView horizontal keyboardShouldPersistTaps="handled"><Field label="Song sheet text" multiline value={pasted} onChangeText={v=>{setPasted(v);setSaved(null)}} maxLength={50000} autoCorrect={false} style={[s.input,{fontFamily:Platform.OS==='ios'?'Menlo':'monospace',width:Math.max(280,...pasted.split('\n').map(l=>l.length*9.7+32)),minHeight:180,textAlignVertical:'top'}]}/></ScrollView><Button title="Save pasted sheet to band" disabled={!band||!title.trim()||!pasted.trim()||a.busy||!!saved} onPress={()=>a.run(()=>save(title,artist,'',pasted))}/>{!band&&<Copy>Choose a band to save a song.</Copy>}</Card>
 </Screen>
}
