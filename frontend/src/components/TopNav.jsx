import React, { useState } from 'react';
import { 
  Train, Building2, MapPin, Zap, 
  RotateCcw, Compass, Map, Ticket, 
  TrendingUp, Compass as DirectoryIcon, Search
} from 'lucide-react';

export default function TopNav({
  activePage = 'map',
  setActivePage,
  direction,
  setDirection,
  cities = [],
  selectedCity,
  onSelectCity,
  cityStations = [],
  selectedStation,
  onSelectStation,
  queuedCount = 0,
  tripsCount = 0,
  onReset,
  isLive
}) {
  const [stationSearch, setStationSearch] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);

  const filteredStations = cityStations.filter(s => 
    s.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
    (s.line && s.line.toLowerCase().includes(stationSearch.toLowerCase()))
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 py-2 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Brand Logo & BITS Hack4SDG Badge */}
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => setActivePage('map')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blueberry to-blueberry-light flex items-center justify-center shadow-md shadow-blueberry/50">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white flex items-center">
                  Metro<span className="text-creamsoda">Mesh</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blueberry/30 text-blueberry-light border border-blueberry/40 font-bold">
                  SDG 11.2
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium block">
                BITS Hyderabad
              </span>
            </div>
          </div>
        </div>

        {/* Center: Multi-Page Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          
          {/* Tab 1: Live Map */}
          <button
            onClick={() => setActivePage('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePage === 'map'
                ? 'bg-blueberry text-white shadow-blueberry-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Live Map</span>
          </button>

          {/* Tab 2: Boarding Pass */}
          <button
            onClick={() => setActivePage('pass')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
              activePage === 'pass'
                ? 'bg-blueberry text-white shadow-blueberry-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-creamsoda" />
            <span>Boarding Pass</span>
            {tripsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-mono text-[9px] font-black">
                {tripsCount}
              </span>
            )}
          </button>

          {/* Tab 3: SDG 11.2 Impact */}
          <button
            onClick={() => setActivePage('impact')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePage === 'impact'
                ? 'bg-blueberry text-white shadow-blueberry-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>SDG 11.2 Impact</span>
          </button>

          {/* Tab 4: Stations Directory */}
          <button
            onClick={() => setActivePage('stations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePage === 'stations'
                ? 'bg-blueberry text-white shadow-blueberry-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Train className="w-3.5 h-3.5 text-blueberry-light" />
            <span>Stations</span>
          </button>

        </nav>

        {/* Right: City Selector & Direction Switch */}
        <div className="flex items-center gap-2">
          
          {/* Direction Switch */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setDirection('TO_METRO')}
              title="First-Mile: Headed TO Metro Station"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                direction === 'TO_METRO'
                  ? 'bg-blueberry text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TO Metro
            </button>
            <button
              onClick={() => setDirection('FROM_METRO')}
              title="Last-Mile: Leaving FROM Metro Station"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                direction === 'FROM_METRO'
                  ? 'bg-blueberry text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FROM Metro
            </button>
          </div>

          {/* City Selector Dropdown */}
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-creamsoda" />
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
            >
              {cities.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            title="Reset simulation & queue"
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
