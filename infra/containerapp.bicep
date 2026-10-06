param location string = 'brazilsouth'
param appName string = 'appbass'
param imageName string = 'ghcr.io/aravenacg/bassapp:latest'
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

output defaultHostName string = app.properties.configuration.ingress.fqdn
