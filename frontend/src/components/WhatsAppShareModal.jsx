import React from 'react';
import { 
  X, Share2, Shield, CheckCircle2, Copy, 
  ExternalLink, PhoneCall, AlertCircle 
} from 'lucide-react';

export default function WhatsAppShareModal({ isOpen, onClose, trip }) {
  if (!isOpen || !trip) return null;

  const shareText = `🛡️ *MetroMesh Live Safety Boarding Pass*\n` +
    `⚡ Vehicle: *${trip.plate_id}* (${trip.vehicle_label})\n` +
    `📍 Pickup Zone: *${trip.assigned_pickup_zone}*\n` +
    `👤 Pilot: *${trip.driver_name}*\n` +
    `💰 Locked Fare: *₹${trip.passengers?.[0]?.locked_fare || 25} FIXED*\n` +
    `🛡️ Safety Isolation: *${trip.women_only_pool ? 'Women-Priority Verified Pool' : 'Verified Transit Mesh'}*\n` +
    `⏱️ Dwell Window: *Strict 2-min concourse departure*\n` +
    `🔗 Live Concourse Verification: https://metromesh.in/track/${trip.trip_id}`;

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    alert('Safety Boarding Pass copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-3xl p-5 border border-slate-700 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              WhatsApp Trip Share & Emergency SOS
            </h3>
            <p className="text-xs text-slate-400">
              Instant verifiable telemetry dispatch to trusted contacts
            </p>
          </div>
        </div>

        {/* Formatted Alert Preview Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 font-mono space-y-1.5 shadow-inner select-text">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold border-b border-slate-800 pb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>METROMESH LIVE TRANSIT PASS</span>
          </div>
          <div className="pt-1">
            <span className="text-slate-400">Vehicle:</span> <strong className="text-white">{trip.plate_id}</strong>
          </div>
          <div>
            <span className="text-slate-400">Class:</span> {trip.vehicle_label}
          </div>
          <div>
            <span className="text-slate-400">Curbside Bay:</span> <span className="text-creamsoda">{trip.assigned_pickup_zone}</span>
          </div>
          <div>
            <span className="text-slate-400">Pilot:</span> {trip.driver_name}
          </div>
          <div>
            <span className="text-slate-400">Zonal Fare:</span> <strong className="text-creamsoda">₹{trip.passengers?.[0]?.locked_fare || 25} FIXED</strong>
          </div>
          <div>
            <span className="text-slate-400">Safety Pool:</span> {trip.women_only_pool ? '🛡️ Women-Only Partitioned' : 'Standard Verified'}
          </div>
        </div>

        {/* SOS Hotline Alert Note */}
        <div className="mt-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center gap-2 text-[11px] text-purple-200">
          <PhoneCall className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Integrated with Metro Transit Police SOS & Concourse Security feed.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>
          
          <button
            onClick={handleOpenWhatsApp}
            className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-900/40 hover:brightness-110"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
