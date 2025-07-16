import express from 'express';
import { incrementVisitor, getVisitorCount } from '../controllers/visitorController.js';

const router = express.Router();

// ✅ These routes are relative to "/api/visitor" as base
router.post('/', incrementVisitor);        // POST /api/visitor
router.get('/count', getVisitorCount);     // GET /api/visitor/count

export default router;
