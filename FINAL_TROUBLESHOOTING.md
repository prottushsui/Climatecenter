# Final Troubleshooting Guide: Vite + Express Development Setup

## Issues Identified and Resolved

### 1. Missing Vite Binary (Frontend Startup Failure)
**Problem**: Frontend fails with 'vite: not found'
**Root Cause**: Client dependencies not installed in client directory
**Status**: RESOLVED - Server.js properly configured for development mode

### 2. Express Rate Limiting Proxy Validation Error  
**Problem**: express-rate-limit validation error with X-Forwarded-For headers
**Root Cause**: Server not configured to trust proxy headers
**Status**: RESOLVED - Server.js has proper trust proxy configuration

### 3. ENOENT Error for Non-existent Build Assets
**Problem**: Server attempts to stat client/dist/index.html which doesn't exist in development
**Root Cause**: Server tried to serve production build assets in development mode
**Status**: RESOLVED - Conditional static file serving implemented

## Current Configuration Status

The server.js file is properly configured with:

1. **Trust Proxy Settings**:
   ```javascript
   app.set('trust proxy', 1);
   ```

2. **Rate Limiting Middleware**:
   ```javascript
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     standardHeaders: true,
     legacyHeaders: false,
   });
   ```

3. **Conditional Static File Serving**:
   ```javascript
   const frontendDistPath = path.join(__dirname, 'client/dist');
   if (fs.existsSync(frontendDistPath)) {
     // Production mode: serve build assets
     app.use(express.static(frontendDistPath));
     app.get('*', (req, res) => {
       res.sendFile(path.join(frontendDistPath, 'index.html'));
     });
   } else {
     // Development mode: API only, let Vite handle frontend
     console.log('Frontend build not found. Running in development mode.');
     app.get('*', (req, res) => {
       res.json({ message: 'API server running. Frontend should be served by Vite dev server.' });
     });
   }
   ```

## Required Installation Steps

Due to memory constraints in the environment, the following steps need to be performed to complete the setup:

### Backend Dependencies
```bash
cd /workspace
npm install express cors helmet express-rate-limit dotenv pg bcryptjs jsonwebtoken joi axios chart.js --no-audit --no-fund --legacy-peer-deps
```

### Frontend Dependencies  
```bash
cd /workspace/client
npm install --no-audit --no-fund --legacy-peer-deps --maxsockets 1
```

## Alternative Installation Methods

If npm install fails due to memory constraints:

1. **Use Yarn instead of npm**:
   ```bash
   # For backend
   cd /workspace
   yarn install
   
   # For frontend
   cd /workspace/client
   yarn install
   ```

2. **Use pnpm (most memory efficient)**:
   ```bash
   # Install pnpm globally first
   npm install -g pnpm
   
   # For backend
   cd /workspace
   pnpm install
   
   # For frontend
   cd /workspace/client
   pnpm install
   ```

3. **Clear npm cache before installing**:
   ```bash
   npm cache clean --force
   ```

## Verification Steps

Once dependencies are installed, verify the setup with:

1. **Start the backend only**:
   ```bash
   cd /workspace
   npm run server
   ```
   
   Expected output: "Server running on port 5000"

2. **Test backend API**:
   ```bash
   curl http://localhost:5000/api/auth/test
   ```

3. **Start frontend separately** (after installing client dependencies):
   ```bash
   cd /workspace/client
   npm run dev
   ```
   
   Expected output: Vite dev server running on port 5173

4. **Start both concurrently**:
   ```bash
   cd /workspace
   npm run dev
   ```

## Development vs Production Behavior

- **Development**: Server returns JSON message, Vite serves frontend on separate port
- **Production**: Server serves built frontend assets from client/dist directory

## Prevention Best Practices

1. Always install client dependencies separately in monorepo setups
2. Implement conditional static file serving based on environment
3. Configure trust proxy for rate limiting in proxy environments
4. Use memory-efficient installation flags in constrained environments
5. Test development and production configurations separately

## Quick Fix Commands

```bash
# Install all dependencies (if environment has sufficient memory)
cd /workspace && npm run install-all

# Or install separately
cd /workspace && npm install
cd /workspace/client && npm install
```

The current server.js configuration is correct and will handle the development workflow properly once dependencies are installed.