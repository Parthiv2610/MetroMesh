const API_BASE = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://127.0.0.1:8000');

export async function fetchCities() {
  const res = await fetch(`${API_BASE}/cities`);
  if (!res.ok) throw new Error('Failed to fetch cities');
  return res.json();
}

export async function fetchStations(city = null) {
  const url = city ? `${API_BASE}/stations?city=${encodeURIComponent(city)}` : `${API_BASE}/stations`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function fetchMetroLines(city) {
  const res = await fetch(`${API_BASE}/cities/${encodeURIComponent(city)}/lines`);
  if (!res.ok) throw new Error('Failed to fetch metro lines');
  return res.json();
}

export async function matchCorridor(origin, destination, stationId = null) {
  const res = await fetch(`${API_BASE}/corridor-matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination, station_id: stationId })
  });
  if (!res.ok) throw new Error('Failed to match corridor');
  return res.json();
}

export async function submitRideRequest(payload) {
  const res = await fetch(`${API_BASE}/request-ride`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to request ride');
  return res.json();
}

export async function dispatchPools() {
  const res = await fetch(`${API_BASE}/dispatch?force=true`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to dispatch pools');
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchQueuedRequests() {
  const res = await fetch(`${API_BASE}/queued-requests`);
  if (!res.ok) throw new Error('Failed to fetch queued requests');
  return res.json();
}

export async function fetchTrips() {
  const res = await fetch(`${API_BASE}/trips`);
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

export async function triggerSimulationWave(mode, stationId = 'raidurg') {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, station_id: stationId })
  });
  if (!res.ok) throw new Error('Failed to trigger simulation');
  return res.json();
}

export async function resetSystemState() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset system');
  return res.json();
}
