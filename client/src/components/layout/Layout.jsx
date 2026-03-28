import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      <Sidebar />
      <main className="flex-grow md:ml-72 min-h-screen pb-20 md:pb-0">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
}
