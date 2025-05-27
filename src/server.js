const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const database = require('./config/database');
const csvRoutes = require('./routes/csvRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/csv', csvRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'CSV to JSON Converter API',
    version: '1.0.0',
    endpoints: {
      'POST /api/csv/upload': 'Upload and process CSV file',
      'POST /api/csv/process-path': 'Process CSV file from file path',
      'GET /api/csv/age-distribution': 'Get age distribution report',
      'GET /api/csv/users': 'Get all users',
      'DELETE /api/csv/users': 'Clear all users',
      'GET /health': 'Health check'
    },
    csvFormat: {
      mandatoryFields: ['name.firstName', 'name.lastName', 'age'],
      example: 'name.firstName,name.lastName,age,address.line1,address.city,gender'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await database.initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

startServer();