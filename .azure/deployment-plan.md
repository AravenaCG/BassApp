# Appbass — deployment plan

Status: Validated — image-only publication authorized; mandatory Linux Docker gate runs in existing GitHub CI before Azure update.
Updated: 2026-10-09.

## Publication validation — 2026-10-09

User explicitly requested commit, push and deploy. azure-validate re-ran all 36
unit tests (passed), TypeScript without incremental output (exit 0), and the final
Azure production build (exit 0). Git diff check passed; remote main matches HEAD.
Azure CLI authentication confirms subscription d8a9c4b4-89a1-482d-88dd-ac38d3d289a1;
existing appbass is in Brazil South / rg-appbass-prod, identity None, previous
ready revision appbass--0000016. Docker context excludes docs, credentials and
local outputs; frozen pnpm lockfile is present. No infrastructure or RBAC edits.
Template compilation, what-if, provisioning quotas and new-role checks are N/A
for this image-only release. Linux Docker validation is delegated to the existing
mandatory GitHub build step, which runs tests, types and build before Azure login
and image update; it is not claimed as completed locally. Prior 26/26 local browser
checks are recorded below. No SQL migration or SQL write is part of publication.
Historical Ready for Validation notes below describe the earlier handoff.

## Current plan — beta learning persistence

### 1. Project overview

Mode MODIFY. Extend the existing beta database and authenticated API so learning
reviews and preferences can persist across devices. Keep the existing Node app,
SQL database, lesson completion, authentication and CI/CD. No new Azure resources.

### 2. Requirements and context for approval

- Customer-facing beta, maximum 20 accounts; cost-optimized existing service tiers.
- Subscription verified read-only: Suscripción de Azure 1,
  d8a9c4b4-89a1-482d-88dd-ac38d3d289a1, previously selected personal account.
- ONLY SQL database AppbassBeta on sqldb-orquestaoesat.database.windows.net.
- Existing SQL region East US / resource group oesatgroup, as recorded below;
  no database move. Container App remains Brazil South / rg-appbass-prod.
- NEVER connect to, inspect users in, migrate, update or delete UsuariosOESAT.
- No server-wide login, firewall, permission, pricing-tier or budget changes.
- Reconfirm this unchanged target as part of plan approval before execution.
- Existing USD20 budget on rg-appbass-prod does not cover SQL in oesatgroup.
  This plan does not claim to change that budget or guarantee a new cost total.

### 3. Components detected

- Static ES-module UI: public/app.js, learning-tools.mjs, atlas-ui.mjs,
  practice-ui.mjs, harmony-ui.mjs and tour.mjs.
- Authenticated Next-compatible API routes: app/api; mssql connection helper
  lib/azure-sql.ts and session authorization in lib/beta-auth.ts.
- Existing additive SQL migrations in infra; scripts/beta-db.mjs already verifies
  DB_NAME(). scripts/with-beta-sql.ps1 handles the existing secret only in memory.
- The general API pool currently has no database-name guard: harden it first.

### 4. Recipe

Existing Azure CLI / GitHub Actions image-only recipe, not a new azd project.
Prepare a versioned, additive SQL migration and API/UI changes. No Bicep apply.
No deployment or production migration is included without plan approval; publication
will subsequently require azure-validate and azure-deploy under the approved scope.

### 5. Architecture and first implementation scope

Reuse Container Apps Consumption and existing Azure SQL Basic. Reuse existing
logging, secret and authentication arrangements; do not provision supporting services
or alter managed identities/RBAC in this change.

Proposed additional tables (all with beta_ prefix and user_id ownership):
- beta_learning_preferences: validated settings for practice (including five strings),
  atlas, avatar and session duration; versioned updates to handle multiple devices.
- beta_learning_reviews: next review per actual lesson and latest self-evaluation.
- beta_learning_review_history: dated tempo/self-evaluation history, bounded in API.
- beta_learning_unit_progress: locally reviewed harmony units moved to account storage.
- beta_learning_daily_progress: opt-in daily challenge self-evaluations by date.

