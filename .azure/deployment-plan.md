# Azure Deployment Plan

> **Status:** Awaiting approval for beta authentication/data integration

Generated: 2026-10-06

## 1. Project Overview

**Goal:** Preparar el despliegue de Appbass en Azure Container Apps y automatizarlo mediante commits a GitHub; integrar una beta aislada de autenticación, progreso, puntos y referidos en `AppbassBeta` sin modificar `UsuariosOESAT`.

**Path:** Modernize Existing

## 2. Requirements

| Attribute | Value |
|-----------|-------|
| Classification | Development / beta pública pequeña |
| Scale | Small (<1K users) |
| Budget | Cost-Optimized; Container Apps Consumption con escala a cero, objetivo <= USD 10/mes |
| Subscription | `d8a9c4b4-89a1-482d-88dd-ac38d3d289a1` (`hunters_killer@hotmail.com`) |
| Location | Brazil South (`brazilsouth`) |
| App name | `appbass` (App Service name; se verificará disponibilidad global) |
| Resource group | `rg-appbass-prod` |
| Monthly budget | USD 20, scoped to `rg-appbass-prod` |
| Budget alert | 80% and 100%, `hunters_killer@hotmail.com`, `cristian.g.aravena@gmail.com` |

## 3. Components Detected

| Component | Type | Technology | Path |
|-----------|------|------------|------|
| web | SSR web app + API | Next.js 16 / React 19 / Node.js 22 | `app/`, `public/` |
| progress | API | Next route handler, actualmente dependiente de D1/Sites | `app/api/progress/`, `lib/`, `db/` |
| database migrations | Data layer | Drizzle | `drizzle/`, `db/` |

El README indica que una migración de solo frontend no conserva progreso ni puntos. Esta preparación hospeda el sitio; la compatibilidad completa de `/api/progress` con Azure requiere migrar D1 y la identidad de Sites.

## 4. Recipe Selection

**Selected:** Bicep + GitHub Actions

**Rationale:** Es una aplicación existente con un único App Service y un flujo explícito basado en commits. Bicep mantiene la infraestructura declarativa y GitHub Actions ejecutará el build/deploy sin guardar credenciales en el repositorio.

## 5. Architecture

**Stack:** Container Apps Consumption

| Component | Azure Service | SKU |
|-----------|---------------|-----|
| web | Azure Container Apps + managed environment | Consumption, 0–1 replicas |

La aplicación se desplegará como aplicación Node.js empaquetada, con `npm start` ejecutando el servidor. El plan F1 no ofrece garantías de producción, escalado, slots ni disponibilidad empresarial.

## 6. Provisioning Limit Checklist

| Resource Type | Number to Deploy | Total After Deployment | Limit/Quota | Notes |
|---------------|------------------|------------------------|-------------|-------|
| `Microsoft.App/managedEnvironments` | 1 | 1 planned | Container Apps regional capacity | Consumption, Brazil South |
| `Microsoft.App/containerApps` | 1 | 1 planned | Container Apps regional capacity | 0–1 replicas |
| `Microsoft.Consumption/budgets` | 1 | 1 planned | One subscription budget with resource-group filter | USD 20/month |

**Quota validation:** Container Apps is available in Brazil South. Consumption uses per-second billing, supports scale-to-zero, and includes monthly free grants; final deployment validation must confirm provider registration and regional capacity.

**Policy constraints:** The subscription currently exposes the built-in Azure Security Center policy assignment. No allowed-location or required-tag policy was returned by the policy query.

## 7. Execution Checklist

### Phase 1: Planning
- [x] Analyze workspace
- [x] Gather requirements
- [x] Confirm subscription and location
- [x] Prepare resource inventory
- [x] Check quota/provider constraints
- [x] Scan codebase
- [x] Select recipe
- [x] Plan architecture
- [x] User approved this plan

### Phase 2: Execution
- [x] Generate Bicep infrastructure
- [x] Generate GitHub Actions workflow
- [x] Configure dedicated resource group, tags and budget alert
- [x] Resolve Node/Nitro container runtime for the Cloudflare/Sites worker output
- [x] Configure Container Apps runtime and startup command
- [x] Add deployment documentation and required GitHub secrets
- [x] Update plan to Ready for Validation

## 8. Files to Generate

| File | Purpose | Status |
|------|---------|--------|
| `.azure/deployment-plan.md` | Deployment source of truth | ✅ |
| `infra/main.bicep` | Resource group, App Service plan, site and budget | ✅ |
| `.github/workflows/deploy-azure.yml` | Deploy on commit to main | ✅ |
| `azure.yaml` | Optional local AZD metadata | ⏳ |

## 9. Next Steps

1. Obtener aprobación de este plan.
2. Generar Bicep y workflow de GitHub Actions.
3. Validar infraestructura y configuración.
4. Crear los recursos y configurar el secreto de despliegue en GitHub.

## 10. Beta integration plan (requires approval)

The next phase will use only `AppbassBeta` and will not modify `UsuariosOESAT`.

1. Create isolated tables for users, invite codes, sessions, lesson progress, points and referrals.
2. Implement email/password registration with Argon2id or bcrypt password hashes.
3. Implement administrator-issued invite codes with expiration, usage limits and audit fields.
4. Add secure HttpOnly/Secure/SameSite sessions and authorization checks.
5. Migrate the progress API from D1/Sites identity to SQL Server, preserving idempotency per user.
6. Add referral and points endpoints with validation against self-referrals and duplicate awards.
7. Store the SQL connection string only as an Azure Container Apps secret or Key Vault secret.
8. Add automated tests and deploy through the existing GitHub Actions workflow.
9. Create a subscription-level or `oesatgroup` budget because the existing `rg-appbass-prod` budget does not cover this database.

No migration or write operation against `UsuariosOESAT` is included.
