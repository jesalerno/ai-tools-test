# Architecture Documentation

## Overview

The Fractal Card Generator is built using a microservices architecture with clean architecture principles. The system consists of two independent services (backend and frontend) that communicate via a RESTful API.

## Design Principles

### 1. Clean Architecture

The backend follows Clean Architecture with clear layer separation:

```
┌─────────────────────────────────────┐
│     Infrastructure Layer            │
│  (Express API, Canvas Renderer)     │
├─────────────────────────────────────┤
│     Application Layer                │
│  (CardGeneratorService)              │
├─────────────────────────────────────┤
│     Domain Layer                     │
│  (Fractal Generators, Business Logic)│
└─────────────────────────────────────┘
```

**Domain Layer:**
- Pure business logic
- No external dependencies
- Fractal generation algorithms
- Pattern data structures

**Application Layer:**
- Use cases and orchestration
- Coordinates domain objects
- CardGeneratorService

**Infrastructure Layer:**
- External concerns (API, rendering)
- Express routes and middleware
- Canvas rendering implementation

### 2. Dependency Inversion

Dependencies flow inward:
- Infrastructure depends on Application
- Application depends on Domain
- Domain depends on nothing

### 3. Contract-First Design

Shared TypeScript types ensure frontend/backend alignment:
- Single source of truth: `/shared/types.ts`
- Backend re-exports types
- Frontend copies types (React limitation)

## Component Architecture

### Backend Components

#### Fractal Generators

Each generator implements `IFractalGenerator`:

```typescript
interface IFractalGenerator {
  generate(params: FractalParams): PatternData;
  validateCoverage(pattern: PatternData): CoverageValidation;
}
```

**Generators:**
1. MandelbrotGenerator
2. JuliaGenerator
3. BurningShipGenerator
4. NewtonGenerator
5. LyapunovGenerator
6. IFSGenerator
7. LSystemGenerator
8. StrangeAttractorGenerator
9. HeightmapGenerator
10. FlameGenerator
11. ComplexFunctionGenerator

**Common Features:**
- Adaptive iteration for space-filling
- Coverage validation (≥80% fill)
- Seed-based randomization
- Configurable parameters

#### Card Generator Service

Orchestrates card generation:
1. Validates fractal method
2. Generates random seed (if not provided)
3. Creates fractal generator via factory
4. Generates pattern for one quadrant
5. Creates 4-quadrant symmetric pattern
6. Renders to JPEG via canvas

#### API Layer

Express routes with middleware:
- Rate limiting (100 req/15min)
- CORS configuration
- Request validation
- Error handling
- Health checks

### Frontend Components

#### App Component

Main React component:
- Method selection dropdown
- Generate buttons (Go, Surprise Me)
- Image display
- Loading/error states

#### API Client

Service for backend communication:
- Type-safe requests
- Error handling
- Base URL configuration

#### Styling

Plain CSS with:
- Responsive design
- Modern gradients
- Clean layout
- No external UI libraries

## Data Flow

### Card Generation Flow

```
User clicks "Go"
    ↓
Frontend sends POST /api/generate
    ↓
Backend validates request
    ↓
CardGeneratorService creates generator
    ↓
Generator creates fractal pattern
    ↓
Pattern validated for coverage
    ↓
4-quadrant symmetry applied
    ↓
Canvas renderer creates JPEG
    ↓
Base64 response sent to frontend
    ↓
Frontend displays image
```

## Technology Choices

### Backend

**Node.js + TypeScript**
- Strong typing for reliability
- Excellent ecosystem
- Async I/O for concurrent requests

**Express**
- Minimal, flexible framework
- Large middleware ecosystem
- Production proven

**node-canvas**
- Server-side image rendering
- Cairo-backed for quality
- JPEG compression support

**complex.js**
- Complex number operations
- Essential for fractal math
- MIT licensed

### Frontend

**React 18**
- Modern hooks-based approach
- Virtual DOM for performance
- Large community

