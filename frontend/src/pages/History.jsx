import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, MapPin, Navigation, Clock, Ruler, Trash2, Loader2, RotateCcw, ArrowRight } from 'lucide-react';

const History = ({ onRouteLoad }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/route/history');
      const result = await response.json();
      if (result.success) {
        setRoutes(result.data);
      } else {
        setError('Failed to load route history.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading saved routes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Route History</h2>
            <p className="text-sm text-slate-400">{routes.length} saved route{routes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-300 text-sm hover:bg-slate-700/60 transition"
        >
          <RotateCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {routes.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
            <HistoryIcon className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-300">No Routes Saved Yet</h3>
          <p className="text-slate-500 max-w-sm">
            Search for a route from the Home tab, view it on the map, and click "Save This Route" to add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((route, index) => (
            <div
              key={route._id || index}
              className="glass-panel rounded-xl p-4 hover:border-slate-600/50 transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Route Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-200 truncate font-medium">{route.source}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <Navigation className="w-4 h-4 text-red-400 flex-shrink-0 rotate-45" />
                    <span className="text-slate-200 truncate font-medium">{route.destination}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-blue-400" /> {route.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> {formatDuration(route.duration)}
                    </span>
                    <span>{formatDate(route.createdAt)}</span>
                  </div>
                </div>

                {/* View on map button */}
                <button
                  onClick={() => onRouteLoad(route)}
                  className="px-4 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/25 transition flex items-center gap-2 flex-shrink-0"
                >
                  <MapPin className="w-4 h-4" /> View on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
