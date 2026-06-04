import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Save, Route, Clock, Ruler, MapPin, Navigation, CheckCircle, Loader2 } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapPage = ({ routeData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (!routeData || !mapRef.current) return;

    const { sourceCoords, destinationCoords, geometry, source, destination } = routeData;

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(sourceCoords, 7);

    mapInstanceRef.current = map;

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    L.marker(sourceCoords, { icon: sourceIcon })
      .bindPopup(`<b>Source</b><br/>${source}`)
      .addTo(map);

    L.marker(destinationCoords, { icon: destIcon })
      .bindPopup(`<b>Destination</b><br/>${destination}`)
      .addTo(map);

    // Draw polyline from OSRM geometry (GeoJSON coordinates are [lon, lat])
    if (geometry && geometry.coordinates) {
      const latLngs = geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      const polyline = L.polyline(latLngs, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.85,
        smoothFactor: 1,
      }).addTo(map);

      // Fit bounds to route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeData]);

  const handleSave = async () => {
    if (!routeData || saved) return;
    setSaving(true);

    try {
      const response = await fetch('http://localhost:5001/api/route/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData),
      });

      const result = await response.json();
      if (result.success) {
        setSaved(true);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!routeData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4 px-4">
        <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
          <Route className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-300">No Route to Display</h2>
        <p className="text-slate-500 max-w-sm">
          Search for a source and destination from the Home tab to see your route visualized on the map.
        </p>
      </div>
    );
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)] p-4">
      {/* Map Container */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-800/60 shadow-2xl relative min-h-[400px]">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Route Info Sidebar */}
      <div className="lg:w-80 w-full flex flex-col gap-3">
        {/* Route Details Card */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-indigo-400" /> Route Details
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
              <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Source</p>
                <p className="text-sm text-slate-200 break-words">{routeData.source}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/15">
              <Navigation className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0 rotate-45" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Destination</p>
                <p className="text-sm text-slate-200 break-words">{routeData.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel rounded-xl p-4 text-center">
            <Ruler className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{routeData.distance}</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">km</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{formatDuration(routeData.duration)}</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">est. time</p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${saved
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20'
            } disabled:opacity-60`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" /> Saved to History
            </>
          ) : saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save This Route
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MapPage;
