import { Car, Plane, Train, Clock, Euro, Trophy, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const TRANSPORT_CONFIG = {
  car: {
    icon: Car,
    label: 'Auto',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  flight: {
    icon: Plane,
    label: 'Aereo',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  train: {
    icon: Train,
    label: 'Treno',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  return format(new Date(isoString), 'HH:mm');
}

function formatDate(isoString) {
  if (!isoString) return '';
  return format(new Date(isoString), 'd MMM', { locale: it });
}

export default function TravelCard({ result, isBest }) {
  const config = TRANSPORT_CONFIG[result.transportType] || TRANSPORT_CONFIG.car;
  const Icon = config.icon;
  const details = result.details || {};

  return (
    <div
      className={`relative rounded-xl border-2 p-5 transition-all hover:shadow-md ${
        isBest ? `${config.borderColor} ${config.bgColor} shadow-md` : 'border-gray-200 bg-white'
      }`}
    >
      {isBest && (
        <div className="absolute -top-3 left-4 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
          <Trophy className="w-3 h-3" />
          MIGLIORE
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left: transport type and times */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-7 h-7 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{config.label}</h3>
            <p className="text-sm text-gray-500">{result.provider}</p>

            {/* Times */}
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="font-semibold text-gray-800">
                {formatTime(result.departureTime)}
              </span>
              <span className="text-gray-400 text-xs">{formatDate(result.departureTime)}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-800">
                {formatTime(result.arrivalTime)}
              </span>
              <span className="text-gray-400 text-xs">{formatDate(result.arrivalTime)}</span>
            </div>

            {/* Details */}
            <div className="mt-2 text-xs text-gray-500 space-y-0.5">
              {details.trainType && <p>Tipo: {details.trainType}</p>}
              {details.carrier && result.transportType === 'train' && <p>Operatore: {details.carrier}</p>}
              {details.originStation && details.destStation && (
                <p>{details.originStation} → {details.destStation}</p>
              )}
              {details.originAirport && details.destAirport && (
                <p>{details.originAirport} → {details.destAirport}</p>
              )}
              {details.flightNumber && <p>Volo: {details.flightNumber}</p>}
              {details.stops > 0 && <p>Scali: {details.stops}</p>}
              {details.changes > 0 && <p>Cambi: {details.changes}</p>}
              {details.distanceKm && <p>Distanza: {details.distanceKm} km</p>}
              {details.summary && <p>Percorso: {details.summary}</p>}
              {details.isEstimate && (
                <p className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Dati stimati
                </p>
              )}
              {details.warning && !details.isEstimate && (
                <p className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {details.warning}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: duration and cost */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center justify-end gap-1 text-gray-700">
            <Clock className="w-4 h-4" />
            <span className="text-xl font-bold">{formatDuration(result.durationMin)}</span>
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 text-gray-600">
            <Euro className="w-4 h-4" />
            <span className="text-lg font-semibold">
              {result.costEur != null ? `${result.costEur.toFixed(2)}` : 'N/D'}
            </span>
          </div>
          {result.transportType === 'car' && details.fuelCost != null && (
            <div className="text-xs text-gray-400 mt-1">
              Carb. {details.fuelCost.toFixed(0)}€ + Ped. {details.tollCost?.toFixed(0) || 0}€
            </div>
          )}
          {result.transportType === 'flight' && details.transferToAirportMin && (
            <div className="text-xs text-gray-400 mt-1">
              incl. {details.transferToAirportMin + details.checkinMin}min check-in
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
