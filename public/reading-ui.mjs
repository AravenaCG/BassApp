const NOTE_NAMES=['Do','Do♯/Re♭','Re','Re♯/Mi♭','Mi','Fa','Fa♯/Sol♭','Sol','Sol♯/La♭','La','La♯/Si♭','Si'];
const NATURAL=[36,38,40,41,43,45,47,48,50,52,53,55];
const ALTERED=[36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const midiName=midi=>NOTE_NAMES[midi%12];
const answerName=midi=>midiName(midi).split('♯/')[0];
const diatonic={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
function noteGeometry(midi){
 const pc=midi%12,naturalPc=[0,2,4,5,7,9,11].reduce((best,value)=>Math.abs(value-pc)<Math.abs(best-pc)?value:best,0);
 const names=['C','D','E','F','G','A','B'],letter=names[[0,2,4,5,7,9,11].indexOf(naturalPc)],octave=Math.floor(midi/12)-1;
 const step=(octave-3)*7+diatonic[letter],y=104-(step-4)*5;
 return {y,alter:pc===naturalPc?0:(pc-naturalPc+12)%12===1?1:-1};
}
function staff(midi,showAnswer=false){
 const g=noteGeometry(midi),x=220;let svg='<svg class="reading-staff" viewBox="0 0 520 170" role="img" aria-label="Nota en clave de fa">';
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
function randomNote(level){const pool=level===1?NATURAL:level===2?NATURAL.filter(n=>n>=38&&n<=53):ALTERED;return pool[Math.floor(Math.random()*pool.length)];}
export function mountReading(host){
 const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='reading.css?v=1';document.head.append(stylesheet);
 let level=1,note=randomNote(level),score=0,total=0,streak=0,answered=false;
 host.innerHTML=`<div class="reading-intro"><p class="eyebrow">LECTURA MUSICAL</p><h2>Leé la clave de fa, una nota a la vez.</h2><p>La clave de fa ubica el <strong>Fa en la cuarta línea</strong>. Empezá reconociendo notas naturales y después sumá alteraciones y líneas adicionales, siempre dentro de un registro cómodo para bajo y contrabajo.</p><div class="reading-levels" role="group" aria-label="Nivel de lectura"><button class="selected" data-reading-level="1">1 · Naturales</button><button data-reading-level="2">2 · Registro medio</button><button data-reading-level="3">3 · Alteraciones</button></div></div><div class="reading-exercise card"><div class="reading-meta"><span>Ejercicio <b data-reading-total>0</b></span><span>Aciertos <b data-reading-score>0</b></span><span>Racha <b data-reading-streak>0</b></span></div><div data-reading-staff></div><p class="reading-prompt">¿Qué nota es?</p><div class="reading-answers" role="group" aria-label="Elegir respuesta"></div><p data-reading-feedback class="reading-feedback" role="status"></p><button class="primary" data-reading-next disabled>Siguiente nota</button></div><details class="reading-guide"><summary>Cómo estudiar esta sección</summary><ol><li>Nombrá la nota antes de mirar el instrumento: usá las líneas y espacios vecinos.</li><li>Tocala en el bajo o contrabajo en una posición cómoda y comprobá si el sonido coincide.</li><li>Recién después aumentá el nivel: primero naturales, luego registro y por último alteraciones.</li></ol><p>La práctica trabaja identificación visual. No evalúa digitación: una misma nota puede aparecer en varias cuerdas y posiciones.</p></details>`;
 const render=()=>{host.querySelector('[data-reading-staff]').innerHTML=staff(note);const options=level===3?Array.from({length:12},(_,pc)=>[pc,NOTE_NAMES[pc]]):[['Do', 'Do'],['Re','Re'],['Mi','Mi'],['Fa','Fa'],['Sol','Sol'],['La','La'],['Si','Si']];host.querySelector('.reading-answers').innerHTML=options.map(([value,label])=>`<button class="secondary" data-reading-answer="${value}">${label}</button>`).join('');host.querySelector('[data-reading-total]').textContent=total;host.querySelector('[data-reading-score]').textContent=score;host.querySelector('[data-reading-streak]').textContent=streak;host.querySelector('[data-reading-feedback]').textContent='';host.querySelector('[data-reading-next]').disabled=true;answered=false;bindAnswers();};
 host.querySelectorAll('[data-reading-level]').forEach(button=>button.onclick=()=>{level=Number(button.dataset.readingLevel);host.querySelectorAll('[data-reading-level]').forEach(b=>b.classList.toggle('selected',b===button));note=randomNote(level);render();});
 function bindAnswers(){host.querySelectorAll('[data-reading-answer]').forEach(button=>button.onclick=()=>{if(answered)return;answered=true;total++;const correct=(level===3?Number(button.dataset.readingAnswer):button.dataset.readingAnswer)=== (level===3?note%12:answerName(note));if(correct){score++;streak++;button.classList.add('correct');host.querySelector('[data-reading-feedback]').textContent=`¡Correcto! ${midiName(note)}. Tocala en tu bajo y escuchá su registro.`;}else{streak=0;button.classList.add('wrong');host.querySelector('[data-reading-feedback]').textContent=`Era ${midiName(note)}. Mirá la línea o espacio y volvé a intentarlo.`;}host.querySelector('[data-reading-staff]').innerHTML=staff(note,true);host.querySelector('[data-reading-total]').textContent=total;host.querySelector('[data-reading-score]').textContent=score;host.querySelector('[data-reading-streak]').textContent=streak;host.querySelector('[data-reading-next]').disabled=false;host.querySelectorAll('[data-reading-answer]').forEach(b=>b.disabled=true);});}
 host.querySelector('[data-reading-next]').onclick=()=>{note=randomNote(level);render();};
 render();
 return {reset(){note=randomNote(level);render();}};
}
