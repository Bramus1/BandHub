import type {Role,Status} from './domain';
export type Band={id:string;name:string;genre:string;description:string};
export type Membership={band_id:string;user_id:string;role:Role};
export type Profile={id:string;display_name:string;main_instrument:string;additional_instruments:string[];biography:string};
export type Song={deleted_at:string|null;id:string;band_id:string;title:string;artist:string;description:string;kind:'idea'|'song'|'cover';bpm:number|null;musical_key:string;time_signature:string;status:Status;lyrics:string;chords:string;tabs:string;created_by:string;updated_at:string};
export type Recording={id:string;band_id:string;song_id:string;storage_path:string;name:string;mime:string;size:number;version:number;created_at:string};
export type Document={id:string;band_id:string;song_id:string;name:string;storage_path:string;mime:string;rights:'owned'|'authorized'};
export type Message={id:string;band_id:string;song_id:string|null;author_id:string;body:string;created_at:string};
export type Comment={id:string;recording_id:string;author_id:string;body:string;at_seconds:number};


