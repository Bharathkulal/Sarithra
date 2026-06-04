import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRightCircle, Sparkles, Loader2 } from 'lucide-react';

const Home = ({ onRouteFound, setTab }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickRoutes = [
    { from: 'Mumbai', to: 'Pune' },
    { from: 'New Delhi', to: 'Agra' },
    { from: 'Bengaluru', to: 'Mysuru' }
  ];

  const handleSearch = async (src, dest) => {
    if (!src.trim() || !dest.trim()) {
      setError('Please enter both source and destination');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/route/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source: src, destination: dest }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onRouteFound(result.data);
      } else {
        setError(result.message || 'Could not calculate route. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend server. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(source, destination);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto py-8 px-4">
      {/* Hero Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4" /> Smart Navigation System
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Sarithra
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto">
          Navigate smarter. Find the best route between any two locations instantly with real-time distance and estimated duration.
        </p>
      </div>

      {/* Main glass card for search */}
      <div className="w-full glass-panel rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700/50">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Source Location
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Enter starting point (e.g. Paris, Berlin)"
                className="w-full px-4 py-3 rounded-lg glass-input text-white text-sm"
                disabled={loading}
              />
            </div>

            {/* Destination Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-purple-400 rotate-45" /> Destination Location
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter end point (e.g. Munich, Rome)"
                className="w-full px-4 py-3 rounded-lg glass-input text-white text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculating Route...
              </>
            ) : (
              <>
                Find Smart Route
                <ArrowRightCircle className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Search Templates */}
      <div className="w-full mt-10 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase text-center">
          Or try a popular expo demo route
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickRoutes.map((route, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSource(route.from);
                setDestination(route.to);
                handleSearch(route.from, route.to);
              }}
              disabled={loading}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition duration-200"
            >
              <div>
                <p className="font-semibold text-slate-200">{route.from}</p>
                <p className="text-xs text-slate-400">to {route.to}</p>
              </div>
              <ArrowRightCircle className="w-4 h-4 text-blue-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
