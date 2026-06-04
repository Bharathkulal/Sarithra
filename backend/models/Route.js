const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  sourceCoords: {
    type: [Number], // [lat, lon]
    required: true
  },
  destinationCoords: {
    type: [Number], // [lat, lon]
    required: true
  },
  distance: {
    type: Number, // in km
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  geometry: {
    type: Object, // GeoJSON LineString
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', RouteSchema);
