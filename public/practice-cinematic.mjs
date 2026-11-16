const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export const CINEMATIC_EXERCISES=[
 ['major-scale','Escala mayor'],
 ['pentatonic','Pentatónica'],
 ['blues','Blues · 12 compases'],
 ['walking','Walking en negras'],
 ['first-groove','Riff original']
];

export const supportsCinematic=instrument=>instrument==='electricBass';

export function cinematicShell(){
 return `<section id="practice-cinematic" class="cinematic-practice" hidden aria-label="Visualización guiada de mástil y tablatura">
  <div class="cinematic-head">
   <div><span class="eyebrow">VISTA GUIADA · 4 CUERDAS</span><h3>Mástil, digitación y lectura sincronizada</h3><p>La luz indica dónde tocar. El número pequeño es el dedo sugerido por el recorrido automático.</p></div>
   <div class="cinematic-tempo-presets" aria-label="Tempo de estudio"><button type="button" class="secondary" data-tempo-stage="slow">Estudio lento</button><button type="button" class="secondary" data-tempo-stage="target">Tempo objetivo</button></div>
  </div>
  <div class="cinematic-exercises" aria-label="Ejercicios recomendados">${CINEMATIC_EXERCISES.map(([id,label])=>`<button type="button" data-cinematic-exercise="${id}">${label}</button>`).join('')}</div>
  <div class="cinematic-stage">
   <div class="real-neck-panel"><span class="cinematic-caption">MÁSTIL REAL</span><div class="real-neck-wrap"><img src="assets/practice/bass-neck-4-string-neon.png" alt="Mástil realista de bajo eléctrico de cuatro cuerdas"><div id="real-neck-lights" aria-hidden="true"></div></div><p id="cinematic-fingering">Esperando la primera nota…</p></div>
   <div class="diagram-panel"><div class="cinematic-caption-row"><span class="cinematic-caption">DIAPASÓN AMPLIADO</span><span>● nota actual · ○ recorrido cercano</span></div><svg id="cinematic-fretboard" viewBox="0 0 520 410" role="img" aria-label="Posición ampliada en el diapasón"></svg></div>
  </div>
  <div class="cinematic-reader"><div class="cinematic-caption-row"><span class="cinematic-caption">TABLATURA</span><span>La línea central es el momento de tocar</span></div><svg id="cinematic-tab" viewBox="0 0 1000 210" role="img" aria-label="Tablatura sincronizada"></svg></div>
  <div id="cinematic-score-wrap" class="cinematic-reader"><div class="cinematic-caption-row"><span class="cinematic-caption">PARTITURA · CLAVE DE FA</span><span>Suena una octava por debajo de lo escrito</span></div><svg id="cinematic-score" viewBox="0 0 1000 190" role="img" aria-label="Partitura sincronizada en clave de fa"></svg></div>
 </section>`;
}

const stringColors=['#b78cff','#ff6cba','#75ef9a','#ffc571'];
const stringLabels=['G','D','A','E'];
const xForString=string=>95+(3-string)*110;
const yForTabString=string=>58+string*34;
const noteWindow=(planned,beat,before=2,after=6)=>planned.filter(note=>note.beat>=beat-before&&note.beat<=beat+after);

export function fretboardSVG(planned,beat,active,colorFor,noteNames){
 let svg='<defs><filter id="cinematic-glow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="active-halo"><stop offset="0" stop-color="white" stop-opacity=".9"/><stop offset=".25" stop-color="currentColor" stop-opacity=".8"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs><rect x="45" y="40" width="430" height="340" rx="18" fill="#07101c" stroke="#2b3b52"/>';
 for(let string=3;string>=0;string--){const x=xForString(string),width=1.6+(string*.5);svg+=`<line x1="${x}" y1="42" x2="${x}" y2="380" stroke="${stringColors[string]}" stroke-width="${width}" opacity=".65"/><text x="${x}" y="25" fill="${stringColors[string]}" text-anchor="middle" font-size="18" font-weight="700">${stringLabels[string]}</text>`;}
 for(let fret=0;fret<=12;fret++){const y=48+fret*27;svg+=`<line x1="55" y1="${y}" x2="465" y2="${y}" stroke="${fret===0?'#dbe5ef':'#51647b'}" stroke-width="${fret===0?5:1.5}"/>`;}
 for(let fret=1;fret<=12;fret++){const y=48+(fret-.5)*27;svg+=`<text x="25" y="${y+4}" fill="#8193aa" text-anchor="middle" font-size="12">${fret}</text>`;}
 const nearby=noteWindow(planned,beat,1,4).filter(n=>n.fret>=0&&n.fret<=12);
 for(const note of nearby){const x=xForString(note.string),y=48+(Math.max(.5,note.fret-.5))*27,isActive=note===active,c=colorFor(note);if(isActive)svg+=`<circle cx="${x}" cy="${y}" r="39" fill="${c}" opacity=".2" filter="url(#cinematic-glow)"/>`;svg+=`<circle cx="${x}" cy="${y}" r="${isActive?20:12}" fill="${isActive?c:'#101b2a'}" stroke="${c}" stroke-width="${isActive?4:2}" opacity="${isActive?1:.65}" filter="${isActive?'url(#cinematic-glow)':''}"/><text x="${x}" y="${y+5}" fill="${isActive?'#06121c':c}" text-anchor="middle" font-size="${isActive?13:10}" font-weight="800">${esc(noteNames[note.midi%12])}</text>${isActive?`<circle cx="${x+22}" cy="${y-20}" r="10" fill="#f4f7fb"/><text x="${x+22}" y="${y-16}" fill="#0a1320" text-anchor="middle" font-size="11" font-weight="800">${note.finger||'–'}</text>`:''}`;}
 return svg;
}

