import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import ControlHub from '../components/ControlHub';
import { Ticket, TrendingUp, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import { matchCorridor } from '../services/api';

export default function MapPage({
  station,
  allCityStations,
  metroLines = [],
  onSelectStation,
  direction,
  queuedRequests,
  dispatchedTrips,
  activeTripIndex,
  vehicleClass,
  setVehicleClass,
  womenOnly,
  setWomenOnly,
  luggage,
  setLuggage,
  partySize,
  setPartySize,
  onRequestRide,
  onDispatch,
  onSimulate,
  isDispatching,
  isSimulating,
  metrics,
  onNavigateToPass,
  onNavigateToImpact
}) {
  const [customOrigin, setCustomOrigin] = useState(null);
  const [customDestination, setCustomDestination] = useState(null);
  const [pickingMode, setPickingMode] = useState(null); // null | 'origin' | 'destination'
  const [vectorStats, setVectorStats] = useState({
    vector_dx_km: 1.5,
    vector_dy_km: 1.2,
    bearing_degrees: 48.0,
    heading_direction: 'NE',
    direct_distance_km: 2.3,
    matching_corridor_riders: 0,
    corridor_matches: []
  });

  // Initialize or re-anchor endpoints when station or direction changes
  useEffect(() => {
    if (!station) return;

    if (direction === 'TO_METRO') {
      const defaultDest = {
        lat: station.lat,
        lng: station.lng,
        name: `${station.name} Concourse Gate`
      };
      const defaultOrigin = {
        lat: Number((station.lat + 0.0072).toFixed(5)),
        lng: Number((station.lng - 0.0068).toFixed(5)),
        name: `${station.name} Residential Arch`
      };
      setCustomOrigin(defaultOrigin);
      setCustomDestination(defaultDest);
    } else {
      const defaultOrigin = {
        lat: station.lat,
        lng: station.lng,
        name: `${station.name} Curb Bay 1`
      };
      const defaultDest = {
        lat: Number((station.lat + 0.0088).toFixed(5)),
        lng: Number((station.lng + 0.0094).toFixed(5)),
        name: `${station.name} IT Tech Corridor`
      };
      setCustomOrigin(defaultOrigin);
      setCustomDestination(defaultDest);
    }
  }, [station?.id, direction]);

  // Recalculate Vectorization stats and query collinear corridor matches
  useEffect(() => {
    if (!customOrigin || !customDestination) return;

    // Fast local vector geometry calculation
    const midLat = (customOrigin.lat + customDestination.lat) / 2.0;
    const rad = Math.PI / 180.0;
    const dx = (customDestination.lng - customOrigin.lng) * 111.32 * Math.cos(midLat * rad);
    const dy = (customDestination.lat - customOrigin.lat) * 111.32;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Bearing calculation in degrees
    const y = Math.sin((customDestination.lng - customOrigin.lng) * rad) * Math.cos(customDestination.lat * rad);
    const x = Math.cos(customOrigin.lat * rad) * Math.sin(customDestination.lat * rad) -
              Math.sin(customOrigin.lat * rad) * Math.cos(customDestination.lat * rad) * Math.cos((customDestination.lng - customOrigin.lng) * rad);
    let bearing = (Math.atan2(y, x) * 180.0 / Math.PI + 360.0) % 360.0;

    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const ix = Math.floor((bearing + 11.25) / 22.5) % 16;
    const heading = dirs[ix];

    setVectorStats(prev => ({
      ...prev,
      vector_dx_km: Number(dx.toFixed(2)),
      vector_dy_km: Number(dy.toFixed(2)),
      bearing_degrees: Number(bearing.toFixed(1)),
      heading_direction: heading,
      direct_distance_km: Number(dist.toFixed(2))
    }));

    // Query backend for real-time corridor matches against currently queued commuters
    let isCancelled = false;
    matchCorridor(customOrigin, customDestination, station?.id)
      .then(res => {
        if (!isCancelled && res) {
          setVectorStats(res);
        }
      })
      .catch(() => {
        // Fallback to local calculation if backend is busy
      });

    return () => {
      isCancelled = true;
    };
  }, [customOrigin?.lat, customOrigin?.lng, customDestination?.lat, customDestination?.lng, station?.id, queuedRequests.length]);

  const latestTrip = dispatchedTrips[activeTripIndex] || dispatchedTrips[dispatchedTrips.length - 1];

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden">
      
      {/* 1. Dark Mode Map View Layer with Rail Tracks & Draggable Pins */}
      <MapView
        station={station}
        allCityStations={allCityStations}
        metroLines={metroLines}
        onSelectStation={onSelectStation}
        direction={direction}
        queuedRequests={queuedRequests}
        dispatchedTrips={dispatchedTrips}
        activeTripIndex={activeTripIndex}
        customOrigin={customOrigin}
        customDestination={customDestination}
        onPickOrigin={(point) => {
          setCustomOrigin(point);
          setPickingMode(null);
        }}
        onPickDestination={(point) => {
          setCustomDestination(point);
          setPickingMode(null);
        }}
        pickingMode={pickingMode}
        vectorStats={vectorStats}
      />

      {/* Picking Mode Banner Prompt */}
      {pickingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-bounce">
          <div className="px-4 py-2 rounded-2xl bg-blueberry border border-white/50 text-white font-bold text-xs shadow-2xl flex items-center gap-2">
            <span>🎯</span>
            <span>
              Click ANY location on the map to set{' '}
              <strong className="text-creamsoda uppercase">
                {pickingMode === 'origin' ? 'Origin (Pickup)' : 'Destination (Drop)'}
              </strong>
            </span>
            <button
              onClick={() => setPickingMode(null)}
              className="ml-2 px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-[10px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. Left Floating Control Hub */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
        <ControlHub
          direction={direction}
          selectedStation={station}
          vehicleClass={vehicleClass}
          setVehicleClass={setVehicleClass}
          womenOnly={womenOnly}
          setWomenOnly={setWomenOnly}
          luggage={luggage}
          setLuggage={setLuggage}
          partySize={partySize}
          setPartySize={setPartySize}
          onRequestRide={onRequestRide}
          onDispatch={onDispatch}
          onSimulate={onSimulate}
          queuedCount={queuedRequests.length}
          isDispatching={isDispatching}
          isSimulating={isSimulating}
          customOrigin={customOrigin}
          setCustomOrigin={setCustomOrigin}
          customDestination={customDestination}
          setCustomDestination={setCustomDestination}
          pickingMode={pickingMode}
          setPickingMode={setPickingMode}
          vectorStats={vectorStats}
        />
      </div>

      {/* 3. Non-Overlapping Bottom Notification Bar (Appears when rides are dispatched) */}
      {dispatchedTrips.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-slide-up">
          <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-4 border border-blueberry/50 shadow-glass">
            
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blueberry-light opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blueberry"></span>
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{latestTrip?.plate_id}</span>
                <span className="text-creamsoda font-mono font-black">₹{latestTrip?.passengers?.[0]?.locked_fare || 25} FIXED</span>
              </span>
              {latestTrip?.women_only_pool && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/40 font-bold">
                  Women-Only
                </span>
              )}
            </div>

            <div className="h-4 w-px bg-slate-700/60 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToPass}
                className="px-3.5 py-1.5 rounded-xl bg-blueberry hover:bg-blueberry-light text-white text-xs font-extrabold flex items-center gap-1.5 shadow-blueberry-glow transition-all"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Open Boarding Pass ({dispatchedTrips.length} active)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateToImpact}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-creamsoda text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Savings: ₹{metrics?.rider_savings_inr?.toFixed(0) || 0}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
