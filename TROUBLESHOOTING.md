# Troubleshooting Guide: Vite + Express Development Setup

This guide addresses common issues that occur during development startup of the Vite + Express application.

## Issue 1: "vite: not found" Error

### Problem
Frontend fails to start with error: `sh: 1: vite: not found`

### Root Cause
The Vite development server binary is not available because:
- Client dependencies haven't been installed (`npm install` in client directory)
- Vite is not listed in devDependencies or installation failed
- Node modules were corrupted or incomplete

### Solution
1. Navigate to the client directory and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Or run the installation script:
   ```bash
   ./install-client-deps.sh
   ```

3. Verify Vite is available:
   ```bash
   cd client
   npx vite --version
   ```

## Issue 2: express-rate-limit Validation Error

### Problem
Backend logs validation error related to proxy headers, typically:
```
express-rate-limit: A configuration error occurred.
X-Forwarded-For header was received but the trust proxy setting was not enabled.
```

### Root Cause
The express-rate-limit middleware receives X-Forwarded-For headers (common in proxy/load balancer environments like GitHub Codespaces) but the Express app doesn't have trust proxy enabled.

### Solution
The server.js file has been updated to include:
```javascript
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Issue 3: ENOENT Error for client/dist/index.html

### Problem
Server throws error when attempting to stat `client/dist/index.html`:
```
Error: ENOENT: no such file or directory, stat 'client/dist/index.html'
```

### Root Cause
In development mode, the server tries to serve production build assets (`client/dist`) which don't exist until a build is performed.

### Solution
The server.js file has been updated to conditionally serve static files only if the build directory exists:
```javascript
const frontendDistPath = path.join(__dirname, 'client/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // In development, serve API only and let Vite handle frontend
  console.log('Frontend build not found. Running in development mode.');
  app.get('*', (req, res) => {
    res.json({ message: 'API server running. Frontend should be served by Vite dev server.' });
  });
}
```

## Complete Development Setup

### 1. Install all dependencies:
```bash
npm install
cd client && npm install && cd ..
```

### 2. Run the development environment:
```bash
npm run dev
```

### 3. In separate terminals (if concurrently doesn't work):
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
cd client && npm run dev
```

## Verification Steps

1. **Check that concurrently is available:**
   ```bash
   npm list concurrently
   ```

2. **Verify client dependencies are installed:**
   ```bash
   ls client/node_modules | grep vite
   ```

3. **Test backend server directly:**
   ```bash
   node server.js
   ```

4. **Check that the server starts without the static file error:**
   - Look for "Frontend build not found. Running in development mode." message
   - The server should start successfully on port 5000

## Prevention

To prevent these issues in the future:

1. Always run `npm run install-all` to install dependencies for both backend and frontend
2. Use the provided `setup-dev-environment.sh` script for complete setup
3. Verify dependencies are installed before starting development
4. Use environment-specific configurations in package.json scripts