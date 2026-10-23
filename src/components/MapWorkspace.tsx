import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Plus,
  Minus,
  LocateFixed,
  Layers,
  Shield,
  HeartPulse,
  Fuel,
  Train,
  Store,
  AlertTriangle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { RouteOption, SafeHaven, RoadHazard } from '../types';

interface MapWorkspaceProps {
  routeA: RouteOption | null;
  routeB: RouteOption | null;
  activeRouteId: string;
  onSelectRoute: (id: string) => void;
  safeHavens: SafeHaven[];
  roadHazards: RoadHazard[];
  userLocation: [number, number];
  destinationLocation: [number, number];
  isNightMode: boolean;
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  routeA,
  routeB,
  activeRouteId,
  onSelectRoute,
  safeHavens,
  roadHazards,
  userLocation,
  destinationLocation,
  isNightMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'dark'>('standard');
  const [activeHavenFilter, setActiveHavenFilter] = useState<string>('all');
  const [showLegend, setShowLegend] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialZoom = 14;
    const map = L.map(mapContainerRef.current, {
      center: userLocation,
      zoom: initialZoom,
      zoomControl: false, // We render custom ergonomic touch controls
      attributionControl: false,
    });

    mapInstanceRef.current = map;
    layersGroupRef.current = L.layerGroup().addTo(map);

