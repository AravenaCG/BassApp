import {BASS_SOUNDS,bassSound,setBassSound} from './bass-sounds.mjs';
import {PracticeEngine} from './practice-engine.mjs';
export function mountBassSound(host){
 const panel=document.createElement('details');panel.className='practice-settings';panel.id='bass-sound-panel';
 panel.innerHTML=`<summary>Sonido de bajo · comparar real y sintetizado</summary><div class="practice-options"><label>Sonido para práctica, escalas y teoría<select id="bass-sound">${Object.entries(BASS_SOUNDS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Volumen de comparación<input id="bass-compare-volume" type="range" min="0" max="100" value="60"></label></div><div class="button-row"><button class="secondary" id="bass-compare-a">A · escuchar sonido seleccionado</button><button class="secondary" id="bass-compare-b">B · escuchar sintetizado limpio</button><button class="secondary" id="bass-compare-stop">Detener comparación</button></div><p id="bass-sound-status" role="status"></p><p>A y B tocan la misma frase en Do a 80 BPM, sin acompañamiento ni metrónomo. Las muestras reales tienen nivel ajustado; el volumen percibido puede variar por timbre. Decime si preferís A (y qué sonido elegiste) o B.</p><p>Muestras CC0 de Yamaha RBX y contrabajo Otto Rubner. Algunas notas se transportan desde las grabaciones. La elección se guarda en este navegador, no cambia tu instrumento ni se sincroniza entre dispositivos. <a href="samples/bass/README.md" target="_blank" rel="noopener">Fuentes y licencias</a>.</p>`;
 host.querySelector('.practice-transport').after(panel);
 const select=panel.querySelector('#bass-sound'),status=panel.querySelector('#bass-sound-status');select.value=bassSound();status.textContent='Seleccionado: '+BASS_SOUNDS[select.value]+'. Se confirmará el sonido activo al reproducir.';
 const engine=new PracticeEngine(()=>{},()=>status.textContent+=' · Comparación terminada.');let run=0;
 const stop=()=>{run++;engine.stop();};
 engine.onSoundStatus=value=>status.textContent=value;
 select.onchange=()=>{stop();setBassSound(select.value);document.dispatchEvent(new Event('bass-audition-start'));status.textContent='Seleccionado: '+BASS_SOUNDS[select.value]+'. Se confirmará el sonido activo al reproducir.';};
 async function compare(sound,label){stop();document.dispatchEvent(new Event('bass-audition-start'));const current=run;
  engine.load({tempo:80,totalBeats:8,beatsPerBar:4,bars:[],notes:[36,40,43,48,43,40,38,36].map((midi,beat)=>({midi,beat,duration:.8}))});
  engine.sound=sound;engine.mix='bass-only';engine.metronome=false;engine.volume=Number(panel.querySelector('#bass-compare-volume').value)/100;status.textContent=label+' · Cargando audio…';
  try{await engine.play();if(current===run)status.textContent=label+' · '+engine.bassStatus+(engine.volume===0?' · Volumen en cero':'');}catch{if(current===run)status.textContent='No se pudo iniciar la comparación. Volvé a intentar.';}
 }
 panel.querySelector('#bass-compare-a').onclick=()=>compare(select.value,'A');panel.querySelector('#bass-compare-b').onclick=()=>compare('synth','B');panel.querySelector('#bass-compare-stop').onclick=()=>{stop();status.textContent='Comparación detenida.';};
 document.addEventListener('bass-audition-stop',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('hashchange',stop);
 host.addEventListener('click',e=>{if(e.target.closest('#practice-play,[data-listen-repertoire]'))stop();});
 return {stop};
}
