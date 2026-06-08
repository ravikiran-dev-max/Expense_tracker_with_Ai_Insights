import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getReportSummary } from '../controllers/reportController.js';

const router = express.Router();

// GET /api/reports/summary - Fetch summarized budget data grouped chronologically (Protected)
router.get('/summary', protect, getReportSummary);

export default router;
