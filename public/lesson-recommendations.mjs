// Curated starting points, not a claim that one scale fits every chord in a lesson.
const rows={
 B01:['major','C','major-scale','Relacioná C–D–E con Do–Re–Mi en una escala sin alteraciones.'],
 B02:['chromatic','C','major-scale','Compará semitonos y nombres enarmónicos; la práctica de Do mayor sirve como referencia natural.'],
 B03:['triad-major','C','triads','Reconocé fundamental, tercera y quinta; después compará con la tríada menor.'],
 B04:['triad-dim','B','triads','Compará la quinta disminuida con las tríadas mayores y menores de la práctica.'],
 B05:['major','C','major-scale','Nombrá cada grado mientras recorrés la escala mayor.'],
 B06:['natural-minor','C','minor-cadence','Estudiá Do menor natural; la cadencia en Do menor permite escuchar la función menor. El dominante incorpora notas ajenas a la escala natural.'],
 B07:['pent-minor','C','pentatonic','Reducí el material a cinco notas y conectalas en grupos de tres.'],
 B08:['blues-minor','C','blues','Usá la blue note como paso; distinguí el color blues de las notas de cada acorde.'],
 B09:['dom7','C','blues','Identificá 1–3–5–♭7 en C7; transportá el arpegio cuando cambie el acorde.'],
 B10:['maj7','C','triads','Leé maj7 como tríada mayor más séptima mayor; la práctica repasa su base triádica.'],
 B11:['dom7','C','two-feel','Leé el arpegio y elegí fundamentales y quintas para acompañar en dos.'],
 B12:['dorian','D','modal-study','Sobre el pedal de Re, compará la sexta natural de la dórica con la menor natural.'],
 B13:['pent-major','C','pentatonic','Construí motivos cortos y dejá silencios; no toques la escala como una lista.'],
 B14:['maj7','C','ii-v-i','Partí del Imaj7 y comparalo con los arpegios del ii y del V.'],
 I01:['major','C','ii-v-i','Escuchá preparación, tensión y reposo; seguí la fundamental de cada función.'],
 I02:['major','C','ii-v-i','Ubicá ii, V e I dentro de la tonalidad y enlazá notas cercanas.'],
 I03:['mixolydian','C','blues','C mixolidia describe C7; cambiá el centro y las notas al pasar a F7 o G7.'],
 I04:['natural-minor','C','blues-minor-walking','Usá Do menor como referencia del i; atendé las alteraciones de los dominantes del blues menor.'],
 I05:['dom7','C','blues','Seguí los 12 compases y sus cambios antes de agregar variaciones al bajo.'],
 I06:['dom7','C','two-feel','Sostené blancas en los pulsos 1 y 3, priorizando fundamental y quinta.'],
 I07:['dorian','D','ii-v-i','Empezá por Dm7; después compará G mixolidia y C mayor sobre V e I.'],
 I08:['harmonic-minor','C','minor-cadence','La sensible de Do menor armónica explica el dominante; no reemplaza la lectura de cada acorde.'],
 I09:['dom7','C','walking','Armá cuatro negras por compás y llegá a la fundamental del acorde siguiente.'],
 I10:['chromatic','C','blues-major-walking','Usá cromatismos como aproximaciones a notas objetivo, no como notas estables.'],
 I11:['dorian','D','modal-study','Escuchá el modo sobre un pedal y reconocé su nota característica.'],
 I12:['dom7','C','ii-v-i','Guiá motivos con terceras y séptimas, ajustándolas en cada cambio.'],
 I13:['mixolydian','A','turnaround','A7 puede preparar Dm7; seguí la resolución de cada dominante secundario.'],
 I14:['blues-minor','C','blues-major-walking','Contrastá el color blues con el walking que sigue las notas de los acordes.'],
 A01:['dom13','C','blues','Explorá 9 y 13 sobre C7, resolviendo las tensiones a notas del acorde.'],
 A02:['altered','G','minor-cadence','Explorá G alterada como color del V que resuelve a Do menor; seleccioná tensiones compatibles con el cifrado.'],
 A03:['mixolydian','A','turnaround','Transportá el material dominante en cada eslabón del ciclo.'],
 A04:['lydian-dom','Db','ii-v-i','Estudiá Db7(#11) como sustituto de G7. La pista conserva el ii–V–I original: compará la idea, no superpongas todo indiscriminadamente.'],
 A05:['dim7','B','turnaround','Enlazá el disminuido hacia notas cercanas del acorde de llegada; la pista es un contexto complementario.'],
 A06:['natural-minor','C','bossa-study','Compará Do menor con Do mayor para entender el préstamo modal; la pista no reharmoniza automáticamente.'],
 A07:['dom7','A','turnaround','Escuchá las resoluciones de los dominantes dentro del turnaround.'],
 A08:['major','G','ii-v-i','Transportá mentalmente el ii–V–I de Do a Sol; la pista en Do es el punto de comparación.'],
 A09:['bebop-dom','C','blues-major-walking','Ubicá notas del acorde en tiempos fuertes; la nota de paso bebop conecta el recorrido.'],
 A10:['bebop-dom','C','blues','Practicá corcheas y resoluciones, manteniendo las notas estructurales en el pulso.'],
 A11:['pent-minor','C','blues','Cantá un motivo, tocá una respuesta y compará ambas frases.'],
 A12:['mixolydian','C','blues-major-walking','Integrá forma, notas guía, walking y motivos en un blues completo.']
};
export function recommendationForLesson(id){
 const row=rows[id];if(!row)return null;
 const [family,tonic,exercise,reason]=row;
 return {family,tonic,exercise,reason,readingLevel:id==='B01'?1:id==='B02'?3:5};
}