    // Initial base layer
    const tileUrl =
      isNightMode
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapStyle === 'dark' || (mapStyle === 'standard' && isNightMode)) {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }

    tileLayerRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(map);
  }, [mapStyle, isNightMode]);

  // Render Routes, Markers, Safe Havens, and Hazards
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. User Current Location Pin (Blue glowing with pulse wave)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-gps-ring"></div>
          <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 })
      .bindPopup(
        `<div class="p-3 text-xs">
          <p class="font-bold text-slate-800">Your Current Position</p>
          <p class="text-emerald-600 font-medium">📍 Live GPS Locked (±4m)</p>
        </div>`
      )
      .addTo(group);

    // 2. Destination Pin
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-white text-white shadow-lg">
          <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 30],
    });

    L.marker(destinationLocation, { icon: destIcon, zIndexOffset: 990 })
      .bindPopup(
        `<div class="p-3 text-xs">
          <p class="font-bold text-slate-900">Destination</p>
          <p class="text-slate-500">Safest entrance recommended</p>
        </div>`
      )
      .addTo(group);

    // 3. Render Route B (Alternative / Shortest) first so Route A can overlay
    if (routeB && routeB.coordinates.length > 0) {
      const isRouteBActive = activeRouteId === routeB.id;
      const polylineB = L.polyline(routeB.coordinates, {
        color: isRouteBActive ? '#64748b' : '#94a3b8',
        weight: isRouteBActive ? 5 : 4,
        dashArray: '8, 8',
        opacity: isRouteBActive ? 0.95 : 0.65,
      });

      polylineB.on('click', () => onSelectRoute(routeB.id));
      polylineB.bindPopup(
        `<div class="p-3 text-xs min-w-[200px]">
          <p class="font-bold text-slate-900">${routeB.name}</p>
          <p class="text-amber-600 font-medium">Safety Score: ${routeB.score}/100</p>
          <p class="text-slate-500 mt-1">${routeB.summary}</p>
          <div class="mt-2 text-slate-600">
            <span>⏱ ${routeB.durationMin} mins</span> · <span>📍 ${routeB.distanceKm} km</span>
          </div>
        </div>`
      );
      polylineB.addTo(group);
    }

    // 4. Render Route A (Safest Route) with Multi-Segment Infrastructure Colors
    if (routeA && routeA.segments.length > 0) {
      const isRouteAActive = activeRouteId === routeA.id;

      // Base glow under active line
      if (isRouteAActive) {
        L.polyline(routeA.coordinates, {
          color: '#3b82f6',
          weight: 10,
          opacity: 0.25,
        }).addTo(group);
      }

      // Individual colored segments
      routeA.segments.forEach((seg) => {
        const segLine = L.polyline(seg.coordinates, {
          color: seg.color,
          weight: isRouteAActive ? 6 : 4,
          opacity: isRouteAActive ? 1.0 : 0.7,
          dashArray: seg.dashArray || undefined,
        });

        segLine.on('click', () => onSelectRoute(routeA.id));
        segLine.bindPopup(
          `<div class="p-3 text-xs min-w-[210px]">
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase mb-1" 
                  style="background-color: ${seg.color}20; color: ${seg.color}">
              ${seg.type.replace('_', ' ')}
            </span>
            <p class="font-bold text-slate-900">${seg.label}</p>
            <p class="text-slate-500 mt-0.5">Part of Route A (${routeA.score}/100 Safety)</p>
          </div>`
        );
        segLine.addTo(group);
      });
    }

    // 5. Render Safe Havens along route
    safeHavens.forEach((haven) => {
      if (activeHavenFilter !== 'all' && activeHavenFilter !== haven.category) return;

      let badgeBg = 'bg-blue-600';
      let iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;

      if (haven.category === 'police') {
        badgeBg = 'bg-indigo-600';
      } else if (haven.category === 'hospital') {
        badgeBg = 'bg-emerald-600';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`;
      } else if (haven.category === 'fuel') {
        badgeBg = 'bg-amber-600';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
      } else if (haven.category === 'transit') {
        badgeBg = 'bg-violet-600';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`;
      } else if (haven.category === 'store247') {
        badgeBg = 'bg-teal-600';
        iconSvg = `<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
      }

      const havenIcon = L.divIcon({
        className: 'custom-haven-pin',
        html: `
          <div class="flex items-center justify-center w-7 h-7 rounded-full ${badgeBg} border-2 border-white shadow-md transform hover:scale-110 transition-transform">
            ${iconSvg}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(haven.coordinates, { icon: havenIcon })
        .bindPopup(
          `<div class="p-3 text-xs min-w-[220px]">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${haven.category}</span>
              ${haven.open24Hours ? '<span class="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">24/7 OPEN</span>' : ''}
            </div>
            <p class="font-bold text-slate-900">${haven.name}</p>
            <p class="text-slate-500 mt-0.5">${haven.address}</p>
            ${haven.phone ? `<p class="mt-2 text-indigo-600 font-medium">📞 ${haven.phone}</p>` : ''}
          </div>`
        )
        .addTo(group);
    });

    // 6. Render Road Hazards
    roadHazards.forEach((hazard) => {
      if (activeHavenFilter !== 'all' && activeHavenFilter !== 'hazard') return;

      const hazardIcon = L.divIcon({
        className: 'custom-hazard-pin',
        html: `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 border-2 border-white shadow-md text-white">
            <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(hazard.coordinates, { icon: hazardIcon })
        .bindPopup(
          `<div class="p-3 text-xs min-w-[210px]">
            <div class="flex items-center gap-1.5 text-rose-600 font-bold mb-1">
              <span>⚠ ${hazard.title}</span>
            </div>
            <p class="text-slate-600">${hazard.description}</p>
            <p class="text-slate-400 text-[10px] mt-1.5">Reported: ${hazard.reportedAt}</p>
          </div>`
        )
        .addTo(group);
    });

    // Auto-fit bounds if we have routes
    if (routeA && routeA.coordinates.length > 0) {
      const bounds = L.latLngBounds(routeA.coordinates);
      if (routeB && routeB.coordinates.length > 0) {
        bounds.extend(routeB.coordinates);
      }
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [routeA, routeB, activeRouteId, safeHavens, roadHazards, activeHavenFilter]);

  // Controls Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleCenterUser = () => {
    mapInstanceRef.current?.setView(userLocation, 15, { animate: true });
  };
  const handleResetBearing = () => {
    mapInstanceRef.current?.setView(userLocation, 14, { animate: true });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-100 overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Haven Category Filter Bar */}
      <div className="absolute top-4 left-4 right-16 md:right-auto z-20 flex items-center gap-1.5 overflow-x-auto py-1 px-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md scrollbar-none">
        <button
          onClick={() => setActiveHavenFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
            activeHavenFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Markers
        </button>
        <button
          onClick={() => setActiveHavenFilter('police')}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
            activeHavenFilter === 'police'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Police ({safeHavens.filter((h) => h.category === 'police').length})
        </button>
        <button
          onClick={() => setActiveHavenFilter('hospital')}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
            activeHavenFilter === 'hospital'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          Hospitals
        </button>
        <button
          onClick={() => setActiveHavenFilter('fuel')}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
            activeHavenFilter === 'fuel'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          24/7 Fuel
        </button>
        <button
          onClick={() => setActiveHavenFilter('hazard')}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
            activeHavenFilter === 'hazard'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Hazards ({roadHazards.length})
        </button>
      </div>

      {/* Floating Right Map Ergonomic Control Stack (as in user screenshot) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
        {/* Bearing / Compass */}
        <button
          onClick={handleResetBearing}
          title="Reset View"
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-700 hover:text-indigo-600 active:scale-95 transition-all"
        >
          <Compass className="w-5 h-5" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-slate-50 active:scale-95 border-b border-slate-100 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Re-center */}
        <button
          onClick={handleCenterUser}
          title="Center on GPS Location"
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Map Layer Switcher (Standard vs Satellite toggle from screenshot) */}
      <div className="absolute bottom-5 left-4 z-20 flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md">
        <button
          onClick={() => setMapStyle('standard')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            mapStyle === 'standard'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            mapStyle === 'satellite'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapStyle('dark')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            mapStyle === 'dark'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Night
        </button>
      </div>

      {/* Infrastructure Color Coding Legend Toggle */}
      <div className="absolute bottom-5 right-4 z-20">
        {showLegend ? (
          <div className="p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-lg text-xs max-w-[240px]">
            <div className="flex items-center justify-between font-bold text-slate-800 pb-1.5 mb-2 border-b border-slate-100">
              <span>Road Classification</span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-700 text-[10px]"
              >
                Hide
              </button>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-blue-600 rounded"></span>
                <span className="text-slate-700">Highway & Well-Lit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-emerald-600 rounded"></span>
                <span className="text-slate-700">Forest / Canopy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-slate-900 rounded"></span>
                <span className="text-slate-700">Dark (Unlit) Stretch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 border-t-2 border-amber-600 border-dashed"></span>
                <span className="text-slate-700">Road Under Construction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 border-t-2 border-slate-400 border-dashed"></span>
                <span className="text-slate-700">Route B (Alternative)</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-md text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Legend
          </button>
        )}
      </div>
    </div>
  );
};
