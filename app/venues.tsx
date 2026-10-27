import React,{useState} from 'react';
import {Linking} from 'react-native';
import {router} from 'expo-router';
import {venueSearchUrl} from '../src/planning';
import {useAction} from '../src/use-action';
import {Screen,Heading,Card,Copy,Field,Button,Notice} from '../src/ui';
export default function Venues(){const [place,setPlace]=useState('');const a=useAction();return <Screen><Button secondary title="Back" onPress={()=>router.back()}/><Heading title="Find your next stage" subtitle="Look for live-music bars and venues in your area."/><Card><Field label="Town or area" placeholder="e.g. Lyon, France" value={place} onChangeText={setPlace} maxLength={160}/><Copy>Leave blank to search near your location in Google Maps. Maps may ask for location access. BandHub does not collect your location.</Copy><Notice text={a.error} error/><Button title={place.trim()?'Find venues in this area':'Find venues near me'} onPress={()=>a.run(async()=>{await Linking.openURL(venueSearchUrl(place))})}/></Card><Copy>Results open in Google Maps. Check each venue’s website or contact them about booking opportunities: a venue listing does not mean a gig slot is available.</Copy><Button secondary title="Add a confirmed show to the calendar" onPress={()=>router.push('/(tabs)/calendar')}/></Screen>}
