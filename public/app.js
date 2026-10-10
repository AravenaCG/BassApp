import {mountPractice} from './practice-ui.mjs';
import {catalog} from './practice-engine.mjs';
import {mountAccount,api} from './account-ui.mjs?v=5';
import {mountHelp} from './help-ui.mjs';
import {mountHarmony,lessonHarmonyHTML} from './harmony-ui.mjs';
import {unitsForLesson} from './harmony-curriculum.mjs';
import {mountCourseSpaces,readingExercisesHTML} from './course-ui.mjs';
import {tourStop} from './tour.mjs';
import {mountLearningTools} from './learning-tools.mjs';
import {learningStore} from './learning-store.mjs';
import {mountAtlas} from './atlas-ui.mjs';
'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const escapeHTML = value => String(value ?? '').replace(/assets\/audio\/oido\.wav/g,'el audio de la prueba').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = {inicio:'Inicio',curso:'Mi curso',practicar:'Practicar',escalas:'Escalas y patrones',desafios:'Desafíos',recompensas:'Recompensas',planes:'Planes',ayuda:'Cómo usar Appbass'};
const levels = {basic:'Básico',intermediate:'Intermedio',advanced:'Avanzado'};
const toast = message => { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toast.timeout); toast.timeout=setTimeout(()=>$('#toast').classList.remove('visible'),4000); };
let progress = null, progressError = '', completionPending = false, currentLessonId = null;
let course, lessonLevel='basic', instrument='electricBass', selectedChallenge='blues';
let coursePromise, dialogRun=0, page='inicio';
const challengeTypes = {
 blues:{title:'12 compases, tu groove',text:'Grabá una vuelta de blues en Do. Sostené la forma de 12 compases y un pulso cómodo. Tu amigo responde con su propia interpretación sobre la misma base.',level:'Básico / Intermedio'},
 motivo:{title:'Pregunta y respuesta',text:'Creá un motivo original de cuatro compases sobre un blues en Do. Tu amigo responde con otros cuatro compases, dejando espacio y silencios.',level:'Intermedio'},
 armonia:{title:'Otra armonía, otra historia',text:'Proponé una progresión original de cuatro compases y compartila con tu amigo. Su desafío es crear una alternativa armónica y explicar qué cambió.',level:'Intermedio / Avanzado'}
};
async function getJSON(path){ const response=await fetch(path); if(!response.ok)throw Error('No se pudo cargar el contenido.'); return response.json(); }
function getCourse(){return coursePromise ??= getJSON('course/course.json').then(d=>(course=d));}
function assetPath(object,id,base){const a=object.assets.find(a=>a.assetId===id);return a?base+a.relativePath+'?v=0.2':null;}
function assetLink(object,id,base,label){const path=assetPath(object,id,base);return path?`<a href="${escapeHTML(path)}" target="_blank" rel="noopener">${escapeHTML(label)}</a>`:'';}
function imageAsset(object,id,base,alt,cls='score-img'){const path=assetPath(object,id,base);return path?`<img class="${cls}" src="${escapeHTML(path)}" alt="${escapeHTML(alt)}" loading="lazy">`:'';}
function audioAsset(object,id,base){const path=assetPath(object,id,base);return path?`<audio controls preload="none" src="${escapeHTML(path)}" aria-label="Escuchar ejemplo"></audio>`:'';}

