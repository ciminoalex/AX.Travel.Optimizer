import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlaces } from '../hooks/usePlaces';
import { useSearch } from '../hooks/useSearch';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TripSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, loading, error, search } = useSearch();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [activeField, setActiveField] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeWeight, setTimeWeight] = useState(75);

  const originPlaces = usePlaces();
  const destPlaces = usePlaces();
  const originRef = useRef(null);
  const destRef = useRef(null);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setArrivalDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Handle replay from dashboard
  useEffect(() => {
    if (location.state) {
      const { origin: o, destination: d, arrivalDatetime } = location.state;
      if (o) setOrigin(o);
      if (d) setDestination(d);
      if (arrivalDatetime) {
        const [date, time] = arrivalDatetime.split('T');
        setArrivalDate(date);
        setArrivalTime(time?.substring(0, 5) || '09:00');
      }
    }
  }, [location.state]);

  // Navigate to comparison when results arrive
  useEffect(() => {
    if (results && results.results && results.results.length > 0) {
      navigate('/comparison', { state: { searchResults: results } });
    }
  }, [results, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination || !arrivalDate || !arrivalTime) return;
    const arrivalDatetime = `${arrivalDate}T${arrivalTime}:00`;
    search({ origin, destination, arrivalDatetime });
  };

  const handleOriginChange = (value) => {
    setOrigin(value);
    originPlaces.search(value);
    setActiveField('origin');
  };

  const handleDestChange = (value) => {
    setDestination(value);
    destPlaces.search(value);
    setActiveField('destination');
  };

  const selectSuggestion = (field, suggestion) => {
    const text = suggestion.description || suggestion.mainText;
    if (field === 'origin') {
      setOrigin(text);
      originPlaces.clear();
    } else {
      setDestination(text);
      destPlaces.clear();
    }
    setActiveField(null);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!originRef.current?.contains(e.target) && !destRef.current?.contains(e.target)) {
        setActiveField(null);
        originPlaces.clear();
        destPlaces.clear();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [originPlaces, destPlaces]);

  if (loading) {
    return (
      <div className="p-10 flex-1 max-w-5xl mx-auto w-full flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="p-10 flex-1 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-12">
        <span className="inline-block px-3 py-1 bg-tertiary-container text-tertiary-fixed font-bold text-[10px] tracking-widest uppercase rounded-full mb-4">
          Ottimizzazione Percorso
        </span>
        <h2 className="text-4xl font-black text-on-primary-fixed tracking-tighter leading-tight">
          Pianifica il tuo
          <br />
          prossimo viaggio.
        </h2>
        <p className="text-secondary mt-3 max-w-lg leading-relaxed">
          Inserisci partenza, destinazione e orario di arrivo. Il sistema confronta treno, aereo e
          auto per trovare la soluzione ottimale.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 bg-error-container/30 border border-error/20 p-4 rounded-xl">
          <p className="text-error font-semibold text-sm">Errore nella ricerca</p>
          <p className="text-on-error-container text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Main Input Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column: Core Parameters */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
              {/* Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div ref={originRef} className="space-y-2 relative">
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">
                    Luogo di Partenza
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container opacity-40">
                      location_on
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface font-semibold focus:ring-2 focus:ring-primary/10 transition-all focus:outline-none"
                      type="text"
                      value={origin}
                      onChange={(e) => handleOriginChange(e.target.value)}
                      onFocus={() => setActiveField('origin')}
                      placeholder="Da dove parti?"
                      required
                    />
                  </div>
                  {activeField === 'origin' && originPlaces.suggestions.length > 0 && (
                    <SuggestionsDropdown
                      suggestions={originPlaces.suggestions}
                      onSelect={(s) => selectSuggestion('origin', s)}
                    />
                  )}
                </div>
                <div ref={destRef} className="space-y-2 relative">
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">
                    Destinazione
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container opacity-40">
                      flight_takeoff
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface font-semibold focus:ring-2 focus:ring-primary/10 transition-all focus:outline-none"
                      type="text"
                      value={destination}
                      onChange={(e) => handleDestChange(e.target.value)}
                      onFocus={() => setActiveField('destination')}
                      placeholder="Dove devi andare?"
                      required
                    />
                  </div>
                  {activeField === 'destination' && destPlaces.suggestions.length > 0 && (
                    <SuggestionsDropdown
                      suggestions={destPlaces.suggestions}
                      onSelect={(s) => selectSuggestion('destination', s)}
                    />
                  )}
                </div>
                {/* Swap button */}
                <div className="hidden md:flex absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-surface-container rounded-full items-center justify-center shadow-sm z-10 text-primary cursor-pointer hover:bg-surface-container-low transition-colors"
                  onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }}
                >
                  <span className="material-symbols-outlined text-lg">swap_horiz</span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">
                  Data e Ora di Arrivo Richiesta
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container opacity-40">
                      calendar_today
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface font-semibold focus:ring-2 focus:ring-primary/10 transition-all focus:outline-none"
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container opacity-40">
                      schedule
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface font-semibold focus:ring-2 focus:ring-primary/10 transition-all focus:outline-none"
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center mt-2 px-1">
                  <span className="flex h-2 w-2 rounded-full bg-tertiary-fixed-dim mr-2" />
                  <span className="text-[10px] font-medium text-secondary">
                    Validazione orari in tempo reale attiva
                  </span>
                </div>
              </div>

              {/* Advanced Toggle */}
              <div className="pt-4 flex items-center justify-between border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-primary font-bold text-xs tracking-tight group"
                >
                  <span
                    className={`material-symbols-outlined mr-2 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                  {showAdvanced ? 'NASCONDI OPZIONI AVANZATE' : 'MOSTRA OPZIONI AVANZATE'}
                </button>
                <span className="text-[11px] text-outline italic">Pesi e logica viaggio</span>
              </div>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="bg-surface-container-low/50 border-2 border-dashed border-surface-container p-8 rounded-xl space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-on-primary-fixed tracking-tight">
                      Preferenze Viaggio
                    </h4>
                    <span className="material-symbols-outlined text-secondary text-sm">tune</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToggleOption label="Preferisci Treno" description="Se durata totale < 3 ore" defaultOn />
                    <ToggleOption label="Solo Diretti" description="Evita tutti gli scali" defaultOn={false} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-on-primary-fixed uppercase tracking-widest px-1">
                    <span>Minimizza Costo</span>
                    <span>Minimizza Tempo</span>
                  </div>
                  <div className="relative h-2 bg-surface-container-highest rounded-full">
                    <div
                      className="absolute top-0 h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                      style={{ left: '0%', width: `${timeWeight}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={timeWeight}
                      onChange={(e) => setTimeWeight(Number(e.target.value))}
                      className="absolute top-1/2 -translate-y-1/2 w-full h-5 opacity-0 cursor-pointer"
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md pointer-events-none"
                      style={{ left: `calc(${timeWeight}% - 10px)` }}
                    />
                  </div>
                  <p className="text-[10px] text-center text-secondary">
                    Peso: {timeWeight}% Tempo / {100 - timeWeight}% Costo
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Info Card */}
            <div className="bg-primary-container p-6 rounded-xl text-white">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <span className="material-symbols-outlined text-tertiary-fixed">
                    tips_and_updates
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-bold mb-1">Come Funziona</h5>
                  <p className="text-xs text-on-primary-container leading-relaxed">
                    Il sistema cerca contemporaneamente opzioni in treno (Trainline), aereo
                    (Skyscanner) e auto (Google Maps), calcolando il tempo porta-a-porta e il costo
                    totale per ogni modalit&agrave;.
                  </p>
                </div>
              </div>
            </div>

            {/* Transport modes */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-on-primary-fixed">Modalit&agrave; Confrontate</h4>
              <TransportMode icon="train" label="Treno" description="Trenitalia, Italo, NTV" />
              <TransportMode icon="flight_takeoff" label="Aereo" description="Voli via Skyscanner" />
              <TransportMode icon="directions_car" label="Auto" description="Google Maps Directions" />
            </div>

            {/* Map placeholder */}
            <div className="bg-surface-container-highest/40 rounded-xl p-4 aspect-square relative flex items-center justify-center border border-surface-container">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#436182 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="text-center z-10 px-6">
                <span className="material-symbols-outlined text-5xl text-primary/20 mb-4">map</span>
                <p className="text-[11px] font-bold text-secondary uppercase tracking-widest leading-tight">
                  La mappa interattiva
                  <br />
                  apparir&agrave; nei risultati
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-12 flex items-center justify-between p-8 bg-surface-container-high rounded-2xl">
          <div>
            <h4 className="text-lg font-black text-on-primary-fixed tracking-tight">
              Pronto per l'ottimizzazione?
            </h4>
            <p className="text-sm text-secondary">
              L'algoritmo confronter&agrave; tutte le opzioni di viaggio disponibili.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || !origin || !destination}
            className="flex items-center px-10 py-5 luxury-gradient text-white rounded-xl font-black text-lg shadow-[0_20px_40px_rgba(0,37,66,0.2)] active:scale-[0.98] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ottimizza
            <span className="material-symbols-outlined ml-3 transition-transform group-hover:translate-x-1">
              rocket_launch
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

function SuggestionsDropdown({ suggestions, onSelect }) {
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-surface-container rounded-xl shadow-lg max-h-60 overflow-y-auto">
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(s)}
          className="w-full text-left px-4 py-3 hover:bg-primary-fixed/20 border-b border-surface-container last:border-0 transition-colors"
        >
          <span className="font-medium text-on-surface">{s.mainText || s.description}</span>
          {s.secondaryText && (
            <span className="text-secondary text-sm ml-1">- {s.secondaryText}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function ToggleOption({ label, description, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
      <div className="flex-1">
        <p className="text-xs font-bold text-on-surface">{label}</p>
        <p className="text-[10px] text-secondary">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`w-10 h-5 rounded-full relative transition-colors ${on ? 'bg-primary' : 'bg-surface-container-highest'}`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${on ? 'right-1' : 'left-1'}`}
        />
      </button>
    </div>
  );
}

function TransportMode({ icon, label, description }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
      <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
        <span className="material-symbols-outlined text-secondary">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface">{label}</p>
        <p className="text-[10px] text-secondary">{description}</p>
      </div>
    </div>
  );
}
