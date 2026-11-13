import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Ticket, QrCode, Clock, MapPin, Users, Shield, 
  Share2, ChevronLeft, ChevronRight, Zap, CheckCircle2,
  AlertTriangle, ExternalLink
} from 'lucide-react';

export default function GlassPass({
  trips = [],
  activeTripIndex = 0,
  setActiveTripIndex,
  onOpenShareModal
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const qrCanvasRef = useRef(null);

  const trip = trips[activeTripIndex];

  // Dwell Countdown Timer (Strict 2-min dwell)
  useEffect(() => {
    setSecondsRemaining(trip?.departure_dwell_seconds || 120);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [trip?.trip_id]);

  // Generate offline QR Token Canvas & Cache in LocalStorage
  useEffect(() => {
    if (trip && trip.qr_token) {
      const cacheKey = `mm_qr_${trip.trip_id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setQrDataUrl(cached);
      } else {
        QRCode.toDataURL(trip.qr_token, {
          width: 140,
          margin: 1,
          color: {
            dark: '#6A00F4',
            light: '#0F172A'
          }
        })
          .then((url) => {
            setQrDataUrl(url);
            localStorage.setItem(cacheKey, url);
          })
          .catch((err) => console.error('QR Generation Error:', err));
      }
    }
  }, [trip?.trip_id, trip?.qr_token]);

  if (!trip) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Compute total locked fare
  const totalFare = trip.passengers?.reduce((acc, p) => acc + (p.locked_fare || 25), 0) || 25;
  const primaryFare = trip.passengers?.[0]?.locked_fare || 25;

  return (
    <aside className="w-80 glass-panel rounded-3xl p-4 flex flex-col gap-3.5 border border-slate-700/60 shadow-glass animate-slide-in-right">
      
      {/* Header & Pagination */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-creamsoda/20 text-creamsoda flex items-center justify-center">
            <Ticket className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              The Glass Pass
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Trip #{trip.trip_id.slice(-5)}
            </span>
          </div>
        </div>

        {/* Multi-Trip Pagination Switcher */}
        {trips.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-850 px-2 py-0.5 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTripIndex(Math.max(0, activeTripIndex - 1))}
              disabled={activeTripIndex === 0}
              className="text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300">
              {activeTripIndex + 1}/{trips.length}
            </span>
            <button
              onClick={() => setActiveTripIndex(Math.min(trips.length - 1, activeTripIndex + 1))}
              disabled={activeTripIndex === trips.length - 1}
              className="text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Class & Plate ID */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-blueberry/20 border border-blueberry/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-blueberry-light uppercase tracking-wider block">
            Assigned Vehicle
          </span>
          <div className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
            <span>{trip.plate_id}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Pilot: {trip.driver_name}
          </span>
        </div>

        {trip.women_only_pool && (
          <div className="px-2 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-[10px] font-bold flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-300" />
            <span>Women-Only</span>
          </div>
        )}
      </div>

      {/* Pickup Zone & Locked Zonal Fare in Cream Soda */}
      <div className="grid grid-cols-2 gap-2">
        {/* Curbside Bay */}
        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-creamsoda" />
            Pickup Zone
          </span>
          <div className="text-xs font-bold text-slate-100 mt-1 truncate" title={trip.assigned_pickup_zone}>
            {trip.assigned_pickup_zone}
          </div>
        </div>

        {/* Locked Zonal Fare */}
        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            Locked Fare
          </span>
          <div className="text-base font-extrabold text-creamsoda text-glow-creamsoda mt-0.5 font-mono">
            ₹{primaryFare} <span className="text-[10px] font-sans font-semibold text-slate-400">FIXED</span>
          </div>
        </div>
      </div>

      {/* Boarding Dwell Countdown (Strict 2-min dwell) */}
      <div className={`p-2.5 rounded-2xl border flex items-center justify-between transition-colors ${
        secondsRemaining > 30 
          ? 'bg-slate-900/80 border-slate-800 text-slate-200' 
          : 'bg-amber-950/40 border-amber-600/50 text-amber-200 animate-pulse'
      }`}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-creamsoda" />
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Boarding Dwell Window
            </div>
            <div className="text-xs font-bold font-mono">
              Departs in {formatTime(secondsRemaining)} (Strict 2-min dwell)
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-creamsoda">
          {secondsRemaining}s
        </span>
      </div>

      {/* Passenger Occupancy Badge & List */}
      <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-blueberry-light" />
            Occupancy Cap
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {trip.capacity_used}/{trip.capacity_max} Seats Filled
          </span>
        </div>

        {/* Co-rider Avatar Chips */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {trip.passengers?.map((p, idx) => (
            <div 
              key={p.request_id || idx}
              className="px-2 py-1 rounded-xl bg-slate-800/90 border border-slate-700/60 text-[10px] text-slate-200 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blueberry"></span>
              <span className="font-semibold">{p.passenger_name}</span>
              {p.party_size > 1 && <span className="text-[9px] text-creamsoda">+1</span>}
              {p.luggage && <span className="text-[9px] text-amber-400">🧳</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Local-Storage Cached QR Boarding Token */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col items-center text-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <QrCode className="w-3 h-3 text-blueberry-light" />
          Concourse Turnstile QR Pass (Cached Offline)
        </span>
        {qrDataUrl ? (
          <img 
            src={qrDataUrl} 
            alt="Offline QR Boarding Token" 
            className="w-28 h-28 rounded-xl border border-blueberry/40 shadow-sm p-1 bg-slate-900" 
          />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-xs">
            Generating...
          </div>
        )}
        <span className="text-[9px] font-mono text-slate-400 mt-1.5">
          Instant NFC/Barcode Turnstile Sync
        </span>
      </div>

      {/* Emergency Share Button: "Share Trip via WhatsApp" */}
      <button
        onClick={() => onOpenShareModal(trip)}
        className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:border-emerald-400 active:scale-[0.98]"
      >
        <Share2 className="w-4 h-4 text-emerald-400" />
        <span>Share Trip via WhatsApp</span>
      </button>

    </aside>
  );
}
