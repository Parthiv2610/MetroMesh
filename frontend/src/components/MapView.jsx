import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({
  station,
  allCityStations = [],
  metroLines = [],
  onSelectStation,
  direction,
  queuedRequests = [],
  dispatchedTrips = [],
  activeTripIndex = 0,
  customOrigin,
  customDestination,
  onPickOrigin,
  onPickDestination,
  pickingMode,
  vectorStats
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tracksLayerRef = useRef(null);
  const networkLayerRef = useRef(null);
  const customPinsLayerRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [station?.lat || 17.4399, station?.lng || 78.3772],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Ultra-clean Dark Transit Tile Layer (Zero watermarks, 100% free)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: '&copy; Esri &mdash; OpenStreetMap &middot; UN SDG 11.2'
      }).addTo(map);

      // Attribution in bottom-left
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('&copy; <a href="https://carto.com/" style="color:#64748B;">Esri & OpenStreetMap</a> · UN SDG 11.2')
        .addTo(map);

      // Zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer groups in visual stack order
      tracksLayerRef.current = L.layerGroup().addTo(map);      // Bottom: Metro rail tracks
      networkLayerRef.current = L.layerGroup().addTo(map);     // Mid: Network station dots
      layerGroupRef.current = L.layerGroup().addTo(map);       // High: Active station, routes & hulls
      customPinsLayerRef.current = L.layerGroup().addTo(map);  // Top: User custom origin/dest pins & vector

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Center when Station changes
  useEffect(() => {
    if (mapInstanceRef.current && station) {
      mapInstanceRef.current.flyTo([station.lat, station.lng], 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [station?.id]);

  // Handle Map Click for Interactive Origin / Destination Pinning
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      const lat = Number(e.latlng.lat.toFixed(5));
      const lng = Number(e.latlng.lng.toFixed(5));

      if (pickingMode === 'origin' && onPickOrigin) {
        onPickOrigin({
          lat,
          lng,
          name: `Custom Origin (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        });
      } else if (pickingMode === 'destination' && onPickDestination) {
        onPickDestination({
          lat,
          lng,
          name: `Custom Destination (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [pickingMode, onPickOrigin, onPickDestination]);

  // Render Authentic Metro Rail Tracks (Dual stroke: bed + dashed sleepers)
  useEffect(() => {
    const tracksLayer = tracksLayerRef.current;
    if (!tracksLayer) return;
    tracksLayer.clearLayers();

    if (!metroLines || metroLines.length === 0) return;

    metroLines.forEach((line) => {
      if (!line.track_coords || line.track_coords.length < 2) return;

      const lineColor = line.color || '#3B82F6';

      // 1. Soft Translucent Glow under the track
      L.polyline(line.track_coords, {
        color: lineColor,
        weight: 9,
        opacity: 0.28,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(tracksLayer);

      // 2. Solid Track Rail Bed
      const trackBed = L.polyline(line.track_coords, {
        color: lineColor,
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(tracksLayer);

      // 3. Railroad Track Sleepers / Ties (Dashed overlay)
      L.polyline(line.track_coords, {
        color: '#FFFFFF',
        weight: 2.2,
        opacity: 0.85,
        dashArray: '3, 8',
        lineCap: 'square',
        lineJoin: 'round'
      }).addTo(tracksLayer);

      trackBed.bindPopup(`
        <div style="padding:6px; font-size:12px; min-width:180px;">
          <div style="display:flex; align-items:center; gap:6px; font-weight:800; color:${lineColor};">
            <span style="font-size:14px;">🚇</span> ${line.name}
          </div>
          <div style="color:#94A3B8; font-size:11px; margin-top:2px;">
            ${line.stations_count || line.track_coords.length} Rapid Transit Stations
          </div>
          <div style="margin-top:6px; padding:3px 6px; border-radius:4px; background:rgba(255,255,255,0.06); font-size:10px; color:#E2E8F0;">
            High-Capacity Electric Rail Corridor
          </div>
        </div>
      `);
    });
  }, [metroLines]);

  // Render City Metro Network Nodes (All stations in selected city)
  useEffect(() => {
    const netLayer = networkLayerRef.current;
    if (!netLayer) return;
    netLayer.clearLayers();

    allCityStations.forEach((st) => {
      if (station && st.id === station.id) return; // Active station rendered in primary layer

      const isInterchange = st.name.toLowerCase().includes('interchange');
      const nodeHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" title="${st.name}">
          <div class="w-3.5 h-3.5 rounded-full ${isInterchange ? 'bg-amber-400 border-2 border-white ring-2 ring-amber-400/50' : 'bg-slate-900 border border-blueberry-light/80 text-blueberry-light'} flex items-center justify-center hover:scale-130 transition-transform shadow-md">
            ${isInterchange ? '<span style="font-size:7px; font-weight:900; color:#000;">⚡</span>' : '<span style="font-size:6px;">🚇</span>'}
          </div>
        </div>
      `;
      const nodeIcon = L.divIcon({
        html: nodeHtml,
        className: 'city-network-station-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const m = L.marker([st.lat, st.lng], { icon: nodeIcon }).addTo(netLayer);
      m.bindPopup(`
        <div style="padding:4px; font-size:11px;">
          <div style="font-weight:700; color:#892BFE;">${st.name}</div>
          <div style="color:#94A3B8; font-size:10px;">${st.line || 'Metro'} · ${st.city}</div>
          <div style="display:flex; gap:4px; margin-top:6px;">
            <button 
              id="btn_switch_${st.id}"
              style="flex:1; background:#6A00F4; color:#FFF; border:none; padding:4px 6px; border-radius:6px; font-size:10px; cursor:pointer; font-weight:600;"
            >
              Select Station
            </button>
            <button 
              id="btn_set_dest_${st.id}"
              style="background:#334155; color:#FFD6A5; border:none; padding:4px 6px; border-radius:6px; font-size:10px; cursor:pointer; font-weight:600;"
              title="Set as Destination"
            >
              🏁 As Dest
            </button>
          </div>
        </div>
      `);

      m.on('popupopen', () => {
        const btn = document.getElementById(`btn_switch_${st.id}`);
        if (btn && onSelectStation) {
          btn.onclick = () => onSelectStation(st.id);
        }
        const btnDest = document.getElementById(`btn_set_dest_${st.id}`);
        if (btnDest && onPickDestination) {
          btnDest.onclick = () => onPickDestination({ lat: st.lat, lng: st.lng, name: st.name });
        }
      });
    });
  }, [allCityStations, station?.id, onSelectStation, onPickDestination]);

  // Render Custom Origin, Destination, and Vector Corridor Ray
  useEffect(() => {
    const pinsLayer = customPinsLayerRef.current;
    if (!pinsLayer) return;
    pinsLayer.clearLayers();

    // 1. Custom Origin Pin (Emerald / Blueberry, Draggable)
    if (customOrigin) {
      const originHtml = `
        <div class="relative flex items-center justify-center cursor-move group">
          <div class="absolute -top-6 px-1.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 font-black text-[9px] shadow-sm whitespace-nowrap">
            📍 START
          </div>
          <div class="w-8 h-8 rounded-full bg-slate-950 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50 hover:scale-115 transition-transform">
            <span style="font-size:13px;">📍</span>
          </div>
        </div>
      `;
      const originIcon = L.divIcon({
        html: originHtml,
        className: 'custom-origin-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const oMarker = L.marker([customOrigin.lat, customOrigin.lng], { 
        icon: originIcon,
        draggable: true 
      }).addTo(pinsLayer);

      oMarker.on('dragend', (e) => {
        const p = e.target.getLatLng();
        if (onPickOrigin) {
          onPickOrigin({
            lat: Number(p.lat.toFixed(5)),
            lng: Number(p.lng.toFixed(5)),
            name: customOrigin.name || 'Custom Origin'
          });
        }
      });

      oMarker.bindPopup(`
        <div style="padding:4px; font-size:11px;">
          <div style="font-weight:700; color:#10B981;">📍 Selected Origin (Draggable)</div>
          <div style="color:#FFF; font-weight:600; margin-top:2px;">${customOrigin.name}</div>
          <div style="color:#94A3B8; font-size:10px; margin-top:2px;">[${customOrigin.lat}, ${customOrigin.lng}]</div>
        </div>
      `);
    }

    // 2. Custom Destination Pin (Cream Soda #FFD6A5, Draggable)
    if (customDestination) {
      const destHtml = `
        <div class="relative flex items-center justify-center cursor-move group">
          <div class="absolute -top-6 px-1.5 py-0.5 rounded bg-[#FFD6A5] text-slate-950 font-black text-[9px] shadow-sm whitespace-nowrap">
            🏁 DEST
          </div>
          <div class="w-8 h-8 rounded-full bg-slate-950 border-2 border-[#FFD6A5] text-[#FFD6A5] flex items-center justify-center shadow-lg shadow-amber-300/50 hover:scale-115 transition-transform">
            <span style="font-size:13px;">🏁</span>
          </div>
        </div>
      `;
      const destIcon = L.divIcon({
        html: destHtml,
        className: 'custom-destination-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const dMarker = L.marker([customDestination.lat, customDestination.lng], { 
        icon: destIcon,
        draggable: true 
      }).addTo(pinsLayer);

      dMarker.on('dragend', (e) => {
        const p = e.target.getLatLng();
        if (onPickDestination) {
          onPickDestination({
            lat: Number(p.lat.toFixed(5)),
            lng: Number(p.lng.toFixed(5)),
            name: customDestination.name || 'Custom Destination'
          });
        }
      });

      dMarker.bindPopup(`
        <div style="padding:4px; font-size:11px;">
          <div style="font-weight:700; color:#FFD6A5;">🏁 Selected Destination (Draggable)</div>
          <div style="color:#FFF; font-weight:600; margin-top:2px;">${customDestination.name}</div>
          <div style="color:#94A3B8; font-size:10px; margin-top:2px;">[${customDestination.lat}, ${customDestination.lng}]</div>
        </div>
      `);
    }

    // 3. Directional Corridor Vector Polyline with Midpoint Radar Indicator
    if (customOrigin && customDestination) {
      const vectorCoords = [
        [customOrigin.lat, customOrigin.lng],
        [customDestination.lat, customDestination.lng]
      ];

      // Corridor glow band
      L.polyline(vectorCoords, {
        color: '#6A00F4',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round'
      }).addTo(pinsLayer);

      // Core vector line with animated dash
      const vectorLine = L.polyline(vectorCoords, {
        color: '#FFD6A5',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '7, 9',
        lineCap: 'round'
      }).addTo(pinsLayer);

      // Midpoint badge with Vector Heading & Collinear Distance
      const midLat = (customOrigin.lat + customDestination.lat) / 2;
      const midLng = (customOrigin.lng + customDestination.lng) / 2;

      const vectorBadgeHtml = `
        <div class="px-2 py-1 rounded-full bg-slate-950/95 border border-[#FFD6A5]/80 text-[#FFD6A5] text-[10px] font-mono font-bold shadow-lg shadow-purple-900/40 whitespace-nowrap flex items-center gap-1.5 pointer-events-none">
          <span>🧭</span>
          <span>${vectorStats?.heading_direction || 'NE'} · ${vectorStats?.direct_distance_km || 2.4} km</span>
        </div>
      `;
      const badgeIcon = L.divIcon({
        html: vectorBadgeHtml,
        className: 'vector-badge-icon',
        iconSize: [110, 24],
        iconAnchor: [55, 12]
      });
      L.marker([midLat, midLng], { icon: badgeIcon, interactive: false }).addTo(pinsLayer);

      vectorLine.bindPopup(`
        <div style="padding:6px; font-size:11px;">
          <div style="font-weight:800; color:#892BFE;">⚡ Directional Corridor Vector</div>
          <div style="color:#FFD6A5; font-weight:700; margin-top:2px;">
            Heading: ${vectorStats?.bearing_degrees || 45}° (${vectorStats?.heading_direction || 'NE'})
          </div>
          <div style="color:#CBD5E1; margin-top:2px;">
            Distance: ${vectorStats?.direct_distance_km || 2.4} km
          </div>
          <div style="margin-top:4px; padding:3px 6px; border-radius:4px; background:#1E293B; color:#A7F3D0; font-size:10px;">
            Vectorized Pooling Active: ${vectorStats?.matching_corridor_riders || 0} Co-Riders Aligned
          </div>
        </div>
      `);
    }

  }, [customOrigin, customDestination, vectorStats, onPickOrigin, onPickDestination]);

  // Render Map Layers: Primary station node, Corner stops, Queued pins, Dispatched trips
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers || !station) return;

    layers.clearLayers();

    // 1. Prominent Custom Station Node with Pulsing Blueberry Beacon
    const stationHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full bg-blueberry/30 metro-beacon"></div>
        <div class="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-blueberry to-blueberry-light text-white flex items-center justify-center shadow-lg shadow-blueberry/60 border-2 border-white/80">
          <span style="font-size:16px;">🚆</span>
        </div>
      </div>
    `;
    const stationIcon = L.divIcon({
      html: stationHtml,
      className: 'custom-station-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const stationMarker = L.marker([station.lat, station.lng], { icon: stationIcon }).addTo(layers);
    stationMarker.bindPopup(`
      <div style="padding:6px; min-width:180px;">
        <div style="font-weight:800; font-size:13px; color:#F8FAFC; display:flex; align-items:center; gap:6px;">
          <span>🚆</span> ${station.name}
        </div>
        <div style="font-size:11px; color:#94A3B8; margin-top:2px;">${station.line || 'Metro'} · ${station.city}</div>
        <div style="margin-top:8px; border-top:1px solid #334155; padding-top:6px; font-size:10px;">
          <div style="color:#FFD6A5; font-weight:700;">Active Concourse Bays:</div>
          ${station.curbside_bays?.map(b => `<div style="color:#CBD5E1;">• ${b.name}</div>`).join('') || ''}
        </div>
      </div>
    `);

    // 2. Render Virtual Corner Stops (for First-Mile TO_METRO)
    if (direction === 'TO_METRO' && station.virtual_corner_stops) {
      station.virtual_corner_stops.forEach((vs, idx) => {
        const archHtml = `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-xl bg-slate-900 border border-blueberry text-blueberry-light flex items-center justify-center shadow-md">
              <span style="font-size:11px;">🏛️</span>
            </div>
          </div>
        `;
        const archIcon = L.divIcon({
          html: archHtml,
          className: 'virtual-stop-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const vsMarker = L.marker([vs.lat, vs.lng], { icon: archIcon }).addTo(layers);
        vsMarker.bindPopup(`
          <div style="padding:4px; font-size:11px;">
            <div style="font-weight:700; color:#892BFE;">Virtual Corner Stop #${idx + 1}</div>
            <div style="color:#F1F5F9; font-weight:600; margin-top:2px;">${vs.name}</div>
            <div style="color:#94A3B8; font-size:10px; margin-top:4px;">Pedestrian catchment radius: ≤350m</div>
          </div>
        `);
      });
    }

    // 3. Render Queued Commuter Intent Pins (Cream Soda #FFD6A5)
    queuedRequests.forEach((req, idx) => {
      const isFirstMile = req.direction === 'TO_METRO';
      const targetPoint = isFirstMile ? req.origin : req.destination;

      const pinHtml = `
        <div class="relative flex items-center justify-center group">
          <div class="w-6 h-6 rounded-full bg-slate-950 border-2 border-creamsoda text-creamsoda flex items-center justify-center shadow-creamsoda-glow text-[10px] font-extrabold font-mono">
            ${idx + 1}
          </div>
        </div>
      `;
      const pinIcon = L.divIcon({
        html: pinHtml,
        className: 'commuter-pin-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const pinMarker = L.marker([targetPoint.lat, targetPoint.lng], { icon: pinIcon }).addTo(layers);
      pinMarker.bindPopup(`
        <div style="padding:6px; min-width:160px; font-size:11px;">
          <div style="color:#FFD6A5; font-weight:700;">Commuter Intent #${idx + 1}</div>
          <div style="color:#FFFFFF; font-weight:600; margin-top:2px;">${req.passenger_name}</div>
          <div style="color:#94A3B8; font-size:10px;">${targetPoint.name}</div>
          <div style="margin-top:6px; padding-top:4px; border-top:1px solid #334155; display:flex; justify-content:space-between;">
            <span style="color:#CBD5E1;">Locked Fare:</span>
            <strong style="color:#FFD6A5;">₹${req.locked_fare || 25}</strong>
          </div>
          ${req.women_only ? '<div style="color:#C084FC; font-weight:700; font-size:10px; margin-top:2px;">🛡️ Women-Priority Pool</div>' : ''}
        </div>
      `);
    });

    // 4. Render Dispatched Trips: Bounding Hulls & Blueberry Polylines
    dispatchedTrips.forEach((trip, tIdx) => {
      const isActive = tIdx === activeTripIndex;
      const isWomenOnly = trip.women_only_pool;
      
      const polyColor = isWomenOnly ? '#A855F7' : '#6A00F4';
      const hullColor = isWomenOnly ? '#9333EA' : '#6A00F4';

      // Draw Transparent Bounding Hulls around matched passenger clusters
      if (trip.cluster_hull && trip.cluster_hull.length >= 3) {
        L.polygon(trip.cluster_hull, {
          color: hullColor,
          fillColor: hullColor,
          fillOpacity: isActive ? 0.22 : 0.10,
          weight: isActive ? 2 : 1.5,
          dashArray: '6, 6'
        }).addTo(layers);
      }

      // Render Blueberry Polylines connecting sequential waypoints
      if (trip.waypoints && trip.waypoints.length > 1) {
        // Outer glow
        L.polyline(trip.waypoints, {
          color: polyColor,
          weight: isActive ? 7 : 4,
          opacity: isActive ? 0.35 : 0.15,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layers);

        // Core polyline
        const line = L.polyline(trip.waypoints, {
          color: polyColor,
          weight: isActive ? 3.5 : 2,
          opacity: isActive ? 1.0 : 0.65,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layers);

        line.bindPopup(`
          <div style="padding:6px; min-width:180px; font-size:11px;">
            <div style="color:${isWomenOnly ? '#C084FC' : '#892BFE'}; font-weight:800; font-size:12px;">
              ${trip.plate_id}
            </div>
            <div style="color:#CBD5E1; margin-top:2px;">${trip.vehicle_label} · Pilot: ${trip.driver_name}</div>
            <div style="color:#FFD6A5; font-weight:700; margin-top:4px;">
              Avoided VMT: ${trip.vmt_avoided_km} km | CO2: ${trip.co2_offset_kg} kg
            </div>
          </div>
        `);
      }

      // Destination / Drop Pins along the route
      if (trip.stops_sequence) {
        trip.stops_sequence.forEach((st) => {
          if (st.type === 'PASSENGER_DROP' || st.type === 'CORNER_PICKUP') {
            const dropHtml = `
              <div class="relative flex items-center justify-center">
                <div class="w-6 h-6 rounded-xl bg-slate-900 border-2 border-creamsoda text-creamsoda flex items-center justify-center shadow-md font-mono text-[10px] font-black">
                  ${st.stop_index || '•'}
                </div>
              </div>
            `;
            const dropIcon = L.divIcon({
              html: dropHtml,
              className: 'route-drop-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            L.marker([st.lat, st.lng], { icon: dropIcon }).addTo(layers).bindPopup(`
              <div style="padding:4px; font-size:11px;">
                <div style="color:#FFD6A5; font-weight:700;">Stop #${st.stop_index}: ${st.name}</div>
                ${st.passenger ? `<div style="color:#FFFFFF; margin-top:2px;">Rider: ${st.passenger}</div>` : ''}
                <div style="color:#94A3B8; font-size:10px; margin-top:4px;">
                  ETA Delta: +${st.eta_delta_minutes} min | Max Detour: ${st.detour_delay_minutes || 0} min
                </div>
              </div>
            `);
          }
        });
      }
    });

  }, [station, direction, queuedRequests, dispatchedTrips, activeTripIndex]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`absolute inset-0 w-full h-full z-0 outline-none ${pickingMode ? 'cursor-crosshair' : ''}`}
    />
  );
}
