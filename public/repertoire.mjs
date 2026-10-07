// One collection switch, or individual enabled flags, retires the beta repertoire.
export const REPERTOIRE_ENABLED=true;
const collection='beta-standards-v1';
const morton='https://imslp.org/wiki/Blues_and_Stomps_(Morton,_Jelly_Roll)';
export const repertoire=[
 {id:'jelly-roll-blues',title:'Original Jelly Roll Blues',composer:'Jelly Roll Morton',source:'https://imslp.org/wiki/Original_Jelly_Roll_Blues_(Morton,_Jelly_Roll)',edition:'Will Rossiter, 1915 · primera edición',status:'Partitura externa para piano'},
 {id:'king-porter',title:'King Porter Stomp',composer:'Jelly Roll Morton',source:morton,edition:'Blues and Stomps, libro 1 · pieza 2',status:'Partitura externa para piano'},
 {id:'new-orleans',title:'New Orleans Blues',composer:'Jelly Roll Morton',source:morton,edition:'Blues and Stomps, libro 1 · pieza 3',status:'Partitura externa para piano'},
 {id:'pearls',title:'The Pearls',composer:'Jelly Roll Morton',source:morton,edition:'Blues and Stomps, libro 1 · pieza 7',status:'Partitura externa para piano'},
 {id:'entertainer',title:'The Entertainer',composer:'Scott Joplin',source:'https://www.mutopiaproject.org/cgibin/make-table.cgi?searchingfor=The+Entertainer',edition:'Mutopia · reproducción de la edición de 1902',midi:'repertoire/entertainer.mid',pdf:'repertoire/entertainer.pdf',status:'Audio MIDI + reducción didáctica de bajo'},
 {id:'maple',title:'Maple Leaf Rag',composer:'Scott Joplin',source:'https://www.mutopiaproject.org/cgibin/make-table.cgi?searchingfor=Maple+Leaf+Rag',edition:'Mutopia · reproducción de la edición de 1899',midi:'repertoire/maple.mid',pdf:'repertoire/maple.pdf',status:'Audio MIDI + reducción didáctica de bajo'}
].map(entry=>({...entry,collection,enabled:true,license:'Public Domain según la fuente; revisar territorio'}));
export const activeRepertoire=()=>REPERTOIRE_ENABLED?repertoire.filter(r=>r.enabled):[];
export const backingTracks=[
 {id:'swing-major',title:'Swing · ii–V–I mayor',style:'swing',chords:['Dm7','G7','Cmaj7','Cmaj7','Dm7','G7','Cmaj7','G7']},
 {id:'minor-cadence',title:'Swing · cadencia menor',style:'swing',chords:['Dm7b5','G7','Cm','Cm','Fm','G7','Cm','G7']},
 {id:'bossa-study',title:'Bossa · estudio en Do',style:'bossa',chords:['Cmaj7','Cmaj7','Dm7','G7','Em7','Am7','Dm7','G7']},
 {id:'modal-study',title:'Modal · pedal de Re',style:'straight',chords:['Dm7','Dm7','Dm7','Dm7','Em7','Em7','Dm7','Dm7']}
];
