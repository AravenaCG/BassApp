export const tuning=instrument=>instrument==='electricBass5'?[43,38,33,28,23]:[43,38,33,28];
export const stringNames=instrument=>instrument==='electricBass5'?['G','D','A','E','B']:['G','D','A','E'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function positions(midi,instrument='electricBass') {return tuning(instrument).map((open,string)=>({string,fret:midi-open})).filter(p=>p.fret>=0&&p.fret<=24);}
// Plan the complete phrase, not individual notes: a four-fret window is a model,
// not a requirement to stretch the hand. Contrabass deliberately has no finger numbers.
export function planFingering(notes,instrument='electricBass',start=0){
 if(!notes.length)return [];
 let states=[],layers=[];
 for(let i=0;i<notes.length;i++){
  const choices=positions(notes[i].midi,instrument);if(!choices.length)return [];
  const next=[];
  for(const p of choices){
   if(!i&&p.string!==choices[start%choices.length].string)continue;
   const ps=p.fret===0?[1]:Array.from({length:Math.min(4,p.fret)},(_,j)=>Math.max(1,p.fret-3)+j);
   for(const position of ps.filter((v,j,a)=>a.indexOf(v)===j&&v<=Math.max(1,p.fret))){
    let best={cost:i?Infinity:p.fret*.1+Math.abs((p.fret-position)-1)*.2,prev:-1};
    states.forEach((s,j)=>{const cost=s.cost+(p.fret===0?0:Math.abs(position-s.position)*3)+Math.abs(p.string-s.string)*.7+Math.abs(p.fret-s.fret)*.15+(p.fret===0?.3:0);if(cost<best.cost)best={cost,prev:j};});
    next.push({...p,position,finger:p.fret===0?0:p.fret-position+1,...best});
   }
  }
  layers.push(next);states=next;
 }
 let index=states.reduce((best,s,i)=>s.cost<states[best].cost?i:best,0),out=[];
 for(let i=notes.length-1;i>=0;i--){const p=layers[i][index];out.unshift({...notes[i],string:p.string,fret:p.fret,position:p.position,finger:instrument==='doubleBass'?null:p.finger,step:i+1});index=p.prev;}
 return out.map((p,i)=>({...p,shift:i>0&&p.fret!==0&&p.position!==out[i-1].position}));
}
let mapId=0;
export function routeHTML(route,instrument='electricBass',label='notes'){
 if(!route.length)return '<p>No se encontró un recorrido en el registro disponible.</p>';
 const low=Math.max(0,Math.min(...route.map(p=>p.fret))-1),high=Math.max(low+4,Math.max(...route.map(p=>p.fret))+1),width=(high-low+1)*72+100,height=tuning(instrument).length*64+100;
 let svg=`<svg class="route-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Recorrido guiado: inicio, orden y final"><rect width="${width}" height="${height}" fill="#0b1422"/>`;
 for(let f=low;f<=high;f++){const x=70+(f-low)*72;svg+=`<line x1="${x-30}" x2="${x-30}" y1="20" y2="${height-55}" stroke="#40536d"/><text x="${x}" y="${height-24}" fill="#b5cbe4" text-anchor="middle">${f}</text>`;}
 stringNames(instrument).forEach((s,i)=>svg+=`<text x="15" y="${54+i*64}" fill="#c7d8ec">${s}</text><line x1="40" x2="${width-20}" y1="${50+i*64}" y2="${50+i*64}" stroke="#6f87a3"/>`);
 const arrow='route-arrow-'+(++mapId);
 svg+=`<defs><marker id="${arrow}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#6e9cba"/></marker></defs>`;
 route.slice(1).forEach((p,i)=>{const a=route[i];svg+=`<path d="M${70+(a.fret-low)*72} ${50+a.string*64}L${70+(p.fret-low)*72} ${50+p.string*64}" fill="none" stroke="#6e9cba" stroke-width="2" marker-end="url(#${arrow})" ${p.shift?'stroke-dasharray="4 5"':''}/>`;});
 const grouped=new Map();route.forEach(p=>{const k=p.string+':'+p.fret;if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(p);});
 for(const ps of grouped.values()){const p=ps[0],x=70+(p.fret-low)*72,y=50+p.string*64,root=p.step===1||ps.some(n=>n.step===route.length),value=label==='degrees'?p.degree||'—':label==='fingers'?(p.finger===null?'—':p.finger===0?'aire':p.finger):p.symbol||p.latin||p.midi;
  svg+=`<g data-route-steps="${ps.map(n=>n.step).join(' ')}"><circle cx="${x}" cy="${y}" r="22" fill="${root?'#48e3ed':'#bda5ff'}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" fill="#091320">${esc(value)}</text><text x="${x}" y="${y-28}" text-anchor="middle" fill="#edf5ff" font-size="11">${ps.map(n=>n.step===1?'INICIO 1':n.step===route.length?'FIN '+n.step:n.step).join(' / ')}</text></g>`;
 }
 svg+='</svg>';
 return `<div class="route-scroll">${svg}</div><p>Pasos numerados = orden de ejecución; grados = función musical; dedos = sugerencia de mano izquierda. No son la misma numeración.</p><ol class="route-sequence">${route.map(p=>`<li data-route-step="${p.step}">${p.shift?'<strong>Cambio de posición · </strong>':''}${esc(p.symbol||p.latin||p.midi)} · cuerda ${stringNames(instrument)[p.string]}, ${instrument==='doubleBass'?'semitono':'traste'} ${p.fret}${instrument==='doubleBass'?'':` · ${p.finger===0?'al aire':'dedo '+p.finger}`} · posición ${p.position}</li>`).join('')}</ol><p>${instrument==='doubleBass'?'Mapa conceptual de semitonos: no representa distancias físicas ni prescribe digitación de contrabajo.':'Digitación orientativa en ventanas de cuatro trastes. Adaptá los cambios a tu comodidad; no fuerces estiramientos.'}</p>`;
}
export function mountRoute(host,notes,instrument='electricBass',onStep=()=>{},title='Ficha de práctica'){
 let start=0,label='notes',route;
 const alternatives=positions(notes[0]?.midi,instrument);
 host.innerHTML=`<div class="button-row route-controls"><label>Inicio<select data-route-start>${alternatives.map((p,i)=>`<option value="${i}">Cuerda ${stringNames(instrument)[p.string]} · ${instrument==='doubleBass'?'semitono':'traste'} ${p.fret}</option>`).join('')}</select></label><label>Etiquetas<select data-route-label><option value="notes">Notas</option><option value="degrees">Grados</option>${instrument==='doubleBass'?'':'<option value="fingers">Dedos sugeridos</option>'}</select></label><button type="button" class="secondary" data-route-next>Paso siguiente</button><button type="button" class="secondary" data-route-print>Imprimir ficha</button></div><div data-route-content></div><p data-route-status role="status"></p>`;
 let step=0;
 function render(){route=planFingering(notes,instrument,start);host.querySelector('[data-route-content]').innerHTML=routeHTML(route,instrument,label);step=0;}
 function highlight(index){host.querySelectorAll('[data-route-step]').forEach(n=>n.classList.toggle('route-active',Number(n.dataset.routeStep)===index+1));host.querySelectorAll('[data-route-steps]').forEach(n=>n.classList.toggle('route-active',n.dataset.routeSteps.split(' ').includes(String(index+1))));onStep(index);}
 host.querySelector('[data-route-start]').onchange=e=>{start=Number(e.target.value);render();};host.querySelector('[data-route-label]').onchange=e=>{label=e.target.value;render();};
 host.querySelector('[data-route-next]').onclick=()=>{highlight(step);host.querySelector('[data-route-status]').textContent=`Paso ${step+1}: ${route[step]?.symbol||route[step]?.midi} · cuerda ${stringNames(instrument)[route[step]?.string]} · ${route[step]?.fret}`;step=(step+1)%Math.max(1,route.length);};
 host.querySelector('[data-route-print]').onclick=()=>{const sheet=document.createElement('section');sheet.id='bass-print-sheet';sheet.innerHTML='<h1>Appbass · '+esc(title)+'</h1>'+routeHTML(route,instrument,label);document.querySelector('#bass-print-sheet')?.remove();document.body.append(sheet);window.print();};
 render();return {highlight,route:()=>route};
}