Keep existing course completion/points and journal as their source of truth. Do not
award extra points for self-evaluation, duplicate progress or claim to verify playing.
Timer state, current ear-training questions and audio recordings remain browser-local;
no audio upload, email sending, concert/reward system or paid service is added.

Security: force target database before connecting where possible and verify DB_NAME()
on the connected pool before any beta query. Reject any mismatch and close the pool.
Every migration independently fails unless DB_NAME()='AppbassBeta'; transactional,
repeatable, additive DDL only. No DROP, TRUNCATE, cross-database names or data cleanup.
Every API operation derives user_id from the session, not from client-supplied IDs;
parameterized SQL, strict field/lesson validation, bounded inputs and conflict handling.
Schema errors return actionable failures; do not silently claim a cloud save succeeded.

Local migration: offer an explicit import of the signed-in account's local preferences
and progress after preview. Do not automatically upload guest or another account's data,
overwrite newer cloud records, or delete local copies. Guests retain local exploration.
UI labels must accurately distinguish local, pending, saved and failed states.

### 6. Provisioning limit checklist

New ARM resources: zero. Microsoft.App, Microsoft.Sql and all supporting resource
types: number to deploy 0; existing resources unchanged; provisioning quotas/capacity
N/A. No region, SKU, network, policy, RBAC or infrastructure changes requested.

### 7. Execution checklist

- [x] Analyze existing workspace and authenticated APIs; select MODIFY recipe.
- [x] Confirm actual active subscription read-only; record prior region/resource scope.
- [x] Inventory new resources: none; provisioning checks N/A.
- [x] User approves plan and unchanged subscription/database/locations (2026-10-09), conditional on absolutely no orchestra changes.
- [x] Load component/security references; implement guarded API connection.
- [x] Create and review additive migration, then apply only to AppbassBeta.
- [x] Implement validated authenticated storage, account isolation and conflict handling.
- [x] Integrate cloud loading/saving with truthful UI and explicit local import.
- [x] Test wrong-database refusal, migration repeatability, anonymous HTTP rejection,
  account isolation, parallel client write queues, stale SQL versions, blocked storage
  and save failures. Cross-connection SQL stress testing not claimed.
- [x] Validate unit tests, types, build and desktop/mobile browser flows.
- [x] Record actual migration verification; never label a local mock as real SQL proof.
- [x] Mark Ready for Validation; invoke azure-validate. Local checks passed;
  Linux Docker build remains gated in GitHub CI before any authorized publication.

### 8. Files to prepare after approval

Versioned SQL migration in infra, guarded helper in lib, authenticated routes in
app/api, learning persistence adapter and relevant public UI modules, migration/test
scripts and documentation. Preserve existing credentials and unrelated user changes.

### 9. Current status and rollback

Approved for additive changes exclusively in AppbassBeta. No publication requested.
Research: azure-prepare SQL SDK/auth, security, Node runtime and AZCLI references read.
Existing credentials are reused without changing server authentication, roles or network;
switching shared server authentication would violate the user's explicit exclusion.
Implementation completed locally, including guided maps, five strings and workshop.
36 unit tests, TypeScript and final production build pass. Browser coverage includes
real anonymous endpoint rejection and mocked cloud-save/reload/error/import flows.
The database migration is applied, but the new API/UI is not yet published.

### 7. Validation Proof — AppbassBeta learning storage, 2026-10-09

- `scripts/with-beta-sql.ps1 -Action learning-migrate`: real Azure SQL migration
  succeeded, all five new tables verified, second run succeeded. Only AppbassBeta
  targeted; additive field on the new daily table, no existing-user schema/data changes.
