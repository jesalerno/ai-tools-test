# Architecture Documentation

## Overview

Fractal Card Generator follows clean architecture principles with microservices pattern. The application is split into two independent services:

1. **Backend**: Node.js/TypeScript service for fractal generation and image rendering
2. **Frontend**: React/TypeScript SPA for user interface

## Design Principles

### Clean Architecture

The backend follows clean architecture with three distinct layers:

```
┌─────────────────────────────────────┐
│         Infrastructure              │  ← External interfaces (HTTP, Canvas)
├─────────────────────────────────────┤
│         Application                 │  ← Use cases (CardGenerator)
├─────────────────────────────────────┤
│         Domain                      │  ← Business logic (FractalGenerators)
└─────────────────────────────────────┘
```

**Dependencies flow inward**: Domain has no dependencies, Application depends on Domain, Infrastructure depends on both.

### Domain Layer

Pure business logic with no external dependencies:

- **FractalGenerator Interface**: Contract for all fractal generators
- **11 Generator Implementations**: Each implementing a specific fractal algorithm
- **FractalGeneratorFactory**: Factory pattern for generator instantiation
- **Utilities**: SeededRandom, color mapping, helper functions

**Key Design Decisions:**

- Each generator is self-contained in its own file
- Cyclomatic complexity kept ≤10 through helper method extraction
- All generators ensure ≥80% pattern coverage through adaptive iterations
- Pure functions where possible for testability

### Application Layer

Orchestrates domain logic for specific use cases:

- **CardGenerator**: Main use case for generating fractal cards
  - Generates quadrant using domain generators
  - Mirrors quadrant to create seamless 4-way symmetry
  - Returns Color[][] array

**Key Design Decisions:**

- Stateless service (no data persistence)
- Single responsibility: coordinate fractal generation and mirroring
- All business logic delegated to domain layer

### Infrastructure Layer

External interfaces and framework-specific code:

- **CanvasRenderer**: Converts Color[][] to JPEG using node-canvas
- **Express API**: REST endpoints with validation and error handling
- **Input Validation**: Type-safe validation with detailed error messages
- **Rate Limiting**: DoS protection

**Key Design Decisions:**

- Canvas rendering isolated to single class (easy to mock in tests)
- Validation separated from routes for reusability
- Error messages sanitized (no internal details exposed)
- CORS properly configured

## Frontend Architecture

### Component Structure

Simple, flat component structure:

```
App (Main Component)
└── State Management (useState)
    ├── Controls (dropdown, buttons)
    └── Display (image or placeholder)
```

**Key Design Decisions:**

- Single component approach for simplicity
- No state management library needed (simple state)
- API calls in separate service module
- Plain CSS for styling (no component library)

### API Service

Separate module for backend communication:

- Type-safe requests/responses using shared types
- Proper error handling and propagation
- Environment-based API URL configuration

## Shared Types Strategy

### Challenge

Frontend (React) cannot import from outside `src/` directory, but we want single source of truth for API contracts.

### Solution

1. **Root Source of Truth**: `/shared/types.ts`
2. **Backend Re-export**: `backend/src/shared/types.ts` → `../../../shared/types.ts`
3. **Frontend Copy**: `frontend/src/shared/types.ts` (manual copy of root types)

**Trade-offs:**

- ✅ Clean architecture maintained
- ✅ Backend uses single source
- ✅ Frontend works with React constraints
- ❌ Manual sync needed (documented in types file)

**Alternative Considered**: Monorepo tools (Lerna, Nx) - rejected as over-engineering for this project.

## Data Flow

### Card Generation Flow

```
User clicks "Go"
    ↓
Frontend App.tsx
    ↓
API Service (cardApi.ts)
    ↓
[HTTP POST /api/generate]
    ↓
Express Routes
    ↓
Input Validation
    ↓
CardGenerator (Application)
    ↓
FractalGeneratorFactory → Specific Generator (Domain)
    ↓
Generate quadrant Color[][]
    ↓
Mirror to 4 quadrants
    ↓
CanvasRenderer (Infrastructure)
    ↓
JPEG Buffer → Base64
    ↓
[HTTP Response]
    ↓
Frontend displays image
```

## Security Architecture

### Defense in Depth

Multiple layers of security:

1. **Input Validation**: All API inputs validated
2. **Rate Limiting**: 30 req/min per client
3. **Request Size Limits**: 10kb max
4. **Iteration Limits**: Prevent CPU exhaustion
5. **Memory Limits**: Canvas operations bounded
6. **Error Sanitization**: No internal details leaked
7. **No Code Execution**: No eval(), exec(), or shell commands
8. **CORS**: Properly scoped origins

### Security by Design

- TypeScript strict mode prevents type-related vulnerabilities
- No user-provided code execution
- All numeric inputs range-validated
- No SQL (stateless, no database)
- No file uploads (server generates all content)

## Testing Strategy

### Test Pyramid

```
     ╱╲
    ╱  ╲       E2E (Manual)
   ╱────╲
  ╱      ╲     Integration Tests (API Routes)
 ╱────────╲
╱          ╲   Unit Tests (Domain, Application)
────────────
```

### Mock vs Live Tests

**Mock Tests (Always Run):**
- Fast execution
- No system dependencies
- Canvas mocked
- Default for CI/CD

