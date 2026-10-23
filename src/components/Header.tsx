import React from 'react';
import { Shield, AlertTriangle, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'contacts' | 'route' | 'community' | 'profile';
  onSelectTab: (tab: 'home' | 'contacts' | 'route' | 'community' | 'profile') => void;
  onOpenSOS: () => void;
  isGPSLocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSOS,
  isGPSLocked,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onSelectTab('home')}>
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Shield className="w-5 h-5 fill-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
            Surakshit Path AI
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap hover:text-indigo-600 ${
              activeTab === 'home' ? 'text-indigo-600' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('route')}
            className={`transition-colors whitespace-nowrap hover:text-indigo-600 ${
              activeTab === 'route' ? 'text-indigo-600' : ''
            }`}
          >
            Route Map
          </button>
          <button
            onClick={() => onSelectTab('contacts')}
            className={`transition-colors whitespace-nowrap hover:text-indigo-600 ${
              activeTab === 'contacts' ? 'text-indigo-600' : ''
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => onSelectTab('community')}
            className={`transition-colors whitespace-nowrap hover:text-indigo-600 ${
              activeTab === 'community' ? 'text-indigo-600' : ''
            }`}
          >
            Community
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`transition-colors whitespace-nowrap hover:text-indigo-600 ${
              activeTab === 'profile' ? 'text-indigo-600' : ''
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (High-visibility floating red SOS action) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* GPS Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>GPS Locked</span>
          </div>

          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition-all whitespace-nowrap cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>[!] EMERGENCY SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
