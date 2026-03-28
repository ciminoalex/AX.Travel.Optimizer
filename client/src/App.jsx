import { useState, useCallback } from 'react';
import { Compass } from 'lucide-react';
import SearchForm from './components/SearchForm';
import ResultsPanel from './components/ResultsPanel';
import HistoryPanel from './components/HistoryPanel';
import LoadingSpinner from './components/LoadingSpinner';
import { useSearch } from './hooks/useSearch';

export default function App() {
  const { results, loading, error, search, clear } = useSearch();
  const [historyKey, setHistoryKey] = useState(0);

  const handleSearch = useCallback(async (params) => {
    await search(params);
    // Refresh history after search completes
    setHistoryKey(prev => prev + 1);
  }, [search]);

  const handleReplay = useCallback((params) => {
    handleSearch(params);
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Compass className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">AX Travel Optimizer</h1>
            <p className="text-xs text-gray-500">Trova il modo migliore per raggiungere il tuo cliente</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Search Form */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Loading */}
        {loading && <LoadingSpinner />}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <p className="font-semibold">Errore</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && <ResultsPanel data={results} />}

        {/* History */}
        <HistoryPanel key={historyKey} onReplay={handleReplay} />
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-xs py-6">
        AX Travel Optimizer - Ottimizzazione viaggi di lavoro
      </footer>
    </div>
  );
}
