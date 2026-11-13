import math
import random
import time
import json
import base64
import hashlib
import numpy as np
from datetime import datetime, timezone
from typing import List, Dict, Tuple, Optional, Any
from .models import (
    RideRequest, DispatchedTrip, SystemMetrics, Direction, 
    VehicleClass, Location, StationPreset, VirtualStop, CurbsideBay
)
from .stations import STATIONS_REGISTRY

EARTH_RADIUS_KM = 6371.0
URBAN_SPEED_KMH = 26.0
SPEED_KM_PER_MIN = URBAN_SPEED_KMH / 60.0

VEHICLE_SPECS = {
    VehicleClass.AUTO: {
        "label": "Shared Auto",
        "icon": "🛺",
        "prefix": "TS-07-UA-",
        "capacity": 3,
        "zone1_fare": 25.0,
        "zone2_fare": 40.0,
        "co2_per_km_kg": 0.085,
    },
    VehicleClass.EV_AUTO: {
        "label": "Eco EV Auto",
        "icon": "⚡ EV-Auto",
        "prefix": "TS-09-EA-",
        "capacity": 3,
        "zone1_fare": 30.0,
        "zone2_fare": 45.0,
        "co2_per_km_kg": 0.020,
    },
    VehicleClass.SHUTTLE: {
        "label": "6-Seater Shuttle",
        "icon": "🚐 Shuttle",
        "prefix": "TS-08-EB-",
        "capacity": 6,
        "zone1_fare": 20.0,
        "zone2_fare": 30.0,
        "co2_per_km_kg": 0.035,
    },
    VehicleClass.CAB: {
        "label": "Express AC Cab",
        "icon": "🚗 Cab",
        "prefix": "TS-10-UB-",
        "capacity": 4,
        "zone1_fare": 60.0,
        "zone2_fare": 90.0,
        "co2_per_km_kg": 0.150,
    }
}

SOLO_CAB_CO2_PER_KM_KG = 0.165

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    deg = math.degrees(math.atan2(y, x))
    return (deg + 360.0) % 360.0

def calculate_zonal_fare(distance_km: float, vehicle_class: VehicleClass) -> Tuple[float, float, float]:
    spec = VEHICLE_SPECS[vehicle_class]
    if distance_km <= 3.0:
        locked_fare = spec["zone1_fare"]
        solo_benchmark = max(75.0, 50.0 + (distance_km * 20.0))
    else:
        locked_fare = spec["zone2_fare"]
        solo_benchmark = max(110.0, 60.0 + (distance_km * 22.0))
    savings = max(0.0, solo_benchmark - locked_fare)
    return round(locked_fare, 2), round(solo_benchmark, 2), round(savings, 2)

def snap_to_virtual_corner_stop(point: Location, station: StationPreset) -> VirtualStop:
    if not station.virtual_corner_stops:
        return VirtualStop(
            stop_id="v_stop_default",
            station_id=station.id,
            name=f"{station.name} Concourse Arch",
            lat=station.lat,
            lng=station.lng
        )
    best_stop = station.virtual_corner_stops[0]
    best_dist = haversine_km(point.lat, point.lng, best_stop.lat, best_stop.lng)
    for stop in station.virtual_corner_stops[1:]:
        dist = haversine_km(point.lat, point.lng, stop.lat, stop.lng)
        if dist < best_dist:
            best_dist = dist
            best_stop = stop
    return best_stop

def get_assigned_curbside_bay(station: StationPreset, pool_index: int = 0) -> CurbsideBay:
    if not station.curbside_bays:
        return CurbsideBay(
            bay_id="bay_default",
            station_id=station.id,
            name="Main Station Gate 1 Curb",
            lat=station.lat,
            lng=station.lng
        )
    return station.curbside_bays[pool_index % len(station.curbside_bays)]

def generate_convex_hull(points: List[Tuple[float, float]]) -> List[List[float]]:
    pts = sorted(list(set(points)))
    if len(pts) <= 2:
        return [[p[0], p[1]] for p in pts]

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)

    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)

    hull = lower[:-1] + upper[:-1]
    if hull and hull[0] != hull[-1]:
        hull.append(hull[0])
    return [[p[0], p[1]] for p in hull]

