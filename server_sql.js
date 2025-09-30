const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import SQL database configuration
const { sequelize, testConnection } = require('./config/database');

// Import SQL routes
const authRoutes = require('./routes/auth_sql');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Codespaces environment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration for Codespaces
const corsOptions = {
  origin: [
    'https://congenial-space-acorn-4j946xwxgpqxc7qw5-3001.app.github.dev',
    'http://localhost:3001',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Create database directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const dbDir = path.dirname(process.env.DATABASE_PATH || './database/moodai.db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Sync database (create tables)
    await sequelize.sync({ 
      force: false // Don't recreate tables, just create if they don't exist
    });
    console.log('✅ SQL Database tables synchronized');
    
    // Routes
    app.use('/api/auth', authRoutes);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'SQL (SQLite)',
        version: '2.0.0'
      });
    });
    
    // API info endpoint
    app.get('/api', (req, res) => {
      res.json({
        message: 'Mood AI API - SQL Version',
        version: '2.0.0',
        database: 'SQLite',
        endpoints: {
          auth: '/api/auth',
          health: '/health'
        }
      });
    });
    
    // Error handling middleware
    app.use(errorHandler);
    
    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Database: SQLite`);
      console.log(`🌐 Frontend: https://congenial-space-acorn-4j946xwxgpqxc7qw5-3001.app.github.dev`);
      console.log(`🔧 Backend: https://congenial-space-acorn-4j946xwxgpqxc7qw5-3000.app.github.dev`);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

// Initialize the application
initializeApp();