#!/usr/bin/env node

/**
 * Custom MCP Server for Bob AI Integration
 * 
 * This server implements the Model Context Protocol (MCP) to extend Bob's
 * capabilities with custom tools, resources, and integrations.
 * 
 * Features:
 * - JIRA integration
 * - Database queries
 * - Deployment automation
 * - Custom business logic
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

require('dotenv').config();
const winston = require('winston');

// Import tool implementations
const jiraTools = require('./tools/jira-tools');
const databaseTools = require('./tools/database-tools');
const deploymentTools = require('./tools/deployment-tools');

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * MCP Server Implementation
 */
class CustomMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'custom-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.tools = new Map();
    this.resources = new Map();
    this.setupHandlers();
    this.registerTools();
    this.registerResources();
  }

  /**
   * Setup MCP protocol handlers
   */
  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Listing available tools');
      return {
        tools: Array.from(this.tools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Execute tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info(`Executing tool: ${name}`, { args });

      const tool = this.tools.get(name);
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await tool.execute(args);
        logger.info(`Tool executed successfully: ${name}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, { error: error.message });
        throw error;
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.info('Listing available resources');
      return {
        resources: Array.from(this.resources.values()).map(resource => ({
          uri: resource.uri,
          name: resource.name,
          description: resource.description,
          mimeType: resource.mimeType,
        })),
      };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      logger.info(`Reading resource: ${uri}`);

      const resource = this.resources.get(uri);
      if (!resource) {
        throw new Error(`Unknown resource: ${uri}`);
      }

      try {
        const content = await resource.read();
        return {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType,
              text: content,
            },
          ],
        };
      } catch (error) {
        logger.error(`Resource read failed: ${uri}`, { error: error.message });
        throw error;
      }
    });
  }

  /**
   * Register all available tools
   */
  registerTools() {
    logger.info('Registering tools');

    // JIRA Tools
    this.registerTool({
      name: 'create_jira_ticket',
      description: 'Create a new JIRA ticket',
      inputSchema: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Project key' },
          summary: { type: 'string', description: 'Ticket summary' },
          description: { type: 'string', description: 'Ticket description' },
          issueType: { type: 'string', description: 'Issue type (Bug, Story, Task)' },
          priority: { type: 'string', description: 'Priority (High, Medium, Low)' },
        },
        required: ['project', 'summary', 'issueType'],
      },
      execute: jiraTools.createTicket,
    });

    this.registerTool({
      name: 'search_jira_tickets',
      description: 'Search for JIRA tickets using JQL',
      inputSchema: {
        type: 'object',
        properties: {
          jql: { type: 'string', description: 'JQL query string' },
          maxResults: { type: 'number', description: 'Maximum results to return' },
        },
        required: ['jql'],
      },
      execute: jiraTools.searchTickets,
    });

    // Database Tools
    this.registerTool({
      name: 'query_database',
      description: 'Execute a read-only database query',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'SQL query (SELECT only)' },
          database: { type: 'string', description: 'Database name' },
        },
        required: ['query'],
      },
      execute: databaseTools.executeQuery,
    });

    this.registerTool({
      name: 'get_table_schema',
      description: 'Get the schema of a database table',
      inputSchema: {
        type: 'object',
        properties: {
          tableName: { type: 'string', description: 'Table name' },
          database: { type: 'string', description: 'Database name' },
        },
        required: ['tableName'],
      },
      execute: databaseTools.getTableSchema,
    });

    // Deployment Tools
    this.registerTool({
      name: 'deploy_application',
      description: 'Deploy an application to specified environment',
      inputSchema: {
        type: 'object',
        properties: {
          application: { type: 'string', description: 'Application name' },
          version: { type: 'string', description: 'Version to deploy' },
          environment: { type: 'string', description: 'Target environment (dev, staging, prod)' },
          approvalRequired: { type: 'boolean', description: 'Require approval before deployment' },
        },
        required: ['application', 'version', 'environment'],
      },
      execute: deploymentTools.deployApplication,
    });

    this.registerTool({
      name: 'check_deployment_status',
      description: 'Check the status of a deployment',
      inputSchema: {
        type: 'object',
        properties: {
          deploymentId: { type: 'string', description: 'Deployment ID' },
        },
        required: ['deploymentId'],
      },
      execute: deploymentTools.checkStatus,
    });

    this.registerTool({
      name: 'rollback_deployment',
      description: 'Rollback a deployment to previous version',
      inputSchema: {
        type: 'object',
        properties: {
          deploymentId: { type: 'string', description: 'Deployment ID to rollback' },
          reason: { type: 'string', description: 'Reason for rollback' },
        },
        required: ['deploymentId'],
      },
      execute: deploymentTools.rollback,
    });

    logger.info(`Registered ${this.tools.size} tools`);
  }

  /**
   * Register all available resources
   */
  registerResources() {
    logger.info('Registering resources');

    // API Documentation
    this.registerResource({
      uri: 'docs://api-reference',
      name: 'API Reference Documentation',
      description: 'Complete API reference documentation',
      mimeType: 'text/markdown',
      read: async () => {
        // In real implementation, fetch from documentation system
        return '# API Reference\n\nComplete API documentation...';
      },
    });

    // Architecture Documentation
    this.registerResource({
      uri: 'docs://architecture',
      name: 'System Architecture',
      description: 'System architecture documentation and diagrams',
      mimeType: 'text/markdown',
      read: async () => {
        return '# System Architecture\n\nArchitecture overview...';
      },
    });

    // Runbooks
    this.registerResource({
      uri: 'docs://runbooks',
      name: 'Operational Runbooks',
      description: 'Runbooks for common operational tasks',
      mimeType: 'text/markdown',
      read: async () => {
        return '# Runbooks\n\nOperational procedures...';
      },
    });

    logger.info(`Registered ${this.resources.size} resources`);
  }

  /**
   * Register a tool
   */
  registerTool(tool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Register a resource
   */
  registerResource(resource) {
    this.resources.set(resource.uri, resource);
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('MCP Server started successfully');
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    logger.info('Starting Custom MCP Server');
    const server = new CustomMCPServer();
    await server.start();
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  main();
}

module.exports = CustomMCPServer;

// Made with Bob
