import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const TRANSPORT_ICONS = { car: 'directions_car', flight: 'flight_takeoff', train: 'train' };
const TRANSPORT_LABELS = { car: 'Auto', flight: 'Aereo', train: 'Treno' };

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalSearches: 0, avgDuration: 0, avgCost: 0 });

  useEffect(() => {
    fetch('/api/history?limit=10')
      .then((r) => r.json())
      .then((data) => {
        const items = data.history || [];
        setHistory(items);
        if (items.length > 0) {
          const withData = items.filter((i) => i.best_duration_min && i.best_cost_eur);
          setStats({
            totalSearches: items.length,
            avgDuration: withData.length
              ? Math.round(withData.reduce((s, i) => s + i.best_duration_min, 0) / withData.length)
              : 0,
            avgCost: withData.length
              ? Math.round(withData.reduce((s, i) => s + i.best_cost_eur, 0) / withData.length)
              : 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 lg:p-12 space-y-10">
      {/* Welcome + Quick Start */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-on-primary-fixed tracking-tight leading-tight">
            Benvenuto.
          </h2>
          <p className="text-secondary text-lg mt-2 max-w-xl">
            Ottimizza i tuoi viaggi di lavoro confrontando treno, aereo e auto.
            Inserisci partenza, destinazione e orario di arrivo richiesto.
          </p>
        </div>
        <div className="lg:col-span-4 group relative overflow-hidden luxury-gradient rounded-xl p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-8 -top-8 opacity-10 scale-150 rotate-12">
            <span className="material-symbols-outlined text-[120px]">flight_takeoff</span>
          </div>
          <div>
            <span className="text-white/60 text-xs font-bold tracking-widest uppercase">
              Quick Start
            </span>
            <h3 className="text-white text-2xl font-bold mt-1">Nuovo Viaggio</h3>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="mt-8 flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-bold text-sm self-start transition-all active:scale-95"
          >
            Inizia Ricerca
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon="speed"
          label="Ricerche Effettuate"
          value={String(stats.totalSearches).padStart(2, '0')}
          badge={null}
        />
        <MetricCard
          icon="timer"
          label="Durata Media Viaggio"
          value={stats.avgDuration ? formatDuration(stats.avgDuration) : '--'}
          detail="Opzione migliore"
        />
        <MetricCard
          icon="savings"
          label="Costo Medio"
          value={stats.avgCost ? `€${stats.avgCost}` : '--'}
          detail="Opzione migliore"
        />
        <MetricCard
          icon="calendar_today"
          label="Ultimo Viaggio"
          value={
            history.length > 0
              ? format(new Date(history[0].created_at), 'd MMM', { locale: it })
              : '--'
          }
          detail={history.length > 0 ? `${history[0].origin} → ${history[0].destination}` : null}
        />
      </section>

      {/* Main Section */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Searches */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-primary-fixed">Ricerche Recenti</h3>
            <button
              onClick={() => navigate('/search')}
              className="text-sm font-semibold text-primary-container hover:underline"
            >
              Nuova ricerca
            </button>
          </div>
          <div className="space-y-4">
            {history.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-center">
                <span className="material-symbols-outlined text-4xl text-secondary/30 mb-4">
                  travel_explore
                </span>
                <p className="text-secondary">Nessuna ricerca effettuata.</p>
                <p className="text-sm text-secondary/60 mt-1">
                  Vai alla pagina di ricerca per trovare il viaggio ottimale.
                </p>
              </div>
            )}
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onClick={() =>
                  navigate('/search', {
                    state: {
                      origin: item.origin,
                      destination: item.destination,
                      arrivalDatetime: item.arrival_datetime,
                    },
                  })
                }
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <h3 className="text-xl font-bold text-on-primary-fixed">Azioni Rapide</h3>
          <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
            <button
              onClick={() => navigate('/search')}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-left"
            >
              <span className="material-symbols-outlined text-primary">add_circle</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Nuova Ottimizzazione</p>
                <p className="text-[10px] text-secondary">Confronta treno, aereo e auto</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-left"
            >
              <span className="material-symbols-outlined text-primary">tune</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Configura API</p>
                <p className="text-[10px] text-secondary">Google Maps, Skyscanner, Trainline</p>
              </div>
            </button>
          </div>

          {/* Insight Card */}
          <div className="bg-primary-container p-6 rounded-xl border-l-4 border-tertiary-fixed shadow-lg">
            <h4 className="text-white font-bold text-lg leading-tight">
              Suggerimento
            </h4>
            <p className="text-on-primary-container text-xs mt-2 leading-relaxed">
              Per risultati accurati, configura le tue API keys nella pagina Impostazioni.
              Google Maps per i percorsi auto e Skyscanner per i voli.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="mt-4 w-full py-3 bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs rounded-lg active:scale-95 transition-all"
            >
              Vai alle Impostazioni
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, badge, detail }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
      <div className="flex justify-between items-start mb-4">
        <span className="material-symbols-outlined text-primary-container">{icon}</span>
        {badge && (
          <span className="bg-tertiary-container px-2 py-1 rounded-full text-[10px] font-bold text-tertiary-fixed tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-on-primary-fixed tracking-tight">{value}</div>
      <div className="text-xs font-medium text-secondary mt-1">{label}</div>
      {detail && <div className="text-[10px] text-secondary/60 mt-2 italic">{detail}</div>}
    </div>
  );
}

function HistoryCard({ item, onClick }) {
  const arrivalDate = new Date(item.arrival_datetime);
  const icon = TRANSPORT_ICONS[item.best_option] || 'help';
  const label = TRANSPORT_LABELS[item.best_option] || '?';

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-8 group cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex flex-col items-center justify-center bg-surface-container-low w-20 h-20 rounded-lg">
        <span className="text-xs font-bold text-secondary tracking-widest">
          {format(arrivalDate, 'MMM', { locale: it }).toUpperCase()}
        </span>
        <span className="text-2xl font-black text-primary">{format(arrivalDate, 'dd')}</span>
      </div>
      <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-1 md:col-span-2">
          <div className="text-xs font-bold text-secondary uppercase tracking-wider">
            {item.origin} - {item.destination}
          </div>
          <div className="text-lg font-bold text-on-primary-fixed mt-1">
            {item.origin?.split(',')[0]} → {item.destination?.split(',')[0]}
          </div>
          {item.best_option && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-tertiary-fixed" />
              <span className="text-xs text-secondary font-medium">
                Migliore: {label}
                {item.best_duration_min ? ` - ${formatDuration(item.best_duration_min)}` : ''}
              </span>
            </div>
          )}
        </div>
        <div className="hidden md:block">
          <div className="text-xs font-bold text-secondary uppercase tracking-wider">Costo</div>
          <div className="text-sm font-semibold text-on-primary-fixed mt-1">
            {item.best_cost_eur ? `€${item.best_cost_eur.toFixed(0)}` : 'N/D'}
          </div>
          <div className="text-xs text-secondary mt-1">
            <span className="material-symbols-outlined text-xs align-middle">{icon}</span> {label}
          </div>
        </div>
        <div className="text-right flex flex-col justify-center">
          <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
