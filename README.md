# ⚡ MetroMesh

> **Arrival-Aware, Bidirectional Urban Transit Pooling Platform**  
> Developed for **Hack4SDG** at **BITS Hyderabad** under **United Nations Sustainable Development Goal 11.2 (Sustainable & Affordable Urban Transit)**.

---

## 🌟 Executive Summary & UN SDG 11.2 Alignment

Urban metro rail infrastructure provides high-throughput rapid transit, but **first-mile and last-mile connectivity bottlenecks** cause commuters to rely on private single-occupancy vehicles and solo cabs, creating massive road congestion, emissions, and prohibitive transit costs.

**MetroMesh** solves this by operating as an **arrival-aware, bidirectional transit pooling platform** that dynamically matches commuters in spatial-temporal corridors to high-efficiency shared vehicles (EV Autos, Shared Autos, 6-Seater Shuttles, and AC Cabs).

### 🎯 Direct Contributions to UN SDG 11.2:
- **Affordability:** Locked zonal fares starting at **₹20 – ₹30**, delivering **55%–70% cost savings** compared to solo on-demand cabs.
- **Emission Offsets:** Aggressive reduction in Vehicle Miles Traveled (VMT) through high-occupancy collinear pooling, offsetting **100g – 165g CO₂ per avoided solo vehicle-km**.
- **Gender Safety & Inclusion:** Strict **Women-Priority Sub-Pool Partitioning** guaranteeing isolated co-riding pools.
- **Predictability:** Fixed 2-minute boarding dwell countdowns with offline QR boarding tokens for zero-friction concourse turnstile validation.

---

## 🎨 1. Modern Dark Glassmorphic Design System

MetroMesh features a purpose-built UI aesthetic designed for transit command centers and commuter mobile screens:

| Design Token | Value | Application |
|---|---|---|
| **Base Theme** | `#0F172A` (Deep Dark Slate) | Frosted glass panels (`rgba(15, 23, 42, 0.78)` + `backdrop-blur-md` + `border-slate-700/50`) |
| **Primary Accent** | `#6A00F4` (Blueberry) | Interactive buttons, glowing highlighted badges, sequential route polylines |
| **Highlight Accent** | `#FFD6A5` (Cream Soda) | Vehicle icons, curbside bay indicators, destination pins, locked fare badges (`₹25`, `₹30`) |
| **Map Base** | CartoDB Dark Leaflet | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` |

---

## ⚙️ 2. Backend Routing & Pooling Engine (Python / FastAPI)

Located in `backend/`, the transit engine enforces real-world urban transit operational constraints:

### 1. Bidirectional Transit Routing:
- **First-Mile (`TO_METRO`):** Commuters initiating trips from residential coordinates are snapped to designated **Virtual Corner Stops** (e.g., colony arch gates, junction pillars) within walking distance (≤350m). Vehicles execute scheduled sequential pickups before heading directly to the metro station.
- **Last-Mile (`FROM_METRO`):** Commuters pre-book during train transit. As trains dock, riders assemble at assigned station concourse curbs (e.g., *Gate 2 – Curb Point B*) and are dispatched along collinear drop sequences.

### 2. Women-Priority Sub-Pool Partitioning:
- Commuters toggle `women_only=True`.
- The pooling engine partitions the request queue into isolated sub-pools `(station_id, direction, vehicle_class, women_only)`. Requests with `women_only=True` **never mix with non-women pools**.

### 3. Vehicle Fleet Matrix & Capacity Caps:
| Vehicle Class | Capacity Cap | Zone 1 Fare (≤3 km) | Zone 2 Fare (>3 km) | Emission Factor |
|---|---|---|---|---|
| 🛺 **Shared Auto** | 3 pax | **₹25** | **₹40** | 0.085 kg CO₂/km |
| ⚡ **Eco EV Auto** | 3 pax | **₹30** | **₹45** | **0.020 kg CO₂/km** (Tailpipe zero) |
| 🚐 **6-Seater Shuttle** | 6 pax | **₹20** | **₹30** | 0.035 kg CO₂/km |
| 🚗 **Express AC Cab** | 4 pax | **₹60** | **₹90** | 0.150 kg CO₂/km |

*Luggage Reservation:* Setting `luggage=True` reserves 2 capacity units. Party sizes can be `1` or `2`.

### 4. Algorithmic Bounds:
- **Spatial-Temporal Window:** Clusters riders whose drop destinations have an angular divergence ≤ 35° and pairwise distance ≤ 1.2 km.
- **Maximum Detour Bound:** Greedy insertion sorts stops to guarantee maximum detour delay ≤ **3.5 minutes** per rider against solo point-to-point transit.
- **3-Minute TTL Force Dispatch:** Clusters dispatch automatically after 3 minutes to preserve maximum 20-minute transit latency thresholds.
- **Convex Hull Generation:** Calculates 2D Monotone Chain bounding hulls returned as geo-polygons for map rendering.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/request-ride` | Ingests single commuter intent; calculates zonal fare and snaps stops |
| `POST` | `/dispatch` | Runs arrival-aware clustering, assigns curbside bays, generates route polylines and hulls |
| `GET` | `/metrics` | Returns live aggregate savings (₹), avoided VMT (km), and CO₂ offset (kg) |
| `GET` | `/stations` | Lists station presets with curbside bays and virtual corner stops |
| `POST` | `/simulate` | Triggers one-click Hackathon "God Mode" simulation waves (`morning_first_mile` or `evening_last_mile`) |
| `POST` | `/reset` | Flushes active queues and resets system metrics |
| `GET` | `/trips` | Returns all active dispatched trips and their stops |

---

## 🖥️ 3. Frontend Architecture (React / Leaflet / Tailwind)

