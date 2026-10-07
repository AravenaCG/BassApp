# Appbass — deployment plan

Status: Validated — remove visible bibliography section; azure-validate, existing CI/CD image-only release.
Updated: 2026-10-07.

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
Exclude unrelated generated tsconfig.tsbuildinfo from the commit. Post-push verification pending.

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
