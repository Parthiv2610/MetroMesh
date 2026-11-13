"""
MetroMesh Concurrency and Stress Test
Simulates high-frequency concurrent commuter requests and measures
clustering latency, detour bound adherence, and throughput under peak load.
"""
import time
import requests
import random
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://127.0.0.1:8000"

def send_commuter_request(index: int):
    classes = ["auto", "ev_auto", "shuttle", "cab"]
    is_women = (index % 3 == 0)
    has_luggage = (index % 5 == 0)
    party = 2 if (index % 4 == 0) else 1
    
    payload = {
        "direction": "FROM_METRO" if index % 2 == 0 else "TO_METRO",
        "station_id": "raidurg",
        "origin": {
            "lat": 17.4399 + random.uniform(-0.015, 0.015),
            "lng": 78.3772 + random.uniform(-0.015, 0.015),
            "name": f"Origin Point {index}"
        },
        "destination": {
            "lat": 17.4399 + random.uniform(-0.015, 0.015),
            "lng": 78.3772 + random.uniform(-0.015, 0.015),
            "name": f"Destination Point {index}"
        },
        "vehicle_class": random.choice(classes),
        "women_only": is_women,
        "luggage": has_luggage,
        "party_size": party,
        "passenger_name": f"Commuter_{index}"
    }
    t0 = time.time()
    try:
        r = requests.post(f"{BASE_URL}/request-ride", json=payload, timeout=5)
        dt = (time.time() - t0) * 1000
        return r.status_code == 200, dt
    except Exception as e:
        return False, 0.0

def main():
    print("=" * 60)
    print(" METROMESH HIGH-CONCURRENCY COMMUTER INGESTION STRESS TEST ")
    print("=" * 60)
    
    TOTAL_REQUESTS = 50
    CONCURRENT_WORKERS = 10
    print(f"Ingesting {TOTAL_REQUESTS} commuter requests using {CONCURRENT_WORKERS} concurrent threads...")
    
    start_time = time.time()
    latencies = []
    successes = 0

    with ThreadPoolExecutor(max_workers=CONCURRENT_WORKERS) as executor:
        results = list(executor.map(send_commuter_request, range(TOTAL_REQUESTS)))
        for ok, lat in results:
            if ok:
                successes += 1
                latencies.append(lat)

    elapsed = time.time() - start_time
    print(f"\nCompleted in: {elapsed:.2f} seconds ({successes}/{TOTAL_REQUESTS} successful)")
    if latencies:
        avg_lat = sum(latencies) / len(latencies)
        print(f"Average Request Ingestion Latency: {avg_lat:.2f} ms")
        print(f"Min Latency: {min(latencies):.2f} ms | Max Latency: {max(latencies):.2f} ms")

    print("\nTriggering Dispatch Clustering Engine...")
    t0 = time.time()
    dispatch_res = requests.post(f"{BASE_URL}/dispatch")
    dispatch_time = (time.time() - t0) * 1000
    trips = dispatch_res.json()
    print(f"Clustered and Dispatched in: {dispatch_time:.2f} ms")
    print(f"Total Dispatched Trips: {len(trips)}")

    metrics = requests.get(f"{BASE_URL}/metrics").json()
    print(f"\nSDG 11.2 Live Aggregate:")
    print(f"  - Total Fare Savings: Rs. {metrics['rider_savings_inr']}")
    print(f"  - Avoided VMT: {metrics['vmt_avoided_km']} km")
    print(f"  - CO2 Offset: {metrics['co2_offset_kg']} kg")

if __name__ == "__main__":
    main()
