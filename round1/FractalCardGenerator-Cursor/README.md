# Fractal Card Generator

A web application for generating fractal-based playing card back designs.

## Architecture

This project follows a microservices architecture with clean separation of concerns:

- **Backend Service**: Node.js + TypeScript API for fractal generation
- **Frontend Service**: React + TypeScript UI
- **Shared Contracts**: Type definitions shared between services

## Design Principles

- **Unix Philosophy**: Each service does one thing well
- **Clean Architecture**: Domain logic separated from infrastructure
- **Microservices**: Independent, decoupled services
- **Contract-First**: Frontend and backend communicate via well-defined contracts

## Running the Application

### Quick Deploy

```bash
# Deploy locally using the deployment script
./scripts/deploy.sh local

# Or deploy to production
./scripts/deploy.sh prod
```

### Using Docker Compose

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md). The project supports deployment to:
- Local Docker
- Railway
- Render
- Fly.io
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- And more...

### Development Mode

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Card Specifications

- Dimensions: 2.5" × 3.5" (63.5mm × 88.9mm)
- Border: 3mm white border with rounded edges
- Format: JPEG output
- Pattern: Seamless 4-quadrant symmetric design

## Fractal Methods

1. Mandelbrot Set
2. Julia Sets
3. Burning Ship Fractal
4. Newton Fractals
5. Lyapunov Fractals
6. Iterated Function Systems (IFS)
7. L-System Fractals
8. Strange Attractors
9. Escape-Time Heightmaps
10. Flame Fractals
11. Complex Function Phase Plots

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Third-Party Software

This project uses open source software. See [NOTICES.md](NOTICES.md) for a complete list of third-party dependencies and their licenses.
