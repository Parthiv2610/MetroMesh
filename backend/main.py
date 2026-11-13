from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict, Any, List, Optional
import os
import math
import numpy as np
from pydantic import BaseModel
from .models import (
    RideRequestInput, RideRequest, DispatchedTrip, 
    SystemMetrics, StationPreset, Direction, Location
)
from .stations import STATIONS_REGISTRY, get_cities_list, get_stations_by_city, get_metro_lines_for_city
from .engine import PoolingEngine, calculate_bearing, compute_vectorized_corridor_similarity

app = FastAPI(
    title="MetroMesh API",
    description="Arrival-aware, bidirectional urban transit pooling platform for Hack4SDG at BITS Hyderabad under UN SDG 11.2",
    version="1.0.0"
)

# Enable CORS for local dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = PoolingEngine()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MetroMesh Transit Pooling Engine",
        "sdg_target": "UN SDG 11.2",
        "institution": "BITS Hyderabad Hack4SDG"
    }

@app.get("/cities", response_model=List[str])
def list_cities():
    """Returns list of supported metro cities."""
    return get_cities_list()

@app.get("/cities/{city}/lines")
def list_city_metro_lines(city: str):
    """Returns the actual metro rail track polylines and colors for that city."""
    return get_metro_lines_for_city(city)

@app.get("/stations", response_model=List[StationPreset])
def list_stations(city: Optional[str] = None):
    """Returns list of supported metro stations, optionally filtered by city."""
    if city:
        stations = get_stations_by_city(city)
        if stations:
            return stations
    return list(STATIONS_REGISTRY.values())

@app.get("/cities/{city}/stations", response_model=List[StationPreset])
def list_city_stations(city: str):
    """Returns all stations belonging to the selected city."""
    return get_stations_by_city(city)

@app.get("/stations/{station_id}", response_model=StationPreset)
def get_station(station_id: str):
    if station_id not in STATIONS_REGISTRY:
        raise HTTPException(status_code=404, detail="Station preset not found")
    return STATIONS_REGISTRY[station_id]

@app.post("/request-ride", response_model=RideRequest)
def request_ride(payload: RideRequestInput):
    """
    Ingests single commuter intent:
    - Snaps to virtual corner stops (TO_METRO) or assigns station curbside bay (FROM_METRO)
    - Isolates women-priority pool if women_only=True
    - Calculates locked zonal fare and solo cab comparison
    - Reserves capacity units based on party size & luggage
    """
    req = RideRequest(
        direction=payload.direction,
        station_id=payload.station_id,
        origin=payload.origin,
        destination=payload.destination,
        vehicle_class=payload.vehicle_class,
        women_only=payload.women_only,
        luggage=payload.luggage,
        party_size=payload.party_size,
        passenger_name=payload.passenger_name or "Commuter"
    )
    queued_req = engine.add_ride_request(req)
    return queued_req

@app.post("/dispatch", response_model=List[DispatchedTrip])
def dispatch_rides(force: bool = True):
    """
    Executes arrival-aware pooling algorithm:
    - Clusters spatial-temporally within 1.2 km collinear radius
    - Enforces <= 3.5 min max detour bound per passenger
    - Strict women-only pool isolation
    - Assigns virtual bay/curb point
    - Computes bounding convex hulls, route waypoints, and locked zonal fares
    """
    dispatched = engine.dispatch_pools(force=force)
    return dispatched

@app.get("/metrics", response_model=SystemMetrics)
def get_metrics():
    """
    Returns real-time aggregate SDG 11.2 live metrics:
    - Rider Savings vs Solo Cabs (₹)
    - Vehicle Miles Traveled (VMT) Avoided (km)
    - Estimated CO2 Emissions Offset (kg)
    """
    return engine.metrics

@app.get("/queued-requests", response_model=List[RideRequest])
def get_queued_requests():
    return list(engine.queued_requests.values())

@app.get("/trips", response_model=List[DispatchedTrip])
def get_trips():
    return engine.dispatched_trips

@app.post("/simulate")
def trigger_simulation(mode: str = Body(..., embed=True), station_id: str = Body("raidurg", embed=True)):
    """
    One-Click Hackathon God Mode Simulator:
    - 'morning_first_mile': 12 residential pins mapping to virtual corner stops
    - 'evening_last_mile': 12 destination pins across hubs like Mindspace, Knowledge City, DLF
    """
    if mode not in ["morning_first_mile", "evening_last_mile"]:
        raise HTTPException(status_code=400, detail="Invalid simulation mode")
    
    requests = engine.generate_hackathon_simulation(mode, station_id)
    return {
        "status": "simulation_generated",
        "mode": mode,
        "station_id": station_id,
        "riders_count": len(requests),
        "queued": requests
    }

class CorridorMatchInput(BaseModel):
    origin: Location
    destination: Location
    station_id: Optional[str] = None

@app.post("/corridor-matches")
def match_corridor_vector(payload: CorridorMatchInput):
    origin = payload.origin
    dest = payload.destination
    
    # Calculate bearing and displacement vector
    lat_mid = math.radians((origin.lat + dest.lat) / 2.0)
    dx = (dest.lng - origin.lng) * 111.32 * math.cos(lat_mid)
    dy = (dest.lat - origin.lat) * 111.32
    v = np.array([dx, dy], dtype=np.float64)
    dist_km = float(np.linalg.norm(v))
    
    # Bearing in degrees (0-360)
    bearing = calculate_bearing(origin.lat, origin.lng, dest.lat, dest.lng)
    
    # Compass heading text
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    ix = int((bearing + 11.25) / 22.5) % 16
    heading = dirs[ix]
    
    # Compare against currently queued requests
    candidates = list(engine.queued_requests.values())
    similarity_results = compute_vectorized_corridor_similarity(origin, dest, candidates)
    
    matches_count = sum(1 for s in similarity_results if s["is_corridor_match"])
    
    return {
        "vector_dx_km": round(dx, 3),
        "vector_dy_km": round(dy, 3),
        "bearing_degrees": round(bearing, 1),
        "heading_direction": heading,
        "direct_distance_km": round(dist_km, 2),
        "queued_candidates_count": len(candidates),
        "matching_corridor_riders": matches_count,
        "corridor_matches": similarity_results
    }

@app.post("/reset")
def reset_system():
    engine.reset_system()
    return {"status": "system_reset", "metrics": engine.metrics}

# Static file serving if frontend is built
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    from fastapi.responses import FileResponse
    @app.get("/")
    def serve_index():
        return FileResponse(
            os.path.join(frontend_dist, "index.html"),
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
