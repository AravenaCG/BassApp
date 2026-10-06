param location string = 'brazilsouth'
param appName string = 'appbass'
param imageName string = 'ghcr.io/aravenacg/bassapp:latest'
param budgetAmount int = 20
param budgetStartDate string = utcNow('yyyy-MM-01T00:00:00Z')
param alertEmails array = [
  'hunters_killer@hotmail.com'
  'cristian.g.aravena@gmail.com'
]
param tags object = {
  app: 'appbass'
  environment: 'production'
  managedBy: 'bicep'
  owner: 'hunters-killer'
  costCenter: 'appbass'
}

resource environment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${appName}-env'
  location: location
  tags: tags
  properties: {}
}

resource app 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: appName
          image: imageName
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        rules: [
          {
            name: 'http-scale'
            http: {
              metadata: {
                concurrentRequests: '20'
              }
            }
          }
        ]
      }
    }
  }
}

resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: '${appName}-monthly-budget'
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: budgetStartDate
    }
    notifications: {
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

output defaultHostName string = app.properties.configuration.ingress.fqdn
