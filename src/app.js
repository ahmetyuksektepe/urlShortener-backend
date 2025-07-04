import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import urlController from './controllers/urlController.js';

const app = express();


app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// URL kısaltma
app.post('/api/shorten', urlController.shortenUrl);

// URL istatistikleri
app.get('/api/stats/:code', urlController.getStats);

// Kısa URL yönlendirme
app.get('/:code', urlController.redirect);

// Temel 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
