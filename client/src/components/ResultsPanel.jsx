import { MapPin, ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import TravelCard from './TravelCard';

export default function ResultsPanel({ data }) {
  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-500 text-lg">Nessun risultato trovato</p>
      </div>
    );
  }

  const arrivalDate = new Date(data.arrivalDatetime);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <div className="flex flex-wrap items-center gap-3 text-gray-700">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="font-medium">{data.origin}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="font-medium">{data.destination}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm">
              Arrivo entro: {format(arrivalDate, "d MMMM yyyy 'alle' HH:mm", { locale: it })}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {data.results.length} opzion{data.results.length === 1 ? 'e' : 'i'} trovat{data.results.length === 1 ? 'a' : 'e'} - ordinate per ottimizzazione tempo/costo
        </p>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {data.results.map((result, index) => (
          <TravelCard key={index} result={result} isBest={index === 0} />
        ))}
      </div>
    </div>
  );
}
