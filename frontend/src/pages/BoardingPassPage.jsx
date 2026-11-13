import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Ticket, QrCode, Clock, MapPin, Users, Shield, 
  Share2, ChevronLeft, ChevronRight, Zap, CheckCircle2,
  Navigation, ArrowRight, AlertCircle, PhoneCall
} from 'lucide-react';

export default function BoardingPassPage({
  trips = [],
  activeTripIndex = 0,
  setActiveTripIndex,
  onOpenShareModal,
  onNavigateToMap
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const trip = trips[activeTripIndex] || trips[0];

  // Dwell Countdown Timer
  useEffect(() => {
    setSecondsRemaining(trip?.departure_dwell_seconds || 120);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [trip?.trip_id]);

  // QR Token Generation & Caching
  useEffect(() => {
    if (trip && trip.qr_token) {
      const cacheKey = `mm_qr_${trip.trip_id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setQrDataUrl(cached);
      } else {
        QRCode.toDataURL(trip.qr_token, {
          width: 200,
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

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!trip) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-500 mb-4 shadow-glass">
          <Ticket className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Boarding Pass Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Dispatch active pooling rides from the Live Map or run a God-Mode simulation to generate your digital boarding pass.
        </p>
        <button
          onClick={onNavigateToMap}
          className="px-5 py-2.5 rounded-2xl bg-blueberry hover:bg-blueberry-light text-white text-sm font-bold flex items-center gap-2 shadow-blueberry-glow transition-all"
        >
          <span>Go to Live Dispatch Map</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const primaryFare = trip.passengers?.[0]?.locked_fare || 25;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 bg-[#0F172A]">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Page Header & Multi-Trip Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blueberry-light uppercase tracking-wider">
                Digital Boarding Pass
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                LOCKED ZONAL FARE
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>The Glass Pass</span>
              <span className="text-slate-500 text-lg font-mono font-normal">#{trip.trip_id}</span>
            </h1>
          </div>

          {/* Multi-Trip Navigation Pills */}
          {trips.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Switch Active Trip:</span>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                {trips.map((t, idx) => (
                  <button
                    key={t.trip_id || idx}
                    onClick={() => setActiveTripIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      idx === activeTripIndex
                        ? 'bg-blueberry text-white shadow-blueberry-glow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Trip {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Two-Column Pass Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Boarding Pass Body (8 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Vehicle & Pilot Banner */}
            <div className="glass-panel p-5 rounded-3xl border border-blueberry/40 shadow-glass flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-blueberry-light font-bold uppercase tracking-wider block">
                  Assigned Vehicle & Class
                </span>
                <div className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                  <span>{trip.plate_id}</span>
                </div>
                <div className="text-xs text-slate-300 font-medium mt-1">
                  Pilot: <strong className="text-white">{trip.driver_name}</strong> · {trip.vehicle_label}
                </div>
              </div>

              {trip.women_only_pool ? (
                <div className="px-3 py-2 rounded-2xl bg-purple-900/40 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-300" />
                  <span>Women-Priority Verified Pool</span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-2xl bg-slate-850 border border-slate-700/60 text-slate-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Standard Verified Pool</span>
                </div>
              )}
            </div>

            {/* Curbside Bay & Locked Fare Card */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pickup Bay */}
              <div className="glass-panel p-4 rounded-3xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <MapPin className="w-4 h-4 text-creamsoda" />
                  Pickup Point
                </span>
                <div className="text-sm font-extrabold text-white mt-1.5">
                  {trip.assigned_pickup_zone}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Station Concourse Bay
                </span>
              </div>

              {/* Locked Zonal Fare in Cream Soda */}
              <div className="glass-panel p-4 rounded-3xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  Locked Zonal Fare
                </span>
                <div className="text-2xl font-black text-creamsoda text-glow-creamsoda font-mono mt-1">
                  ₹{primaryFare} <span className="text-xs font-sans font-bold text-slate-400">FIXED</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-0.5 block font-medium">
                  Guaranteed zero surge pricing
                </span>
              </div>
            </div>

            {/* Boarding Dwell Countdown (Strict 2-min dwell) */}
            <div className={`p-4 rounded-3xl border flex items-center justify-between ${
              secondsRemaining > 30 
                ? 'glass-panel border-slate-700/60 text-slate-200' 
                : 'bg-amber-950/40 border-amber-500/60 text-amber-200 animate-pulse'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-creamsoda/30 flex items-center justify-center text-creamsoda">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Concourse Dwell Window
                  </div>
                  <div className="text-sm font-black font-mono text-white">
                    Departs in {formatTime(secondsRemaining)} (Strict 2-min dwell)
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-800 text-creamsoda border border-slate-700">
                {secondsRemaining}s left
              </span>
            </div>

            {/* Passenger Occupancy Cap & Co-Riders */}
            <div className="glass-panel p-4 rounded-3xl border border-slate-700/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blueberry-light" />
                  Vehicle Occupancy ({trip.capacity_used}/{trip.capacity_max} Seats Filled)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {Math.round((trip.capacity_used / trip.capacity_max) * 100)}% Full
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {trip.passengers?.map((p, idx) => (
                  <div
                    key={p.request_id || idx}
                    className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.passenger_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.party_size > 1 ? '2 Pax' : '1 Pax'} {p.luggage ? '· +Luggage' : ''}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-creamsoda">₹{p.locked_fare}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: QR Code & Route Timeline & Emergency Share (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Scannable Offline Concourse Gate QR Pass */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-700/60 flex flex-col items-center text-center shadow-glass">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blueberry-light" />
                Concourse Turnstile Gate Pass (Cached Offline)
              </span>

              {qrDataUrl ? (
                <div className="p-3 rounded-2xl bg-slate-950 border-2 border-blueberry/50 shadow-blueberry-glow/30">
                  <img src={qrDataUrl} alt="Offline QR Token" className="w-44 h-44 rounded-xl" />
                </div>
              ) : (
                <div className="w-44 h-44 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                  Generating Token...
                </div>
              )}

              <span className="text-[11px] font-mono text-slate-400 mt-3">
                Token: {trip.qr_token ? trip.qr_token.slice(0, 24) + '...' : 'MM::TURNSTILE_OFFLINE'}
              </span>
              <span className="text-[10px] text-emerald-400 mt-1 font-medium">
                ✓ Validated for NFC Concourse Turnstiles
              </span>
            </div>

            {/* Emergency WhatsApp Share Button */}
            <button
              onClick={() => onOpenShareModal(trip)}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>Share Trip via WhatsApp & SOS Preview</span>
            </button>

            {/* Stop-by-Stop Waypoint Sequence */}
            <div className="glass-panel p-4 rounded-3xl border border-slate-700/60">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-creamsoda" />
                Sequential Route Drops (Detour Bound: ≤ 3.5 min)
              </span>

              <div className="space-y-2 mt-2">
                {trip.stops_sequence?.map((st, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-creamsoda text-creamsoda font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {st.type === 'STATION_DEPARTURE' ? 'Concourse Curb Point' : `ETA +${st.eta_delta_minutes} min · Detour Delay: ${st.detour_delay_minutes || 0} min`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
