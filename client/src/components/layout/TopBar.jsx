import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/search': 'Ricerca Viaggio',
  '/comparison': 'Confronto',
  '/itinerary': 'Itinerario',
  '/settings': 'Impostazioni',
};

export default function TopBar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Executive Concierge';

  return (
    <header className="w-full sticky top-0 z-50 glass-panel shadow-[0_16px_32px_-12px_rgba(24,28,32,0.06)]">
      <div className="flex items-center justify-between px-8 h-20 w-full">
        <div className="flex items-center gap-8">
          <span className="md:hidden text-xl font-bold text-on-primary-fixed tracking-tighter">
            Executive Concierge
          </span>
          <h2 className="hidden md:block text-xl font-bold text-on-primary-fixed tracking-tight">
            {title}
          </h2>
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-highest border-none rounded-lg text-sm w-64 focus:ring-1 focus:ring-primary/20 transition-all focus:outline-none"
              placeholder="Cerca viaggi..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-secondary">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-secondary">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm bg-primary-fixed-dim flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
