import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
} from '../controllers/authController.js';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ==========================================
// Multer Disk Storage Configuration
// ==========================================
const uploadDir = path.join(__dirname, '../public/uploads');

// Synchronously create upload directory if missing
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration defining file destination and unique file names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Saves to backend/public/uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Filename format: avatar-TIMESTAMP-RANDOMNUMBER.extension
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter restricting uploads to valid image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG and PNG image files are allowed!'), false);
  }
};

// Initialize Multer upload middleware (Max file size: 2MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// ==========================================
// Auth Routing Endpoints
// ==========================================

// POST /api/auth/signup - Register new account
router.post('/signup', registerUser);

// POST /api/auth/login - Authenticate credentials and retrieve session JWT
router.post('/login', loginUser);

// GET /api/auth/profile - Fetch user profile information (Protected)
router.get('/profile', protect, getProfile);

// PUT /api/auth/profile - Modify user configuration settings (Protected)
router.put('/profile', protect, updateProfile);

// PUT /api/auth/password - Update user password securely (Protected)
router.put('/password', protect, updatePassword);

// PUT /api/auth/avatar - Upload profile avatar image (Protected, uploads via Multer middleware)
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
