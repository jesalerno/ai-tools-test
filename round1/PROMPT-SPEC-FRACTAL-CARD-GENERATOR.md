# Improved Original Prompt

## Fractal Back Card Design Generator - Product Requirements

### Overview
Build a production-ready web application for generating fractal-based playing card back designs. The application must be fully functional on first run with minimal setup friction.

### Functional Requirements

**User Interface:**
- Two buttons: "Go" and "Surprise Me"
- Dropdown list of 11 fractal methods (see list below)
- Real-time image display on the same page
- Replace existing image when generating a new card
- Responsive, modern UI design aligned to Material Design 3

**Card Specifications:**
- Dimensions: 2.5 inches × 3.5 inches (63.5mm × 88.9mm)
- Format: JPEG output at 300 DPI (print quality)
- Border: 3mm white border with rounded corners (8px radius)
- Pattern: Seamless 4-quadrant symmetric design (appears continuous, no distinct top/bottom)
- Symmetry rules: Horizontal + vertical mirroring; card should look the same when turned upside down
- Seamless implementation: Generate pattern in one quadrant, mirror to other 3 quadrants; quadrant boundaries must be visually imperceptible with edges aligned to form a continuous image

**Fractal Methods (11 total):**
1. Mandelbrot Set: Iterate z = z² + c for each complex pixel c, color by escape iterations
2. Julia Sets: Iterate z = z² + c where c is fixed, z starts at each pixel
3. Burning Ship Fractal: Iterate z = (|Re(z)| + i|Im(z)|)² + c
4. Newton Fractals: Run Newton's method on f(z) = z³ - 1, color by root convergence
5. Lyapunov Fractals: Compute Lyapunov exponents for logistic map sequences
6. Iterated Function Systems (IFS): Barnsley Fern or Sierpiński Triangle via affine transformations
7. L-System Fractals: String rewriting with turtle graphics (Dragon curve or Koch curve)
8. Strange Attractors: Lorenz, Clifford, or de Jong attractors with alpha blending
9. Escape-Time Heightmaps: Perlin/Simplex noise-based heightmaps
10. Flame Fractals: Probabilistic IFS with non-linear variations
11. Complex Function Phase Plots: Map f(z) argument/magnitude to color (exp, sin, or z²)

**Per‑Fractal Defaults (uniform unless explicitly overridden):**
Defaults apply across all methods; implementations may clamp within the range to meet the 15-second timeout.

| Fractal Method | Iteration Range (default) | Zoom Range (default) | Palette Strategy |
| --- | --- | --- | --- |
| Mandelbrot Set | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Julia Sets | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Burning Ship Fractal | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Newton Fractals | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Lyapunov Fractals | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Iterated Function Systems (IFS) | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| L-System Fractals | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Strange Attractors | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Escape-Time Heightmaps | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Flame Fractals | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |
| Complex Function Phase Plots | 500–2000 | 0.5–4.0 | Random base color + random color theory (primary, square, complementary, triad, analogous, tetradic) |

**Fractal Pattern Space-Filling Requirements:**
- **Critical Requirement**: All fractal generators must ensure patterns fill the entire available quadrant space
- **Minimum Coverage**: At least 80% of pixels should have non-zero RGB values
- **Implementation Strategy**:
  - **Iterative Fractals** (Mandelbrot, Julia, Burning Ship): Ensure sufficient iterations to capture detail across entire space, use adaptive zoom/center to ensure interesting regions fill space
  - **IFS/Strange Attractors**: Continue iterations until density map shows coverage across all pixels, run enough iterations to fill the mapped coordinate space
  - **L-Systems**: Ensure turtle graphics path covers the space completely
  - **Heightmaps**: Ensure noise covers entire area without gaps
  - **Adaptive Iteration**: Increase iterations if pattern doesn't fill space (check coverage and adjust) until the default range max is reached; return best-effort output if coverage remains below target
- **Validation**:
  - All generators must validate output fills the requested dimensions
  - Visual verification: Pattern should appear complete, not sparse
  - Coverage check: Count non-zero RGB pixels and ensure ≥80% coverage
  - If coverage is insufficient after reaching max iterations, return best-effort output

**Behavior:**
- "Go" button: Generate card using selected fractal method from dropdown
- "Surprise Me" button: Randomly select a fractal method and generate
- Each generation creates a unique design (use random seeds/parameters)
- No data persistence required

### Technical Requirements