- `scripts/with-beta-sql.ps1 -Action learning-integration`: real SQL service tests
  passed twice, including latest exact-server guard. Fixtures were uncommitted within
  one transaction, fully rolled back; post-rollback fixture count zero. No real students
  changed. Verifies per-account isolation, stale version rejection, duplicate event
  suppression and reversible unit/daily self-evaluation. No orchestra connection/query.
- `node --test tests/study.test.mjs tests/repertoire.test.mjs tests/harmony.test.mjs
  tests/course-ui.test.mjs tests/atlas.test.mjs tests/learning.test.mjs tests/learning-db.test.mjs`:
  36/36 passed. Includes refusal before connection, pool mismatch cleanup, session
  cancellation, parallel client write queue/version merge and explicit account-only import.
- `corepack pnpm exec tsc --noEmit --incremental false`: exit 0.
- `corepack pnpm build:azure`: final package exit 0; learning-store and help modules
  match source by SHA256. Node runtime tested locally; no credentials included.
- `APPBASS_TEST_URL=http://127.0.0.1:3105 corepack pnpm exec playwright test`:
  final package 26/26 passed (42.9s). Authenticated UI uses mocked APIs, not live SQL;
  real anonymous /api/learning GET/POST return 401 with no-store, without SQL access.
  Separate real SQL service tests above. No automated execution grading.
- `git diff --check`: clean. `git ls-files docs`: empty; Docker excludes private docs,
  secrets, local outputs and tsbuildinfo. Unrelated tsconfig.tsbuildinfo preserved.
- `az account show --query '{name:name,id:id}' -o json`: approved subscription matches.
  `az version -o json`: Azure CLI 2.87.0. No subscription, role or resource updates.
- Static review of deployment workflow: GitHub builds image/tests and updates ONLY
  Container App image via OIDC. Existing secrets retained. No Bicep or migration in CI.
  Existing infra/identity/RBAC unchanged; no new service-to-identity relationships.
- Provisioning quotas, ARM template validation/what-if and provisioning-policy checks
  N/A: zero resources, no template/role/network/SKU changes in this release.
- Docker executable is unavailable locally. Final Linux container build is pending
  the existing GitHub CI gate when publication is authorized. Do not mark this release
  Deployed or claim that browser mock tests prove live authenticated API integration.

azure-validate reviewed the approved plan and AZCLI recipe, current CLI context,
static unchanged role/identity declarations, Dockerfile/lockfile/context and existing
CI image-only gate. Re-ran guard/storage unit tests (5/5), types and diff checks after
the Ready for Validation handoff. Full status remains Ready for Validation rather than
Validated: Docker gate is pending; no deployment, commit or push was authorized or run.

Rollback: use previous app image while leaving additive tables/data intact. Do not
drop tables or reset students' records. Earlier deployment evidence follows unchanged.

## 7. Validation Proof — first tour and avatar, 2026-10-07 Argentina

User explicitly authorized implementation and direct publication. Existing CI/CD
recipe and approved subscription d8a9c4b4-89a1-482d-88dd-ac38d3d289a1, Brazil South.
- [x] All validation checks pass:
  - `node --test tests/study.test.mjs tests/repertoire.test.mjs tests/harmony.test.mjs tests/course-ui.test.mjs tests/atlas.test.mjs`: 28/28 passed.
  - `corepack pnpm exec tsc --noEmit --incremental false`: exit 0.
  - `corepack pnpm build:azure`: final package exit 0; all seven public files
    verified byte-identical to the build by SHA-256.
  - Final local production browser suite: 21/21 passed (24.6s), API mocks only.
    Verifies mobile profile access, venues and musical titles, avatar settings,
    profile/map synchronization, reload/account isolation, blocked storage,
    successful-save-only travel, failed saves, no fake motion on initial load,
    and existing theory, repertoire, accounts and course flows.
  - Mobile/desktop screenshots inspected; final avatar avoids lesson-label overlap.
  - `git diff --check` clean; docs remain ignored and untracked.
  - Azure CLI/authentication confirmed; appbass / rg-appbass-prod / Brazil South,
    identity None; existing SQL secret name retained, values never accessed.
  - Existing deployment ServicePrincipal Contributor at resource-group scope verified.
  - Static RBAC review: no new identities, permissions, resources or SQL operations.
  - Dockerfile/lockfile and workflow reviewed: CI repeats 28 tests, typecheck and
    build before an image-only update. Local Docker build delegated to that gate.
  - Bicep compilation, what-if, provisioning quotas/policy and ACR identity checks
    are N/A: no infrastructure, scale, tier, budget, network or schema changes.

