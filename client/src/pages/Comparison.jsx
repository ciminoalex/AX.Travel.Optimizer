import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const TRANSPORT_CONFIG = {
  train: { icon: 'train', label: 'Treno', timelineSteps: ['Stazione', 'Viaggio', 'Arrivo'] },
  flight: { icon: 'flight_takeoff', label: 'Aereo', timelineSteps: ['Transfer', 'Check-in', 'Volo', 'Arrivo'] },
  car: { icon: 'directions_car', label: 'Auto', timelineSteps: ['Partenza', 'Percorso', 'Arrivo'] },
};

function formatDuration(minutes) {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  return format(new Date(isoString), 'HH:mm');
}

export default function Comparison() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchResults = location.state?.searchResults;

  if (!searchResults || !searchResults.results?.length) {
    return (
      <section className="p-10 max-w-7xl mx-auto text-center">
        <div className="py-20">
          <span className="material-symbols-outlined text-6xl text-secondary/20 mb-6">analytics</span>
          <h2 className="text-2xl font-bold text-on-primary-fixed mb-4">Nessun Confronto Disponibile</h2>
          <p className="text-secondary mb-8">Effettua prima una ricerca per vedere il confronto delle opzioni.</p>
          <button
            onClick={() => navigate('/search')}
            className="px-8 py-4 luxury-gradient text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all"
          >
            Vai alla Ricerca
          </button>
        </div>
      </section>
    );
  }

  const { results, origin, destination } = searchResults;
  const bestResult = results[0];

  // Group by transport type (take best of each)
  const byType = {};
  for (const r of results) {
    if (!byType[r.transportType]) byType[r.transportType] = r;
  }

  // Ensure we have all 3 types (use null for missing)
  const columns = ['train', 'flight', 'car'].map((type) => ({
    type,
    result: byType[type] || null,
    config: TRANSPORT_CONFIG[type],
    isOptimal: byType[type] && byType[type] === bestResult,
  }));

  // Calculate time advantages relative to best
  const bestDuration = bestResult?.durationMin || 0;

  return (
    <section className="p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-[2.75rem] font-black text-on-primary-fixed leading-tight tracking-tight">
          Confronto Opzioni
        </h2>
        <div className="flex items-center gap-3 mt-2 text-secondary">
          <span className="font-medium">{origin}</span>
          <span className="material-symbols-outlined text-sm">east</span>
          <span className="font-medium">{destination}</span>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {columns.map(({ type, result, config, isOptimal }) => (
          <ComparisonCard
            key={type}
            type={type}
            result={result}
            config={config}
            isOptimal={isOptimal}
            bestDuration={bestDuration}
            onSelect={() => {
              if (result) {
                navigate('/itinerary', {
                  state: { result, searchResults, origin, destination },
                });
              }
            }}
          />
        ))}
      </div>

      {/* Analytics Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface-container-low p-12 rounded-xl">
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-on-primary-fixed">Analisi del Percorso</h4>
          <p className="text-on-surface-variant leading-relaxed text-sm">
            Il motore di ottimizzazione ha calcolato la <strong>Scelta Ottimale</strong> basandosi
            sul tempo di viaggio porta-a-porta e sul costo totale. Il peso dell'ottimizzazione
            &egrave; 70% tempo e 30% costo.
          </p>
          {bestResult && (
            <div className="flex items-center gap-2 text-tertiary font-bold text-sm">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>
                Migliore: {TRANSPORT_CONFIG[bestResult.transportType]?.label} -{' '}
                {formatDuration(bestResult.durationMin)} - €{bestResult.costEur?.toFixed(0) || 'N/D'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-3 gap-4 w-full">
            {columns.map(({ type, result, config }) => (
              <div key={type} className="text-center">
                <span className="material-symbols-outlined text-2xl text-secondary/40">
                  {config.icon}
                </span>
                <p className="text-xs font-bold text-secondary mt-2">{config.label}</p>
                <p className="text-lg font-black text-on-primary-fixed">
                  {result ? formatDuration(result.durationMin) : 'N/D'}
                </p>
                <p className="text-xs text-secondary">
                  {result?.costEur ? `€${result.costEur.toFixed(0)}` : '--'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonCard({ type, result, config, isOptimal, bestDuration, onSelect }) {
  const timeDiff = result ? result.durationMin - bestDuration : 0;
  const timeDiffHours = (timeDiff / 60).toFixed(1);

  return (
    <div
      className={`group relative flex flex-col bg-surface-container-lowest p-8 rounded-xl transition-all duration-300 ${
        isOptimal
          ? 'ring-2 ring-primary shadow-[0_32px_64px_-16px_rgba(0,37,66,0.15)] md:-translate-y-4'
          : 'hover:shadow-[0_24px_48px_-12px_rgba(24,28,32,0.1)]'
      }`}
    >
      {/* Optimal Badge */}
      {isOptimal && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-tertiary-container text-tertiary-fixed px-4 py-1.5 rounded-full text-[0.65rem] font-black uppercase tracking-widest shadow-lg">
          Scelta Ottimale
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-1">
          <span className="material-symbols-outlined text-primary text-3xl">{config.icon}</span>
          <h3 className="text-xl font-bold text-on-surface mt-2">{config.label}</h3>
          {result?.provider && (
            <span className="text-xs text-secondary">{result.provider}</span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[0.75rem] font-bold text-secondary uppercase tracking-widest">
            Costo
          </span>
          <p className="text-2xl font-black text-on-surface">
            {result?.costEur ? `€${result.costEur.toFixed(0)}` : 'N/D'}
          </p>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        {/* Duration */}
        <div>
          <span className="text-[0.75rem] font-bold text-secondary uppercase tracking-widest block mb-1">
            Durata Totale
          </span>
          <p className="text-xl font-semibold text-primary">
            {result ? formatDuration(result.durationMin) : 'Non disponibile'}
          </p>
        </div>

        {/* Times */}
        {result?.departureTime && (
          <div>
            <span className="text-[0.75rem] font-bold text-secondary uppercase tracking-widest block mb-1">
              Orari
            </span>
            <p className="text-sm text-on-surface">
              {formatTime(result.departureTime)} → {formatTime(result.arrivalTime)}
            </p>
          </div>
        )}

        {/* Journey Timeline */}
        <div>
          <span className="text-[0.75rem] font-bold text-secondary uppercase tracking-widest block mb-3">
            Timeline Viaggio
          </span>
          <div className="relative flex items-center w-full h-1 bg-surface-container-high rounded-full">
            {config.timelineSteps.map((_, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 rounded-full -translate-x-1/2 ${
                  i === 0
                    ? 'left-0 bg-primary'
                    : i === config.timelineSteps.length - 1
                      ? 'right-0 translate-x-1/2 bg-primary'
                      : `bg-surface-tint`
                }`}
                style={
                  i > 0 && i < config.timelineSteps.length - 1
                    ? { left: `${(i / (config.timelineSteps.length - 1)) * 100}%` }
                    : {}
                }
              />
            ))}
            {isOptimal && (
              <div className="absolute left-[15%] right-[15%] h-[2px] bg-tertiary-fixed shadow-[0_0_8px_rgba(159,245,193,0.5)]" />
            )}
            <div className="absolute left-0 right-0 h-1 bg-surface-tint opacity-30" />
          </div>
          <div className="flex justify-between mt-4 text-[0.65rem] font-bold text-secondary uppercase tracking-tighter">
            {config.timelineSteps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>

        {/* Time Advantage */}
        <div
          className={`p-4 rounded-lg ${
            isOptimal
              ? 'bg-tertiary-container/10 border border-tertiary-fixed/20'
              : 'bg-surface-container-low'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">
              {result ? 'Differenza Tempo' : 'Stato'}
            </span>
            {result ? (
              <span
                className={`text-sm font-bold ${
                  timeDiff === 0 ? 'text-tertiary-container' : 'text-error'
                }`}
              >
                {timeDiff === 0 ? 'Migliore' : `+ ${timeDiffHours} ore`}
              </span>
            ) : (
              <span className="text-sm font-bold text-secondary">Non trovato</span>
            )}
          </div>
          {result && (
            <p className="text-[10px] text-secondary mt-1">
              {isOptimal
                ? 'Opzione pi\u00F9 veloce ed efficiente.'
                : `Rispetto all'opzione migliore.`}
            </p>
          )}
        </div>

        {/* Details */}
        {result?.details && (
          <div className="text-xs text-secondary space-y-1">
            {result.details.trainType && <p>Tipo: {result.details.trainType}</p>}
            {result.details.carrier && <p>Operatore: {result.details.carrier}</p>}
            {result.details.flightNumber && <p>Volo: {result.details.flightNumber}</p>}
            {result.details.distanceKm && <p>Distanza: {result.details.distanceKm} km</p>}
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onSelect}
          disabled={!result}
          className={`w-full py-3 px-6 rounded-lg font-bold text-sm transition-all active:scale-95 ${
            isOptimal
              ? 'luxury-gradient text-white shadow-lg'
              : result
                ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                : 'bg-surface-container-high text-secondary cursor-not-allowed opacity-50'
          }`}
        >
          {result ? 'Seleziona e Dettagli' : 'Non Disponibile'}
        </button>
      </div>
    </div>
  );
}
