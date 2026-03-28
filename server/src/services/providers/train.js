import { findStationsForCity, extractCityName } from '../../utils/stations.js';
import config from '../../config.js';

/**
 * Train provider - uses Trainline EU internal API.
 * Searches for real train solutions with prices and schedules.
 */
export async function searchTrains({ originCoords, destCoords, origin, destination, arrivalDatetime }) {
  const arrivalTime = new Date(arrivalDatetime);

  const originCity = extractCityName(origin);
  const destCity = extractCityName(destination);

  try {
    // Step 1: Find station IDs via Trainline station search
    const [originStationId, destStationId] = await Promise.all([
      findTrainlineStation(originCity),
      findTrainlineStation(destCity),
    ]);

    if (!originStationId || !destStationId) {
      console.warn(`Train: stations not found for ${originCity} or ${destCity}, using fallback`);
      return fallbackEstimate(originCoords, destCoords, origin, destination, arrivalDatetime);
    }

    // Step 2: Search for train solutions
    // We search departing early enough to arrive on time
    // Search window: 12 hours before required arrival
    const searchFrom = new Date(arrivalTime.getTime() - 12 * 60 * 60 * 1000);

    const solutions = await searchTrainlineSolutions(originStationId, destStationId, searchFrom);

    if (solutions.length === 0) {
      return fallbackEstimate(originCoords, destCoords, origin, destination, arrivalDatetime);
    }

    // Step 3: Filter and format results
    const results = [];
    for (const sol of solutions) {
      const solArrival = new Date(sol.arrivalTime);
      // Must arrive before the required time (with safety margin)
      const deadline = new Date(arrivalTime.getTime() - config.safetyMarginMinutes * 60000);

      if (solArrival.getTime() <= deadline.getTime()) {
        results.push({
          transportType: 'train',
          provider: sol.carrier || 'Trainline',
          departureTime: sol.departureTime,
          arrivalTime: sol.arrivalTime,
          durationMin: sol.durationMin,
          costEur: sol.price,
          details: {
            trainType: sol.trainType,
            carrier: sol.carrier,
            originStation: sol.originStation,
            destStation: sol.destStation,
            changes: sol.changes,
          },
        });
      }
    }

    // If no results pass time filter, return the closest ones anyway (user can decide)
    if (results.length === 0 && solutions.length > 0) {
      // Return the latest-departing solutions that are closest to the deadline
      const closest = solutions
        .sort((a, b) => new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime())
        .slice(0, 3);

      for (const sol of closest) {
        results.push({
          transportType: 'train',
          provider: sol.carrier || 'Trainline',
          departureTime: sol.departureTime,
          arrivalTime: sol.arrivalTime,
          durationMin: sol.durationMin,
          costEur: sol.price,
          details: {
            trainType: sol.trainType,
            carrier: sol.carrier,
            originStation: sol.originStation,
            destStation: sol.destStation,
            changes: sol.changes,
            warning: 'Potrebbe non arrivare in tempo',
          },
        });
      }
    }

    return results.slice(0, 5);
  } catch (err) {
    console.error('Trainline API error:', err.message);
    return fallbackEstimate(originCoords, destCoords, origin, destination, arrivalDatetime);
  }
}

/**
 * Search for a station on Trainline EU by name.
 * Returns the Trainline station ID.
 */
async function findTrainlineStation(query) {
  const url = `https://www.trainline.eu/api/v5_1/stations?context=search&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'it-IT,it;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Trainline station search failed: ${response.status}`);
  }

  const data = await response.json();
  const stations = data.stations || [];

  if (stations.length === 0) return null;

  // Return the first station ID
  return stations[0].id;
}

/**
 * Search for train solutions on Trainline EU.
 */
async function searchTrainlineSolutions(originId, destId, departureDate) {
  const url = 'https://www.trainline.eu/api/v5_1/search';

  const body = {
    search: {
      departure_date: departureDate.toISOString(),
      return_date: null,
      passengers: [
        {
          id: 'passenger-1',
          age: 30,
          cards: [],
          label: 'adult',
        },
      ],
      systems: ['trenitalia', 'italo', 'sncf', 'db', 'ouigo', 'renfe', 'benerail'],
      departure_station_id: originId,
      arrival_station_id: destId,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'it-IT,it;q=0.9',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Trainline search failed: ${response.status} - ${text.substring(0, 200)}`);
  }

  const data = await response.json();

  // Parse the Trainline response format
  const trips = data.trips || [];
  const folders = data.folders || [];
  const stationsMap = {};
  for (const s of (data.stations || [])) {
    stationsMap[s.id] = s.name;
  }

  const results = [];

  for (const folder of folders) {
    try {
      const trip = trips.find(t => t.id === folder.trip_ids?.[0]);
      if (!trip) continue;

      const departureTime = trip.departure_date;
      const arrivalTime = trip.arrival_date;

      if (!departureTime || !arrivalTime) continue;

      const depDate = new Date(departureTime);
      const arrDate = new Date(arrivalTime);
      const durationMin = Math.round((arrDate - depDate) / 60000);

      // Get price from folder
      const price = folder.cents ? folder.cents / 100 : null;

      results.push({
        departureTime: depDate.toISOString(),
        arrivalTime: arrDate.toISOString(),
        durationMin,
        price: price || estimatePriceFromDuration(durationMin),
        trainType: trip.carrier || 'Train',
        carrier: trip.carrier || 'Unknown',
        originStation: stationsMap[trip.departure_station_id] || 'Unknown',
        destStation: stationsMap[trip.arrival_station_id] || 'Unknown',
        changes: (trip.segment_ids?.length || 1) - 1,
      });
    } catch {
      continue;
    }
  }

  return results;
}

/**
 * Fallback: estimate train journey based on straight-line distance.
 */
function fallbackEstimate(originCoords, destCoords, origin, destination, arrivalDatetime) {
  const R = 6371;
  const dLat = (destCoords.lat - originCoords.lat) * Math.PI / 180;
  const dLng = (destCoords.lng - originCoords.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(originCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Route distance is ~1.3x straight line
  const routeDistanceKm = distanceKm * 1.3;

  // High-speed train: ~250 km/h average (with stops)
  // Regional: ~80 km/h
  const isLongDistance = routeDistanceKm > 200;
  const avgSpeedKmh = isLongDistance ? 200 : 80;
  const durationMin = Math.round((routeDistanceKm / avgSpeedKmh) * 60);

  // Price estimate: ~€0.10/km for high-speed, ~€0.06/km for regional
  const pricePerKm = isLongDistance ? 0.10 : 0.06;
  const price = Math.round(routeDistanceKm * pricePerKm * 100) / 100;

  const arrivalTime = new Date(arrivalDatetime);
  const departureTime = new Date(arrivalTime.getTime() - (durationMin + config.safetyMarginMinutes) * 60000);

  return [{
    transportType: 'train',
    provider: 'Stima',
    departureTime: departureTime.toISOString(),
    arrivalTime: new Date(departureTime.getTime() + durationMin * 60000).toISOString(),
    durationMin,
    costEur: price,
    details: {
      trainType: isLongDistance ? 'Alta Velocità (stima)' : 'Regionale (stima)',
      carrier: 'Stima basata su distanza',
      originStation: origin,
      destStation: destination,
      distanceKm: Math.round(routeDistanceKm),
      isEstimate: true,
      warning: 'Dati stimati - API Trainline non disponibile',
    },
  }];
}

function estimatePriceFromDuration(durationMin) {
  // Rough estimate: about €0.50 per minute of travel for high-speed
  return Math.round(durationMin * 0.35 * 100) / 100;
}
