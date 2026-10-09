import {LESSON_IDS} from './study.mjs';
import {catalog} from '../public/practice-engine.mjs';
import {ATLAS_FAMILIES,TONICS,dailyChallenge} from '../public/atlas-engine.mjs';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const one=(v,a)=>a.includes(v);
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const unit=v=>/^H(0[1-9]|1[0-6])$/.test(v);
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export function validateLearning(b){
 const fail=()=>{throw Error('Datos de aprendizaje inválidos.');};
 if(!object(b)||Object.hasOwn(b,'userId')||Object.hasOwn(b,'user_id'))fail();
 if(b.kind==='preference'){
  const schemas={practice:{id:v=>catalog.some(c=>c.id===v),tempo:v=>integer(v,30,200),instrument:v=>one(v,['electricBass','electricBass5','doubleBass']),difficulty:v=>one(v,['roots','fifths','arpeggios','walking'])},
   avatar:{character:v=>one(v,['man','woman']),color:v=>one(v,['cyan','violet','coral','gold']),motion:v=>typeof v==='boolean'},
   session:{minutes:v=>integer(v,5,60)},atlas:{enabled:v=>typeof v==='boolean',instrument:v=>one(v,['electricBass','electricBass5','doubleBass']),tonic:v=>TONICS.includes(v),kind:v=>one(v,['all','scale','arpeggio'])},harmony:{last:unit}};
  const schema=Object.hasOwn(schemas,b.section)?schemas[b.section]:null;
  if(!schema||!object(b.value)||!integer(b.version,0,2147483646)||!Object.keys(b.value).length||Object.entries(b.value).some(([k,v])=>!Object.hasOwn(schema,k)||!schema[k](v)))fail();
  return {kind:b.kind,section:b.section,value:b.value,version:b.version};
 }
 if(b.kind==='review'&&LESSON_IDS.includes(b.lessonId)&&integer(b.tempo,30,200)&&one(b.rating,['hard','okay','easy'])&&uuid(b.eventId))return {kind:b.kind,lessonId:b.lessonId,tempo:b.tempo,rating:b.rating,eventId:b.eventId};
 if(b.kind==='unit'&&unit(b.unitId)&&typeof b.reviewed==='boolean'&&integer(b.version,0,2147483646))return {kind:b.kind,unitId:b.unitId,reviewed:b.reviewed,version:b.version};
 if(b.kind==='daily'&&typeof b.reviewed==='boolean'&&typeof b.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(b.date)&&Number.isFinite(Date.parse(b.date))&&new Date(b.date).toISOString().slice(0,10)===b.date&&Date.parse(b.date)<=Date.now()+86400000&&Date.parse(b.date)>=Date.parse('2026-01-01')&&ATLAS_FAMILIES.some(f=>f.id===b.familyId)&&dailyChallenge(b.date).families.includes(b.familyId))return {kind:b.kind,date:b.date,familyId:b.familyId,reviewed:b.reviewed};
 fail();
}
