param location string
param appServiceName string
param tags object
param budgetAmount int = 20
param alertEmails array = [
  'hunters_killer@hotmail.com'
  'cristian.g.aravena@gmail.com'
]

resource plan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${appServiceName}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: 'F1'
    tier: 'Free'
  }
  properties: {
    reserved: true
  }
  tags: tags
}

resource site 'Microsoft.Web/sites@2022-09-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node .output/server/index.mjs'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '0'
        }
      ]
    }
  }
  tags: tags
}

resource monthlyBudget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: 'appbass-monthly-budget'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: utcNow('yyyy-MM-01T00:00:00Z')
    }
    notifications: {
      forecasted80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: alertEmails
      }
      actual80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: alertEmails
      }
      actual100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        contactEmails: alertEmails
      }
    }
  }
}

output defaultHostName string = site.properties.defaultHostName