let currentUser=null;
const help=mountHelp();
const workspace=document.createElement('article');workspace.className='workspace';
$('#workspace-home').append(workspace);
const practice=mountPractice(workspace,{onLesson:openLesson,onJournal:entry=>account.openJournal(entry)});
const courseSpaces=mountCourseSpaces();
const harmony=mountHarmony({onLesson:openLesson,onShow:()=>courseSpaces.show('harmony'),onStopOtherAudio:()=>practice.stop(),async onPractice(id){await practice.selectExercise(id);location.hash='practicar';navigate();}});
document.addEventListener('course-space-change',()=>harmony.stop());
function syncCourseSpace(){if(!location.hash.startsWith('#curso'))return;const query=new URLSearchParams(location.hash.split('?')[1]||'');courseSpaces.show(query.get('espacio')==='armonia'||/^H(0[1-9]|1[0-6])$/.test(query.get('unidad')||'')?'harmony':'journey');}
window.addEventListener('hashchange',syncCourseSpace);syncCourseSpace();
const scaleAtlas=mountAtlas({stopOtherAudio(){practice.stop();harmony.stop();}});
document.addEventListener('bass-audition-start',()=>{practice.stop();harmony.stop();scaleAtlas.stop();learningTools.stop();document.querySelectorAll('audio').forEach(a=>a.pause());});
document.addEventListener('click',e=>{if(e.target.closest('#atlas-play,#harmony-listen,#ear-listen'))document.dispatchEvent(new Event('bass-audition-stop'));});
const learningTools=mountLearningTools({stopOtherAudio(){practice.stop();harmony.stop();scaleAtlas.stop();},async onPractice(id){learningTools.stop();await practice.selectExercise(id);location.hash='practicar';navigate();workspace.scrollIntoView({block:'start'});},onLesson:openLesson});
workspace.addEventListener('click',e=>{if(e.target.closest('#practice-play, [data-listen-repertoire]'))learningTools.stop();});
const account=mountAccount({
  async onSession(user){learningStore.beginSession();currentUser=user;progress=null;courseSpaces.setUser(user);learningTools.setUser(user);instrument=user?.instrument||'electricBass';lessonLevel=user?.level||'basic';await practice.setUser(user);harmony.setUser(user);scaleAtlas.setUser(user);await learningStore.setUser(user);},
  onProgress:loadProgress,
  onReady:user=>help.setUser(user),
  onPractice(){location.hash='practicar';navigate();},
  onLesson:openLesson
});
$$('[data-page="recompensas"]').forEach(a=>a.hidden=true);
$('.plan-link').hidden=true;
const referralCard=$('.community-bottom .card:last-child');
if(referralCard)referralCard.innerHTML='<p class="eyebrow">REFERIDOS</p><h3>Invitá a aprender.</h3><p>Encontrá tu enlace personal en Mi perfil. Las altas desde ese enlace quedan vinculadas a tu cuenta. La beta no entrega premios por referidos.</p>';
async function renderCourse(){try{
 const data=await getCourse(),group=data.levels.find(l=>l.level===lessonLevel),done=progress?.completed||[];
 $('#journey-continue').disabled=false;
 courseSpaces.render(group.lessons,done,!currentUser||!!progress);
 const count=group.lessons.filter(l=>done.includes(l.lessonId)).length;
 $('#journey-progress').textContent=`${levels[lessonLevel]} · ${count} de ${group.lessons.length} estaciones completadas. ${currentUser?(progress?'Avance guardado en tu cuenta.':progressError||'Cargando tu avance…'):'Modo exploración: iniciá sesión para guardar tu avance.'}`;
 const next=data.levels.flatMap(l=>l.lessons).find(l=>!done.includes(l.lessonId));
 $('#journey-continue').textContent=next?'Continuar · '+next.lessonId:'Recorrido completado · Repasar B01';
 $('#journey-continue').onclick=()=>openLesson(next?.lessonId||'B01');
 $$('[data-level]').forEach(b=>b.classList.toggle('selected',b.dataset.level===lessonLevel));
 $('#course-list').innerHTML=group.lessons.map((lesson,i)=>`<button class="lesson-card" data-lesson="${lesson.lessonId}"><span class="lesson-id">${lesson.lessonId}</span><div><p class="list-venue">${escapeHTML(tourStop(lesson.lessonId).name)}</p><h3>${escapeHTML(lesson.title)}</h3><p>${done.includes(lesson.lessonId)?'✓ Completada · 100 puntos':(progress?.states?.[lesson.lessonId]?({read:'Leído',practiced:'Practicado',review:'Para repasar'}[progress.states[lesson.lessonId]]):`Lección ${String(i+1).padStart(2,'0')} · Teoría, oído y práctica`)}</p></div></button>`).join('');
 $$('[data-lesson]',$('#curso')).forEach(b=>b.onclick=()=>openLesson(b.dataset.lesson));
 }catch{for(const id of ['#course-list','#course-map'])$(id).innerHTML='<p class="empty">No se pudo cargar el curso. Recargá la página para reintentar.</p>';$('#journey-continue').disabled=true;}}
