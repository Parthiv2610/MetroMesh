"""
MetroMesh Real-time Event Monitor
Polls and monitors dispatch events, vehicle arrival alerts, and metrics.
"""
import time
import requests

BASE_URL = "http://127.0.0.1:8000"

def monitor():
    print("Connecting to MetroMesh Live Event Monitor...")
    last_trip_count = 0
    try:
        while True:
            trips_res = requests.get(f"{BASE_URL}/trips")
            if trips_res.status_code == 200:
                trips = trips_res.json()
                if len(trips) > last_trip_count:
                    new_trips = trips[last_trip_count:]
                    for t in new_trips:
                        print(f"[EVENT] New Trip Dispatched: {t['plate_id']} ({t['vehicle_label']}) at {t['assigned_pickup_zone']} with {len(t['passengers'])} riders. (Women-only: {t['women_only_pool']})")
                    last_trip_count = len(trips)
            time.sleep(2)
    except KeyboardInterrupt:
        print("\nExiting monitor.")

if __name__ == "__main__":
    monitor()
