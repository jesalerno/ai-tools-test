/**
 * Entry point for backend service
 * Starts HTTP server
 */

import { Server } from './infrastructure/http/Server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const server = new Server();
server.listen(PORT);
