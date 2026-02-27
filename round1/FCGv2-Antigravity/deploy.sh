#!/bin/bash
echo "Starting Fractal Card Generator v2 Deployment (Production Mode)..."
echo "Ensure Docker Desktop is running before proceeding."

# Use the standalone release configuration to avoid development volume merges
docker compose -f docker-compose.release.yml up -d --build

if [ $? -eq 0 ]; then
  echo "Deployment successful!"
  echo "Frontend (React static build): http://localhost:3000"
  echo "Backend (Express API): http://localhost:8080"
  echo "Use 'docker compose -f docker-compose.release.yml logs -f' to view logs."
else
  echo "Deployment failed. Please check if Docker is running."
fi
