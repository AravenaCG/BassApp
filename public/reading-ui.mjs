const NOTE_NAMES=['Do','Do♯/Re♭','Re','Re♯/Mi♭','Mi','Fa','Fa♯/Sol♭','Sol','Sol♯/La♭','La','La♯/Si♭','Si'];
const CORE_NATURAL=[50,52,53];
const NATURAL=[40,41,43,45,47,48,50,52,53,55,57];
const ALTERED=Array.from({length:18},(_,index)=>40+index);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const midiName=midi=>NOTE_NAMES[midi%12];
const answerName=midi=>midiName(midi).split('♯/')[0];
const diatonic={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
function noteGeometry(midi){
 const pc=midi%12,naturalPc=[0,2,4,5,7,9,11].reduce((best,value)=>Math.abs(value-pc)<Math.abs(best-pc)?value:best,0);
 const names=['C','D','E','F','G','A','B'],letter=names[[0,2,4,5,7,9,11].indexOf(naturalPc)],octave=Math.floor(midi/12)-1;
 const step=octave*7+diatonic[letter],bassClefBottomLine=2*7+diatonic.G,y=104-(step-bassClefBottomLine)*5;
 return {y,alter:pc===naturalPc?0:(pc-naturalPc+12)%12===1?1:-1};
}
function staff(midi,showAnswer=false){
 const g=noteGeometry(midi),x=220;let svg=`<svg class="reading-staff" data-reading-midi="${midi}" viewBox="0 0 520 170" role="img" aria-label="Nota en clave de fa">`;
 for(let i=0;i<5;i++)svg+=`<line x1="40" y1="${64+i*10}" x2="490" y2="${64+i*10}"/>`;
 svg+='<path class="reading-clef" d="M75 78 C42 56 94 49 85 82 C81 98 61 108 52 104 C78 99 92 73 70 65 C57 61 51 70 59 78"/><circle cx="91" cy="70" r="2.5"/><circle cx="91" cy="80" r="2.5"/>';
 for(let ledger=54;ledger>=g.y;ledger-=10)svg+=`<line x1="${x-16}" y1="${ledger}" x2="${x+16}" y2="${ledger}"/>`;
 for(let ledger=114;ledger<=g.y;ledger+=10)svg+=`<line x1="${x-16}" y1="${ledger}" x2="${x+16}" y2="${ledger}"/>`;
 if(g.alter===1)svg+=`<text x="${x-27}" y="${g.y+5}" class="reading-accidental">♯</text>`;
 if(g.alter===-1)svg+=`<text x="${x-27}" y="${g.y+5}" class="reading-accidental">♭</text>`;
 svg+=`<ellipse cx="${x}" cy="${g.y}" rx="8" ry="6" transform="rotate(-20 ${x} ${g.y})" class="reading-note"/><path d="M${x+7} ${g.y}v-34" class="reading-stem"/>`;
 if(showAnswer)svg+=`<text x="${x}" y="150" text-anchor="middle" class="reading-answer">${esc(midiName(midi))}</text>`;
 return svg+'</svg>';
}
function randomNote(level){const pool=level===1?CORE_NATURAL:level===2?NATURAL:ALTERED;return pool[Math.floor(Math.random()*pool.length)];}
export function readingReference(spaces=false){
 const pitches=spaces?[45,48,52,55]:[43,47,50,53,57];
 let svg=`<svg class="reading-reference" viewBox="0 0 360 160" role="img" aria-label="${spaces?'Espacios: La, Do, Mi, Sol':'Líneas: Sol, Si, Re, Fa, La'}, de abajo hacia arriba en clave de fa">`;
 for(let i=0;i<5;i++)svg+=`<line x1="18" x2="345" y1="${64+i*10}" y2="${64+i*10}" class="${i===1?'reference-fa':''}"/>`;
 svg+='<path class="reference-clef" d="M30 76 C15 63 45 60 43 77 C41 89 28 98 21 100 C34 89 42 69 30 69 C23 69 23 74 27 76"/><circle cx="51" cy="69" r="2"/><circle cx="51" cy="79" r="2"/>';
 pitches.forEach((midi,i)=>{const x=85+i*55,y=noteGeometry(midi).y;svg+=`<g><text x="${x}" y="43" text-anchor="middle">${i+1}${spaces?'º':'ª'}</text><ellipse cx="${x}" cy="${y}" rx="8" ry="5" transform="rotate(-20 ${x} ${y})"/><text x="${x}" y="135" text-anchor="middle">${midiName(midi)}</text></g>`;});
 return svg+'</svg>';
}

export function readingPosition(midi){
 const n=(104-noteGeometry(midi).y)/5;
 if(n===-3)return 'espacio debajo de la primera línea adicional inferior';
 if(n===-2)return 'primera línea adicional inferior';
 if(n===-1)return 'espacio debajo del pentagrama';
 return n%2===0?`línea ${n/2+1}, contando desde abajo`:`espacio ${(n+1)/2}, contando desde abajo`;
}
export const READING_LEVELS=[
 {title:'Re, Mi y Fa',notes:CORE_NATURAL,text:'Re: tercera línea. Mi: tercer espacio. Fa: cuarta línea. Leé desde Fa, contando cada línea y espacio vecino.'},
 {title:'Naturales',notes:NATURAL,text:'Líneas: Sol–Si–Re–Fa–La. Espacios: La–Do–Mi–Sol. Debajo del pentagrama siguen Fa (espacio) y Mi (primera línea adicional).'},
 {title:'Alteraciones',notes:ALTERED,text:'Primero leé la nota natural. ♯ sube un semitono; ♭ baja uno. Do♯ y Re♭ suenan igual pero se escriben en posiciones distintas. Aquí practicamos sostenidos; las respuestas muestran también su equivalente bemol.'},
 {title:'Figuras y silencios',text:'En 4/4, la negra es un pulso: redonda = 4, blanca = 2, negra = 1. El silencio de negra dura 1 pulso sin tocar. Contá 1–2–3–4 también durante los silencios.'}
];
const RHYTHMS=[['𝅝','Redonda',4],['𝅗𝅥','Blanca',2],['♩','Negra',1],['𝄽','Silencio de negra',1]];
import {bassSound,loadBassBank,nearestBassSample} from './bass-sounds.mjs';
export function mountReading(host){
 let audioContext,source,advanceTimer,generation=0;
 function cancelPending(){generation++;clearTimeout(advanceTimer);if(source){try{source.stop();}catch{}source=null;}}
 async function soundNote(writtenMidi,version){
  try{
   document.dispatchEvent(new Event('bass-audition-start'));
   audioContext??=new (window.AudioContext||window.webkitAudioContext)();
   await audioContext.resume();
   const bank=await loadBassBank(audioContext,bassSound());
   if(version!==generation)return;
   const midi=writtenMidi-12,sample=nearestBassSample(bank,midi);
   if(!sample)throw Error('Sample unavailable');
   const voice=audioContext.createBufferSource(),gain=audioContext.createGain(),now=audioContext.currentTime;
   source=voice;voice.buffer=sample.buffer;voice.playbackRate.value=2**((midi-sample.midi)/12);
   gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.65,now+.015);gain.gain.setValueAtTime(.65,now+.6);gain.gain.linearRampToValueAtTime(0,now+.9);
   voice.connect(gain);gain.connect(audioContext.destination);voice.start();voice.stop(now+.95);
   voice.onended=()=>{voice.disconnect();gain.disconnect();if(source===voice)source=null;};
  }catch{if(version===generation)$('[data-reading-feedback]').textContent+=' No se pudo reproducir el sonido.';}
 }
 window.addEventListener('hashchange',cancelPending);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelPending();});
 document.addEventListener('bass-audition-stop',cancelPending);
 const css=document.createElement('link');css.rel='stylesheet';css.href='reading.css?v=2';document.head.append(css);
 let level=1,note=50,rhythm=0,score=0,total=0,streak=0,answered=false,attempts=0;
 host.innerHTML=`<div class="reading-intro"><h2>Del pentagrama a tu instrumento.</h2>
 <section class="reading-theory"><h3>1. Ubicá las notas</h3><p>Contamos las líneas desde abajo. Los dos puntos rodean el <strong>Fa de la cuarta línea</strong>.</p><div class="reading-theory-grid"><div><strong>Líneas · de abajo hacia arriba</strong>${readingReference()}<p>Sol · Si · Re · Fa · La</p></div><div><strong>Espacios · de abajo hacia arriba</strong>${readingReference(true)}<p>La · Do · Mi · Sol</p></div></div>
 <h3>2. Leé desde una referencia</h3><p>Desde Fa, bajá un paso al Mi del tercer espacio; otro paso lleva al Re de la tercera línea. Cada posición vecina cambia el nombre. Primero nombrá, después buscá la nota en el instrumento.</p>
 <h3>3. Escritura y sonido</h3><p class="reading-register"><strong>Registro de estudio: Mi2 a La3 escritos.</strong> El bajo y el contrabajo suenan una octava más grave: Mi2 escrito suena Mi1, la cuerda más grave de la afinación estándar de cuatro cuerdas. No usamos notas por debajo de ese límite. Do4 es el Do central en esta numeración.</p>
 <h3>4. Leé también la duración</h3><p>La posición indica la altura; la figura indica la duración. En 4/4, contá cuatro pulsos por compás. El silencio también ocupa tiempo.</p><div class="reading-rhythm-guide">${RHYTHMS.map(([symbol,name,beats])=>`<div><span aria-hidden="true">${symbol}</span><strong>${name}</strong><small>${beats} pulso(s)</small></div>`).join('')}</div></section>
 <h3>Practicá paso a paso</h3><p>Empezá con tres notas. Avanzá cuando puedas reconocerlas y explicar dónde están. Podés volver a cualquier nivel.</p><div class="reading-levels" role="group" aria-label="Nivel de lectura">${READING_LEVELS.map((l,i)=>`<button data-reading-level="${i+1}">${i+1} · ${l.title}</button>`).join('')}</div><p data-reading-lesson></p><p data-reading-context hidden></p></div>
 <div class="reading-exercise card"><div class="reading-meta"><span>Resueltos <b data-reading-total>0</b></span><span>Al primer intento <b data-reading-score>0</b></span><span>Racha <b data-reading-streak>0</b></span></div><div data-reading-staff></div><p class="reading-prompt"></p><div class="reading-answers" role="group" aria-label="Elegir respuesta"></div><p data-reading-feedback class="reading-feedback" role="status"></p><div class="button-row"><button class="secondary" data-reading-reveal>Ver explicación</button><button class="primary" data-reading-next disabled>Siguiente ejercicio</button></div></div>`;
 const $=s=>host.querySelector(s);
 function update(){ $('[data-reading-total]').textContent=total;$('[data-reading-score]').textContent=score;$('[data-reading-streak]').textContent=streak; }
 function explanation(){return level===4?`${RHYTHMS[rhythm][1]}: ${RHYTHMS[rhythm][2]} pulso(s) en 4/4.`:`${midiName(note)}: ${readingPosition(note)}.${noteGeometry(note).alter?' El sostenido eleva la nota natural un semitono.':''}`;}
 function finish(correct){answered=true;total++;if(correct&&attempts===0){score++;streak++;}else streak=0;update();$('[data-reading-feedback]').textContent=(correct?'¡Bien! ':'Repasemos: ')+explanation();if(level!==4)$('[data-reading-staff]').innerHTML=staff(note,true);host.querySelectorAll('[data-reading-answer]').forEach(b=>b.disabled=true);$('[data-reading-next]').disabled=false;$('[data-reading-reveal]').disabled=true;}
 function render(){
  cancelPending();
  answered=false;attempts=0;$('[data-reading-next]').disabled=true;$('[data-reading-reveal]').disabled=false;$('[data-reading-feedback]').textContent='';
  $('[data-reading-lesson]').textContent=READING_LEVELS[level-1].text;
  host.querySelectorAll('[data-reading-level]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.readingLevel)===level);b.setAttribute('aria-pressed',String(Number(b.dataset.readingLevel)===level));});
  $('[data-reading-staff]').innerHTML=level===4?`<div class="reading-rhythm-question"><span aria-hidden="true">${RHYTHMS[rhythm][0]}</span><strong>${RHYTHMS[rhythm][1]}</strong></div>`:staff(note);
  $('.reading-prompt').textContent=level===4?'¿Cuántos pulsos dura en 4/4?':'¿Qué nota es?';
  const choices=level===4?[[1,'1 pulso'],[2,'2 pulsos'],[4,'4 pulsos']]:[...new Set(READING_LEVELS[level-1].notes.map(n=>n%12))].map(pc=>[pc,NOTE_NAMES[pc]]);
  $('.reading-answers').innerHTML=choices.map(([v,label])=>`<button class="secondary" data-reading-answer="${v}">${label}</button>`).join('');
  host.querySelectorAll('[data-reading-answer]').forEach(b=>b.onclick=()=>{
   if(answered)return;const correct=Number(b.dataset.readingAnswer)===(level===4?RHYTHMS[rhythm][2]:note%12);
   if(correct){
    b.classList.add('correct');finish(true);
    const version=generation;
    const playback=level===4?Promise.resolve():soundNote(note,version);
    playback.finally(()=>{if(version===generation)advanceTimer=setTimeout(()=>{if(version===generation)next();},1200);});
   }else{attempts++;streak=0;update();b.disabled=true;b.classList.add('wrong');$('[data-reading-feedback]').textContent=level===4?'Probá otra vez: negra = 1, blanca = 2, redonda = 4. El silencio de negra dura lo mismo que la negra.':`Probá otra vez: mirá la ${readingPosition(note)}. Contá desde Fa en la cuarta línea.`;}
  });
 }
 function next(){if(level===4)rhythm=(rhythm+1)%RHYTHMS.length;else{const pool=READING_LEVELS[level-1].notes.filter(n=>n!==note);note=pool[Math.floor(Math.random()*pool.length)];}render();}
 host.querySelectorAll('[data-reading-level]').forEach(b=>b.onclick=()=>{level=Number(b.dataset.readingLevel);streak=0;update();next();});
 $('[data-reading-next]').onclick=next;$('[data-reading-reveal]').onclick=()=>{if(!answered)finish(false);};
 render();
 return {reset:next,openLesson(id){level=1;note=50;const context=$('[data-reading-context]');context.hidden=false;context.innerHTML=`Lectura de apoyo · ${esc(id)} <button class="secondary" data-reading-return>Volver a la lección</button>`;context.querySelector('button').onclick=()=>document.dispatchEvent(new CustomEvent('reading-return',{detail:id}));render();}};
}

