import {stringNames,tuning} from './fingering.mjs';

const mod=(n,m)=>((n%m)+m)%m;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const stringOrdinal=(count,index)=>`${count-index}ª${index===count-1?' · grave':index===0?' · aguda':''}`;

export function scaleSteps(item){
 const root=item.pitches[0]?.midi??0;
 return item.pitches.map(p=>({degree:p.degree,offset:p.midi-root})).filter((p,index,all)=>p.offset>=0&&p.offset<=12&&all.findIndex(q=>q.offset===p.offset)===index);
}

function role(item,degree,offset){
 if(offset%12===0)return 'root';
 if((item.id==='blues-minor'&&degree==='b5')||(item.id==='blues-major'&&degree==='b3'))return 'blue';
 if(['b3','3','b5','5','b7','7'].includes(degree))return 'structure';
 return 'color';
}

export function movableShape(item,instrument='electricBass',anchorString){
 if(item.kind!=='scale'||instrument==='doubleBass')return null;
 const strings=tuning(instrument),names=stringNames(instrument),anchor=Number.isInteger(anchorString)?anchorString:strings.length-1;
 if(anchor<1||anchor>=strings.length)throw Error('Cuerda de anclaje no válida');
 const steps=scaleSteps(item).filter(p=>p.offset<12),byPitch=new Map(steps.map(p=>[mod(p.offset,12),p]));
 const anchorColumn=1,columns=5,points=[];
 for(let string=0;string<strings.length;string++)for(let column=0;column<columns;column++){
  const interval=mod(strings[string]-strings[anchor]+column-anchorColumn,12),step=byPitch.get(interval);
  if(step)points.push({...step,string,column,role:role(item,step.degree,step.offset)});
 }
 return {anchor,anchorColumn,columns,strings:names,points};
}

export function movableShapeSVG(item,instrument='electricBass',anchorString,labelMode='shape'){
 const shape=movableShape(item,instrument,anchorString);if(!shape)return '';
 const width=470,height=shape.strings.length*58+58,left=76,top=30,gap=(width-left-24)/(shape.columns-1);
 let svg=`<svg class="portable-shape-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Patrón móvil de ${esc(item.name)}, sin notas ni números de traste"><rect width="${width}" height="${height}" rx="14" fill="#0a1422"/>`;
 for(let column=0;column<shape.columns;column++){const x=left+column*gap;svg+=`<line x1="${x}" x2="${x}" y1="16" y2="${height-38}" stroke="#30445e"/>`;}
 shape.strings.forEach((name,string)=>{const y=42+string*58;svg+=`<text x="8" y="${y+5}" fill="#9fb8d5" font-size="11">${esc(stringOrdinal(shape.strings.length,string))}</text><line x1="62" x2="${width-18}" y1="${y}" y2="${y}" stroke="#6d84a1" stroke-width="${1+string*.35}"/>`;});
 const colors={root:'#48e3ed',structure:'#ffd779',blue:'#ff6db3',color:'#bda5ff'};
 for(const point of shape.points){const x=left+point.column*gap,y=42+point.string*58,label=labelMode==='degrees'?(point.offset%12===0?'T':point.degree):'';svg+=`<g data-portable-degree="${esc(point.degree)}"><circle cx="${x}" cy="${y}" r="16" fill="${colors[point.role]}" class="portable-${point.role}"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="#07111e" font-size="12" font-weight="700">${esc(label)}</text></g>`;}
 const anchorX=left+shape.anchorColumn*gap,anchorY=42+shape.anchor*58;svg+=`<path d="M${anchorX-12} ${anchorY-25}L${anchorX} ${anchorY-17}L${anchorX+12} ${anchorY-25}" fill="none" stroke="#48e3ed" stroke-width="2"/><text x="${anchorX}" y="${height-13}" text-anchor="middle" fill="#48e3ed" font-size="12">UBICÁ AQUÍ LA TÓNICA</text></svg>`;
 return svg;
}

function expandedSteps(item,octaves=2){
 const base=scaleSteps(item).filter(p=>p.offset<12),out=[];
 for(let octave=0;octave<octaves;octave++)for(const step of base)out.push({...step,offset:step.offset+octave*12});
 out.push({degree:'8',offset:octaves*12});return out;
}

function markPositionShifts(route){
 let position=route[0]?.column??0;
 return route.map((point,index)=>{
  const shift=index>0&&(point.column<position||point.column>position+3);
  if(shift)position=point.column<position?point.column:point.column;
  return {...point,shift};
 });
}