$$('[data-level]').forEach(b=>b.addEventListener('click',()=>{lessonLevel=b.dataset.level;$$('[data-level]').forEach(c=>c.classList.toggle('selected',c===b));renderCourse();}));
const readingText=object=>{
 if(typeof object==='string')return `<p>${escapeHTML(object)}</p>`;
 if(Array.isArray(object))return object.map(readingText).join('');
 if(!object||typeof object!=='object')return '';
 return Object.entries(object).filter(([k])=>!/(Id$|Ids$|Asset|source|type|bar|beat)/i.test(k)).map(([key,value])=>{
  if(['title','question','prompt','instruction','task'].includes(key))return `<p><strong>${escapeHTML(value)}</strong></p>`;
  if(/^(answer|solution|expectedAnswer)/.test(key))return `<details><summary>Ver respuesta</summary>${readingText(value)}</details>`;
  if(typeof value==='string')return `<p>${escapeHTML(value)}</p>`;
  if(Array.isArray(value)||typeof value==='object')return readingText(value);
  return '';
 }).join('');
};
async function openLesson(id){
 if(!/^[BIA]\d{2}$/.test(id))return;
 harmony.stop();practice.stop();learningTools.stop();
 currentLessonId=id;const run=++dialogRun,dialog=$('#detail-dialog');
 $('#detail-label').textContent='LECCIÓN '+id;$('#detail-content').innerHTML='<p>Cargando lección…</p>';
 if(!dialog.open)dialog.showModal();
 try{
  const data=await getJSON(`course/lessons/${id}/${id}.lesson.json`);if(run!==dialogRun)return;
  const base=`course/lessons/${id}/`,materials=data.musicalMaterials.filter(m=>m.materialId!=='oido');
  $('#detail-content').innerHTML=`
   <span class="tag">${escapeHTML(levels[data.level])}</span><h2>${escapeHTML(data.title)}</h2>
   <div class="button-row"><a class="secondary" href="${base}${id}.pdf" target="_blank" rel="noopener">Abrir lección PDF</a><button class="primary" id="lesson-to-player">Practicar con acompañamiento</button></div>
   <div class="lesson-status" role="group" aria-label="Estado de la lección">${[['read','Leído'],['practiced','Practicado'],['review','Para repasar']].map(([state,label])=>`<button class="secondary" data-state="${state}" aria-pressed="${progress?.states?.[id]===state}">${label}</button>`).join('')}</div>
   <details class="lesson-step" open><summary>1. Comprender el concepto</summary><section class="lesson-core"><p class="eyebrow">CONCEPTO DE ESTA LECCIÓN · ${id}</p><h3>Objetivos</h3><ul>${data.learningObjectives.map(t=>`<li>${escapeHTML(t)}</li>`).join('')}</ul>${data.theory.blocks.map(t=>`<h3>${escapeHTML(t.title)}</h3><p>${escapeHTML(t.text)}</p>`).join('')}</section>${readingExercisesHTML(data,base)}${unitsForLesson(id).length?`<details class="lesson-deeper"><summary>Profundizar · Laboratorio de armonía (opcional)</summary><p>Una explicación complementaria, no otra lección obligatoria. Su repaso es independiente del avance de ${id}.</p>${lessonHarmonyHTML(id)}</details>`:''}</details>
   <details class="lesson-step"><summary>2. Escuchar y leer</summary>${materials.map(m=>`<section class="material"><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.description)}</p>${m.renderAssetIds.map(a=>imageAsset(data,a,base,m.title)).join('')}${audioAsset(data,m.audioAssetId,base)}</section>`).join('')}</details>
   <details class="lesson-step"><summary>3. Tocar y explorar</summary>${data.instrumentAdaptations.filter(a=>a.instrument===instrument).map(a=>readingText(a.instructions)).join('')}
   ${(data.fretboardMaps||[]).filter(m=>m.instrument===instrument).map(m=>imageAsset(data,m.assetId,base,'Mapa del instrumento','map-img')).join('')}
   ${readingText(data.improvisation)}<h3>Propuestas de práctica</h3><p>Elegí una actividad por vez y repartila según tu tiempo semanal. Las duraciones del material son orientativas.</p>
   ${data.practicePlan.map(session=>`<details><summary>Bloque ${session.sessionNumber}</summary><ul>${session.tasks.map(t=>`<li>${escapeHTML(t.instruction)}</li>`).join('')}</ul></details>`).join('')}</details>
   <details class="lesson-step"><summary>4. Comprobar y repasar</summary><h3>Entrenamiento auditivo</h3>${data.musicalMaterials.filter(m=>m.materialId==='oido').map(m=>audioAsset(data,m.audioAssetId,base)).join('')}
   ${readingText({objective:data.earTraining.objective,instructions:data.earTraining.instructions})}
   <details><summary>Ver respuestas</summary>${readingText(data.earTraining.trials)}</details>${readingText(data.selfAssessment)}<div id="quick-quiz" class="quiz"></div></details>
   <section class="lesson-completion" id="completion-panel"></section>`;
  renderCompletion(id);renderQuiz(id);
  $$('[data-harmony-open]',$('#detail-content')).forEach(b=>b.onclick=()=>{dialog.close();harmony.open(b.dataset.harmonyOpen);});
  $('#lesson-to-player').onclick=async()=>{dialog.close();await practice.selectLesson(id);location.hash='practicar';navigate();if(!catalog.some(c=>c.lesson===id))toast('Elegí una práctica del catálogo para aplicar el concepto.');};
  $$('[data-state]',$('#detail-content')).forEach(b=>b.onclick=async()=>{if(!currentUser)return account.openAuth();try{await api('/api/activity',{kind:'lesson',lessonId:id,state:b.dataset.state});await loadProgress();$$('[data-state]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));toast('Estado guardado.');}catch(e){toast(e.message);}});
  $$('.score-img,.map-img',$('#detail-content')).forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Ampliar '+img.alt);const zoom=()=>window.open(img.src,'_blank','noopener');img.onclick=zoom;img.onkeydown=e=>{if(e.key==='Enter')zoom();};});
  if(currentUser){currentUser.lastLesson=id;void api('/api/activity',{kind:'lesson',lessonId:id,state:'opened'}).catch(()=>{});}
 }catch{if(run===dialogRun)$('#detail-content').innerHTML='<p>No pudimos cargar la lección. Cerrá y volvé a abrir para reintentar.</p>';}
}
function renderQuiz(id){
 const questions=[
  {q:'En cifrado americano, ¿qué nota representa C?',choices:['Do','Sol','La'],answer:0,why:'C corresponde a Do. La secuencia es C–D–E–F–G–A–B: Do–Re–Mi–Fa–Sol–La–Si.'},
  {q:'¿Qué notas forman la tríada de Do mayor?',choices:['Do–Mi♭–Sol','Do–Mi–Sol','Do–Fa–La'],answer:1,why:'Una tríada mayor combina fundamental, tercera mayor y quinta justa.'},
  {q:'¿Cuántos semitonos tiene una quinta justa?',choices:['5','6','7'],answer:2,why:'La quinta justa está a siete semitonos de la fundamental.'},
  {q:'En clave de fa, ¿qué nota se ubica en la cuarta línea contando desde abajo?',choices:['Do','Fa','La'],answer:1,why:'Los dos puntos de la clave de fa rodean la cuarta línea, que corresponde a Fa.'}
 ];
 const unit=unitsForLesson(id)[0];
 if(unit)questions.splice(0,questions.length,...unit.questions.map(q=>({q:q.prompt,choices:q.choices,answer:q.answer,why:q.explanation})));
 let index=unit?0:id==='B01'?0:id==='B03'?1:3;
 const panel=$('#quick-quiz');
 function show(){
  const q=questions[index%questions.length];
  panel.innerHTML=`<h3>${unit?'Repaso · '+escapeHTML(unit.title):'Repaso interactivo de fundamentos'}</h3><p>${escapeHTML(q.q)}</p><div class="button-row">${q.choices.map((c,i)=>`<button class="secondary" data-answer="${i}">${escapeHTML(c)}</button>`).join('')}</div><p role="status"></p><button class="secondary" id="quiz-next" hidden>Otra pregunta</button>`;
  $$('[data-answer]',panel).forEach(b=>b.onclick=()=>{const correct=Number(b.dataset.answer)===q.answer;panel.querySelector('[role=status]').textContent=(correct?'Correcto. ':'Revisemos: ')+q.why;panel.querySelector('#quiz-next').hidden=false;});
  panel.querySelector('#quiz-next').onclick=()=>{index++;show();};
 }show();
}
$('#close-detail').addEventListener('click',()=>$('#detail-dialog').close());
$('#detail-dialog').addEventListener('close',()=>{$$('audio',$('#detail-dialog')).forEach(a=>a.pause());dialogRun++;});

function renderAtlas(){scaleAtlas.render();}

function showIncoming(){const query=new URLSearchParams(location.hash.split('?')[1]||'');const type=query.get('reto'),sender=query.get('de')?.slice(0,40);const challenge=challengeTypes[type];$('#incoming-challenge').innerHTML=challenge?`<article class="card incoming"><p class="eyebrow">${sender?escapeHTML(sender.toUpperCase())+' TE INVITA':'TENÉS UN DESAFÍO'}</p><h2>${escapeHTML(challenge.title)}</h2><p>${escapeHTML(challenge.text)}</p><a class="primary" href="#practicar">Abrir acompañamiento</a><p class="footnote">Compartí tu grabación con quien te invitó. En esta beta no se envían respuestas ni se acreditan puntos dentro de Appbass.</p></article>`:'';}
$$('[data-challenge]').forEach(b=>b.addEventListener('click',()=>{selectedChallenge=b.dataset.challenge;$('#share-title').textContent=challengeTypes[selectedChallenge].title;$('#share-result').hidden=true;$('#share-dialog').showModal();}));
$('#close-share').addEventListener('click',()=>$('#share-dialog').close());
$('#make-link').addEventListener('click',()=>{const url=new URL(location.href);url.hash='desafios?'+new URLSearchParams({reto:selectedChallenge,...($('#sender-name').value.trim()?{de:$('#sender-name').value.trim()}:{})});$('#share-link').value=url.href;$('#share-result').hidden=false;});
$('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#share-link').value);toast('Enlace copiado. Ya podés enviarlo.');}catch{$('#share-link').select();toast('Seleccionamos el enlace. Copialo para compartir.');}});
$('#native-share').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:'Appbass · '+challengeTypes[selectedChallenge].title,text:'¿Hacemos este desafío musical?',url:$('#share-link').value});}catch(error){if(error.name!=='AbortError')toast('No se pudo compartir. Copiá el enlace.');}}else $('#copy-link').click();});

