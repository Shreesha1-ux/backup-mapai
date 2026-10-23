import React from 'react';
import { ShieldCheck, Clock, Navigation, Zap, Building2, Wifi, ChevronRight, Info } from 'lucide-react';
import { RouteOption } from '../types';

interface RouteComparisonCardProps {
  routeA: RouteOption;
  routeB: RouteOption;
  activeRouteId: string;
  onSelectRoute: (id: string) => void;
  onOpenBreakdown: (route: RouteOption) => void;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({
  routeA,
  routeB,
  activeRouteId,
  onSelectRoute,
  onOpenBreakdown,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* Route A Card (Safest) */}
      <div
        onClick={() => onSelectRoute(routeA.id)}
        className={`relative p-4 rounded-3xl cursor-pointer transition-all border ${
          activeRouteId === routeA.id
            ? 'bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20'
            : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-sm'
        }`}
      >
        {/* Recommended Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Safest Recommendation
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenBreakdown(routeA);
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            100-Pt Breakdown
          </button>
        </div>

        {/* Title & Score */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 leading-tight">
              {routeA.name}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {routeA.summary}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded-2xl bg-indigo-600 text-white shadow-sm tabular-nums">
            <span className="text-lg font-black leading-none">{routeA.score}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-0.5">Safety</span>
          </div>
        </div>

        {/* Vital Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-2xl bg-white/80 border border-slate-100 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Time</span>
            <span className="font-bold text-slate-900 tabular-nums">{routeA.durationMin} m</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Dist</span>
            <span className="font-bold text-slate-900 tabular-nums">{routeA.distanceKm} km</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Lighting</span>
            <span className="font-bold text-emerald-600 tabular-nums">{routeA.lightingPct}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Havens</span>
            <span className="font-bold text-indigo-600 tabular-nums">{routeA.safeHavensCount} verified</span>
          </div>
        </div>

        {/* Selection Indicator */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            {routeA.darkStretchesCount === 0 ? '✓ No unlit dark corridors' : 'Caution stretches detected'}
          </span>
          <span className={`font-semibold ${activeRouteId === routeA.id ? 'text-indigo-600' : 'text-slate-400'}`}>
            {activeRouteId === routeA.id ? '● Active Route' : 'Select'}
          </span>
        </div>
      </div>

      {/* Route B Card (Alternative) */}
      <div
        onClick={() => onSelectRoute(routeB.id)}
        className={`relative p-4 rounded-3xl cursor-pointer transition-all border ${
          activeRouteId === routeB.id
            ? 'bg-gradient-to-br from-slate-50 via-white to-amber-50/60 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
            : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-sm'
        }`}
      >
        {/* Faster / Alternative Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Shortest Distance
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenBreakdown(routeB);
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            100-Pt Breakdown
          </button>
        </div>

        {/* Title & Score */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 leading-tight">
              {routeB.name}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {routeB.summary}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded-2xl bg-slate-700 text-white shadow-sm tabular-nums">
            <span className="text-lg font-black leading-none">{routeB.score}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-0.5">Safety</span>
          </div>
        </div>

        {/* Vital Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-2xl bg-white/80 border border-slate-100 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Time</span>
            <span className="font-bold text-emerald-600 tabular-nums">{routeB.durationMin} m</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Dist</span>
            <span className="font-bold text-slate-900 tabular-nums">{routeB.distanceKm} km</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Lighting</span>
            <span className="font-bold text-amber-600 tabular-nums">{routeB.lightingPct}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Havens</span>
            <span className="font-bold text-slate-600 tabular-nums">{routeB.safeHavensCount} verified</span>
          </div>
        </div>

        {/* Caution Indicator */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[11px] text-amber-600 font-medium">
            ⚠ {routeB.darkStretchesCount} dark corridors · Construction active
          </span>
          <span className={`font-semibold ${activeRouteId === routeB.id ? 'text-amber-600' : 'text-slate-400'}`}>
            {activeRouteId === routeB.id ? '● Active Route' : 'Select'}
          </span>
        </div>
      </div>
    </div>
  );
};
