import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import Express Router modules
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Standard ES module definitions for file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local environmental configurations (.env file)
dotenv.config();

// Initialize connection with the MongoDB Database
connectDB();

// Create Express application instance
const app = express();

// ==========================================
// Middleware Configuration
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ==========================================
// API Routing Endpoints mapping
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Server Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ success: true, message: 'Expense-Tracker API is running smoothly' });
});

// Root API landing page
app.get('/', (req, res) => {
  res.send('Expense Tracker API Server is online.');
});

// ==========================================
// Global Error Handler Middleware
// ==========================================
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Upload failed: File size exceeds the 2MB limit!',
    });
  }

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ==========================================
// Server Listener
// ==========================================
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Your backend is started on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(PORT) + 1;
    app.listen(fallbackPort, () => {
      console.log(`Your backend is started on port ${fallbackPort}`);
    });
  } else {
    console.error('Server failed to start:', err);
  }
});

// Gracefully handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  server.close(() => process.exit(1));
});
