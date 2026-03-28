import { useState, useEffect } from 'react';
import { History, Trash2, ArrowRight, Car, Plane, Train, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const TRANSPORT_ICONS = { car: Car, flight: Plane, train: Train };

export default function HistoryPanel({ onReplay }) {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history?limit=20');
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleReplay = (item) => {
    onReplay({
      origin: item.origin,
      destination: item.destination,
      arrivalDatetime: item.arrival_datetime,
    });
  };

  if (history.length === 0 && !loading) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded) fetchHistory(); }}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-700">
          <History className="w-5 h-5" />
          <span className="font-semibold">Ricerche recenti</span>
          <span className="text-sm text-gray-400">({history.length})</span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-gray-400 text-center py-4">Caricamento...</p>
          ) : (
            history.map((item) => {
              const BestIcon = TRANSPORT_ICONS[item.best_option] || Car;
              return (
                <div
                  key={item.id}
                  onClick={() => handleReplay(item)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-800 truncate">{item.origin}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{item.destination}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>
                        {format(new Date(item.arrival_datetime), "d MMM yyyy HH:mm", { locale: it })}
                      </span>
                      {item.best_option && (
                        <span className="flex items-center gap-1">
                          <BestIcon className="w-3 h-3" />
                          {item.best_duration_min && `${Math.floor(item.best_duration_min / 60)}h${item.best_duration_min % 60}m`}
                          {item.best_cost_eur && ` - €${item.best_cost_eur.toFixed(0)}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
