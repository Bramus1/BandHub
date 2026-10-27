import React from 'react';
import {View,Text,TextInput,Pressable,ScrollView,StyleSheet,ActivityIndicator,KeyboardAvoidingView,Platform,type TextInputProps,type ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
export const colors={bg:'#101214',panel:'#1b1e22',line:'#303439',text:'#f3f4f1',muted:'#a0a69f',accent:'#c3ec8b',coral:'#ee987e',error:'#ffb4ab'};
export function Screen({children}:React.PropsWithChildren){return <SafeAreaView style={{flex:1,backgroundColor:colors.bg}} edges={['top','left','right']}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.screen}>{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>}
export function Heading({title,subtitle,eyebrow}: {title:string;subtitle?:string;eyebrow?:string}){return <View style={{gap:9,marginVertical:18}}>{eyebrow&&<Text style={s.eyebrow}>{eyebrow}</Text>}<Text accessibilityRole="header" style={s.heading}>{title}</Text>{subtitle&&<Text style={s.body}>{subtitle}</Text>}</View>}
export function Card({children,style}:React.PropsWithChildren<{style?:ViewStyle}>){return <View style={[s.card,style]}>{children}</View>}
export function Label({children}:React.PropsWithChildren){return <Text style={s.label}>{children}</Text>}
export function Copy({children}:React.PropsWithChildren){return <Text style={s.body}>{children}</Text>}
export function Button({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,{opacity:disabled?.45:pressed?.75:1}]}><Text style={[s.buttonText,secondary&&{color:colors.text}]}>{title}</Text></Pressable>}
export function Field({label,...props}:TextInputProps&{label:string}){return <View style={{gap:7,marginVertical:6}}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#707970" style={[s.input,props.multiline&&{minHeight:110,textAlignVertical:'top'}]} {...props}/></View>}
export function Notice({text,error=false}:{text:string;error?:boolean}){if(!text)return null;return <Text accessibilityRole="alert" style={[s.notice,error&&{color:colors.error,borderColor:'#65433e'}]}>{text}</Text>}
export function Busy(){return <ActivityIndicator color={colors.accent} style={{padding:30}}/>}
export function Empty({title,body}:{title:string;body:string}){return <Card><Text style={s.cardTitle}>{title}</Text><Copy>{body}</Copy></Card>}
export const s=StyleSheet.create({
 screen:{padding:22,paddingBottom:40,gap:14,width:'100%',maxWidth:940,alignSelf:'center'},
 heading:{fontSize:32,fontWeight:'700',letterSpacing:-1,color:colors.text},eyebrow:{fontSize:11,fontWeight:'700',letterSpacing:2,color:colors.accent},body:{fontSize:14,lineHeight:22,color:colors.muted},
 card:{backgroundColor:colors.panel,borderWidth:1,borderColor:colors.line,borderRadius:18,padding:20,gap:12},cardTitle:{fontSize:20,fontWeight:'600',color:colors.text},label:{fontSize:13,fontWeight:'600',color:colors.text},
 input:{backgroundColor:'#121518',color:colors.text,borderWidth:1,borderColor:colors.line,borderRadius:10,paddingHorizontal:14,paddingVertical:13,fontSize:15,minHeight:48},
 button:{minHeight:48,paddingVertical:13,paddingHorizontal:18,borderRadius:12,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'},buttonText:{fontSize:14,fontWeight:'700',color:'#20291a'},secondary:{backgroundColor:'#272c30',borderWidth:1,borderColor:'#3b4244'},
 row:{flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap'},between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 notice:{padding:14,borderWidth:1,borderColor:'#48593d',backgroundColor:'#1e271d',color:colors.accent,borderRadius:10,lineHeight:21},small:{fontSize:12,color:colors.muted,lineHeight:19},pill:{fontSize:11,color:colors.accent,backgroundColor:'#2a3522',paddingHorizontal:9,paddingVertical:5,borderRadius:7,alignSelf:'flex-start'},
});
