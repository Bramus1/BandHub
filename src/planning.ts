export function calendarInput(title:string,date:string,time:string,minutes:string,location:string,kind:string){
 if(!title.trim()||title.trim().length>120)throw Error('Enter an event title, up to 120 characters.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))throw Error('Use YYYY-MM-DD and HH:MM.');
 const [y,m,d]=date.split('-').map(Number),[h,min]=time.split(':').map(Number),duration=Number(minutes);
 const start=new Date(y,m-1,d,h,min);
 if(start.getFullYear()!==y||start.getMonth()!==m-1||start.getDate()!==d||h>23||min>59||start.getHours()!==h)throw Error('Enter a valid date and local time.');
 if(!Number.isInteger(duration)||duration<1||duration>1440)throw Error('Duration must be 1 to 1440 minutes.');
 if(!['rehearsal','gig','session'].includes(kind)||location.length>250)throw Error('Check event type and location.');
 return {title:title.trim(),starts_at:start.toISOString(),ends_at:new Date(start.getTime()+duration*60000).toISOString(),location:location.trim(),kind};
}
export function venueSearchUrl(place:string){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('live music bars and music venues '+(place.trim()?'in '+place.trim().slice(0,160):'near me'));}
export function partName(instrument:string,guideVersion:number|null,web:boolean){const part=instrument.trim();if(!part||part.length>80)throw Error('Name your part, up to 80 characters.');return part+(guideVersion===null?'':` over v${guideVersion}`)+(web?'.webm':'.m4a');}
