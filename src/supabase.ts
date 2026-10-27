import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {createSecureStorage} from './secure-storage';
import {validateConfig} from './domain';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const configuration=validateConfig(url,key);
export const supabase=configuration.ready?createClient(url!,key!,{auth:{
  storage:Platform.OS==='web'?undefined:createSecureStorage(SecureStore),
  persistSession:true,autoRefreshToken:true,detectSessionInUrl:Platform.OS==='web',lock:processLock,
}}):null;
export function client(){if(!supabase)throw new Error(configuration.reason);return supabase}
