import {tourStop,avatarSVG,venueSVG,mountTourPreferences,tourKey,readTourPreferences,tourPreferences,AVATAR_COLORS} from './tour.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function journeyState(lessons,completed=[]){
 const known=new Set(completed),next=lessons.find(l=>!known.has(l.lessonId));
 return lessons.map(l=>({...l,state:known.has(l.lessonId)?'done':l===next?'current':'available'}));
}
export function journeyHTML(lessons,completed=[],preferences={},instrument='electricBass'){
 const stations=journeyState(lessons,completed);
 return `<svg class="journey-links" aria-hidden="true"></svg><ol class="journey-path" aria-label="Estaciones de este nivel">${stations.map(l=>{const stop=tourStop(l.lessonId);return `<li class="journey-station ${l.state}" data-venue="${esc(stop.scene)}"><button data-lesson="${esc(l.lessonId)}" ${l.state==='current'?'aria-current="step"':''} aria-label="${esc(l.lessonId+' · '+stop.name+' · '+l.title+' · '+({done:'Completada',current:'Próxima lección',available:'Disponible para explorar'}[l.state]))}"><span class="station-orb" aria-hidden="true">${venueSVG(stop.scene)}<span class="venue-number">${l.state==='done'?'✓':String(stop.number).padStart(2,'0')}</span></span><span class="station-copy"><small>${esc(l.lessonId)} · ${l.state==='current'?'ESTÁS ACÁ':l.state==='done'?'COMPLETADA':'EXPLORAR'}</small><strong class="venue-name">${esc(stop.name)}</strong><span class="venue-caption">${esc(stop.caption)}</span><span class="venue-lesson">${esc(l.title)}</span></span>${l.state==='current'?`<span class="journey-player" aria-hidden="true">${avatarSVG(preferences,instrument)}</span>`:''}</button></li>`;}).join('')}</ol>`;
}
export function drawJourneyPath(map){
 const svg=map.querySelector('.journey-links');if(!svg||!map.clientWidth)return;
 const box=map.getBoundingClientRect(),points=[...map.querySelectorAll('.station-orb')].map(el=>{const r=el.getBoundingClientRect();return {x:r.left-box.left+r.width/2,y:r.top-box.top+r.height/2,done:el.closest('li').classList.contains('done')};});
 svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
 svg.innerHTML=points.slice(1).map((p,i)=>{const a=points[i],mid=(a.y+p.y)/2;return `<path class="${a.done&&p.done?'traveled':''}" d="M${a.x} ${a.y} C${a.x} ${mid},${p.x} ${mid},${p.x} ${p.y}"/>`;}).join('');
}
export function mountCourseSpaces(){
 const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='course-ui.css?v=2';document.head.append(stylesheet);
 const course=document.querySelector('#curso'),filters=course.querySelector('.filter-bar'),list=course.querySelector('#course-list');
 const nav=document.createElement('div');nav.className='course-spaces';nav.setAttribute('role','group');nav.setAttribute('aria-label','Espacios de aprendizaje');
 nav.innerHTML='<button class="selected" data-course-space="journey" aria-pressed="true" aria-controls="course-journey"><span>01 · MI RECORRIDO</span><strong>40 estaciones para tocar</strong><small>Lecciones, partituras y progreso de tu cuenta.</small></button><button data-course-space="harmony" aria-pressed="false" aria-controls="course-harmony"><span>02 · LABORATORIO DE ARMONÍA</span><strong>Entender lo que tocás</strong><small>16 unidades complementarias. Repaso local, sin puntos extra.</small></button>';
 const journey=document.createElement('section');journey.id='course-journey';journey.className='course-space-panel';
 const lab=document.createElement('section');lab.id='course-harmony';lab.hidden=true;
 filters.before(nav,journey,lab);journey.append(filters);
 const intro=document.createElement('header');intro.className='journey-intro';intro.innerHTML='<p class="eyebrow">EL MAPA DE TU APRENDIZAJE</p><h2>Tu primera gira.</h2><p>Desde tocar en tu cuarto hasta un Show en River Plate: 40 paradas de una gira imaginaria. Cada lugar conserva su lección y su objetivo musical. Podés explorar y repasar cualquier parada.</p><p id="journey-progress" role="status"></p><p id="tour-position" role="status"></p><div class="journey-key"><span>✓ Completada</span><span>Avatar · próxima parada</span><span>○ Disponible para explorar</span></div><div class="button-row"><button class="primary" id="journey-continue">Continuar recorrido</button><button class="secondary" id="journey-layout" aria-pressed="false">Ver como lista</button></div><details class="tour-look"><summary>Elegir mi avatar</summary><div id="tour-controls"></div></details><section class="tour-coming" aria-label="Próximamente en tu gira"><p class="eyebrow">PRÓXIMAMENTE</p><h3>Conciertos y recompensas</h3><p>Conciertos de cierre para combinar lo aprendido y accesorios para tu avatar. Todavía no están disponibles: completar lecciones hoy guarda tu avance, pero no desbloquea premios.</p></section>';
 journey.prepend(intro);
 const map=document.createElement('div');map.id='course-map';journey.append(map,list);list.hidden=true;
 let user=null,prefs=tourPreferences(),controls,previous=null,pending=null,animation=null,traveler=null,renderVersion=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function stopAnimation(){animation?.cancel();animation=null;traveler?.remove();traveler=null;map.querySelectorAll('.journey-player').forEach(n=>n.style.visibility='');}
 function appearance(){map.style.setProperty('--tour-accent',AVATAR_COLORS[prefs.color]);map.querySelectorAll('.journey-player').forEach(n=>n.innerHTML=avatarSVG(prefs,user?.instrument));if(!prefs.motion||reduced.matches){pending=null;stopAnimation();}}
 function customize(){controls=mountTourPreferences(document.querySelector('#tour-controls'),{user,instrument:user?.instrument});appearance();}
 function playPending(){
  if(!pending||!prefs.motion||reduced.matches)return;
  if(document.querySelector('#detail-dialog').open||map.hidden||journey.hidden||!map.getClientRects().length||document.hidden)return;
  const from=map.querySelector(`[data-lesson="${pending.from}"] .station-orb`),to=map.querySelector(`[data-lesson="${pending.to}"] .journey-player`);if(!from||!to){pending=null;return;}
  const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),box=map.getBoundingClientRect();
  if(b.bottom<0||b.top>innerHeight)return;
  pending=null;stopAnimation();traveler=document.createElement('span');traveler.className='journey-traveler';traveler.innerHTML=avatarSVG(prefs,user?.instrument);traveler.setAttribute('aria-hidden','true');map.append(traveler);to.style.visibility='hidden';
  const x=a.left-box.left+(a.width-b.width)/2,y=a.top-box.top+(a.height-b.height)/2,tx=b.left-box.left,ty=b.top-box.top;
  animation=traveler.animate([{transform:`translate(${x}px,${y}px)`},{transform:`translate(${(x+tx)/2}px,${(y+ty)/2-24}px)`},{transform:`translate(${tx}px,${ty}px)`}],{duration:950,easing:'ease-in-out'});
  const running=animation;animation.finished.then(()=>{if(animation===running)stopAnimation();}).catch(()=>{});
 }
 document.querySelector('#detail-dialog').addEventListener('close',()=>requestAnimationFrame(playPending));
 window.addEventListener('scroll',playPending,{passive:true});reduced.addEventListener('change',appearance);
 document.addEventListener('tour-look-change',e=>{if(e.detail.key===tourKey(user)){prefs=tourPreferences(e.detail.preferences);controls.refresh(prefs);appearance();}});
 customize();
 function render(lessons,completed=[],ready=true){
  const stations=journeyState(lessons,completed),current=stations.find(l=>l.state==='current'),level=lessons[0]?.lessonId;
  if(ready&&previous?.ready&&previous.level===level&&previous.current&&current&&previous.current!==current.lessonId&&completed.includes(previous.current)&&!previous.completed.includes(previous.current))pending={from:previous.current,to:current.lessonId};
  else if(previous?.level!==level||!ready||!previous?.ready)pending=null;
  previous={level,current:current?.lessonId,completed:[...completed],ready};stopAnimation();map.innerHTML=journeyHTML(lessons,completed,prefs,user?.instrument);appearance();
  document.querySelector('#tour-position').textContent=current?`Próxima parada en este nivel: ${tourStop(current.lessonId).name}.`:'¡Completaste las paradas de este nivel! Podés volver a cualquier escenario para repasar.';
  const version=++renderVersion;requestAnimationFrame(()=>{if(version===renderVersion){drawJourneyPath(map);playPending();}});
 }
 new ResizeObserver(()=>drawJourneyPath(map)).observe(map);
 function show(space){const harmony=space==='harmony';journey.hidden=harmony;lab.hidden=!harmony;nav.querySelectorAll('button').forEach(b=>{const selected=b.dataset.courseSpace===space;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});if(!harmony)requestAnimationFrame(playPending);else stopAnimation();}
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{location.hash=b.dataset.courseSpace==='journey'?'curso':'curso?espacio=armonia';show(b.dataset.courseSpace);document.dispatchEvent(new Event('course-space-change'));});
 document.querySelector('#journey-layout').onclick=e=>{const asList=list.hidden;list.hidden=!asList;map.hidden=asList;e.currentTarget.setAttribute('aria-pressed',String(asList));e.currentTarget.textContent=asList?'Ver como mapa':'Ver como lista';};
 return {show,render,setUser(value){if(tourKey(value)!==tourKey(user)){previous=null;pending=null;stopAnimation();}user=value;try{prefs=readTourPreferences(user,localStorage);}catch{prefs=tourPreferences();}customize();}};
}
export function readingExercisesHTML(data,base){
 const groups=new Map();for(const exercise of data.readingExercises||[]){if(!groups.has(exercise.materialId))groups.set(exercise.materialId,[]);groups.get(exercise.materialId).push(exercise);}
 return `<section class="lesson-reading"><p class="eyebrow">APLICACIÓN Y LECTURA</p><h3>Leé con la partitura a la vista</h3><p>Los números de compás corresponden a la partitura de cada bloque. Pulsá la imagen para ampliarla; respondé antes de abrir la solución.</p>${[...groups].map(([id,exercises])=>{
  const material=data.musicalMaterials.find(m=>m.materialId===id);
  const renders=(material?.renderAssetIds||[]).map(id=>data.assets.find(a=>a.assetId===id)).filter(Boolean);
  const questions=exercises.map(e=>{
   const answer=e.answerKey||{},form=['formAndRoots','barChordMapping'].includes(e.responseType);
   const notes=answer.latinNotes?`<ol>${answer.latinNotes.map((n,i)=>`<li>${esc(n)}${Array.isArray(answer.chordToneFlags)?' · '+(answer.chordToneFlags[i]?'nota del acorde':'contraste o paso'):''}</li>`).join('')}</ol>`:'';
   const symbols=answer.symbols?`<p>${esc(answer.bars)} compases: ${answer.symbols.map(esc).join(' → ')}</p><p>Fundamentales: ${(answer.latinRoots||[]).map(esc).join(' → ')}</p>`:'';
   const bars=Array.isArray(answer.bars)?`<ul>${answer.bars.map(b=>`<li>Compás ${esc(b.bar)} · ${esc(b.symbol)} · Fundamental: ${esc(b.latinRoot)}</li>`).join('')}</ul>`:'';
   return `<article class="reading-question"><p class="reading-bar">${esc(e.exerciseId)} · ${form?'Forma completa':'Compás '+esc(e.bar)}</p><p>${esc(e.prompt)}</p><details><summary>Comprobar mi lectura</summary>${notes}${symbols}${bars}<p>${esc(e.feedback||'')}</p></details></article>`;
  }).join('');
  return `<section class="reading-material" data-reading-material="${esc(id)}"><h4>${esc(material?.title||id)}</h4>${renders.map(a=>`<figure><img class="score-img" src="${esc(base+a.relativePath)}" alt="Partitura de ${esc(material.title)} para los ejercicios de lectura" loading="lazy"><figcaption>Material: ${esc(id)} · Ubicá el compás indicado en cada consigna.</figcaption></figure>`).join('')||'<p>No se encontró la imagen de este material. Consultá la lección PDF.</p>'}${questions}</section>`;
 }).join('')}</section>`;
}