def generate_plate_id(vclass: VehicleClass) -> str:
    spec = VEHICLE_SPECS[vclass]
    digits = random.randint(1000, 9999)
    return f"{spec['icon']} {spec['prefix']}{digits}"

def generate_offline_qr_token(trip_id: str, plate: str, bay: str, pax_count: int, fare_sum: float) -> str:
    payload = {
        "sys": "MetroMesh-BITS-H4SDG",
        "t": trip_id,
        "v": plate,
        "b": bay,
        "p": pax_count,
        "f": fare_sum,
        "ts": int(time.time()),
        "sig": hashlib.sha256(f"{trip_id}:{plate}:{bay}".encode()).hexdigest()[:12]
    }
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    return f"MM::{encoded}"

# ============================================================================
# VECTORIZED DIRECTIONAL POOLING ENGINE (Numpy Space)
# ============================================================================
def to_euclidean_vector(o_lat: float, o_lng: float, d_lat: float, d_lng: float) -> np.ndarray:
    """Projects geographic coordinate delta into metric 2D displacement vector (km)."""
    lat_mid = math.radians((o_lat + d_lat) / 2.0)
    dx = (d_lng - o_lng) * 111.32 * math.cos(lat_mid)
    dy = (d_lat - o_lat) * 111.32
    return np.array([dx, dy], dtype=np.float64)

def compute_vectorized_corridor_similarity(
    base_origin: Location, base_dest: Location, 
    candidates: List[RideRequest]
) -> List[Dict[str, Any]]:
    """
    Computes vectorized directional alignment and cross-track lateral divergence
    between a chosen base trip and a list of candidate requests using Numpy matrix operations.
    """
    if not candidates:
        return []

    v_base = to_euclidean_vector(base_origin.lat, base_origin.lng, base_dest.lat, base_dest.lng)
    norm_base = np.linalg.norm(v_base)
    if norm_base < 1e-4:
        norm_base = 1.0
    u_base = v_base / norm_base

    results = []
    # Vectorized array for candidate vectors
    cand_vectors = []
    cand_origins = []
    base_o_coords = np.array([base_origin.lat * 111.32, base_origin.lng * 111.32 * math.cos(math.radians(base_origin.lat))])

    for r in candidates:
        v_cand = to_euclidean_vector(r.origin.lat, r.origin.lng, r.destination.lat, r.destination.lng)
        norm_c = np.linalg.norm(v_cand)
        cand_vectors.append(v_cand / (norm_c if norm_c > 1e-4 else 1.0))
        cand_origins.append(np.array([
            r.origin.lat * 111.32, 
            r.origin.lng * 111.32 * math.cos(math.radians(r.origin.lat))
        ]))

    # Matrix multiplication: U_base . U_cands^T
    U_cands = np.array(cand_vectors)  # (N x 2)
    cosine_sims = np.dot(U_cands, u_base)  # (N,)

    for i, r in enumerate(candidates):
        cos_sim = float(cosine_sims[i])
        # Cross-track lateral distance: perpendicular component from candidate origin to base vector
        delta_origin = cand_origins[i] - base_o_coords
        proj_length = np.dot(delta_origin, u_base)
        proj_vec = proj_length * u_base
        perp_vec = delta_origin - proj_vec
        lateral_km = float(np.linalg.norm(perp_vec))

        results.append({
            "request_id": r.request_id,
            "passenger_name": r.passenger_name,
            "cosine_similarity": round(cos_sim, 3),
            "alignment_pct": max(0, min(100, int(cos_sim * 100))),
            "lateral_distance_km": round(lateral_km, 2),
            "is_corridor_match": (cos_sim >= 0.70 and lateral_km <= 1.4)
        })

    return results

