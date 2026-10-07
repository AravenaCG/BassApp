const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function journeyState(lessons,completed=[]){
 const known=new Set(completed),next=lessons.find(l=>!known.has(l.lessonId));
 return lessons.map(l=>({...l,state:known.has(l.lessonId)?'done':l===next?'current':'available'}));
}
export function journeyHTML(lessons,completed=[]){
 const stations=journeyState(lessons,completed);
 return `<svg class="journey-links" aria-hidden="true"></svg><ol class="journey-path" aria-label="Estaciones de este nivel">${stations.map((l,i)=>`<li class="journey-station ${l.state}"><button data-lesson="${esc(l.lessonId)}" ${l.state==='current'?'aria-current="step"':''} aria-label="${esc(l.lessonId+' · '+l.title+' · '+({done:'Completada',current:'Próxima lección',available:'Disponible para explorar'}[l.state]))}"><span class="station-orb" aria-hidden="true">${l.state==='done'?'✓':String(i+1).padStart(2,'0')}</span><span class="station-copy"><small>${esc(l.lessonId)} · ${l.state==='current'?'ESTÁS ACÁ':l.state==='done'?'COMPLETADA':'EXPLORAR'}</small><strong>${esc(l.title)}</strong></span>${l.state==='current'?'<span class="journey-player" aria-hidden="true">♪</span>':''}</button></li>`).join('')}</ol>`;
}
export function drawJourneyPath(map){
 const svg=map.querySelector('.journey-links');if(!svg||!map.clientWidth)return;
 const box=map.getBoundingClientRect(),points=[...map.querySelectorAll('.station-orb')].map(el=>{const r=el.getBoundingClientRect();return {x:r.left-box.left+r.width/2,y:r.top-box.top+r.height/2,done:el.closest('li').classList.contains('done')};});
 svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
 svg.innerHTML=points.slice(1).map((p,i)=>{const a=points[i],mid=(a.y+p.y)/2;return `<path class="${a.done&&p.done?'traveled':''}" d="M${a.x} ${a.y} C${a.x} ${mid},${p.x} ${mid},${p.x} ${p.y}"/>`;}).join('');
}
export function mountCourseSpaces(){
 const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='course-ui.css?v=1';document.head.append(stylesheet);
 const course=document.querySelector('#curso'),filters=course.querySelector('.filter-bar'),list=course.querySelector('#course-list');
 const nav=document.createElement('div');nav.className='course-spaces';nav.setAttribute('role','group');nav.setAttribute('aria-label','Espacios de aprendizaje');
 nav.innerHTML='<button class="selected" data-course-space="journey" aria-pressed="true" aria-controls="course-journey"><span>01 · MI RECORRIDO</span><strong>40 estaciones para tocar</strong><small>Lecciones, partituras y progreso de tu cuenta.</small></button><button data-course-space="harmony" aria-pressed="false" aria-controls="course-harmony"><span>02 · LABORATORIO DE ARMONÍA</span><strong>Entender lo que tocás</strong><small>16 unidades complementarias. Repaso local, sin puntos extra.</small></button>';
 const journey=document.createElement('section');journey.id='course-journey';journey.className='course-space-panel';
 const lab=document.createElement('section');lab.id='course-harmony';lab.hidden=true;
 filters.before(nav,journey,lab);journey.append(filters);
 const intro=document.createElement('header');intro.className='journey-intro';intro.innerHTML='<p class="eyebrow">EL MAPA DE TU APRENDIZAJE</p><h2>Un punto, una lección.</h2><p>Seguí la nota luminosa hasta tu primera lección pendiente. Podés visitar cualquier estación para explorar o repasar.</p><p id="journey-progress" role="status"></p><div class="journey-key"><span>✓ Completada</span><span>♪ Próxima parada</span><span>○ Disponible</span></div><div class="button-row"><button class="primary" id="journey-continue">Continuar recorrido</button><button class="secondary" id="journey-layout" aria-pressed="false">Ver como lista</button></div>';
 journey.prepend(intro);
 const map=document.createElement('div');map.id='course-map';journey.append(map,list);list.hidden=true;
 new ResizeObserver(()=>drawJourneyPath(map)).observe(map);
 function show(space){const harmony=space==='harmony';journey.hidden=harmony;lab.hidden=!harmony;nav.querySelectorAll('button').forEach(b=>{const selected=b.dataset.courseSpace===space;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});}
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{location.hash=b.dataset.courseSpace==='journey'?'curso':'curso?espacio=armonia';show(b.dataset.courseSpace);document.dispatchEvent(new Event('course-space-change'));});
 document.querySelector('#journey-layout').onclick=e=>{const asList=list.hidden;list.hidden=!asList;map.hidden=asList;e.currentTarget.setAttribute('aria-pressed',String(asList));e.currentTarget.textContent=asList?'Ver como mapa':'Ver como lista';};
 return {show};
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
