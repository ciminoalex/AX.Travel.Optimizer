import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const TRANSPORT_ICONS = {
  car: 'directions_car',
  flight: 'flight_takeoff',
  train: 'train',
};

const TRANSPORT_LABELS = {
  car: 'Auto',
  flight: 'Aereo',
  train: 'Treno',
};

function formatDuration(minutes) {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  return format(new Date(isoString), 'HH:mm');
}

function buildTimeline(result, origin, destination) {
  const steps = [];
  const details = result.details || {};
  const type = result.transportType;

  if (type === 'train') {
    steps.push({
      time: formatTime(result.departureTime),
      label: 'Partenza',
      title: `Partenza: ${details.originStation || origin}`,
      description: details.trainType
        ? `${details.trainType}${details.carrier ? ` - ${details.carrier}` : ''}`
        : 'Viaggio in treno',
      icon: 'location_on',
    });
    steps.push({
      time: '',
      label: 'Trasferimento Ferroviario',
      title: `${details.trainType || 'Treno'}: ${details.originStation || origin}`,
      description: details.trainType
        ? `${details.trainType}. Durata: ${formatDuration(result.durationMin)}`
        : `Durata: ${formatDuration(result.durationMin)}`,
      icon: 'train',
    });
    steps.push({
      time: formatTime(result.arrivalTime),
      label: 'Arrivo',
      title: `Arrivo: ${details.destStation || destination}`,
      description: 'Arrivo stimato in orario.',
      icon: 'location_on',
    });
  } else if (type === 'flight') {
    const depTime = result.departureTime ? new Date(result.departureTime) : null;
    const transferMin = details.transferToAirportMin || 60;
    const checkinMin = details.checkinMin || 90;

    if (depTime) {
      const leaveHome = new Date(depTime.getTime() - (transferMin + checkinMin) * 60000);
      steps.push({
        time: format(leaveHome, 'HH:mm'),
        label: 'Transfer Aeroporto',
        title: `Partenza da: ${origin}`,
        description: `Transfer verso ${details.originAirport || 'aeroporto'} (~${transferMin} min)`,
        icon: 'directions_car',
      });
      steps.push({
        time: format(new Date(depTime.getTime() - checkinMin * 60000), 'HH:mm'),
        label: 'Check-in',
        title: `Check-in: ${details.originAirport || 'Aeroporto'}`,
        description: `Check-in e sicurezza (~${checkinMin} min)`,
        icon: 'flight_takeoff',
      });
    }
    steps.push({
      time: formatTime(result.departureTime),
      label: 'Volo',
      title: `Volo${details.flightNumber ? ` ${details.flightNumber}` : ''}: ${details.originAirport || ''} → ${details.destAirport || ''}`,
      description: details.carrier
        ? `${details.carrier}${details.stops ? ` - ${details.stops} scalo/i` : ' - Diretto'}`
        : 'Volo',
      icon: 'flight',
    });
    steps.push({
      time: formatTime(result.arrivalTime),
      label: 'Arrivo Aeroporto',
      title: `Arrivo: ${details.destAirport || 'Aeroporto'}`,
      description: 'Ritiro bagagli e transfer alla destinazione finale.',
      icon: 'location_on',
    });
  } else {
    steps.push({
      time: formatTime(result.departureTime),
      label: 'Partenza in Auto',
      title: `Partenza: ${origin}`,
      description: details.summary || 'Percorso auto',
      icon: 'directions_car',
    });
    if (details.distanceKm > 200) {
      steps.push({
        time: '',
        label: 'Percorso Autostradale',
        title: `${details.distanceKm || '?'} km di percorso`,
        description: `Via ${details.summary || 'autostrada'}. Durata: ${formatDuration(result.durationMin)}`,
        icon: 'route',
      });
    }
    steps.push({
      time: formatTime(result.arrivalTime),
      label: 'Destinazione Finale',
      title: `Arrivo: ${destination}`,
      description: `Tempo stimato di viaggio: ${formatDuration(result.durationMin)}`,
      icon: 'business',
    });
  }

  return steps;
}

function buildCostBreakdown(result) {
  const items = [];
  const details = result.details || {};

  if (result.transportType === 'car') {
    items.push({
      label: 'Carburante',
      cost: details.fuelCost || result.costEur * 0.7,
    });
    items.push({
      label: 'Pedaggi autostradali',
      cost: details.tollCost || result.costEur * 0.3,
    });
  } else if (result.transportType === 'flight') {
    items.push({
      label: `Volo${details.carrier ? ` ${details.carrier}` : ''}`,
      cost: result.costEur,
    });
    if (details.transferToAirportMin) {
      items.push({ label: 'Transfer aeroporto (stimato)', cost: 30 });
    }
  } else {
    items.push({
      label: `Biglietto${details.trainType ? ` ${details.trainType}` : ' treno'}`,
      cost: result.costEur,
    });
  }

  return items;
}