**Live Tests (Skipped by Default):**
- Real canvas rendering
- Require system dependencies
- Marked with `.skip`
- Run manually for integration verification

### Test Categories

**In-bound Tests:**
- Normal operation
- Valid inputs
- Expected behaviors

**Out-of-bound Tests:**
- Edge cases
- Invalid inputs
- Error conditions
- Boundary values

## Fractal Pattern Coverage Strategy

### Challenge

Some fractals (attractors, IFS) are sparse by nature and may not fill space.

### Solution

1. **Adaptive Iterations**: Increase iterations if coverage < 80%
2. **Density Mapping**: Track pixel coverage during generation
3. **Bounds Calculation**: Ensure patterns mapped to full space
4. **Padding**: 10% padding prevents edge clipping

### Implementation

Each generator:
1. Generates points/iterations
2. Maps to pixel coordinates with proper bounds
3. Uses density/alpha blending for sparse patterns
4. Validates coverage meets ≥80% threshold

## Deployment Architecture

### Docker Compose

```
┌─────────────────────┐
│  Client Browser     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Frontend Container │  ← Nginx on port 80
│  (nginx + React)    │     Proxies /api to backend
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Backend Container  │  ← Express on port 8080
│  (Node.js + Canvas) │
└─────────────────────┘
```

**Key Design Decisions:**

- Frontend serves static files via Nginx (production-ready)
- Nginx proxies /api requests to backend
- Services communicate via Docker network
- Health checks ensure service availability
- Restart policies for resilience

## Performance Considerations

### Optimization Strategies

1. **Seeded Random**: Deterministic generation (same seed = same card)
2. **Quadrant Mirroring**: Generate 1/4 of image, mirror to fill
3. **Color Caching**: HSV→RGB conversion optimized
4. **Iteration Limits**: Prevent infinite loops
5. **Rate Limiting**: Prevent resource exhaustion

### Bottlenecks

- **Fractal Generation**: CPU-intensive (1-3 seconds)
- **Canvas Rendering**: Memory-intensive
- **Image Encoding**: JPEG compression

**Future Optimizations (Not Implemented):**
- Worker threads for parallel generation
- Image caching by method+seed
- WebGL for frontend preview
- Progressive rendering

## Code Quality Enforcement

### Cyclomatic Complexity

**Limit**: ≤10 per function

**Enforcement**:
- ESLint complexity rule
- Code review
- Refactoring guidelines

**Techniques**:
- Extract helper methods
- Early returns
- Guard clauses
- Named boolean variables

### Type Safety

- TypeScript strict mode
- No `any` types (except documented exceptions)
- Runtime validation (not just compile-time)
- Shared types between services

## Scalability Considerations

### Current Architecture

- **Stateless Services**: Can scale horizontally
- **No Database**: No persistence bottleneck
- **Containerized**: Easy to deploy multiple instances

### Scaling Strategies (Future)

1. **Horizontal Scaling**: Load balancer + multiple backend instances
2. **Caching Layer**: Redis for method+seed → image mapping
3. **CDN**: Serve generated images from CDN
4. **Job Queue**: Async generation for complex fractals

## Technology Choices

### Why Node.js + TypeScript?

- ✅ Shared language (frontend/backend)
- ✅ Strong typing with TypeScript
- ✅ Excellent Canvas library (node-canvas)
- ✅ Large ecosystem (Express, Jest, etc.)
- ✅ Good performance for I/O-bound tasks

### Why React (Not Vue/Angular)?

- ✅ Simple component model
- ✅ Large community
- ✅ Minimal overhead for this use case
- ✅ Good TypeScript support

### Why Plain CSS (Not Tailwind/Material-UI)?

- ✅ No external dependencies
- ✅ Better performance (smaller bundle)
- ✅ Full control over styling
- ✅ Easier to customize

### Why Docker Compose (Not Kubernetes)?

- ✅ Simpler for local development
- ✅ Sufficient for small-medium deployments
- ✅ Easy to understand and maintain
- ✅ Can migrate to K8s later if needed

## Future Enhancements

Potential improvements (not in current scope):

1. **User Accounts**: Save favorite fractals
2. **Export Options**: PNG, SVG, PDF formats
3. **Customization**: Color schemes, border styles
4. **Animation**: Animated fractal zoom/transitions
5. **Batch Generation**: Generate entire deck
6. **Print Integration**: Direct printing service integration
7. **Mobile App**: Native iOS/Android apps
8. **Advanced Fractals**: More algorithms (Buddhabrot, etc.)

## Maintenance

### Dependency Updates

**Monthly Review**:
- Run `npm outdated`
- Check security advisories
- Update dependencies
- Run full test suite
- Update NOTICES.md

### Deprecation Monitoring

- Check for deprecated packages
- Review changelog for breaking changes
- Plan migration if needed
- Document in architecture docs

### Code Health

- Monitor test coverage
- Review complexity metrics
- Refactor high-complexity functions
- Update documentation

## Conclusion

This architecture provides:

- ✅ Clean separation of concerns
- ✅ Testable, maintainable code
- ✅ Production-ready security
- ✅ Scalable design
- ✅ Excellent developer experience

The design prioritizes simplicity and maintainability over premature optimization, following the Unix philosophy of doing one thing well.
