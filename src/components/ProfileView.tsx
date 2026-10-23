import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Users,
  FileText,
  LogOut,
  Edit3,
  Award,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigateToTab: (tab: 'home' | 'contacts' | 'route' | 'community' | 'profile') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToTab }) => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('kanav');
  const [isEditing, setIsEditing] = useState(false);

  const safarId = 'SF-00V1-4GCK';
  const email = 'kanav6677@gmail.com';

  const handleCopyId = () => {
    navigator.clipboard.writeText(safarId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Top Profile Card (matches Screenshot 1) */}
      <div className="relative p-6 pt-8 rounded-3xl bg-gradient-to-b from-indigo-50/80 via-white to-purple-50/40 border border-slate-200/80 shadow-sm text-center">
        {/* Edit Pencil in top right */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Shield with Feminine Silhouette and Road Ribbon (Custom SVG Emblem) */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-white shadow-md border-2 border-indigo-100 flex items-center justify-center p-2 mb-3">
          <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="roadGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f43f5e" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* Shield Outline */}
            <path
              d="M50 10C65 18 85 18 85 35C85 62 50 88 50 88C50 88 15 62 15 35C15 18 35 18 50 10Z"
              fill="url(#shieldGrad)"
              opacity="0.12"
            />
            {/* Lady profile silhouette & winding road ribbon */}
            <path
              d="M48 20C42 20 37 25 37 32C37 38 41 43 46 44C42 48 35 55 32 68C42 63 50 58 56 50C62 42 62 30 56 24C53 21 50 20 48 20Z"
              fill="#818cf8"
            />
            {/* Curving Highway Ribbon */}
            <path
              d="M30 80C42 70 48 55 68 40"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="4 3"
            />
            <path
              d="M26 82C40 72 46 58 65 44"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* User Name with Verified Badge */}
        {isEditing ? (
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto mb-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-bold text-center border border-indigo-300 rounded-lg px-2 py-1 text-slate-900 focus:outline-none"
            />
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-lg font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <h2 className="text-xl font-black text-slate-900">{name}</h2>
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
          </div>
        )}

        {/* Safar ID pill with copy button */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-700 mb-2">
          <span>Safar ID: {safarId}</span>
          <button
            onClick={handleCopyId}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
            title="Copy Safar ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Email */}
        <p className="text-xs text-slate-500 font-medium">{email}</p>
      </div>

      {/* Item 1: Safety Stats Card (matches Screenshot 1) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Safety Stats</h4>
            <p className="text-xs text-slate-500">You're all set!</p>
            <p className="text-[11px] text-slate-400">No alerts · All good</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
          <Check className="w-4 h-4 font-bold" />
        </div>
      </div>

      {/* Item 2: Connections Card (matches Screenshot 1) */}
      <div
        onClick={() => onNavigateToTab('contacts')}
        className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Connections</h4>
            <p className="text-xs text-slate-500">Active guardian network</p>
            <p className="text-[11px] text-slate-400">Future trusted network</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm font-bold">›</span>
      </div>

      {/* Item 3: Reports Card (matches Screenshot 1) */}
      <div
        onClick={() => onNavigateToTab('community')}
        className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Reports</h4>
            <p className="text-xs text-slate-500">3 Recent Reports</p>
            <p className="text-[11px] text-slate-400">View history</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm font-bold">›</span>
      </div>

      {/* Sign Out Button (matches Screenshot 1) */}
      <div className="pt-2">
        <button
          onClick={() => {
            alert('Signed out of Safar ID. Re-authenticating safe session.');
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 border border-rose-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
