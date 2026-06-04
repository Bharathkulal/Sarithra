const axios = require('axios');
const Route = require('../models/Route');

// Geocoding helper using Nominatim
const geocodeLocation = async (query) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon, display_name } = response.data[0];
      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        displayName: display_name
      };
    }
    return null;
  } catch (error) {
    console.error(`Geocoding error for ${query}:`, error.message);
    throw new Error(`Failed to geocode location: ${query}`);
  }
};

// Find route between two locations
const findRoute = async (req, res) => {
  const { source, destination } = req.body;

  if (!source || !destination) {
    return res.status(400).json({ success: false, message: 'Source and Destination are required' });
  }

  try {
    // 1. Geocode source and destination
    const sourceData = await geocodeLocation(source);
    if (!sourceData) {
      return res.status(404).json({ success: false, message: `Could not find location: ${source}` });
    }

    const destData = await geocodeLocation(destination);
    if (!destData) {
      return res.status(404).json({ success: false, message: `Could not find location: ${destination}` });
    }

    // 2. Fetch routing from OSRM
    // OSRM expects: lon,lat;lon,lat
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${sourceData.lon},${sourceData.lat};${destData.lon},${destData.lat}?overview=full&geometries=geojson`;
    const routeResponse = await axios.get(osrmUrl);

    if (!routeResponse.data || !routeResponse.data.routes || routeResponse.data.routes.length === 0) {
      return res.status(404).json({ success: false, message: 'No route found between these locations' });
    }

    const mainRoute = routeResponse.data.routes[0];
    const distanceKm = parseFloat((mainRoute.distance / 1000).toFixed(2)); // convert meters to km
    const durationMin = Math.round(mainRoute.duration / 60); // convert seconds to minutes

    // 3. Return results
    res.json({
      success: true,
      data: {
        source: sourceData.displayName,
        destination: destData.displayName,
        sourceCoords: [sourceData.lat, sourceData.lon],
        destinationCoords: [destData.lat, destData.lon],
        distance: distanceKm,
        duration: durationMin,
        geometry: mainRoute.geometry // GeoJSON LineString
      }
    });

  } catch (error) {
    console.error('Find route controller error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error during route calculation' });
  }
};

// Save a searched route
const saveRoute = async (req, res) => {
  const { source, destination, sourceCoords, destinationCoords, distance, duration, geometry } = req.body;

  try {
    const newRoute = new Route({
      source,
      destination,
      sourceCoords,
      destinationCoords,
      distance,
      duration,
      geometry
    });

    const savedRoute = await newRoute.save();
    res.status(201).json({ success: true, data: savedRoute, message: 'Route saved successfully' });
  } catch (error) {
    console.error('Save route error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to save route to database' });
  }
};

// Get all saved route searches (history)
const getHistory = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json({ success: true, data: routes });
  } catch (error) {
    console.error('Fetch history error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve search history' });
  }
};

module.exports = {
  findRoute,
  saveRoute,
  getHistory
};
