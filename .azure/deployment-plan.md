# Appbass — deployment plan

Status: Validated. User approved implementation and existing deployment workflow.
Updated: 2026-10-06.

## Approved target

- Subscription: d8a9c4b4-89a1-482d-88dd-ac38d3d289a1 (hunters_killer@hotmail.com).
- Container App: appbass, resource group rg-appbass-prod, Brazil South.
- Existing Consumption environment, 0–1 replicas. No new resources or tier changes.
- Registry: ghcr.io/aravenacg/bassapp; immutable sha-<full commit> tags.
- Database: AppbassBeta, existing sqldb-orquestaoesat, RG oesatgroup, East US Basic.
- Explicitly excluded: all writes to UsuariosOESAT.
- Existing USD20 budget scoped to rg-appbass-prod does not cover SQL in oesatgroup. This release changes neither budget nor billing configuration.

## Release scope

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
- [ ] GitHub pipeline succeeds, new revision healthy, live smoke test.

Infrastructure what-if/quota provisioning checks do not apply: image-only update of
existing resources, no infrastructure declaration or role assignment changes.

## Rollback

Update appbass image to prior known-good SHA tag. Keep additive database fields/tables;
do not drop data. Preserve all environment settings and secrets.
