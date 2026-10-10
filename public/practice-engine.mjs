import {activeRepertoire,backingTracks} from './repertoire.mjs';
import {positions} from './fingering.mjs';
import {bassSound,BASS_SOUNDS,BASS_BANKS,loadBassBank,nearestBassSample} from './bass-sounds.mjs';
export const GENRES=[['rock','Rock','Pulso firme y notas cortas',[0,0,7,0]],['funk','Funk','Síncopas y silencios',[0,7,10,7]],['reggae','Reggae','Espacio y duración',[0,7,0,7]],['cumbia','Cumbia','Fundamental y quinta',[0,7,0,7]],['jazz','Jazz','Conectar notas del acorde',[0,4,7,10]],['blues','Blues','Forma de doce compases',[0,7,9,10]],['bossa','Bossa','Acompañamiento en dos',[0,7,0,7]],['pop','Pop','Motivos claros y repetición',[0,0,7,12]]];
const genreItems=GENRES.map(([id,title,goal])=>({id:'genre-'+id,title:title+' · estudio original',goal,generated:'genre-'+id,group:'application',level:'basic',minutes:8}));
export const GROUPS={technique:'Técnica',application:'Aplicación musical',songs:'Piezas originales',backing:'Pistas originales · samples CC0',standards:'Repertorio beta · ragtime'};
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
 ,...genreItems,...backingTracks.map(track=>({id:track.id,title:track.title,group:'backing',level:'intermediate',minutes:10,goal:'Practicar con acompañamiento original; no es una transcripción de un standard',generated:track.id})),
 ...activeRepertoire().filter(r=>r.midi).map(r=>({...r,group:'standards',level:'advanced',minutes:15,goal:'Reducción automática didáctica del registro grave del piano; no es una parte original de contrabajo'}))
];
const roots={C:36,D:38,E:40,F:29,G:31,A:33,B:35};
const pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
// +4 dB for musical voices; keep the short metronome click at its existing level.
export const PRACTICE_MUSIC_BOOST=10**(4/20);
export function generatedScore(type, difficulty='roots') {
  if(type.startsWith('genre-')){
    const [id,,goal,motif]=GENRES.find(g=>type==='genre-'+g[0])||GENRES[0];
    const base=generatedScore(id==='blues'?'blues':'song1',difficulty);
    const rhythms={rock:[0,1,2,3],funk:[0,.75,2,2.75],reggae:[0,1.5,2.5,3],cumbia:[0,1.5,2,3.5],jazz:[0,1,2,3],blues:[0,1,2,3],bossa:[0,1.5,2,3.5],pop:[0,1,2.5,3]};
    base.notes=base.bars.flatMap(b=>rhythms[id].map((offset,i)=>({beat:b.beat+offset,duration:Math.min(.65,4-offset),midi:b.root+(difficulty==='roots'?0:difficulty==='fifths'?(i%2?7:0):motif[i])})));
    const accents={rock:[0,2],funk:[.5,1.75,2.5,3.75],reggae:[.5,1.5,2.5,3.5],cumbia:[0,1.5,2,3.5],jazz:[0,2+2/3],blues:[0,2],bossa:[0,1.5,2.5,3.5],pop:[0,1,2,3]};
    base.backing=base.bars.flatMap(b=>accents[id].flatMap(offset=>[12,16,19].map(interval=>({beat:b.beat+offset,duration:Math.min(.3,4-offset),midi:b.root+interval}))));
    if(difficulty==='walking')base.bars.forEach((b,i)=>{base.notes[i*4+3].midi=base.bars[(i+1)%base.bars.length].root+1;});
    return {...base,style:id==='jazz'||id==='blues'?'swing':'straight',genre:id,goal,tempo:id==='reggae'?65:id==='funk'?90:80};
  }
  if(type==='strings'||type==='strings5'||type==='scale') {
    const pitches=type==='strings5'?[23,23,28,28,33,33,38,38,43,43,43,43]:type==='strings'?[28,28,33,33,38,38,43,43]:[36,38,40,41,43,45,47,48,47,45,43,41,40,38,36,36];
    return {tempo:60,beatsPerBar:4,totalBeats:pitches.length,
      bars:Array.from({length:pitches.length/4},(_,i)=>({beat:i*4,length:4,chord:type==='scale'?'C':'',root:type==='scale'?36:null,quality:'major'})),
      notes:pitches.map((midi,beat)=>({beat,duration:1,midi}))};
  }
  const track=backingTracks.find(t=>t.id===type);
  const chords=track?.chords||(type==='blues'?['C7','C7','C7','C7','F7','F7','C7','C7','G7','F7','C7','G7']:
    type==='song2'?['Am','Am','Dm','Dm','E7','E7','Am','Am']:['C','C','F','F','G7','G7','C','C']);
  const bars=chords.map((chord,i)=>({beat:i*4,length:4,chord,root:roots[chord[0]],quality:chord.includes('maj7')?'major-seventh':chord.includes('m7b5')?'half-diminished':chord.includes('m')?'minor':chord.includes('7')?'dominant':'major'}));
  const notes=[];
  for (let i=0;i<bars.length;i++) {
    const b=bars[i], third=['minor','half-diminished'].includes(b.quality)?3:4,fifth=b.quality==='half-diminished'?6:7;
    const intervals=difficulty==='roots'?[0,0]:difficulty==='fifths'?[0,fifth]:[0,third,fifth,b.chord.includes('7')?(b.quality==='major-seventh'?11:10):12];
    intervals.forEach((n,j)=>notes.push({beat:b.beat+j*4/intervals.length,duration:4/intervals.length,midi:b.root+n}));
    if(difficulty==='walking') {
      const next=bars[(i+1)%bars.length].root;
      notes[notes.length-1].midi=next+1;
    }
  }
  return {tempo:72,beatsPerBar:4,totalBeats:bars.length*4,bars,notes,style:track?.style};
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
  const choices=positions(midi,instrument);
  return choices.sort((a,b)=>a.fret-b.fret)[0]||null;
}
// One AudioContext timeline drives sound, cursor, falling notes, tempo and loops.
export class PracticeEngine {
  constructor(onFrame=()=>{},onEnd=()=>{}) {this.onFrame=onFrame;this.onEnd=onEnd;this.nodes=new Set();this.playing=false;this.beat=0;this.guide=true;this.mix='full';this.metronome=true;this.loop=false;this.increment=0;this.tempo=72;this.volume=.6;}
  load(score){this.stop();this.score=score;this.tempo=score.tempo;this.start=0;this.end=score.totalBeats;this.beat=0;}
  position(){return this.playing?this.anchorBeat+(this.context.currentTime-this.anchorTime)*this.tempo/60:this.beat;}
  async unlock(){this.context??=new (window.AudioContext||window.webkitAudioContext)();await this.context.resume();}
  async play(){
    if(!this.score||this.playing)return;
    this.context??=new (window.AudioContext||window.webkitAudioContext)();
    const run=this.playRun=(this.playRun||0)+1;
    await this.context.resume();
    if(!this.output){
      this.output=this.context.createDynamicsCompressor();this.output.threshold.value=-6;this.output.knee.value=6;this.output.ratio.value=12;this.output.attack.value=.003;this.output.release.value=.15;this.output.connect(this.context.destination);
    }
    this.samplesReady??=this.loadSamples();await this.samplesReady;
    await this.prepareBass(run);
    if(run!==this.playRun)return;
    if(this.beat>=this.end)this.beat=this.start;
    this.playing=true;this.anchorBeat=this.beat;this.anchorTime=this.context.currentTime+.06;this.schedule();this.tick();
  }
  tone(midi,start,duration,gain=.1,type='bass'){
    if(this.volume<=0)return;
    if(type==='bass'&&this.bassBank?.length){this.bassSample(midi,start,duration,gain);return;}
    const o=this.context.createOscillator(),g=this.context.createGain();
    const length=Math.max(.025,duration);
    o.frequency.value=440*2**((midi-69)/12);
    if(type==='bass'){
      // One dry, phase-aligned voice: no delay, chorus, detuning or reverb.
      // Upper partials make low notes readable on small speakers. Explicitly
      // bounded amplitudes retain the existing peak gain and mix headroom.
      this.bassWave??=this.context.createPeriodicWave(new Float32Array(6),
        Float32Array.from([0,1,.45,.2,.08,.035],n=>n/1.765),{disableNormalization:true});
      o.setPeriodicWave(this.bassWave);
      const peak=gain*this.volume,attack=Math.min(.004,length*.12),
        release=Math.min(.025,length*.2),decay=Math.min(.08,length*.35);
      g.gain.setValueAtTime(0,start);
      g.gain.linearRampToValueAtTime(peak,start+attack);
      g.gain.exponentialRampToValueAtTime(peak*.58,start+attack+decay);
      g.gain.exponentialRampToValueAtTime(peak*.32,start+length-release);
      g.gain.linearRampToValueAtTime(0,start+length);
    }else{
      o.type=type;
      g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain*this.volume,start+.008);
      g.gain.exponentialRampToValueAtTime(.0001,start+length);
    }
    o.connect(g);g.connect(this.output||this.context.destination);o.start(start);o.stop(start+length+(type==='bass'?0:.03));
    this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};
  }
  async prepareBass(run){
    const sound=this.sound||bassSound(),bank=await loadBassBank(this.context,sound);
    if(run!==undefined&&run!==this.playRun)return;
    this.bassBank=bank;
    this.bassStatus=sound==='synth'?BASS_SOUNDS.synth:this.bassBank.length?BASS_SOUNDS[sound]+(this.bassBank.length<BASS_BANKS[sound].length?' · banco parcial':''):'Respaldo sintetizado · no se cargaron las muestras';
    this.onSoundStatus?.(this.bassStatus);
  }
  bassSample(midi,start,duration,gain){
    const row=nearestBassSample(this.bassBank,midi),source=this.context.createBufferSource(),g=this.context.createGain();
    source.buffer=row.buffer;source.playbackRate.value=2**((midi-row.midi)/12);
    const length=Math.max(.025,Math.min(duration,row.buffer.duration/source.playbackRate.value)),release=Math.min(.025,length*.2),peak=gain*this.volume;
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(peak,start+Math.min(.003,length*.1));
    g.gain.setValueAtTime(peak,start+length-release);g.gain.linearRampToValueAtTime(0,start+length);
    source.connect(g);g.connect(this.output||this.context.destination);source.start(start);source.stop(start+length);
    this.nodes.add(source);source.onended=()=>{this.nodes.delete(source);source.disconnect();g.disconnect();};
  }
  async loadSamples(){
    this.buffers={};
    await Promise.all(['piano-c3','hihat'].map(async name=>{
      try{
        const r=await fetch(`samples/${name}.wav`,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();
        const buffer=await this.context.decodeAudioData(await r.arrayBuffer());
        let peak=0;for(let c=0;c<buffer.numberOfChannels;c++)for(const n of buffer.getChannelData(c))peak=Math.max(peak,Math.abs(n));
        if(peak>0)for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(let i=0;i<data.length;i++)data[i]/=peak;}
        this.buffers[name]=buffer;
      }catch{/* Offline/network failures retain synthesized accompaniment. */}
    }));
    this.sampleStatus=this.buffers['piano-c3']&&this.buffers.hihat?'Samples CC0 activos':'Samples incompletos: respaldo sintetizado activo';
  }
  sample(name,midi,start,duration,gain){
    if(this.volume<=0)return;
    const buffer=this.buffers?.[name];
    if(!buffer){this.tone(midi,start,duration,gain,'sine');return;}
    const source=this.context.createBufferSource(),g=this.context.createGain();source.buffer=buffer;
    // VCSL's legacy C3 uses the C3=middle-C convention (~261 Hz), MIDI 60.
    source.playbackRate.value=name==='piano-c3'?2**((midi-60)/12):1;
    g.gain.setValueAtTime(gain*this.volume,start);g.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.025,duration));
    source.connect(g);g.connect(this.output||this.context.destination);source.start(start);source.stop(start+duration+.03);
    this.nodes.add(source);source.onended=()=>{this.nodes.delete(source);source.disconnect();g.disconnect();};
  }
  schedule(){
    const from=this.anchorBeat,until=this.end,s=60/this.tempo;
    if(this.mix==='original'&&this.score.originalNotes){
      for(const n of this.score.originalNotes)if(n.beat>=from&&n.beat<until)this.sample('piano-c3',n.midi,this.anchorTime+(n.beat-from)*s,Math.min(n.duration,until-n.beat)*s,.06*PRACTICE_MUSIC_BOOST*(n.velocity??.7));
      return;
    }
    if(this.guide&&this.mix!=='no-bass')for(const n of this.score.notes)if(n.beat>=from&&n.beat<until)
      this.tone(n.midi,this.anchorTime+(n.beat-from)*s,Math.min(n.duration,until-n.beat)*s*.85,.13*PRACTICE_MUSIC_BOOST);
    if(this.mix!=='bass-only'){
      for(const n of this.score.backing||[])if(n.beat>=from&&n.beat<until)this.sample('piano-c3',n.midi,this.anchorTime+(n.beat-from)*s,Math.min(n.duration,until-n.beat)*s,.035*PRACTICE_MUSIC_BOOST);
      for(const bar of this.score.bars)if(!this.score.backing?.length&&bar.beat>=from&&bar.beat<until&&bar.root!==null){
        const third=bar.quality.includes('minor')||bar.quality==='half-diminished'?3:4;
        const intervals=[12,12+third,bar.quality==='half-diminished'?18:19];
        if(bar.chord.includes('7'))intervals.push(bar.quality==='major-seventh'?23:22);
        for(const interval of intervals)this.sample('piano-c3',bar.root+interval,this.anchorTime+(bar.beat-from)*s,Math.min(2,bar.length)*s,.018*PRACTICE_MUSIC_BOOST);
      }
      if(this.score.style)for(let b=Math.ceil(from);b<until;b++){
        this.sample('hihat',81,this.anchorTime+(b-from)*s,.15,.07);
        const off=this.score.style==='swing'?2/3:1/2;
        if(b+off<until)this.sample('hihat',81,this.anchorTime+(b+off-from)*s,.1,.035);
      }
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
