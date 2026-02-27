#!/bin/bash

# Deployment script for Fractal Card Generator
# Usage: ./scripts/deploy.sh [environment]
# Environment: local, prod, staging

set -e

ENVIRONMENT=${1:-local}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Deploying Fractal Card Generator (${ENVIRONMENT})..."

cd "$PROJECT_DIR"

case $ENVIRONMENT in
  local)
    echo "📦 Building and starting local deployment..."
    docker-compose up --build -d
    echo "✅ Deployment complete!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🌐 Backend: http://localhost:8080"
    ;;
  prod)
    echo "📦 Building and starting production deployment..."
    if [ ! -f .env ]; then
      echo "⚠️  Warning: .env file not found. Creating from .env.example..."
      cp .env.example .env
      echo "⚠️  Please update .env with production values before deploying!"
    fi
    docker-compose -f docker-compose.prod.yml up --build -d
    echo "✅ Production deployment complete!"
    ;;
  staging)
    echo "📦 Building and starting staging deployment..."
    docker-compose -f docker-compose.prod.yml up --build -d
    echo "✅ Staging deployment complete!"
    ;;
  *)
    echo "❌ Unknown environment: ${ENVIRONMENT}"
    echo "Usage: ./scripts/deploy.sh [local|prod|staging]"
    exit 1
    ;;
esac

echo ""
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "📝 View logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
