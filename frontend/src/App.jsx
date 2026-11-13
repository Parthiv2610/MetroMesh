import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import TopNav from './components/TopNav';
import MapPage from './pages/MapPage';
import BoardingPassPage from './pages/BoardingPassPage';
import ImpactDashboardPage from './pages/ImpactDashboardPage';
import StationsDirectoryPage from './pages/StationsDirectoryPage';
import WhatsAppShareModal from './components/WhatsAppShareModal';
import { 
  fetchCities, fetchStations, fetchMetroLines, submitRideRequest, dispatchPools, 
  fetchMetrics, fetchQueuedRequests, fetchTrips, 
  triggerSimulationWave, resetSystemState 
} from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('map'); // 'map' | 'pass' | 'impact' | 'stations'
  const [direction, setDirection] = useState('TO_METRO');
  
  // Dynamic City & Station State
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [metroLines, setMetroLines] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [cityStations, setCityStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Control Parameters
  const [vehicleClass, setVehicleClass] = useState('ev_auto');
  const [womenOnly, setWomenOnly] = useState(false);
  const [luggage, setLuggage] = useState(false);
  const [partySize, setPartySize] = useState(1);

  // Transit Data
  const [queuedRequests, setQueuedRequests] = useState([]);
  const [dispatchedTrips, setDispatchedTrips] = useState([]);
  const [activeTripIndex, setActiveTripIndex] = useState(0);
  const [metrics, setMetrics] = useState({
    rider_savings_inr: 0,
    vmt_avoided_km: 0,
    co2_offset_kg: 0,
    total_riders_pooled: 0,
    total_trips_dispatched: 0,
    women_priority_trips: 0,
    active_queues_count: 0,
    average_pooling_efficiency: 0
  });

  const [shareModalTrip, setShareModalTrip] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load Initial Cities & Stations & Lines
  useEffect(() => {
    async function init() {
      try {
        const [cityList, stationList] = await Promise.all([
          fetchCities(),
          fetchStations()
        ]);
        setCities(cityList);
        setAllStations(stationList);

        const defaultCity = cityList[0] || 'Hyderabad';
        setSelectedCity(defaultCity);

        const stationsInCity = stationList.filter(s => s.city.toLowerCase() === defaultCity.toLowerCase());
        setCityStations(stationsInCity);

        if (stationsInCity.length > 0) {
          const defaultStation = stationsInCity.find(s => s.id === 'raidurg') || stationsInCity[0];
          setSelectedStation(defaultStation);
        }

        try {
          const lines = await fetchMetroLines(defaultCity);
          setMetroLines(lines);
        } catch (e) {
          console.warn('Lines load fallback:', e);
        }

        await refreshSystemData();
      } catch (err) {
        console.error('Initial load failed:', err);
        setIsLive(false);
      }
    }
    init();
  }, []);

  // Periodic Refresh
  const refreshSystemData = async () => {
    try {
      const [q, trips, m] = await Promise.all([
        fetchQueuedRequests(),
        fetchTrips(),
        fetchMetrics()
      ]);
      setQueuedRequests(q);
      setDispatchedTrips(trips);
      setMetrics(m);
      setIsLive(true);
    } catch (err) {
      setIsLive(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(refreshSystemData, 3000);
    return () => clearInterval(timer);
  }, []);

  // Handle City Change
  const handleSelectCity = async (cityName) => {
    setSelectedCity(cityName);
    const stationsInCity = allStations.filter(s => s.city.toLowerCase() === cityName.toLowerCase());
    setCityStations(stationsInCity);
    if (stationsInCity.length > 0) {
      setSelectedStation(stationsInCity[0]);
      setActiveTripIndex(0);
    }
    try {
      const lines = await fetchMetroLines(cityName);
      setMetroLines(lines);
    } catch (err) {
      console.warn('Failed to load metro lines for city:', cityName);
      setMetroLines([]);
    }
  };

  // Handle Station Change
  const handleSelectStation = (id) => {
    const st = allStations.find((s) => s.id === id);
    if (st) {
      setSelectedStation(st);
      setActiveTripIndex(0);
    }
  };

  // Ingest Single Ride
  const handleRequestRide = async (payload) => {
    try {
      await submitRideRequest(payload);
      await refreshSystemData();
    } catch (err) {
      alert('Failed to request ride: ' + err.message);
    }
  };

  // Dispatch Active Pools
  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      const dispatched = await dispatchPools();
      await refreshSystemData();
      if (dispatched.length > 0) {
        setActiveTripIndex(dispatchedTrips.length);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#6A00F4', '#FFD6A5', '#10B981']
        });
        // Jump directly to Boarding Pass view
        setActivePage('pass');
      }
    } catch (err) {
      alert('Dispatch failed: ' + err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  // Trigger God-Mode Simulation
  const handleSimulate = async (mode) => {
    setIsSimulating(true);
    try {
      if (mode === 'morning_first_mile') {
        setDirection('TO_METRO');
      } else {
        setDirection('FROM_METRO');
      }
      await triggerSimulationWave(mode, selectedStation?.id || 'raidurg');
      const dispatched = await dispatchPools();
      await refreshSystemData();
      setActiveTripIndex(0);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#6A00F4', '#FFD6A5', '#A855F7', '#34D399']
      });
      // Switch smoothly to the Boarding Pass page to view the generated passes
      setActivePage('pass');
    } catch (err) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset System State
  const handleReset = async () => {
    try {
      await resetSystemState();
      await refreshSystemData();
      setActiveTripIndex(0);
      setActivePage('map');
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0F172A] select-none flex flex-col">
      
      {/* 1. Universal Top Navigation Bar with Page Tabs */}
      <TopNav
        activePage={activePage}
        setActivePage={setActivePage}
        direction={direction}
        setDirection={setDirection}
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        cityStations={cityStations}
        selectedStation={selectedStation}
        onSelectStation={handleSelectStation}
        queuedCount={queuedRequests.length}
        tripsCount={dispatchedTrips.length}
        onReset={handleReset}
        isLive={isLive}
      />

      {/* 2. Main Multi-Page Content Container */}
      <main className="flex-1 w-full mt-14 overflow-hidden">
        
        {/* Page 1: Live Dispatch Map */}
        {activePage === 'map' && (
          <MapPage
            station={selectedStation}
            allCityStations={cityStations}
            metroLines={metroLines}
            onSelectStation={handleSelectStation}
            direction={direction}
            queuedRequests={queuedRequests}
            dispatchedTrips={dispatchedTrips}
            activeTripIndex={activeTripIndex}
            vehicleClass={vehicleClass}
            setVehicleClass={setVehicleClass}
            womenOnly={womenOnly}
            setWomenOnly={setWomenOnly}
            luggage={luggage}
            setLuggage={setLuggage}
            partySize={partySize}
            setPartySize={setPartySize}
            onRequestRide={handleRequestRide}
            onDispatch={handleDispatch}
            onSimulate={handleSimulate}
            isDispatching={isDispatching}
            isSimulating={isSimulating}
            metrics={metrics}
            onNavigateToPass={() => setActivePage('pass')}
            onNavigateToImpact={() => setActivePage('impact')}
          />
        )}

        {/* Page 2: Dedicated Boarding Pass (The Glass Pass) */}
        {activePage === 'pass' && (
          <BoardingPassPage
            trips={dispatchedTrips}
            activeTripIndex={activeTripIndex}
            setActiveTripIndex={setActiveTripIndex}
            onOpenShareModal={(t) => setShareModalTrip(t)}
            onNavigateToMap={() => setActivePage('map')}
          />
        )}

        {/* Page 3: UN SDG 11.2 Impact Analytics */}
        {activePage === 'impact' && (
          <ImpactDashboardPage
            metrics={metrics}
            tripsCount={dispatchedTrips.length}
            onNavigateToMap={() => setActivePage('map')}
          />
        )}

        {/* Page 4: Stations & Network Directory */}
        {activePage === 'stations' && (
          <StationsDirectoryPage
            allStations={allStations}
            cities={cities}
            selectedCity={selectedCity}
            onSelectCity={handleSelectCity}
            onSelectStation={handleSelectStation}
            onNavigateToMap={() => setActivePage('map')}
          />
        )}

      </main>

      {/* Global WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={!!shareModalTrip}
        onClose={() => setShareModalTrip(null)}
        trip={shareModalTrip}
      />

    </div>
  );
}
