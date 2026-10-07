# Appbass

Beta de aprendizaje de bajo y contrabajo de cuatro cuerdas (Mi–La–Re–Sol): 40 lecciones, atlas de 46 escalas y arpegios, y prácticas interactivas.

## Aplicación

Interfaz canónica: public/appbass.html. La raíz redirige allí conservando parámetros y referidos. public/app.js integra curso, atlas y grabaciones; account-ui.mjs, practice-ui.mjs y practice-engine.mjs implementan cuentas y práctica. Materiales: public/course.

- Once prácticas: técnica, blues, ii–V–I, walking, turnarounds y dos piezas originales sencillas. Las piezas generadas ofrecen fundamentales, quintas, arpegios y walking.
- Audio sintetizado, notas y cursor comparten el reloj de Web Audio. Tempo, metrónomo, bajo guía, selección de compases, repetición y aumento gradual de velocidad.
- Perfil, plan semanal, continuación de lecciones, estados leído/practicado/repasar, diario y comentarios.
- Registro con invitación, máximo 20 cuentas; inicio/cierre de sesión y cambio de contraseña. Referidos atribuidos a altas reales, sin premios.
- Recordatorio semanal dentro de la aplicación, con posposición. No se envían correos ni push y no existe aún recuperación de contraseña por correo.
- Dos grabaciones locales comparables y descargables; no se suben al servidor y se pierden al cerrar la página. No se evalúa automáticamente la interpretación.

Las preferencias del reproductor se recuerdan por cuenta en ese navegador. Progreso y diario se guardan en SQL. Cada lección declarada completada suma 100 puntos una sola vez, incluso con solicitudes simultáneas. Los puntos no son canjeables. La partitura del reproductor es simplificada; las lecciones incluyen partituras y PDF completos.

## Runtime y datos

Producción: Node.js 22 + Vinext/Nitro, Azure Container Apps Consumption en Brazil South. Base exclusivamente AppbassBeta en el servidor existente; **no modificar UsuariosOESAT**.

AZURE_SQL_CONNECTION_STRING se inyecta desde el secreto existente de Container Apps. Nunca poner credenciales en archivos versionados ni logs. Sesiones HttpOnly/Secure/SameSite, contraseñas scrypt, validación de origen, límites de entrada e intentos, consultas parametrizadas y autorización por sesión.

Esquema inicial: infra/appbass-beta.sql. Ampliación aditiva/repetible: infra/appbass-beta-v2.sql; verifica DB_NAME antes de escribir. db/ y drizzle/ conservan el adaptador histórico Sites/D1; ya no son la persistencia de las APIs de esta beta Azure.

## Desarrollo y pruebas

Node >=22.13 y pnpm (Corepack).

```sh
corepack pnpm install --frozen-lockfile
node --test tests/study.test.mjs
corepack pnpm exec tsc --noEmit --incremental false
corepack pnpm build:azure
corepack pnpm start:azure
```

Para las APIs se necesita la variable de conexión. En Windows, con acceso autorizado a Azure, scripts/with-beta-sql.ps1 -Action serve la obtiene únicamente en memoria y sirve en 127.0.0.1:3100. -Action migrate aplica solo la ampliación; no crea la base ni el esquema inicial.

corepack pnpm exec playwright test prueba la interfaz con APIs simuladas (Edge local). Con servidor y SQL configurados, scripts/with-beta-sql.ps1 -Action integration verifica APIs reales creando cuentas e invitación temporales y eliminando exclusivamente esos datos al terminar. No ejecutar sin al menos dos lugares libres en la beta. APPBASS_TEST_URL permite elegir el servidor objetivo.

## Despliegue

Commits a main ejecutan .github/workflows/deploy-azure.yml: pruebas unitarias y tipos, build Docker, imagen inmutable por SHA en GHCR y actualización de la imagen de Container Apps mediante OIDC. No se reaprovisiona Bicep al publicar código, para preservar secretos y configuración.

Aplicar la migración aditiva antes de publicar las APIs que dependan de ella. Para volver a una versión anterior, actualizar la imagen a sha-<commit> conservando el esquema aditivo. Ver .azure/deployment-plan.md.
