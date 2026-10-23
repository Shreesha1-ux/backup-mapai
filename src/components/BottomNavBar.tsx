import React from 'react';
import { Home, Users, Compass, MessageCircle, User } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'home' | 'contacts' | 'route' | 'community' | 'profile';
  onSelectTab: (tab: 'home' | 'contacts' | 'route' | 'community' | 'profile') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex flex-col items-center justify-center h-full relative"
        >
          {activeTab === 'home' && (
            <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></span>
          )}
          <Home
            className={`w-5 h-5 transition-colors ${
              activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'
            }`}
          />
          <span
            className={`text-[10px] font-semibold mt-1 transition-colors ${
              activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Contacts */}
        <button
          onClick={() => onSelectTab('contacts')}
          className="flex flex-col items-center justify-center h-full relative"
        >
          {activeTab === 'contacts' && (
            <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></span>
          )}
          <Users
            className={`w-5 h-5 transition-colors ${
              activeTab === 'contacts' ? 'text-blue-600' : 'text-slate-400'
            }`}
          />
          <span
            className={`text-[10px] font-semibold mt-1 transition-colors ${
              activeTab === 'contacts' ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            Contacts
          </span>
        </button>

        {/* Tab 3: Route */}
        <button
          onClick={() => onSelectTab('route')}
          className="flex flex-col items-center justify-center h-full relative"
        >
          {activeTab === 'route' && (
            <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></span>
          )}
          <svg
            className={`w-5 h-5 transition-colors ${
              activeTab === 'route' ? 'text-blue-600' : 'text-slate-400'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="19" r="3" />
            <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
            <circle cx="18" cy="5" r="3" />
          </svg>
          <span
            className={`text-[10px] font-semibold mt-1 transition-colors ${
              activeTab === 'route' ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            Route
          </span>
        </button>

        {/* Tab 4: Community */}
        <button
          onClick={() => onSelectTab('community')}
          className="flex flex-col items-center justify-center h-full relative"
        >
          {activeTab === 'community' && (
            <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></span>
          )}
          <MessageCircle
            className={`w-5 h-5 transition-colors ${
              activeTab === 'community' ? 'text-blue-600' : 'text-slate-400'
            }`}
          />
          <span
            className={`text-[10px] font-semibold mt-1 transition-colors ${
              activeTab === 'community' ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            Community
          </span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className="flex flex-col items-center justify-center h-full relative"
        >
          {activeTab === 'profile' && (
            <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></span>
          )}
          <User
            className={`w-5 h-5 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'
            }`}
          />
          <span
            className={`text-[10px] font-semibold mt-1 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