export default function Itinerary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, origin, destination } = location.state || {};

  if (!result) {
    return (
      <section className="p-10 max-w-7xl mx-auto text-center">
        <div className="py-20">
          <span className="material-symbols-outlined text-6xl text-secondary/20 mb-6">
            event_note
          </span>
          <h2 className="text-2xl font-bold text-on-primary-fixed mb-4">Nessun Itinerario</h2>
          <p className="text-secondary mb-8">
            Seleziona un'opzione dalla pagina di confronto per vederne l'itinerario.
          </p>
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

  const timeline = buildTimeline(result, origin, destination);
  const costs = buildCostBreakdown(result);
  const totalCost = costs.reduce((s, c) => s + (c.cost || 0), 0);
  const arrivalDate = result.arrivalTime
    ? format(new Date(result.arrivalTime), "d MMMM yyyy", { locale: it })
    : 'Data non disponibile';

  return (
    <div className="p-10 max-w-7xl mx-auto grid grid-cols-12 gap-10">
      {/* Left - Timeline */}
      <div className="col-span-12 lg:col-span-8 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-on-primary-fixed tracking-tight">
                Sequenza di Viaggio
              </h3>
              <p className="text-sm text-secondary mt-1">
                Logistica porta-a-porta per il {arrivalDate}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-tertiary-container px-4 py-2 rounded-full">
              <span
                className="material-symbols-outlined text-tertiary-fixed text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="text-xs font-bold text-tertiary-fixed tracking-wide">
                Percorso Ottimizzato
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative space-y-0 pl-10">
            <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-surface-tint opacity-20" />

            {timeline.map((step, i) => {
              const isFirst = i === 0;
              const isLast = i === timeline.length - 1;
              return (
                <div key={i} className={`relative ${isLast ? '' : 'pb-12'} group`}>
                  <div
                    className={`absolute -left-[37px] top-1 z-10 shadow-sm ${
                      isFirst || isLast
                        ? 'w-5 h-5 rounded-full bg-primary'
                        : 'w-4 h-4 rounded-full bg-surface-tint/30 -left-[35px]'
                    }`}
                  />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.15em]">
                        {step.time ? `${step.time} \u2022 ` : ''}
                        {step.label}
                      </span>
                      <h4 className="text-lg font-bold text-on-primary-fixed">{step.title}</h4>
                      <p className="text-sm text-on-surface-variant max-w-md">{step.description}</p>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
                      <span className="material-symbols-outlined text-primary text-xl">
                        {step.icon}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Map placeholder */}
        <div className="h-[320px] rounded-2xl overflow-hidden shadow-lg border border-outline-variant/20 bg-surface-container-highest flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-secondary/20">map</span>
            <p className="text-xs text-secondary mt-2">Mappa interattiva</p>
            <p className="text-[10px] text-secondary/60">
              {origin} → {destination}
            </p>
          </div>
        </div>
      </div>

      {/* Right - Financial Overview */}
      <div className="col-span-12 lg:col-span-4 space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_32px_64px_-16px_rgba(24,28,32,0.08)] space-y-8">
          <div>
            <h3 className="text-sm font-bold text-secondary uppercase tracking-[0.2em] mb-4">
              Riepilogo Costi
            </h3>
            <div className="space-y-4">
              {costs.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant">{item.label}</span>
                  <span className="text-sm font-bold text-on-primary-fixed">
                    €{(item.cost || 0).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <span className="text-base font-bold text-on-primary-fixed">Totale</span>
                <span className="text-2xl font-black text-primary tracking-tight">
                  €{totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Eco Impact */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10">
            <div className="flex items-start gap-4">
              <div className="bg-tertiary-container p-2 rounded-lg">
                <span
                  className="material-symbols-outlined text-tertiary-fixed text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">Impatto Ambientale</h4>
                <p className="text-[13px] text-on-surface-variant mt-1">
                  {result.transportType === 'train'
                    ? 'Il treno è la scelta più ecologica con le emissioni più basse.'
                    : result.transportType === 'flight'
                      ? 'Il volo ha un impatto ambientale maggiore rispetto al treno.'
                      : "L'auto ha un impatto medio, dipende dal tipo di veicolo."}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/search')}
              className="w-full luxury-gradient text-white py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all hover:shadow-2xl active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">travel_explore</span>
              Nuova Ricerca
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-surface-container-high text-on-surface py-4 rounded-xl font-bold text-sm transition-colors hover:bg-surface-dim active:scale-[0.98]"
            >
              Torna al Confronto
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between">
            <span className="material-symbols-outlined text-secondary">
              {TRANSPORT_ICONS[result.transportType]}
            </span>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                Tipo
              </p>
              <p className="text-xl font-bold text-on-surface">
                {TRANSPORT_LABELS[result.transportType]}
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col justify-between">
            <span className="material-symbols-outlined text-secondary">timer</span>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                Durata Stimata
              </p>
              <p className="text-xl font-bold text-on-surface">
                {formatDuration(result.durationMin)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
