import React from 'react';
import {Redirect,router} from 'expo-router';
import {View,Text} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {configuration} from '../src/supabase';
import {useWorkspace} from '../src/context';
import {accessScreen} from '../src/access';
import {Screen,Heading,Card,Copy,Button,Busy,Notice,colors,s} from '../src/ui';
export default function Entry(){const {loading,session,error,recovery}=useWorkspace();const screen=accessScreen(configuration.ready,loading,session);
 if(screen==='loading')return <Screen><Busy/></Screen>;
 if(recovery)return <Redirect href="/auth"/>;
 if(screen==='workspace')return <Redirect href="/(tabs)/home"/>;
 return <Screen><View style={[s.row,{marginTop:12}]}><Ionicons name="pulse" size={30} color={colors.accent}/><Text style={{color:colors.text,fontSize:21,fontWeight:'800',letterSpacing:2}}>BANDHUB</Text></View>
 <Heading eyebrow="YOUR BAND. ONE SHARED SPACE." title={'Make music.\nKeep the connection.'} subtitle="A home for the first riff, the late-night idea, and the song you build together."/>
 <Card style={{backgroundColor:'#273424',borderColor:'#40523a',padding:26}}><Ionicons name="musical-notes" size={46} color={colors.accent}/><Text style={[s.heading,{fontSize:25}]}>{'From rough takes\nto your next great song.'}</Text><Copy>Record ideas. Keep every version. Find the words. Stay in sync.</Copy></Card>
 <View style={s.row}>{['Private bands','Original songs','Ideas & recordings'].map(t=><Text key={t} style={s.pill}>{t}</Text>)}</View>
 <Notice text={error} error/>
 {screen==='setup'?<Card><Text style={s.cardTitle}>Your workspace needs a backend</Text><Copy>{configuration.reason}</Copy><Button title="Open setup guide" onPress={()=>router.push('/setup')}/></Card>:<Button title="Sign in or create an account" onPress={()=>router.push('/auth')}/>}
 <Button secondary title="Find a known song" onPress={()=>router.push('/songbook')}/><Copy>Explore song metadata and legitimate lyric and tab sources. No account needed for lookup.</Copy>
 </Screen>}
