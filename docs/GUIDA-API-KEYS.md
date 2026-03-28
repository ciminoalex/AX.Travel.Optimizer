# Guida Configurazione API Keys - AX Travel Optimizer

## Panoramica

Il portale utilizza 2 API esterne che richiedono chiavi di accesso:

| API | Scopo | Costo |
|-----|-------|-------|
| **Google Maps Platform** | Percorsi auto, autocomplete luoghi, geocoding | Free tier: $200/mese gratuiti (~40.000 richieste) |
| **RapidAPI (Skyscanner)** | Ricerca voli con prezzi e orari | Pay-per-use (~$0.01/richiesta) |

> **Nota**: L'API Trainline EU utilizzata per i treni non richiede API key.

---

## 1. Google Maps Platform

### 1.1 Crea un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Accedi con il tuo account Google
3. Clicca **"Seleziona un progetto"** in alto → **"Nuovo progetto"**
4. Nome progetto: `AX Travel Optimizer`
5. Clicca **"Crea"**

### 1.2 Abilita le API necessarie

Dal menu laterale vai su **API e servizi** → **Libreria** e abilita queste 3 API:

1. **Directions API** — cerca "Directions API" → clicca → **"Abilita"**
2. **Places API** — cerca "Places API" → clicca → **"Abilita"**
3. **Geocoding API** — cerca "Geocoding API" → clicca → **"Abilita"**

### 1.3 Crea la API Key

1. Vai su **API e servizi** → **Credenziali**
2. Clicca **"+ Crea credenziali"** → **"Chiave API"**
3. Verrà generata una chiave tipo: `AIzaSyB...xxxxx`
4. **Copia la chiave** e conservala

### 1.4 (Consigliato) Limita la API Key

Per sicurezza, limita la chiave alle sole API necessarie:

1. Clicca sulla chiave appena creata
2. Nella sezione **"Restrizioni API"**, seleziona **"Limita chiave"**
3. Seleziona:
   - Directions API
   - Places API
   - Geocoding API
4. Clicca **"Salva"**

### 1.5 Attiva la fatturazione

Google richiede un account di fatturazione attivo, ma offre **$200/mese gratuiti**:

1. Vai su **Fatturazione** dal menu laterale
2. Clicca **"Collega un account di fatturazione"**
3. Segui la procedura (richiede carta di credito, ma non verrai addebitato sotto i $200/mese)

> **Stima utilizzo**: con un uso personale di ~20 ricerche/giorno, resterai ampiamente nel free tier.

---

## 2. RapidAPI (Skyscanner)

### 2.1 Registrazione su RapidAPI

1. Vai su [rapidapi.com](https://rapidapi.com/)
2. Clicca **"Sign Up"** (puoi usare Google, GitHub o email)
3. Completa la registrazione

### 2.2 Sottoscrivi l'API Sky Scrapper

1. Vai alla pagina dell'API: [Sky Scrapper su RapidAPI](https://rapidapi.com/apiheya/api/sky-scrapper)
2. Clicca **"Subscribe to Test"** o **"Pricing"**
3. Seleziona il piano **Basic** (gratuito, con limite di richieste) o **Pro** (pay-per-use)
4. Conferma la sottoscrizione

### 2.3 Ottieni la API Key

1. Dopo la sottoscrizione, nella pagina dell'API vedrai la sezione **"Code Snippets"**
2. Cerca il campo **`X-RapidAPI-Key`** — questo è la tua chiave
3. In alternativa, vai su [rapidapi.com/developer/dashboard](https://rapidapi.com/developer/dashboard)
4. La chiave è nel formato: `a1b2c3d4e5...xxxx`
5. **Copia la chiave**

> **Nota**: la stessa RapidAPI Key funziona per tutte le API sottoscritte su RapidAPI.

---

## 3. Inserimento nel Progetto

### 3.1 Crea il file `.env`

Dalla root del progetto, copia il file di esempio:

```bash
cp .env.example .env
```

### 3.2 Modifica il file `.env`

Apri il file `.env` con un editor di testo e inserisci le tue chiavi:

```env
# Google Maps Platform
# Ottenuta da: https://console.cloud.google.com/apis/credentials
GOOGLE_MAPS_API_KEY=AIzaSyB_LA_TUA_CHIAVE_QUI

# RapidAPI (per Skyscanner voli)
# Ottenuta da: https://rapidapi.com/developer/dashboard
RAPIDAPI_KEY=a1b2c3d4e5_LA_TUA_CHIAVE_QUI

# Porta del server (opzionale, default 3001)
PORT=3001
```

### 3.3 Verifica

Avvia il progetto e verifica che le API funzionino:

```bash
npm run dev
```

Vai alla pagina **Impostazioni** del portale per vedere lo stato delle connessioni API.

---

## 4. Risoluzione Problemi

### Google Maps: "REQUEST_DENIED"

- **Causa**: API non abilitate o chiave non valida
- **Soluzione**: verifica di aver abilitato Directions, Places e Geocoding API nella Console Google Cloud
- **Verifica**: vai su [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) e controlla che le API siano attive

### Google Maps: "OVER_QUERY_LIMIT"

- **Causa**: superato il limite gratuito ($200/mese)
- **Soluzione**: verifica la dashboard di fatturazione; con uso personale è quasi impossibile

### RapidAPI: "403 Forbidden"

- **Causa**: non sei sottoscritto all'API Sky Scrapper
- **Soluzione**: vai su [RapidAPI](https://rapidapi.com/apiheya/api/sky-scrapper) e sottoscrivi un piano

### RapidAPI: "429 Too Many Requests"

- **Causa**: superato il rate limit del piano
- **Soluzione**: attendi qualche minuto o passa a un piano superiore

### Treni: nessun risultato

- L'API Trainline EU non richiede chiave ma può essere temporaneamente non disponibile
- In caso di errore, il sistema usa stime basate su distanza e velocità media

---

## 5. Sicurezza

- **Non committare mai** il file `.env` — è già nel `.gitignore`
- **Non condividere** le API keys pubblicamente
- **Limita** la chiave Google Maps alle sole API necessarie
- **Monitora** l'utilizzo dalla dashboard Google Cloud e RapidAPI
- Se sospetti una compromissione, **rigenera** immediatamente le chiavi dalle rispettive dashboard

---

## Riepilogo Rapido

```bash
# 1. Copia il template
cp .env.example .env

# 2. Inserisci le chiavi nel file .env
#    GOOGLE_MAPS_API_KEY=...
#    RAPIDAPI_KEY=...

# 3. Avvia il progetto
npm run dev

# 4. Testa con una ricerca: Roma → Milano, domani ore 10:00
```
