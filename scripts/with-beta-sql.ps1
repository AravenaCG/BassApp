param([ValidateSet('migrate','serve','integration')][string]$Action='migrate')
$ErrorActionPreference='Stop'
$subscription='d8a9c4b4-89a1-482d-88dd-ac38d3d289a1'
# Capture only in memory. Never print or persist connection credentials.
$secretJson = & az containerapp secret list --name appbass --resource-group rg-appbass-prod --subscription $subscription --show-values --only-show-errors -o json
if ($LASTEXITCODE -ne 0) { throw 'Could not read the authorized Azure secret.' }
$connection = ($secretJson | ConvertFrom-Json | Where-Object { $_.name -eq 'azure-sql-connection-string' }).value
if (-not $connection) { throw 'SQL secret missing.' }
try {
  $env:AZURE_SQL_CONNECTION_STRING=$connection
  if ($Action -eq 'migrate') { & node scripts/beta-db.mjs }
  elseif ($Action -eq 'integration') { & node tests/beta-integration.mjs }
  else { $env:PORT='3100'; $env:HOST='127.0.0.1'; & node .output/server/index.mjs }
  if ($LASTEXITCODE -ne 0) { throw 'Beta operation failed.' }
} finally {
  Remove-Item Env:AZURE_SQL_CONNECTION_STRING -ErrorAction SilentlyContinue
  $connection=$null
  $secretJson=$null
}
