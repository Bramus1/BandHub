import React from 'react';
import {Tabs,Redirect} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useWorkspace} from '../../src/context';
import {colors} from '../../src/ui';
export default function Layout(){const {session,loading,recovery}=useWorkspace();if(!loading&&!session)return <Redirect href="/"/>;if(recovery)return <Redirect href="/auth"/>;return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.accent,tabBarInactiveTintColor:colors.muted,tabBarStyle:{backgroundColor:'#171a1d',borderTopColor:colors.line},sceneStyle:{backgroundColor:colors.bg}}}>
 <Tabs.Screen name="home" options={{title:'Home',tabBarIcon:({color,size})=><Ionicons name="grid-outline" color={typeof color==='string'?color:colors.muted} size={size}/>}}/>
 <Tabs.Screen name="music" options={{title:'Music',tabBarIcon:({color,size})=><Ionicons name="musical-notes-outline" color={typeof color==='string'?color:colors.muted} size={size}/>}}/>
 <Tabs.Screen name="calendar" options={{title:'Calendar',tabBarIcon:({color,size})=><Ionicons name="calendar-outline" color={typeof color==='string'?color:colors.muted} size={size}/>}}/>
 <Tabs.Screen name="chat" options={{title:'Chat',tabBarIcon:({color,size})=><Ionicons name="chatbubbles-outline" color={typeof color==='string'?color:colors.muted} size={size}/>}}/>
 <Tabs.Screen name="band" options={{title:'Workspace',tabBarIcon:({color,size})=><Ionicons name="people-outline" color={typeof color==='string'?color:colors.muted} size={size}/>}}/>
 </Tabs>}

