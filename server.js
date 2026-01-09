const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const carbonRoutes = require('./routes/carbon');
const newsRoutes = require('./routes/news');
const communityRoutes = require('./routes/community');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware - ordered for optimal performance
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }  // Allow fonts from CDN
}));

// CORS configuration optimized for development vs production
const corsOptions = {
  origin: isProduction 
    ? process.env.CLIENT_URL || 'https://yourdomain.com'  // Production URL
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://*.githubpreview.dev', 'https://*.preview.app.github.dev'],  // Development URLs for Codespaces
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy settings for rate limiting (important for deployment behind proxies/load balancers)
app.set('trust proxy', 1);  // 1 = trust first proxy, adjust based on your deployment setup

// Rate limiting - optimized for development vs production
const limiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 60 * 1000, // 15 min in prod, 1 min in dev
  max: isProduction ? 100 : 1000, // limit each IP to 100 requests per windowMs in prod, 1000 in dev
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development for easier debugging
  skip: !isProduction ? () => true : undefined
});
app.use(limiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/community', communityRoutes);

// In development, don't serve the frontend from the backend
if (isProduction) {
  // Serve static files from the frontend build only if the directory exists (production)
  const frontendDistPath = path.join(__dirname, 'client/dist');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    
    // Serve frontend for all other routes in production
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    console.warn('Frontend build not found in production mode. Make sure to run `npm run build` before starting production server.');
  }
} else {
  // In development, provide a clear message for non-API routes
  console.log(`Server running in development mode. API available at http://localhost:${PORT}`);
  console.log(`Frontend should be served by Vite dev server at http://localhost:5173`);
  
  // For any non-API routes in development, return a helpful message
  app.get(/^(?!\/api\/).+/, (req, res) => {
    res.json({ 
      message: 'Development mode: Frontend is served by Vite dev server', 
      frontendUrl: 'http://localhost:5173',
      apiRoutes: [
        '/api/auth',
        '/api/carbon', 
        '/api/news',
        '/api/community'
      ]
    });
  });
}

app.listen(PORT, () => {
  const mode = isProduction ? 'production' : 'development';
  console.log(`Server running in ${mode} mode on port ${PORT}`);
});