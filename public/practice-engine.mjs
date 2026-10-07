export const GROUPS={technique:'Técnica',application:'Aplicación musical',songs:'Piezas originales'};
export const catalog=[
 {id:'open-strings',title:'Cuerdas al aire',group:'technique',level:'basic',minutes:5,goal:'Sostener el pulso y cambiar de cuerda',generated:'strings'},
 {id:'major-scale',title:'Escala de Do mayor',group:'technique',level:'basic',minutes:5,goal:'Reconocer notas y coordinar ambas manos',generated:'scale'},
 {id:'triads',title:'Tríadas mayores y menores',group:'technique',level:'basic',minutes:8,goal:'Escuchar la diferencia entre terceras',lesson:'B03',material:'concepto'},
 {id:'pentatonic',title:'Pentatónicas en grupos de tres',group:'technique',level:'basic',minutes:8,goal:'Conectar notas sin perder el pulso',lesson:'B07',material:'pattern'},
 {id:'blues',title:'Blues en Do · 12 compases',group:'application',level:'basic',minutes:10,goal:'Seguir la forma del blues',generated:'blues',lesson:'I03'},
 {id:'two-feel',title:'Blues: acompañamiento en dos',group:'application',level:'intermediate',minutes:10,goal:'Alternar fundamentales y quintas',lesson:'I03',material:'forma'},
 {id:'ii-v-i',title:'Progresión ii–V–I mayor',group:'application',level:'intermediate',minutes:10,goal:'Conectar funciones armónicas',lesson:'I07',material:'progresion'},
 {id:'walking',title:'Walking bass en negras',group:'application',level:'intermediate',minutes:12,goal:'Construir una línea continua',lesson:'I09',material:'solo'},
 {id:'turnaround',title:'Turnarounds y reharmonización',group:'application',level:'advanced',minutes:15,goal:'Seguir cambios armónicos más frecuentes',lesson:'A07',material:'solo'},
 {id:'first-groove',title:'Primer encuentro',group:'songs',level:'basic',minutes:8,goal:'Acompañar una pieza original de ocho compases',generated:'song1'},
 {id:'evening',title:'Paseo al atardecer',group:'songs',level:'basic',minutes:10,goal:'Explorar una progresión menor en una pieza original',generated:'song2'}
];
const roots={C:36,D:38,E:40,F:29,G:31,A:33,B:35};
const pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
export function generatedScore(type, difficulty='roots') {
  if(type==='strings'||type==='scale') {
    const pitches=type==='strings'?[28,28,33,33,38,38,43,43]:[36,38,40,41,43,45,47,48,47,45,43,41,40,38,36,36];
    return {tempo:60,beatsPerBar:4,totalBeats:pitches.length,
      bars:Array.from({length:pitches.length/4},(_,i)=>({beat:i*4,length:4,chord:type==='scale'?'C':'',root:type==='scale'?36:null,quality:'major'})),
      notes:pitches.map((midi,beat)=>({beat,duration:1,midi}))};
  }
  const chords=type==='blues'?['C7','C7','C7','C7','F7','F7','C7','C7','G7','F7','C7','G7']:
    type==='song2'?['Am','Am','Dm','Dm','E7','E7','Am','Am']:['C','C','F','F','G7','G7','C','C'];
  const bars=chords.map((chord,i)=>({beat:i*4,length:4,chord,root:roots[chord[0]],quality:chord.includes('m')?'minor':chord.includes('7')?'dominant':'major'}));
  const notes=[];
  for (let i=0;i<bars.length;i++) {
    const b=bars[i], third=b.quality==='minor'?3:4;
    const intervals=difficulty==='roots'?[0,0]:difficulty==='fifths'?[0,7]:[0,third,7,b.quality==='dominant'?10:12];
    intervals.forEach((n,j)=>notes.push({beat:b.beat+j*4/intervals.length,duration:4/intervals.length,midi:b.root+n}));
    if(difficulty==='walking') {
      const next=bars[(i+1)%bars.length].root;
      notes[notes.length-1].midi=next+1;
    }
  }
  return {tempo:72,beatsPerBar:4,totalBeats:bars.length*4,bars,notes};
}
export function parseScore(xml, Parser=globalThis.DOMParser) {
  const doc=new Parser().parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror')) throw Error('No pudimos leer la partitura.');
  const part=doc.querySelector('part');
  if(!part) throw Error('Partitura sin notas.');
  let division=1, transpose=-12, time=0, beatsPerBar=4, tempo=72, chord='', root=null,quality='major';
  const notes=[],bars=[];
  for(const measure of part.querySelectorAll(':scope > measure')) {
    const attrs=measure.querySelector('attributes');
    if(attrs?.querySelector('divisions')) division=Number(attrs.querySelector('divisions').textContent);
    if(attrs?.querySelector('time')) beatsPerBar=Number(attrs.querySelector('beats').textContent)*4/Number(attrs.querySelector('beat-type').textContent);
    if(attrs?.querySelector('transpose')) {
      const t=attrs.querySelector('transpose');
      transpose=Number(t.querySelector('chromatic')?.textContent||0)+12*Number(t.querySelector('octave-change')?.textContent||0);
    }
    const sound=measure.querySelector('sound[tempo]');
    if(sound) tempo=Number(sound.getAttribute('tempo'));
    let cursor=0,end=0,lastStart=0;
    for(const el of measure.children) {
      if(el.tagName==='harmony') {
        const step=el.querySelector('root-step')?.textContent, alter=Number(el.querySelector('root-alter')?.textContent||0);
        const kind=el.querySelector('kind');
        quality=kind?.textContent||'major';
        if(step){root=roots[step]+alter;chord=step+(alter===-1?'b':alter===1?'#':'')+(kind?.getAttribute('text')??({minor:'m',dominant:'7','major-seventh':'maj7','minor-seventh':'m7'}[quality]||''));}
      }
      if(el.tagName==='backup') cursor-=Number(el.querySelector('duration')?.textContent||0)/division;
      if(el.tagName==='forward') cursor+=Number(el.querySelector('duration')?.textContent||0)/division;
      if(el.tagName!=='note') continue;
      const duration=Number(el.querySelector('duration')?.textContent||0)/division;
      const start=el.querySelector('chord')?lastStart:cursor;
      const p=el.querySelector('pitch');
      if(p && duration>0) {
        const midi=12*(Number(p.querySelector('octave').textContent)+1)+pc[p.querySelector('step').textContent]+Number(p.querySelector('alter')?.textContent||0)+transpose;
        notes.push({beat:time+start,duration,midi});
      }
      if(!el.querySelector('chord')){lastStart=cursor;cursor+=duration;}
      end=Math.max(end,cursor);
    }
    const length=Math.max(end,beatsPerBar);
    bars.push({beat:time,length,chord,root,quality});
    time+=length;
  }
  return {tempo,beatsPerBar,totalBeats:time,bars,notes:notes.sort((a,b)=>a.beat-b.beat)};
}
export function playablePosition(midi,instrument='electricBass') {
  const strings=[43,38,33,28], max=instrument==='doubleBass'?24:24;
  const choices=strings.map((open,string)=>({string,fret:midi-open})).filter(x=>x.fret>=0&&x.fret<=max);
  return choices.sort((a,b)=>a.fret-b.fret)[0]||null;
}
// One AudioContext timeline drives sound, cursor, falling notes, tempo and loops.
export class PracticeEngine {
  constructor(onFrame=()=>{},onEnd=()=>{}) {this.onFrame=onFrame;this.onEnd=onEnd;this.nodes=new Set();this.playing=false;this.beat=0;this.guide=true;this.metronome=true;this.loop=false;this.increment=0;this.tempo=72;this.volume=.6;}
  load(score){this.stop();this.score=score;this.tempo=score.tempo;this.start=0;this.end=score.totalBeats;this.beat=0;}
  position(){return this.playing?this.anchorBeat+(this.context.currentTime-this.anchorTime)*this.tempo/60:this.beat;}
  async play(){
    if(!this.score||this.playing)return;
    this.context??=new (window.AudioContext||window.webkitAudioContext)();
    const run=this.playRun=(this.playRun||0)+1;
    await this.context.resume();
    if(run!==this.playRun)return;
    if(this.beat>=this.end)this.beat=this.start;
    this.playing=true;this.anchorBeat=this.beat;this.anchorTime=this.context.currentTime+.06;this.schedule();this.tick();
  }
  tone(midi,start,duration,gain=.1,type='triangle'){
    const o=this.context.createOscillator(),g=this.context.createGain();
    o.type=type;o.frequency.value=440*2**((midi-69)/12);
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain*this.volume,start+.008);
    g.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.025,duration));
    o.connect(g);g.connect(this.context.destination);o.start(start);o.stop(start+duration+.03);
    this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};
  }
  schedule(){
    const from=this.anchorBeat,until=this.end,s=60/this.tempo;
    if(this.guide)for(const n of this.score.notes)if(n.beat>=from&&n.beat<until)
      this.tone(n.midi,this.anchorTime+(n.beat-from)*s,Math.min(n.duration,until-n.beat)*s*.85,.13);
    for(const bar of this.score.bars)if(bar.beat>=from&&bar.beat<until&&bar.root!==null){
      const third=bar.quality.includes('minor')?3:4;
      for(const interval of [12,12+third,19])this.tone(bar.root+interval,this.anchorTime+(bar.beat-from)*s,Math.min(2,bar.length)*s,.018,'sine');
    }
    if(this.metronome)for(let b=Math.ceil(from);b<until;b++)this.tone(b%this.score.beatsPerBar===0?88:81,this.anchorTime+(b-from)*s,.035,.08,'sine');
  }
  tick(){
    if(!this.playing)return;
    const pos=Math.max(this.start,this.position());
    if(pos>=this.end){
      this.pause();this.beat=this.start;
      if(this.loop){this.tempo=Math.min(200,this.tempo+this.increment);void this.play();}
      else this.onEnd();
      return;
    }
    this.onFrame(pos,this.tempo);this.frame=requestAnimationFrame(()=>this.tick());
  }
  pause(){this.playRun=(this.playRun||0)+1;if(this.playing)this.beat=Math.min(this.end,Math.max(this.start,this.position()));this.playing=false;cancelAnimationFrame(this.frame);for(const n of this.nodes){try{n.stop();}catch{}}this.nodes.clear();}
  stop(){this.pause();this.beat=this.start||0;}
  seek(beat){const was=this.playing;this.pause();this.beat=Math.max(this.start,Math.min(this.end,beat));if(was)void this.play();else this.onFrame(this.beat,this.tempo);}
  configure(values){const was=this.playing;this.pause();Object.assign(this,values);this.beat=Math.max(this.start,Math.min(this.end,this.beat));if(was)void this.play();}
}
