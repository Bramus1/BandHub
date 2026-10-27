import React from 'react';
import {router} from 'expo-router';
import {Linking} from 'react-native';
import {Screen,Heading,Card,Copy,Button,Label} from '../src/ui';
export default function Setup(){return <Screen><Button secondary title="Back" onPress={()=>router.back()}/><Heading title="Connect your workspace" subtitle="One Supabase project powers accounts, private bands, files, and live conversations."/>
 <Card><Label>1. Create your Supabase project</Label><Copy>Keep email confirmation enabled. Use the project URL and publishable key from the project’s API settings.</Copy><Button secondary title="Open Supabase" onPress={()=>Linking.openURL('https://supabase.com/dashboard')}/></Card>
 <Card><Label>2. Apply the database migration</Label><Copy>Run supabase/migrations/202610220001_core.sql in your project’s SQL Editor. It creates the private file bucket, roles, tables, and access policies.</Copy></Card>
 <Card><Label>3. Configure the app</Label><Copy>Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Never use a service-role or secret key. Restart Expo after changing these values.</Copy></Card>
 <Card><Label>4. Configure email redirects</Label><Copy>Add bandhub://auth/callback to Authentication → URL Configuration. For browser development, add your local app URL followed by /auth/callback. Configure SMTP before inviting real users.</Copy></Card>
 <Copy>The repository README includes Android/iOS build steps, security checks, and the remaining device tests. No live band data is fabricated while configuration is missing.</Copy>
 </Screen>}
