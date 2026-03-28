// Major Italian and European airports with coordinates
// Used to find nearest airport for flight searches
const AIRPORTS = [
  // Italy
  { code: 'FCO', name: 'Roma Fiumicino', city: 'Roma', lat: 41.8003, lng: 12.2389 },
  { code: 'CIA', name: 'Roma Ciampino', city: 'Roma', lat: 41.7994, lng: 12.5949 },
  { code: 'MXP', name: 'Milano Malpensa', city: 'Milano', lat: 45.6306, lng: 8.7281 },
  { code: 'LIN', name: 'Milano Linate', city: 'Milano', lat: 45.4454, lng: 9.2778 },
  { code: 'BGY', name: 'Bergamo Orio al Serio', city: 'Bergamo', lat: 45.6689, lng: 9.7004 },
  { code: 'NAP', name: 'Napoli Capodichino', city: 'Napoli', lat: 40.886, lng: 14.2908 },
  { code: 'VCE', name: 'Venezia Marco Polo', city: 'Venezia', lat: 45.5053, lng: 12.3519 },
  { code: 'BLQ', name: 'Bologna Marconi', city: 'Bologna', lat: 44.5354, lng: 11.2887 },
  { code: 'FLR', name: 'Firenze Peretola', city: 'Firenze', lat: 43.81, lng: 11.2051 },
  { code: 'PSA', name: 'Pisa Galilei', city: 'Pisa', lat: 43.6839, lng: 10.3927 },
  { code: 'CTA', name: 'Catania Fontanarossa', city: 'Catania', lat: 37.4668, lng: 15.0664 },
  { code: 'PMO', name: 'Palermo Falcone-Borsellino', city: 'Palermo', lat: 38.176, lng: 13.091 },
  { code: 'TRN', name: 'Torino Caselle', city: 'Torino', lat: 45.2006, lng: 7.6494 },
  { code: 'VRN', name: 'Verona Villafranca', city: 'Verona', lat: 45.3957, lng: 10.8885 },
  { code: 'BRI', name: 'Bari Palese', city: 'Bari', lat: 41.1389, lng: 16.7606 },
  { code: 'CAG', name: 'Cagliari Elmas', city: 'Cagliari', lat: 39.2515, lng: 9.0543 },
  { code: 'GOA', name: 'Genova Cristoforo Colombo', city: 'Genova', lat: 44.4133, lng: 8.8375 },
  { code: 'TRS', name: 'Trieste Ronchi dei Legionari', city: 'Trieste', lat: 45.8275, lng: 13.4722 },
  { code: 'SUF', name: 'Lamezia Terme', city: 'Lamezia Terme', lat: 38.9054, lng: 16.2423 },
  { code: 'OLB', name: 'Olbia Costa Smeralda', city: 'Olbia', lat: 40.8987, lng: 9.5176 },
  // Major European hubs
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Parigi', lat: 49.0097, lng: 2.5479 },
  { code: 'LHR', name: 'London Heathrow', city: 'Londra', lat: 51.47, lng: -0.4543 },
  { code: 'FRA', name: 'Frankfurt', city: 'Francoforte', lat: 50.0379, lng: 8.5622 },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', lat: 52.3086, lng: 4.7639 },
  { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid', lat: 40.4722, lng: -3.5608 },
  { code: 'BCN', name: 'Barcelona El Prat', city: 'Barcellona', lat: 41.2971, lng: 2.0785 },
  { code: 'MUC', name: 'Munich', city: 'Monaco di Baviera', lat: 48.3538, lng: 11.775 },
  { code: 'ZRH', name: 'Zurich', city: 'Zurigo', lat: 47.4647, lng: 8.5492 },
  { code: 'VIE', name: 'Vienna', city: 'Vienna', lat: 48.1103, lng: 16.5697 },
  { code: 'BRU', name: 'Brussels', city: 'Bruxelles', lat: 50.9014, lng: 4.4844 },
];

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find nearest airports to given coordinates, sorted by distance.
 * Returns top N airports within maxDistanceKm.
 */
export function findNearestAirports(lat, lng, { maxDistanceKm = 150, limit = 3 } = {}) {
  const results = AIRPORTS
    .map(airport => ({
      ...airport,
      distanceKm: Math.round(haversineDistance(lat, lng, airport.lat, airport.lng)),
    }))
    .filter(a => a.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return results;
}

/**
 * Calculate straight-line distance between two coordinate pairs.
 */
export function straightLineDistance(lat1, lng1, lat2, lng2) {
  return haversineDistance(lat1, lng1, lat2, lng2);
}
