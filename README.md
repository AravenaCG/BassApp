# Appbass

Beta de aprendizaje de bajo de cuatro o cinco cuerdas y contrabajo: 40 lecciones, atlas de 31 familias de escalas y 16 de arpegios, y prácticas interactivas.

## Aplicación

Interfaz canónica: public/appbass.html. La raíz redirige allí conservando parámetros y referidos. public/app.js integra curso, atlas y grabaciones; account-ui.mjs, practice-ui.mjs y practice-engine.mjs implementan cuentas y práctica. Materiales: public/course.

- Veinticinco prácticas reproducibles: once ejercicios/piezas originales, ocho estudios introductorios por género, cuatro pistas originales con cifrado y samples CC0, y dos reducciones automáticas de Joplin. Biblioteca separada con seis títulos históricos; los cuatro de Morton son referencias externas sin audio sincronizado. Fuentes, licencias y limitaciones: [repertorio](public/repertoire/README.md).
- Practicar → Tu taller de estudio: sesiones de 5 a 60 minutos con tres tareas, temporizador y autoevaluación; cinco propuestas de técnica; ocho géneros; desafíos auditivos de intervalos y notas con referencia Do; repasos a 1/3/7 días e historial de los últimos cinco tempos declarados por lección. Con sesión se sincronizan en AppbassBeta; invitados usan almacenamiento local. Sin puntos ni certificación automática.
- Escalas y patrones → Recorrido guiado: inicio/final y orden numerado, cuerda inicial alternativa, etiquetas de notas/grados/dedos, cambios de posición y ficha imprimible. El inventario completo del diapasón queda separado. El reproductor calcula posiciones para la frase completa y muestra el recorrido por compás. Cinco cuerdas B–E–A–D–G incluye Si grave en Cuerdas al aire. Las ventanas de cuatro trastes son orientativas; el contrabajo sólo tiene un mapa conceptual, sin digitación prescrita. Los PDF antiguos no se regeneran.
- Piano y hi-hat sampleados (VCSL CC0), bajo sintetizado, notas y cursor comparten el reloj de Web Audio. Mezcla completa/sin bajo/sólo bajo, tempo, metrónomo, selección de compases, repetición y aumento gradual. Música +4 dB y compresor de salida. Colores por función armónica, estética neón y leyenda.
- Perfil, plan semanal, continuación de lecciones, estados leído/practicado/repasar, diario y comentarios.
- Registro con invitación, máximo 20 cuentas; inicio/cierre de sesión y cambio de contraseña. Referidos atribuidos a altas reales, sin premios.
- Recordatorio semanal dentro de la aplicación, con posposición. No se envían correos ni push y no existe aún recuperación de contraseña por correo.
- Dos grabaciones locales comparables y descargables; no se suben al servidor y se pierden al cerrar la página. No se evalúa automáticamente la interpretación.
- Cómo usar Appbass: guía por secciones y preguntas frecuentes, accesibles desde el menú y el pie. Tour opcional de cinco pasos en la primera visita autenticada por cuenta/navegador; completar, omitir o cerrar lo marca visto localmente. Se puede repetir desde la ayuda, también sin cuenta. No requiere cambios de SQL ni servicios externos.
- Mi curso → Armonía desde el bajo: 16 unidades progresivas con 32 preguntas específicas, 16 demostraciones originales sintetizadas, ejemplos analizados y práctica instrumental. Conserva los cinco ejes del programa (intervalos/acordes, funciones, cadencias, conducción y walking, inversiones), con prerrequisitos y un proyecto de integración. Distingue las reglas corales de la práctica del jazz. Las unidades se integran también en las lecciones relacionadas sin modificar sus IDs ni puntos.
- El repaso de armonía se sincroniza por cuenta en AppbassBeta, separado del progreso de las 40 lecciones; requiere respuestas correctas y autoevaluación instrumental. Invitados conservan el modo local. Permite explorar, continuar, volver a repasar y acceder directamente mediante `#curso?unidad=H01`. No certifica ejecución. Los PDF antiguos no incluyen la ampliación web.
- `docs/` contiene fuentes privadas locales y está excluido de Git y del contexto Docker. La app distribuye textos, ejercicios y audio originales en `public/harmony-*`, no los PDF fuente, sus imágenes ni sus grabaciones.

Las preferencias de práctica, atlas, avatar y duración de sesión se sincronizan por cuenta. Progreso y diario conservan sus tablas SQL. Cada lección declarada completada suma 100 puntos una sola vez, incluso con solicitudes simultáneas. Los puntos no son canjeables. La partitura del reproductor es simplificada; las lecciones incluyen partituras y PDF completos.

`/api/learning` usa la sesión para autorizar cada operación; rechaza IDs de otros usuarios, datos inválidos y versiones desactualizadas (409). Las autoevaluaciones tienen identificador idempotente. Las fechas de repaso se calculan en el servidor. `lib/beta-sql-guard.mjs` rechaza servidor/base incorrectos antes de conectar y verifica DB_NAME después: exclusivamente AppbassBeta en el servidor autorizado. No hay cambios en UsuariosOESAT, logins, firewall o configuración compartida.

