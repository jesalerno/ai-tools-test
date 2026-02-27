/**
 * Re-export shared types for backend use
 * This file allows the backend to import types using a local path
 * while still using the shared types from the root
 */

// Use explicit .js extension for runtime (TypeScript allows this)
export * from '../../../shared/types.js';