export function connectionExercises(item,instrument='electricBass'){
 if(item.kind!=='scale'||instrument==='doubleBass')return [];
 const names=stringNames(instrument),low=names.length-1,upper=low-1,one=expandedSteps(item,1);
 const onOne=markPositionShifts(one.map((p,index)=>({...p,string:low,column:p.offset,step:index+1})));
 const two=markPositionShifts(expandedSteps(item,2).map((p,index)=>({
  ...p,string:p.offset<=12?low:upper,column:p.offset<=12?p.offset:p.offset-5,step:index+1
 })));
 const base=scaleSteps(item).filter(p=>p.offset<12),sequence=[];
 for(let start=0;start<base.length;start++)for(let n=0;n<3;n++){
  const absolute=start+n,index=absolute%base.length,octave=Math.floor(absolute/base.length),p=base[index];
  sequence.push({...p,offset:p.offset+octave*12});
 }
 const groups=markPositionShifts(sequence.map((p,index)=>({...p,string:low,column:p.offset,step:index+1})));
 return [
  {id:'one-string',title:'Una cuerda · ver la distancia',level:'1',summary:'Recorré una octava sin refugiarte en una caja. Vas a ver físicamente la fórmula de la escala.',route:onOne,strings:[low],pulse:'Una nota por pulso · 50 BPM'},
  {id:'two-strings',title:'Dos cuerdas · unir dos zonas',level:'2',summary:'Subí por una cuerda y continuá la segunda octava en la cuerda vecina. El retroceso visual es el puente entre posiciones.',route:two,strings:[upper,low],pulse:'Una nota por pulso · 45 BPM'},
  {id:'sequence-three',title:'Secuencia 1–2–3 · avanzar sin cortar',level:'3',summary:'Tocá tres grados, avanzá uno y repetí. La secuencia obliga a abandonar y reencontrar cada posición.',route:groups,strings:[low],pulse:'Tres notas por grupo · 40 BPM'}
 ];
}

export function connectionSVG(exercise,item,instrument='electricBass',labelMode='degrees'){
 const names=stringNames(instrument),route=exercise.route,min=Math.min(...route.map(p=>p.column)),max=Math.max(...route.map(p=>p.column)),columns=max-min+1,width=Math.max(620,100+columns*42),rows=exercise.strings,height=rows.length*72+80,left=68,top=42,gap=(width-left-28)/Math.max(1,columns-1),rowIndex=new Map(rows.map((s,i)=>[s,i]));
 let svg=`<svg class="connection-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(exercise.title)} para ${esc(item.name)}"><rect width="${width}" height="${height}" rx="14" fill="#0a1422"/>`;
 for(let column=min;column<=max;column++){const x=left+(column-min)*gap;svg+=`<line x1="${x}" x2="${x}" y1="18" y2="${height-42}" stroke="#263c56"/>`;}
 rows.forEach((string,index)=>{const y=top+index*72;svg+=`<text x="8" y="${y+5}" fill="#9fb8d5" font-size="11">${esc(stringOrdinal(names.length,string))}</text><line x1="62" x2="${width-18}" y1="${y}" y2="${y}" stroke="#7188a3" stroke-width="${1+string*.25}"/>`;});
 const marker=`connection-arrow-${exercise.id}-${Math.random().toString(36).slice(2)}`;svg+=`<defs><marker id="${marker}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#58afc6"/></marker></defs>`;
 route.slice(1).forEach((p,index)=>{const a=route[index],x1=left+(a.column-min)*gap,y1=top+rowIndex.get(a.string)*72,x2=left+(p.column-min)*gap,y2=top+rowIndex.get(p.string)*72;svg+=`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${p.shift?'#ff6db3':'#58afc6'}" stroke-width="2" ${p.shift?'stroke-dasharray="6 5"':''} marker-end="url(#${marker})"/>`;});
 const grouped=new Map();for(const p of route){const key=p.string+':'+p.column;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(p);}
 for(const points of grouped.values()){const p=points[0],x=left+(p.column-min)*gap,y=top+rowIndex.get(p.string)*72,isRoot=p.offset%12===0,label=labelMode==='steps'?points.map(n=>n.step).join('·'):(isRoot?'T':p.degree);svg+=`<g data-connection-steps="${points.map(n=>n.step).join(' ')}"><circle cx="${x}" cy="${y}" r="17" fill="${isRoot?'#48e3ed':'#bda5ff'}"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="#07111e" font-size="11" font-weight="700">${esc(label)}</text></g>`;}
 svg+=`<text x="${width/2}" y="${height-16}" text-anchor="middle" fill="#8ea9c8" font-size="12">DIAGRAMA RELATIVO · SIN TONALIDAD NI TRASTE FIJO</text></svg>`;return svg;
}

