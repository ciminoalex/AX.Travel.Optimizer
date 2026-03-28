import config from '../../config.js';

/**
 * Car provider - uses Google Maps Directions API to get driving time and distance.
 * Cost estimated from distance (EUR/km).
 */
export async function searchCar({ originCoords, destCoords, origin, destination, arrivalDatetime }) {
  if (!config.googleMapsApiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const arrivalTime = new Date(arrivalDatetime);

  // Use Google Maps Directions API
  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', `${originCoords.lat},${originCoords.lng}`);
  url.searchParams.set('destination', `${destCoords.lat},${destCoords.lng}`);
  url.searchParams.set('mode', 'driving');
  url.searchParams.set('language', 'it');
  url.searchParams.set('departure_time', 'now');
  url.searchParams.set('key', config.googleMapsApiKey);

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.routes?.length) {
    return [];
  }

  const route = data.routes[0];
  const leg = route.legs[0];
  const durationSeconds = leg.duration.value;
  const durationMin = Math.ceil(durationSeconds / 60);
  const distanceMeters = leg.distance.value;
  const distanceKm = distanceMeters / 1000;

  // Estimate cost
  const fuelCost = distanceKm * config.carCostPerKm;
  // Rough toll estimate for Italian highways: ~€0.07/km
  const tollCost = distanceKm * 0.07;
  const totalCost = Math.round((fuelCost + tollCost) * 100) / 100;

  // Calculate departure time to arrive on time (with safety margin)
  const totalMinutesWithMargin = durationMin + config.safetyMarginMinutes;
  const departureTime = new Date(arrivalTime.getTime() - totalMinutesWithMargin * 60000);

  return [{
    transportType: 'car',
    provider: 'Google Maps',
    departureTime: departureTime.toISOString(),
    arrivalTime: new Date(departureTime.getTime() + durationMin * 60000).toISOString(),
    durationMin,
    costEur: totalCost,
    details: {
      distanceKm: Math.round(distanceKm),
      distanceText: leg.distance.text,
      durationText: leg.duration.text,
      fuelCost: Math.round(fuelCost * 100) / 100,
      tollCost: Math.round(tollCost * 100) / 100,
      route: leg.start_address + ' → ' + leg.end_address,
      summary: route.summary,
    },
  }];
}
