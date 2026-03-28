import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config.js';
import placesRouter from './routes/places.js';
import searchRouter from './routes/search.js';
import historyRouter from './routes/history.js';
import { getDb } from './db/database.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/places', placesRouter);
app.use('/api/search', searchRouter);
app.use('/api/history', historyRouter);

// Health check
app.get('/api/health', (req, res) => {
  const warnings = [];
  if (!config.googleMapsApiKey) warnings.push('GOOGLE_MAPS_API_KEY non configurata');
  if (!config.rapidApiKey) warnings.push('RAPIDAPI_KEY non configurata');
  res.json({ status: 'ok', warnings });
});

// Initialize DB on startup
getDb();

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  if (!config.googleMapsApiKey) console.warn('WARNING: GOOGLE_MAPS_API_KEY not set');
  if (!config.rapidApiKey) console.warn('WARNING: RAPIDAPI_KEY not set');
});
