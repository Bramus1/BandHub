import React from 'react';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {WorkspaceProvider} from '../src/context';
export default function Root(){return <SafeAreaProvider><WorkspaceProvider><StatusBar style="light"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:'#101214'}}}/></WorkspaceProvider></SafeAreaProvider>}