export function mountScalePatterns(host,item,instrument='electricBass'){
 if(instrument==='doubleBass'){host.innerHTML='<h3>Patrones transportables</h3><p>Esta vista geométrica está pensada para el bajo eléctrico con trastes. En contrabajo conservá los grados, pero trabajá posiciones y extensiones con una digitación específica.</p>';return;}
 const names=stringNames(instrument),anchors=[names.length-1,names.length-2],exercises=connectionExercises(item,instrument);let anchor=anchors[0],shapeLabels='shape',exercise=exercises[0],exerciseLabels='degrees',step=0;
 host.innerHTML=`<div class="portable-head"><div><p class="eyebrow">FORMA TRANSPORTABLE</p><h3>Mové el dibujo, no las distancias.</h3></div><span class="portable-badge">Sin notas ni traste fijo</span></div><p>Ubicá la tónica bajo el punto cyan y trasladá la figura completa. Funciona en afinación por cuartas siempre que no uses cuerdas al aire.</p><div class="portable-controls"><label>Tónica de partida<select data-portable-anchor>${anchors.map(value=>`<option value="${value}">Cuerda ${esc(stringOrdinal(names.length,value))}</option>`).join('')}</select></label><label>Mostrar<select data-portable-label><option value="shape">Sólo la forma</option><option value="degrees">Tónica y grados</option></select></label></div><div data-portable-shape class="portable-scroll"></div><div class="portable-legend"><span><i class="portable-root"></i>Tónica</span><span><i class="portable-structure"></i>Notas estructurales</span><span><i class="portable-color"></i>Color de la escala</span>${item.id.startsWith('blues-')?'<span><i class="portable-blue"></i>Blue note</span>':''}</div>${['pent-major','pent-minor'].includes(item.id)?'<p class="portable-tip"><strong>Misma colección, otro centro:</strong> la pentatónica mayor y su menor relativa ocupan los mismos puntos. Cambiar la tónica resaltada cambia la función y la escucha.</p>':''}<div class="connection-head"><p class="eyebrow">CONECTAR EL MÁSTIL</p><h3>De una posición a la siguiente.</h3><p>Primero memorizá la forma; después rompé la caja. Las líneas rosadas indican el cambio de posición que conviene aislar y repetir lentamente.</p></div><div class="portable-controls"><label>Ejercicio<select data-connection-exercise>${exercises.map(e=>`<option value="${e.id}">Nivel ${e.level} · ${esc(e.title)}</option>`).join('')}</select></label><label>Etiquetas<select data-connection-label><option value="degrees">Grados</option><option value="steps">Orden de pasos</option></select></label></div><div data-connection-copy></div><div data-connection-map class="portable-scroll"></div><div class="button-row"><button type="button" class="secondary" data-connection-next>Mostrar paso siguiente</button><button type="button" class="secondary" data-connection-reset>Reiniciar</button></div><p data-connection-status role="status"></p><ol class="connection-routine"><li>Decí el grado antes de tocarlo.</li><li>Practicá sólo el cambio rosado hasta que no se corte el sonido.</li><li>Subí 5 BPM únicamente después de tres vueltas limpias.</li><li>Trasladá todo el ejercicio a otra tónica sin cambiar el dibujo.</li></ol>`;
 const shapeHost=host.querySelector('[data-portable-shape]'),mapHost=host.querySelector('[data-connection-map]'),copy=host.querySelector('[data-connection-copy]'),status=host.querySelector('[data-connection-status]');
 function renderShape(){shapeHost.innerHTML=movableShapeSVG(item,instrument,anchor,shapeLabels);}
 function renderExercise(){copy.innerHTML=`<h4>${esc(exercise.title)}</h4><p>${esc(exercise.summary)}</p><span class="portable-badge">${esc(exercise.pulse)}</span>`;mapHost.innerHTML=connectionSVG(exercise,item,instrument,exerciseLabels);step=0;status.textContent='Empezá en la tónica cyan.';}
 function highlight(){const target=exercise.route[step];mapHost.querySelectorAll('[data-connection-steps]').forEach(node=>node.classList.toggle('connection-active',node.dataset.connectionSteps.split(' ').includes(String(target.step))));status.textContent=`Paso ${target.step} de ${exercise.route.length}: ${target.offset%12===0?'tónica':target.degree}${target.shift?' · cambio de posición':''}.`;step=(step+1)%exercise.route.length;}
 host.querySelector('[data-portable-anchor]').onchange=e=>{anchor=Number(e.target.value);renderShape();};host.querySelector('[data-portable-label]').onchange=e=>{shapeLabels=e.target.value;renderShape();};host.querySelector('[data-connection-exercise]').onchange=e=>{exercise=exercises.find(x=>x.id===e.target.value);renderExercise();};host.querySelector('[data-connection-label]').onchange=e=>{exerciseLabels=e.target.value;renderExercise();};host.querySelector('[data-connection-next]').onclick=highlight;host.querySelector('[data-connection-reset]').onclick=renderExercise;
 renderShape();renderExercise();
}
