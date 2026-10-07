# Repertorio beta y acompañamientos de Appbass

Colección: `beta-standards-v1`. Ver `public/repertoire.mjs`: `REPERTOIRE_ENABLED`
retira toda la colección del catálogo y de la biblioteca; `enabled` retira un título.
Para retirar también las descargas directas, eliminar sus archivos en `public/repertoire`
y las entradas del importador/manifiesto, y publicar otra imagen.

## Archivos incorporados

- The Entertainer (1902) y Maple Leaf Rag (1899), Scott Joplin: MIDI,
  LilyPond y PDF completos de Mutopia, ediciones declaradas Public Domain.
  Fuentes: https://www.mutopiaproject.org/ftp/JoplinS/entertainer/ y
  https://www.mutopiaproject.org/ftp/JoplinS/maple/ . Los archivos LilyPond
  conservan créditos editoriales originales. No se incorporaron grabaciones comerciales.
- Piano y hi-hat: Versilian Community Sample Library, Versilian Studios LLC,
  CC0-1.0, https://github.com/sgossner/VCSL . Copia de declaración del autor
  en `/samples/VCSL-README.md`. Licencia: https://creativecommons.org/publicdomain/zero/1.0/ .
  Archivos WAV originales sin modificar. En reproducción se normaliza el pico y se cambia
  afinación/duración del piano. El C3 del sample legacy es Do central (MIDI 60,
  ~261 Hz, verificado por autocorrelación), no MIDI 48.
  El bajo es sintetizado, no un sample de contrabajo real.
- `asset-manifest.json` registra URL exacta, commit de VCSL, tamaño y SHA-256.
  Reproducir descargas: `node scripts/download-practice-assets.mjs`.

## Referencias externas, no transcripciones reproducibles

Original Jelly Roll Blues: primera edición Will Rossiter (1915), IMSLP #273431.
King Porter Stomp, New Orleans Blues y The Pearls: piezas 2, 3 y 7 del libro 1
de Blues and Stomps, Herman Darewski (1923, 1925–27), IMSLP #589177.
Las fichas de IMSLP indican Public Domain para esas ediciones concretas.
Las páginas también pueden listar arreglos modernos con otras licencias.
Estos cuatro temas se incorporan como fichas con enlaces a partituras, no como
audios ni transcripciones para bajo. Su sincronización está pendiente.

## Límites musicales y legales

El reproductor MIDI usa un tempo fijo de estudio (no interpreta cambios posteriores
de tempo, pedal ni expresión). Extrae la nota más grave de cada ataque por debajo
de Do central y la adapta al registro del bajo. No es una parte auténtica de contrabajo
ni garantiza una reducción musicalmente óptima. El resto del piano se puede escuchar
como acompañamiento. La partitura SVG es esquemática; usar el PDF para la notación
completa. No se inventa cifrado para estas piezas.

Las cuatro pistas con cifrado son estudios originales sobre cadencias comunes,
con piano sampleado, bajo sintetizado y pulso de hi-hat recto o ternario.
“Bossa” describe un estudio introductorio, no una sección rítmica profesional grabada.
No se utiliza contenido de iReal Pro, FiloBass ni packs de terceros sin permiso.

Dominio público es territorial y no constituye una garantía jurídica global.
En Argentina pueden existir obligaciones por dominio público pagante:
https://www.argentina.gob.ar/cultura/fna/que-es/financiamiento .
La licencia de samples no determina el régimen de las composiciones.
