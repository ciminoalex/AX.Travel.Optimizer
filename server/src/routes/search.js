import { Router } from 'express';
import { optimize } from '../services/optimizer.js';
import { saveSearch, saveSearchResults } from '../db/database.js';

const router = Router();

router.post('/', async (req, res) => {
  const { origin, destination, arrivalDatetime } = req.body;

  if (!origin || !destination || !arrivalDatetime) {
    return res.status(400).json({
      error: 'Campi obbligatori: origin, destination, arrivalDatetime',
    });
  }

  // Validate arrivalDatetime is a valid ISO date
  const arrivalDate = new Date(arrivalDatetime);
  if (isNaN(arrivalDate.getTime())) {
    return res.status(400).json({ error: 'arrivalDatetime non valido. Usa formato ISO (es. 2025-04-15T10:00:00)' });
  }

  try {
    const results = await optimize({ origin, destination, arrivalDatetime });

    const best = results[0] || null;

    // Save to database
    const searchId = saveSearch({
      origin,
      destination,
      arrivalDatetime,
      bestOption: best?.transportType || null,
      bestDurationMin: best?.durationMin || null,
      bestCostEur: best?.costEur || null,
    });

    saveSearchResults(searchId, results);

    res.json({
      searchId,
      origin,
      destination,
      arrivalDatetime,
      results,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Errore durante la ricerca: ' + err.message });
  }
});

export default router;
