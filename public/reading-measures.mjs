import {bassSound,loadBassBank,nearestBassSample} from './bass-sounds.mjs';
const names=['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'];
const n=(midi,beats)=>({midi,beats});
export const READING_MEASURES=[
 {title:'Un paso por pulso',events:[n(50,1),n(52,1),n(53,1),n(null,1)]},
 {title:'Sostener y respirar',events:[n(48,2),n(null,1),n(50,1)]},
 {title:'Dos apoyos',events:[n(43,2),n(50,2)]},
 {title:'El silencio también cuenta',events:[n(null,1),n(45,1),n(48,2)]},
 {title:'Dividir el pulso',events:[n(50,.5),n(52,.5),n(53,1),n(null,1),n(50,1)]},
 {title:'Corcheas y registro grave',events:[n(40,1),n(null,1),n(43,.5),n(45,.5),n(47,1)]},
 {title:'Una nota, cuatro pulsos',events:[n(48,4)]},
 {title:'Silencio de blanca',events:[n(50,1),n(null,2),n(53,1)]}
];
const duration=b=>({'.5':'corchea','1':'negra','2':'blanca','4':'redonda'}[b]);
export function measureLabel(event){return `${event.midi===null?'Silencio de':names[event.midi%12]+' ·'} ${duration(event.beats)} · ${event.beats} pulso(s)`;}
export function measureSVG(measure,active=0,reveal=false){
 let svg='<svg class="reading-staff reading-measure" viewBox="0 0 560 180" role="img" aria-label="Compás de cuatro por cuatro en clave de fa">';
 for(let i=0;i<5;i++)svg+=`<line x1="20" x2="540" y1="${64+i*10}" y2="${64+i*10}"/>`;
 svg+='<path class="reading-clef" d="M48 78 C15 56 67 49 58 82 C54 98 34 108 25 104 C51 99 65 73 43 65 C30 61 24 70 32 78"/><circle cx="64" cy="69" r="2"/><circle cx="64" cy="79" r="2"/><text x="80" y="83">4</text><text x="80" y="102">4</text><line x1="540" x2="540" y1="64" y2="104"/>';
 let beat=0;
 measure.events.forEach((e,i)=>{
  const x=120+beat*100;svg+=`<g data-measure-event="${i}" class="${i===active?'measure-active':''}"><rect class="measure-highlight" x="${x-19}" y="30" width="38" height="100" rx="8"/>`;
  if(e.midi===null){
   if(e.beats===2)svg+=`<path class="measure-rest" d="M${x-10} 84h20v-5h-20z"/>`;
   else svg+=`<path class="measure-rest" d="M${x-3} 66l8 11-7 8 7 9c-15-7-15 6-6 10-16-2-15-17-4-17l-7-9 9-3z"/>`;
  }else{
   const pc=[0,2,4,5,7,9,11].indexOf(e.midi%12),step=(Math.floor(e.midi/12)-1)*7+pc,y=104-(step-18)*5;
   for(let ledger=114;ledger<=y;ledger+=10)svg+=`<line x1="${x-14}" x2="${x+14}" y1="${ledger}" y2="${ledger}"/>`;
   svg+=`<ellipse class="reading-note ${e.beats>=2?'measure-hollow':''}" cx="${x}" cy="${y}" rx="8" ry="5" transform="rotate(-20 ${x} ${y})"/>`;
   if(e.beats<4)svg+=`<path class="reading-stem" d="M${x+7} ${y}v-32"/>`;
   if(e.beats===.5)svg+=`<path class="reading-stem" d="M${x+7} ${y-32}q20 12 4 23"/>`;
  }
  svg+=`<text x="${x}" y="150" text-anchor="middle">${Number.isInteger(beat)?beat+1:(Math.floor(beat)+1)+' y'}</text>`;
  if(reveal)svg+=`<text class="measure-solution" x="${x}" y="171" text-anchor="middle">${e.midi===null?'Sil.':names[e.midi%12]} (${e.beats})</text>`;
  svg+='</g>';beat+=e.beats;
 });return svg+'</svg>';
}
export function mountMeasures(host){
 let index=0,cursor=0,errors=0,solved=0,revealed=false,ctx,version=0,timer,voices=[],timers=[];
 const $=s=>host.querySelector(s);
 function stop(){version++;clearTimeout(timer);timers.forEach(clearTimeout);timers=[];voices.forEach(v=>{try{v.stop();}catch{}});voices=[];if($('[data-bar-play]'))$('[data-bar-play]').disabled=false;if($('[data-bar-check]'))$('[data-bar-check]').disabled=revealed||cursor>=READING_MEASURES[index].events.length;}
 function render(){
  stop();const bar=READING_MEASURES[index];
  host.innerHTML=`<h3>Compás ${index+1} · ${bar.title}</h3><p>En 4/4 entran cuatro negras. Una blanca ocupa dos pulsos; dos corcheas comparten uno. Leé de izquierda a derecha: elegí la nota (o silencio) y su duración. Los números debajo indican dónde empieza cada figura.</p><p>No evaluamos tu ejecución con micrófono: después de resolver, tocá el compás con el audio.</p><div class="measure-scroll">${measureSVG(bar,cursor,revealed)}</div><p data-bar-position></p><div class="button-row"><label>Nota o silencio<select data-bar-pitch><option value="">Elegí…</option>${[0,2,4,5,7,9,11].map(p=>`<option value="${p}">${names[p]}</option>`).join('')}<option value="rest">Silencio</option></select></label><label>Duración<select data-bar-duration><option value="">Elegí…</option><option value="0.5">Corchea · ½ pulso</option><option value="1">Negra · 1 pulso</option><option value="2">Blanca · 2 pulsos</option><option value="4">Redonda · 4 pulsos</option></select></label><button data-bar-check class="primary">Comprobar figura</button></div><p role="status" data-bar-feedback></p><div class="button-row"><label>Tempo (BPM)<input data-bar-tempo type="number" min="40" max="120" value="60"></label><button data-bar-play class="secondary">Escuchar compás</button><button data-bar-stop class="secondary">Detener</button><button data-bar-reveal class="secondary">Ver solución</button><button data-bar-next class="primary">Otro compás</button></div><p data-bar-stats>Compases resueltos sin ayuda: ${solved}</p>`;
  $('[data-bar-position]').textContent=`Figura ${cursor+1} de ${bar.events.length}`;
  $('.measure-scroll').insertAdjacentHTML('afterend','<p class="footnote">En pantallas pequeñas, deslizá la partitura horizontalmente. El resaltado sigue la figura que estás leyendo o escuchando.</p>');
  $('[data-bar-check]').onclick=check;
  $('[data-bar-play]').onclick=play;
  $('[data-bar-stop]').onclick=()=>{stop();highlight(cursor);};
  $('[data-bar-next]').onclick=()=>{index=(index+1)%READING_MEASURES.length;cursor=0;errors=0;revealed=false;render();};
  $('[data-bar-reveal]').onclick=()=>{stop();revealed=true;$('.measure-scroll').innerHTML=measureSVG(bar,-1,true);$('[data-bar-feedback]').textContent=bar.events.map(measureLabel).join(' → ');$('[data-bar-check]').disabled=true;};
 }
 function highlight(i){host.querySelectorAll('[data-measure-event]').forEach(e=>e.classList.toggle('measure-active',Number(e.dataset.measureEvent)===i));const active=$('.measure-active'),scroll=$('.measure-scroll');if(active){const a=active.getBoundingClientRect(),s=scroll.getBoundingClientRect();scroll.scrollLeft+=a.left-s.left+a.width/2-scroll.clientWidth/2;}}
 function check(){
  if(revealed||cursor>=READING_MEASURES[index].events.length)return;
  const bar=READING_MEASURES[index],e=bar.events[cursor],pitch=$('[data-bar-pitch]').value,beats=$('[data-bar-duration]').value;
  if(!pitch||!beats){$('[data-bar-feedback]').textContent='Elegí la nota o silencio y la duración antes de comprobar.';return;}
  stop();highlight(cursor);
  if(pitch!==(e.midi===null?'rest':String(e.midi%12))||Number(beats)!==e.beats){errors++;$('[data-bar-feedback]').textContent='Revisá la posición y la figura: cabeza vacía con plica = blanca, llena = negra; con bandera = corchea. Los silencios no tienen altura.';return;}
  $('[data-bar-feedback]').textContent='¡Bien! '+measureLabel(e);$('[data-bar-check]').disabled=true;
  const token=version;
  timer=setTimeout(()=>{if(token!==version)return;cursor++;
   if(cursor===bar.events.length){if(!revealed)solved++;$('[data-bar-feedback]').textContent=`¡Compás completo! ${errors?'Lo resolviste con reintentos.':'Todas las figuras al primer intento.'} Ahora contá cuatro pulsos y tocalo.`;$('[data-bar-position]').textContent='Compás resuelto';$('[data-bar-stats]').textContent=`Compases resueltos sin ayuda: ${solved}`;highlight(-1);}
   else{highlight(cursor);$('[data-bar-position]').textContent=`Figura ${cursor+1} de ${bar.events.length}`;$('[data-bar-check]').disabled=false;$('[data-bar-pitch]').value='';$('[data-bar-duration]').value='';$('[data-bar-pitch]').focus();}
  },800);
 }
 async function play(){
  stop();document.dispatchEvent(new Event('bass-audition-start'));const token=version;
  const bpm=Number($('[data-bar-tempo]').value);
  if(!Number.isFinite(bpm)||bpm<40||bpm>120){$('[data-bar-feedback]').textContent='Elegí un tempo entre 40 y 120 BPM.';return;}
  $('[data-bar-play]').disabled=true;
  try{
   ctx??=new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();const bank=await loadBassBank(ctx,bassSound());if(token!==version)return;if(!bank.length)throw Error();
   const start=ctx.currentTime+.08,seconds=60/bpm;let beat=0;
   READING_MEASURES[index].events.forEach((e,i)=>{
    timers.push(setTimeout(()=>{if(token===version)highlight(i);},80+beat*seconds*1000));
    if(e.midi!==null){const sample=nearestBassSample(bank,e.midi-12),v=ctx.createBufferSource(),gain=ctx.createGain(),at=start+beat*seconds,end=at+e.beats*seconds;
     v.buffer=sample.buffer;v.playbackRate.value=2**((e.midi-12-sample.midi)/12);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.65,at+.01);gain.gain.setValueAtTime(.65,end-.06);gain.gain.linearRampToValueAtTime(0,end-.01);v.connect(gain);gain.connect(ctx.destination);v.start(at);v.stop(end);voices.push(v);v.onended=()=>{v.disconnect();gain.disconnect();};}
    beat+=e.beats;
   });
   timers.push(setTimeout(()=>{if(token===version){$('[data-bar-play]').disabled=false;highlight(cursor);}},100+4*seconds*1000));
  }catch{if(token===version){$('[data-bar-feedback]').textContent='No se pudo cargar el audio. Podés seguir leyendo y volver a intentar.';$('[data-bar-play]').disabled=false;}}
 }
 render();window.addEventListener('hashchange',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});document.addEventListener('bass-audition-stop',stop);
 return {stop};
}
