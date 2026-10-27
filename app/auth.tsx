import React,{useState} from 'react';
import {router} from 'expo-router';
import * as Linking from 'expo-linking';
import {client,configuration} from '../src/supabase';
import {useWorkspace} from '../src/context';
import {useAction} from '../src/use-action';
import {Screen,Heading,Card,Field,Button,Notice} from '../src/ui';
export default function Auth(){const {recovery,finishRecovery}=useWorkspace();const [mode,setMode]=useState<'signin'|'signup'|'reset'>('signin'),[email,setEmail]=useState(''),[password,setPassword]=useState('');const a=useAction();
 const submit=()=>a.run(async()=>{if(!configuration.ready)throw Error(configuration.reason);let error;
  if(recovery){({error}=await client().auth.updateUser({password}));if(!error){finishRecovery();router.replace('/')}}
  else if(mode==='reset'){({error}=await client().auth.resetPasswordForEmail(email.trim(),{redirectTo:Linking.createURL('auth/callback')}));if(!error)a.setNotice('If that account exists, a reset link has been sent. Open it on this device.')}
  else if(mode==='signup'){({error}=await client().auth.signUp({email:email.trim(),password,options:{emailRedirectTo:Linking.createURL('auth/callback')}}));if(!error)a.setNotice('Check your email to confirm your account, then sign in.')}
  else{({error}=await client().auth.signInWithPassword({email:email.trim(),password}));if(!error)router.replace('/')}
  if(error)throw error;
 });
 return <Screen><Button title="Back" secondary onPress={()=>router.replace('/')}/><Heading title={recovery?'Choose a new password':mode==='signup'?'Join the session.':mode==='reset'?'Reset your password':'Welcome back.'} subtitle="Your music belongs with your people."/><Card>
 {!recovery&&<Field label="Email" autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail}/>}
 {(recovery||mode!=='reset')&&<Field label="Password" secureTextEntry autoComplete={mode==='signup'||recovery?'new-password':'current-password'} value={password} onChangeText={setPassword}/>}
 <Notice text={a.error} error/><Notice text={a.notice}/><Button title={a.busy?'Please wait…':recovery?'Save new password':mode==='signup'?'Create account':mode==='reset'?'Send reset link':'Sign in'} disabled={a.busy||((mode!=='reset'||recovery)&&password.length<8)} onPress={submit}/>
 {!recovery&&<><Button secondary title={mode==='signup'?'Already have an account? Sign in':'Create an account'} onPress={()=>setMode(mode==='signup'?'signin':'signup')}/><Button secondary title="Forgot password?" onPress={()=>setMode('reset')}/></>}
 </Card></Screen>}
