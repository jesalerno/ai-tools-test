# Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- npm or yarn

## Running with Docker

1. **Start the services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

3. **Stop the services:**
   ```bash
   docker-compose down
   ```

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev  # Starts on http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm start  # Starts on http://localhost:3000
```

**Note:** Make sure the backend is running before starting the frontend.

## Running Tests

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Project Structure

- `/backend` - Node.js/TypeScript backend service
- `/frontend` - React/TypeScript frontend service
- `/shared` - Shared type definitions
- `docker-compose.yml` - Service orchestration

## Usage

1. Select a fractal method from the dropdown
2. Click "Go" to generate a card with the selected method
3. Click "Surprise Me" to randomly select a method and generate

The generated card will appear below the controls. Each generation creates a new unique design.

## Troubleshooting

### Canvas library issues (backend)

If you encounter canvas installation issues, ensure you have the required system libraries:
- On macOS: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- On Ubuntu/Debian: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

### Port conflicts

If ports 3000 or 8080 are already in use, modify `docker-compose.yml` to use different ports.

### Type errors

Ensure both frontend and backend can access the `/shared` directory. The TypeScript configurations are set up to include this directory.
