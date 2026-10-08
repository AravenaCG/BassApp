export const TONICS=['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B','C#','D#','Gb','G#','A#'];
const letters=['C','D','E','F','G','A','B'],latin=['Do','Re','Mi','Fa','Sol','La','Si'],natural=[0,2,4,5,7,9,11];
const mod=(n,m)=>((n%m)+m)%m;
export function tonicInfo(root){
 if(!TONICS.includes(root))throw Error('Tónica no válida');
 const index=letters.indexOf(root[0]),alter=root.endsWith('#')?1:root.endsWith('b')?-1:0;
 return {index,pc:mod(natural[index]+alter,12),latin:latin[index]+(alter===1?' sostenido':alter===-1?' bemol':'')};
}
export function degreeOffset(degree){
 const match=/^(bb|##|b|#)?(\d+)$/.exec(degree);if(!match)throw Error('Grado no válido');
 const d=Number(match[2])-1,a=match[1]||'';
 return natural[d%7]+12*Math.floor(d/7)+(a.includes('b')?-a.length:a.length);
}
export function spellDegree(root,degree,octave=2,scale=false){
 const tonic=tonicInfo(root),number=Number(degree.match(/\d+/)[0]);
 let degreeIndex=number-1,offset=degreeOffset(degree);
 if(scale&&number>8){degreeIndex%=7;offset=mod(offset,12);}
 const index=(tonic.index+degreeIndex)%7;
 const baseMidi=12*(octave+1)+natural[tonic.index]+(root.endsWith('#')?1:root.endsWith('b')?-1:0);
 const writtenOctave=octave+Math.floor((tonic.index+degreeIndex)/7),target=baseMidi+offset;
 const alteration=target-(12*(writtenOctave+1)+natural[index]);
 const accidental=alteration>0?'#'.repeat(alteration):'b'.repeat(-alteration);
 const suffix=alteration===0?'':alteration===1?' sostenido':alteration===-1?' bemol':alteration===2?' doble sostenido':alteration===-2?' doble bemol':` (${alteration>0?'+':''}${alteration} semitonos)`;
 return {midi:target,letter:letters[index],alteration,octave:writtenOctave,symbol:letters[index]+accidental,latin:latin[index]+suffix,degree};
}
const scale=(id,name,degrees,chord,aliases='')=>({id,name,degrees:degrees.split(' '),chord,kind:'scale',aliases});
const arp=(id,name,degrees,chord)=>({...scale(id,name,degrees,chord),kind:'arpeggio'});
export const ATLAS_FAMILIES=[
 scale('major','mayor (jónica)','1 2 3 4 5 6 7 8','maj7','major ionian ionico'),
 scale('dorian','dórica','1 2 b3 4 5 6 b7 8','m7','dorian dorico'),
 scale('phrygian','frigia','1 b2 b3 4 5 b6 b7 8','m7','phrygian frigio'),
 scale('lydian','lidia','1 2 3 #4 5 6 7 8','maj7(#11)','lydian lidio'),
 scale('mixolydian','mixolidia','1 2 3 4 5 6 b7 8','7','mixolydian mixolidio'),
 scale('natural-minor','menor natural (eólica)','1 2 b3 4 5 b6 b7 8','m7','minor aeolian eolico'),
 scale('locrian','locria','1 b2 b3 4 b5 b6 b7 8','m7b5','locrian locrio'),
 scale('pent-major','pentatónica mayor','1 2 3 5 6 8','6','major pentatonic pentatonica'),
 scale('pent-minor','pentatónica menor','1 b3 4 5 b7 8','m7','minor pentatonic pentatonica'),
 scale('blues-minor','blues menor','1 b3 4 b5 5 b7 8','m7','blues'),
 scale('blues-major','blues mayor','1 2 b3 3 5 6 8','6','blues'),
 scale('harmonic-minor','menor armónica','1 2 b3 4 5 b6 7 8','m(maj7)','harmonic minor'),
 scale('locrian-six','locria con sexta natural','1 b2 b3 4 b5 6 b7 8','m7b5'),
 scale('ionian-aug','jónica aumentada','1 2 3 4 #5 6 7 8','maj7(#5)'),
 scale('dorian-sharp4','dórica con cuarta aumentada','1 2 b3 #4 5 6 b7 8','m7'),
 scale('phrygian-dom','frigia dominante','1 b2 3 4 5 b6 b7 8','7(b9)'),
 scale('lydian-sharp2','lidia con segunda aumentada','1 #2 3 #4 5 6 7 8','maj7(#11)'),
 scale('ultralocrian','ultralocria','1 b2 b3 b4 b5 b6 bb7 8','dim7'),
 scale('melodic-minor','menor melódica (jazz)','1 2 b3 4 5 6 7 8','m(maj7)','melodic minor'),
 scale('dorian-b2','dórica con segunda menor','1 b2 b3 4 5 6 b7 8','m7'),
 scale('lydian-aug','lidia aumentada','1 2 3 #4 #5 6 7 8','maj7(#5)'),
 scale('lydian-dom','lidia dominante','1 2 3 #4 5 6 b7 8','7(#11)'),
 scale('mixolydian-b6','mixolidia con sexta menor','1 2 3 4 5 b6 b7 8','7'),
 scale('locrian-two','locria con segunda natural','1 2 b3 4 b5 b6 b7 8','m7b5'),
 scale('altered','alterada','1 b9 #9 3 b5 #5 b7 8','7alt','altered'),
 scale('bebop-dom','bebop dominante','1 2 3 4 5 6 b7 7 8','7','dominant bebop'),
 scale('bebop-major','bebop mayor','1 2 3 4 5 #5 6 7 8','maj7'),
 scale('whole-tone','tonos enteros','1 2 3 #4 #5 b7 8','7(#5)','whole tone'),
 scale('dim-half','disminuida semitono–tono','1 b2 #2 3 #4 5 6 b7 8','7(b9)','half whole octatonica'),
 scale('dim-whole','disminuida tono–semitono','1 2 b3 4 b5 b6 6 7 8','dim7','whole half octatonica'),
 scale('chromatic','cromática','1 b2 2 b3 3 4 b5 5 b6 6 b7 7 8',null,'chromatic'),
 arp('triad-major','mayor','1 3 5',''),arp('triad-minor','menor','1 b3 5','m'),
 arp('triad-dim','disminuido','1 b3 b5','dim'),arp('triad-aug','aumentado','1 3 #5','aug'),
 arp('first-inversion','mayor · primera inversión','3 1 5','/3'),
 arp('maj7','mayor séptima','1 3 5 7','maj7'),arp('dom7','séptima dominante','1 3 5 b7','7'),
 arp('min7','menor séptima','1 b3 5 b7','m7'),arp('half-dim','semidisminuido','1 b3 b5 b7','m7b5'),
 arp('dim7','séptima disminuida','1 b3 b5 bb7','dim7'),arp('minmaj7','menor con séptima mayor','1 b3 5 7','m(maj7)'),
 arp('maj9','mayor novena','1 3 5 7 9','maj9'),arp('min9','menor novena','1 b3 5 b7 9','m9'),
 arp('dom13','dominante con trecena','1 3 5 b7 9 13','13'),
 arp('domalt','dominante alterado · selección de tensiones','1 3 b5 b7 b9 #9 #5','7alt'),
 arp('dom-b9','dominante con novena menor','1 3 5 b7 b9','7b9')
];
export function atlasItem(familyId,root='C'){
 const family=ATLAS_FAMILIES.find(f=>f.id===familyId);if(!family)throw Error('Familia no válida');const tonic=tonicInfo(root);
 const pitches=family.degrees.map(d=>spellDegree(root,d,2,family.kind==='scale'));
 const symbol=family.chord==='/3'?root+'/'+spellDegree(root,'3').symbol:family.chord===null?root:root+family.chord;
 return {...family,root,pitches,symbol,tonic:tonic.latin,title:`${symbol} / ${tonic.latin} · ${family.name}`};
}
export function atlasScore(item){
 const path=[...item.pitches,...item.pitches.slice(0,-1).reverse()],notes=path.map((p,beat)=>({...p,beat,duration:1}));
 const totalBeats=Math.ceil(notes.length/4)*4;
 return {tempo:64,beatsPerBar:4,totalBeats,notes,bars:Array.from({length:totalBeats/4},(_,i)=>({beat:i*4,length:4,chord:'',root:null,quality:''}))};
}
export const normalizeSearch=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♭/g,'b').replace(/♯/g,'#').toLowerCase().trim();
export function searchAtlas(query,root='C',kind='all'){
 let text=normalizeSearch(query),chosen=root;
 const aliases=TONICS.map(r=>({root:r,aliases:[normalizeSearch(r),normalizeSearch(tonicInfo(r).latin),normalizeSearch(tonicInfo(r).latin).replace(' bemol','b').replace(' sostenido','#')]}));
 // A search can override the selector: "Sib pentatónica" finds Bb without requiring a second action.
 const candidates=aliases.flatMap(r=>r.aliases.map(a=>({a,root:r.root}))).sort((a,b)=>b.a.length-a.a.length);
 const match=candidates.find(({a})=>text===a||text.startsWith(a+' '));
 if(match){chosen=match.root;text=text.slice(match.a.length).trim();}
 else{const chord=/^([a-g](?:#|b)?)(?=(?:maj|dim|aug|m|7|6|9|13|\/))/.exec(text);if(chord){const candidate=chord[1][0].toUpperCase()+chord[1].slice(1);if(TONICS.includes(candidate))chosen=candidate;}}
 return ATLAS_FAMILIES.filter(f=>kind==='all'||f.kind===kind).map(f=>atlasItem(f.id,chosen)).filter(i=>{
  const hay=normalizeSearch(`${i.title} ${i.kind==='scale'?'escala':'arpegio'} ${i.aliases} ${i.symbol}`);
  return text.split(/\s+/).every(t=>hay.includes(t));
 });
}
export function localDate(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function dailyChallenge(date=localDate()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('Fecha no válida');
 const day=Math.floor(Date.parse(date+'T12:00:00Z')/86400000),root=TONICS[mod(day,12)];
 const sets=[['major','lydian','mixolydian'],['natural-minor','dorian','phrygian'],['melodic-minor','harmonic-minor','natural-minor']];
 return {date,root,families:sets[mod(Math.floor(day/12),sets.length)]};
}
export function challengeURL(challenge,base){
 const url=new URL(base);url.hash='escalas?reto=modos&fecha='+challenge.date;return url.href;
}