Scope: 40 unique imaginary venues, original SVG scenes and male/female avatars,
electric bass or double bass, four accent colors and optional travel animation.
Visual settings are local per account/browser, explicitly not cross-device.
Existing SQL lesson IDs/completion/points remain untouched. Animation honors
reduced motion and waits until the new progress is saved and the map is visible.
Concluding concerts/rewards are clearly labelled Coming soon and not enabled.
No additional services or billing configuration changes. Exclude tsconfig.tsbuildinfo.

Publication verified 2026-10-08 01:54 UTC (2026-10-07 Argentina):
- Code/image commit 15d10416466447167b8ba197f9f80504ebccd4e3.
- GitHub Actions run 37714911426 succeeded; deploy job 1m56s, Docker validation passed.
- appbass--0000016 Healthy and latest ready revision; receives 100% of latest traffic.
- Public endpoint browser suite: 21/21 passed (1.2m), including mobile avatar/profile,
  venue coverage, appearance/account isolation and travel after successful mocked
  saves. APIs mocked: no registration, production user changes or SQL writes.
- Separate real anonymous /api/auth/me: HTTP 200.
- Existing SQL secret name and identity None retained; ServicePrincipal Contributor
  verified again after deployment. No infrastructure or database changes.
- Endpoint: https://appbass.whiteground-636d0547.brazilsouth.azurecontainerapps.io/appbass.html#curso

## 7. Validation Proof — atlas, theory and listening, 2026-10-07

User approved publication of the pending local changes. Existing GitHub Actions
CI/CD recipe; same confirmed subscription and Brazil South Container App.
- [x] All validation checks pass:
  - Azure CLI installed and authenticated; `az account show` confirms subscription
    d8a9c4b4-89a1-482d-88dd-ac38d3d289a1.
  - `node --test tests/study.test.mjs tests/repertoire.test.mjs tests/harmony.test.mjs tests/course-ui.test.mjs tests/atlas.test.mjs`: 26/26 passed again in this publication turn.
  - `corepack pnpm exec tsc --noEmit --incremental false`: exit 0.
  - `corepack pnpm build:azure`: final production build exit 0 in preceding turn;
    all ten changed public files match that build by SHA-256, checked again now.
  - Final-package local browser suite: 19/19 passed (20.4s), API mocks only.
    Includes audible Joplin playback, transposed staff/maps/audio, specific theory,
    mobile overflow, daily challenge opt-in/sharing and existing course/account flows.
  - `git diff --check`: clean; `/docs` ignored and no tracked source documents.
  - Dockerfile/lockfile reviewed: CI repeats all 26 unit tests, typecheck and build.
    Container build delegated to the existing CI gate before image update.
  - Static RBAC review: no infrastructure, identity, permission or SQL changes.
  - `az containerapp show`: Brazil South, identity None; existing SQL secret name
    retained, values not accessed. Deployment ServicePrincipal Contributor role
    verified at existing resource-group scope with `az role assignment list`.
  - Workflow updates ONLY image via OIDC. No Bicep deployment, migrations, new
    resources, scale/tier, budget or policy changes. Template compilation, what-if,
    provisioning quotas and ACR identity propagation are N/A for this release.

