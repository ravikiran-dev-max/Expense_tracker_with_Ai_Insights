import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAIAnalytics, chatAssistant } from '../controllers/aiController.js';

const router = express.Router();

// Apply auth protection middleware to all AI endpoints
router.use(protect);

// GET /api/ai/analytics - Retrieve AI-driven financial insights and advice
router.get('/analytics', getAIAnalytics);

// POST /api/ai/chat - Process conversation queries with chatbot assistant
router.post('/chat', chatAssistant);

export default router;
