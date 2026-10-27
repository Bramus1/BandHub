import {Platform} from 'react-native';
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {randomUUID} from 'expo-crypto';
export async function readLocalFile(uri:string):Promise<ArrayBuffer>{return Platform.OS==='web'?fetch(uri).then(r=>r.arrayBuffer()):new File(uri).arrayBuffer()}
export async function exportText(name:string,content:string){
 const filename=name.replace(/[^a-z0-9_-]/gi,'_').slice(0,80)+'.txt';
 if(Platform.OS==='web'){const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}
 const file=new File(Paths.cache,filename);file.write(content);
 if(!await Sharing.isAvailableAsync())throw Error('Sharing is not available on this device.');
 await Sharing.shareAsync(file.uri,{mimeType:'text/plain',dialogTitle:'Export song document'});
}
export async function exportPrivateFile(url:string,name:string){
 if(Platform.OS==='web'){const response=await fetch(url);if(!response.ok)throw Error('Download failed. Please try again.');const objectUrl=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=objectUrl;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);return}
 const file=await File.downloadFileAsync(url,new File(Paths.cache,randomUUID()+'-'+name.replace(/[^a-z0-9_.-]/gi,'_')));
 if(!await Sharing.isAvailableAsync())throw Error('Sharing is unavailable on this device.');
 await Sharing.shareAsync(file.uri);
}
