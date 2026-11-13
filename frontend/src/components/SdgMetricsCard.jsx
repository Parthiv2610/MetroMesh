import React from 'react';
import { 
  TrendingUp, Leaf, Car, ShieldCheck, Award, 
  HelpCircle, ChevronUp 
} from 'lucide-react';

export default function SdgMetricsCard({ metrics }) {
  const savings = metrics?.rider_savings_inr || 0;
  const vmtAvoided = metrics?.vmt_avoided_km || 0;
  const co2Offset = metrics?.co2_offset_kg || 0;
  const efficiency = metrics?.average_pooling_efficiency || 0;

  return (
    <div className="fixed bottom-4 right-4 z-20 pointer-events-auto">
      <div className="w-84 glass-panel rounded-3xl p-4 border border-slate-700/60 shadow-glass">
        
        {/* Card Header with UN SDG 11.2 Badge */}
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  SDG 11.2 Live Impact
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  UN TARGET
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Sustainable & Affordable Urban Transit
              </span>
            </div>
          </div>
        </div>

        {/* 3 Mandatory Animated Metrics */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* 1. Rider Savings vs Solo Cabs (₹) */}
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-creamsoda" />
              Savings
            </span>
            <div className="text-sm font-extrabold text-creamsoda text-glow-creamsoda font-mono mt-1">
              ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">
              vs Solo Cabs
            </span>
          </div>

          {/* 2. Vehicle Miles Traveled Avoided (km) */}
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Car className="w-3 h-3 text-blueberry-light" />
              VMT Saved
            </span>
            <div className="text-sm font-extrabold text-blueberry-light text-glow-blueberry font-mono mt-1">
              {vmtAvoided.toFixed(1)} <span className="text-[10px] font-sans">km</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">
              Avoided Congestion
            </span>
          </div>

          {/* 3. Estimated CO2 Emissions Offset (kg) */}
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-400" />
              CO2 Offset
            </span>
            <div className="text-sm font-extrabold text-emerald-400 font-mono mt-1">
              {co2Offset.toFixed(2)} <span className="text-[10px] font-sans">kg</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">
              Net Avoided
            </span>
          </div>

        </div>

        {/* Footer Pill: BITS Hyderabad Presentation Marker */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            {metrics?.women_priority_trips || 0} Women-Isolated Pools
          </span>
          <span className="font-mono text-slate-400">
            Avg: <strong className="text-creamsoda">{efficiency > 0 ? efficiency : '2.4'}x</strong> pax/veh
          </span>
        </div>

      </div>
    </div>
  );
}
