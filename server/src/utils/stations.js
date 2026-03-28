// Major Italian train stations with Trainline-compatible names
// Used to map cities to station names for Trainline API search
const STATIONS = [
  { city: 'Roma', stations: ['Roma Termini', 'Roma Tiburtina'] },
  { city: 'Milano', stations: ['Milano Centrale', 'Milano Porta Garibaldi', 'Milano Rogoredo'] },
  { city: 'Napoli', stations: ['Napoli Centrale', 'Napoli Afragola'] },
  { city: 'Torino', stations: ['Torino Porta Nuova', 'Torino Porta Susa'] },
  { city: 'Firenze', stations: ['Firenze Santa Maria Novella', 'Firenze Campo di Marte'] },
  { city: 'Bologna', stations: ['Bologna Centrale'] },
  { city: 'Venezia', stations: ['Venezia Santa Lucia', 'Venezia Mestre'] },
  { city: 'Genova', stations: ['Genova Piazza Principe', 'Genova Brignole'] },
  { city: 'Verona', stations: ['Verona Porta Nuova'] },
  { city: 'Padova', stations: ['Padova'] },
  { city: 'Bari', stations: ['Bari Centrale'] },
  { city: 'Palermo', stations: ['Palermo Centrale'] },
  { city: 'Catania', stations: ['Catania Centrale'] },
  { city: 'Trieste', stations: ['Trieste Centrale'] },
  { city: 'Brescia', stations: ['Brescia'] },
  { city: 'Reggio Emilia', stations: ['Reggio Emilia AV Mediopadana'] },
  { city: 'Salerno', stations: ['Salerno'] },
  { city: 'Pescara', stations: ['Pescara Centrale'] },
  { city: 'Ancona', stations: ['Ancona'] },
  { city: 'Perugia', stations: ['Perugia'] },
  { city: 'Pisa', stations: ['Pisa Centrale'] },
  { city: 'Parma', stations: ['Parma'] },
  { city: 'Modena', stations: ['Modena'] },
  { city: 'Bergamo', stations: ['Bergamo'] },
  { city: 'Vicenza', stations: ['Vicenza'] },
  { city: 'Udine', stations: ['Udine'] },
  { city: 'Cagliari', stations: ['Cagliari'] },
  { city: 'Reggio Calabria', stations: ['Reggio Calabria Centrale'] },
  { city: 'Lecce', stations: ['Lecce'] },
  { city: 'Rimini', stations: ['Rimini'] },
  { city: 'Bolzano', stations: ['Bolzano'] },
  { city: 'Trento', stations: ['Trento'] },
  // Major European cities
  { city: 'Parigi', stations: ['Paris Gare de Lyon'] },
  { city: 'Zurigo', stations: ['Zürich HB'] },
  { city: 'Monaco di Baviera', stations: ['München Hbf'] },
  { city: 'Vienna', stations: ['Wien Hbf'] },
  { city: 'Nizza', stations: ['Nice-Ville'] },
  { city: 'Ginevra', stations: ['Genève'] },
  { city: 'Lione', stations: ['Lyon Part-Dieu'] },
  { city: 'Marsiglia', stations: ['Marseille-Saint-Charles'] },
];

/**
 * Find the main train station(s) for a given city name.
 * Uses fuzzy matching on city name.
 */
export function findStationsForCity(cityName) {
  const normalized = cityName.toLowerCase().trim();

  // Exact match first
  const exact = STATIONS.find(s => s.city.toLowerCase() === normalized);
  if (exact) return exact.stations;

  // Partial match (city name contained in search or vice versa)
  const partial = STATIONS.find(s =>
    s.city.toLowerCase().includes(normalized) || normalized.includes(s.city.toLowerCase())
  );
  if (partial) return partial.stations;

  // No match - return city name itself as station search query
  return [cityName];
}

/**
 * Extract city name from a formatted address.
 * Example: "Roma, RM, Italia" -> "Roma"
 */
export function extractCityName(address) {
  // Try to extract the first meaningful part
  const parts = address.split(',').map(p => p.trim());
  // Remove country, province codes, etc.
  if (parts.length >= 2) {
    return parts[0];
  }
  return address;
}
