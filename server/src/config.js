import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

export default {
  port: parseInt(process.env.PORT || '3001', 10),
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  rapidApiKey: process.env.RAPIDAPI_KEY || '',
  dbPath: join(__dirname, '../data/travel.db'),
  dataDir: join(__dirname, '../data'),
  // Car cost parameters
  carCostPerKm: 0.30, // EUR per km (fuel + wear)
  // Flight parameters
  airportCheckinMinutes: 90,
  // Scoring weights (must sum to 1)
  durationWeight: 0.7,
  costWeight: 0.3,
  // Safety margin in minutes
  safetyMarginMinutes: 30,
};
