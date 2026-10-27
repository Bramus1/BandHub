type LoopIO={permission:()=>Promise<boolean>;mode:(recording:boolean)=>Promise<void>;prepare:()=>Promise<unknown>;seek:()=>Promise<unknown>;record:()=>void;play:()=>void;pause:()=>void;stop:()=>Promise<unknown>};
export async function startLoopTake(io:LoopIO){
 io.pause();
 if(!await io.permission())throw Error('Microphone access is required to record your part.');
 try{
  await io.mode(true);await io.prepare();await io.seek();io.record();io.play();
 }catch(error){
  try{io.pause()}catch{}
  try{await io.stop()}catch{}
  try{await io.mode(false)}catch{}
  throw error;
 }
}
