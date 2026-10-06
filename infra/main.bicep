targetScope = 'subscription'

@description('Azure region for all resources.')
param location string = 'brazilsouth'
@description('Dedicated resource group for Appbass.')
param resourceGroupName string = 'rg-appbass-prod'
@description('Globally unique App Service name.')
param appServiceName string = 'appbass'
@description('Monthly budget in USD.')
param budgetAmount int = 20
@description('Budget alert recipient.')
param alertEmails array = [
  'hunters_killer@hotmail.com'
  'cristian.g.aravena@gmail.com'
]
@description('Start date for the monthly budget period.')
param budgetStartDate string = utcNow('yyyy-MM-01T00:00:00Z')

var tags = {
  app: 'appbass'
  environment: 'production'
  managedBy: 'bicep'
  owner: 'exisoft'
  costCenter: 'appbass'
}

resource appResourceGroup 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module app './appservice.bicep' = {
  name: 'appbass-appservice'
  scope: appResourceGroup
  params: {
    location: location
    appServiceName: appServiceName
    tags: tags
  }
}

resource monthlyBudget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: 'appbass-monthly-budget'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: budgetStartDate
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
    filter: {
      dimensions: {
        name: 'ResourceGroupName'
        operator: 'In'
        values: [resourceGroupName]
      }
    }
  }
}

output resourceGroupName string = resourceGroupName
output appServiceName string = appServiceName
output defaultHostName string = app.outputs.defaultHostName
