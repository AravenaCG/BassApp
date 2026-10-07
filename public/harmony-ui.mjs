import {harmonyModules,harmonyUnits,unitsForLesson,nextHarmonyUnit,HARMONY_VERSION} from './harmony-curriculum.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>`<ul>${items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
const examples=u=>u.examples.map(e=>`<figure class="harmony-example"><figcaption>${esc(e.label)}</figcaption><ul>${e.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul><p>${esc(e.why)}</p></figure>`).join('');
export function lessonHarmonyHTML(id){
 const related=unitsForLesson(id);if(!related.length)return '';
 const unit=related[0];
 return `<section class="lesson-harmony"><p class="eyebrow">ARMONÍA PARA BAJISTAS · ${unit.id}</p><h3>${esc(unit.title)}</h3><p><strong>Al terminar:</strong> ${esc(unit.objective)}</p>${unit.sections.map(([title,text])=>`<h4>${esc(title)}</h4><p>${esc(text)}</p>`).join('')}${examples(unit)}<aside class="harmony-caution"><strong>En contexto</strong><p>${esc(unit.caution)}</p></aside><p>Profundizá con escucha guiada, ejercicios y preguntas:</p><div class="button-row">${related.map(u=>`<button class="secondary" data-harmony-open="${u.id}">${esc(u.title)}</button>`).join('')}</div></section>`;
}
// Short original demonstrations. Independent of samples and network; conservative gain.
export class HarmonyAudio {
 constructor(){this.nodes=new Set();this.run=0;}
 stop(){this.run++;clearTimeout(this.timer);for(const n of this.nodes){try{n.stop();}catch{}}this.nodes.clear();const callback=this.onStop;this.onStop=null;callback?.();}
 async play(unit,onStop){
  this.stop();const run=this.run;this.onStop=onStop;
  this.context??=new (window.AudioContext||window.webkitAudioContext)();await this.context.resume();
  if(run!==this.run)return false;
  const seconds=unit.id==='H16'?2:1,start=this.context.currentTime+.05;
  unit.listen.midi.forEach((event,i)=>{
   const pitches=Array.isArray(event)?event:[event];
   for(const midi of pitches){
    const o=this.context.createOscillator(),g=this.context.createGain(),t=start+i*seconds;
    o.type='triangle';o.frequency.value=440*2**((midi-69)/12);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16/pitches.length,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+seconds*.85);
    o.connect(g);g.connect(this.context.destination);o.start(t);o.stop(t+seconds*.9);
    this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};
   }
  });
  this.timer=setTimeout(()=>this.stop(),(unit.listen.midi.length*seconds+.15)*1000);
  return true;
 }
}
export function mountHarmony({onLesson,onPractice,onStopOtherAudio=()=>{}}){
 const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='harmony.css?v=1';document.head.append(stylesheet);
 const host=document.createElement('section');host.className='harmony-course';host.setAttribute('aria-label','Ruta de armonía para bajistas');
 document.querySelector('#course-list').before(host);
 let key='appbass-harmony-v1-guest',done=[],current=harmonyUnits[0],storageWarning='',quizAnswers={};
 const audio=new HarmonyAudio();
 function save(){try{localStorage.setItem(key,JSON.stringify({version:HARMONY_VERSION,done,last:current.id}));storageWarning='';}catch{storageWarning='El navegador no permite guardar el repaso. Podés seguir estudiando, pero estos cambios no persistirán.';}}
 function load(user){
  key='appbass-harmony-v1-'+(user?.id||'guest');done=[];let last;
  try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored?.version===HARMONY_VERSION){done=Array.isArray(stored.done)?[...new Set(stored.done.filter(id=>harmonyUnits.some(u=>u.id===id)))]:[];last=stored.last;}}catch{}
  current=harmonyUnits.find(u=>u.id===last)||nextHarmonyUnit(done)||harmonyUnits[0];render();
 }
 function render(){
  audio.stop();quizAnswers={};
  const next=nextHarmonyUnit(done),index=harmonyUnits.indexOf(current),prior=harmonyUnits.find(u=>u.id===current.prerequisiteIds[0]);
  host.innerHTML=`<header><p class="eyebrow">ESCUCHAR · COMPRENDER · TOCAR · EXPLICAR</p><h2>Armonía desde el bajo</h2><p>16 unidades progresivas para entender lo que tocás. No es una carrera de escalas: cada concepto vuelve como una decisión musical.</p>
   <p>Sesión sugerida: 5 minutos de escucha, 10 de explicación y ejemplo, 10 de instrumento y 5 de repaso. Si tenés menos tiempo, dividí la unidad; avanzá por comprensión, no por calendario.</p>
   <p id="harmony-progress" role="status">${done.length} de ${harmonyUnits.length} unidades repasadas${storageWarning?' · '+esc(storageWarning):''}.</p>
   <p class="footnote">Este repaso se guarda por cuenta en este navegador, no en la nube. Es independiente de los puntos y del progreso de las 40 lecciones. Las preguntas verifican conceptos; la ejecución instrumental se autoevalúa.</p>
   ${next?`<button class="primary" data-harmony-go="${next.id}">Continuar ruta · ${esc(next.title)}</button>`:'<p>Completaste la ruta. Volvé a escuchar y transportar los ejemplos antes de pasar a la siguiente etapa.</p>'}<p><button class="harmony-inline" id="harmony-course-list">Ir a las 40 lecciones y sus partituras ↓</button></p></header>
   <details class="harmony-roadmap"><summary>Ver programa y elegir unidad</summary><p>Los prerrequisitos orientan el orden, pero podés explorar cualquier unidad.</p>${harmonyModules.map(m=>`<section><h3>${esc(m.title)}</h3><p>${esc(m.goal)}</p><ol>${harmonyUnits.filter(u=>u.module===m.id).map(u=>`<li><button class="harmony-unit-link" data-harmony-go="${u.id}" ${u.id===current.id?'aria-current="step"':''}>${done.includes(u.id)?'✓ ':''}${u.id} · ${esc(u.title)} <small>${u.minutes} min orientativos</small></button></li>`).join('')}</ol></section>`).join('')}</details>
   <article class="harmony-reader" aria-labelledby="harmony-title"><p class="eyebrow">UNIDAD ${index+1} DE ${harmonyUnits.length} · ${current.id}</p><h3 id="harmony-title" tabindex="-1">${esc(current.title)}</h3><p><strong>Vas a poder:</strong> ${esc(current.objective)}</p>
   ${prior?`<p>Antes conviene dominar: <button class="harmony-inline" data-harmony-go="${prior.id}">${esc(prior.title)}</button>${done.includes(prior.id)?' · Repasada':' · Podés revisarla sin perder el avance de las lecciones'}.</p>`:'<p>No necesitás conocimientos previos. Empezá con pocas notas y un pulso cómodo.</p>'}
   <section><h4>1. Escuchá y anticipá</h4><p>${esc(current.listen.prompt)}</p><div class="button-row"><button class="secondary" id="harmony-listen">Escuchar · ${esc(current.listen.label)}</button><button class="secondary" id="harmony-stop">Detener audio</button></div><p id="harmony-audio-status" role="status">Ejemplo original sintetizado. Ajustá el volumen del dispositivo antes de escuchar.</p></section>
   <section><h4>2. Comprendé la relación</h4>${current.sections.map(([t,p])=>`<h5>${esc(t)}</h5><p>${esc(p)}</p>`).join('')}${examples(current)}<aside class="harmony-caution"><strong>No lo conviertas en una regla universal</strong><p>${esc(current.caution)}</p></aside></section>
   <section><h4>3. Llevá la idea al instrumento</h4>${list(current.tasks)}<p>En bajo eléctrico, nombrá las notas además de los trastes. En contrabajo, elegí posiciones cómodas y verificá la afinación con una referencia; ningún dibujo obliga a estirar la mano.</p><button class="secondary" id="harmony-practice">Abrir práctica relacionada</button><p class="footnote">La práctica relacionada aplica el concepto, pero no siempre reproduce exactamente el ejemplo escrito de esta unidad.</p></section>
   <section class="harmony-check"><h4>4. Recuperá la idea sin mirar</h4><p>Respondé antes de releer. Si te equivocás, explicá la corrección y volvé a intentarlo.</p>${current.questions.map((q,i)=>`<fieldset data-harmony-question="${i}"><legend>${i+1}. ${esc(q.prompt)}</legend><div class="button-row">${q.choices.map((choice,j)=>`<button class="secondary" data-harmony-answer="${j}" aria-pressed="false">${esc(choice)}</button>`).join('')}</div><p role="status"></p></fieldset>`).join('')}
   <p><strong>Señal para avanzar:</strong> ${esc(current.checkpoint)}</p><label class="check"><input type="checkbox" id="harmony-played">Lo probé en el instrumento y puedo explicar el resultado.</label>
   <div class="button-row"><button class="primary" id="harmony-complete" disabled>Marcar unidad repasada</button><button class="secondary" id="harmony-review" ${done.includes(current.id)?'':'hidden'}>Necesito repasarla de nuevo</button></div><p id="harmony-check-status" role="status">${done.includes(current.id)?'Unidad repasada anteriormente. Podés volver a comprobarla.':'Para marcarla, respondé correctamente ambas preguntas y completá la autoevaluación instrumental.'}</p></section>
   <footer><h4>Conectá con las lecciones del curso</h4><div class="button-row">${current.lessons.map(id=>`<button class="secondary" data-harmony-lesson="${id}">Abrir ${id}</button>`).join('')}</div><p>Las lecciones conservan sus audios, partituras y progreso. Sus PDF anteriores no incluyen esta ampliación web.</p><div class="button-row">${index?`<button class="secondary" data-harmony-go="${harmonyUnits[index-1].id}">← Unidad anterior</button>`:''}${index<harmonyUnits.length-1?`<button class="secondary" data-harmony-go="${harmonyUnits[index+1].id}">Unidad siguiente →</button>`:''}</div></footer></article>
   `;
  host.querySelectorAll('[data-harmony-go]').forEach(b=>b.onclick=()=>open(b.dataset.harmonyGo));
  host.querySelector('#harmony-course-list').onclick=()=>{audio.stop();const target=document.querySelector('#course-list');target.tabIndex=-1;target.focus();target.scrollIntoView({block:'start'});};
  host.querySelectorAll('[data-harmony-lesson]').forEach(b=>b.onclick=()=>{audio.stop();onLesson(b.dataset.harmonyLesson);});
  const check=()=>{host.querySelector('#harmony-complete').disabled=!(current.questions.every((q,i)=>quizAnswers[i]===q.answer)&&host.querySelector('#harmony-played').checked);};
  host.querySelectorAll('[data-harmony-question]').forEach(field=>field.querySelectorAll('[data-harmony-answer]').forEach(b=>b.onclick=()=>{
   const i=Number(field.dataset.harmonyQuestion),choice=Number(b.dataset.harmonyAnswer),q=current.questions[i];quizAnswers[i]=choice;
   field.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));
   field.querySelector('[role=status]').textContent=(choice===q.answer?'Correcto. ':'Revisemos: ')+q.explanation;check();
  }));
  host.querySelector('#harmony-played').onchange=check;
  host.querySelector('#harmony-complete').onclick=()=>{if(host.querySelector('#harmony-complete').disabled)return;done=[...new Set([...done,current.id])];save();render();host.querySelector('#harmony-title').focus();};
  host.querySelector('#harmony-review').onclick=()=>{done=done.filter(id=>id!==current.id);save();render();host.querySelector('#harmony-title').focus();};
  host.querySelector('#harmony-listen').onclick=async()=>{
   const status=host.querySelector('#harmony-audio-status');onStopOtherAudio();status.textContent='Reproduciendo ejemplo…';
   try{const playing=await audio.play(current,()=>{status.textContent='Audio detenido. Cantá el ejemplo y comprobalo en tu instrumento.';});if(playing)status.textContent='Reproduciendo ejemplo…';}catch{status.textContent='No se pudo iniciar el audio. Volvé a pulsar Escuchar o usá las notas del ejemplo escrito.';}
  };
  host.querySelector('#harmony-stop').onclick=()=>audio.stop();
  host.querySelector('#harmony-practice').onclick=()=>{audio.stop();onPractice(current.practice);};
 }
 function open(id,updateHash=true){
  const next=harmonyUnits.find(u=>u.id===id);if(!next)return;
  current=next;save();render();if(updateHash)location.hash='curso?unidad='+id;
  host.querySelector('#harmony-title').focus();host.querySelector('.harmony-reader').scrollIntoView({block:'start'});
 }
 function fromHash(){const id=new URLSearchParams(location.hash.split('?')[1]||'').get('unidad');if(location.hash.startsWith('#curso')&&id&&id!==current.id)open(id,false);else if(!location.hash.startsWith('#curso'))audio.stop();}
 window.addEventListener('hashchange',fromHash);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.stop();});
 load(null);fromHash();
 return {open,stop:()=>audio.stop(),setUser(user){audio.stop();load(user);fromHash();}};
}
