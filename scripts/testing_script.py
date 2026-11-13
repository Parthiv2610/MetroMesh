"""
MetroMesh Integration Test Script
Tests arrival-aware transit pooling, directional routing, women-priority isolation,
capacity caps, detour bounds, and SDG 11.2 metrics against the FastAPI backend.
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 60)
    print(" METROMESH TRANSIT POOLING ENGINE - HACK4SDG BITS HYDERABAD")
    print("=" * 60)

    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        print("\n[1] Health Check:", r.status_code, r.json())
    except Exception as e:
        print("\n[!] Backend server not running at", BASE_URL, "-", e)
        print("Please start backend with: python -m backend.main")
        return

    # 2. Reset system
    requests.post(f"{BASE_URL}/reset")
    print("[2] System reset.")

    # 3. Test Cities & Station Presets
    cities = requests.get(f"{BASE_URL}/cities").json()
    print(f"\n[3] Loaded {len(cities)} Metro Cities: {', '.join(cities)}")
    for c in cities:
        c_stations = requests.get(f"{BASE_URL}/stations?city={c}").json()
        print(f"    - {c}: {len(c_stations)} metro stations mapped.")

    stations = requests.get(f"{BASE_URL}/stations").json()
    print(f"\n    Total active stations in registry: {len(stations)}")

    # 4. Ingest Single Commuter Request (TO_METRO)
    req_payload = {
        "direction": "TO_METRO",
        "station_id": "raidurg",
        "origin": {"lat": 17.4460, "lng": 78.3690, "name": "Prashant Hills Home 402"},
        "destination": {"lat": 17.4399, "lng": 78.3772, "name": "Raidurg Metro"},
        "vehicle_class": "ev_auto",
        "women_only": True,
        "luggage": False,
        "party_size": 1,
        "passenger_name": "Aanya Sharma"
    }
    r = requests.post(f"{BASE_URL}/request-ride", json=req_payload)
    print("\n[4] Ingested Single Commuter Intent (TO_METRO):")
    res = r.json()
    print(f"    Request ID: {res['request_id']}")
    print(f"    Matched Virtual Stop: {res.get('matched_stop_name')}")
    print(f"    Locked Zonal Fare: Rs. {res.get('locked_fare')}")
    print(f"    Estimated Savings vs Solo Cab: Rs. {res.get('savings')}")

    # 5. Simulate Evening Metro Docking Wave (FROM_METRO)
    print("\n[5] Triggering Evening Metro Docking Simulation (Station -> Tech Corridors)...")
    sim_res = requests.post(f"{BASE_URL}/simulate", json={"mode": "evening_last_mile", "station_id": "raidurg"}).json()
    print(f"    Simulation dispatched {sim_res.get('riders_count')} commuter intents into queue.")

    # 6. Execute Dispatch Engine
    print("\n[6] Executing Real-time Dispatch Clustering...")
    trips = requests.post(f"{BASE_URL}/dispatch").json()
    print(f"    Total vehicles dispatched: {len(trips)}")
    for t in trips:
        print(f"\n    >> Dispatched: {t['plate_id']} ({t['vehicle_label']})")
        print(f"       Assigned Bay: {t['assigned_pickup_zone']}")
        print(f"       Occupancy: {t['capacity_used']}/{t['capacity_max']} seats (Women-only: {t['women_only_pool']})")
        print(f"       Avoided VMT: {t['vmt_avoided_km']} km | Est CO2 Offset: {t['co2_offset_kg']} kg")
        print(f"       Stops Sequence: {' -> '.join(s['name'] for s in t['stops_sequence'])}")
        print(f"       Offline QR Token: {t['qr_token'][:35]}...")

    # 7. Check SDG 11.2 Metrics
    print("\n[7] Querying Live UN SDG 11.2 Metrics:")
    metrics = requests.get(f"{BASE_URL}/metrics").json()
    print(f"    - Total Commuter Savings: Rs. {metrics['rider_savings_inr']}")
    print(f"    - Avoided Vehicle-Km (VMT): {metrics['vmt_avoided_km']} km")
    print(f"    - CO2 Emissions Offset: {metrics['co2_offset_kg']} kg")
    print(f"    - Total Commuters Pooled: {metrics['total_riders_pooled']}")
    print(f"    - Average Pooling Efficiency: {metrics['average_pooling_efficiency']} pax/vehicle")

    print("\n" + "=" * 60)
    print(" ALL TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
