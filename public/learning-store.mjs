const empty=()=>({preferences:{},reviews:{},units:{},daily:[]});
export class LearningStore{
 constructor(fetcher=(...a)=>fetch(...a)){this.fetcher=fetcher;this.user=null;this.data=empty();this.run=0;this.ready=false;this.listeners=new Set();this.queue=Promise.resolve();}
 subscribe(fn){this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
 notify(){for(const fn of this.listeners)fn(this.data);}
 async request(body){const r=await this.fetcher('/api/learning',{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});let data;try{data=await r.json();}catch{throw Error('El servidor no respondió.');}if(!r.ok)throw Error(data.error||'No se pudo sincronizar el aprendizaje.');return data;}
 beginSession(){this.run++;this.ready=false;this.user=null;this.data=empty();this.queue=Promise.resolve();this.error='';}
 async setUser(user){this.beginSession();this.user=user;if(!user){this.notify();return;}const run=this.run;try{const d=await this.request();if(run!==this.run)return;if(!d.preferences||!d.reviews||!d.units||!Array.isArray(d.daily))throw Error('La sincronización todavía no está disponible.');this.data=d;this.ready=true;this.notify();}catch(e){if(run===this.run){this.error=e.message;this.notify();}}}
 preference(section){return this.data.preferences[section]?.value;}
 write(body){const run=this.run;const task=this.queue.catch(()=>{}).then(async()=>{
  if(run!==this.run||!this.user)throw Error('La sesión cambió. Volvé a intentar.');
  if(!this.ready)throw Error(this.error||'No se cargó la información de tu cuenta. Recargá para reintentar.');
  const b={...body};if(b.kind==='preference'){b.version=this.data.preferences[b.section]?.version||0;b.value={...this.preference(b.section),...b.value};}if(b.kind==='unit')b.version=this.data.units[b.unitId]?.version||0;
  const r=await this.request(b);if(run!==this.run)throw Error('La sesión cambió.');
  if(b.kind==='preference')this.data.preferences[b.section]={value:b.value,version:r.version};
  if(b.kind==='unit')this.data.units[b.unitId]={reviewed:b.reviewed,version:r.version};
  if(b.kind==='daily'){const row=this.data.daily.find(d=>d.date===b.date&&d.familyId===b.familyId);if(row)row.reviewed=b.reviewed;else this.data.daily.push({date:b.date,familyId:b.familyId,reviewed:b.reviewed});}
  if(b.kind==='review'){const d=await this.request();if(run!==this.run)throw Error('La sesión cambió.');this.data=d;}
  return r;
 });this.queue=task;return task;}
 setPreference(section,value){return this.write({kind:'preference',section,value});}
 review(lessonId,tempo,rating,eventId=crypto.randomUUID()){return this.write({kind:'review',lessonId,tempo,rating,eventId});}
 unit(unitId,reviewed){return this.write({kind:'unit',unitId,reviewed});}
 daily(date,familyId){return this.write({kind:'daily',date,familyId,reviewed:true});}
}
export const learningStore=new LearningStore();
export function localImportItems(user,storage,data){
 if(!user?.id)return [];
 const read=key=>{try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}},items=[];
 const add=(section,value)=>{if(value&&!data.preferences[section])items.push({kind:'preference',section,value});};
 const practice=read('appbass-practice-'+user.id);if(practice)add('practice',Object.fromEntries(['id','tempo','instrument','difficulty'].filter(k=>practice[k]!==undefined).map(k=>[k,practice[k]])));
 const avatar=read('appbass-tour-look-v1-'+user.id);if(avatar)add('avatar',Object.fromEntries(['character','color','motion'].filter(k=>avatar[k]!==undefined).map(k=>[k,avatar[k]])));
 const harmony=read('appbass-harmony-v1-'+user.id);if(harmony?.version===1){if(/^H(0[1-9]|1[0-6])$/.test(harmony.last))add('harmony',{last:harmony.last});for(const id of new Set(Array.isArray(harmony.done)?harmony.done:[]))if(/^H(0[1-9]|1[0-6])$/.test(id)&&!data.units[id])items.push({kind:'unit',unitId:id,reviewed:true});}
 const local=read('appbass-learning-'+user.id);for(const [id,r] of Object.entries(local?.reviews||{}).slice(0,40)){const h=Array.isArray(r?.history)?r.history.at(-1):null;if(/^[BIA]\d{2}$/.test(id)&&!data.reviews[id]&&h&&Number.isInteger(h.tempo)&&h.tempo>=30&&h.tempo<=200&&['hard','okay','easy'].includes(h.rating))items.push({kind:'review',lessonId:id,tempo:h.tempo,rating:h.rating,eventId:crypto.randomUUID()});}
 const atlas=read('appbass-atlas-'+user.id);if(atlas){if(typeof atlas.enabled==='boolean')add('atlas',{enabled:atlas.enabled});for(const [date,ids] of Object.entries(atlas.done||{}).sort().slice(-7))if(Array.isArray(ids))for(const familyId of ids.slice(0,3))if(!data.daily.some(d=>d.date===date&&d.familyId===familyId))items.push({kind:'daily',date,familyId,reviewed:true});}
 return items;
}
export function mountLearningImport(host){
 const details=document.createElement('details');details.innerHTML='<summary>Synchronisation entre dispositifs · importer mes données locales</summary><p>La importación es opcional y sólo incluye esta cuenta: nunca el modo invitado. Conserva los datos locales y no reemplaza registros que ya existen en la nube. Importa la última autoevaluación por lección; su próxima fecha de repaso se calcula desde hoy. Grabaciones y temporizadores quedan en el navegador.</p><button class="secondary" data-import-preview>Revisar datos locales</button><p data-import-status role="status"></p><button class="primary" data-import-confirm hidden>Confirmar importación</button>';
 details.querySelector('summary').textContent='Sincronización entre dispositivos · importar datos locales';host.append(details);
 let items=[],account=null;const status=details.querySelector('[data-import-status]'),confirm=details.querySelector('[data-import-confirm]');
 details.querySelector('[data-import-preview]').onclick=()=>{confirm.hidden=true;items=[];account=learningStore.user?.id;if(!account||!learningStore.ready){status.textContent='Iniciá sesión y esperá a que se carguen tus datos de la nube.';return;}try{items=localImportItems(learningStore.user,localStorage,learningStore.data);}catch{status.textContent='No se pudieron leer los datos locales.';return;}status.textContent=items.length?`${items.length} registros para importar: ${items.map(i=>i.section||i.lessonId||i.unitId||i.date+' '+i.familyId).join(', ')}. Los registros que ya existen en la nube se omiten.`:'No hay datos locales nuevos para importar.';confirm.hidden=!items.length;};
 confirm.onclick=async()=>{if(account!==learningStore.user?.id){status.textContent='La sesión cambió. Revisá nuevamente.';return;}confirm.disabled=true;let saved=0;try{for(const item of items){if(account!==learningStore.user?.id)throw Error('La sesión cambió.');await learningStore.write(item);saved++;}status.textContent=`Importados ${saved} registros. Los datos locales se conservaron.`;confirm.hidden=true;await learningStore.setUser(learningStore.user);}catch(e){status.textContent=`Se importaron ${saved} registros; el resto no se guardó: ${e.message}. Recargá y revisá antes de reintentar.`;confirm.hidden=true;}finally{confirm.disabled=false;}};
 learningStore.subscribe(()=>{confirm.hidden=true;items=[];if(account&&account!==learningStore.user?.id)status.textContent='La cuenta cambió. Revisá sus datos antes de importar.';});
}