**Technology Stack:**
- **Backend**: Node.js 20+ with TypeScript
- **Frontend**: React 18+ with TypeScript
- **Image Generation**: Canvas library (node-canvas) for server-side rendering
- **API Communication**: RESTful API with JSON responses
- **Containerization**: Docker with docker-compose for orchestration

**UI Framework:**
- Material Design 3 (M3) visual language with progressive disclosure, error prevention, and recovery patterns
- Reference: https://m3.material.io/components
- Native HTML elements (button, select) styled to M3 guidelines
- Responsive design using CSS media queries
- No external UI component libraries required (custom CSS implementation aligned to M3)

**Architecture:**
- **Microservices**: Separate frontend and backend services
- **Clean Architecture**: Domain → Application → Infrastructure layers
  - **Domain**: Fractal generation functions/algorithms (pure computation)
  - **Application**: API orchestration, input validation, request handling, UI logic
  - **Infrastructure**: Canvas rendering, filesystem/network IO, external libraries
- **Unix Philosophy**: Each service does one thing well
- **Contract-First**: Shared type definitions ensure frontend/backend alignment
- **No Data Storage**: Stateless services, no database required

**System Dependencies (CRITICAL - Must be documented):**
- **Backend Canvas Library Requirements:**
  - macOS: `brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`
  - Ubuntu/Debian: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev pixman-dev`
  - These MUST be installed before `npm install` for canvas to build properly
  - Document in README with platform-specific instructions

**Shared Types Strategy:**
- Create `/shared/types.ts` at project root
- **Backend**: Use re-export pattern (`backend/src/shared/types.ts` → `../shared/types.ts`)
- **Frontend**: Copy types into `frontend/src/shared/types.ts` (React doesn't allow imports outside src/)
- Document this approach in architecture docs

**Dependency Management:**
- Use compatible versions to avoid peer dependency conflicts
- **Frontend**: Uses CRACO to customize react-scripts, compatible with TypeScript 5. Use `--legacy-peer-deps` flag for npm install if needed
- **Backend**: Ensure canvas is properly built after system dependencies are installed
- Document any required npm flags in package.json scripts or README

**Dependency Documentation & Audit:**
- Complete dependency audit with all direct dependencies documented
- **Backend Dependencies** (with versions and purposes):
  - `express` (^4.18.2): Web framework for REST API
  - `cors` (^2.8.5): Cross-origin resource sharing middleware
  - `express-rate-limit` (^8.2.1): Rate limiting middleware to prevent DoS attacks
  - `canvas` (^2.11.2): Server-side image rendering (requires native build)
  - `complex.js` (^2.1.1): Complex number operations for fractals
  - `jest` (^29.7.0): Testing framework
  - `supertest` (^6.3.3): HTTP assertion library for API testing
  - `ts-jest` (^29.1.1): TypeScript preprocessor for Jest
  - `ts-node-dev` (^2.0.0): Development server with hot reload
  - `typescript` (^5.3.3): TypeScript compiler
- **Frontend Dependencies** (with versions and purposes):
  - `react` (^18.2.0): UI library
  - `react-dom` (^18.2.0): React DOM renderer
  - `react-scripts` (^5.0.1): Build tooling (used via CRACO wrapper)
  - `@craco/craco` (^7.1.0): CRACO wrapper for customizing Create React App
  - `ajv` (^8.17.1): JSON schema validator
  - `typescript` (^5.3.3): TypeScript compiler
- **Frontend Dev Dependencies**:
  - (none required beyond standard tooling)
- **Version Pinning Strategy**: Use caret (^) for minor/patch updates, document any exact pins
- **Transitive Dependency Review**: Review critical transitive dependencies for security issues
- **Dependency Update Process**: 
  - Run `npm outdated` regularly
  - Review changelogs before updating
  - Test thoroughly after dependency updates
  - Document breaking changes and migration steps
- **Dependency Audit Tools**: Use `npm audit` and `license-checker` for compliance verification

**Deprecated Code Avoidance:**
- Use latest stable versions of all dependencies
- **Required Package Upgrades**:
  - `supertest`: Upgrade from 6.3.3 to 7.1.3+ (6.3.3 is deprecated)
  - Avoid deprecated Babel plugins (use native ES features instead)
- **Deprecated API Checks**:
  - Express: Avoid deprecated middleware patterns, use current Express 4.x APIs
  - React: Avoid deprecated lifecycle methods (componentWillMount, etc.), use hooks or modern lifecycle
  - TypeScript: Use current compiler options, avoid deprecated flags
  - Jest: Use `transform` configuration instead of deprecated `globals.ts-jest` pattern
- **Deprecation Detection**:
  - Run `npm outdated` regularly and address warnings
  - Monitor npm deprecation warnings during install
  - Check library changelogs for deprecation notices
  - Use ESLint rules to detect deprecated patterns
- **Documentation Requirements**:
  - Document any intentional use of deprecated features with justification
  - Create migration plan for deprecated dependencies
  - Track deprecation timelines and plan upgrades accordingly

**Security-by-Design Requirements:**
- **Input Validation**:
  - Validate all API inputs (method, seed parameters) before processing
  - Type checking for all request bodies using TypeScript and runtime validation
  - Sanitize numeric inputs (seed, dimensions) - ensure they're within safe ranges (prevent crashes, memory leaks, or processing longer than 15 seconds)
  - Reject malformed JSON with appropriate error messages
  - Rate limiting for API endpoints to prevent DoS attacks (60 requests/minute per IP)
  - Maximum request size limits to prevent memory exhaustion (configurable 1–2 MB range via environment variables)
- **Dependency Security**:
  - Run `npm audit` regularly and fix high/critical vulnerabilities immediately
  - Use `npm audit fix` where safe, review changes before committing
  - Document any accepted vulnerabilities with justification and mitigation plan
  - Regular security updates (monthly review of dependencies)
  - Monitor security advisories for all dependencies
  - Use `npm audit --production` to check runtime dependencies only
- **Code Security**:
  - **Forbidden Patterns**: No use of `eval()`, `Function()`, or `new Function()`
  - **React Security**: No `innerHTML` or `dangerouslySetInnerHTML` in React components
  - **Shell Security**: No `exec()` or shell command execution
  - **Input Validation**: Validate all user inputs before processing
  - **CORS Configuration**: Enforce Same-Origin Policy in production; explicitly allow required origins in non-production
  - **Content Security**: Validate image dimensions and formats
- **Error Handling**:
  - Don't expose internal error details to clients (no stack traces in responses)
  - Log errors server-side without sensitive data (passwords, tokens, etc.)
  - Use generic error messages for users, detailed errors in logs only
  - Implement proper error boundaries in React to prevent information leakage
- **Image Generation Security**:
  - Validate image dimensions (prevent memory exhaustion attacks)
  - Limit iteration counts (prevent CPU exhaustion) using default ranges
  - Implement timeout for long-running fractal calculations (15 seconds max)
  - Set memory limits for canvas operations (128 MB cap)
  - Validate seed parameters are within safe numeric ranges
  - Prevent infinite loops with maximum iteration limits

**Code Quality & Complexity Management:**
- **Cyclomatic Complexity Limits**:
  - Maximum complexity of 10 per function/method
  - Refactor complex functions by extracting helper methods
  - Use early returns to reduce nesting and complexity
  - Break complex conditionals into named functions or constants
  - Document any intentional complexity exceptions with justification
- **Code Smell Detection**:
  - **Nesting**: Avoid deep nesting (maximum 3 levels)
  - **Magic Numbers**: Extract all magic numbers to named constants
  - **DRY Principle**: Remove duplicate code, extract common functionality
  - **Single Responsibility**: Each class/function should have one clear purpose
  - **Naming**: Use meaningful variable and function names (no abbreviations unless standard)
  - **Function Length**: No functions longer than 50 lines
  - **Class Length**: No classes longer than 300 lines
  - **Parameter Count**: Maximum 5 parameters per function (use objects for more)
- **Code Quality Tools**:
  - Use ESLint with complexity rules (`complexity: ["error", 10]`)
  - Configure TypeScript strict mode for type safety
  - Consider SonarJS plugin for complexity analysis
  - Use Prettier for consistent code formatting
  - Run linters in CI/CD pipeline
- **Refactoring Guidelines**:
  - Extract complex logic into separate functions
  - Use composition over inheritance
  - Prefer pure functions where possible
  - Keep functions focused and testable

**MIT License Compliance & Open Source Attribution:**
- **Project License**:
  - Project is released under MIT License
  - Include `LICENSE` file in project root with full MIT license text
  - Include copyright year and holder name in LICENSE file
  - Set `"license": "MIT"` in all package.json files (root, backend, frontend)
- **Dependency License Verification**:
  - Verify all direct dependencies are MIT-compatible
  - Check transitive dependencies for incompatible licenses (GPL, AGPL, etc.)
  - Use `license-checker` or `npm-license-checker` tool to audit all licenses
  - Document any non-MIT dependencies with justification and compatibility assessment
  - Ensure no GPL/AGPL dependencies (unless explicitly approved with legal review)
- **Open Source Attribution Requirements**:
  - Create `NOTICES.md` or `THIRD_PARTY_LICENSES.md` file in project root
  - List all direct dependencies with:
    - Package name and version
    - License type (MIT, ISC, Apache-2.0, etc.)
    - Link to license file or repository
    - Brief description of usage in the project
  - Include attribution for all dependencies:
    - **Backend**: express, cors, express-rate-limit, canvas, complex.js, jest, supertest, ts-jest, ts-node-dev, typescript
    - **Frontend**: react, react-dom, react-scripts, ajv, typescript
    - **Dev Dependencies**: All testing and build tools
  - Format: Use standard NOTICES format with copyright holders and license text references
- **License File Requirements**:
  - Root `LICENSE` file with complete MIT license text
  - Include copyright year and holder name
  - Ensure LICENSE file is included in repository and all distributions
  - LICENSE file should be plain text, not markdown
- **Package.json License Fields**:
  - All package.json files must have `"license": "MIT"` field
  - Backend package.json: `"license": "MIT"`
  - Frontend package.json: `"license": "MIT"`
  - Root package.json (if exists): `"license": "MIT"`
- **Documentation Requirements**:
  - README must include "License" section referencing LICENSE file
  - Include link to LICENSE file in README
  - Document that project uses MIT-licensed dependencies
  - Note any license compatibility considerations
  - Reference NOTICES file for third-party attributions
- **Compliance Checklist**:
  - ✅ All dependencies are MIT-compatible
  - ✅ LICENSE file present in root with full MIT text
  - ✅ NOTICES file lists all dependencies with licenses
  - ✅ All package.json files have correct license field
  - ✅ README includes license information
  - ✅ No GPL/AGPL dependencies (unless explicitly approved)
  - ✅ License audit completed and documented

**Testing Requirements:**
- Unit tests for application/domain layers
- Two test sets per layer:
  - **Mock tests**: Fast, isolated tests with mocked dependencies (default)
  - **Live tests**: Integration tests against real implementations (marked `.skip` by default)
- Test categories:
  - **In-bound**: Normal operation scenarios
  - **Out-of-bound**: Edge cases, invalid inputs, error conditions
- Test coverage: Application and domain layers (not infrastructure), including image generation tests with mocked canvas by default and optional live canvas tests

**Code Quality:**
- TypeScript strict mode enabled
- All types properly defined
- No `any` types except where absolutely necessary (document why)
- Proper error handling throughout

**Documentation:**
- README with setup instructions including system dependencies
- Architecture documentation explaining design decisions
- Quick start guide with troubleshooting section
- API documentation (inline comments sufficient)

**Deployment:**
- Docker Compose configuration for easy local development
- Services should start successfully on first `docker-compose up --build`
- Frontend: Nginx for serving static files and proxying API requests
- Backend: Express server on port 8080
- Frontend: Served on port 3000

**Development Experience:**
- Hot reload for both frontend and backend
- Clear error messages if system dependencies are missing
- Tests should run without requiring system dependencies (mock canvas)
- Application should work immediately after following setup instructions

### Deliverables

1. **Complete project structure** with all necessary files
2. **Working application** that runs on first `docker-compose up --build`
3. **All tests passing** (mock tests at minimum)
4. **Documentation** including:
   - README with prerequisites and setup
   - Architecture decisions
   - Troubleshooting guide
5. **TypeScript definitions** for all shared contracts
6. **Docker configuration** for both services
7. **License files**:
   - `LICENSE` file in project root with full MIT license text
   - `NOTICES.md` or `THIRD_PARTY_LICENSES.md` with all dependency attributions
8. **Code quality compliance**:
   - All functions meet cyclomatic complexity limits (≤10)
   - No deprecated methods or packages in use
   - Security vulnerabilities addressed

### Success Criteria

- ✅ Application runs successfully with `docker-compose up --build`
- ✅ All 11 fractal methods generate valid card images
- ✅ Cards have correct dimensions, borders, and seamless patterns
- ✅ All mock tests pass
- ✅ Frontend displays generated images correctly
- ✅ "Go" and "Surprise Me" buttons work as specified
- ✅ No runtime errors in console
- ✅ System dependency requirements clearly documented
- ✅ **License Compliance**:
  - LICENSE file present with full MIT license text
  - NOTICES.md file lists all dependencies with proper attribution
  - All dependencies verified as MIT-compatible
  - All package.json files have `"license": "MIT"` field
  - README includes license section with link to LICENSE file
- ✅ **Code Quality**:
  - All functions have cyclomatic complexity ≤10
  - No deprecated methods or packages in use
  - ESLint complexity rules passing
  - No code smells (deep nesting, magic numbers, duplicate code)
  - All security vulnerabilities addressed (npm audit clean)
- ✅ **Fractal Pattern Quality**:
  - All fractal patterns fill ≥80% of available space
  - Patterns appear complete, not sparse
  - Adaptive iterations ensure coverage

### Known Challenges & Solutions

**Challenge 1: Canvas Native Module**
- **Issue**: Canvas requires system libraries to build native module
- **Solution**: Document system dependencies in README, provide platform-specific install commands
- **Fallback**: Mock canvas in tests to allow tests to run without system dependencies

**Challenge 2: Shared Types Across Services**
- **Issue**: Frontend can't import from outside `src/` directory
- **Solution**: Copy shared types into frontend `src/shared/` directory
- **Alternative**: Use monorepo tool (not required for this project)

**Challenge 3: TypeScript Version Conflicts**
- **Issue**: react-scripts 5.0.1 expects TypeScript 3-4, but we want TypeScript 5
- **Solution**: Use CRACO wrapper to customize react-scripts configuration, or use `--legacy-peer-deps` flag for npm install
- **Document**: Add note in README about this requirement

**Challenge 4: Module Resolution in Tests**
- **Issue**: Jest/TypeScript may have trouble resolving shared types
- **Solution**: Use re-export pattern in backend, copy files in frontend
- **Alternative**: Configure path mapping in tsconfig and jest.config

**Challenge 5: License Compliance & Attribution**
- **Issue**: Ensuring all dependencies are MIT-compatible and properly attributed
- **Solution**: Use `license-checker` tool to audit all licenses, create NOTICES file with all attributions
- **Verification**: Check transitive dependencies for incompatible licenses (GPL, AGPL)
- **Documentation**: Maintain NOTICES.md with package name, version, license, and repository link for each dependency

**Challenge 6: Cyclomatic Complexity Management**
- **Issue**: Complex fractal generation algorithms can exceed complexity limits
- **Solution**: Extract helper methods, use early returns, break complex conditionals into named functions
- **Tools**: Use ESLint complexity rules, consider SonarJS for analysis
- **Documentation**: Document any intentional complexity exceptions with justification

### Additional Notes

- **License Preference**: Use MIT-licensed libraries when possible. The project is released under MIT License, and all dependencies must be MIT-compatible. Any non-MIT dependencies require explicit justification and legal review.
- **Code Quality**: Prioritize clean, maintainable code over premature optimization. Follow cyclomatic complexity limits and code smell detection guidelines.
- **Architecture**: Ensure frontend and backend stay decoupled but contract-aligned. Follow clean architecture principles with clear layer boundaries.
- **Conflict Resolution**: If requirements conflict, prioritize clean architecture and feature-based boundaries.
- **Production Quality**: All code should be production-ready, not prototype quality. This includes proper error handling, security considerations, and comprehensive testing.
- **License Compliance**: All open source dependencies must be properly attributed in NOTICES file, and LICENSE file must be included in all distributions.

---

## Key Improvements Over Original Prompt

1. **Explicit System Dependencies**: Added critical section about canvas requirements upfront
2. **Shared Types Strategy**: Specified how to handle shared types (copy vs re-export)
3. **Dependency Management**: Mentioned known conflicts and solutions
4. **Dependency Documentation**: Complete audit requirements with all dependencies listed
5. **Deprecated Code Avoidance**: Requirements to avoid deprecated methods and upgrade packages
6. **Security-by-Design**: Comprehensive security requirements from the start
7. **Code Quality & Complexity**: Cyclomatic complexity limits and code smell detection
8. **MIT License Compliance**: Complete license compliance and open source attribution requirements
9. **Fractal Space-Filling**: Requirements for patterns to fill available space (≥80% coverage)
10. **Success Criteria**: Clear checklist of what "done" means including license and quality metrics
11. **Known Challenges**: Pre-identified common issues with solutions including license and complexity
12. **Development Experience**: Emphasized "works on first run" requirement
13. **Platform-Specific Instructions**: Included macOS and Linux commands
14. **Testing Strategy**: Clarified mock vs live tests, when to use each
15. **Error Handling**: Specified clear error messages for missing dependencies
16. **Documentation Requirements**: More specific about what needs to be documented
