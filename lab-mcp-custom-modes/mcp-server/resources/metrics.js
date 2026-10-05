/**
 * Metrics Resource Provider for MCP Server
 * Provides access to system metrics and monitoring data
 */

const metricsResources = {
  name: 'metrics',
  description: 'Access to system metrics and monitoring data',
  
  resources: [
    {
      uri: 'metrics://system/cpu',
      name: 'CPU Metrics',
      description: 'Current CPU usage metrics',
      mimeType: 'application/json',
      handler: async () => {
        return {
          contents: JSON.stringify({
            timestamp: new Date().toISOString(),
            cpu: {
              usage: 45.2,
              cores: 8,
              loadAverage: [2.1, 1.8, 1.5]
            }
          }, null, 2)
        };
      }
    },
    {
      uri: 'metrics://system/memory',
      name: 'Memory Metrics',
      description: 'Current memory usage metrics',
      mimeType: 'application/json',
      handler: async () => {
        return {
          contents: JSON.stringify({
            timestamp: new Date().toISOString(),
            memory: {
              total: 16384,
              used: 8192,
              free: 8192,
              usagePercent: 50.0
            }
          }, null, 2)
        };
      }
    },
    {
      uri: 'metrics://application/requests',
      name: 'Application Request Metrics',
      description: 'API request metrics',
      mimeType: 'application/json',
      handler: async () => {
        return {
          contents: JSON.stringify({
            timestamp: new Date().toISOString(),
            requests: {
              total: 15420,
              successful: 15200,
              failed: 220,
              averageResponseTime: 125,
              requestsPerSecond: 42.5
            }
          }, null, 2)
        };
      }
    }
  ],
  
  listResources: async () => {
    return metricsResources.resources.map(r => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType
    }));
  },
  
  readResource: async (uri) => {
    const resource = metricsResources.resources.find(r => r.uri === uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }
    return await resource.handler();
  }
};

module.exports = metricsResources;