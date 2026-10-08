const sections=[
 ['Tu cuenta y tu ritmo','Creá una cuenta beta con nombre, correo, contraseña de al menos 10 caracteres y un código de habilitación. Elegí tus minutos semanales y el día del recordatorio. Si ya tenés cuenta, usá Iniciar sesión. Desde la corchea de Mi perfil podés cambiar nombre, instrumento, nivel, tiempo semanal, recordatorio y contraseña, consultar tu diario o cerrar sesión.','inicio'],
 ['Mi curso: un paso por vez','Elegí Mi recorrido para ver las 40 lecciones como estaciones de un mapa o como lista. Tu primera gira lleva cada lección a un escenario imaginario, desde tu cuarto hasta River Plate. El avatar señala la primera lección pendiente del nivel visible; podés explorar cualquier estación. Elegí personaje y color desde Elegir mi avatar o Mi perfil: la apariencia se guarda por cuenta en este navegador. El movimiento es desactivable y sólo ocurre tras guardar un avance nuevo. Los conciertos de cierre y las recompensas están señalados como Próximamente y no están disponibles. Al completar una lección, se guarda en tu cuenta y suma 100 puntos una sola vez. En Aplicación y lectura, la partitura acompaña las consignas. El Laboratorio de armonía es un espacio complementario de 16 unidades: escuchá, comprendé, tocá y respondé las dos preguntas para marcar una unidad repasada. Ese repaso es local al navegador, sin puntos extra ni sincronización. La teoría complementaria dentro de cada lección es opcional. Los PDF anteriores no incluyen la ampliación web. La app no califica tu ejecución.','curso'],
 ['Elegí qué practicar','Además de las once prácticas iniciales, tenés cuatro pistas originales con cifrado americano y dos reducciones de ragtime de Joplin. En Repertorio beta encontrás los seis títulos y sus fuentes; los cuatro de Morton son partituras externas, todavía sin audio sincronizado. Elegí instrumento y nivel. Las pistas generadas permiten fundamentales, quintas, arpegios o walking.','practicar'],
 ['Acompañamiento a tu velocidad','Presioná Reproducir y ajustá tempo y volumen. Elegí mezcla completa, sin bajo o sólo bajo. Usamos piano y hi-hat CC0 con bajo sintetizado; si los samples fallan, aparece un aviso y se usa síntesis. La primera reproducción puede demorar mientras carga el audio. En Repetir compases podés aumentar 2 o 5 BPM por vuelta. La partitura es simplificada; para Joplin consultá también el PDF. El mapa de contrabajo muestra semitonos, no digitaciones.','practicar'],
 ['Diario y grabaciones','Guardar práctica en mi diario permite confirmar minutos, tempo y una nota sobre cómo te fue. Mi perfil → Mi diario muestra las últimas 30 entradas y los minutos de los últimos siete días. En Practicar podés grabar hasta tres minutos y comparar las dos últimas tomas. Descargalas antes de recargar o cerrar: no se guardan en la nube.','practicar'],
 ['Escalas y patrones','Elegí la tónica o buscá, por ejemplo, Sib pentatónica. Tenés 31 familias de escalas y 16 de arpegios en las 12 alturas, con nombres en cifrado y español, grados, notas, mapas y partitura. Escuchar recorrido reproduce las alturas elegidas al subir y bajar. El cifrado de una escala es sólo un acorde de referencia. Activá Una tónica, tres colores para un reto diario opcional: tocá tres variantes, autoevaluate y compartí el enlace si querés. La preferencia y la autoevaluación son locales por cuenta; no hay puntos ni notificaciones. El atlas PDF conserva los ejemplos originales estáticos.','escalas'],
 ['Desafíos y referidos','Elegí una consigna de blues, pregunta y respuesta o armonía, creá su enlace y compartilo. Las respuestas y grabaciones se intercambian fuera de Appbass. Mi perfil → Mis referidos muestra tu enlace personal y las altas vinculadas: tu amigo también necesita un código de habilitación. No hay premios por referidos.','desafios'],
 ['Recordatorios y comentarios','El inicio adapta tu propuesta de sesión al tiempo semanal elegido. El recordatorio aparece dentro de la app y permite Practicar ahora, Recordar mañana o Ya lo vi. Para reportar un problema, iniciá sesión y usá Enviar comentarios al pie de la página.','inicio']
];
const faqs=[
 ['¿Necesito una cuenta para explorar?','Podés explorar el curso, atlas y reproductor sin cuenta. Para guardar progreso, diario, preferencias de perfil y comentarios necesitás iniciar sesión. La beta admite hasta 20 cuentas con invitación.'],
 ['¿Cómo empiezo mi primera sesión?','Abrí Cifrado americano: notas y acordes en Mi curso. Después probá Cuerdas al aire a un tempo cómodo. Grabá una toma corta, escuchala y guardá una nota en tu diario.'],
 ['¿Qué se guarda y dónde?','El progreso, perfil y diario se guardan en tu cuenta. El ejercicio, dificultad y tempo del reproductor se recuerdan en este navegador. Guardar el diario requiere confirmar el formulario: no se registra automáticamente toda tu actividad. Las grabaciones solo permanecen en la página hasta recargarla o cerrarla.'],
 ['¿Me llegan correos o notificaciones al celular?','Todavía no. Los recordatorios aparecen al abrir la app. No hay envío de correos, notificaciones push ni avisos con la aplicación cerrada.'],
 ['¿Qué hago si olvidé la contraseña?','Contactá a quien te invitó a la beta. La recuperación por correo todavía no está disponible. Si recordás tu contraseña, podés cambiarla desde Mi perfil; esto cierra tus sesiones existentes.'],
 ['¿La app me dice si estoy tocando bien?','No evalúa automáticamente afinación, ritmo ni ejecución. Usá los ejemplos, la autoevaluación y tus grabaciones para comparar. Marcar una lección completada es una decisión del estudiante.'],
 ['¿Los puntos se pueden canjear?','No. Cada lección completada suma 100 puntos de aprendizaje una sola vez. No hay premios canjeables, ranking activo, pagos Premium ni puntos por desafíos o referidos.'],
 ['¿Cómo uso Appbass desde el celular?','Abrí la misma dirección en el navegador. La interfaz se adapta a la pantalla. Todavía no hay una app nativa Android/iOS ni un modo sin conexión garantizado.'],
 ['¿Por qué no escucho el audio o no puedo grabar?','Presioná Reproducir, revisá el volumen del dispositivo y de la práctica, y activá el bajo guía o el metrónomo. Para grabar, autorizá el micrófono. Si el navegador no admite grabación, usá la grabadora del dispositivo. La práctica se pausa al ocultar la pestaña.'],
 ['¿Puedo volver a ver el recorrido inicial?','Sí: usá Volver a ver el tour en esta sección. Al completarlo u omitirlo se recuerda por cuenta en este navegador; puede aparecer otra vez en otro dispositivo, al borrar los datos del sitio o si el navegador bloquea el almacenamiento.']
];
const steps=[
 ['Tu música, a tu ritmo','Tu inicio muestra el tiempo semanal elegido y una propuesta breve de calentamiento, concepto y aplicación. Podés cambiar tus preferencias desde Mi perfil.'],
 ['Aprendé y retomá','En Mi curso tenés 40 lecciones por nivel. Leé, escuchá, tocá y repasá; después marcá tu avance. Continuar mi lección retoma la última que abriste.'],
 ['Elegí tu próxima práctica','En Practicar elegís ejercicio, instrumento y tempo. Empezá con el bajo guía; repetí los compases difíciles y subí la velocidad de a poco.'],
 ['Escuchate y guardá tu avance','Grabá y compará dos tomas, descargalas y anotá lo aprendido en tu diario. Las grabaciones no se guardan en la nube.'],
 ['Siempre tenés una guía','Cómo usar Appbass reúne instrucciones y preguntas frecuentes. Podés volver a abrir este tour cuando quieras. Los recordatorios son dentro de la app; los correos aún no están habilitados.']
];

