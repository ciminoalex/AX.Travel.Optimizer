import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Ricerca in corso...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600 text-lg">{text}</p>
      <p className="text-gray-400 text-sm mt-1">Confronto treno, aereo e auto...</p>
    </div>
  );
}
