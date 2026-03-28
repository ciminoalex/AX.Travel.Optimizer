import config from '../config.js';
import { searchCar } from './providers/car.js';
import { searchFlights } from './providers/flight.js';
import { searchTrains } from './providers/train.js';
import { scoreAndRank } from '../utils/scoring.js';
import { straightLineDistance } from '../utils/airports.js';

/**
 * Main optimization engine.
 * Geocodes locations, runs all providers in parallel, scores and ranks results.
 */
export async function optimize({ origin, destination, arrivalDatetime }) {
  // Step 1: Geocode both locations
  const [originGeo, destGeo] = await Promise.all([
    geocode(origin),
    geocode(destination),
  ]);

  if (!originGeo || !destGeo) {
    throw new Error('Impossibile geocodificare le località. Verifica i nomi inseriti.');
  }

  const originCoords = { lat: originGeo.lat, lng: originGeo.lng };
  const destCoords = { lat: destGeo.lat, lng: destGeo.lng };

  // Step 2: Calculate straight-line distance for smart filtering
  const distanceKm = straightLineDistance(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);

  const searchParams = {
    originCoords,
    destCoords,
    origin: originGeo.formattedAddress || origin,
    destination: destGeo.formattedAddress || destination,
    arrivalDatetime,
  };

  // Step 3: Determine which providers to query
  const providers = [];

  // Always search car
  providers.push(
    searchCar(searchParams).catch(err => {
      console.error('Car provider error:', err.message);
      return [];
    })
  );

  // Search trains (almost always useful in Italy/Europe)
  providers.push(
    searchTrains(searchParams).catch(err => {
      console.error('Train provider error:', err.message);
      return [];
    })
  );

  // Search flights only if distance > 100km
  if (distanceKm > 100) {
    providers.push(
      searchFlights(searchParams).catch(err => {
        console.error('Flight provider error:', err.message);
        return [];
      })
    );
  }

  // Step 4: Run all providers in parallel
  const providerResults = await Promise.all(providers);
  const allResults = providerResults.flat();

  if (allResults.length === 0) {
    throw new Error('Nessun risultato trovato. Verifica le località e la data.');
  }

  // Step 5: Apply distance-based penalties
  const adjustedResults = allResults.map(result => {
    let adjusted = { ...result };

    // Penalize car for very long distances (> 800km)
    if (result.transportType === 'car' && distanceKm > 800) {
      adjusted.score = (adjusted.score || 0) + 0.5; // Heavy penalty
      adjusted.details = {
        ...adjusted.details,
        warning: 'Distanza elevata per viaggio in auto (> 800km)',
      };
    }

    return adjusted;
  });

  // Step 6: Score and rank
  return scoreAndRank(adjustedResults);
}

/**
 * Geocode a location using Google Maps Geocoding API.
 */
async function geocode(address) {
  if (!config.googleMapsApiKey) {
    // Fallback: try to match known Italian cities
    return fallbackGeocode(address);
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('language', 'it');
  url.searchParams.set('key', config.googleMapsApiKey);

  const response = await fetch(url);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const result = data.results[0];
    return {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    };
  }

  return fallbackGeocode(address);
}

/**
 * Fallback geocoding for common Italian cities.
 * Used when Google Maps API key is not available.
 */
function fallbackGeocode(address) {
  const cities = {
    'roma': { lat: 41.9028, lng: 12.4964, formattedAddress: 'Roma, Italia' },
    'milano': { lat: 45.4642, lng: 9.19, formattedAddress: 'Milano, Italia' },
    'napoli': { lat: 40.8518, lng: 14.2681, formattedAddress: 'Napoli, Italia' },
    'torino': { lat: 45.0703, lng: 7.6869, formattedAddress: 'Torino, Italia' },
    'firenze': { lat: 43.7696, lng: 11.2558, formattedAddress: 'Firenze, Italia' },
    'bologna': { lat: 44.4949, lng: 11.3426, formattedAddress: 'Bologna, Italia' },
    'venezia': { lat: 45.4408, lng: 12.3155, formattedAddress: 'Venezia, Italia' },
    'genova': { lat: 44.4056, lng: 8.9463, formattedAddress: 'Genova, Italia' },
    'verona': { lat: 45.4384, lng: 10.9916, formattedAddress: 'Verona, Italia' },
    'padova': { lat: 45.4064, lng: 11.8768, formattedAddress: 'Padova, Italia' },
    'bari': { lat: 41.1171, lng: 16.8719, formattedAddress: 'Bari, Italia' },
    'palermo': { lat: 38.1157, lng: 13.3615, formattedAddress: 'Palermo, Italia' },
    'catania': { lat: 37.5079, lng: 15.083, formattedAddress: 'Catania, Italia' },
    'trieste': { lat: 45.6495, lng: 13.7768, formattedAddress: 'Trieste, Italia' },
    'brescia': { lat: 45.5416, lng: 10.2118, formattedAddress: 'Brescia, Italia' },
    'salerno': { lat: 40.6824, lng: 14.7681, formattedAddress: 'Salerno, Italia' },
    'pescara': { lat: 42.4618, lng: 14.2161, formattedAddress: 'Pescara, Italia' },
    'ancona': { lat: 43.6158, lng: 13.5189, formattedAddress: 'Ancona, Italia' },
    'perugia': { lat: 43.1107, lng: 12.3908, formattedAddress: 'Perugia, Italia' },
    'pisa': { lat: 43.7228, lng: 10.4017, formattedAddress: 'Pisa, Italia' },
    'parma': { lat: 44.8015, lng: 10.3279, formattedAddress: 'Parma, Italia' },
    'modena': { lat: 44.6471, lng: 10.9252, formattedAddress: 'Modena, Italia' },
    'bergamo': { lat: 45.6983, lng: 9.6773, formattedAddress: 'Bergamo, Italia' },
    'cagliari': { lat: 39.2238, lng: 9.1217, formattedAddress: 'Cagliari, Italia' },
    'rimini': { lat: 44.0678, lng: 12.5695, formattedAddress: 'Rimini, Italia' },
    'lecce': { lat: 40.3516, lng: 18.175, formattedAddress: 'Lecce, Italia' },
    'reggio calabria': { lat: 38.1112, lng: 15.6467, formattedAddress: 'Reggio Calabria, Italia' },
    'udine': { lat: 46.0711, lng: 13.2346, formattedAddress: 'Udine, Italia' },
    'bolzano': { lat: 46.4983, lng: 11.3548, formattedAddress: 'Bolzano, Italia' },
    'trento': { lat: 46.0747, lng: 11.1217, formattedAddress: 'Trento, Italia' },
  };

  const normalized = address.toLowerCase().trim();
  for (const [key, value] of Object.entries(cities)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}
