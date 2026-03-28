import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', to: '/' },
  { icon: 'travel_explore', label: 'Ricerca Viaggio', to: '/search' },
  { icon: 'analytics', label: 'Confronto', to: '/comparison' },
  { icon: 'event_note', label: 'Itinerario', to: '/itinerary' },
  { icon: 'settings', label: 'Impostazioni', to: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="h-screen w-72 fixed left-0 top-0 hidden md:flex flex-col bg-surface-container-low z-40">
        <div className="p-8 pb-4">
          <h1 className="text-lg font-black text-on-primary-fixed tracking-tighter">
            Executive Concierge
          </h1>
          <p className="text-xs font-medium tracking-wide text-secondary mt-1">
            Travel Optimizer
          </p>
        </div>

        <nav className="p-6 space-y-2 flex-grow">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                    : 'text-secondary hover:bg-surface-container-lowest/50 hover:translate-x-1'
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto space-y-2">
          <button
            onClick={() => navigate('/search')}
            className="w-full py-4 luxury-gradient text-white rounded-lg font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-transform mb-6"
          >
            Nuovo Viaggio
          </button>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2 text-secondary hover:translate-x-1 transition-all text-sm font-medium"
          >
            <span className="material-symbols-outlined">contact_support</span>
            Supporto
          </a>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel shadow-[0_-8px_24px_rgba(0,0,0,0.05)] z-50 px-6 h-16 flex items-center justify-between">
        {NAV_ITEMS.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center ${isActive ? 'text-primary' : 'text-secondary'}`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
