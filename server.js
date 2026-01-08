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

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy settings for rate limiting (important for deployment behind proxies/load balancers)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/community', communityRoutes);

// Serve static files from the frontend build only if the directory exists (production)
const frontendDistPath = path.join(__dirname, 'client/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // Serve frontend for all other routes in production
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});