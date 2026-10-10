import {mountTourPreferences,avatarSVG,readTourPreferences,tourKey} from './tour.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function api(path,body,method='POST'){
  const r=await fetch(path,{method:body===undefined?'GET':method,credentials:'same-origin',cache:'no-store',
    ...(body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
  let data;try{data=await r.json();}catch{throw Error('El servidor no respondió. Intentá nuevamente.');}
  if(!r.ok)throw Object.assign(Error(data.error||'No pudimos completar la solicitud.'),{status:r.status});
  return data;
}
const days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
export function mountAccount({onSession,onProgress,onPractice,onLesson,onReady=()=>{}}) {
  let user=null,state=null;
  const dialog=document.querySelector('#auth-dialog');
  dialog.innerHTML=`
    <div class="dialog-head"><span class="eyebrow">TU ESPACIO DE PRÁCTICA</span><button type="button" class="icon-button" data-close aria-label="Cerrar">×</button></div>
    <div class="tabs" role="group" aria-label="Acceso a tu cuenta"><button type="button" id="tab-login">Ya tengo cuenta</button><button type="button" id="tab-register">Crear cuenta beta</button></div>
    <h2 id="account-heading">Iniciar sesión</h2>
    <form id="account-form" class="stack">
      <label data-register>Nombre<input name="displayName" maxlength="120" autocomplete="name"></label>
      <label>Correo<input name="email" type="email" required maxlength="320" autocomplete="email"></label>
      <label>Contraseña<input name="password" type="password" required maxlength="256" autocomplete="current-password"></label>
      <label class="check"><input id="show-password" type="checkbox">Mostrar contraseña</label>
      <label data-register>Código de habilitación<input name="inviteCode" maxlength="128" autocomplete="off"><small>El código que recibiste para participar en la beta.</small></label>
      <label data-register>Si tu bajo pudiera reservarte un momento esta semana, ¿cuánto tiempo te gustaría compartir con él?
        <select name="weeklyStudyMinutes"><option value="15">15 minutos</option><option value="30">30 minutos</option><option value="60" selected>1 hora</option><option value="120">2 horas</option><option value="240">4 horas</option><option value="360">6 horas</option><option value="600">10 horas</option></select></label>
      <label data-register>¿Qué día te gustaría que Appbass te invite a practicar?
        <select name="reminderDay">${days.map((d,i)=>`<option value="${i+1}">${d}</option>`).join('')}</select>
        <small>Verás el aviso al abrir la app. Los correos todavía no están habilitados.</small></label>
      <p id="account-error" role="alert" class="form-error"></p>
      <button class="primary" id="account-submit">Entrar</button>
    </form>
    <p id="password-help" class="footnote">¿Olvidaste la contraseña? Durante la beta, contactá a quien te invitó. La recuperación por correo todavía no está disponible.</p>`;
  const form=dialog.querySelector('form'),error=dialog.querySelector('#account-error');
  let mode='login';
  function setMode(value){
    mode=value;error.textContent='';
    dialog.querySelectorAll('[data-register]').forEach(l=>{l.hidden=value!=='register';l.querySelectorAll('input,select').forEach(i=>{i.disabled=value!=='register';i.required=value==='register';});});
    dialog.querySelector('#account-heading').textContent=value==='register'?'Reservale un rato a tu música.':'Volvé a tu práctica.';
    dialog.querySelector('#account-submit').textContent=value==='register'?'Abrir mi espacio de práctica':'Iniciar sesión';
    form.elements.password.minLength=value==='register'?10:1;
    form.elements.password.autocomplete=value==='register'?'new-password':'current-password';
    ['login','register'].forEach(x=>dialog.querySelector('#tab-'+x).classList.toggle('selected',x===value));
    dialog.querySelector('#password-help').hidden=value==='register';
  }
  function openAuth(value='login'){setMode(value);if(!dialog.open)dialog.showModal();}
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.querySelector('#tab-login').onclick=()=>setMode('login');
  dialog.querySelector('#tab-register').onclick=()=>setMode('register');
  dialog.querySelector('#show-password').onchange=e=>form.elements.password.type=e.target.checked?'text':'password';
  const top=document.querySelector('.top-right'),register=document.querySelector('#open-auth');
  register.hidden=true;
  const login=document.createElement('button');login.className='secondary';login.textContent='Iniciar sesión';login.hidden=true;login.id='open-login';top.prepend(login);
  const avatar=top.querySelector('.small-avatar'),profile=document.createElement('button');
  profile.className='avatar small-avatar';profile.textContent='♪';profile.setAttribute('aria-label','Mi perfil');profile.title='Mi perfil';profile.hidden=true;profile.id='profile-button';avatar.replaceWith(profile);
  register.onclick=()=>openAuth('register');login.onclick=()=>openAuth('login');
  const side=document.querySelector('.profile');side.tabIndex=0;side.setAttribute('role','button');side.setAttribute('aria-label','Abrir mi perfil');
  const sideAvatar=side.querySelector('.avatar');
  function syncAvatar(){
    let markup='♪';
    if(user)try{markup=avatarSVG(readTourPreferences(user,localStorage));}catch{}
    profile.innerHTML=markup;sideAvatar.innerHTML=markup;
  }
  document.addEventListener('tour-look-change',e=>{if(user&&e.detail.key===tourKey(user))syncAvatar();});
  profile.onclick=()=>openProfile();side.onclick=()=>user?openProfile():openAuth();side.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();side.click();}};
  const home=document.createElement('article');home.className='card today-card';home.id='today-card';document.querySelector('#inicio .heading').after(home);
  const reminder=document.createElement('article');reminder.className='card reminder-card';reminder.hidden=true;reminder.id='weekly-reminder';home.before(reminder);
  async function refresh(){
    try {
      state=await api('/api/auth/me');user=state.user;
      register.hidden=!!user;login.hidden=!!user;profile.hidden=!user;
      side.querySelector('strong').textContent=user?.displayName||'Mi espacio de práctica';
      side.querySelector('small').textContent=user?.email||'Iniciá sesión para guardar tu avance';
      const mins=user?.weeklyStudyMinutes;
      document.querySelector('.week-card strong').textContent=mins?`${mins} min / semana`:'Tu propio ritmo';
      document.querySelector('.side-note strong').textContent='Encontrá tu groove.';
      document.querySelector('.side-note p').textContent=mins?`Tu plan: ${mins} minutos por semana. Distribuilos como prefieras.`:'Elegí cuánto tiempo querés dedicarle a tu música.';
      const plan=state.plan;
      home.innerHTML=`<p class="eyebrow">HOY PODÉS AVANZAR</p><h2>${plan.total} minutos para hacer música</h2><p>${plan.warmup} min de pulso · ${plan.concept} min de concepto · ${plan.play} min de aplicación</p><div class="button-row"><button class="primary" id="resume-lesson">Continuar mi lección</button><button class="secondary" id="today-practice">Ir a mi práctica</button></div><small>Una propuesta flexible: podés cambiar la duración y la práctica.</small>`;
      home.querySelector('#resume-lesson').onclick=()=>onLesson(user?.lastLesson||'B01');
      home.querySelector('#today-practice').onclick=onPractice;
      reminder.hidden=!state.reminder;
      if(state.reminder){
        reminder.innerHTML='<p class="eyebrow">TU RECORDATORIO SEMANAL</p><h3>Tu bajo te guardó un momento.</h3><p>Una sesión corta también cuenta. ¿Retomamos donde quedaste?</p><div class="button-row"><button class="primary" data-act="start">Practicar ahora</button><button class="secondary" data-act="snooze">Recordar mañana</button><button class="secondary" data-act="dismiss">Ya lo vi</button></div><p role="status"></p>';
        reminder.querySelectorAll('button').forEach(b=>b.onclick=async()=>{try{await api('/api/activity',{kind:'reminder',action:b.dataset.act==='snooze'?'snooze':'dismiss'});reminder.hidden=true;if(b.dataset.act==='start')onPractice();}catch(e){reminder.querySelector('[role=status]').textContent=e.message;}});
      }
      await onSession(user);syncAvatar();await onProgress();
      onReady(user);
    } catch{home.textContent='No pudimos cargar tu cuenta. Podés volver a iniciar sesión.';login.hidden=false;register.hidden=false;}
  }
  form.onsubmit=async e=>{
    e.preventDefault();error.textContent='';
    const submit=dialog.querySelector('#account-submit');submit.disabled=true;
    const b=Object.fromEntries(new FormData(form));
    if(mode==='register'){b.weeklyStudyMinutes=Number(b.weeklyStudyMinutes);b.reminderDay=Number(b.reminderDay);b.referralCode=new URLSearchParams(location.search).get('ref')||'';}
    try{await api('/api/auth/'+mode,b);form.reset();dialog.close();await refresh();}
    catch(e){error.textContent=e.message;if(e.status===409){error.textContent+=' Usá la pestaña «Ya tengo cuenta».';}}
    finally{submit.disabled=false;}
  };
  const panel=document.createElement('dialog');panel.id='profile-dialog';document.body.append(panel);
  function panelView(title,content){
    panel.innerHTML=`<div class="dialog-head"><h2>${esc(title)}</h2><button class="icon-button" data-close aria-label="Cerrar">×</button></div>${content}`;
    panel.querySelector('[data-close]').onclick=()=>panel.close();if(!panel.open)panel.showModal();
  }
  async function openProfile(){
    if(!user)return openAuth();
    panelView('Mi perfil',`<p>${esc(user.email)}</p><form id="profile-form" class="stack">
      <label>Nombre<input name="displayName" required maxlength="120" value="${esc(user.displayName)}"></label>
      <label>Minutos por semana<input name="weeklyStudyMinutes" type="number" min="15" max="1200" required value="${user.weeklyStudyMinutes||60}"></label>
      <label>Instrumento<select name="instrument"><option value="electricBass">Bajo eléctrico</option><option value="doubleBass">Contrabajo</option></select></label>
      <label>Nivel<select name="level"><option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option></select></label>
      <label>Día del recordatorio<select name="reminderDay">${days.map((d,i)=>`<option value="${i+1}">${d}</option>`).join('')}</select></label>
      <label>Zona horaria<input name="timeZone" required maxlength="80" value="${esc(user.timeZone||Intl.DateTimeFormat().resolvedOptions().timeZone)}"><small>Por ejemplo, America/Argentina/Buenos_Aires.</small></label>
      <label class="check"><input name="reminderEnabled" type="checkbox" ${user.reminderEnabled?'checked':''}>Recordatorio semanal dentro de la app</label>
      <button class="primary">Guardar preferencias</button><p role="status"></p></form>
      <div class="button-row"><button id="view-journal" class="secondary">Mi diario</button><button id="view-referrals" class="secondary">Mis referidos</button><button id="change-password" class="secondary">Cambiar contraseña</button><button id="logout" class="secondary">Cerrar sesión</button></div>`);
    const appearance=document.createElement('div');panel.querySelector('form').after(appearance);mountTourPreferences(appearance,{user,instrument:user.instrument});
    const f=panel.querySelector('form');f.elements.instrument.value=user.instrument;f.elements.level.value=user.level;f.elements.reminderDay.value=user.reminderDay||1;
    f.onsubmit=async e=>{e.preventDefault();const b=Object.fromEntries(new FormData(f));b.weeklyStudyMinutes=Number(b.weeklyStudyMinutes);b.reminderDay=Number(b.reminderDay);b.reminderEnabled=f.elements.reminderEnabled.checked;const button=f.querySelector('button');button.disabled=true;try{await api('/api/profile',b,'PATCH');f.querySelector('[role=status]').textContent='Preferencias guardadas.';await refresh();}catch(e){f.querySelector('[role=status]').textContent=e.message;}finally{button.disabled=false;}};
    panel.querySelector('#logout').onclick=async()=>{try{await api('/api/auth/logout',{});panel.close();await refresh();}catch(e){f.querySelector('[role=status]').textContent=e.message;}};
    panel.querySelector('#view-journal').onclick=()=>openJournal();
    panel.querySelector('#view-referrals').onclick=async()=>{
      try {const data=await api('/api/referrals');const url=new URL(location.href);url.pathname='/';url.search='';url.hash='';url.searchParams.set('ref',data.code);
        panelView('Invitá a aprender',`<p>Personas registradas desde tu enlace: ${data.total}</p><label>Tu enlace personal<input readonly value="${esc(url.href)}"></label><p>Tu amigo también necesita un código de habilitación. Los referidos no generan premios en esta beta.</p>`);}
      catch(e){f.querySelector('[role=status]').textContent=e.message;}
    };
    panel.querySelector('#change-password').onclick=()=>{
      panelView('Cambiar contraseña','<form class="stack"><label>Contraseña actual<input name="currentPassword" type="password" required maxlength="256" autocomplete="current-password"></label><label>Nueva contraseña<input name="password" type="password" required minlength="10" maxlength="256" autocomplete="new-password"></label><button class="primary">Cambiar y cerrar sesiones</button><p role="status"></p></form>');
      const p=panel.querySelector('form');p.onsubmit=async e=>{e.preventDefault();try{await api('/api/profile',Object.fromEntries(new FormData(p)));panel.close();await refresh();openAuth();}catch(e){p.querySelector('[role=status]').textContent=e.message;}};
    };
  }
  async function openJournal(entry){
    if(!user)return openAuth();
    panelView('Mi diario de práctica',`<form class="stack"><label>Qué practicaste<input name="exercise" required maxlength="160" value="${esc(entry?.exercise||'')}"></label><label>Minutos practicados<input name="minutes" type="number" min="1" max="600" value="${entry?.minutes||10}" required></label><label>Tempo (BPM)<input name="tempo" type="number" min="30" max="240" value="${entry?.tempo||72}" required></label><label>Cómo te fue<textarea name="note" maxlength="2000" placeholder="Qué salió bien y qué querés repasar"></textarea></label><button class="primary">Guardar en mi diario</button><p role="status"></p></form><div id="journal-history">Cargando prácticas…</div>`);
    const f=panel.querySelector('form'),history=panel.querySelector('#journal-history');
    async function read(){try{const data=await api('/api/activity');history.innerHTML=`<h3>${data.weeklyMinutes} minutos registrados en los últimos 7 días</h3>`+data.entries.map(x=>`<article class="journal-entry"><strong>${esc(x.exercise)}</strong><p>${x.minutes} min · ${x.tempo} BPM · ${esc(new Date(x.createdAt).toLocaleDateString('es-AR'))}</p><p>${esc(x.note)}</p></article>`).join('');}catch(e){history.textContent=e.message;}}
    f.onsubmit=async e=>{e.preventDefault();const b=Object.fromEntries(new FormData(f));b.kind='journal';b.minutes=Number(b.minutes);b.tempo=Number(b.tempo);const button=f.querySelector('button');button.disabled=true;try{await api('/api/activity',b);f.querySelector('[role=status]').textContent='Práctica guardada.';await read();}catch(e){f.querySelector('[role=status]').textContent=e.message;}finally{button.disabled=false;}};await read();
  }
  function feedback(){
    if(!user)return openAuth();
    panelView('Ayudanos a mejorar',`<form class="stack"><label>Lección o sección<input name="context" maxlength="200" value="${esc(location.hash||'Inicio')}"></label><label>¿Qué pasó o qué mejorarías?<textarea name="message" required minlength="5" maxlength="2000"></textarea></label><button class="primary">Enviar comentario</button><p role="status"></p></form>`);
    const f=panel.querySelector('form');f.onsubmit=async e=>{e.preventDefault();const button=f.querySelector('button');button.disabled=true;try{await api('/api/activity',{...Object.fromEntries(new FormData(f)),kind:'feedback'});f.querySelector('[role=status]').textContent='Gracias. Tu comentario quedó guardado para revisar.';f.reset();}catch(e){f.querySelector('[role=status]').textContent=e.message;}finally{button.disabled=false;}};
  }
  const feedbackButton=document.createElement('button');feedbackButton.className='secondary';feedbackButton.textContent='Enviar comentarios';feedbackButton.onclick=feedback;document.querySelector('footer').prepend(feedbackButton);
  setMode('login');
  return {refresh,openAuth,openProfile,openJournal,get user(){return user;}};
}
