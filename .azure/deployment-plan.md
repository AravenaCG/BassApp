# Azure Deployment Plan

> **Status:** Ready for Validation

Generated: 2026-10-06

## 1. Project Overview

**Goal:** Preparar el despliegue de Appbass en Azure App Service y automatizarlo mediante commits a GitHub.

**Path:** Modernize Existing

## 2. Requirements

| Attribute | Value |
|-----------|-------|
| Classification | Development / beta pública pequeña |
| Scale | Small (<1K users) |
| Budget | Cost-Optimized; App Service F1 confirmado, objetivo <= USD 10/mes |
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

**Stack:** App Service

| Component | Azure Service | SKU |
|-----------|---------------|-----|
| web | App Service Linux + App Service Plan | F1 Free |

La aplicación se desplegará como aplicación Node.js empaquetada, con `npm start` ejecutando el servidor. El plan F1 no ofrece garantías de producción, escalado, slots ni disponibilidad empresarial.

## 6. Provisioning Limit Checklist

| Resource Type | Number to Deploy | Total After Deployment | Limit/Quota | Notes |
|---------------|------------------|------------------------|-------------|-------|
| `Microsoft.Web/serverfarms` | 1 | 1 planned | App Service plan subscription/service limit; no `Microsoft.Web` quota exposed by `az quota` | F1, Brazil South |
| `Microsoft.Web/sites` | 1 | 1 planned | App Service app subscription/service limit | Linux Node.js |
| `Microsoft.Consumption/budgets` | 1 | 1 planned | One subscription budget with resource-group filter | USD 20/month |

**Quota validation:** `az quota list` was attempted for `Microsoft.Web` in Brazil South; the Azure CLI requires the quota extension and cannot install it non-interactively in this environment. The App Service-specific quota is not exposed through the quota provider. The plan uses one F1 plan and one site, well below the documented App Service subscription limits; final deployment validation must confirm provider registration, policy, name availability, and SKU availability.

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
- [x] Resolve App Service runtime adapter for the Cloudflare/Sites worker output
- [ ] Configure App Service runtime and startup command
- [ ] Add deployment documentation and required GitHub secrets
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
