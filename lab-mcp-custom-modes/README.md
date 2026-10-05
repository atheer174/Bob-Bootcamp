# Lab: Creating MCP Servers and Custom Modes

**Audience:** Build with Bob · **Level:** Advanced · **Topics:** `mcp` · `custom-modes` · `integrations` · `node.js`

> Extend Bob's capabilities by building a custom MCP server and creating custom modes. Connect Bob to your organization's tools, APIs, and workflows through natural language.

**Duration:** 75-90 minutes
**Prerequisites:** Understanding of REST APIs, Node.js experience

---

## Tutorial Flow

1. [Overview](#overview)
2. [What is MCP?](#what-is-mcp)
3. [Lab Structure](#lab-structure)
4. [Part 1 - MCP Architecture](#part-1)
5. [Part 2 - Set Up the MCP Server](#part-2)
6. [Part 3 - Advanced Tools](#part-3)
7. [Part 4 - Custom Modes](#part-4)
8. [Part 5 - Connect and Test](#part-5)
9. [Part 6 - Deployment (Optional)](#part-6)
10. [Part 7 - Best Practices](#part-7)
11. [Part 8 - Advanced Topics](#part-8)
12. [Part 9 - Managing Modes and Servers](#part-9)
13. [Exercises](#exercises)
14. [Troubleshooting](#troubleshooting)
15. [Resources](#resources)

---

## Overview

<a id="overview"></a>

In this lab you will learn how to extend Bob's capabilities by creating custom Model Context Protocol (MCP) servers and custom modes. This allows you to integrate Bob with your organization's tools, APIs, and workflows.

**Learning objectives:**

1. Understand the MCP architecture
2. Create a custom MCP server from scratch
3. Implement MCP tools for external integrations
4. Create custom Bob modes for specific workflows
5. Deploy and configure MCP servers
6. Test and debug MCP integrations
7. Share custom modes with your team

---

## What is MCP?

<a id="what-is-mcp"></a>

**Model Context Protocol (MCP)** is an open protocol that enables AI assistants like Bob to:

- Access external data sources
- Execute custom tools and functions
- Integrate with third-party services
- Extend capabilities beyond built-in features

**Key concepts:**

| Concept | Description |
|---|---|
| **MCP Server** | A service that exposes tools and resources to Bob |
| **Tools** | Functions that Bob can call to perform actions |
| **Resources** | Data sources that Bob can query |
| **Prompts** | Pre-defined prompt templates |
| **Custom Mode** | A specialized Bob configuration for specific tasks |

---

## Lab Structure

<a id="lab-structure"></a>

```
lab-mcp-custom-modes/
├── README.md
├── mcp-server/
│   ├── package.json
│   ├── server.js                    # Main server implementation
│   ├── tools/
│   │   ├── jira-tools.js           # JIRA integration
│   │   ├── database-tools.js       # Database queries
│   │   └── deployment-tools.js     # Deployment automation
│   ├── resources/
│   │   ├── documentation.js        # Doc access
│   │   └── metrics.js              # System metrics
│   └── config/
│       ├── server-config.json      # Server settings
│       └── tools-config.json       # Tool definitions
├── custom-mode/
│   ├── devops-mode.json
│   ├── code-review-mode.json
│   └── architecture-mode.json
├── examples/
│   ├── using-jira-integration.md
│   ├── database-queries.md
│   └── deployment-automation.md
└── deployment/
    ├── docker-compose.yml
    ├── kubernetes.yaml
    └── deployment-guide.md
```

---

## Part 1 - MCP Architecture

<a id="part-1"></a>

### MCP Protocol Basics

MCP uses a client-server architecture:

```
+-------------+      MCP Protocol       +-------------+
|             | <---------------------> |             |
|  Bob Client |   JSON-RPC over stdio   |  MCP Server |
|             |   or HTTP/WebSocket     |             |
+-------------+                         +-------------+
       |                                       |
       v                                       v
  User Requests                         External Services
  - Ask questions                       - JIRA API
  - Execute tasks                       - Database
  - Get information                     - Deployment tools
                                        - Custom APIs
```

**Key components:**

1. **Tools** - Functions Bob can call:
   ```json
   {
     "name": "create_jira_ticket",
     "description": "Create a new JIRA ticket",
     "parameters": {
       "title": "string",
       "description": "string",
       "priority": "string"
     }
   }
   ```

2. **Resources** - Data Bob can access:
   ```json
   {
     "uri": "docs://api-reference",
     "name": "API Documentation",
     "mimeType": "text/markdown"
   }
   ```

3. **Prompts** - Pre-defined templates:
   ```json
   {
     "name": "code_review",
     "description": "Perform code review",
     "template": "Review this code for: {criteria}"
   }
   ```

### MCP Server Lifecycle

```
1. Initialize -> 2. Register Tools -> 3. Handle Requests -> 4. Cleanup
      |                 |                     |                  |
      v                 v                     v                  v
   Setup           Define tools          Execute tools     Close connections
   connections     and resources         return results    cleanup resources
```

---

## Part 2 - Set Up the MCP Server

<a id="part-2"></a>

### Step 2.1 - Install dependencies

The MCP server files are provided in `mcp-server/`. Install dependencies:

```bash
cd lab-mcp-custom-modes/mcp-server
npm install
```

This installs:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `express` - Web server framework
- `axios` - HTTP client
- `dotenv` - Environment variable management
- `winston` - Logging

> **Tip:** You can also ask Bob: "Help me set up the MCP server project" and Bob will guide you through the setup.

### Step 2.2 - Examine the server

Open `mcp-server/server.js`. The server:
- Initializes the MCP protocol
- Registers available tools
- Handles tool execution requests
- Manages resources and prompts
- Provides error handling and logging

### Step 2.3 - Review tool implementations

Tools are the core functionality of your MCP server. Implemented tools are in `mcp-server/tools/`:

**`jira-tools.js`**
- `create_ticket` - Create new JIRA tickets
- `update_ticket` - Update existing tickets
- `search_tickets` - Search for tickets
- `get_ticket` - Get ticket details
- `add_comment` - Add comments to tickets

Each tool validates input parameters, calls the JIRA API, handles errors, and returns structured results.

### Step 2.4 - Review resource implementations

Resources provide Bob with access to data. Implemented in `mcp-server/resources/`:

**`documentation.js`** provides access to:
- API documentation
- Architecture diagrams
- Runbooks
- Best practices guides

Resources can be static files, dynamic queries, external API calls, or database queries.

---

## Part 3 - Advanced Tools

<a id="part-3"></a>

### Database Query Tool

Implemented in `mcp-server/tools/database-tools.js`:

- Execute read-only queries
- Get table schemas
- Analyze query performance
- Generate reports

**Security considerations:**
- Read-only access enforced
- Query validation (SELECT only)
- SQL injection prevention
- Rate limiting
- Audit logging

### Deployment Automation Tool

Implemented in `mcp-server/tools/deployment-tools.js`:

- Deploy applications
- Rollback deployments
- Check deployment status
- View deployment logs
- Manage environments

**Safety features:**
- Approval workflows for production
- Rollback capabilities
- Health checks
- Notification integration

### Custom Business Logic (Optional)

You can add organization-specific tools:

```javascript
async function lookupCustomer(customerId) {
  if (!customerId) {
    throw new Error('Customer ID required');
  }

  const response = await fetch(`${API_BASE}/customers/${customerId}`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  });

  return {
    customer: await response.json(),
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'internal-api'
    }
  };
}
```

---

## Part 4 - Custom Modes

<a id="part-4"></a>

Custom modes configure Bob for specific workflows. Example structure:

```json
{
  "name": "DevOps Mode",
  "description": "Specialized mode for DevOps tasks",
  "capabilities": ["deployment", "monitoring", "incident-response"],
  "tools": ["deploy_application", "check_health", "view_logs"],
  "prompts": ["deployment_checklist", "incident_runbook"]
}
```

Three modes are provided in `custom-mode/`:

### DevOps Mode (`devops-mode.json`)

Optimized for DevOps workflows:

- Deployment automation
- Infrastructure management
- Monitoring and alerting
- Incident response
- Log analysis

Includes prompts for: deployment checklist, incident response runbook, post-mortem template, change request template.

### Code Review Mode (`code-review-mode.json`)

Specialized for code reviews:

- Automated code analysis
- Security scanning
- Best practices checking
- Performance analysis
- Documentation review

Includes prompts for: quick review, deep review, security audit.

### Architecture Mode (`architecture-mode.json`)

For architecture and design:

- System design assistance
- Architecture documentation
- Technology recommendations
- Scalability analysis
- Cost estimation

Includes prompts for: system design, technology evaluation, architecture review.

---

## Part 5 - Connect and Test

<a id="part-5"></a>

### Step 5.1 - Configure the MCP server in Bob

1. Open Bob Settings (gear icon)
2. Navigate to **MCP** section
3. Choose scope:
   - **Global MCPs** - available across all projects
   - **Project MCPs** - only available in current project
4. Edit the JSON configuration file and add:
   ```json
   {
     "mcpServers": {
       "my-custom-server": {
         "command": "node",
         "args": ["server.js"],
         "cwd": "/absolute/path/to/lab-mcp-custom-modes/mcp-server"
       }
     }
   }
   ```
5. Save and restart Bob

> **Important:** MCP tools can only be used when Bob is in **Agent mode**. Switch to Agent mode before testing.

### Step 5.2 - Start and test

1. Start the MCP server:
   ```bash
   cd lab-mcp-custom-modes/mcp-server
   node server.js
   ```

2. Switch Bob to **Agent mode**

3. Test with these prompts:
   - "What MCP servers are connected?"
   - "Create a JIRA ticket for bug fix: Login page not loading"
   - "Show me the top 10 customers by revenue"
   - "Deploy version 2.1.0 to staging environment"

### Step 5.3 - Integration testing (Optional)

```bash
cd lab-mcp-custom-modes/mcp-server
npm test
```

Example test:

```javascript
const { MCPClient } = require('@modelcontextprotocol/sdk');

describe('MCP Server Integration', () => {
  let client;

  beforeAll(async () => {
    client = new MCPClient({ serverCommand: 'node', serverArgs: ['server.js'] });
    await client.connect();
  });

  test('should list available tools', async () => {
    const tools = await client.listTools();
    expect(tools).toContain('create_jira_ticket');
  });

  test('should execute tool successfully', async () => {
    const result = await client.callTool('create_jira_ticket', {
      title: 'Test ticket',
      description: 'Test description'
    });
    expect(result.success).toBe(true);
  });

  afterAll(async () => { await client.disconnect(); });
});
```

---

## Part 6 - Deployment (Optional)

<a id="part-6"></a>

### Docker

```bash
cd lab-mcp-custom-modes/deployment
docker-compose up -d
docker-compose logs -f mcp-server
docker-compose down
```

### Kubernetes

```bash
kubectl apply -f kubernetes.yaml
kubectl get pods -l app=mcp-server
kubectl logs -l app=mcp-server -f
kubectl scale deployment mcp-server --replicas=3
```

### Secrets management

```bash
export JIRA_API_TOKEN="your-token"
export DATABASE_URL="your-db-url"

# Or with Kubernetes secrets
kubectl create secret generic mcp-secrets \
  --from-literal=jira-token="${JIRA_API_TOKEN}" \
  --from-literal=db-url="${DATABASE_URL}"
```

---

## Part 7 - Best Practices

<a id="part-7"></a>

### Security

- Use API tokens, not passwords
- Implement role-based access control
- Validate all inputs; use HTTPS
- Encrypt sensitive data; don't log secrets
- Log all tool executions; set up alerts

### Performance

- Cache frequently accessed data with appropriate TTLs
- Use async/await for all I/O operations
- Implement timeouts for external calls
- Use connection pooling

### Reliability

- Graceful degradation with meaningful error messages
- Retry logic with exponential backoff
- Health checks and metrics collection
- Unit, integration, and load testing

---

## Part 8 - Advanced Topics

<a id="part-8"></a>

### Multi-Server Architecture

Configure multiple MCP servers in Bob:

```json
{
  "mcpServers": {
    "jira-server": {
      "command": "node",
      "args": ["jira-server.js"],
      "cwd": "/path/to/jira-server"
    },
    "db-server": {
      "command": "node",
      "args": ["db-server.js"],
      "cwd": "/path/to/db-server"
    },
    "deploy-server": {
      "command": "node",
      "args": ["deploy-server.js"],
      "cwd": "/path/to/deploy-server"
    }
  }
}
```

When you ask Bob to "Create a JIRA ticket and deploy the fix", it will intelligently use tools from multiple servers.

### Custom Protocol Extensions

```javascript
class CustomMCPServer extends MCPServer {
  async handleCustomRequest(request) {
    return { result: 'custom response' };
  }
}
```

### AI Model Integration

```javascript
async function analyzeWithCustomModel(code) {
  const response = await fetch('https://your-model-api.com/analyze', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}
```

---

## Part 9 - Managing Modes and Servers

<a id="part-9"></a>

### Installing a custom mode

1. Open Bob Settings
2. Navigate to **Custom Modes**
3. Click **Import Mode**
4. Select your mode file (e.g., `devops-mode.json`)
5. The mode appears in Bob's mode selector

### Removing a custom mode

**Via UI:**
1. Open Bob Settings > Custom Modes
2. Click the delete icon next to the mode

**Manual:**
- Delete the JSON file from `~/.bob/modes/`
- Restart Bob

### Removing an MCP server

1. Open Bob Settings > MCP
2. Edit the configuration JSON
3. Remove the server entry from `mcpServers`
4. Save and restart Bob

**Config file locations:**
- Global: `~/.bob/mcp.json`
- Project: `.bob/mcp.json` at workspace root

---

## Exercises

<a id="exercises"></a>

**Exercise 1 - Slack Integration**
Build an MCP server that can send messages, create channels, get channel history, and post code snippets to Slack.

**Exercise 2 - Monitoring Dashboard**
Create tools to get system metrics, view application logs, check service health, and generate reports.

**Exercise 3 - CI/CD Integration**
Build tools to trigger builds, deploy to environments, run tests, and rollback if needed.

---

## Troubleshooting

<a id="troubleshooting"></a>

| Problem | What to try |
|---|---|
| Server won't start | Run `npm install` in the server directory; check `config/` files; ensure ports are free |
| Tools not visible in Bob | Switch to **Agent mode** - MCP tools only work there; verify `cwd` path in config is absolute |
| Authentication failures | Check env variables are exported; verify API tokens haven't expired; test with `curl` directly |
| Custom mode not working | Validate JSON syntax; restart Bob after importing; check mode is enabled in settings |
| WSL path issues | Use Linux paths in config when running Bob in WSL (`/mnt/c/...` not `C:\...`) |

---

## Resources

<a id="resources"></a>

| Resource | Link |
|---|---|
| MCP Protocol Specification | https://modelcontextprotocol.io/docs |
| MCP SDK | https://github.com/modelcontextprotocol/sdk |
| Example MCP Servers | https://github.com/modelcontextprotocol/servers |
| Community MCP Servers | https://github.com/topics/mcp-server |

---

**[Back to Bob Bootcamp](../README.md)**
