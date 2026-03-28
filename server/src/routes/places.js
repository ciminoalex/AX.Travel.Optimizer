import { Router } from 'express';
import config from '../config.js';

const router = Router();

// Proxy Google Places Autocomplete to avoid exposing API key on client
router.get('/autocomplete', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json({ predictions: [] });
  }

  if (!config.googleMapsApiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', q);
    url.searchParams.set('types', '(cities)');
    url.searchParams.set('language', 'it');
    url.searchParams.set('components', 'country:it|country:de|country:fr|country:es|country:ch|country:at|country:gb');
    url.searchParams.set('key', config.googleMapsApiKey);

    const response = await fetch(url);
    const data = await response.json();

    const predictions = (data.predictions || []).map(p => ({
      description: p.description,
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text,
      secondaryText: p.structured_formatting?.secondary_text,
    }));

    res.json({ predictions });
  } catch (err) {
    console.error('Places autocomplete error:', err.message);
    res.status(500).json({ error: 'Failed to fetch place suggestions' });
  }
});

// Geocode a place (get coordinates from place name or place_id)
router.get('/geocode', async (req, res) => {
  const { address, placeId } = req.query;
  if (!address && !placeId) {
    return res.status(400).json({ error: 'address or placeId required' });
  }

  if (!config.googleMapsApiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    if (placeId) {
      url.searchParams.set('place_id', placeId);
    } else {
      url.searchParams.set('address', address);
    }
    url.searchParams.set('language', 'it');
    url.searchParams.set('key', config.googleMapsApiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      res.json({
        formattedAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (err) {
    console.error('Geocode error:', err.message);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

export default router;
