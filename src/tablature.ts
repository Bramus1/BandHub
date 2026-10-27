const strings=['e','B','G','D','A','E'];
const bar='----------------|';
export function appendBar(text:string,newSystem=false):string{
 const lines=text.replace(/\r\n/g,'\n').split('\n');
 let end=lines.length;while(end&&lines[end-1].trim()==='')end--;
 const last=lines.slice(end-6,end);
 const valid=last.length===6&&last.every((line,i)=>line.startsWith(strings[i]+'|')&&line.endsWith('|'))&&new Set(last.map(l=>l.length)).size===1;
 if(!newSystem&&valid){for(let i=end-6;i<end;i++)lines[i]+=bar;return lines.join('\n')}
 return text+(text?'\n\n':'')+strings.map(s=>s+'|'+bar).join('\n');
}
export const tabLegend='x = muted note   h = hammer-on   p = pull-off\nb = bend   r = release   pb = pre-bend\n/ = slide up   \\ = slide down   ~ = vibrato\n(h) = harmonic   (ph) = pinch harmonic   T = tapping';
