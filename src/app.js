import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import urlRoutes from './routes/urlRoutes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


app.use('/api', urlRoutes);


app.use('/', urlRoutes);


app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
