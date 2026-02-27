# Fractal Card Generator

A production-ready web application for generating fractal-based playing card back designs. Features 11 different fractal algorithms, seamless 4-quadrant symmetry, and print-quality output.

## Features

- **11 Fractal Methods**: Mandelbrot, Julia Set, Burning Ship, Newton, Lyapunov, IFS, L-System, Strange Attractors, Heightmaps, Flame Fractals, and Complex Functions
- **Print Quality**: 300 DPI JPEG output at standard playing card dimensions (2.5" × 3.5")
- **Seamless Design**: 4-quadrant symmetric patterns with no distinct top/bottom
- **Modern UI**: Clean, responsive interface with real-time generation
- **Production Ready**: Docker deployment, rate limiting, comprehensive testing

## Quick Start

### Prerequisites

**System Dependencies (Required for Canvas)**

The backend uses `node-canvas` which requires native libraries:

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pixman-dev
```

**Docker (Recommended):**
```bash
# System dependencies are included in Docker images
docker --version
docker-compose --version
```

### Running with Docker (Easiest)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd FractalCardGenerator-CC
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Running Locally (Development)

**Backend:**
```bash
cd backend
npm install
npm run dev  # Development server with hot reload
npm test     # Run tests
```

**Frontend:**
```bash
cd frontend
npm install
npm start    # Development server
```

**Note:** Ensure system dependencies for canvas are installed before running `npm install` in the backend.

## Project Structure

```
FractalCardGenerator-CC/
├── backend/                 # Backend service
│   ├── src/
│   │   ├── domain/         # Domain layer (fractal generators)
│   │   ├── application/    # Application layer (business logic)
│   │   ├── infrastructure/ # Infrastructure layer (API, canvas)
│   │   ├── shared/         # Shared types (re-exported)
│   │   └── __tests__/      # Test files
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Frontend service
│   ├── src/
│   │   ├── services/       # API client
│   │   ├── shared/         # Shared types (copied)
│   │   ├── App.tsx         # Main component
│   │   └── App.css         # Styles
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tsconfig.json
├── shared/                  # Shared type definitions
│   └── types.ts
├── docker-compose.yml
├── LICENSE
├── NOTICES.md
└── README.md
```

## Architecture

### Clean Architecture

The backend follows Clean Architecture principles with clear layer boundaries:

- **Domain Layer**: Pure business logic, fractal generators
- **Application Layer**: Use cases, card generation service
- **Infrastructure Layer**: External concerns (Express API, canvas rendering)

### Shared Types Strategy

- **Root**: `/shared/types.ts` - Source of truth for type definitions
- **Backend**: Re-exports from `backend/src/shared/types.ts`
- **Frontend**: Copy in `frontend/src/shared/types.ts` (React limitation)

### Fractal Generators

All fractal generators implement the `IFractalGenerator` interface and include:
- Pattern generation with configurable parameters
- Coverage validation (≥80% pixel fill requirement)
- Adaptive iteration to ensure space-filling patterns

## API Documentation

### Endpoints

**POST /api/generate**
Generate a fractal card.

Request:
```json
{
  "method": "mandelbrot",
  "seed": 12345  // Optional
}
```

Response:
```json
{
  "imageData": "base64-encoded-jpeg...",
  "mimeType": "image/jpeg",
  "method": "mandelbrot",
  "seed": 12345,
  "timestamp": "2026-01-22T10:30:00.000Z"
}
```

**GET /api/methods**
Get list of available fractal methods.

**GET /api/health**
Health check endpoint.

### Rate Limiting

- 100 requests per 15 minutes per IP address
- Prevents DoS attacks

## Testing

### Backend Tests

```bash
cd backend

# Run mock tests (fast, use mocks)
npm test

# Run all tests including live tests
npm run test:all

