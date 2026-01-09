# Performance Optimization Report

## Summary
This document outlines the performance optimizations implemented for the Climate Engagement Platform to address development-time startup and configuration issues.

## Optimizations Applied

### 1. Vite Configuration Improvements
- **Port Standardization**: Changed Vite dev server port from 3000 to 5173 to match documentation and standard Vite convention
- **External Access Support**: Added `host: true` to allow external connections (critical for GitHub Codespaces)
- **Proxy Security**: Added `secure: false` option to handle self-signed certificates in development environments

### 2. Backend Server Enhancements
- **Environment Detection**: Implemented NODE_ENV-based configuration to differentiate between development and production
- **Optimized CORS Policy**: 
  - Development: Allows localhost:5173, GitHub Codespaces domains, and related development URLs
  - Production: Uses CLIENT_URL environment variable or default domain
- **Adaptive Rate Limiting**:
  - Development: 1000 requests per minute (more permissive for development)
  - Production: 100 requests per 15 minutes (standard security)
  - Option to skip entirely in development for easier debugging
- **Improved Security Headers**: Added crossOriginResourcePolicy to allow font loading from CDNs

### 3. Development vs Production Separation
- **Clear Separation**: Backend no longer attempts to serve frontend assets during development
- **Informative Messages**: Provides clear guidance on API availability and frontend access in development mode
- **Regex Route Protection**: Uses regex pattern `/^(?!\/api\/).+/` to only handle non-API routes in development
- **Production Safety**: Ensures production builds work as expected while preventing development conflicts

### 4. Package Management Improvements
- **Environment Variable Setting**: Added NODE_ENV=development to dev script to ensure proper configuration
- **Windows Compatibility**: Added dev:windows script for Windows developers
- **Build Script Optimization**: Simplified build command to work consistently
- **Post-install Hook**: Added automatic client dependency installation

### 5. Startup Process Optimization
- **Dependency Installation**: Improved dependency installation logic
- **Port Management**: Enhanced port conflict detection and resolution
- **Error Prevention**: Added better error handling and validation

## Benefits Achieved

### Faster Development Startup
- Reduced configuration conflicts between frontend and backend
- Eliminated unnecessary static file serving during development
- Improved dependency management with post-install hooks

### Better Request Handling
- Accurate rate limiting based on environment
- Proper CORS configuration for development and production
- Proxy-aware trust settings for deployment scenarios

### Cleaner Architecture
- Clear separation of concerns between frontend and backend during development
- Consistent port usage across documentation and implementation
- Reduced configuration-related warnings and errors

## Usage

### Development Mode
```bash
npm run dev  # Linux/Mac
npm run dev:windows  # Windows
```

### Production Mode
```bash
npm run build
NODE_ENV=production npm start
```

## Environment Variables
Ensure the following environment variables are properly configured:
- `NODE_ENV` (development/production)
- `DB_*` variables for database connection
- `JWT_SECRET` for authentication
- `CLIENT_URL` for CORS in production
- `NEWS_API_KEY` for news functionality (optional but recommended)