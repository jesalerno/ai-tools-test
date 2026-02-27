# Architecture Documentation

## Design Choices

### Microservices Architecture
The application is split into two independent services:
- **Backend Service**: Handles fractal generation and image rendering
- **Frontend Service**: Provides user interface and communicates with backend via REST API

This separation allows:
- Independent scaling
- Technology flexibility
- Clear service boundaries
- Easier testing and deployment

### Clean Architecture
The backend follows clean architecture principles with three layers:

1. **Domain Layer** (`domain/`)
   - Core business logic (fractal generators)
   - No dependencies on infrastructure
   - Pure TypeScript, testable in isolation

2. **Application Layer** (`application/`)
   - Use cases and orchestration
   - Coordinates domain logic
   - Defines service interfaces

3. **Infrastructure Layer** (`infrastructure/`)
   - HTTP server (Express)
   - Image rendering (Canvas)
   - External concerns

### Unix Philosophy
Each service follows the "do one thing well" principle:
- Backend: Generate fractal card images
- Frontend: Display UI and handle user interactions

### Contract-First Design
Shared types in `/shared/types.ts` ensure:
- Frontend and backend stay aligned
- Type safety across service boundaries
- Clear API contracts

### Seamless Pattern Generation
The card pattern uses a quadrant mirroring approach:
1. Generate pattern for one quadrant
2. Mirror horizontally for top row
3. Mirror vertically for bottom row
4. Result: Seamless, symmetric design

This ensures the card looks identical when rotated 180°, meeting the requirement for a "reflective" design.

### Testing Strategy
- **Mock Tests**: Fast, isolated unit tests with mocked dependencies
- **Live Tests**: Integration tests that run against actual implementations (marked with `.skip` by default)
- **In-bound Tests**: Normal operation scenarios
- **Out-of-bound Tests**: Edge cases, invalid inputs, error conditions

## File Structure

```
FractalCardGenerator/
├── backend/              # Backend microservice
│   ├── src/
│   │   ├── domain/       # Domain layer (fractal generators)
│   │   ├── application/  # Application layer (use cases)
│   │   ├── infrastructure/ # Infrastructure layer (HTTP, rendering)
│   │   └── index.ts      # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Frontend microservice
│   ├── src/
│   │   └── App.tsx       # Main React component
│   ├── Dockerfile
│   └── package.json
├── shared/               # Shared contracts
│   └── types.ts          # Type definitions
└── docker-compose.yml    # Orchestration
```

## API Endpoints

### GET /health
Health check endpoint.

### GET /api/methods
Returns list of available fractal methods.

### POST /api/generate
Generates a fractal card image.

**Request:**
```json
{
  "method": "mandelbrot",
  "seed": 12345  // optional
}
```

**Response:**
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "method": "mandelbrot",
  "seed": 12345
}
```

## Fractal Generators

All generators implement the `FractalGenerator` interface:
- `generate(width, height, options)`: Returns 2D array of pixel values (0-255)

Implemented generators:
1. Mandelbrot Set
2. Julia Sets
3. Burning Ship
4. Newton Fractals
5. Lyapunov Fractals
6. Iterated Function Systems (IFS)
7. L-System Fractals
8. Strange Attractors
9. Escape-Time Heightmaps
10. Flame Fractals
11. Complex Function Phase Plots

## Card Specifications

- Dimensions: 63.5mm × 88.9mm (2.5" × 3.5")
- Border: 3mm white border
- Rounded corners: 8px radius
- Resolution: 300 DPI
- Format: JPEG output
- Pattern: Seamless 4-quadrant symmetric design