Scope: 31 scale and 16 arpeggio families in all pitch classes with enharmonic
spellings, independent teaching notes and tonic-specific examples, optional local
daily challenge and share link, full original MIDI piano listening separate from
bass reduction. Existing licenses/assets retained. Avatar/concert gamification is
discussion only, not part of this publication. Exclude unrelated tsconfig.tsbuildinfo.

Publication verified 2026-10-08 01:19 UTC (2026-10-07 Argentina):
- Code/image commit: 616998e259532ce235bc28cfa8700f84c893b1c1.
- GitHub Actions run 37712061507 succeeded; deploy job 1m47s, including Docker
  unit tests, typecheck and build before the image-only update.
- appbass--0000015 Healthy / Provisioned and latest ready revision; latest receives
  100% of traffic. Initial readiness lag resolved without configuration changes.
- Public endpoint browser suite: 19/19 passed (44.7s); original MIDI audio,
  transposition, theory, daily challenge, course and account UI verified with API
  mocks. No production SQL writes or registration performed.
- Separate real anonymous /api/auth/me: HTTP 200.
- Identity None, existing SQL secret name retained; deployment ServicePrincipal
  Contributor confirmed after publication. No resources, permissions or SQL changes.
- Endpoint: https://appbass.whiteground-636d0547.brazilsouth.azurecontainerapps.io/appbass.html#escalas

## 7. Validation Proof — course journey and inline reading, 2026-10-07

User approved publication. Same subscription, region and image-only deployment recipe.
Release: separate 40-lesson journey from the 16-unit harmony laboratory; responsive
neon map/list, real persisted completion marker, inline scores grouped with reading
prompts and expandable solutions. Complementary lesson theory is optional.
- [x] All 20 unit tests passed, including score/asset references for all 40 lessons.
- [x] `corepack pnpm exec tsc --noEmit --incremental false`: exit 0.
- [x] `corepack pnpm build:azure`: exit 0 in preceding implementation turn.
  All six changed public UI files match the built package by SHA-256, rechecked before push.
- [x] Final local production browser suite: 14/14 passed (19.2s), API mocks only;
  mobile/desktop navigation, real-save-shaped progress, reload/logout, scores and overflow.
- [x] Desktop/mobile screenshots inspected; source documents remain excluded.
- [x] `git diff --check`: clean; Docker repeats 20 unit tests, typecheck and production build.
- [x] Live subscription matches approved target; appbass / Brazil South, identity None;
  existing SQL secret name retained, values not accessed.
- [x] Deployment ServicePrincipal Contributor role verified. No role or infrastructure changes.
- [x] Workflow reviewed: push to main publishes GHCR image and updates only Container App image.
No new resources, tier/budget changes, schema migrations or production SQL writes.
Infrastructure what-if, provisioning quotas and ACR identity checks are not applicable.
Excluded unrelated tracked tsconfig.tsbuildinfo.
Publication verified 2026-10-07:
- Commit/image fa7c03790cc53460706a1029605836ba99e6943e; Actions run 37684439941 succeeded.
- appbass--0000014 Healthy, latest ready revision; receives 100% of traffic.
- Public endpoint browser suite: 14/14 passed (33.7s), including course map, inline
  scores, mobile overflow and persisted-save-shaped progress. APIs mocked: no SQL writes.
- Real anonymous /api/auth/me: HTTP 200. Identity None and existing SQL secret name retained.
- Endpoint: https://appbass.whiteground-636d0547.brazilsouth.azurecontainerapps.io/appbass.html#curso

## Bibliography UI removal — validation proof, 2026-10-07

User approved publication of the removal of "Enfoque pedagógico y bibliografía".
Only the public UI changes; lesson content and internal source metadata remain intact.
- [x] `node --check public/harmony-ui.mjs`: exit 0.
- [x] All 17 unit tests passed; TypeScript check with `--incremental false`: exit 0.
- [x] `corepack pnpm build:azure`: exit 0 with required local filesystem permissions.
  Initial sandbox build failed on Nitro dependency tracing (EPERM), resolved by retry.
