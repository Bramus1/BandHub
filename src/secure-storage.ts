type SecureDriver={getItemAsync:(key:string)=>Promise<string|null>;setItemAsync:(key:string,value:string)=>Promise<void>;deleteItemAsync:(key:string)=>Promise<void>};
type Manifest={generation:string;count:number};
export function createSecureStorage(driver:SecureDriver){
  const manifest=async(key:string):Promise<Manifest|null>=>{const raw=await driver.getItemAsync(key);if(!raw)return null;try{const m=JSON.parse(raw);return typeof m.generation==='string'&&Number.isInteger(m.count)&&m.count>0&&m.count<1000?m:null}catch{return null}};
  const clear=async(key:string,m:Manifest)=>{for(let i=0;i<m.count;i++)await driver.deleteItemAsync(`${key}.${m.generation}.${i}`)};
  return {
    async getItem(key:string){const m=await manifest(key);if(!m)return null;let value='';for(let i=0;i<m.count;i++){const chunk=await driver.getItemAsync(`${key}.${m.generation}.${i}`);if(chunk===null)return null;value+=chunk}return value},
    async setItem(key:string,value:string){
      const old=await manifest(key);const chars=Array.from(value);const count=Math.max(1,Math.ceil(chars.length/400));
      if(count>=1000)throw new Error('Session exceeds secure storage limit.');
      const m={generation:Date.now().toString(36)+Math.random().toString(36).slice(2),count};let written=0;
      try{for(let i=0;i<count;i++){await driver.setItemAsync(`${key}.${m.generation}.${i}`,chars.slice(i*400,(i+1)*400).join(''));written++}await driver.setItemAsync(key,JSON.stringify(m))}
      catch(error){await clear(key,{...m,count:written});throw error}
      if(old)await clear(key,old);
    },
    async removeItem(key:string){const m=await manifest(key);await driver.deleteItemAsync(key);if(m)await clear(key,m)}
  };
}
