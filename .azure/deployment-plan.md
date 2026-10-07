# Appbass — deployment plan

Status: Deployed and verified through azure-validate / azure-deploy, existing CI/CD recipe.
Updated: 2026-10-07.

## Approved target

- Subscription: d8a9c4b4-89a1-482d-88dd-ac38d3d289a1 (hunters_killer@hotmail.com).
- Container App: appbass, resource group rg-appbass-prod, Brazil South.
- Existing Consumption environment, 0–1 replicas. No new resources or tier changes.
- Registry: ghcr.io/aravenacg/bassapp; immutable sha-<full commit> tags.
- Database: AppbassBeta, existing sqldb-orquestaoesat, RG oesatgroup, East US Basic.
- Explicitly excluded: all writes to UsuariosOESAT.
- Existing USD20 budget scoped to rg-appbass-prod does not cover SQL in oesatgroup. This release changes neither budget nor billing configuration.

## Release scope

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
