import React, { useState } from 'react';
import { MapPin, Search, Navigation, ArrowRight, Train, CheckCircle2 } from 'lucide-react';

export default function StationsDirectoryPage({
  allStations = [],
  cities = [],
  selectedCity,
  onSelectCity,
  onSelectStation,
  onNavigateToMap
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const currentCityStations = allStations.filter(s => 
    s.city.toLowerCase() === selectedCity.toLowerCase()
  );

  const filteredStations = currentCityStations.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.line && s.line.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLaunchStation = (stationId) => {
    onSelectStation(stationId);
    onNavigateToMap();
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 bg-[#0F172A]">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blueberry-light uppercase tracking-wider">
                Transit Network Directory
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blueberry/20 text-blueberry-light font-bold border border-blueberry/40">
                {allStations.length} Total Stations
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
              Metro Stations in {selectedCity} ({currentCityStations.length} Stations)
            </h1>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-700/80 w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search station or line..."
              className="bg-transparent text-xs text-white focus:outline-none w-full"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-xs text-slate-500 hover:text-white">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* City Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {cities.map((c) => {
            const count = allStations.filter(s => s.city.toLowerCase() === c.toLowerCase()).length;
            const isSelected = selectedCity.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => onSelectCity(c)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-blueberry text-white shadow-blueberry-glow border-blueberry-light/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{c}</span>
                <span className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((st) => (
            <div
              key={st.id}
              className="glass-panel p-4 rounded-3xl border border-slate-700/60 shadow-glass flex flex-col justify-between hover:border-blueberry/60 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-850 text-blueberry-light border border-slate-700">
                    {st.line || 'Metro Line'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {st.lat.toFixed(4)}, {st.lng.toFixed(4)}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-white group-hover:text-creamsoda transition-colors">
                  {st.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {st.city}
                </p>

                {/* Bays & Corner Stops count pills */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                    {st.curbside_bays?.length || 3} Concourse Bays
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                    {st.virtual_corner_stops?.length || 4} Corner Stops
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchStation(st.id)}
                className="mt-4 w-full py-2 px-3 rounded-2xl bg-slate-850 hover:bg-blueberry text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700 hover:border-blueberry"
              >
                <span>Launch Pooling on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {filteredStations.length === 0 && (
            <div className="col-span-full p-8 text-center glass-panel rounded-3xl border border-slate-800 text-slate-400 text-sm">
              No stations match "{searchTerm}" in {selectedCity}.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
