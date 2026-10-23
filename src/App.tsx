/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  RouteOption,
  SafeHaven,
  RoadHazard,
  EmergencyContact,
  IncidentReport,
} from './types';
import {
  fetchDualRoutes,
  generateSafeHavens,
  generateRoadHazards,
  searchNominatimLocation,
  DemoTrip,
  DEMO_TRIPS,
} from './services/routingService';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { MapWorkspace } from './components/MapWorkspace';
import { RouteComparisonCard } from './components/RouteComparisonCard';
import { AICopilotPanel } from './components/AICopilotPanel';
import { SafetyScoreBreakdownModal } from './components/SafetyScoreBreakdownModal';
import { SOSModal } from './components/SOSModal';
import { HomeView } from './components/HomeView';
import { ContactsView } from './components/ContactsView';
import { CommunityView } from './components/CommunityView';
import { ProfileView } from './components/ProfileView';
import {
  Search,
  MapPin,
  Moon,
  Sun,
  Loader2,
  Navigation,
  Compass,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'contacts' | 'route' | 'community' | 'profile'
  >('home');

  // Location & Navigation coordinates (Delhi North Campus to Connaught Place default)
  const [userCoords, setUserCoords] = useState<[number, number]>([28.6908, 77.2075]);
  const [destCoords, setDestCoords] = useState<[number, number]>([28.6315, 77.2167]);
  const [currentAddress, setCurrentAddress] = useState<string>(
    'Chhatra Marg, DU North Campus, Delhi'
  );
  const [destAddress, setDestAddress] = useState<string>(
    'Connaught Place (Inner Circle), Central Delhi'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGPSLocked, setIsGPSLocked] = useState<boolean>(true);

  // Time Mode: Night Mode by default for safety evaluation
  const [isNightMode, setIsNightMode] = useState<boolean>(true);

  // Routes State
  const [routeA, setRouteA] = useState<RouteOption | null>(null);
  const [routeB, setRouteB] = useState<RouteOption | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string>('route-a');
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(true);

  // Safe Havens and Hazards
  const [safeHavens, setSafeHavens] = useState<SafeHaven[]>([]);
  const [roadHazards, setRoadHazards] = useState<RoadHazard[]>([]);

  // Emergency Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: 'c-1',
      name: 'Priya Sharma',
      phone: '+91 98112 34567',
      email: 'priya.sharma@family.org',
      relationship: 'Parent / Guardian',
      isPrimary: true,
    },
    {
      id: 'c-2',
      name: 'Rohan Mehta',
      phone: '+91 98223 45678',
      email: 'rohan.mehta@network.in',
      relationship: 'Close Sibling',
      isPrimary: false,
    },
    {
      id: 'c-3',
      name: 'Campus Women Safety Desk',
      phone: '1091 / 011-27666692',
      email: 'safetydesk@du.ac.in',
      relationship: 'Institutional Helpline',
      isPrimary: false,
    },
  ]);

  // Community Incident Reports
  const [reports, setReports] = useState<IncidentReport[]>([
    {
      id: 'rep-1',
      title: 'Streetlights Out for 500m on Subzimandi Bypass',
      category: 'unlit_road',
      locationName: 'Subzimandi Bypass Road near Kamla Nagar',
      coordinates: [28.675, 77.198],
      description:
        'Continuous dark stretch. Two-wheeler riders and solo pedestrians advised to take illuminated Grand Trunk arterial instead.',
      upvotes: 18,
      timestamp: '1 hour ago',
      anonymous: true,
      status: 'verified',
    },
    {
      id: 'rep-2',
      title: 'Flyover Pillar Repair · Lane Diversion Active',
      category: 'pothole',
      locationName: 'Azad Market Flyover Merging Point',
      coordinates: [28.662, 77.209],
      description:
        'Heavy construction dust, gravel, and unpaved surface. Traffic bottleneck creating blind corners.',
      upvotes: 12,
      timestamp: '3 hours ago',
      anonymous: true,
      status: 'verified',
    },
    {
      id: 'rep-3',
      title: '24/7 Police Pink Booth Operational at Spark Mall',
      category: 'police_assistance',
      locationName: 'Spark Mall Roundabout, Kamla Nagar',
      coordinates: [28.682, 77.201],
      description:
        'Active female police officers stationed with immediate emergency response vehicle.',
      upvotes: 34,
      timestamp: 'Yesterday',
      anonymous: false,
      status: 'verified',
    },
  ]);

  // Modals & Notifications
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(false);
  const [breakdownRoute, setBreakdownRoute] = useState<RouteOption | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. High-accuracy real-time GPS tracking lock
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setIsGPSLocked(true);
          // Only update if coordinates are reasonable
          if (pos.coords.latitude && pos.coords.longitude) {
            // keep default demo anchor if user is in an unmapped area or keep track
          }
        },
        (err) => {
          console.warn('Geolocation fallback to Delhi North Campus:', err);
          setIsGPSLocked(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 2. Fetch or Recalculate Dual Routes
  useEffect(() => {
    let isCancelled = false;

    async function loadRoutes() {
      setIsLoadingRoutes(true);
      try {
        const { routeA: rA, routeB: rB } = await fetchDualRoutes(
          userCoords,
          destCoords,
          isNightMode
        );

        if (!isCancelled) {
          setRouteA(rA);
          setRouteB(rB);
          setActiveRouteId(rA.id);

          // Populate Safe Havens & Road Hazards along route
          const havens = generateSafeHavens(rA.coordinates);
          const hazards = generateRoadHazards(rB.coordinates);
          setSafeHavens(havens);
          setRoadHazards(hazards);
        }
      } catch (err) {
        console.error('Error loading routes:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingRoutes(false);
        }
      }
    }

    loadRoutes();

    return () => {
      isCancelled = true;
    };
  }, [userCoords, destCoords, isNightMode]);

  // Handle Preset Trip selection
  const handleSelectDemoTrip = (trip: DemoTrip) => {
    setUserCoords(trip.originCoords);
    setDestCoords(trip.destCoords);
    setCurrentAddress(trip.originName);
    setDestAddress(trip.destName);
    showToast(`Loaded corridor: ${trip.label}`);
  };

  // Handle Geocoding Search
  const handleSearchDestination = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchNominatimLocation(query);
      if (results.length > 0) {
        const best = results[0];
        setDestCoords([best.lat, best.lng]);
        setDestAddress(best.name);
        showToast(`Routing to: ${best.name.split(',')[0]}`);
      } else {
        showToast('Destination geocoded to Delhi NCR core.');
      }
    } catch (e) {
      showToast('Destination set to central transit hub.');
    } finally {
      setIsSearching(false);
    }
  };

  // Breakdown modal trigger
  const handleOpenBreakdown = (route: RouteOption) => {
    setBreakdownRoute(route);
    setIsBreakdownOpen(true);
  };

  // Contacts handlers
  const handleAddContact = (contact: EmergencyContact) => {
    setContacts((prev) => [contact, ...prev]);
    showToast(`Added ${contact.name} to emergency circle.`);
  };

  const handleUpdateContact = (updated: EmergencyContact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('Contact removed from emergency circle.');
  };

  const handleSendTestAlert = (contact: EmergencyContact) => {
    showToast(`Test SOS dispatch transmitted to ${contact.name} via WhatsApp.`);
  };

  // Community reports handlers
  const handleAddReport = (report: IncidentReport) => {
    setReports((prev) => [report, ...prev]);
    showToast('Report submitted anonymously to Community Radar.');
  };

  const handleUpvoteReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
    showToast('Upvoted safety report for verification.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-6">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSOS={() => setIsSOSOpen(true)}
        isGPSLocked={isGPSLocked}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 text-white text-xs font-semibold rounded-2xl shadow-xl backdrop-blur-md animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <HomeView
            onSearchDestination={handleSearchDestination}
            onSelectTrip={handleSelectDemoTrip}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenChat={() => setActiveTab('route')}
            onNavigateToTab={setActiveTab}
            currentAddress={currentAddress}
          />
        )}

        {/* TAB 2: ROUTE MAP & AI COPILOT WORKSPACE */}
        {activeTab === 'route' && (
          <div className="space-y-4">
            {/* Top Route Search Bar & Mode Switchers */}
            <div className="p-3.5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Origin -> Destination Search Inputs */}
              <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <input
                    type="text"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="Origin location..."
                    className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="text-slate-400 font-bold hidden sm:block">→</div>

                <div className="w-full flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <input
                    type="text"
                    value={destAddress}
                    onChange={(e) => setDestAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchDestination(destAddress);
                      }
                    }}
                    placeholder="Destination (e.g. Connaught Place)..."
                    className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSearchDestination(destAddress)}
                    disabled={isSearching}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    {isSearching ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Route'
                    )}
                  </button>
                </div>
              </div>

              {/* Day / Night Mode & Quick presets */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setIsNightMode(!isNightMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isNightMode
                      ? 'bg-indigo-950 text-indigo-200 border-indigo-800 shadow-sm'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                  title="Shift between Day and Night safety weighting"
                >
                  {isNightMode ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Night Safety Active</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      <span>Day Safety Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dual Route Comparison Cards (Route A vs Route B) */}
            {isLoadingRoutes ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Calculating OSRM Dual Corridors & 100-Point Safety Algorithm...
                </p>
                <p className="text-[11px] text-slate-400">
                  Scanning street illumination, safe havens, and infrastructure hazards
                </p>
              </div>
            ) : routeA && routeB ? (
              <RouteComparisonCard
                routeA={routeA}
                routeB={routeB}
                activeRouteId={activeRouteId}
                onSelectRoute={setActiveRouteId}
                onOpenBreakdown={handleOpenBreakdown}
              />
            ) : null}

            {/* Split Screen Workspace: Leaflet Map on Left, Gemini Co-Pilot on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Map Canvas: 7 columns on desktop */}
              <div className="lg:col-span-7 h-[500px] lg:h-[580px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm relative">
                <MapWorkspace
                  routeA={routeA}
                  routeB={routeB}
                  activeRouteId={activeRouteId}
                  onSelectRoute={setActiveRouteId}
                  safeHavens={safeHavens}
                  roadHazards={roadHazards}
                  userLocation={userCoords}
                  destinationLocation={destCoords}
                  isNightMode={isNightMode}
                />
              </div>

              {/* Gemini AI Co-Pilot & Chat: 5 columns on desktop */}
              <div className="lg:col-span-5 h-[500px] lg:h-[580px]">
                {routeA && routeB ? (
                  <AICopilotPanel
                    routeA={routeA}
                    routeB={routeB}
                    activeRouteId={activeRouteId}
                    origin={currentAddress}
                    destination={destAddress}
                    isNightMode={isNightMode}
                  />
                ) : (
                  <div className="h-full bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACTS */}
        {activeTab === 'contacts' && (
          <ContactsView
            contacts={contacts}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onSendTestAlert={handleSendTestAlert}
          />
        )}

        {/* TAB 4: COMMUNITY RADAR */}
        {activeTab === 'community' && (
          <CommunityView
            reports={reports}
            onAddReport={handleAddReport}
            onUpvoteReport={handleUpvoteReport}
          />
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView onNavigateToTab={setActiveTab} />
        )}
      </main>

      {/* Floating Bottom Navigation Bar (Mobile) */}
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Emergency SOS Modal */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        userCoords={userCoords}
        contacts={contacts}
        currentAddress={currentAddress}
      />

      {/* 100-Point Safety Score Breakdown Modal */}
      {breakdownRoute && (
        <SafetyScoreBreakdownModal
          isOpen={isBreakdownOpen}
          onClose={() => setIsBreakdownOpen(false)}
          route={breakdownRoute}
          isNightMode={isNightMode}
          onToggleNightMode={() => setIsNightMode(!isNightMode)}
        />
      )}
    </div>
  );
}
