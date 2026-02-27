# Third-Party Licenses and Notices

This project uses the following open source software packages. We are grateful to the maintainers and contributors of these projects.

## Backend Dependencies

### express (^4.18.2)
- **License:** MIT
- **Repository:** https://github.com/expressjs/express
- **Description:** Fast, unopinionated, minimalist web framework for Node.js
- **Usage:** Core web server framework for REST API

### cors (^2.8.5)
- **License:** MIT
- **Repository:** https://github.com/expressjs/cors
- **Description:** Node.js CORS middleware
- **Usage:** Cross-origin resource sharing for frontend-backend communication

### express-rate-limit (^7.5.0)
- **License:** MIT
- **Repository:** https://github.com/express-rate-limit/express-rate-limit
- **Description:** Rate limiting middleware for Express
- **Usage:** DoS attack prevention via request rate limiting

### canvas (^2.11.2)
- **License:** MIT
- **Repository:** https://github.com/Automattic/node-canvas
- **Description:** Cairo-backed Canvas implementation for Node.js
- **Usage:** Server-side image rendering for fractal card generation

### complex.js (^2.1.1)
- **License:** MIT
- **Repository:** https://github.com/infusion/Complex.js
- **Description:** Complex number library for JavaScript
- **Usage:** Complex number operations for fractal algorithms

### jest (^29.7.0)
- **License:** MIT
- **Repository:** https://github.com/facebook/jest
- **Description:** Delightful JavaScript Testing Framework
- **Usage:** Testing framework for backend unit tests

### supertest (^7.1.3)
- **License:** MIT
- **Repository:** https://github.com/ladjs/supertest
- **Description:** HTTP assertion library for testing Node.js HTTP servers
- **Usage:** API endpoint testing

### ts-jest (^29.1.1)
- **License:** MIT
- **Repository:** https://github.com/kulshekhar/ts-jest
- **Description:** TypeScript preprocessor for Jest
- **Usage:** TypeScript testing support

### ts-node-dev (^2.0.0)
- **License:** MIT
- **Repository:** https://github.com/wclr/ts-node-dev
- **Description:** TypeScript development server with hot reload
- **Usage:** Development server for backend

### typescript (^5.3.3)
- **License:** Apache-2.0
- **Repository:** https://github.com/microsoft/TypeScript
- **Description:** TypeScript language compiler
- **Usage:** Type checking and compilation for all TypeScript code

## Frontend Dependencies

### react (^18.2.0)
- **License:** MIT
- **Repository:** https://github.com/facebook/react
- **Description:** JavaScript library for building user interfaces
- **Usage:** Core UI framework for frontend application

### react-dom (^18.2.0)
- **License:** MIT
- **Repository:** https://github.com/facebook/react
- **Description:** React package for working with the DOM
- **Usage:** React DOM rendering

### react-scripts (5.0.1)
- **License:** MIT
- **Repository:** https://github.com/facebook/create-react-app
- **Description:** Configuration and scripts for Create React App
- **Usage:** Build tooling and development server

### @craco/craco (^7.1.0)
- **License:** Apache-2.0
- **Repository:** https://github.com/dilanx/craco
- **Description:** Create React App Configuration Override
- **Usage:** Customizing Create React App configuration for TypeScript 5 compatibility

## Development Dependencies

All development dependencies listed above are used only during development and testing, and are not included in production builds.

## License Compatibility

All dependencies are MIT or Apache-2.0 licensed, which are compatible with this project's MIT license. No GPL or AGPL dependencies are included.

## Transitive Dependencies

This project also depends on numerous transitive dependencies (dependencies of the above packages). All transitive dependencies have been reviewed and are compatible with MIT license requirements.

## Updating This File

When adding new dependencies:
1. Verify the license is MIT-compatible
2. Add entry to this file with package name, version, license, repository, and usage
3. Run `npm audit` to check for security vulnerabilities
4. Document any license compatibility considerations

---

Last updated: January 2026
