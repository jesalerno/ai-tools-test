# Fractal Card Generator

A production-ready web application for generating fractal-based playing card back designs. Generate beautiful, unique fractal patterns with seamless 4-quadrant symmetry suitable for print-quality playing cards.

## Features

- **11 Fractal Methods**: Mandelbrot Set, Julia Sets, Burning Ship, Newton Fractals, Lyapunov Fractals, IFS, L-Systems, Strange Attractors, Heightmaps, Flame Fractals, and Complex Phase Plots
- **Print Quality**: 2.5" × 3.5" cards at 300 DPI with 3mm white border and rounded corners
- **Seamless Patterns**: 4-quadrant symmetric designs with no distinct top/bottom
- **Modern UI**: Clean, responsive interface with real-time image display
- **Production Ready**: Dockerized microservices architecture with comprehensive testing
- **TypeScript**: Fully typed codebase for frontend and backend
- **MIT Licensed**: Open source and free to use

## Quick Start with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd FractalCardGenerator-CC

# Build and start services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Prerequisites

### For Docker Installation

- Docker 20.10+
- Docker Compose 2.0+

### For Local Development

#### System Dependencies (Required for Canvas)

The backend uses `node-canvas` for server-side rendering, which requires native system libraries.

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libpixman-1-dev
```

**Note**: These dependencies MUST be installed before running `npm install` in the backend directory.

#### Software Requirements

- Node.js 20+
- npm 9+

## Local Development Setup

### 1. Install System Dependencies

Follow the platform-specific instructions above to install canvas dependencies.

### 2. Install Node Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Or install individually:
cd backend && npm install
cd ../frontend && npm install --legacy-peer-deps
```

**Note**: The frontend uses `--legacy-peer-deps` flag because react-scripts 5.0.1 expects TypeScript 3-4, but we use TypeScript 5 with CRACO configuration.

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:8080
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

## Architecture

The application follows clean architecture principles with clear separation of concerns:

### Backend Structure

```
backend/
├── src/
│   ├── domain/              # Business logic
│   │   ├── FractalGenerator.ts
│   │   ├── FractalGeneratorFactory.ts
│   │   └── generators/      # 11 fractal implementations
│   ├── application/         # Use cases
│   │   └── CardGenerator.ts
│   ├── infrastructure/      # External interfaces
│   │   ├── CanvasRenderer.ts
│   │   └── api/
│   │       ├── routes.ts
│   │       └── validation.ts
│   └── shared/
│       └── types.ts         # Shared type definitions
```

### Frontend Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main component
│   ├── api/
│   │   └── cardApi.ts       # Backend API client
│   └── shared/
│       └── types.ts         # Copied shared types
```

### Shared Types Strategy

- Root `/shared/types.ts` contains the source of truth for contracts
- Backend re-exports from `../shared/types.ts`
- Frontend copies types into `src/shared/types.ts` (React doesn't allow imports outside src/)

## Available Fractal Methods

1. **Mandelbrot Set**: Classic escape-time fractal iterating z = z² + c
2. **Julia Set**: Beautiful fractal with fixed c parameter
3. **Burning Ship**: Fractal using absolute value iterations
4. **Newton Fractal**: Newton's method on z³ - 1, colored by root convergence
5. **Lyapunov Fractal**: Chaos theory visualization using logistic maps
6. **IFS (Iterated Function Systems)**: Barnsley Fern or Sierpiński Triangle
7. **L-System**: Turtle graphics generating Dragon or Koch curves
8. **Strange Attractor**: Lorenz, Clifford, or de Jong attractors
9. **Heightmap**: Perlin/Simplex noise-based patterns
10. **Flame Fractal**: Probabilistic IFS with non-linear variations
11. **Complex Phase Plot**: Complex function phase visualization

## API Documentation

### Endpoints

#### GET /api/methods
Get list of available fractal methods.

**Response:**
```json
{
  "success": true,
  "methods": [
    {
      "id": "mandelbrot",
      "name": "Mandelbrot Set",
      "description": "Classic fractal iterating z = z² + c"
    },
    ...
  ]
}
```

#### POST /api/generate
Generate a fractal card.

**Request:**
```json
{
  "method": "mandelbrot",
  "seed": 12345  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "imageData": "base64-encoded-jpeg-data",
  "method": "mandelbrot",
  "seed": 12345
}
```

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Testing

### Run All Tests

```bash
# From root
npm test

# Or individually
cd backend && npm test
cd frontend && npm test
```

### Backend Tests

The backend includes comprehensive unit and integration tests:

- **Mock Tests**: Fast tests with mocked canvas (default, always run)
- **In-bound Tests**: Normal operation scenarios
- **Out-of-bound Tests**: Edge cases, invalid inputs, error conditions

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

### Frontend Tests

```bash
cd frontend
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

## Card Specifications

- **Dimensions**: 2.5 inches × 3.5 inches (63.5mm × 88.9mm)
- **Resolution**: 300 DPI (750 × 1050 pixels)
- **Format**: JPEG
- **Border**: 3mm white border with 8px rounded corners
- **Pattern**: Seamless 4-quadrant symmetric design

## Security Features

- Input validation on all API endpoints
- Rate limiting (30 requests/minute) to prevent DoS attacks
- Request size limits (10kb max)
- No shell command execution
- Proper CORS configuration
- Sanitized error messages (no stack traces exposed)
- Iteration limits to prevent CPU exhaustion
- Memory limits for canvas operations

## Code Quality

- **TypeScript Strict Mode**: Full type safety
- **Cyclomatic Complexity**: All functions ≤10 complexity
- **Test Coverage**: 70%+ coverage on application/domain layers
- **Clean Architecture**: Clear layer separation
- **No Deprecated Code**: All dependencies up-to-date

## Troubleshooting

### Canvas Installation Fails

**Problem**: `npm install` fails in backend with canvas build errors.

**Solution**: Install system dependencies first (see Prerequisites section above).

### Frontend Won't Start

**Problem**: TypeScript version conflict errors.

**Solution**: Use `--legacy-peer-deps` flag:
```bash
cd frontend
npm install --legacy-peer-deps
```

### Docker Build Fails

**Problem**: Canvas dependencies missing in Docker container.

**Solution**: The Dockerfile already includes canvas dependencies. Rebuild:
```bash
docker-compose down
docker-compose up --build
```

### Port Already in Use

**Problem**: Port 3000 or 8080 already in use.

**Solution**: Stop conflicting services or change ports:
```bash
# For backend
PORT=8081 npm run dev

# For frontend, edit package.json or use:
PORT=3001 npm start
```

### Tests Fail Due to Canvas

**Problem**: Tests fail because canvas native module isn't built.

**Solution**: Mock tests don't require canvas. Ensure you're running:
```bash
npm test  # Not npm run test:live
```

## Performance

- **Backend**: Generates cards in 1-3 seconds depending on fractal complexity
- **Frontend**: Responsive UI with loading states
- **Rate Limiting**: 30 requests/minute per client
- **Image Size**: ~50-200kb JPEG per card

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Third-Party Attributions

See [NOTICES.md](NOTICES.md) for complete list of third-party dependencies and their licenses.

## Contributing

Contributions are welcome! Please ensure:

- All tests pass
- Code follows TypeScript strict mode
- Cyclomatic complexity ≤10 per function
- No security vulnerabilities (`npm audit`)
- Documentation updated for new features

## Project Status

Production-ready v1.0.0 - Fully functional with all 11 fractal methods implemented.

## Support

For issues, questions, or feature requests, please open an issue in the GitHub repository.
