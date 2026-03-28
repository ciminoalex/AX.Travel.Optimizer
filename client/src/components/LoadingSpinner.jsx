export default function LoadingSpinner({ text = 'Ricerca in corso...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-surface-container-high" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-on-primary-fixed text-lg font-bold">{text}</p>
      <p className="text-secondary text-sm mt-2">Confronto treno, aereo e auto...</p>
      <div className="flex items-center gap-6 mt-8">
        <div className="flex flex-col items-center text-secondary">
          <span className="material-symbols-outlined text-2xl">train</span>
          <span className="text-[10px] mt-1">Treni</span>
        </div>
        <div className="flex flex-col items-center text-secondary">
          <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
          <span className="text-[10px] mt-1">Voli</span>
        </div>
        <div className="flex flex-col items-center text-secondary">
          <span className="material-symbols-outlined text-2xl">directions_car</span>
          <span className="text-[10px] mt-1">Auto</span>
        </div>
      </div>
    </div>
  );
}
