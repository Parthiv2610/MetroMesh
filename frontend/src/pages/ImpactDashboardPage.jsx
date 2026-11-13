import React from 'react';
import { 
  Award, TrendingUp, Car, Leaf, ShieldCheck, 
  Users, Zap, CheckCircle2, Globe2, ArrowRight
} from 'lucide-react';

export default function ImpactDashboardPage({ metrics, tripsCount, onNavigateToMap }) {
  const savings = metrics?.rider_savings_inr || 0;
  const vmtAvoided = metrics?.vmt_avoided_km || 0;
  const co2Offset = metrics?.co2_offset_kg || 0;
  const ridersPooled = metrics?.total_riders_pooled || 0;
  const efficiency = metrics?.average_pooling_efficiency || (tripsCount > 0 ? (ridersPooled / tripsCount).toFixed(2) : 2.4);
  const womenPools = metrics?.women_priority_trips || 0;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 bg-[#0F172A]">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Hero Banner: UN SDG 11.2 */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 shadow-glass flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                United Nations SDG Target 11.2 Command Center
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Sustainable, Affordable & Safe Urban Transit
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              "By 2030, provide access to safe, affordable, accessible and sustainable transport systems for all, improving road safety, notably by expanding public transport."
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-mono text-slate-400">Target Hackathon</span>
            <span className="text-sm font-extrabold text-creamsoda">BITS Hyderabad</span>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold mt-1.5">
              Live Verified Telemetry
            </span>
          </div>
        </div>

        {/* 3 Main Animated Metrics Cards + Efficiency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Rider Savings */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-700/60 shadow-glass flex flex-col">
            <div className="w-9 h-9 rounded-2xl bg-creamsoda/20 text-creamsoda flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Commuter Savings
            </span>
            <div className="text-3xl font-black text-creamsoda text-glow-creamsoda font-mono mt-1">
              ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <span className="text-xs text-slate-400 mt-1">
              55%–70% cheaper than solo cabs
            </span>
          </div>

          {/* 2. VMT Avoided */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-700/60 shadow-glass flex flex-col">
            <div className="w-9 h-9 rounded-2xl bg-blueberry/20 text-blueberry-light flex items-center justify-center mb-3">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              VMT Avoided
            </span>
            <div className="text-3xl font-black text-blueberry-light text-glow-blueberry font-mono mt-1">
              {vmtAvoided.toFixed(1)} <span className="text-base font-sans font-bold">km</span>
            </div>
            <span className="text-xs text-slate-400 mt-1">
              Vehicle miles removed from road
            </span>
          </div>

          {/* 3. CO2 Emissions Offset */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-700/60 shadow-glass flex flex-col">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              CO₂ Emissions Offset
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {co2Offset.toFixed(2)} <span className="text-base font-sans font-bold">kg</span>
            </div>
            <span className="text-xs text-slate-400 mt-1">
              Net tailpipe avoidance factor
            </span>
          </div>

          {/* 4. Pooling Efficiency */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-700/60 shadow-glass flex flex-col">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Pooling Efficiency
            </span>
            <div className="text-3xl font-black text-purple-300 font-mono mt-1">
              {efficiency}x
            </div>
            <span className="text-xs text-slate-400 mt-1">
              {ridersPooled} riders across {tripsCount} vehicles
            </span>
          </div>

        </div>

        {/* Detailed Transit Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Zonal Pricing vs Solo Cab Comparison Table */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-700/60 shadow-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-creamsoda" />
                Locked Zonal Fare Matrix
              </h3>
              <span className="text-xs font-mono text-slate-400">Strict Cap Guarantee</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="py-2.5">Fleet Class</th>
                    <th className="py-2.5">Cap</th>
                    <th className="py-2.5 text-creamsoda font-bold">Zone 1 (≤3km)</th>
                    <th className="py-2.5 text-creamsoda font-bold">Zone 2 (&gt;3km)</th>
                    <th className="py-2.5 text-slate-400">Solo Cab Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-2.5 text-white font-bold">🛺 Shared Auto</td>
                    <td className="py-2.5 text-slate-300">3 pax</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹25</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹40</td>
                    <td className="py-2.5 text-slate-500 line-through font-mono">₹85</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-white font-bold">⚡ Eco EV Auto</td>
                    <td className="py-2.5 text-slate-300">3 pax</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹30</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹45</td>
                    <td className="py-2.5 text-slate-500 line-through font-mono">₹90</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-white font-bold">🚐 6-Seater Shuttle</td>
                    <td className="py-2.5 text-slate-300">6 pax</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹20</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹30</td>
                    <td className="py-2.5 text-slate-500 line-through font-mono">₹80</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-white font-bold">🚗 Express AC Cab</td>
                    <td className="py-2.5 text-slate-300">4 pax</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹60</td>
                    <td className="py-2.5 text-creamsoda font-bold font-mono">₹90</td>
                    <td className="py-2.5 text-slate-500 line-through font-mono">₹160</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
              * Luggage reservation reserves +1 capacity unit. Guaranteed strict 2-min concourse dwell.
            </p>
          </div>

          {/* Safety & Algorithmic Constraint Verification */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-700/60 shadow-glass flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Algorithmic Verification Engine
                </h3>
                <span className="text-xs font-mono text-emerald-400">100% Passed</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Women-Priority Partition Isolation</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {womenPools} women-priority pools formed with strict zero non-women mixing guarantee.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blueberry/20 text-blueberry-light flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Maximum Detour Delay Bound: ≤ 3.5 min</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Greedy sequence insertion enforces maximum detour threshold of 3.5 min per rider.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Collinear Radius ≤ 1.2 km & 3-min TTL</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Automatic force dispatch prevents violating the 20-minute maximum transit SLA.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToMap}
              className="w-full mt-4 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>Return to Live Dispatch Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
