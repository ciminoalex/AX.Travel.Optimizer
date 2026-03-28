import config from '../../config.js';
import { findNearestAirports } from '../../utils/airports.js';

/**
 * Flight provider - uses Skyscanner API via RapidAPI.
 * Calculates door-to-door time including airport transfers.
 */
export async function searchFlights({ originCoords, destCoords, origin, destination, arrivalDatetime }) {
  if (!config.rapidApiKey) {
    throw new Error('RapidAPI key not configured');
  }

  const arrivalTime = new Date(arrivalDatetime);
  const searchDate = arrivalTime.toISOString().split('T')[0]; // YYYY-MM-DD

  // Find nearest airports
  const originAirports = findNearestAirports(originCoords.lat, originCoords.lng);
  const destAirports = findNearestAirports(destCoords.lat, destCoords.lng);

  if (originAirports.length === 0 || destAirports.length === 0) {
    return []; // No airports nearby
  }

  const results = [];

  // Search for flights between nearest airport pairs (limit to top pair for speed)
  const originAirport = originAirports[0];
  const destAirport = destAirports[0];

  // Skip if origin and destination airports are the same
  if (originAirport.code === destAirport.code) {
    return [];
  }

  try {
    const flights = await querySkyscanner(originAirport.code, destAirport.code, searchDate);

    for (const flight of flights) {
      // Calculate door-to-door time
      const transferToAirportMin = estimateTransferTime(originAirport.distanceKm);
      const transferFromAirportMin = estimateTransferTime(destAirport.distanceKm);
      const checkinMin = config.airportCheckinMinutes;
      const flightDurationMin = flight.durationMin;

      const totalDurationMin = transferToAirportMin + checkinMin + flightDurationMin + transferFromAirportMin;

      // Check if this flight allows arriving on time
      const flightArrival = new Date(flight.arrivalTime);
      const estimatedDoorArrival = new Date(flightArrival.getTime() + transferFromAirportMin * 60000);

      if (estimatedDoorArrival.getTime() > arrivalTime.getTime()) {
        continue; // Would arrive too late
      }

      const departureFromHome = new Date(
        new Date(flight.departureTime).getTime() - (transferToAirportMin + checkinMin) * 60000
      );

      results.push({
        transportType: 'flight',
        provider: flight.carrier || 'Skyscanner',
        departureTime: departureFromHome.toISOString(),
        arrivalTime: estimatedDoorArrival.toISOString(),
        durationMin: totalDurationMin,
        costEur: flight.price,
        details: {
          flightNumber: flight.flightNumber,
          carrier: flight.carrier,
          originAirport: `${originAirport.name} (${originAirport.code})`,
          destAirport: `${destAirport.name} (${destAirport.code})`,
          flightDepartureTime: flight.departureTime,
          flightArrivalTime: flight.arrivalTime,
          flightDurationMin,
          transferToAirportMin,
          transferFromAirportMin,
          checkinMin,
          stops: flight.stops,
        },
      });
    }
  } catch (err) {
    console.error(`Flight search error (${originAirport.code}-${destAirport.code}):`, err.message);
  }

  return results;
}

async function querySkyscanner(originCode, destCode, date) {
  // Step 1: Search for entity IDs
  const [originEntity, destEntity] = await Promise.all([
    searchAirportEntity(originCode),
    searchAirportEntity(destCode),
  ]);

  if (!originEntity || !destEntity) {
    return [];
  }

  // Step 2: Create flight search
  const searchUrl = 'https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlights';
  const params = new URLSearchParams({
    originSkyId: originCode,
    destinationSkyId: destCode,
    originEntityId: originEntity,
    destinationEntityId: destEntity,
    date,
    cabinClass: 'economy',
    adults: '1',
    sortBy: 'best',
    currency: 'EUR',
    market: 'IT',
    countryCode: 'IT',
  });

  const response = await fetch(`${searchUrl}?${params}`, {
    headers: {
      'x-rapidapi-key': config.rapidApiKey,
      'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
    },
  });

  const data = await response.json();

  if (!data.data?.itineraries) {
    return [];
  }

  // Parse results (take top 5)
  return data.data.itineraries.slice(0, 5).map(itinerary => {
    const leg = itinerary.legs?.[0];
    const price = itinerary.price?.raw || itinerary.price?.formatted;

    return {
      flightNumber: leg?.segments?.[0]?.flightNumber || '',
      carrier: leg?.carriers?.marketing?.[0]?.name || 'Unknown',
      departureTime: leg?.departure || '',
      arrivalTime: leg?.arrival || '',
      durationMin: leg?.durationInMinutes || 0,
      price: typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0,
      stops: leg?.stopCount || 0,
    };
  }).filter(f => f.durationMin > 0);
}

async function searchAirportEntity(skyId) {
  const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${skyId}&locale=it-IT`;
  const response = await fetch(url, {
    headers: {
      'x-rapidapi-key': config.rapidApiKey,
      'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
    },
  });
  const data = await response.json();
  return data.data?.[0]?.entityId || null;
}

function estimateTransferTime(distanceKm) {
  // Rough estimate: 2 min per km for airport transfer (city traffic + highway)
  // Minimum 20 minutes, maximum 90 minutes
  return Math.min(90, Math.max(20, Math.round(distanceKm * 2)));
}