export function tablatureSVG(score,planned,beat,active,colorFor){
 const center=500,pixels=105,notes=noteWindow(planned,beat,4.25,4.25);
 let svg='<defs><filter id="tab-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="tab-fade"><stop stop-color="#08111e"/><stop offset=".12" stop-color="#08111e" stop-opacity="0"/><stop offset=".88" stop-color="#08111e" stop-opacity="0"/><stop offset="1" stop-color="#08111e"/></linearGradient></defs><rect width="1000" height="210" rx="14" fill="#08111e"/>';
 stringLabels.forEach((label,string)=>{const y=yForTabString(string);svg+=`<text x="30" y="${y+6}" fill="${stringColors[string]}" text-anchor="middle" font-size="18" font-weight="700">${label}</text><line x1="55" y1="${y}" x2="970" y2="${y}" stroke="#54677e" stroke-width="${1.2+string*.35}"/>`;});
 for(const bar of score.bars){const x=center+(bar.beat-beat)*pixels;if(x>50&&x<970)svg+=`<line x1="${x}" y1="42" x2="${x}" y2="176" stroke="#44566d"/><text x="${x+7}" y="27" fill="#8fa2b9" font-size="12">${esc(bar.chord||'')}</text>`;}
 for(const note of notes){const x=center+(note.beat-beat)*pixels,y=yForTabString(note.string),isActive=note===active,c=colorFor(note);svg+=`<circle cx="${x}" cy="${y}" r="${isActive?18:14}" fill="${isActive?c:'#101a28'}" stroke="${c}" stroke-width="2" ${isActive?'filter="url(#tab-glow)"':''}/><text x="${x}" y="${y+5}" fill="${isActive?'#07131e':c}" text-anchor="middle" font-size="14" font-weight="800">${note.fret}</text>`;}
 svg+='<line x1="500" y1="28" x2="500" y2="185" stroke="#f4f7fb" stroke-width="3"/><path d="M490 25 L500 36 L510 25" fill="#f4f7fb"/><rect width="1000" height="210" fill="url(#tab-fade)" pointer-events="none"/>';
 return svg;
}

export function compactScoreSVG(score,beat,active,colorFor){
 const center=500,pixels=105,diatonic=[0,0,1,1,2,3,3,4,4,5,5,6];
 let svg='<rect width="1000" height="190" rx="14" fill="#f4f7fb"/>';
 for(let line=0;line<5;line++)svg+=`<line x1="65" y1="${70+line*15}" x2="970" y2="${70+line*15}" stroke="#26354a" stroke-width="1.5"/>`;
 svg+='<text x="72" y="124" font-size="55" fill="#26354a">𝄢</text>';
 for(const bar of score.bars){const x=center+(bar.beat-beat)*pixels;if(x>105&&x<970)svg+=`<line x1="${x}" y1="70" x2="${x}" y2="130" stroke="#26354a"/><text x="${x+7}" y="35" fill="#526078" font-size="13">${esc(bar.chord||'')}</text>`;}
 for(const note of score.notes.filter(n=>n.beat>=beat-3.6&&n.beat<=beat+4.2)){const written=note.midi+12,d=7*(Math.floor(written/12)-1)+diatonic[written%12],y=130-(d-18)*7.5,x=center+(note.beat-beat)*pixels,c=colorFor(note),isActive=note===active;let ledger='';for(let ly=145;ly<=y;ly+=15)ledger+=`<line x1="${x-14}" y1="${ly}" x2="${x+14}" y2="${ly}" stroke="#26354a"/>`;for(let ly=55;ly>=y;ly-=15)ledger+=`<line x1="${x-14}" y1="${ly}" x2="${x+14}" y2="${ly}" stroke="#26354a"/>`;svg+=`${ledger}<ellipse cx="${x}" cy="${y}" rx="${isActive?11:8}" ry="${isActive?8:6}" fill="${isActive?c:'#26354a'}" stroke="${isActive?c:'#26354a'}" stroke-width="2"/><line x1="${x+7}" y1="${y}" x2="${x+7}" y2="${y-35}" stroke="${isActive?c:'#26354a'}" stroke-width="2"/>`;}
 svg+='<line x1="500" y1="48" x2="500" y2="151" stroke="#13aeb9" stroke-width="3" opacity=".75"/>';
 return svg;
}

export function updateRealNeck(root,active,colorFor,noteNames){
 const lights=root.querySelector('#real-neck-lights'),label=root.querySelector('#cinematic-fingering');
 if(!active){lights.innerHTML='';label.textContent='Silencio · prepará la próxima posición';return;}
 const x=10+(3-active.string)*26.65,y=3+Math.max(.5,active.fret-.5)/12*94,c=colorFor(active);
 lights.innerHTML=`<i class="neck-string-light" style="--neck-x:${x}%;--note-color:${c}"></i><i class="neck-note-light" style="--neck-x:${x}%;--neck-y:${y}%;--note-color:${c}"></i>`;
 label.textContent=`${noteNames[active.midi%12]} · cuerda ${stringLabels[active.string]} · traste ${active.fret} · dedo ${active.finger||'libre'}`;
}
