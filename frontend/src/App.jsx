import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import History from './pages/History';
import { Home as HomeIcon, Map, Clock, Compass } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'history', label: 'History', icon: Clock },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [routeData, setRouteData] = useState(null);

  const handleRouteFound = (data) => {
    setRouteData(data);
    setActiveTab('map');
  };

  const handleRouteLoad = (route) => {
    setRouteData(route);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">Sarithra</h1>
              <p className="text-[10px] text-slate-400 leading-tight tracking-widest uppercase">Smart Route Finder</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800/40">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600/80 to-indigo-600/80 text-white shadow-lg shadow-blue-500/15'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <Home onRouteFound={handleRouteFound} setTab={setActiveTab} />
        )}
        {activeTab === 'map' && (
          <MapPage routeData={routeData} />
        )}
        {activeTab === 'history' && (
          <History onRouteLoad={handleRouteLoad} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-600 border-t border-slate-800/30">
        Sarithra © {new Date().getFullYear()} — Smart Route Finder | College Project
      </footer>
    </div>
  );
}

export default App;
