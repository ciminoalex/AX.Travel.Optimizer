import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TripSearch from './pages/TripSearch';
import Comparison from './pages/Comparison';
import Itinerary from './pages/Itinerary';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<TripSearch />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
