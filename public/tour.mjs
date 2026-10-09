import {learningStore} from './learning-store.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stops=[
 ['Tocar en tu cuarto','Tu primera audiencia: la almohada.','home'],
 ['Ensayo frente al espejo','El reflejo pide otra vuelta.','home'],
 ['Groove en el living','Sin tapar la conversación.','home'],
 ['El balcón acústico','Un pulso para el vecindario.','home'],
 ['Ensayo en el garage','La banda todavía cabe entre las cajas.','garage'],
 ['Sala de ensayo del barrio','Llegaste con el cable correcto.','garage'],
 ['Primera banda con amigos','Escucharse también es tocar.','garage'],
 ['Prueba de sonido','Antes del solo, que se escuche el bajo.','garage'],
 ['Cumpleaños con banda','La torta puede esperar un compás.','bar'],
 ['Patio de la escuela','Un recreo con groove.','bar'],
 ['Café de la esquina','Un acompañamiento, no una avalancha.','bar'],
 ['Bar de las primeras fechas','Tu nombre aparece en la cartelera.','bar'],
 ['La pequeña peña','Compartí el pulso con la mesa del fondo.','bar'],
 ['Primer escenario','La luz te encuentra tocando.','bar'],
 ['Jam del martes','Escuchá antes de sumarte.','jazz'],
 ['Club de jazz del barrio','Las fundamentales tienen mesa reservada.','jazz'],
 ['Blues de medianoche','Otra vuelta; ahora con intención.','jazz'],
 ['Sesión con el trío','Hay espacio entre las notas.','jazz'],
 ['La terraza del groove','El cielo acompaña, vos sostenés.','jazz'],
 ['Jam con músicos nuevos','Una armonía, varias conversaciones.','jazz'],
 ['Estudio de grabación','La toma buena empieza por escuchar.','studio'],
 ['Sesión para la radio','El bajo también viaja por el aire.','studio'],
 ['Grabación en vivo','El pulso no necesita edición.','studio'],
 ['Centro cultural','Tu música encuentra otro público.','theater'],
 ['Teatro del barrio','Hasta la última fila merece un buen groove.','theater'],
 ['Apertura de la noche','Prepará el escenario para la banda.','theater'],
 ['Club a sala llena','La banda respira con vos.','theater'],
 ['Primer teatro','Un cierre que invita a volver.','theater'],
 ['Festival de la ciudad','Más escenario, el mismo pulso.','festival'],
 ['Escenario al aire libre','Que el viento no se lleve la forma.','festival'],
 ['Encuentro de jazz','La armonía se vuelve conversación.','festival'],
 ['Gira por otras ciudades','El groove cabe en la valija.','festival'],
 ['Gran auditorio','Cada nota tiene una butaca.','theater'],
 ['Noche con la big band','Escuchá la sección; encontrá tu lugar.','theater'],
 ['Festival principal','El cartel ya tiene tu nombre.','festival'],
 ['Escenario central','Sostené la música, no sólo el volumen.','festival'],
 ['Estadio en prueba de sonido','Probando: uno, dos… y cuatro.','stadium'],
 ['La previa del gran show','La banda está lista. ¿Y tu pulso?','stadium'],
 ['Último ensayo de la gira','Más oído, menos nervios.','stadium'],
 ['Show en River Plate','La meta de esta gira imaginaria; tu aprendizaje sigue.','stadium']
];
export const TOUR_STOPS=stops.map(([name,caption,scene],i)=>({lessonId:(i<14?'B':i<28?'I':'A')+String(i<14?i+1:i<28?i-13:i-27).padStart(2,'0'),number:i+1,name,caption,scene}));
export function tourStop(id){return TOUR_STOPS.find(s=>s.lessonId===id)||{name:'Escenario de práctica',caption:'Una nueva ocasión para hacer música.',scene:'home',number:0};}
export const AVATAR_COLORS={cyan:'#48e3ed',violet:'#bda5ff',coral:'#ff9d9d',gold:'#ffd779'};
export function tourPreferences(value={}){return {character:value?.character==='woman'?'woman':'man',color:Object.hasOwn(AVATAR_COLORS,value?.color)?value.color:'cyan',motion:value?.motion!==false};}
export function tourKey(user){return 'appbass-tour-look-v1-'+(user?.id||'guest');}
export function readTourPreferences(user,storage){if(user?.id===learningStore.user?.id&&learningStore.ready&&learningStore.preference('avatar'))return tourPreferences(learningStore.preference('avatar'));try{return tourPreferences(JSON.parse(storage.getItem(tourKey(user))||'{}'));}catch{return tourPreferences();}}
export function writeTourPreferences(user,value,storage){try{storage.setItem(tourKey(user),JSON.stringify(tourPreferences(value)));return true;}catch{return false;}}
export function avatarSVG(value={},instrument='electricBass'){
 const p=tourPreferences(value),color=AVATAR_COLORS[p.color],woman=p.character==='woman';
 return `<svg class="tour-avatar" viewBox="0 0 80 100" aria-hidden="true"><path d="M26 77L23 94M48 77L55 94" stroke="#b5c9ea" stroke-width="9" stroke-linecap="round"/><path d="M27 48Q38 40 49 48L52 77H23Z" fill="${color}"/><path d="M27 50L15 67M49 51L62 64" stroke="#efc3a4" stroke-width="7" stroke-linecap="round"/>${woman?'<path d="M22 23Q18 0 39 4Q59 5 57 27L62 48H17Z" fill="#28354f"/>':'<path d="M23 25Q18 4 39 4Q57 4 55 25Z" fill="#28354f"/>'}<ellipse cx="39" cy="26" rx="14" ry="17" fill="#efc3a4"/><path d="M25 20Q38 4 54 20L50 10L30 8Z" fill="#28354f"/><circle cx="34" cy="26" r="1.7" fill="#182438"/><circle cx="44" cy="26" r="1.7" fill="#182438"/><path d="M35 34Q39 37 44 33" fill="none" stroke="#9e605a" stroke-width="2"/>${instrument==='doubleBass'?'<path d="M59 45Q45 50 53 60Q41 75 51 84Q70 95 76 77Q77 66 66 60Q74 49 65 45Z" fill="#936041" stroke="#ffd779" stroke-width="2"/><path d="M62 72L63 16M63 85V99" stroke="#e4ba82" stroke-width="3"/>':'<path d="M46 59Q37 53 35 65Q27 76 40 84Q56 88 61 73Q64 62 53 63Z" fill="#19263b" stroke="#ffd779" stroke-width="2"/><path d="M48 72L65 24" stroke="#dfbb87" stroke-width="5"/><path d="M45 76L64 25" stroke="#fff2cc" stroke-width="1"/>'}</svg>`;
}
export function venueSVG(scene){
 const art={home:'<path d="M12 40L50 12L88 40V85H12Z"/><path d="M39 85V54H61V85M21 44H32V58H21Z"/>',garage:'<path d="M10 35L50 16L90 35V85H10Z"/><path d="M25 85V44H75V85M25 57H75M25 70H75"/>',bar:'<path d="M12 38H88V84H12Z"/><path d="M8 38L20 20H80L92 38M28 84V53H43V84M59 53H76V68H59Z"/>',jazz:'<path d="M12 31H88V85H12Z"/><path d="M25 85V49H49V85M64 36V58Q54 53 54 62Q54 71 65 65V41L78 38V55"/>',studio:'<path d="M12 20H88V85H12Z"/><path d="M22 34H45V60H22ZM57 34H78V60H57ZM24 73H76M50 20V85"/>',theater:'<path d="M10 23H90V83H10Z"/><path d="M20 23Q38 43 22 70M80 23Q62 43 78 70M20 75H80M30 83V94M70 83V94"/>',festival:'<path d="M10 39L50 10L90 39V84H10Z"/><path d="M22 41H78V74H22ZM6 92H94M28 85V92M50 85V92M72 85V92"/>',stadium:'<ellipse cx="50" cy="55" rx="43" ry="30"/><ellipse cx="50" cy="55" rx="29" ry="16"/><path d="M7 55V75Q50 103 93 75V55M14 37V14M86 37V14M7 14H22M78 14H93"/>'}[scene]||'';
 return `<svg class="venue-art" viewBox="0 0 100 110" aria-hidden="true"><g fill="#122238" stroke="currentColor" stroke-width="3" stroke-linejoin="round">${art}</g></svg>`;
}
export function mountTourPreferences(host,{user=null,instrument='electricBass',onChange=()=>{}}={}){
 let p;try{p=readTourPreferences(user,localStorage);}catch{p=tourPreferences();}
 host.innerHTML=`<fieldset class="tour-customizer"><legend>Tu avatar de gira</legend><div class="tour-preview">${avatarSVG(p,instrument)}<p>Elegí quién recorre los escenarios con vos.</p></div><div class="tour-character-options" role="group" aria-label="Personaje"><button type="button" data-tour-character="man">Varón</button><button type="button" data-tour-character="woman">Mujer</button></div><label>Color del escenario<select data-tour-color>${Object.keys(AVATAR_COLORS).map((c,i)=>`<option value="${c}">${['Cian','Violeta','Coral','Dorado'][i]}</option>`).join('')}</select></label><label class="check"><input type="checkbox" data-tour-motion>Animar el recorrido (respeta el movimiento reducido del dispositivo)</label><p class="footnote">Apariencia guardada por cuenta en este navegador, no entre dispositivos. No cambia tu avance.</p><p data-tour-status role="status"></p></fieldset>`;
 function reflect(){host.querySelectorAll('[data-tour-character]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tourCharacter===p.character)));host.querySelector('[data-tour-color]').value=p.color;host.querySelector('[data-tour-motion]').checked=p.motion;host.querySelector('.tour-preview').innerHTML=avatarSVG(p,instrument)+'<p>Elegí quién recorre los escenarios con vos.</p>';}
 function save(){let saved=false;try{saved=writeTourPreferences(user,p,localStorage);}catch{}reflect();host.querySelector('[data-tour-status]').textContent=saved?'Apariencia guardada en este navegador.':'No se pudo guardar la apariencia; se usará durante esta visita.';onChange(p);document.dispatchEvent(new CustomEvent('tour-look-change',{detail:{key:tourKey(user),preferences:p}}));}
 host.querySelectorAll('[data-tour-character]').forEach(b=>b.onclick=()=>{p.character=b.dataset.tourCharacter;save();});
 host.querySelector('[data-tour-color]').onchange=e=>{p.color=e.target.value;save();};host.querySelector('[data-tour-motion]').onchange=e=>{p.motion=e.target.checked;save();};reflect();
 const status=host.querySelector('[data-tour-status]');
 if(user)host.querySelector('.footnote').textContent='Con sesión iniciada, la apariencia se guarda en tu cuenta. No modifica el avance del curso.';
 host._tourUnsubscribe?.();host._tourUnsubscribe=learningStore.subscribe(()=>{if(user?.id===learningStore.user?.id&&learningStore.ready){p=tourPreferences(learningStore.preference('avatar'));reflect();document.dispatchEvent(new CustomEvent('tour-look-change',{detail:{key:tourKey(user),preferences:p}}));}});
 host.onclick=e=>{if(user&&e.target.closest('[data-tour-character]'))cloudSave();};
 host.querySelector('[data-tour-color]').addEventListener('change',cloudSave);host.querySelector('[data-tour-motion]').addEventListener('change',cloudSave);
 function cloudSave(){if(!user||user.id!==learningStore.user?.id)return;status.textContent='Guardando apariencia en tu cuenta…';learningStore.setPreference('avatar',{...p}).then(()=>status.textContent='Apariencia guardada en tu cuenta.').catch(e=>status.textContent='No se pudo guardar en la nube: '+e.message);}
 return {refresh(value){p=tourPreferences(value);reflect();}};
}
