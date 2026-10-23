import React from 'react';
import { X, ShieldCheck, Sun, Moon, Zap, Building, Wifi, AlertOctagon, Trees } from 'lucide-react';
import { RouteOption } from '../types';

interface SafetyScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteOption;
  isNightMode: boolean;
  onToggleNightMode: () => void;
}

export const SafetyScoreBreakdownModal: React.FC<SafetyScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  route,
  isNightMode,
  onToggleNightMode,
}) => {
  if (!isOpen) return null;

  const { scoreBreakdown, score, name, lightingPct, safeHavensCount, cellularPct } = route;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg font-bold">100-Point Safety Algorithm</h2>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Evaluating infrastructure, lighting, and safe havens for {name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Total Score Banner & Day/Night Mode Switch */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-inner tabular-nums">
                {score}
                <span className="text-[10px] font-normal text-indigo-200 absolute bottom-1.5">/100</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Calculated Index</p>
                <p className="text-base font-bold text-slate-900">
                  {score >= 80 ? 'Optimal Safe Corridor' : score >= 60 ? 'Moderate Caution Advised' : 'High Risk Route'}
                </p>
                <p className="text-xs text-slate-500">
                  OSRM Geometry + Overpass API Safe Haven Proximity
                </p>
              </div>
            </div>

            {/* Day / Night Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={onToggleNightMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  !isNightMode
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Day Mode
              </button>
              <button
                onClick={onToggleNightMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isNightMode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Night Mode
              </button>
            </div>
          </div>

          {/* Breakdown Factor Meters */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Factor Weight Breakdown
            </h3>

            {/* 1. Street Lighting */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-slate-800">Street Lighting & Illumination</span>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  +{scoreBreakdown.lightingScore} / 25 pts
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${(scoreBreakdown.lightingScore / 25) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {lightingPct}% of the corridor is equipped with functional overhead LED lighting.
              </p>
            </div>

            {/* 2. Public Support & Safe Havens */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-800">Public Support & Safe Havens</span>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  +{scoreBreakdown.publicSupportScore} / 25 pts
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(scoreBreakdown.publicSupportScore / 25) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {safeHavensCount} verified safe havens within 500m (Police posts, trauma centers, 24/7 petrol bunks).
              </p>
            </div>

            {/* 3. Telecom & Cellular Reliability */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-800">Telecom & SOS Readiness</span>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  +{scoreBreakdown.telecomActivityScore} / 20 pts
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${(scoreBreakdown.telecomActivityScore / 20) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {cellularPct}% reliable 5G/4G network coverage for continuous GPS telemetry lock.
              </p>
            </div>

            {/* 4. Road Conditions & Construction Penalty */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-semibold text-slate-800">Road Hazards & Construction</span>
                </div>
                <span className="text-sm font-bold text-rose-600 tabular-nums">
                  {scoreBreakdown.roadConditionPenalty} pts
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Penalizes active digging, missing median dividers, and unpaved detour bypasses.
              </p>
            </div>

            {/* 5. Forest Canopy & Dark Stretch Penalty */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Trees className="w-4 h-4 text-slate-700" />
                  <span className="text-sm font-semibold text-slate-800">Dark Corridor & Forest Penalty</span>
                </div>
                <span className="text-sm font-bold text-rose-600 tabular-nums">
                  {scoreBreakdown.forestDarkPenalty} pts
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isNightMode
                  ? 'Night Mode Active: Strict penalty applied to secluded tree stretches with zero human activity.'
                  : 'Day Mode: Moderate penalty for low-visibility zones.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
