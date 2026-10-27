import React,{useState} from 'react';
import {ScrollView,Text,Platform} from 'react-native';
import {appendBar,tabLegend} from './tablature';
import {Field,Button,Copy,s} from './ui';
export function TabEditor({value,onChange}:{value:string;onChange:(v:string)=>void}){
 const [legend,setLegend]=useState(false);
 const width=Math.max(280,...value.split('\n').map(l=>l.length*9.7+32));
 function add(newSystem=false){const next=appendBar(value,newSystem);if(next.length<=50000)onChange(next)}
 return <><Copy>Swipe sideways to follow the strings. Paste a complete sheet here to keep its line spacing.</Copy><ScrollView horizontal keyboardShouldPersistTaps="handled"><Field label="Tabs editor" multiline value={value} onChangeText={onChange} maxLength={50000} autoCorrect={false} autoCapitalize="none" style={[s.input,{width,fontFamily:Platform.OS==='ios'?'Menlo':'monospace',fontSize:16,lineHeight:24,minHeight:180,textAlignVertical:'top'}]}/></ScrollView><Button secondary title="Add bar to the right" onPress={()=>add()}/><Button secondary title="Start a new six-string row" onPress={()=>add(true)}/><Button secondary title={legend?'Hide tab symbols':'Tab symbols'} onPress={()=>setLegend(!legend)}/>{legend&&<Text style={s.body}>{tabLegend}</Text>}</>
}