# Run only live tests (slower, use real canvas)
npm run test:live
```

### Test Coverage

- Unit tests for domain and application layers
- Integration tests for API endpoints
- Mock tests run by default (no canvas dependency)
- Live tests marked `.skip` (require canvas)

## Security

### Built-in Security Features

- **Input Validation**: All API inputs validated before processing
- **Rate Limiting**: Prevents DoS attacks
- **Request Size Limits**: 1MB maximum request size
- **CORS Configuration**: Restricted origin in production
- **Error Handling**: No stack traces exposed to clients
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

### Security Audit

```bash
# Check for vulnerabilities
cd backend && npm audit
cd frontend && npm audit

# Fix vulnerabilities
npm audit fix
```

## Code Quality

### Cyclomatic Complexity

All functions maintain complexity ≤10. Complex algorithms are broken into helper functions.

### Linting

```bash
cd backend
npm run lint      # Run ESLint
npm run type-check  # TypeScript type checking
```

### ESLint Configuration

- Complexity limit: 10
- Max nesting depth: 3
- Max function length: 50 lines
- Max parameters: 5

## Troubleshooting

### Canvas Build Errors

**Problem:** `npm install` fails with canvas build errors.

**Solution:**
1. Install system dependencies first (see Prerequisites)
2. Clear npm cache: `npm cache clean --force`
3. Remove `node_modules`: `rm -rf node_modules`
4. Reinstall: `npm install`

### TypeScript Version Conflicts

**Problem:** react-scripts complains about TypeScript version.

**Solution:** Already handled via CRACO configuration. If issues persist:
```bash
npm install --legacy-peer-deps
```

### Docker Build Issues

**Problem:** Docker build fails or runs slowly.

**Solution:**
1. Ensure Docker has enough memory (4GB+ recommended)
2. Clear Docker cache: `docker system prune -a`
3. Rebuild: `docker-compose up --build --force-recreate`

### Frontend Can't Connect to Backend

**Problem:** API requests fail with network errors.

**Solution:**
1. Check backend is running: `curl http://localhost:8080/api/health`
2. Verify CORS configuration in backend
3. Check `REACT_APP_API_URL` environment variable

### Pattern Not Filling Space

**Problem:** Generated fractal appears sparse.

**Solution:** Already handled via adaptive iteration. If persists:
1. Check coverage validation in generator
2. Increase iteration limits in fractal parameters
3. Adjust zoom/center for better view window

## Performance

### Generation Times

- Simple fractals (Mandelbrot, Julia): ~1-3 seconds
- IFS/Attractors: ~3-8 seconds
- Complex fractals (Flame): ~5-10 seconds

### Optimization Tips

1. Use Docker for consistent performance
2. Increase Node.js memory if needed: `NODE_OPTIONS=--max-old-space-size=4096`
3. Consider caching generated cards (future enhancement)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

### Third-Party Licenses

All dependencies are MIT or Apache-2.0 licensed. See [NOTICES.md](NOTICES.md) for complete attribution.

## Contributing

### Adding a New Fractal Generator

1. Create generator in `backend/src/domain/generators/`
2. Implement `IFractalGenerator` interface
3. Add to `FractalFactory`
4. Add enum value to `FractalMethod` in `shared/types.ts`
5. Update frontend label mapping in `App.tsx`
6. Write tests in `backend/src/__tests__/`
7. Ensure coverage validation passes

### Code Style

- Follow TypeScript strict mode
- Use ESLint configuration
- Keep functions under complexity limit of 10
- Document complex algorithms
- No `any` types except where absolutely necessary

## Roadmap

- [ ] Save/download generated cards
- [ ] Card customization (colors, borders)
- [ ] Animation preview
- [ ] Gallery of generated cards
- [ ] Batch generation
- [ ] Custom seed input in UI

## Support

For issues, questions, or contributions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [SPECIFICATION.md](SPECIFICATION.md) for requirements
3. Open an issue with detailed description

---

**Made with ❤️ using fractal mathematics**