**TypeScript**
- Type safety
- Better IDE support
- Catch errors early

**Plain CSS**
- No external dependencies
- Full control
- Lightweight

### DevOps

**Docker**
- Consistent environments
- Easy deployment
- Isolated services

**Docker Compose**
- Multi-service orchestration
- Simple local development
- Production-ready

## Testing Strategy

### Test Types

**Mock Tests (Default):**
- Fast execution
- No external dependencies
- Isolated unit tests

**Live Tests (Skipped):**
- Real canvas rendering
- Integration testing
- Requires system dependencies

### Test Coverage

Focus on:
- Domain layer (fractal generators)
- Application layer (card service)
- API endpoints (validation, error handling)

Not tested:
- Infrastructure implementation details
- UI components (future: add React Testing Library)

## Security Architecture

### Defense in Depth

**Input Layer:**
- TypeScript type validation
- Runtime request validation
- Schema validation

**Processing Layer:**
- Safe numeric ranges
- Iteration limits
- Memory limits

**Output Layer:**
- No sensitive data exposure
- Generic error messages
- Secure headers

### Rate Limiting

- Per-IP tracking
- Sliding window algorithm
- Configurable thresholds

### CORS

- Restricted origins in production
- Configurable via environment
- Preflight support

## Performance Considerations

### Backend Optimization

**Pattern Generation:**
- Early termination in iterative algorithms
- Adaptive iteration counts
- Efficient color mapping

**Memory Management:**
- Buffer pooling for canvas
- Streaming where possible
- Garbage collection hints

### Frontend Optimization

**Build:**
- Code splitting (future)
- Tree shaking
- Minification

**Runtime:**
- Lazy loading (future)
- Image caching (future)
- Debounced requests

## Scalability

### Current Limitations

- Stateless (no session management)
- Single-instance deployment
- Synchronous generation

### Future Scaling

**Horizontal:**
- Load balancer in front
- Multiple backend instances
- Shared rate limit store (Redis)

**Vertical:**
- Worker threads for generation
- Queue system for batch processing
- CDN for static assets

## Monitoring & Observability

### Health Checks

- `/api/health` endpoint
- Docker healthcheck probes
- Graceful shutdown handling

### Logging

- Structured logging
- Error tracking
- Performance metrics (future)

### Metrics (Future)

- Generation time per method
- Request rate per endpoint
- Error rate tracking

## Deployment

### Development

```bash
docker-compose up --build
```

### Production Considerations

1. **Environment Variables:**
   - API URL configuration
   - CORS origin restriction
   - Rate limit thresholds

2. **Resource Limits:**
   - Node.js memory limits
   - Docker container limits
   - Nginx worker processes

3. **Security:**
   - HTTPS termination (reverse proxy)
   - Security headers
   - Content Security Policy

## Code Quality Standards

### Complexity Limits

- Cyclomatic complexity: ≤10
- Nesting depth: ≤3
- Function length: ≤50 lines
- Parameters: ≤5

### Type Safety

- TypeScript strict mode
- No `any` types (except documented)
- Explicit return types
- Null checking

### Testing Requirements

- Unit tests for domain/application
- Integration tests for API
- Coverage thresholds: 70%

## Future Enhancements

### Short Term

- [ ] Card download functionality
- [ ] Custom color schemes
- [ ] Animation preview

### Long Term

- [ ] User accounts and galleries
- [ ] Batch generation
- [ ] Real-time collaboration
- [ ] Custom fractal parameters UI
- [ ] Mobile app

## Contributing Guidelines

### Adding Features

1. Design at architecture level first
2. Implement in appropriate layer
3. Write tests before implementation
4. Update documentation
5. Verify complexity limits

### Code Review Checklist

- [ ] Follows clean architecture
- [ ] Tests pass
- [ ] Complexity within limits
- [ ] Types properly defined
- [ ] Documentation updated
- [ ] Security considered
- [ ] Performance acceptable

---

**Last Updated:** January 2026
