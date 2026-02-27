# Deployment Guide

This guide covers multiple deployment options for the Fractal Card Generator application.

## Table of Contents

1. [Local Docker Deployment](#local-docker-deployment)
2. [Production Docker Compose](#production-docker-compose)
3. [Cloud Platform Deployments](#cloud-platform-deployments)
   - [Railway](#railway)
   - [Render](#render)
   - [Fly.io](#flyio)
   - [DigitalOcean App Platform](#digitalocean-app-platform)
   - [AWS ECS](#aws-ecs)
   - [Google Cloud Run](#google-cloud-run)
   - [Azure Container Instances](#azure-container-instances)

## Local Docker Deployment

### Quick Start

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Production Docker Compose

For production deployment, use the production docker-compose configuration:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Production Considerations

1. **Environment Variables**: Set production environment variables
2. **Resource Limits**: Configure CPU and memory limits
3. **Health Checks**: Monitor service health
4. **Logging**: Configure centralized logging
5. **Backup**: Set up backup strategies if needed

## Cloud Platform Deployments

### Railway

Railway is a simple platform for deploying Docker containers.

#### Setup Steps

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. Initialize project:
   ```bash
   railway init
   ```

3. Deploy:
   ```bash
   railway up
   ```

#### Configuration

- Railway automatically detects `docker-compose.yml`
- Set environment variables in Railway dashboard
- Frontend: Set `REACT_APP_API_URL` to your backend URL

### Render

Render supports Docker Compose deployments.

#### Setup Steps

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Select "Docker Compose" as the deployment method
4. Render will use `docker-compose.yml` automatically

#### Configuration

- **Build Command**: (auto-detected)
- **Start Command**: (auto-detected)
- **Environment Variables**:
  - `NODE_ENV=production`
  - `REACT_APP_API_URL=https://your-backend.onrender.com`

### Fly.io

Fly.io provides global deployment with Docker.

#### Setup Steps

1. Install Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Login:
   ```bash
   fly auth login
   ```

3. Launch app:
   ```bash
   fly launch
   ```

4. Deploy:
   ```bash
   fly deploy
   ```

#### Configuration

Create `fly.toml` (see deployment scripts section)

### DigitalOcean App Platform

DigitalOcean App Platform supports Docker Compose.

#### Setup Steps

1. Create a new App in DigitalOcean dashboard
2. Connect GitHub repository
3. Select "Docker Compose" deployment
4. Configure environment variables
5. Deploy

### AWS ECS

For AWS deployment using Elastic Container Service.

#### Prerequisites

- AWS CLI configured
- ECR repository created
- ECS cluster created

#### Setup Steps

1. Build and push images:
   ```bash
   ./scripts/deploy-aws.sh
   ```

2. Create ECS task definition
3. Create ECS service
4. Configure load balancer

### Google Cloud Run

Serverless container deployment on Google Cloud.

#### Setup Steps

1. Install gcloud CLI
2. Build and push to Container Registry:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy fractal-card-frontend --image gcr.io/PROJECT_ID/frontend
   gcloud run deploy fractal-card-backend --image gcr.io/PROJECT_ID/backend
   ```

### Azure Container Instances

Deploy to Azure using Container Instances.

#### Setup Steps

1. Install Azure CLI
2. Create resource group:
   ```bash
   az group create --name fractal-card-rg --location eastus
   ```

3. Deploy containers:
   ```bash
   az container create --resource-group fractal-card-rg --name frontend --image your-registry/frontend
   az container create --resource-group fractal-card-rg --name backend --image your-registry/backend
   ```

## Environment Variables

### Backend

- `NODE_ENV`: `production` or `development`
- `PORT`: Server port (default: 8080)
- `CORS_ORIGIN`: Allowed CORS origins (comma-separated)

### Frontend

- `REACT_APP_API_URL`: Backend API URL (required in production)
- `NODE_ENV`: `production` or `development`

## Health Checks

### Backend Health Endpoint

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T12:00:00.000Z"
}
```

### Frontend Health Check

The frontend serves static files, so a 200 response from the root indicates health.

## Monitoring

### Recommended Tools

- **Application Monitoring**: New Relic, Datadog, or Sentry
- **Logging**: CloudWatch, Loggly, or Papertrail
- **Uptime Monitoring**: UptimeRobot, Pingdom, or StatusCake

## Scaling

### Horizontal Scaling

- **Backend**: Can scale multiple instances behind a load balancer
- **Frontend**: Stateless, can scale horizontally easily

### Vertical Scaling

- Increase container resources (CPU/memory) for better performance
- Monitor resource usage and adjust accordingly

## Security

### Production Checklist

- [ ] Use HTTPS (TLS/SSL certificates)
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable security headers
- [ ] Regular dependency updates
- [ ] Security scanning (Snyk, npm audit)

## Troubleshooting

### Common Issues

1. **Canvas build failures**: Ensure system dependencies are installed
2. **Port conflicts**: Change ports in docker-compose.yml
3. **CORS errors**: Configure CORS_ORIGIN environment variable
4. **Memory issues**: Increase container memory limits

### Debug Commands

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps

# Execute commands in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Rebuild specific service
docker-compose build --no-cache backend
```

## Support

For deployment issues, check:
1. Docker and Docker Compose versions
2. System resource availability
3. Network connectivity
4. Environment variable configuration
5. Container logs
