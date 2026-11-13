import React, { useState } from 'react';
import { 
  Zap, Shield, Luggage, Users, Play, ArrowRight, 
  Sparkles, CheckCircle2, ChevronRight, Clock, MapPin, 
  Crosshair, Compass, Navigation, ArrowUpDown
} from 'lucide-react';

const VEHICLES = [
  {
    id: 'auto',
    name: 'Auto',
    icon: '🛺',
    cap: 3,
    z1: '₹25',
    z2: '₹40',
    desc: '3 Pax Max'
  },
  {
    id: 'ev_auto',
    name: 'EV Auto',
    icon: '⚡',
    cap: 3,
    z1: '₹30',
    z2: '₹45',
    desc: 'Zero Tailpipe · 3 Pax'
  },
  {
    id: 'shuttle',
    name: 'Shuttle',
    icon: '🚐',
    cap: 6,
    z1: '₹20',
    z2: '₹30',
    desc: 'E-Rickshaw · 6 Pax'
  },
  {
    id: 'cab',
    name: 'Cab',
    icon: '🚗',
    cap: 4,
    z1: '₹60',
    z2: '₹90',
    desc: 'Express AC · 4 Pax'
  }
];

export default function ControlHub({
  direction,
  selectedStation,
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
  queuedCount,
  isDispatching,
  isSimulating,
  customOrigin,
  setCustomOrigin,
  customDestination,
  setCustomDestination,
  pickingMode,
  setPickingMode,
  vectorStats
}) {
  const [passengerName, setPassengerName] = useState('Arjun M.');

  const handleSwapLocations = () => {
    if (!customOrigin || !customDestination) return;
    const temp = { ...customOrigin };
    setCustomOrigin({ ...customDestination });
    setCustomDestination(temp);
  };

  const handleSetStationAsOrigin = () => {
    if (!selectedStation) return;
    setCustomOrigin({
      lat: selectedStation.lat,
      lng: selectedStation.lng,
      name: `${selectedStation.name} Concourse Bay`
    });
  };

  const handleSetStationAsDestination = () => {
    if (!selectedStation) return;
    setCustomDestination({
      lat: selectedStation.lat,
      lng: selectedStation.lng,
      name: `${selectedStation.name} Concourse Gate`
    });
  };

  const handleCustomRequest = () => {
    if (!selectedStation || !customOrigin || !customDestination) return;

    onRequestRide({
      direction,
      station_id: selectedStation.id,
      origin: customOrigin,
      destination: customDestination,
      vehicle_class: vehicleClass,
      women_only: womenOnly,
      luggage,
      party_size: partySize,
      passenger_name: passengerName || 'Commuter'
    });
  };

  const currentVehicle = VEHICLES.find(v => v.id === vehicleClass) || VEHICLES[1];

  return (
    <aside className="w-84 glass-panel rounded-3xl p-4 flex flex-col gap-3.5 border border-slate-700/60 shadow-glass overflow-y-auto max-h-[calc(100vh-5.5rem)]">
      
      {/* Hub Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Vector Transit Pooling Hub
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Directional corridor clustering · UN SDG 11.2
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-blueberry-light bg-blueberry/10 px-2 py-0.5 rounded-full border border-blueberry/30">
            {queuedCount} queued
          </span>
        </div>
      </div>

      {/* 1. Interactive Origin & Destination (No Hardcoding) */}
      <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-creamsoda" />
            Corridor Vector Endpoints
          </span>
          <button
            onClick={handleSwapLocations}
            title="Swap Origin and Destination"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* Origin Selector */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span>📍</span> Origin (Starting Point)
            </span>
            <button
              onClick={handleSetStationAsOrigin}
              className="text-[9px] text-slate-400 hover:text-emerald-300 underline"
            >
              Use Station
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customOrigin?.name || ''}
              onChange={(e) => setCustomOrigin(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Origin address / coordinates..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
            />
            <button
              onClick={() => setPickingMode(pickingMode === 'origin' ? null : 'origin')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                pickingMode === 'origin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Click on the map to set origin"
            >
              <Crosshair className="w-3 h-3" />
              <span>{pickingMode === 'origin' ? 'Click Map' : 'Pick'}</span>
            </button>
          </div>
          {customOrigin && (
            <span className="text-[9px] text-slate-500 font-mono">
              GPS: {customOrigin.lat}, {customOrigin.lng}
            </span>
          )}
        </div>

        {/* Destination Selector */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#FFD6A5] font-bold flex items-center gap-1">
              <span>🏁</span> Destination (Drop Point)
            </span>
            <button
              onClick={handleSetStationAsDestination}
              className="text-[9px] text-slate-400 hover:text-amber-300 underline"
            >
              Use Station
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customDestination?.name || ''}
              onChange={(e) => setCustomDestination(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Destination address / coordinates..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD6A5] font-medium"
            />
            <button
              onClick={() => setPickingMode(pickingMode === 'destination' ? null : 'destination')}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                pickingMode === 'destination'
                  ? 'bg-[#FFD6A5] text-slate-950 shadow-md shadow-amber-300/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Click on the map to set destination"
            >
              <Crosshair className="w-3 h-3" />
              <span>{pickingMode === 'destination' ? 'Click Map' : 'Pick'}</span>
            </button>
          </div>
          {customDestination && (
            <span className="text-[9px] text-slate-500 font-mono">
              GPS: {customDestination.lat}, {customDestination.lng}
            </span>
          )}
        </div>

        {/* Live Vector Alignment Radar Card */}
        <div className="mt-1 p-2 rounded-xl bg-slate-950/70 border border-blueberry/30 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blueberry-light" />
              Direction Vector
            </span>
            <span className="text-creamsoda font-mono font-bold">
              {vectorStats?.heading_direction || 'NE'} · {vectorStats?.bearing_degrees || 45}°
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Direct Distance:</span>
            <span className="text-white font-mono font-bold">
              {vectorStats?.direct_distance_km || 2.4} km
            </span>
          </div>

          <div className="mt-0.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Collinear Matches:
            </span>
            <span className="text-emerald-300 font-mono font-bold">
              {vectorStats?.matching_corridor_riders || 0} co-riders
            </span>
          </div>
        </div>

      </div>

      {/* 2. Commuter Identity & Vehicle Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Passenger Name
        </label>
        <input
          type="text"
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
          placeholder="Enter passenger name"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blueberry"
        />
      </div>

      {/* Vehicle Class Tabs */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Vehicle Fleet Class</span>
          <span className="text-creamsoda font-mono">{currentVehicle.desc}</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {VEHICLES.map((v) => {
            const isSelected = vehicleClass === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setVehicleClass(v.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all ${
                  isSelected 
                    ? 'bg-blueberry/25 border-blueberry text-white shadow-blueberry-glow scale-[1.02]' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{v.icon}</span>
                <span className="text-[10px] font-bold mt-0.5">{v.name}</span>
                <span className="text-[9px] text-creamsoda font-mono mt-0.5 font-bold">{v.z1}</span>
              </button>
            );
          })}
        </div>

        {/* Capacity & Zonal Fare Info */}
        <div className="flex items-center justify-between text-[10px] px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
          <span>Zone 1 (≤3 km): <strong className="text-creamsoda font-mono">{currentVehicle.z1}</strong></span>
          <span>Zone 2 (&gt;3 km): <strong className="text-creamsoda font-mono">{currentVehicle.z2}</strong></span>
        </div>
      </div>

      {/* Party Size & Luggage Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Party Size
          </label>
          <div className="flex rounded-xl bg-slate-900/80 border border-slate-800 p-0.5">
            {[1, 2].map((size) => (
              <button
                key={size}
                onClick={() => setPartySize(size)}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                  partySize === size
                    ? 'bg-blueberry text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size} Pax
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Luggage (+1 Seat)
          </label>
          <button
            onClick={() => setLuggage(!luggage)}
            className={`py-1 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              luggage
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>{luggage ? 'Has Luggage' : 'No Luggage'}</span>
          </button>
        </div>
      </div>

      {/* Women-Priority Safety Isolation Toggle */}
      <div 
        onClick={() => setWomenOnly(!womenOnly)}
        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
          womenOnly 
            ? 'bg-purple-950/40 border-purple-500/70 shadow-lg shadow-purple-950/40' 
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            womenOnly ? 'bg-purple-600 text-white shadow-md shadow-purple-600/50' : 'bg-slate-800 text-slate-400'
          }`}>
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Women-Priority Pool</span>
              {womenOnly && (
                <span className="text-[9px] font-extrabold uppercase bg-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded border border-purple-400/40">
                  Active
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Strict sub-pool safety isolation</p>
          </div>
        </div>

        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
          womenOnly ? 'border-purple-400 bg-purple-600 text-white' : 'border-slate-600 bg-transparent'
        }`}>
          {womenOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Action: Ingest Single Commuter Intent */}
      <button
        onClick={handleCustomRequest}
        className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-blueberry/50 active:scale-[0.99]"
      >
        <span>Ingest Commuter Intent</span>
        <ArrowRight className="w-3.5 h-3.5 text-blueberry-light" />
      </button>

      {/* Action: Dispatch Active Vector Pools */}
      <button
        onClick={onDispatch}
        disabled={isDispatching}
        className={`w-full py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
          queuedCount > 0
            ? 'bg-gradient-to-r from-blueberry to-blueberry-light text-white shadow-blueberry-glow hover:brightness-110 active:scale-[0.99]'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
        }`}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>{isDispatching ? 'Optimizing Vectors...' : `Dispatch Active Pools (${queuedCount} Queued)`}</span>
      </button>

      {/* Hackathon "God Mode" Simulators */}
      <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-2">
        <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Hackathon "God Mode" Simulators
        </span>

        <button
          onClick={() => onSimulate('morning_first_mile')}
          disabled={isSimulating}
          className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blueberry/10 to-transparent border border-amber-500/30 hover:border-amber-400 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>🌅</span> Morning First-Mile Wave
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            12 residential homes ➔ Virtual Corner Stops
          </p>
        </button>

        <button
          onClick={() => onSimulate('evening_last_mile')}
          disabled={isSimulating}
          className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blueberry/10 to-transparent border border-purple-500/30 hover:border-purple-400 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
              <span>🌆</span> Evening Metro Docking
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            12 exiting riders ➔ Tech Corridors
          </p>
        </button>
      </div>

    </aside>
  );
}