let recorder,recordStream,recordChunks=[],recording=false,recordTimeout,recordObjectURL;
const localTakes=[];
async function stopRecording(){if(recorder&&recorder.state!=='inactive')recorder.stop();clearTimeout(recordTimeout);}
$('#record').addEventListener('click',async()=>{if(recording){stopRecording();return;}if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Tu navegador no permite grabar audio acá. Usá la grabadora del dispositivo.');return;}$('#record').disabled=true;try{recordStream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];recorder=new MediaRecorder(recordStream);recorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data);};recorder.onstop=()=>{recordStream.getTracks().forEach(t=>t.stop());recording=false;$('#record').textContent='Grabar otra toma';$('#record-status').textContent='Toma lista. No se subió a ningún servidor.';recordObjectURL=URL.createObjectURL(new Blob(recordChunks,{type:recorder.mimeType}));const extension=recorder.mimeType.includes('mp4')?'m4a':recorder.mimeType.includes('ogg')?'ogg':'webm';localTakes.push({url:recordObjectURL,extension});if(localTakes.length>2)URL.revokeObjectURL(localTakes.shift().url);$('#record-result').innerHTML=localTakes.map((take,i)=>`<article><h4>Toma ${i+1}</h4><audio controls src="${take.url}" aria-label="Escuchar toma ${i+1}"></audio><a class="secondary" href="${take.url}" download="Appbass-toma-${i+1}.${take.extension}">Descargar</a></article>`).join('');};recorder.start();recording=true;$('#record').textContent='Detener grabación';$('#record-status').textContent='Grabando · Máximo 3 minutos';recordTimeout=setTimeout(stopRecording,180000);}catch{recordStream?.getTracks().forEach(t=>t.stop());toast('No pudimos acceder al micrófono. Revisá el permiso del navegador.');}finally{$('#record').disabled=false;}});
window.addEventListener('pagehide',()=>{recordStream?.getTracks().forEach(t=>t.stop());localTakes.forEach(t=>URL.revokeObjectURL(t.url));});

function navigate(){const requested=location.hash.replace(/^#/,'').split('?')[0]||'inicio';page=names[requested]?requested:'inicio';$$('.page').forEach(section=>section.hidden=section.id!==page);$$('[data-page]').forEach(a=>{a.classList.toggle('active',a.dataset.page===page);if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});$('#page-name').textContent=names[page];if(page==='inicio'||page==='practicar')$('#workspace-'+(page==='inicio'?'home':'practice')).append(workspace);if(page==='curso')renderCourse();if(page==='escalas')renderAtlas();if(page==='desafios')showIncoming();document.title=`Appbass · ${names[page]}`;}
window.addEventListener('hashchange',navigate);navigate();void account.refresh();
function renderPoints(){
 const pill=$('#points-pill');
 if(progress) {pill.textContent=`✦ ${progress.totalPoints} puntos`;pill.title=`${progress.completed.length} de 40 lecciones completadas`;} 
 else {pill.textContent=!currentUser?'Guardá tu avance':progressError?'Progreso no disponible':'Cargando puntos…';pill.title=progressError;}
}
async function loadProgress(){
 if(!currentUser){progress=null;progressError='Iniciá sesión para guardar tu progreso.';renderPoints();if(page==='curso')renderCourse();return;}
 try {const response=await fetch('/api/progress',{credentials:'same-origin',cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'No pudimos cargar tu progreso.');progress=data;progressError='';}
 catch(error){progress=null;progressError=error.message;}
 learningTools.setProgress(progress);renderPoints();if(page==='curso')renderCourse();if(currentLessonId&&$('#detail-dialog').open)renderCompletion(currentLessonId);
}
function renderCompletion(id){
 const panel=$('#completion-panel');if(!panel)return;
 const done=progress?.completed.includes(id);
 panel.innerHTML=`<div><p class="eyebrow">TU AVANCE</p><h3>${done?'Lección completada':'¿Terminaste esta lección?'}</h3><p>${done?'Ya sumaste 100 puntos. Repasarla no vuelve a sumar.':'Después de practicar y revisar tu autoevaluación, marcala como completada. Sumás 100 puntos y podés seguir con la próxima.'}</p><p class="footnote">Puntos de aprendizaje; no son créditos de canje.</p></div><div><button id="complete-lesson" class="primary" ${completionPending||!progress?'disabled':''}>${done?'Continuar con la siguiente lección':'Completar y continuar · +100 puntos'}</button>${!progress?`<p class="footnote">${escapeHTML(progressError||'Cargando tu progreso…')}</p><button id="retry-progress" class="secondary">Reintentar</button>`:''}</div>`;
 $('#complete-lesson').addEventListener('click',()=>finishLesson(id));$('#retry-progress')?.addEventListener('click',loadProgress);
 if(done&&id==='A12')$('#complete-lesson').textContent='Curso completado · Volver al curso';
}
async function finishLesson(id){
 if(completionPending)return;completionPending=true;renderCompletion(id);
 try {
 const response=await fetch('/api/progress',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonId:id})});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'No pudimos guardar la lección.');
 progress=data;renderPoints();if(page==='curso')renderCourse();toast(data.awardedPoints?`¡Lección completada! +${data.awardedPoints} puntos`:'Tu progreso ya estaba guardado.');
 if($('#detail-dialog').open&&currentLessonId===id){if(data.nextLessonId)await openLesson(data.nextLessonId);else{$('#detail-dialog').close();location.hash='curso';toast(data.completed.length===40?'¡Completaste las 40 lecciones!':'Tu progreso quedó guardado.');}}
 }catch(error){toast(error.message);}finally{completionPending=false;if(currentLessonId&&$('#detail-dialog').open)renderCompletion(currentLessonId);}
}
