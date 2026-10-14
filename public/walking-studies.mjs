// Original bass studies. Harmony checked against the four user-supplied parts.
// The source melodies, artwork and PDF files are not included.
const repeat=(value,count)=>Array.from({length:count},()=>value);
const manhaA=['Am','Bm7b5 E7b9','Am','Bm7b5 E7b9','Am','Dm7 G7','Cmaj7','A7b9','Dm7','G7','Cmaj7','Fmaj7','Bm7b5','E7b9','Am','Bm7b5 E7b9'];
const manhaB=['Am','Bm7b5 E7b9','Am','Am','Em7b5','A7b9','Dm','Dm','Dm7 Dm7/C','Bm7b5 E7b9','Am Am7/G','Fmaj7','Bm7b5','E7b9','Am','Bm7b5 E7b9'];
const manhaIntro=['Dm7 Am7','Dm7 Am7','Dm7 Em7','Am7'];
const eChords={Am:'Em',Bm7b5:'F#m7b5',E7b9:'B7b9',Dm7:'Am7',G7:'D7',Cmaj7:'Gmaj7',A7b9:'E7b9',Fmaj7:'Cmaj7',Em7b5:'Bm7b5',Dm:'Am','Dm7/C':'Am7/G','Am7/G':'Em7/D',Am7:'Em7',Em7:'Bm7'};
const toE=bars=>bars.map(bar=>bar.split(' ').map(chord=>eChords[chord]).join(' '));
const headA=['Cmaj7 Dm7 D#dim7 Em7','Em7','Cmaj7 Dm7 D#dim7 Em7','Em7','D7','G7','C6'];
const commonAdvice=[
 'Elegí primero la nota de llegada del próximo acorde. Después escribí el camino hacia ella.',
 'En walking, mantené cuatro negras parejas. Las aproximaciones cromáticas son breves y resuelven; no son nuevos acordes.',
 'En acompañamiento sencillo, sostené las blancas y escuchá el pulso. Con dos acordes por compás, cada blanca sigue su acorde.',
 'Practicá dos compases a 50–60 BPM. Cantá las fundamentales y luego tocá la línea completa. Alterná escuchar sólo bajo y tocar con la mezcla sin bajo.'
];
export const studyForms=[
 {id:'blues-major',title:'Blues mayor en Do',key:'Do mayor / C',tempo:72,sections:{0:'Blues · 12 compases'},bars:['C7','F7','C7','C7','F7','F7','C7','A7','Dm7','G7','C7 A7','Dm7 G7'],modes:['walking'],advice:[
  'Variante de jazz blues con IV7 en el compás 2, VI7 en el 8 y ii–V en 9–10. No es la única armonización del blues mayor.',
  'C7 usa Mi y Sib; F7 usa La y Mib. Buscá la tercera de cada acorde: tocar sólo la escala de Do no describe todos los cambios.',
  'El A7 del compás 8 contiene Do# y prepara Dm7. Escuchá Do# → Re al entrar al compás 9.',
  'Creá tu primera vuelta con fundamentales en 1, terceras o quintas en 2–3 y una aproximación a la siguiente fundamental en 4. Luego variá el contorno sin perder las llegadas.'
 ]},
 {id:'blues-minor',title:'Blues menor en Do',key:'Do menor / Cm',tempo:68,sections:{0:'Blues · 12 compases'},bars:[...repeat('Cm7',4),...repeat('Fm7',2),...repeat('Cm7',2),'Ab7','G7','Cm7','G7'],modes:['walking'],advice:[
  'Variante de 12 compases: i7, iv7 y regreso; Ab7–G7 prepara la llegada a Cm7. El compás 12 usa G7 para repetir.',
  'Cm7 contiene Do–Mib–Sol–Sib; Fm7 contiene Fa–Lab–Do–Mib. Esas terceras menores deben escucharse en la línea.',
  'G7 tiene Si natural: no uses Sib como si fuera su tercera. La sensible Si conduce a Do; es el punto de tensión más claro de esta vuelta.',
  'Escribí primero fundamentales y quintas. Añadí terceras menores y después un único cromatismo antes de cada llegada. No hace falta tocar continuamente la escala de blues.'
 ]},
 {id:'manha-am',title:'Manhã de Carnaval · La menor',key:'La menor / Am',tempo:80,bars:[...manhaIntro,...manhaA,...manhaB],sections:{0:'Intro',4:'A',20:'B'},modes:['walking','simple'],advice:[
  'Forma: intro de 4 compases + A de 16 + B de 16. Se omite el compás vacío previo a la intro de tu hoja.',
  'Acompañamiento sencillo en dos: fundamentales y quintas en blancas. Es una base de estudio; después podés trabajar articulación y anticipaciones de bossa.',
  'El walking propone una lectura en cuatro para estudiar enlaces armónicos. Comparalo con la calma del acompañamiento en dos.',
  'En los compases 29 y 31, respetá el bajo escrito después de la barra: Dm7/C y Am7/G. En E7b9, Sol# es tercera y conduce a La.'
 ]},
 {id:'manha-em',title:'Manhã de Carnaval · Mi menor',key:'Mi menor / Em',tempo:80,bars:toE([...manhaIntro,...manhaA,...manhaB]),sections:{0:'Intro',4:'A',20:'B'},modes:['walking','simple'],advice:[
  'Forma: intro de 4 compases + A de 16 + B de 16, según la versión en Mi de tu hoja. Se omite el compás vacío previo.',
  'Acompañamiento sencillo en dos: dos blancas por compás o una por cada acorde. El walking permite estudiar la misma armonía en negras.',
  'En B7b9, Re# define la tercera mayor y conduce a Mi. En F#m7b5, la quinta es Do natural.',
  'Los compases 29 y 31 contienen Am7/G y Em7/D: sostené esos bajos descendentes al cambiar de acorde.'
 ]},
 {id:'birks',title:"Birk’s Works · Do menor",key:'Do menor / Cm',tempo:76,bars:[...repeat('Cm7',4),...repeat('Fm7',2),...repeat('Cm7',2),'Ab7','G7','Cm7','Cm7'],sections:{0:'A · chorus de 12 compases'},modes:['walking','simple'],advice:[
  'Un chorus de 12 compases según el cifrado de tu parte. Se excluye la anacrusa melódica: el bajo empieza en el primer Cm7.',
  'Los acordes sin cifrado nuevo continúan vigentes: Cm7 en 1–4, Fm7 en 5–6, Cm7 en 7–8 y 11–12.',
  'Ab7 → G7 → Cm7 es el enlace clave. Distinguí Solb, séptima de Ab7, de Si natural, tercera de G7.',
  'El acompañamiento en dos deja espacio a la melodía. Para tu walking, conservá primero las llegadas y cambiá sólo las notas intermedias.'
 ]},
 {id:'dont-get-around',title:'Don’t Get Around Much Anymore',key:'Do mayor / C',tempo:80,bars:[...headA,'G7',...headA,'Gm7 C7','F6','F#dim7','Cmaj7','C7','F6','F#m7b5 B7b9','Em7 Ebdim7','Dm7 G7',...headA,'C6'],sections:{0:'A1',8:'A2',16:'B',24:'A3'},modes:['walking','simple'],advice:[
  'Forma desarrollada AABA de 32 compases. A1 termina en G7; A2 termina en Gm7–C7 para entrar al puente en F6.',
  'Adaptación de estudio: los cambios anticipados Cmaj7–Dm7–D#dim7–Em7 se ubican en los cuatro pulsos de los compases 1, 3, 9, 11, 25 y 27. Ensayá después las anticipaciones de la parte original con el ensamble.',
  'En esos compases, incluso el acompañamiento sencillo usa negras para seguir los cuatro acordes. En los demás, usa blancas.',
  'D#dim7 conduce a Em7; F#dim7 conecta F6 con Cmaj7. En el puente aparece F#m7b5–B7b9–Em7 y luego Ebdim7–Dm7–G7.'
 ]}
];
export const walkingCatalog=studyForms.flatMap(form=>form.modes.map(mode=>({id:form.id+'-'+mode,study:form.id,mode,title:form.title+' · '+(mode==='walking'?'Walking':'Acompañamiento en dos'),group:'walking-studies',level:mode==='walking'?'intermediate':'basic',minutes:12,goal:'Leer el cifrado, escuchar las llegadas y construir tu propia línea.',pdf:`practice-studies/${form.id}-${mode}.pdf`})));
const pcs={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function pitchClass(name){return (pcs[name[0]]+(name.includes('#')?1:name.includes('b')?-1:0)+12)%12;}
function nearest(pc,previous=36){return Array.from({length:3},(_,i)=>24+pc+12*i).filter(m=>m>=28&&m<=47).sort((a,b)=>Math.abs(a-previous)-Math.abs(b-previous)||a-b)[0];}
function chordInfo(symbol){
 const [main,bass]=symbol.split('/'),rootName=main.match(/^[A-G][#b]?/)[0],suffix=main.slice(rootName.length),root=pitchClass(rootName);
 const minor=suffix.startsWith('m')&&!suffix.startsWith('maj'),dim=suffix.includes('dim'),half=suffix.includes('b5');
 return {symbol,rootName,root,bass:pitchClass(bass||rootName),bassName:bass||rootName,third:minor||dim?3:4,fifth:dim||half?6:7,seventh:dim?9:suffix.includes('maj7')?11:suffix==='6'?9:10,suffix,quality:dim?'diminished':half?'half-diminished':minor?'minor':'major'};
}
function spelling(midi,chord,interval){
 if(interval!=null){const degree=interval===0?0:interval===chord.third?2:interval===chord.fifth?4:interval===chord.seventh?(chord.suffix==='6'?5:6):null;
  if(degree!=null){const letter='CDEFGAB'[('CDEFGAB'.indexOf(chord.rootName[0])+degree)%7];let alter=((midi%12)-pcs[letter]+18)%12-6;return letter+(alter>0?'#'.repeat(alter):'b'.repeat(-alter));}}
 return (chord.rootName.includes('#')||['E','A','B'].includes(chord.rootName)?['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']:['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'])[midi%12];
}
export function walkingScore(id,mode='walking'){
 const form=studyForms.find(f=>f.id===id);if(!form||!form.modes.includes(mode))throw Error('Estudio no válido');
 const events=form.bars.flatMap((bar,index)=>{const chords=bar.split(' ');return chords.map((s,j)=>({...chordInfo(s),beat:index*4+j*4/chords.length,length:4/chords.length}));});
 const notes=[],backing=[];let previous=36;
 events.forEach((event,i)=>{
  const next=events[(i+1)%events.length],root=nearest(event.bass,previous),count=mode==='walking'?event.length:Math.max(1,event.length/2),duration=event.length/count;
  for(let n=0;n<count;n++){
   let midi,symbol,role;
   if(n===0){midi=root;symbol=event.bassName;role=event.bass!==event.root?'bajo indicado':'fundamental';}
   else if(mode==='walking'&&n===count-1){const target=nearest(next.bass,previous);midi=target-1;if(midi<28)midi=target+1;symbol=spelling(midi,event);role='aproximación a '+next.bassName;}
   else{const interval=mode==='simple'?event.fifth:n===1?event.third:event.fifth;midi=nearest((event.root+interval)%12,previous);symbol=spelling(midi,event,interval);role=interval===event.third?'tercera':'quinta';}
   notes.push({midi,symbol,role,beat:event.beat+n*duration,duration});previous=midi;
  }
  for(const interval of [0,event.third,event.fifth,event.seventh])backing.push({midi:48+event.root+interval,beat:event.beat,duration:Math.min(1.5,event.length)});
 });
 return {tempo:form.tempo,beatsPerBar:4,totalBeats:form.bars.length*4,notes,backing,style:id.startsWith('manha')?'straight':'swing',bars:form.bars.map((chord,i)=>({beat:i*4,length:4,chord,root:nearest(events.find(e=>e.beat===i*4).root),quality:events.find(e=>e.beat===i*4).quality})),chordEvents:events,form,mode};
}
export function studyAdviceHTML(form){return '<h3>Cómo construir tu propia línea</h3><ul>'+[...form.advice,...commonAdvice].map(t=>'<li>'+escapeHTML(t)+'</li>').join('')+'</ul>';}
export const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Explicit accidentals, no key signature. Bass sounds one octave below notation.
export function studyNotation(score,start=0,end=score.bars.length){
 const rows=[];
 for(let first=start;first<end;first+=4){
  let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 182" role="img" aria-label="Partitura de bajo en clave de fa"><rect width="1000" height="182" fill="white"/>';
  for(let line=0;line<5;line++)svg+=`<path d="M18 ${65+line*10}H982" stroke="#182331" fill="none"/>`;
  // Vector bass clef: avoids missing musical font glyphs in exported PDFs.
  svg+='<path d="M25 79 C12 57 50 56 42 81 C38 94 28 99 23 102 C39 91 46 65 32 66 C25 66 24 72 28 76" fill="#182331"/><circle cx="49" cy="70" r="2"/><circle cx="49" cy="80" r="2"/><text x="55" y="79" font-size="15">4</text><text x="55" y="99" font-size="15">4</text>';
  for(let i=first;i<Math.min(first+4,end);i++){
   const x0=80+(i-first)*225,bar=score.bars[i];svg+=`<text x="${x0}" y="15" font-size="12" font-family="Arial">${escapeHTML(score.form.sections[i]||'')}</text><text x="${x0}" y="166" font-size="11" font-family="Arial" fill="#526078">${i+1}</text><path d="M${x0+220} 65V105" stroke="#182331"/>`;
   for(const event of score.chordEvents.filter(e=>e.beat>=bar.beat&&e.beat<bar.beat+4))svg+=`<text x="${x0+(event.beat-bar.beat)*53}" y="35" font-size="12" font-weight="bold" font-family="Arial">${escapeHTML(event.symbol)}</text>`;
   for(const note of score.notes.filter(n=>n.beat>=bar.beat&&n.beat<bar.beat+4)){
    const letter=note.symbol[0],alter=(note.symbol.match(/#/g)||[]).length-(note.symbol.match(/b/g)||[]).length,written=note.midi+12,octave=(written-pcs[letter]-alter)/12-1,diatonic=octave*7+'CDEFGAB'.indexOf(letter),y=105-(diatonic-18)*5,x=x0+18+(note.beat-bar.beat)*53;
    for(let ledger=115;ledger<=y;ledger+=10)svg+=`<path d="M${x-11} ${ledger}h22" stroke="#182331"/>`;
    for(let ledger=55;ledger>=y;ledger-=10)svg+=`<path d="M${x-11} ${ledger}h22" stroke="#182331"/>`;
    svg+=`<g data-beat="${note.beat}" data-duration="${note.duration}"><text x="${x-17}" y="${y+4}" font-family="Arial" font-size="15">${alter>0?'♯'.repeat(alter):alter<0?'♭'.repeat(-alter):'♮'}</text><ellipse cx="${x}" cy="${y}" rx="6" ry="4" transform="rotate(-20 ${x} ${y})" fill="${note.duration>=2?'white':'#182331'}" stroke="#182331" stroke-width="1.5"/><path d="M${x+5} ${y}v-27" stroke="#182331"/><text x="${x}" y="145" text-anchor="middle" font-size="10" font-family="Arial" fill="#526078">${escapeHTML(note.symbol)}</text></g>`;
   }
  }rows.push(svg+'</svg>');
 }return rows.join('');
}
export function studyDocument(score){
 const title=score.form.title+' · '+(score.mode==='walking'?'Walking bass':'Acompañamiento sencillo'),pages=[];
 for(let start=0;start<score.bars.length;start+=16)pages.push(`<section class="sheet"><header><span>APPBASS · ESTUDIOS DE BAJO</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(score.form.key)} · 4/4 · ♩ = ${score.tempo} · ${score.mode==='walking'?'Negras regulares':'Blancas; negras cuando cambia cada pulso'}</p></header>${studyNotation(score,start,Math.min(start+16,score.bars.length))}<footer>Compases ${start+1}–${Math.min(start+16,score.bars.length)} · Clave de fa; sonido una octava debajo. Alteraciones explícitas en cada nota. Letras bajo las notas = cifrado de alturas.</footer></section>`);
 pages.push(`<section class="sheet guide"><header><span>APPBASS · GUÍA DE PRÁCTICA</span><h1>${escapeHTML(title)}</h1></header>${studyAdviceHTML(score.form)}<h3>Leé esta versión</h3><p>Las líneas de bajo son estudios originales escritos sobre la armonía indicada. Los nombres de nota bajo el pentagrama permiten comprobar las alturas. La aproximación del último tiempo se escucha como paso hacia el siguiente acorde; no debe sostenerse como nota de reposo.</p><p>Se escribe una vuelta: al repetir, la última aproximación conduce al comienzo. Para terminar, reemplazá el último compás por la fundamental sostenida.</p><p>Referencia armónica: ${score.form.id.startsWith('blues')?'progresión didáctica original de Appbass':'parte de ensamble suministrada por el usuario (Juan Linares / Jazz en BA)'}. ${score.form.bars.length} compases desarrollados.</p></section>`);
 return `<!doctype html><html lang="es"><meta charset="utf-8"><title>${escapeHTML(title)}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#182331;margin:0}h1{font-size:21px;margin:10px 0}header span{font-size:11px;letter-spacing:2px;color:#426175}header p,footer{font-size:11px;line-height:1.5}.sheet{break-after:page}.sheet:last-child{break-after:auto}svg{width:100%;display:block;margin:12px 0}.guide{font-size:13px;line-height:1.65}.guide li{margin:12px 0}h3{font-size:16px}</style>${pages.join('')}</html>`;
}
