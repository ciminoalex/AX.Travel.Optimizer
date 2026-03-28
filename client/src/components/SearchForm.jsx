import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Search, ArrowRight } from 'lucide-react';
import { usePlaces } from '../hooks/usePlaces';

export default function SearchForm({ onSearch, loading }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [activeField, setActiveField] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination || !arrivalDate || !arrivalTime) return;
    const arrivalDatetime = `${arrivalDate}T${arrivalTime}:00`;
    onSearch({ origin, destination, arrivalDatetime });
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

  // Close suggestions when clicking outside
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Origin */}
        <div ref={originRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Partenza</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            <input
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              onFocus={() => setActiveField('origin')}
              placeholder="Da dove parti?"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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

        {/* Destination */}
        <div ref={destRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Destinazione</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestChange(e.target.value)}
              onFocus={() => setActiveField('destination')}
              placeholder="Dove devi andare?"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data di arrivo</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ora di arrivo</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !origin || !destination}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Search className="w-5 h-5" />
          Ottimizza viaggio
        </button>
      </div>
    </form>
  );
}

function SuggestionsDropdown({ suggestions, onSelect }) {
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(s)}
          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
        >
          <span className="font-medium text-gray-900">{s.mainText || s.description}</span>
          {s.secondaryText && (
            <span className="text-gray-500 text-sm ml-1">- {s.secondaryText}</span>
          )}
        </button>
      ))}
    </div>
  );
}
