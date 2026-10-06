# Appbass

Curso y práctica de bajo y contrabajo de cuatro cuerdas, afinación Mi–La–Re–Sol. Jazz y blues: 40 lecciones y un atlas de 46 escalas y arpegios.

## Interfaz HTML

La interfaz está en public/index.html, public/style.css y public/app.js. public/appbass.html es la misma interfaz en la ruta usada por Sites. Los materiales del curso están en public/course.

El reproductor tiene play/pausa, detener, tempo, loop y bajo guía. Los audios se normalizaron para mejorar el volumen. La grabadora descarga una toma local y no la sube al servidor.

## Progreso y puntos

El backend autenticado de Sites guarda las lecciones completadas en D1 mediante GET y POST /api/progress. Cada lección suma 100 puntos una sola vez por usuario, incluso ante reintentos concurrentes. La finalización es declarada por el estudiante; no evalúa automáticamente su interpretación. Los puntos son de aprendizaje y no equivalen a premios canjeables.

Código: app/api/progress/route.ts, lib/progress-service.mjs y db/schema.ts. Migraciones: drizzle/. La identidad la proporciona Sites; no se acepta un usuario enviado desde el navegador.

## Desarrollo en Sites

Requiere Node 22.13 o superior y pnpm. Instalación: pnpm install --frozen-lockfile. Build: pnpm build. Las migraciones se generan con pnpm db:generate y se aplican al publicar en Sites.

## Migración a Azure

public/ contiene el frontend estático listo para tomar como raíz de publicación. La migración completa necesita además implementar /api/progress en un backend de Azure con autenticación y una base de datos; D1 y los encabezados de identidad de Sites son específicos del hosting actual. Una publicación de solo HTML conserva curso, audios, mapas y grabadora, pero no habilita puntos ni progreso persistente. La UI muestra el error de carga y no inventa un saldo local.

Antes de configurar el workflow de GitHub a Azure hay que elegir el recurso de Azure, confirmar la autenticación y proporcionar el secreto de publicación mediante los secretos del repositorio. No se incluyen credenciales en el código.

## Estado de la beta

Desafíos por enlace disponibles. Ranking semanal, premios, referidos acreditados y pagos todavía pendientes.

## Verificación

Ejecutar node tests/progress.test.mjs para comprobar reproducción, avance B01→B02, puntos idempotentes, concurrencia y separación entre usuarios. Los 332 audios se comprobaron contra saturación digital después de su normalización y compresión.
