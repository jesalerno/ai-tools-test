# Third-Party Licenses

This project is MIT licensed. The packages below are direct dependencies and dev dependencies used to build and test the project.

## Backend
| Package | Version | License | Repository | Usage |
| --- | --- | --- | --- | --- |
| express | ^5.2.1 | MIT | https://github.com/expressjs/express | REST API framework |
| cors | ^2.8.5 | MIT | https://github.com/expressjs/cors | CORS middleware |
| express-rate-limit | ^8.2.1 | MIT | https://github.com/express-rate-limit/express-rate-limit | API rate limiting |
| @napi-rs/canvas | ^0.1.95 | MIT | https://github.com/Brooooooklyn/canvas | Server-side JPEG rendering |
| complex.js | ^2.1.1 | MIT | https://github.com/infusion/Complex.js | Complex arithmetic for phase plots |
| supertest | ^7.2.2 | MIT | https://github.com/ladjs/supertest | HTTP API assertions |
| tsx | ^4.19.2 | MIT | https://github.com/esbuild-kit/tsx | TypeScript runtime for tests and dev reload |
| typescript | ^5.9.3 | Apache-2.0 | https://github.com/microsoft/TypeScript | Type checking and build |
| eslint | ^10.0.2 | MIT | https://github.com/eslint/eslint | Linting |
| @typescript-eslint/eslint-plugin | ^8.56.1 | MIT | https://github.com/typescript-eslint/typescript-eslint | TypeScript lint rules |
| @typescript-eslint/parser | ^8.56.1 | BSD-2-Clause | https://github.com/typescript-eslint/typescript-eslint | TypeScript parser for ESLint |

## Frontend
| Package | Version | License | Repository | Usage |
| --- | --- | --- | --- | --- |
| react | ^19.2.4 | MIT | https://github.com/facebook/react | UI rendering |
| react-dom | ^19.2.4 | MIT | https://github.com/facebook/react | DOM renderer |
| vite | ^7.3.1 | MIT | https://github.com/vitejs/vite | Frontend dev server and build |
| @vitejs/plugin-react | ^5.1.4 | MIT | https://github.com/vitejs/vite-plugin-react | React support for Vite |
| ajv | ^8.17.1 | MIT | https://github.com/ajv-validator/ajv | API JSON schema validation |
| typescript | ^5.9.3 | Apache-2.0 | https://github.com/microsoft/TypeScript | Type checking |

## Notes
- MIT-compatible and permissive licenses are used for direct dependencies.
- Re-run `npm audit` and a license scanner (`license-checker`) before releases.
