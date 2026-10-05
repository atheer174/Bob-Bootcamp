# MCP Server Deployment Guide

This guide covers deploying your custom MCP server to various environments.

## Prerequisites

- Node.js 18+ installed
- Docker (for containerized deployment)
- Kubernetes cluster (for K8s deployment)
- Access to deployment environment

## Local Development

### Setup

```bash
cd lab6/mcp-server
npm install
```

### Configuration

1. Copy configuration templates:
```bash
cp config/server-config.json.example config/server-config.json
cp config/tools-config.json.example config/tools-config.json
```

2. Update configuration with your settings

### Running Locally

```bash
npm start
```

The server will start on `http://localhost:3000`

## Docker Deployment

### Build Docker Image

```bash
cd lab6/mcp-server
docker build -t mcp-server:latest .
```

### Run with Docker

```bash
docker run -d \
  --name mcp-server \
  -p 3000:3000 \
  -v $(pwd)/config:/app/config \
  mcp-server:latest
```

### Using Docker Compose

```bash
cd lab6/deployment
docker-compose up -d
```

## Kubernetes Deployment

### Deploy to Kubernetes

```bash
kubectl apply -f lab6/deployment/kubernetes.yaml
```

### Verify Deployment

```bash
kubectl get pods -n mcp-server
kubectl get svc -n mcp-server
```

### Access the Service

```bash
kubectl port-forward -n mcp-server svc/mcp-server 3000:80
```

## Configuration

### Environment Variables

- `NODE_ENV`: Environment (development, production)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

### Server Configuration

Edit `config/server-config.json`:
```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 3000
  },
  "logging": {
    "level": "info"
  }
}
```

### Tools Configuration

Edit `config/tools-config.json` to enable/disable tools and configure integrations.

## Connecting Bob to MCP Server

### Configure Bob

1. Open Bob settings
2. Navigate to MCP Servers
3. Add new server:
   - Name: Custom MCP Server
   - URL: http://localhost:3000
   - Protocol: stdio or http

### Test Connection

In Bob, try:
```
List available MCP tools
```

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

Docker:
```bash
docker logs mcp-server
```

Kubernetes:
```bash
kubectl logs -n mcp-server deployment/mcp-server
```

## Troubleshooting

### Server Won't Start

- Check port availability
- Verify configuration files
- Review logs for errors

### Connection Issues

- Verify firewall rules
- Check network connectivity
- Confirm Bob configuration

### Tool Errors

- Verify tool configurations
- Check API credentials
- Review tool-specific logs

## Security Considerations

1. **Authentication**: Enable authentication for production
2. **HTTPS**: Use TLS for production deployments
3. **Secrets**: Store credentials securely (environment variables, secrets manager)
4. **Network**: Restrict access to authorized clients only
5. **Logging**: Avoid logging sensitive information

## Scaling

### Horizontal Scaling

Increase replicas in Kubernetes:
```bash
kubectl scale deployment mcp-server --replicas=3 -n mcp-server
```

### Load Balancing

The Kubernetes service automatically load balances across pods.

## Maintenance

### Updates

1. Build new image with updated code
2. Update deployment:
```bash
kubectl set image deployment/mcp-server mcp-server=mcp-server:v2.0.0 -n mcp-server
```

### Backup

Backup configuration files regularly:
```bash
kubectl get configmap mcp-server-config -n mcp-server -o yaml > backup.yaml
```

## Support

For issues or questions:
- Check logs first
- Review configuration
- Consult MCP documentation
- Contact your team's Bob administrator