Located in `frontend/`, the interactive UI includes:

1. **Top Navigation & Dynamic City/Station Selector:**
   - Direction switch: `[ 🚆 Headed TO Metro ]` ⇄ `[ 🏙️ Leaving FROM Metro ]`.
   - **Cascading City & Metro Network Selector (200+ Stations across 6 Cities):**
     - **Hyderabad:** 54 Metro Stations (Blue Line, Red Line, Green Line — Raidurg, HITEC City, Ameerpet, Miyapur, LB Nagar, Secunderabad, etc.)
     - **Bengaluru:** 59 Metro Stations (Purple Line, Green Line, Yellow Line — Whitefield, Indiranagar, MG Road, Majestic, Kengeri, Silk Board, Electronic City, etc.)
     - **Delhi NCR:** 44 Metro Stations (Yellow, Blue, Violet, Magenta, Rapid Metro — Rajiv Chowk, Kashmere Gate, New Delhi, Hauz Khas, Noida, Cyber City, etc.)
     - **Mumbai:** 20 Metro Stations (Line 1, Line 2A, Line 7, Aqua Line 3 — Versova, Andheri, Ghatkopar, BKC, Dadar, Borivali, etc.)
     - **Chennai:** 17 Metro Stations (Blue Line, Green Line — Central, Egmore, CMBT, Alandur, Guindy, Airport, etc.)
     - **Kolkata:** 15 Metro Stations (East-West Green Line, North-South Blue Line — Howrah, Esplanade, Sealdah, Salt Lake Sector V, etc.)
   - Built-in instant station filter/search bar for navigating high-density city networks.
   - Interactive map network layer: Renders all other metro stations in that city as clickable transit nodes.
   - Live system status pill with queued commuter count and dispatched vehicle indicators.

2. **Left Floating Control Hub:**
   - Interactive vehicle class tabs (`Auto`, `EV Auto`, `Shuttle`, `Cab`).
   - Party size (`1 Pax`, `2 Pax`) and Luggage (`+1 Seat Reserved`) controls.
   - **Women-Priority Pool Toggle** with active glowing purple indicator badge.
   - **One-Click Hackathon "God Mode" Simulator Buttons:**
     - `Simulate Morning First-Mile Wave (Homes ➔ Station)`: Ingests 12 residential commuter intents.
     - `Simulate Evening Metro Docking (Station ➔ Corridors)`: Ingests 12 exiting train passengers across IT hubs.
   - Force dispatch button with live queue counter.

3. **Right Floating Glass Pass (Digital Boarding Pass):**
   - Dispatched vehicle plate ID (e.g., `⚡ EV-Auto TS-09-EA-2041`) and pilot name.
   - Assigned Curbside Bay (e.g., `Gate 2 – Curb Point B`).
   - Locked Zonal Fare in Cream Soda (`#FFD6A5`): `₹25 FIXED`.
   - Live **2-minute boarding dwell countdown timer** (`01:54 remaining`).
   - Passenger occupancy badges with luggage icons.
   - Offline-cached **QR Boarding Token** canvas for turnstile scanning.
   - Emergency Share: **"Share Trip via WhatsApp"** modal with formatted dispatch telemetry.

4. **Bottom-Right Live SDG 11.2 Metrics Card:**
   - `Rider Savings vs Solo Cabs (₹)`
   - `Vehicle Miles Traveled (VMT) Avoided (km)`
   - `Estimated CO₂ Emissions Offset (kg)`

---

## 🚀 Quickstart & Execution Guide

### Option 1: One-Click Unified Launcher (Windows)
Double-click `run_metromesh.bat` or run:
```powershell
.\run_metromesh.ps1
```
This automatically verifies the frontend production build and launches the unified server at **`http://localhost:8000`**.

---

### Option 2: Manual Start (Full-Stack Dev Mode)

#### 1. Start the FastAPI Backend:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

#### 2. Start the Vite React Frontend:
```bash
cd frontend
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🧪 Testing & Verification

Run the end-to-end integration test suite:
```bash
python scripts/testing_script.py
```

Run the high-concurrency stress test:
```bash
python scripts/stress_test.py
```
*Benchmark result: 50 concurrent commuter requests ingested in 0.22 seconds; clustered and dispatched in 8.31 ms.*

---

## 🏛️ Project Directory Structure

```
MetroMesh/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application & REST endpoints
│   ├── engine.py            # Arrival-aware pooling, detour bounds & convex hulls
│   ├── models.py            # Pydantic models for rides, trips, and SDG metrics
│   └── stations.py          # Station presets (Hyderabad, Bengaluru, Delhi)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopNav.jsx               # Navigation & station preset switcher
│   │   │   ├── ControlHub.jsx           # Glassmorphic controls & simulators
│   │   │   ├── GlassPass.jsx            # Digital boarding pass & QR token
│   │   │   ├── SdgMetricsCard.jsx       # Real-time SDG 11.2 impact card
│   │   │   ├── MapView.jsx              # Leaflet dark map & route visualizer
│   │   │   └── WhatsAppShareModal.jsx   # Emergency WhatsApp trip share
│   │   ├── services/api.js              # REST client
│   │   ├── App.jsx                      # Root container & reactive state
│   │   ├── index.css                    # Glassmorphism & custom glow styles
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── scripts/
│   ├── testing_script.py    # Integration test suite
│   ├── stress_test.py       # High-concurrency load testing script
│   └── notification_stream.py # Event stream monitor
├── run_metromesh.bat        # Windows 1-click batch launcher
├── run_metromesh.ps1        # PowerShell automated launcher
└── README.md
```

---
*Built with ❤️ for Hack4SDG at BITS Hyderabad under UN SDG 11.2.*
