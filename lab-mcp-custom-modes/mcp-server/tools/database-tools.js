/**
 * Database Tools for MCP Server
 * Provides database query capabilities to Bob
 */

const databaseTools = {
  name: 'database',
  description: 'Tools for querying and managing databases',
  
  tools: [
    {
      name: 'query_database',
      description: 'Execute a read-only SQL query against the database',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The SQL query to execute (SELECT only)'
          },
          database: {
            type: 'string',
            description: 'Database name (e.g., "production", "staging")',
            enum: ['production', 'staging', 'development']
          }
        },
        required: ['query', 'database']
      },
      handler: async (args) => {
        // Validate query is read-only
        if (!args.query.trim().toUpperCase().startsWith('SELECT')) {
          throw new Error('Only SELECT queries are allowed');
        }
        
        // Simulate database query
        return {
          success: true,
          rows: [
            { id: 1, name: 'Sample Data', created_at: '2024-01-01' },
            { id: 2, name: 'Example Record', created_at: '2024-01-02' }
          ],
          rowCount: 2,
          executionTime: '45ms'
        };
      }
    },
    {
      name: 'get_table_schema',
      description: 'Get the schema information for a database table',
      inputSchema: {
        type: 'object',
        properties: {
          tableName: {
            type: 'string',
            description: 'Name of the table'
          },
          database: {
            type: 'string',
            description: 'Database name',
            enum: ['production', 'staging', 'development']
          }
        },
        required: ['tableName', 'database']
      },
      handler: async (args) => {
        return {
          tableName: args.tableName,
          columns: [
            { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false }
          ],
          indexes: ['PRIMARY KEY (id)', 'INDEX idx_name (name)']
        };
      }
    }
  ]
};

module.exports = databaseTools;