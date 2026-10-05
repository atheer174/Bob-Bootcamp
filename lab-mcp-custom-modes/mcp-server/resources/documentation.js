/**
 * Documentation Resource Provider for MCP Server
 * Provides access to documentation and knowledge base
 */

const documentationResources = {
  name: 'documentation',
  description: 'Access to project documentation and knowledge base',
  
  resources: [
    {
      uri: 'doc://api/overview',
      name: 'API Documentation Overview',
      description: 'Overview of the API documentation',
      mimeType: 'text/markdown',
      handler: async () => {
        return {
          contents: `# API Documentation

## Overview
This is the main API documentation for our services.

## Available Endpoints
- /api/users - User management
- /api/products - Product catalog
- /api/orders - Order processing

## Authentication
All API requests require Bearer token authentication.
`
        };
      }
    },
    {
      uri: 'doc://architecture/overview',
      name: 'Architecture Documentation',
      description: 'System architecture documentation',
      mimeType: 'text/markdown',
      handler: async () => {
        return {
          contents: `# System Architecture

## Components
- Frontend: React application
- Backend: Node.js microservices
- Database: PostgreSQL
- Cache: Redis
- Message Queue: RabbitMQ

## Deployment
Applications are deployed using Kubernetes on AWS EKS.
`
        };
      }
    }
  ],
  
  listResources: async () => {
    return documentationResources.resources.map(r => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType
    }));
  },
  
  readResource: async (uri) => {
    const resource = documentationResources.resources.find(r => r.uri === uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }
    return await resource.handler();
  }
};

module.exports = documentationResources;