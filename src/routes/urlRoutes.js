import express from 'express';
import urlController from '../controllers/urlController.js';
const router = express.Router();

// URL kısaltma (POST /api/shorten)
router.post('/shorten', urlController.shortenUrl);

// URL yönlendirme (GET /:code)
router.get('/:code', urlController.redirect);

export default router;
