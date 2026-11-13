from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

class Direction(str, Enum):
    TO_METRO = "TO_METRO"
    FROM_METRO = "FROM_METRO"

class VehicleClass(str, Enum):
    AUTO = "auto"
    EV_AUTO = "ev_auto"
    SHUTTLE = "shuttle"
    CAB = "cab"

class Location(BaseModel):
    lat: float
    lng: float
    name: str = "Location"
    address: Optional[str] = None

class VirtualStop(BaseModel):
    stop_id: str
    station_id: str
    name: str
    lat: float
    lng: float
    walking_radius_m: float = 350.0

class CurbsideBay(BaseModel):
    bay_id: str
    station_id: str
    name: str
    lat: float
    lng: float

class StationPreset(BaseModel):
    id: str
    name: str
    city: str
    line: Optional[str] = "Metro Line"
    lat: float
    lng: float
    curbside_bays: List[CurbsideBay] = []
    virtual_corner_stops: List[VirtualStop] = []
    popular_corridors: List[Location] = []
    residential_clusters: List[Location] = []

class RideRequestInput(BaseModel):
    direction: Direction
    station_id: str
    origin: Location
    destination: Location
    vehicle_class: VehicleClass = VehicleClass.EV_AUTO
    women_only: bool = False
    luggage: bool = False
    party_size: int = Field(default=1, ge=1, le=2)
    passenger_name: Optional[str] = None

class RideRequest(BaseModel):
    request_id: str = Field(default_factory=lambda: f"req_{uuid.uuid4().hex[:8]}")
    direction: Direction
    station_id: str
    origin: Location
    destination: Location
    vehicle_class: VehicleClass
    women_only: bool = False
    luggage: bool = False
    party_size: int = 1
    capacity_required: int = 1
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    passenger_name: str = "Commuter"
    status: str = "QUEUED"  # QUEUED, DISPATCHED, COMPLETED
    matched_stop_id: Optional[str] = None
    matched_stop_name: Optional[str] = None
    assigned_bay_id: Optional[str] = None
    assigned_bay_name: Optional[str] = None
    locked_fare: Optional[float] = None
    solo_benchmark_fare: Optional[float] = None
    savings: Optional[float] = None
    trip_id: Optional[str] = None
    detour_delay_minutes: float = 0.0

class DispatchedTrip(BaseModel):
    trip_id: str = Field(default_factory=lambda: f"trip_{uuid.uuid4().hex[:8]}")
    direction: Direction
    station_id: str
    station_name: str
    vehicle_class: VehicleClass
    vehicle_label: str
    plate_id: str
    driver_name: str
    women_only_pool: bool
    capacity_max: int
    capacity_used: int
    assigned_pickup_zone: str
    departure_dwell_seconds: int = 120
    passengers: List[RideRequest]
    waypoints: List[List[float]]
    stops_sequence: List[Dict[str, Any]]
    cluster_hull: List[List[float]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_vmt_km: float = 0.0
    vmt_avoided_km: float = 0.0
    total_fare_savings_inr: float = 0.0
    co2_offset_kg: float = 0.0
    qr_token: str = ""

class SystemMetrics(BaseModel):
    rider_savings_inr: float = 0.0
    vmt_avoided_km: float = 0.0
    co2_offset_kg: float = 0.0
    total_riders_pooled: int = 0
    total_trips_dispatched: int = 0
    women_priority_trips: int = 0
    active_queues_count: int = 0
    average_pooling_efficiency: float = 0.0
