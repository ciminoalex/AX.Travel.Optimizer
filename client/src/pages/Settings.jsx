import { useState, useEffect } from 'react';

export default function Settings() {
  const [apiStatus, setApiStatus] = useState({
    googleMaps: false,
    skyscanner: false,
    trainline: false,
  });

  useEffect(() => {
    // Check API connectivity
    fetch('/api/places/autocomplete?q=test')
      .then((r) => {
        setApiStatus((s) => ({ ...s, googleMaps: r.ok }));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10">
      <div className="space-y-2">
        <h2 className="text-4xl font-extrabold text-on-primary-fixed tracking-tight">
          Impostazioni
        </h2>
        <p className="text-secondary">
          Gestisci le integrazioni API e le preferenze di viaggio.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          {/* Travel Thresholds */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_16px_32px_-12px_rgba(24,28,32,0.06)] space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-primary-fixed flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Logica di Ottimizzazione
              </h3>
              <div className="bg-tertiary-container px-3 py-1 rounded-full">
                <span className="text-[10px] font-bold text-tertiary-fixed uppercase tracking-wider">
                  Attivo
                </span>
              </div>
            </div>
            <div className="space-y-5">
              <SettingRow
                label="Preferenza Treno vs Aereo"
                description="Preferisci il treno se la differenza di costo è < €50"
                value="€50.00"
              />
              <SettingRow
                label="Esclusione Voli"
                description="Non cercare voli se la distanza è inferiore a"
                value="100 km"
              />
              <SettingRow
                label="Penalizzazione Auto"
                description="Penalizza fortemente l'auto sopra"
                value="800 km"
              />
              <SettingRow
                label="Margine di Sicurezza"
                description="Minuti di margine aggiunti ad ogni opzione"
                value="30 min"
              />
              <SettingRow
                label="Check-in Aeroporto"
                description="Tempo stimato per check-in e sicurezza"
                value="90 min"
              />
              <SettingRow
                label="Peso Ottimizzazione"
                description="Distribuzione tempo/costo nell'algoritmo"
                value="70/30"
              />
            </div>
          </section>

          {/* Car Cost Settings */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_16px_32px_-12px_rgba(24,28,32,0.06)] space-y-6">
            <h3 className="text-lg font-bold text-on-primary-fixed flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">directions_car</span>
              Parametri Costo Auto
            </h3>
            <div className="space-y-5">
              <SettingRow
                label="Costo per Km"
                description="Include carburante, usura e manutenzione"
                value="€0.30/km"
              />
              <SettingRow
                label="Pedaggi"
                description="Includi pedaggi autostradali nel calcolo"
                value="Inclusi"
              />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* API Integrations */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_16px_32px_-12px_rgba(24,28,32,0.06)] space-y-6">
            <h3 className="text-lg font-bold text-on-primary-fixed flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">hub</span>
              API Connesse
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <ApiRow
                icon="map"
                name="Google Maps"
                description="Percorsi auto e autocomplete luoghi"
                connected={apiStatus.googleMaps}
              />
              <ApiRow
                icon="flight_takeoff"
                name="Skyscanner"
                description="Ricerca voli via RapidAPI"
                connected={apiStatus.skyscanner}
              />
              <ApiRow
                icon="train"
                name="Trainline EU"
                description="Ricerca treni Trenitalia, Italo"
                connected={apiStatus.trainline}
              />
            </div>
          </section>

          {/* Environment Variables Info */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_16px_32px_-12px_rgba(24,28,32,0.06)] space-y-6">
            <h3 className="text-lg font-bold text-on-primary-fixed flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">key</span>
              Configurazione API Keys
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              Le API keys sono configurate nel file <code className="bg-surface-container-high px-1 py-0.5 rounded text-xs">.env</code> nella root del progetto server.
            </p>
            <div className="space-y-3">
              <EnvRow name="GOOGLE_MAPS_API_KEY" description="Google Cloud Console" />
              <EnvRow name="RAPIDAPI_KEY" description="RapidAPI Dashboard" />
            </div>
          </section>

          {/* Info Card */}
          <div className="bg-tertiary-container p-6 rounded-xl flex items-start gap-4">
            <span
              className="material-symbols-outlined text-tertiary-fixed"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <div>
              <p className="text-white font-bold text-sm">Logica di Priorit&agrave;</p>
              <p className="text-on-tertiary-container text-xs mt-1 leading-relaxed">
                L'algoritmo attualmente prioritizza il <span className="text-tertiary-fixed font-bold">Tempo di Viaggio</span> (70%) rispetto al <span className="text-tertiary-fixed font-bold">Costo</span> (30%) per tutte le ricerche.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, value }) {
  return (
    <div className="p-4 bg-surface-container-low rounded-lg flex items-center justify-between group hover:bg-surface-container transition-colors">
      <div className="space-y-1">
        <p className="text-sm font-bold text-on-primary-fixed">{label}</p>
        <p className="text-xs text-secondary italic">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-on-surface-variant">{value}</span>
        <span className="material-symbols-outlined text-outline cursor-pointer group-hover:text-primary">
          tune
        </span>
      </div>
    </div>
  );
}

function ApiRow({ icon, name, description, connected }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">{name}</p>
          <p className="text-[10px] text-secondary">{description}</p>
        </div>
      </div>
      {connected ? (
        <div className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">
          Connesso
        </div>
      ) : (
        <div className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-secondary uppercase tracking-wide">
          Configura
        </div>
      )}
    </div>
  );
}

function EnvRow({ name, description }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant/20">
      <div>
        <p className="text-xs font-bold text-on-surface font-mono">{name}</p>
        <p className="text-[10px] text-secondary">{description}</p>
      </div>
      <span className="material-symbols-outlined text-secondary text-sm">content_copy</span>
    </div>
  );
}