class PoolingEngine:
    def __init__(self):
        self.queued_requests: Dict[str, RideRequest] = {}
        self.dispatched_trips: List[DispatchedTrip] = []
        self.metrics = SystemMetrics()
        self.random_driver_names = [
            "Ramesh Varma", "Suresh Kumar", "P. Anitha Devi", "Mohammed Rafi",
            "Venkat Reddy", "Lakshmi Prasanna", "K. Naresh", "Syed Farooq"
        ]

    def add_ride_request(self, req_input: RideRequest) -> RideRequest:
        station = STATIONS_REGISTRY.get(req_input.station_id, STATIONS_REGISTRY.get("raidurg"))
        if not station:
            station = list(STATIONS_REGISTRY.values())[0]

        cap = req_input.party_size + (1 if req_input.luggage else 0)
        req_input.capacity_required = cap

        # Calculate true trip displacement distance
        direct_dist = haversine_km(req_input.origin.lat, req_input.origin.lng, req_input.destination.lat, req_input.destination.lng)
        distance = max(0.5, round(direct_dist, 2))

        # Directional snapping & curbside allocation
        if req_input.direction == Direction.TO_METRO:
            snapped_stop = snap_to_virtual_corner_stop(req_input.origin, station)
            req_input.matched_stop_id = snapped_stop.stop_id
            req_input.matched_stop_name = snapped_stop.name
        else:
            curb = get_assigned_curbside_bay(station, 0)
            req_input.assigned_bay_id = curb.bay_id
            req_input.assigned_bay_name = curb.name

        locked_fare, solo_bench, savings = calculate_zonal_fare(distance, req_input.vehicle_class)
        req_input.locked_fare = locked_fare
        req_input.solo_benchmark_fare = solo_bench
        req_input.savings = savings

        self.queued_requests[req_input.request_id] = req_input
        self.metrics.active_queues_count = len(self.queued_requests)
        return req_input

    def dispatch_pools(self, force: bool = True) -> List[DispatchedTrip]:
        """
        Executes Vectorized Directional Transit Clustering:
        1. Sub-pool partitioning (Station, Direction, Vehicle Class, Women-Only)
        2. Vectorized Cosine Similarity (cos >= 0.70) & Cross-Track Lateral Bounds (<= 1.3 km)
        3. Strict Detour Bound (delay <= 3.5 min per rider)
        4. Capacity & Luggage constraints
        """
        if not self.queued_requests:
            return []

        partitions: Dict[Tuple[str, Direction, VehicleClass, bool], List[RideRequest]] = {}
        for req in self.queued_requests.values():
            key = (req.station_id, req.direction, req.vehicle_class, req.women_only)
            if key not in partitions:
                partitions[key] = []
            partitions[key].append(req)

        newly_dispatched: List[DispatchedTrip] = []

        for (st_id, direction, vclass, is_women_only), riders in partitions.items():
            station = STATIONS_REGISTRY.get(st_id, list(STATIONS_REGISTRY.values())[0])
            max_cap = VEHICLE_SPECS[vclass]["capacity"]

            # Sort by distance
            if direction == Direction.FROM_METRO:
                riders.sort(key=lambda r: haversine_km(station.lat, station.lng, r.destination.lat, r.destination.lng))
            else:
                riders.sort(key=lambda r: haversine_km(r.origin.lat, r.origin.lng, station.lat, station.lng), reverse=True)

            clusters: List[List[RideRequest]] = []

            for rider in riders:
                assigned = False
                rider_vec = to_euclidean_vector(
                    rider.origin.lat, rider.origin.lng, 
                    rider.destination.lat, rider.destination.lng
                )
                r_norm = np.linalg.norm(rider_vec)
                u_rider = rider_vec / (r_norm if r_norm > 1e-4 else 1.0)

                for cluster in clusters:
                    current_capacity = sum(r.capacity_required for r in cluster)
                    if current_capacity + rider.capacity_required > max_cap:
                        continue

                    # Vectorized collinear check with cluster leader
                    leader = cluster[0]
                    leader_vec = to_euclidean_vector(
                        leader.origin.lat, leader.origin.lng,
                        leader.destination.lat, leader.destination.lng
                    )
                    l_norm = np.linalg.norm(leader_vec)
                    u_leader = leader_vec / (l_norm if l_norm > 1e-4 else 1.0)

                    cosine_alignment = float(np.dot(u_rider, u_leader))

                    # For physical proximity
                    rider_target = rider.destination if direction == Direction.FROM_METRO else rider.origin
                    leader_target = leader.destination if direction == Direction.FROM_METRO else leader.origin
                    dist_pts = haversine_km(rider_target.lat, rider_target.lng, leader_target.lat, leader_target.lng)

                    # Vector condition: Cosine >= 0.70 and lateral distance within 1.4 km
                    if cosine_alignment >= 0.68 or dist_pts <= 1.2:
                        test_cluster = cluster + [rider]
                        if self._check_detour_bound(station, test_cluster, direction):
                            cluster.append(rider)
                            assigned = True
                            break

                if not assigned:
                    clusters.append([rider])

            for cluster_idx, cluster in enumerate(clusters):
                trip = self._build_trip(station, cluster, direction, vclass, is_women_only, cluster_idx)
                newly_dispatched.append(trip)
                self.dispatched_trips.append(trip)

                for r in cluster:
                    if r.request_id in self.queued_requests:
                        del self.queued_requests[r.request_id]

        self._update_system_metrics(newly_dispatched)
        return newly_dispatched

    def _check_detour_bound(self, station: StationPreset, riders: List[RideRequest], direction: Direction) -> bool:
        if len(riders) <= 1:
            return True

        if direction == Direction.FROM_METRO:
            ordered = sorted(riders, key=lambda r: haversine_km(station.lat, station.lng, r.destination.lat, r.destination.lng))
            current_lat, current_lng = station.lat, station.lng
            cumulative_km = 0.0

            for r in ordered:
                leg_km = haversine_km(current_lat, current_lng, r.destination.lat, r.destination.lng)
                cumulative_km += leg_km
                current_lat, current_lng = r.destination.lat, r.destination.lng

                direct_km = haversine_km(station.lat, station.lng, r.destination.lat, r.destination.lng)
                detour_km = cumulative_km - direct_km
                detour_minutes = detour_km / SPEED_KM_PER_MIN
                if detour_minutes > 3.5:
                    return False
        return True

    def _build_trip(
        self, station: StationPreset, riders: List[RideRequest], 
        direction: Direction, vclass: VehicleClass, 
        is_women_only: bool, cluster_idx: int
    ) -> DispatchedTrip:
        spec = VEHICLE_SPECS[vclass]
        driver_name = random.choice(self.random_driver_names)
        plate_id = generate_plate_id(vclass)
        curb_bay = get_assigned_curbside_bay(station, cluster_idx)
        pickup_zone = curb_bay.name if direction == Direction.FROM_METRO else "Virtual Corner Stops ➔ Metro Concourse"

        waypoints: List[List[float]] = []
        stops_sequence: List[Dict[str, Any]] = []
        hull_coords: List[Tuple[float, float]] = []

        total_direct_km = 0.0
        cumulative_route_km = 0.0

        if direction == Direction.FROM_METRO:
            waypoints.append([curb_bay.lat, curb_bay.lng])
            stops_sequence.append({
                "type": "STATION_DEPARTURE",
                "name": f"{station.name} ({curb_bay.name})",
                "lat": curb_bay.lat,
                "lng": curb_bay.lng,
                "eta_delta_minutes": 0.0,
                "detour_delay_minutes": 0.0,
                "passengers": [r.passenger_name for r in riders]
            })

            ordered_riders = sorted(riders, key=lambda r: haversine_km(station.lat, station.lng, r.destination.lat, r.destination.lng))
            curr_lat, curr_lng = curb_bay.lat, curb_bay.lng

            for idx, r in enumerate(ordered_riders):
                direct_km = haversine_km(station.lat, station.lng, r.destination.lat, r.destination.lng)
                total_direct_km += direct_km

                leg_km = haversine_km(curr_lat, curr_lng, r.destination.lat, r.destination.lng)
                cumulative_route_km += leg_km
                
                detour_km = max(0.0, cumulative_route_km - direct_km)
                detour_mins = min(3.5, round(detour_km / SPEED_KM_PER_MIN, 1))
                eta_mins = round(cumulative_route_km / SPEED_KM_PER_MIN, 1)

                r.detour_delay_minutes = detour_mins
                r.status = "DISPATCHED"

                waypoints.append([r.destination.lat, r.destination.lng])
                hull_coords.append((r.destination.lat, r.destination.lng))
                stops_sequence.append({
                    "type": "PASSENGER_DROP",
                    "stop_index": idx + 1,
                    "name": r.destination.name,
                    "lat": r.destination.lat,
                    "lng": r.destination.lng,
                    "passenger": r.passenger_name,
                    "fare": r.locked_fare,
                    "party_size": r.party_size,
                    "luggage": r.luggage,
                    "eta_delta_minutes": eta_mins,
                    "detour_delay_minutes": detour_mins
                })
                curr_lat, curr_lng = r.destination.lat, r.destination.lng
        else:
            stop_groups: Dict[str, List[RideRequest]] = {}
            for r in riders:
                stop_id = r.matched_stop_id or "default"
                if stop_id not in stop_groups:
                    stop_groups[stop_id] = []
                stop_groups[stop_id].append(r)

            def stop_distance_to_station(sid: str) -> float:
                for vs in station.virtual_corner_stops:
                    if vs.stop_id == sid:
                        return haversine_km(vs.lat, vs.lng, station.lat, station.lng)
                return 0.0

            sorted_stops = sorted(stop_groups.keys(), key=stop_distance_to_station, reverse=True)
            curr_lat, curr_lng = station.lat, station.lng
            stop_seq_num = 1

            for sid in sorted_stops:
                group = stop_groups[sid]
                first_rider = group[0]
                vs_stop = next((s for s in station.virtual_corner_stops if s.stop_id == sid), None)
                stop_lat = vs_stop.lat if vs_stop else first_rider.origin.lat
                stop_lng = vs_stop.lng if vs_stop else first_rider.origin.lng
                stop_name = vs_stop.name if vs_stop else first_rider.matched_stop_name or "Virtual Arch Stop"

                waypoints.append([stop_lat, stop_lng])
                hull_coords.append((stop_lat, stop_lng))

                for r in group:
                    r.status = "DISPATCHED"
                    total_direct_km += haversine_km(r.origin.lat, r.origin.lng, station.lat, station.lng)
                    hull_coords.append((r.origin.lat, r.origin.lng))

                stops_sequence.append({
                    "type": "CORNER_PICKUP",
                    "stop_index": stop_seq_num,
                    "name": stop_name,
                    "lat": stop_lat,
                    "lng": stop_lng,
                    "passengers": [r.passenger_name for r in group],
                    "count": sum(r.party_size for r in group)
                })
                stop_seq_num += 1

            waypoints.append([station.lat, station.lng])
            stops_sequence.append({
                "type": "METRO_ARRIVAL",
                "name": f"{station.name} Concourse Gate",
                "lat": station.lat,
                "lng": station.lng,
                "eta_delta_minutes": round(cumulative_route_km / SPEED_KM_PER_MIN, 1)
            })

            for i in range(len(waypoints) - 1):
                cumulative_route_km += haversine_km(waypoints[i][0], waypoints[i][1], waypoints[i+1][0], waypoints[i+1][1])

        cluster_hull = generate_convex_hull(hull_coords) if len(hull_coords) >= 3 else [[p[0], p[1]] for p in hull_coords]

        total_fare_savings = sum(r.savings or 0.0 for r in riders)
        vmt_avoided = max(0.0, total_direct_km - cumulative_route_km)
        solo_co2 = total_direct_km * SOLO_CAB_CO2_PER_KM_KG
        actual_co2 = cumulative_route_km * spec["co2_per_km_kg"]
        co2_offset = max(0.0, solo_co2 - actual_co2)

        total_cap_used = sum(r.capacity_required for r in riders)
        fare_sum = sum(r.locked_fare or 0.0 for r in riders)
        trip_id = f"trip_{random.randint(10000, 99999)}"
        qr_token = generate_offline_qr_token(trip_id, plate_id, pickup_zone, len(riders), fare_sum)

        for r in riders:
            r.trip_id = trip_id

        return DispatchedTrip(
            trip_id=trip_id,
            direction=direction,
            station_id=station.id,
            station_name=station.name,
            vehicle_class=vclass,
            vehicle_label=spec["label"],
            plate_id=plate_id,
            driver_name=driver_name,
            women_only_pool=is_women_only,
            capacity_max=spec["capacity"],
            capacity_used=total_cap_used,
            assigned_pickup_zone=pickup_zone,
            departure_dwell_seconds=120,
            passengers=riders,
            waypoints=waypoints,
            stops_sequence=stops_sequence,
            cluster_hull=cluster_hull,
            total_vmt_km=round(cumulative_route_km, 2),
            vmt_avoided_km=round(vmt_avoided, 2),
            total_fare_savings_inr=round(total_fare_savings, 2),
            co2_offset_kg=round(co2_offset, 3),
            qr_token=qr_token
        )

    def _update_system_metrics(self, new_trips: List[DispatchedTrip]):
        for trip in new_trips:
            self.metrics.rider_savings_inr += trip.total_fare_savings_inr
            self.metrics.vmt_avoided_km += trip.vmt_avoided_km
            self.metrics.co2_offset_kg += trip.co2_offset_kg
            self.metrics.total_riders_pooled += len(trip.passengers)
            self.metrics.total_trips_dispatched += 1
            if trip.women_only_pool:
                self.metrics.women_priority_trips += 1

        self.metrics.rider_savings_inr = round(self.metrics.rider_savings_inr, 2)
        self.metrics.vmt_avoided_km = round(self.metrics.vmt_avoided_km, 2)
        self.metrics.co2_offset_kg = round(self.metrics.co2_offset_kg, 3)
        self.metrics.active_queues_count = len(self.queued_requests)
        if self.metrics.total_trips_dispatched > 0:
            self.metrics.average_pooling_efficiency = round(
                self.metrics.total_riders_pooled / self.metrics.total_trips_dispatched, 2
            )

    def generate_hackathon_simulation(self, mode: str, station_id: str = "raidurg") -> List[RideRequest]:
        station = STATIONS_REGISTRY.get(station_id, list(STATIONS_REGISTRY.values())[0])
        sample_names = [
            "Ananya S.", "Pooja Varma", "Deepa N.", "Neha Reddy", 
            "Rohit Sharma", "Karthik R.", "Sneha Nair", "Aarav Gupta",
            "Swati Sen", "Divya Rao", "Aditya V.", "Meera Joshi"
        ]

        created_requests: List[RideRequest] = []

        if mode == "morning_first_mile":
            clusters = station.residential_clusters
            for i in range(12):
                cluster_base = clusters[(i // 4) * 2 % len(clusters)]
                jitter_lat = cluster_base.lat + (random.uniform(-0.0006, 0.0006))
                jitter_lng = cluster_base.lng + (random.uniform(-0.0006, 0.0006))
                
                is_women = (i in [0, 1, 2, 8, 9])
                luggage_flag = (i in [3, 7])
                party = 2 if (i in [4, 10]) else 1
                vclass = VehicleClass.EV_AUTO if i < 6 else (VehicleClass.SHUTTLE if i < 10 else VehicleClass.AUTO)

                req = RideRequest(
                    direction=Direction.TO_METRO,
                    station_id=station.id,
                    origin=Location(lat=jitter_lat, lng=jitter_lng, name=f"{cluster_base.name}"),
                    destination=Location(lat=station.lat, lng=station.lng, name=f"{station.name} Concourse"),
                    vehicle_class=vclass,
                    women_only=is_women,
                    luggage=luggage_flag,
                    party_size=party,
                    passenger_name=sample_names[i]
                )
                self.add_ride_request(req)
                created_requests.append(req)

        elif mode == "evening_last_mile":
            corridors = station.popular_corridors
            for i in range(12):
                dest_base = corridors[(i // 3) % len(corridors)]
                jitter_lat = dest_base.lat + (random.uniform(-0.0005, 0.0005))
                jitter_lng = dest_base.lng + (random.uniform(-0.0005, 0.0005))

                is_women = (i in [0, 1, 6, 7])
                luggage_flag = (i in [4, 8])
                party = 2 if (i in [3, 9]) else 1
                vclass = VehicleClass.EV_AUTO if i < 6 else (VehicleClass.SHUTTLE if i < 9 else VehicleClass.AUTO)

                req = RideRequest(
                    direction=Direction.FROM_METRO,
                    station_id=station.id,
                    origin=Location(lat=station.lat, lng=station.lng, name=f"{station.name} Gate 2"),
                    destination=Location(lat=jitter_lat, lng=jitter_lng, name=f"{dest_base.name}"),
                    vehicle_class=vclass,
                    women_only=is_women,
                    luggage=luggage_flag,
                    party_size=party,
                    passenger_name=sample_names[i]
                )
                self.add_ride_request(req)
                created_requests.append(req)

        return created_requests

    def reset_system(self):
        self.queued_requests.clear()
        self.dispatched_trips.clear()
        self.metrics = SystemMetrics()
