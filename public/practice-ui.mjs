import {catalog,GROUPS,generatedScore,parseScore,PracticeEngine,playablePosition} from './practice-engine.mjs';
import {activeRepertoire} from './repertoire.mjs';
import {parseMidi} from './midi-score.mjs';
import {planFingering,routeHTML,stringNames} from './fingering.mjs';
import {learningStore} from './learning-store.mjs';
import {mountBassSound} from './bass-sound-ui.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={basic:'Básico',intermediate:'Intermedio',advanced:'Avanzado'};
const noteNames=['Do','Do♯','Re','Mi♭','Mi','Fa','Fa♯','Sol','La♭','La','Si♭','Si'];
export function mountPractice(host,{onLesson,onJournal}) {
  host.innerHTML=`
    <div class="workspace-header"><div><p class="eyebrow">TU PRÁCTICA DE HOY</p><h2 id="exercise-title">Elegí tu práctica</h2><p id="exercise-goal"></p></div>
    <label>Instrumento<select id="practice-instrument"><option value="electricBass">Bajo eléctrico</option><option value="doubleBass">Contrabajo</option></select></label></div>
    <div class="practice-options">
      <label>Nivel<select id="practice-level"><option value="">Todos</option><option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option></select></label>
      <label>Elegir otra práctica<select id="exercise-select"></select></label>
      <label id="difficulty-label">Línea de bajo<select id="practice-difficulty"><option value="roots">Fundamentales · básico</option><option value="fifths">Fundamental y quinta · básico</option><option value="arpeggios">Arpegios · intermedio</option><option value="walking">Walking bass · intermedio</option></select></label>
    </div>
    <div class="fret-area"><p id="practice-description"></p><svg id="practice-fretboard" viewBox="0 0 1000 300" role="img" aria-label="Notas de la práctica en el mástil"></svg>
    <p id="practice-note" role="status">Elegí una práctica para empezar.</p><div id="practice-bars" class="practice-bars"></div></div>
    <div class="practice-transport">
      <button id="practice-play" class="primary" disabled>Reproducir</button><button id="practice-stop" class="secondary">Volver al inicio</button>
      <label>Tempo (BPM)<input id="practice-tempo" type="number" min="30" max="200" step="1" value="72"></label>
      <label>Volumen<input id="practice-volume" type="range" min="0" max="100" value="60"></label>
      <label>Escuchar<select id="practice-mix"><option value="full">Mezcla completa</option><option value="no-bass">Sin bajo · tocá vos</option><option value="bass-only">Sólo bajo</option><option value="original" hidden>Piano original · MIDI</option></select></label>
      <label class="check"><input type="checkbox" id="practice-guide" checked>Bajo guía</label>
      <label class="check"><input type="checkbox" id="practice-click" checked>Metrónomo</label>
      <label class="check"><input type="checkbox" id="practice-visual" checked>Notas que caen</label>
    </div>
    <details class="practice-settings"><summary>Repetir compases y aumentar dificultad</summary><div class="practice-options">
      <label>Desde el compás<select id="loop-from"></select></label><label>Hasta el compás<select id="loop-to"></select></label>
      <label class="check"><input id="practice-loop" type="checkbox">Repetir fragmento</label>
      <label>Aumento por vuelta<select id="practice-increment"><option value="0">Mantener tempo</option><option value="2">+2 BPM</option><option value="5">+5 BPM</option></select></label>
    </div><p>Espacio: reproducir o pausar. Flechas: cambiar 2 BPM cuando no estás escribiendo.</p></details>
    <details class="practice-settings"><summary>Partitura de la línea de bajo · clave de fa</summary><div id="practice-score" class="score-scroll"></div>
      <p>Vista didáctica simplificada, no edición crítica. El bajo suena una octava por debajo de lo escrito. El mapa de contrabajo indica semitonos, no digitaciones.</p></details>
    <p id="practice-source"></p>
    <div class="workspace-bottom"><button class="secondary" id="practice-lesson">Abrir lección</button><button class="secondary" id="practice-journal">Guardar práctica en mi diario</button><span id="practice-status" role="status"></span></div>
    <p class="practice-legend">Colores por función respecto del acorde: <span>● Fundamental</span> · <span>● Tercera</span> · <span>● Quinta</span> · <span>● Séptima</span> · <span>● Otras / sin armonía indicada</span></p>
    <details class="practice-settings" id="repertoire-library"><summary>Repertorio beta · partituras y fuentes</summary>
      <p>Seis obras históricas de jazz y ragtime. Las partituras son para piano, no partes originales de bajo. Los títulos de Morton abren fuentes externas y todavía no tienen audio sincronizado en Appbass.</p>
      <div class="repertoire-grid">${activeRepertoire().map(r=>`<article data-collection="${r.collection}" data-repertoire-id="${r.id}"><span class="eyebrow">REPERTORIO BETA</span><h3>${esc(r.title)}</h3><p>${esc(r.composer)} · ${esc(r.edition)}</p><p>${esc(r.status)}</p><p>${esc(r.license)}</p><a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Fuente y condiciones ↗</a>${r.pdf?` · <a href="${r.pdf}" target="_blank" rel="noopener">Partitura completa PDF</a><div class="button-row"><button class="primary" data-listen-repertoire="${r.id}">Escuchar tema</button><button class="secondary" data-play-repertoire="${r.id}">Practicar reducción de bajo</button></div><p role="status" data-repertoire-status="${r.id}"></p>`:''}</article>`).join('')}</div>
      <p>Elegí las ediciones históricas señaladas, no cualquier arreglo moderno de la misma página. Dominio público no equivale a ausencia de obligaciones en todos los países; en Argentina puede aplicar el dominio público pagante.</p>
      <p><a href="repertoire/README.md" target="_blank" rel="noopener">Procedencia, licencias y límites</a> · <a href="repertoire/asset-manifest.json" target="_blank" rel="noopener">Manifiesto verificable de archivos</a></p>
    </details>`;
  const $=s=>host.querySelector(s);
  mountBassSound(host);
  $('#practice-instrument').insertAdjacentHTML('beforeend','<option value="electricBass5">Bajo de cinco cuerdas · B–E–A–D–G</option>');
  $('#practice-source').insertAdjacentHTML('beforebegin','<details class="practice-route"><summary>Recorrido guiado por compás · notas y tablatura</summary><div id="practice-route-content"></div><button type="button" class="secondary" id="practice-print">Imprimir este compás</button></details>');
  let item,score,planned=[],positionMap=new Map(),shownBar=-1,instrument='electricBass',loadRun=0,storageKey='appbass-practice-guest',sessionSeconds=0,lastFrame=0,preferencesReady=false;
  function plan(){planned=planFingering(score?.notes||[],instrument);positionMap=new Map((score?.notes||[]).map((n,i)=>[n,planned[i]]));shownBar=-1;}
  function pos(n){return positionMap.get(n)||playablePosition(n.midi,instrument);}
  $('#practice-print').onclick=()=>{const sheet=document.createElement('section');sheet.id='bass-print-sheet';sheet.innerHTML='<h1>Appbass · '+esc(item.title)+'</h1>'+$('#practice-route-content').innerHTML;document.querySelector('#bass-print-sheet')?.remove();document.body.append(sheet);window.print();};
  const engine=new PracticeEngine((beat,tempo)=>{
    if(lastFrame&&document.visibilityState==='visible')sessionSeconds+=Math.min(1,(performance.now()-lastFrame)/1000);
    lastFrame=performance.now();draw(beat);$('#practice-tempo').value=String(tempo);
  },()=>{lastFrame=0;$('#practice-play').textContent='Reproducir';$('#practice-status').textContent='Práctica terminada. Podés repetirla o guardarla en tu diario.';});
  engine.onSoundStatus=value=>$('#bass-sound-status').textContent='Sonido activo: '+value;
  function save(){if(!preferencesReady)return;const value={id:item?.id,tempo:engine.tempo,instrument,difficulty:$('#practice-difficulty').value};try{localStorage.setItem(storageKey,JSON.stringify(value));}catch{}if(learningStore.user&&storageKey==='appbass-practice-'+learningStore.user.id)learningStore.setPreference('practice',value).then(()=>$('#practice-status').textContent='Preferencias guardadas en tu cuenta.').catch(e=>$('#practice-status').textContent='No se guardó en la nube: '+e.message);}
  learningStore.subscribe(async()=>{if(!learningStore.user||storageKey!=='appbass-practice-'+learningStore.user.id||!learningStore.ready)return;const pref=learningStore.preference('practice');if(!pref)return;preferencesReady=false;instrument=pref.instrument||instrument;$('#practice-instrument').value=instrument;$('#practice-difficulty').value=pref.difficulty||'roots';await load(pref.id||item?.id);if(pref.tempo){engine.tempo=pref.tempo;$('#practice-tempo').value=pref.tempo;}preferencesReady=true;});
  function choices(){
    const level=$('#practice-level').value;
    $('#exercise-select').innerHTML=Object.entries(GROUPS).map(([k,label])=>`<optgroup label="${label}">${catalog.filter(c=>c.group===k&&(!level||c.level===level)).map(c=>`<option value="${c.id}">${esc(c.title)} · ${labels[c.level]} · ${c.minutes} min</option>`).join('')}</optgroup>`).join('');
  }
  async function load(id){
    const run=++loadRun;engine.stop();lastFrame=0;sessionSeconds=0;
    item=catalog.find(c=>c.id===id)||catalog[0];$('#exercise-select').value=item.id;
    $('#practice-play').disabled=true;$('#practice-play').textContent='Reproducir';$('#practice-status').textContent='Preparando práctica…';
    $('#difficulty-label').hidden=!item.generated||['strings','scale'].includes(item.generated);
    $('#practice-source').textContent='';
    try {
      let next;
      if(item.generated)next=generatedScore(item.generated==='strings'&&instrument==='electricBass5'?'strings5':item.generated,$('#practice-difficulty').value);
      else if(item.midi){const r=await fetch(item.midi);if(!r.ok)throw Error();next=parseMidi(await r.arrayBuffer());}
      else {
        const base=`course/lessons/${item.lesson}/`;
        const r=await fetch(base+item.lesson+'.lesson.json');if(!r.ok)throw Error();
        const lesson=await r.json(),m=lesson.musicalMaterials.find(x=>x.materialId===item.material);
        const asset=lesson.assets.find(a=>a.assetId===m.musicXmlAssetId);
        const xml=await fetch(base+asset.relativePath);if(!xml.ok)throw Error();
        next=parseScore(await xml.text());
      }
      if(run!==loadRun)return false;
      if(!next.notes.length)throw Error();
      score=next;plan();engine.load(score);
      $('#practice-mix option[value="original"]').hidden=!item.midi;
      if(!item.midi&&engine.mix==='original')setMix('full');
      $('#exercise-title').textContent=item.title;$('#exercise-goal').textContent=item.goal;
      $('#practice-source').innerHTML=item.midi?`Repertorio beta · ${esc(item.edition)}. Reducción automática: los graves se adaptan al registro del bajo; el resto del piano forma el acompañamiento. Sin cifrado inferido. Tempo fijo de estudio. <a href="${item.pdf}" target="_blank" rel="noopener">Ver partitura original completa</a>`:item.group==='backing'?'Acompañamiento original de Appbass con samples CC0 de Versilian Studios. No contiene pistas ni datos de iReal Pro.':'';
      $('#practice-description').textContent=`${labels[item.level]} · ${item.minutes} min sugeridos · ${score.bars.length} compases${item.group==='songs'?' · Composición original de Appbass':''}`;
      $('#practice-tempo').value=score.tempo;
      const opts=score.bars.map((b,i)=>`<option value="${i}">${i+1}</option>`).join('');
      $('#loop-from').innerHTML=opts;$('#loop-to').innerHTML=opts;$('#loop-to').value=String(score.bars.length-1);
      $('#practice-bars').innerHTML=score.bars.map((b,i)=>`<button type="button" class="chord-cell" data-bar="${i}" aria-label="Ir al compás ${i+1}"><small>${i+1}</small>${esc(b.chord||'—')}</button>`).join('');
      $('#practice-bars').querySelectorAll('button').forEach(b=>b.onclick=()=>engine.seek(score.bars[Number(b.dataset.bar)].beat));
      $('#practice-lesson').hidden=!item.lesson;$('#practice-score').innerHTML=renderScore(score);
      $('#practice-play').disabled=false;$('#practice-status').textContent='Lista. Podés cambiar el tempo o elegir un fragmento.';
      draw(0);save();return true;
    } catch {if(run===loadRun)$('#practice-status').textContent='No pudimos cargar esta práctica. Elegí otra o volvé a seleccionarla.';return false;}
  }
  function draw(beat){
    if(!score)return;
    const active=score.notes.find(n=>beat>=n.beat&&beat<n.beat+n.duration);
    const current=score.bars.findIndex(b=>beat>=b.beat&&beat<b.beat+b.length);
    $('#practice-bars').querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('current',i===current);b.setAttribute('aria-pressed',String(i===current));});
    const activePos=active?pos(active):null;
    $('#practice-note').textContent=active?`Compás ${current+1} · ${noteNames[active.midi%12]}${activePos?' · cuerda '+stringNames(instrument)[activePos.string]+' · '+(instrument==='doubleBass'?'semitono ':'traste ')+activePos.fret+(activePos.shift?' · Cambio de posición':''):''}`:`Compás ${current+1} · Silencio`;
    if(current!==shownBar){shownBar=current;const bar=score.bars[current];const route=planned.filter(n=>bar&&n.beat>=bar.beat&&n.beat<bar.beat+bar.length).map((n,i)=>({...n,step:i+1,symbol:noteNames[n.midi%12]}));$('#practice-route-content').innerHTML='<h3>Compás '+(current+1)+'</h3>'+routeHTML(route,instrument);}
    const upcoming=score.notes.filter(n=>n.beat>=beat&&n.beat-beat<4);
    const bar=score.bars[current],step=active&&bar?score.notes.filter(n=>n.beat>=bar.beat&&n.beat<bar.beat+bar.length).indexOf(active)+1:0;
    $('#practice-route-content').querySelectorAll('[data-route-step]').forEach(n=>n.classList.toggle('route-active',Number(n.dataset.routeStep)===step));
    $('#practice-route-content').querySelectorAll('[data-route-steps]').forEach(n=>n.classList.toggle('route-active',step>0&&n.dataset.routeSteps.split(' ').includes(String(step))));
    const positions=[...upcoming,...(active?[active]:[])].map(pos).filter(Boolean);
    const maxFret=Math.max(12,...positions.map(p=>p.fret)),base=Math.max(0,maxFret-12);
    const color=n=>{const bar=score.bars.find(b=>n.beat>=b.beat&&n.beat<b.beat+b.length);if(bar?.root==null)return '#bd8cff';const interval=(n.midi-bar.root+120)%12;return interval===0?'#48e3ed':[3,4].includes(interval)?'#ff6cba':[6,7].includes(interval)?'#88ff99':[10,11].includes(interval)?'#ffc571':'#bd8cff';};
    let svg='<defs><filter id="practice-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="80" y="165" width="880" height="105" rx="6" fill="#0b1420"/>';
    for(let f=0;f<=12;f++){const x=90+f*71;svg+=`<line x1="${x}" y1="165" x2="${x}" y2="270" stroke="#42536a" ${instrument==='doubleBass'?'stroke-dasharray="3 4"':''}/><text x="${x}" y="291" fill="#a8bad0" text-anchor="middle" font-size="12">${base+f}</text>`;}
    const spacing=instrument==='electricBass5'?22:28;
    stringNames(instrument).forEach((s,i)=>{const y=177+i*spacing;svg+=`<line x1="70" y1="${y}" x2="960" y2="${y}" stroke="#8394aa"/><text x="30" y="${y+4}" fill="#cfdae8" font-size="14">${s}</text>`;});
    if($('#practice-visual').checked) {
      for(const n of upcoming){const p=pos(n);if(!p)continue;const x=90+(p.fret-base)*71,y=150-(n.beat-beat)*32;
        svg+=`<rect x="${x-15}" y="${y-22}" width="30" height="22" rx="3" fill="#081722" stroke="${color(n)}" stroke-width="2" filter="url(#practice-glow)" opacity="${1-(n.beat-beat)*.12}"/><text x="${x}" y="${y-6}" text-anchor="middle" font-size="10" fill="${color(n)}">${noteNames[n.midi%12]}</text>`;}
      if(active){const p=pos(active);if(p)svg+=`<circle cx="${90+(p.fret-base)*71}" cy="${177+p.string*spacing}" r="13" fill="${color(active)}" filter="url(#practice-glow)"/>`;}
    }
    $('#practice-fretboard').innerHTML=svg;
    $('#practice-score').querySelectorAll('[data-beat]').forEach(n=>n.classList.toggle('sounding',beat>=Number(n.dataset.beat)&&beat<Number(n.dataset.beat)+Number(n.dataset.duration)));
  }
  async function toggle(){if(engine.playing){engine.pause();lastFrame=0;}else{try{$('#practice-play').disabled=true;$('#practice-status').textContent='Preparando audio…';await engine.play();$('#practice-status').textContent=engine.sampleStatus||'';}catch{$('#practice-status').textContent='El navegador no pudo iniciar el audio. Intentá nuevamente.';}finally{$('#practice-play').disabled=false;}}$('#practice-play').textContent=engine.playing?'Pausar':'Reproducir';}
  $('#practice-play').onclick=toggle;
  $('#practice-stop').onclick=()=>{engine.stop();lastFrame=0;draw(engine.start);$('#practice-play').textContent='Reproducir';};
  $('#exercise-select').onchange=e=>load(e.target.value);
  $('#practice-level').onchange=()=>{choices();load($('#exercise-select').value);};
  $('#practice-difficulty').onchange=()=>load(item.id);
  $('#practice-instrument').onchange=e=>{instrument=e.target.value;if(item?.generated==='strings')void load(item.id);else{plan();draw(engine.position());}save();};
  $('#practice-tempo').onchange=e=>{const v=Number(e.target.value);if(!Number.isFinite(v))return;e.target.value=Math.max(30,Math.min(200,v));engine.configure({tempo:Number(e.target.value)});save();};
  $('#practice-volume').oninput=e=>engine.configure({volume:Number(e.target.value)/100});
  $('#practice-guide').onchange=e=>engine.configure({guide:e.target.checked});
  function setMix(mode){const solo=mode==='bass-only',original=mode==='original';$('#practice-mix').value=mode;$('#practice-guide').checked=!original;$('#practice-guide').disabled=solo||original;$('#practice-click').disabled=original;if(solo||original)$('#practice-click').checked=false;engine.configure({mix:mode,guide:!original,metronome:$('#practice-click').checked});}
  $('#practice-mix').onchange=e=>setMix(e.target.value);
  host.querySelectorAll('[data-play-repertoire]').forEach(button=>button.onclick=async()=>{$('#practice-level').value='';choices();setMix('full');if(await load(button.dataset.playRepertoire)){$('[data-repertoire-status="'+button.dataset.playRepertoire+'"]').textContent='Reducción lista. Pulsá Reproducir en el reproductor.';$('#practice-play').focus();}});
  host.querySelectorAll('[data-listen-repertoire]').forEach(button=>button.onclick=async()=>{
    const id=button.dataset.listenRepertoire,status=$('[data-repertoire-status="'+id+'"]');status.textContent='Preparando escucha…';
    try{await engine.unlock();$('#practice-level').value='';choices();if(!await load(id)){status.textContent='No se pudo cargar el tema. Volvé a intentar.';return;}
      setMix('original');await toggle();
      status.textContent=engine.playing?(engine.volume>0?'Sonando en el reproductor · piano MIDI. Podés pausar arriba.':'Reproducción iniciada, pero el volumen está en cero. Subilo en el reproductor.'):'No se pudo iniciar el audio. Pulsá Reproducir para reintentar.';
      $('#practice-play').focus();
    }catch{status.textContent='El navegador no pudo iniciar el audio. Volvé a pulsar Escuchar tema.';}
  });
  $('#practice-click').onchange=e=>engine.configure({metronome:e.target.checked});
  $('#practice-visual').onchange=()=>draw(engine.position());
  $('#practice-loop').onchange=e=>engine.loop=e.target.checked;
  $('#practice-increment').onchange=e=>engine.increment=Number(e.target.value);
  function range(){
    let a=Number($('#loop-from').value),b=Number($('#loop-to').value);
    if(a>b){b=a;$('#loop-to').value=String(b);}
    engine.configure({start:score.bars[a].beat,end:score.bars[b].beat+score.bars[b].length});engine.seek(engine.start);
  }
  $('#loop-from').onchange=range;$('#loop-to').onchange=range;
  $('#practice-lesson').onclick=()=>onLesson(item.lesson);
  $('#practice-journal').onclick=()=>onJournal({exercise:item.title,tempo:engine.tempo,minutes:Math.max(1,Math.round(sessionSeconds/60))});
  document.addEventListener('keydown',e=>{
    if(!host.offsetParent||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)||e.target.isContentEditable)return;
    if(e.code==='Space'){e.preventDefault();void toggle();}
    if(['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();$('#practice-tempo').value=Math.max(30,Math.min(200,engine.tempo+(e.code==='ArrowRight'?2:-2)));$('#practice-tempo').dispatchEvent(new Event('change'));}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){engine.pause();lastFrame=0;$('#practice-play').textContent='Reproducir';}});
  choices();void load('open-strings');
  return {
    async selectExercise(id){if(!catalog.some(c=>c.id===id))return false;$('#practice-level').value='';choices();return await load(id);},
    async setUser(user){
      storageKey='appbass-practice-'+(user?.id||'guest');
      let pref;try{pref=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{}
      preferencesReady=false;
      const selected=pref?.instrument||user?.instrument;instrument=['electricBass','electricBass5','doubleBass'].includes(selected)?selected:'electricBass';$('#practice-instrument').value=instrument;
      $('#practice-level').value='';choices();
      $('#practice-difficulty').value=pref?.difficulty||'roots';
      await load(pref?.id||(user?.level==='advanced'?'turnaround':user?.level==='intermediate'?'ii-v-i':'open-strings'));
      if(pref?.tempo>=30&&pref.tempo<=200){engine.tempo=pref.tempo;$('#practice-tempo').value=pref.tempo;save();}
      preferencesReady=true;
    },
    async selectLesson(id){const choice=catalog.find(c=>c.lesson===id);if(choice){$('#practice-level').value='';choices();await load(choice.id);}return !!choice;},
    get current(){return item;},stop:()=>{engine.stop();lastFrame=0;draw(engine.start);$('#practice-play').textContent='Reproducir';}
  };
}
function renderScore(score) {
  // Written pitch is an octave above sounding pitch (bass transposition).
  const diatonic=[0,0,1,1,2,3,3,4,4,5,5,6], rows=[];
  for(let offset=0;offset<score.bars.length;offset+=4) {
    const bars=score.bars.slice(offset,offset+4);
    let svg='<svg viewBox="0 0 960 180" role="img" aria-label="Partitura en clave de fa"><rect width="960" height="180" fill="white"/>';
    for(let line=0;line<5;line++)svg+=`<line x1="25" y1="${65+line*12}" x2="945" y2="${65+line*12}" stroke="#243044"/>`;
    svg+='<text x="28" y="102" font-size="48" fill="#243044">𝄢</text>';
    bars.forEach((bar,i)=>{
      const left=85+i*210;svg+=`<text x="${left}" y="30" font-size="17" fill="#243044">${esc(bar.chord)}</text><text x="${left}" y="150" font-size="12" fill="#526078">${offset+i+1}</text><line x1="${left+200}" y1="65" x2="${left+200}" y2="113" stroke="#243044"/>`;
      for(const n of score.notes.filter(n=>n.beat>=bar.beat&&n.beat<bar.beat+bar.length)){
        const written=n.midi+12,d=7*(Math.floor(written/12)-1)+diatonic[written%12],y=113-(d-18)*6,x=left+14+(n.beat-bar.beat)/bar.length*172;
        let ledger='';for(let ly=125;ly<=y;ly+=12)ledger+=`<line x1="${x-12}" y1="${ly}" x2="${x+12}" y2="${ly}" stroke="#243044"/>`;for(let ly=53;ly>=y;ly-=12)ledger+=`<line x1="${x-12}" y1="${ly}" x2="${x+12}" y2="${ly}" stroke="#243044"/>`;
        svg+=`<g data-beat="${n.beat}" data-duration="${n.duration}" fill="#243044">${ledger}<ellipse cx="${x}" cy="${y}" rx="7" ry="5" stroke="currentColor" ${n.duration>=2?'fill="white"':''}/>${n.duration<4?`<line x1="${x+6}" y1="${y}" x2="${x+6}" y2="${y-30}" stroke="currentColor"/>`:''}${n.duration<1?`<path d="M${x+6} ${y-30} q14 8 6 18" fill="none" stroke="currentColor"/>`:''}${[1,3,6,8,10].includes(written%12)?`<text x="${x-20}" y="${y+5}" font-size="15">♯</text>`:''}</g>`;
      }
    });rows.push(svg+'</svg>');
  }
  return rows.join('');
}
