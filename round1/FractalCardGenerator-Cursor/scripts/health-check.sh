#!/bin/bash

# Health check script for deployed services

set -e

BACKEND_URL=${BACKEND_URL:-http://localhost:8080}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

echo "🏥 Checking service health..."

# Check backend
echo -n "Backend health: "
if curl -f -s "${BACKEND_URL}/health" > /dev/null; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
  exit 1
fi

# Check frontend
echo -n "Frontend health: "
if curl -f -s "${FRONTEND_URL}" > /dev/null; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
  exit 1
fi

echo ""
echo "✅ All services are healthy!"
