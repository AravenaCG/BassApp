// Standard MIDI type 0/1, PPQN only. Events retain their original timing.
// A lowest-note reduction is educational, not an authentic bass arrangement.
export function parseMidi(buffer){
 const v=new DataView(buffer);let p=0;
 const text=n=>{let s='';while(n--)s+=String.fromCharCode(v.getUint8(p++));return s;};
 const u16=()=>{const n=v.getUint16(p);p+=2;return n;};
 const u32=()=>{const n=v.getUint32(p);p+=4;return n;};
 const vlq=()=>{let n=0,b;do{b=v.getUint8(p++);n=(n<<7)|(b&127);}while(b&128);return n;};
 if(text(4)!=='MThd')throw Error('Invalid MIDI');
 const header=u32(),format=u16(),tracks=u16(),ppqn=u16();
 if(format>1||!ppqn||(ppqn&32768))throw Error('Unsupported MIDI timing');p=8+header;
 const events=[];let tempo=80,beatsPerBar=4,hasTempo=false;
 for(let track=0;track<tracks;track++){
  if(text(4)!=='MTrk')throw Error('Invalid track');const length=u32(),end=p+length;
  let tick=0,running=0;const active=new Map();
  while(p<end){
   tick+=vlq();let status=v.getUint8(p++);
   if(status<128){p--;status=running;}else if(status<240)running=status;
   if(!status)throw Error('Invalid running status');
   if(status===255){const type=v.getUint8(p++),len=vlq();
    if(type===81&&len===3&&!hasTempo){tempo=60000000/((v.getUint8(p)<<16)|(v.getUint8(p+1)<<8)|v.getUint8(p+2));hasTempo=true;}
    if(type===88&&tick===0)beatsPerBar=v.getUint8(p)*4/2**v.getUint8(p+1);
    p+=len;continue;
   }
   if(status===240||status===247){const len=vlq();p+=len;continue;}
   const command=status>>4,channel=status&15,a=v.getUint8(p++),b=[12,13].includes(command)?0:v.getUint8(p++),key=`${channel}/${a}`;
   if(command===9&&b>0)active.set(key,{tick,midi:a,velocity:b/127,track});
   else if(command===8||(command===9&&b===0)){
    const n=active.get(key);if(n&&tick>n.tick&&channel!==9)events.push({beat:n.tick/ppqn,duration:(tick-n.tick)/ppqn,midi:n.midi,velocity:n.velocity,track});active.delete(key);
   }
  }
  p=end;
 }
 if(!events.length)throw Error('Empty MIDI');
 events.sort((a,b)=>a.beat-b.beat||a.midi-b.midi);
 const notes=[],backing=[];
 for(let i=0;i<events.length;){
  let j=i+1;while(j<events.length&&events[j].beat===events[i].beat)j++;
  const group=events.slice(i,j),low=group[0];
  if(low.midi<60){let midi=low.midi;while(midi<28)midi+=12;while(midi>55)midi-=12;notes.push({...low,midi});backing.push(...group.slice(1));}
  else backing.push(...group);i=j;
 }
 for(let i=0;i<notes.length-1;i++)notes[i].duration=Math.min(notes[i].duration,notes[i+1].beat-notes[i].beat);
 const totalBeats=Math.ceil(Math.max(...events.map(n=>n.beat+n.duration))/beatsPerBar)*beatsPerBar;
 return {tempo:Math.max(30,Math.min(200,Math.round(tempo))),beatsPerBar,totalBeats,notes,backing,
  bars:Array.from({length:totalBeats/beatsPerBar},(_,i)=>({beat:i*beatsPerBar,length:beatsPerBar,chord:'',root:null,quality:''}))};
}
