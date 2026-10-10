export const BASS_SOUNDS={finger:'Bajo real · dedos',pick:'Bajo real · púa',upright:'Contrabajo real · pizzicato',synth:'Sintetizado · limpio'};
export const BASS_BANKS={finger:[[28,'finger-28.flac'],[33,'finger-33.flac'],[39,'finger-39.flac']],pick:[[28,'pick-28.flac'],[33,'pick-33.flac'],[40,'pick-40.flac']],upright:[[31,'upright-31.wav'],[38,'upright-38.wav'],[48,'upright-48.wav']]};
let selected;
export function bassSound(){if(selected)return selected;try{selected=localStorage.getItem('appbass-bass-sound');}catch{}return selected in BASS_SOUNDS?selected:'finger';}
export function setBassSound(value){selected=value in BASS_SOUNDS?value:'finger';try{localStorage.setItem('appbass-bass-sound',selected);}catch{}return selected;}
const contexts=new WeakMap();
export async function loadBassBank(context,sound){
 if(!BASS_BANKS[sound])return [];
 let cache=contexts.get(context);if(!cache){cache=new Map();contexts.set(context,cache);}
 if(!cache.has(sound))cache.set(sound,Promise.all(BASS_BANKS[sound].map(async([midi,file])=>{
  try{
   const response=await fetch(new URL('./samples/bass/'+file,import.meta.url),{signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('Sample unavailable');
   const buffer=await context.decodeAudioData(await response.arrayBuffer());
   let peak=0,sum=0,count=0;
   for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(let i=0;i<data.length;i++){peak=Math.max(peak,Math.abs(data[i]));if(i<buffer.sampleRate*.35){sum+=data[i]**2;count++;}}}
   if(!peak||!count)throw Error('Silent sample');
   const scale=Math.min(.9/peak,.25/Math.sqrt(sum/count));
   for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(let i=0;i<data.length;i++)data[i]*=scale;}
   return {midi,buffer};
  }catch{return null;}
 })).then(rows=>rows.filter(Boolean)));
 const bank=await cache.get(sound);
 if(bank.length!==BASS_BANKS[sound].length)cache.delete(sound); // Retry failures on next playback.
 return bank;
}
export function nearestBassSample(bank,midi){return bank.reduce((best,row)=>!best||Math.abs(row.midi-midi)<Math.abs(best.midi-midi)?row:best,null);}
