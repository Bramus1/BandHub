import React from 'react';
import {Text,View,Pressable} from 'react-native';
import {router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useWorkspace} from '../../src/context';
import {useSongs} from '../../src/use-songs';
import {Screen,Heading,Card,Copy,Button,Notice,Busy,Empty,colors,s} from '../../src/ui';
export default function Home(){const {band,session,error}=useWorkspace();const data=useSongs(band?.id);return <Screen>
 <View style={s.between}><Text style={s.eyebrow}>BANDHUB / YOUR WORKSPACE</Text><Pressable accessibilityRole="button" accessibilityLabel="Switch band" onPress={()=>router.push('/(tabs)/band')}><Ionicons name="people-circle-outline" size={32} color={colors.accent}/></Pressable></View>
 <Button secondary title="Song trash" onPress={()=>router.push('/trash')}/><Heading title={band?`${band.name},\nin sync.`:'Your next band\nstarts here.'} subtitle={band?'A little less organizing. A little more making music.':`Welcome, ${session?.user.email?.split('@')[0]??'musician'}. Create a band or accept an invitation.`}/>
 <Notice text={error||data.error} error/>
 {!band?<Card><Ionicons name="people" color={colors.accent} size={40}/><Copy>One account. All your projects. Every band gets its own private space.</Copy><Button title="Create or join a band" onPress={()=>router.push('/(tabs)/band')}/></Card>:<>
 <Card style={{backgroundColor:'#283625',borderColor:'#42543a'}}><Text style={s.eyebrow}>DON’T LET THE RIFF GET AWAY</Text><Text style={[s.cardTitle,{fontSize:27}]}>Catch the idea.\nBuild it together.</Text><Copy>Capture a rough take now. Find the arrangement with your band later.</Copy><Button title="＋ Capture an idea" onPress={()=>router.push({pathname:'/new-song',params:{kind:'idea'}})}/></Card>
 <View style={s.row}><Text style={s.pill}>{data.songs.filter(s=>s.kind==='idea').length} ideas</Text><Text style={s.pill}>{data.songs.filter(s=>s.kind!=='idea').length} songs</Text><Text style={s.pill}>{data.songs.filter(s=>s.status==='Ready for Rehearsal').length} rehearsal-ready</Text></View>
 <View style={s.row}><Button secondary title="New song" onPress={()=>router.push('/new-song')}/><Button secondary title="Open band chat" onPress={()=>router.push('/(tabs)/chat')}/><Button secondary title="Songbook" onPress={()=>router.push('/songbook')}/></View>
 <Button secondary title="Song trash" onPress={()=>router.push('/trash')}/><Heading title="On the music stand" subtitle="Your band’s most recently updated projects."/>
 {data.loading?<Busy/>:data.songs.length?data.songs.slice(0,5).map(song=><Pressable key={song.id} accessibilityRole="button" accessibilityLabel={'Open '+song.title} onPress={()=>router.push({pathname:'/song/[id]',params:{id:song.id}})}><Card><Text style={s.pill}>{song.status}</Text><Text style={s.cardTitle}>{song.title}</Text><Copy>{song.bpm??'—'} BPM · {song.musical_key||'Key not set'} · {song.kind==='idea'?'Idea':'Song'}</Copy></Card></Pressable>):<Empty title="A blank page. Endless possibilities." body="Start with a song title or a quick recording. Your band’s latest work will appear here."/>}
 </>}
 </Screen>}