- [x] `git diff --check`: clean. Existing Dockerfile repeats tests, typecheck and build in CI.
- [x] Azure subscription matches approved target; appbass is in Brazil South with identity None.
- [x] Existing deployment ServicePrincipal Contributor role verified; no RBAC changes.
- [x] Workflow reviewed: push to main updates only the image, retaining runtime secrets.
Infrastructure compilation, what-if and provisioning checks are N/A: no infrastructure changes.
Excluded unrelated generated tsconfig.tsbuildinfo from the commit.
Publication verified: commit 77d07f41ef15a20a8749e0041ed424817a7c9d5d;
GitHub Actions run 37670847684 completed successfully. Azure latest ready revision
appbass--0000013 receives 100% of traffic. Live Edge/Playwright browser check passed:
harmony course heading visible and `.harmony-sources` absent. No database or infrastructure changes.

## Approved target

- Subscription: d8a9c4b4-89a1-482d-88dd-ac38d3d289a1 (hunters_killer@hotmail.com).
- Container App: appbass, resource group rg-appbass-prod, Brazil South.
- Existing Consumption environment, 0–1 replicas. No new resources or tier changes.
- Registry: ghcr.io/aravenacg/bassapp; immutable sha-<full commit> tags.
- Database: AppbassBeta, existing sqldb-orquestaoesat, RG oesatgroup, East US Basic.
- Explicitly excluded: all writes to UsuariosOESAT.
- Existing USD20 budget scoped to rg-appbass-prod does not cover SQL in oesatgroup. This release changes neither budget nor billing configuration.

## Release scope

### Harmony learning expansion — 2026-10-07

Mode MODIFY. Keep Node/static ES modules, current Container App and SQL unchanged.
User-supplied local program/guide and two theory PDFs inform an original bass-oriented
curriculum. Preserve the five axes: intervals/chords, tonal function, cadences,
voice leading/walking and inversions. Add prerequisite vocabulary, sevenths and
major/minor ii–V–I bridges. Explicitly distinguish classical four-part conventions
from jazz bass practice. Do not redistribute source PDFs or their diagrams/audio.