Migración aditiva: `scripts/with-beta-sql.ps1 -Action learning-migrate`; las credenciales se mantienen sólo en memoria. Prueba real no destructiva: `-Action learning-integration`, que usa fixtures dentro de una transacción y revierte todo. La importación de datos locales requiere revisión y confirmación en el taller; sólo la cuenta actual, sin modo invitado, sin reemplazar registros existentes ni borrar copias locales. Las grabaciones y temporizadores no se suben.

## Runtime y datos

Mi curso incluye «Tu primera gira»: 40 escenarios imaginarios desde el cuarto hasta
un Show en River Plate, sin sustituir los objetivos ni IDs de las lecciones.
Avatar varón/mujer con bajo o contrabajo y cuatro colores; configurable en el mapa
y en Mi perfil. Apariencia sincronizada en la cuenta; invitados usan el navegador local.
El avatar avanza sólo después de guardar la finalización; movimiento desactivable
y respetuoso de `prefers-reduced-motion`. Progreso SQL y puntos existentes sin cambios.
Conciertos de cierre y recompensas figuran como «Próximamente», no desbloquean premios.

Producción: Node.js 22 + Vinext/Nitro, Azure Container Apps Consumption en Brazil South. Base exclusivamente AppbassBeta en el servidor existente; **no modificar UsuariosOESAT**.

AZURE_SQL_CONNECTION_STRING se inyecta desde el secreto existente de Container Apps. Nunca poner credenciales en archivos versionados ni logs. Sesiones HttpOnly/Secure/SameSite, contraseñas scrypt, validación de origen, límites de entrada e intentos, consultas parametrizadas y autorización por sesión.

Esquema inicial: infra/appbass-beta.sql. Ampliación aditiva/repetible: infra/appbass-beta-v2.sql; verifica DB_NAME antes de escribir. db/ y drizzle/ conservan el adaptador histórico Sites/D1; ya no son la persistencia de las APIs de esta beta Azure.

## Desarrollo y pruebas

Cada ficha del atlas explica su construcción, fórmula, intervalos, notas características y una aplicación al bajo. Los ejemplos y la tabla grado por grado se recalculan con la tónica elegida; los detalles desplegables mantienen separada la teoría de la práctica.

Atlas interactivo: 31 familias de escalas y 16 de arpegios, con todas las 12 alturas
y grafías enarmónicas opcionales. Selector de tónica, búsqueda por nombre latino o
cifrado, partitura/mapa/audio generados con las mismas alturas y grados. El cifrado
de una escala indica un acorde de referencia, no la escala completa. El PDF permanece
como material original estático. El desafío diario es opt-in, sincronizado por cuenta, sin
notificaciones ni puntos: tres colores sobre una tónica, autoevaluación y enlace
compartible con fecha fija. Escuchar tema en Joplin inicia el MIDI original con piano;
Practicar reducción carga el bajo didáctico y espera el botón Reproducir. No son grabaciones.

Mi curso separa el recorrido de 40 lecciones (mapa o lista) del laboratorio
complementario de 16 unidades. La nota del mapa señala la primera lección pendiente
del nivel visible y se mueve con el progreso guardado en la cuenta; no bloquea otras
estaciones. Los ejercicios de lectura muestran su partitura junto a las consignas
y separan las soluciones. La teoría complementaria dentro de una lección es opcional.

Node >=22.13 y pnpm (Corepack).

```sh
corepack pnpm install --frozen-lockfile
node --test tests/study.test.mjs tests/repertoire.test.mjs tests/harmony.test.mjs tests/course-ui.test.mjs tests/atlas.test.mjs
corepack pnpm exec tsc --noEmit --incremental false
corepack pnpm build:azure
corepack pnpm start:azure
```

Para las APIs se necesita la variable de conexión. En Windows, con acceso autorizado a Azure, scripts/with-beta-sql.ps1 -Action serve la obtiene únicamente en memoria y sirve en 127.0.0.1:3100. -Action migrate aplica solo la ampliación; no crea la base ni el esquema inicial.

corepack pnpm exec playwright test prueba la interfaz con APIs simuladas (Edge local). Con servidor y SQL configurados, scripts/with-beta-sql.ps1 -Action integration verifica APIs reales creando cuentas e invitación temporales y eliminando exclusivamente esos datos al terminar. No ejecutar sin al menos dos lugares libres en la beta. APPBASS_TEST_URL permite elegir el servidor objetivo.

## Despliegue

Commits a main ejecutan .github/workflows/deploy-azure.yml: pruebas unitarias y tipos, build Docker, imagen inmutable por SHA en GHCR y actualización de la imagen de Container Apps mediante OIDC. No se reaprovisiona Bicep al publicar código, para preservar secretos y configuración.

Aplicar la migración aditiva antes de publicar las APIs que dependan de ella. Para volver a una versión anterior, actualizar la imagen a sha-<commit> conservando el esquema aditivo. Ver .azure/deployment-plan.md.
