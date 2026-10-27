import React,{useState} from 'react';
import {View,Text,Pressable} from 'react-native';
import {router} from 'expo-router';
import {useWorkspace} from '../../src/context';
import {useSongs} from '../../src/use-songs';
import {useAction} from '../../src/use-action';
import {Screen,Heading,Card,Copy,Field,Button,Notice,Busy,Empty,s} from '../../src/ui';
export default function Music(){const {band}=useWorkspace();const data=useSongs(band?.id),a=useAction();const [search,setSearch]=useState(''),[kind,setKind]=useState('All');const filtered=data.songs.filter(s=>s.title.toLowerCase().includes(search.toLowerCase())&&(kind==='All'||s.kind===kind));return <Screen>
 <Button secondary title="Song trash" onPress={()=>router.push('/trash')}/><Heading title="Your sound, collected." subtitle={band?.name??'Choose a band to open its library.'}/>
 <View style={s.row}><Button title="＋ New song" disabled={!band} onPress={()=>router.push('/new-song')}/><Button secondary title="Find a known song" onPress={()=>router.push('/songbook')}/></View>
 <Field label="Search library" value={search} onChangeText={setSearch} placeholder="Song title…"/>
 <View style={s.row}>{['All','song','idea','cover'].map(k=><Button key={k} title={k==='All'?'All music':k==='idea'?'Ideas':k==='cover'?'Covers':'Originals'} secondary={kind!==k} onPress={()=>setKind(k)}/>)}</View>
 <Notice text={data.error||a.error} error/><Button secondary title="Refresh library" disabled={!band||a.busy} onPress={()=>a.run(data.refresh)}/>
 {data.loading?<Busy/>:filtered.length?filtered.map(song=><Pressable key={song.id} accessibilityRole="button" accessibilityLabel={'Open '+song.title} onPress={()=>router.push({pathname:'/song/[id]',params:{id:song.id}})}><Card><Text style={s.pill}>{song.status}</Text><Text style={s.cardTitle}>{song.title}</Text><Copy>{song.artist||band?.name} · {song.bpm??'—'} BPM · {song.musical_key||'No key'}</Copy></Card></Pressable>):<Empty title={data.songs.length?'No matching songs':'Make room for your first idea'} body={data.songs.length?'Try another title or filter.':'Create a song or idea, then add recordings, words, and tabs.'}/>}
 </Screen>}