Implementation plan (authorized by user's continuation):
- [x] Inspect existing 40-lesson course, program, guide and relevant PDF chapters.
- [x] Exclude /docs from Git and Docker build context; existing files are untracked.
- [x] Create progressive original theory units with explanations, worked examples,
  listening demonstrations, bass exercises, contextual cautions and unit-specific quizzes.
- [x] Integrate a visible learning route within Mi curso and theory into related lessons;
  retain existing lesson IDs, completion states and SQL schema.
- [x] Verify source confidentiality, curriculum prerequisites, examples, desktop/mobile
  navigation, quizzes and audio; run unit tests, typecheck and production build.
- [x] azure-validate then azure-deploy: commit/push existing CI/CD, verify public release.

Budget/scale: existing beta, <=20 users; zero additional resources or services.
Subscription/region: previously user-confirmed target below, unchanged. Resource
inventory for provisioning: none. Quota/policy provisioning checks N/A; no new
architecture, roles, identities, network access or migration. Existing 100-point
lesson progress remains intact; new reading/quiz content does not award extra points.
Source files remain local only. Public curriculum is authored independently; no
verbatim chapters, copied exercises, pages, PDFs or embedded source recordings.

### Validation proof — harmony expansion, 2026-10-07

- `node --test tests/study.test.mjs tests/repertoire.test.mjs tests/harmony.test.mjs`:
  17/17 passed, including content structure, prerequisites, musical examples,
  cancellable audio, source exclusions and existing repertoire tests.
- `corepack pnpm exec tsc --noEmit --incremental false`: exit 0.
- `corepack pnpm build:azure`: exit 0; production Node package built successfully.
- `APPBASS_TEST_URL=http://127.0.0.1:3102 corepack pnpm exec playwright test`:
  11/11 passed (14.1s). Checks all 16 units at mobile width, per-unit quizzes,
  completion gate, account isolation, blocked/malformed storage, audio start/stop,
  linked lessons/practice, existing account/tour/player flows (mock APIs, no SQL writes).
- Desktop/mobile screenshots inspected locally: readable text, controls and examples,
  no horizontal overflow. `app.js?v=5` cache-busting reference reviewed after tests;
  underlying tested JS unchanged. CI will build the final HTML with that reference.
- `git diff --check`: clean. `git check-ignore` confirms all four /docs files ignored;
  `git ls-files docs`: empty. Docker excludes docs and local extraction tooling/outputs.
- `az account show`: approved subscription d8a9c4b4-89a1-482d-88dd-ac38d3d289a1.
- `az containerapp show`: appbass / rg-appbass-prod / Brazil South; identity None;
  existing SQL secret name preserved (values never accessed).
- `az role assignment list`: existing ServicePrincipal Contributor role, unchanged.
- Static role/infrastructure review: no new resources, data access, identities or
  permissions. What-if, Bicep compilation/provisioning quotas are N/A to this release.
- Dockerfile/lockfile reviewed. GitHub CI runs all 17 unit tests, typecheck and Docker
  production build before the image update. Local Docker build is delegated to CI.
- 16 original units, 32 questions and 16 synthesized examples, related to 31 of the
  existing 40 lessons. Other lessons and all existing PDF assets remain unchanged.
- New review progress explicitly browser-local by account; existing SQL lesson
  completion/points untouched. No claims of automated instrumental evaluation.

Publication verified 2026-10-07:
- Code/image commit 632eb168f97d70ed82b1baac5769acfbd660f2c7, pushed to main.
- GitHub Actions run 37621635633 succeeded (1m45s), including Docker build/tests.
- appbass--0000012 Healthy and latest ready revision; latest receives 100% traffic.
- Public URL browser suite: 11/11 passed (19.6s), including all 16 units on mobile.
  Authentication interactions use mock APIs, without production SQL writes.
- Real anonymous /api/auth/me HTTP 200; /harmony-curriculum.mjs and /harmony.css HTTP 200.
- /docs/armonia-vol-1-def-v3.pdf HTTP 404; original source docs absent from Git/build.
- Existing SQL secret name and identity configuration preserved, no infrastructure changes.
- Endpoint: https://appbass.whiteground-636d0547.brazilsouth.azurecontainerapps.io/appbass.html#curso

Current release: guided help/tour, louder practice audio, four original sample-backed
studies, six traceable beta repertoire entries (two playable Joplin reductions and
four Morton external score references), audio mix modes and harmonic neon colors.
No SQL, identity, infrastructure, budget or tier changes.

See beta-improvements-plan.md: accounts/profile, isolated persistent progress and activity,
in-app reminders, original practice catalog and synchronized audio/visuals, course UX.
Email delivery remains deferred. No new paid services.

## Deployment recipe

Existing GitHub Actions on push to main. Docker runs unit tests and TypeScript validation.
GitHub OIDC logs into Azure, then ONLY updates the Container App image.
Do not redeploy Bicep during code releases: doing so previously removed runtime secrets.
SQL connection retained in the existing Container App secret, never exported to GitHub.

infra/appbass-beta-v2.sql is additive and guarded by DB_NAME. Applied and verified in
AppbassBeta before release. Existing credentials and user data preserved.

## Validation checklist

- [x] Additive migration verified (four new tables).
- [x] SQL-backed temporary-account integration: registration/invite concurrency, duplicate progress, isolation, journal, profile, password change, reminder, logout.
- [x] Temporary integration users/invitation/activity removed.
- [x] Final unit tests (5/5) and TypeScript validation.
- [x] Final Node production build (exit 0).
- [x] Browser tests desktop/mobile (4/4), actual loop tempo increment and lesson navigation.
- [x] Live target matches approved subscription/region. SQL secret retained. No managed identity is used by the application; SQL uses the existing scoped connection. Deployment service principal has Contributor on the resource group; prior OIDC pipeline succeeded.
- [x] GitHub pipeline 37558924199 succeeded; image sha-94de70a3bf31b6d9fa7b88077c9f97d8a450078a.
- [x] Revision appbass--0000010 active and Healthy; live browser checks 4/4 (API mocks), plus separate real SQL/API integration passed against the public URL. All temporary accounts/activity/invitation removed.

Published endpoint: https://appbass.whiteground-636d0547.brazilsouth.azurecontainerapps.io/
Verified 2026-10-07 UTC (2026-10-06 Argentina). No runtime secrets or infrastructure tiers changed.

Infrastructure what-if/quota provisioning checks do not apply: image-only update of
existing resources, no infrastructure declaration or role assignment changes.

## Rollback

Update appbass image to prior known-good SHA tag. Keep additive database fields/tables;
do not drop data. Preserve all environment settings and secrets.

## 7. Validation Proof — repertoire release, 2026-10-07 02:57 UTC

Recipe: existing GitHub Actions CI/CD, Azure CLI image-only update.

- [x] All validation checks pass:
  - `node --test tests/study.test.mjs tests/repertoire.test.mjs`: 12/12 passed.
  - `corepack pnpm exec tsc --noEmit --incremental false`: exit 0.
  - `corepack pnpm build:azure`: exit 0; final package includes MIDI-60 sample root.
  - `APPBASS_TEST_URL=http://127.0.0.1:3101 corepack pnpm exec playwright test`:
    8/8 passed on freshly restarted production server (12.3 seconds).
  - Browser checks cover mobile CC0 sample decode/playback, repertoire, mix controls,
    existing accounts with mocked APIs, help tour, loops, registration layout and lessons.
  - Desktop visual inspection passed. Piano sample pitch checked: ~260.87 Hz, MIDI 60.
  - SHA-256 asset verification passes; .gitattributes preserves downloaded bytes.
  - `git diff --check`: no whitespace errors.
  - `az account show`: confirmed user-approved subscription d8a9c4b4-89a1-482d-88dd-ac38d3d289a1.
  - `az containerapp show`: appbass / rg-appbass-prod / Brazil South; identity None;
    existing SQL secret name preserved. No secret values accessed.
  - `az role assignment list --resource-group rg-appbass-prod`: existing deployment
    service principal has Contributor at resource-group scope. No new assignments needed.
  - Dockerfile and lockfile reviewed; CI runs the same tests, typecheck and production
    build before updating the image. Local Docker build deferred to that CI gate.
  - Static RBAC/infra review: no changes to Bicep, identities or service integrations.
    Template validation, what-if, provisioning quotas and new-policy checks are N/A
    to this image-only update. No ACR or managed-identity SQL flow is used.

Deployment must preserve the existing Container App configuration; no Bicep apply.
Post-push verification completed 2026-10-07 UTC:

- Commit/image: 227b5810cb013f5da23fe857ea3aa1150c74e24c.
- GitHub Actions run 37564496323: succeeded (1m41s), including Docker tests/build.
- Revision appbass--0000011: Healthy; latest revision receives 100% of ingress traffic.
- Public endpoint browser suite: 8/8 passed (23.1s), including CC0 decode/playback.
  API mocked for account interactions: these tests did not write production SQL.
- Separate real anonymous `/api/auth/me`: HTTP 200 (not a SQL write/integration test).
- Live identity remains None; existing SQL secret name retained. No provisioning,
  RBAC, database, budget or tier changes. Existing deployment Contributor role verified.
- Downloaded assets preserve original bytes and documented licensing/provenance.
- Remaining content work: the four Morton entries are source references, not playable
  bass transcriptions. Joplin uses explicitly labeled automatic didactic reductions.