export function mountHelp(){
 const page=document.createElement('section');page.id='ayuda';page.className='page';page.hidden=true;
 page.innerHTML=`<div class="section-head"><p class="eyebrow">TU PRIMER COMPÁS</p><h1>Cómo usar Appbass</h1><p class="sub">Una guía para aprender, practicar y encontrar tu propio ritmo.</p></div>
 <div class="card help-intro"><h2>¿Primera vez por acá?</h2><p>Recorré lo esencial en cinco pasos, sin configurar nada ni interrumpir tu progreso.</p><button class="primary" id="help-tour">Volver a ver el tour</button><a class="secondary" href="#practicar">Ir a practicar</a></div>
 <h2>Guía de uso</h2><div class="help-grid">${sections.map(([title,body,route],i)=>`<article class="card"><p class="eyebrow">${String(i+1).padStart(2,'0')}</p><h3>${title}</h3><p>${body}</p><a class="text-link" href="#${route}">Abrir sección →</a></article>`).join('')}</div>
 <h2>Preguntas frecuentes</h2><div class="help-faq">${faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
 document.querySelector('.content footer').before(page);
 const nav=document.createElement('a');nav.href='#ayuda';nav.dataset.page='ayuda';nav.innerHTML='<svg aria-hidden="true"><use href="#book"/></svg>Cómo usar Appbass';document.querySelector('nav').append(nav);
 const link=document.createElement('a');link.href='#ayuda';link.textContent='Ayuda y preguntas frecuentes';document.querySelector('footer').append(link);
 const dialog=document.createElement('dialog');dialog.id='welcome-tour';dialog.setAttribute('aria-labelledby','tour-title');dialog.setAttribute('aria-describedby','tour-text');document.body.append(dialog);
 let userId=null,tourUser=null,index=0,seen=new Set(),returnFocus=null;
 const key=id=>'appbass-tour-v1-'+id;
 function hasSeen(id){try{return seen.has(id)||localStorage.getItem(key(id))==='seen';}catch{return seen.has(id);}}
 function finish(){if(tourUser){seen.add(tourUser);try{localStorage.setItem(key(tourUser),'seen');}catch{}}dialog.close();if(returnFocus?.isConnected)returnFocus.focus();}
 function draw(){
  dialog.innerHTML=`<div class="dialog-head"><span class="eyebrow">BIENVENIDO A APPBASS</span><button class="icon-button" id="tour-close" aria-label="Cerrar recorrido">×</button></div><p class="tour-count" role="status">Paso ${index+1} de ${steps.length}</p><h2 id="tour-title" tabindex="-1">${steps[index][0]}</h2><p id="tour-text">${steps[index][1]}</p><div class="tour-actions"><button class="secondary" id="tour-skip">Omitir recorrido</button><button class="secondary" id="tour-back" ${index===0?'disabled':''}>Anterior</button><button class="primary" id="tour-next">${index===steps.length-1?'Empezar a practicar':'Siguiente'}</button></div>`;
  dialog.querySelector('#tour-close').onclick=finish;dialog.querySelector('#tour-skip').onclick=finish;
  dialog.querySelector('#tour-back').onclick=()=>{index--;draw();};
  dialog.querySelector('#tour-next').onclick=()=>{if(index<steps.length-1){index++;draw();}else{finish();location.hash='practicar';}};
  if(dialog.open)dialog.querySelector('h2').focus();
 }
 function open(){if(dialog.open||document.querySelector('dialog[open]'))return;index=0;tourUser=userId;returnFocus=document.activeElement;draw();dialog.showModal();dialog.querySelector('h2').focus();}
 function maybeOpen(){if(userId&&!hasSeen(userId))open();}
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});
 document.addEventListener('close',()=>queueMicrotask(maybeOpen),true);
 page.querySelector('#help-tour').onclick=open;
 return {setUser(user){userId=user?.id||null;if(!userId&&dialog.open){tourUser=null;dialog.close();}maybeOpen();}};
}
