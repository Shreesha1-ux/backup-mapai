import React, { useState } from 'react';
import {
  Search,
  Mic,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
  Share2,
  Flag,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Navigation,
  Shield,
  Zap,
} from 'lucide-react';
import { DEMO_TRIPS, DemoTrip } from '../services/routingService';

interface HomeViewProps {
  onSearchDestination: (query: string) => void;
  onSelectTrip: (trip: DemoTrip) => void;
  onOpenSOS: () => void;
  onOpenChat: () => void;
  onNavigateToTab: (tab: 'home' | 'contacts' | 'route' | 'community' | 'profile') => void;
  currentAddress: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSearchDestination,
  onSelectTrip,
  onOpenSOS,
  onOpenChat,
  onNavigateToTab,
  currentAddress,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchDestination(searchInput.trim());
      onNavigateToTab('route');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Top Search Destination with Voice Mic (matches screenshot 3) */}
      <div className="p-3 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5 text-indigo-600" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search destination (e.g. Connaught Place, CP)..."
            className="flex-1 py-2 text-sm text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none font-medium"
          />
          <button
            type="button"
            onClick={() => {
              setSearchInput('Connaught Place, Central Delhi');
              onSearchDestination('Connaught Place, Central Delhi');
              onNavigateToTab('route');
            }}
            title="Voice Search"
            className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Mic className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Current Location Card (matches screenshot 3) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CURRENT LOCATION
            </p>
            <h3 className="text-sm font-bold text-slate-900">
              {currentAddress || 'Delhi University North Campus'}
            </h3>
            <p className="text-xs text-blue-600 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Location accuracy: High (GPS Active)
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('route')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-xl bg-indigo-50"
        >
          View Map
        </button>
      </div>

      {/* Smart Safety Status & 2x2 Action Cards (matches screenshot 3) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        {/* Header with Title and Readiness checkmarks */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Smart Safety</h3>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            Shield Active
          </span>
        </div>

        {/* 2 Micro status tags */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Location</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              Ready <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Emergency contacts</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              Ready <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 2x2 Tactile Action Grid from User Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Card 1: SOS (Rose/Coral) */}
          <button
            onClick={onOpenSOS}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-rose-50 to-red-50/60 border border-rose-200/80 hover:border-rose-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-rose-600/30">
                SOS
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  SOS
                </h4>
                <p className="text-xs text-slate-500">
                  Instant help in an emergency
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </button>

          {/* Card 2: Live Tracking (Blue) */}
          <button
            onClick={() => onNavigateToTab('route')}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-blue-50 to-sky-50/60 border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Live Tracking
                </h4>
                <p className="text-xs text-slate-500">
                  Share your trip in real-time
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Card 3: Report (Purple) */}
          <button
            onClick={() => onNavigateToTab('community')}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-purple-50 to-violet-50/60 border border-purple-200/80 hover:border-purple-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Report
                </h4>
                <p className="text-xs text-slate-500">
                  Report incidents anonymously
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </button>

          {/* Card 4: Chatbot (Indigo) */}
          <button
            onClick={onOpenChat}
            className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-indigo-50 to-blue-50/60 border border-indigo-200/80 hover:border-indigo-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Chatbot
                </h4>
                <p className="text-xs text-slate-500">
                  24/7 travel safety assistant
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Preset Demo Journeys for quick exploration */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Recommended Corridors (Dual-Path Preview)
          </h3>
          <span className="text-xs text-slate-400">Tap to route</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_TRIPS.map((trip) => (
            <button
              key={trip.id}
              onClick={() => {
                onSelectTrip(trip);
                onNavigateToTab('route');
              }}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  {trip.label}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[220px]">
                  {trip.originName} → {trip.destName}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Accordion (matches screenshot 3) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setIsRecentActivityOpen(!isRecentActivityOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Recent activity</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
              Safe
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${
              isRecentActivityOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isRecentActivityOpen && (
          <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  Daily Safety Check Completed
                </p>
                <p className="text-slate-500 text-[11px]">
                  GPS locked · 2 Emergency contacts verified
                </p>
              </div>
              <span className="text-emerald-600 font-bold text-[11px]">All Good</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  North Campus Corridor Scanned
                </p>
                <p className="text-slate-500 text-[11px]">
                  Chhatra Marg lighting verified at 94%
                </p>
              </div>
              <span className="text-slate-400 text-[11px]">2h ago</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  Community Hazard Acknowledged
                </p>
                <p className="text-slate-500 text-[11px]">
                  Pothole reported near Azad Market bypass
                </p>
              </div>
              <span className="text-slate-400 text-[11px]">Yesterday</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
