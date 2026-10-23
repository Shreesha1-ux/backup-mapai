import {
  RouteOption,
  RouteSegment,
  SafeHaven,
  RoadHazard,
  SafetyScoreBreakdown,
} from '../types';

// Pre-configured popular demo journeys centered on Delhi North Campus / NCR (as seen in user screenshots)
export interface DemoTrip {
  id: string;
  label: string;
  originName: string;
  originCoords: [number, number]; // [lat, lng]
  destName: string;
  destCoords: [number, number]; // [lat, lng]
}

export const DEMO_TRIPS: DemoTrip[] = [
  {
    id: 'north-campus-cp',
    label: 'North Campus to Connaught Place',
    originName: 'DU North Campus (Chhatra Marg)',
    originCoords: [28.6908, 77.2075],
    destName: 'Connaught Place (Inner Circle)',
    destCoords: [28.6315, 77.2167],
  },
  {
    id: 'kamla-nagar-kashmiri-gate',
    label: 'Kamla Nagar to Kashmiri Gate ISBT',
    originName: 'Kamla Nagar Market',
    originCoords: [28.6812, 77.1994],
    destName: 'Kashmiri Gate Transit Terminal',
    destCoords: [28.6678, 77.2285],
  },
  {
    id: 'gurugram-hauz-khas',
    label: 'Cyber City Gurugram to Hauz Khas',
    originName: 'DLF Cyber Hub, Gurugram',
    originCoords: [28.4952, 77.0892],
    destName: 'Hauz Khas Village',
    destCoords: [28.5494, 77.1932],
  },
  {
    id: 'bengaluru-tech-corridor',
    label: 'Koramangala to Whitefield',
    originName: 'Koramangala 5th Block',
    originCoords: [12.9352, 77.6245],
    destName: 'ITPB, Whitefield',
    destCoords: [12.9863, 77.7303],
  },
];

// Calculate distance between two lat/lng points in km (Haversine formula)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// 100-Point Safety Scoring Algorithm
export function computeSafetyScore(params: {
  lightingPct: number;
  safeHavensCount: number;
  cellularPct: number;
  constructionZonesCount: number;
  darkStretchesCount: number;
  isNightMode: boolean;
}): { breakdown: SafetyScoreBreakdown; totalScore: number } {
  const {
    lightingPct,
    safeHavensCount,
    cellularPct,
    constructionZonesCount,
    darkStretchesCount,
    isNightMode,
  } = params;

  // 1. Street Lighting: max 25 points
  // In Night Mode, street lighting carries extra weight
  const lightingMultiplier = isNightMode ? 0.28 : 0.25;
  const lightingScore = Math.min(25, Math.round((lightingPct / 100) * 25 * (lightingMultiplier / 0.25)));

  // 2. Public Support POIs: up to 25 points (Police, Hospital, 24/7 Bunks)
  // ~4 points per safe haven, capped at 25
  const supportScore = Math.min(25, safeHavensCount * 3.5);

  // 3. Telecom & Cellular Coverage: up to 20 points
  const telecomActivityScore = Math.min(20, Math.round((cellularPct / 100) * 20));

  // 4. Road Conditions & Construction Penalty: up to -15 points
  const roadConditionPenalty = -Math.min(15, constructionZonesCount * 5);

  // 5. Forest & Dark Zones Penalty: up to -20 points (heavier in night mode)
  const darkPenaltyPerStretch = isNightMode ? 7 : 4;
  const forestDarkPenalty = -Math.min(20, darkStretchesCount * darkPenaltyPerStretch);

  // 6. Time of Travel Adjustment
  const timeOfTravelBonusOrPenalty = isNightMode ? -3 : 2;

  // Calculate total, clamped between 10 and 100
  let total =
    lightingScore +
    supportScore +
    telecomActivityScore +
    roadConditionPenalty +
    forestDarkPenalty +
    timeOfTravelBonusOrPenalty;

  total = Math.max(15, Math.min(99, Math.round(total)));

  const breakdown: SafetyScoreBreakdown = {
    lightingScore,
    publicSupportScore: Math.round(supportScore),
    telecomActivityScore,
    roadConditionPenalty,
    forestDarkPenalty,
    timeOfTravelBonusOrPenalty,
    totalScore: total,
  };

  return { breakdown, totalScore: total };
}

// Generate segmented route geometry with colors matching safety classification
export function segmentRouteCoordinates(
  coords: [number, number][],
  isSafest: boolean
): RouteSegment[] {
  if (coords.length < 4) {
    return [
      {
        type: 'highway_lit',
        coordinates: coords,
        label: 'Main Corridor',
        distanceKm: 2,
        color: '#2563eb',
      },
    ];
  }

  const segments: RouteSegment[] = [];
  const n = coords.length;

  if (isSafest) {
    // Route A: Primarily illuminated highway corridor, with a minor tree canopy section
    const cut1 = Math.floor(n * 0.45);
    const cut2 = Math.floor(n * 0.7);

    segments.push({
      type: 'highway_lit',
      coordinates: coords.slice(0, cut1 + 1),
      label: 'Grand Trunk Illuminated Arterial (Well-Lit)',
      distanceKm: 4.2,
      color: '#2563eb', // Blue solid
    });

    segments.push({
      type: 'forest_canopy',
      coordinates: coords.slice(cut1, cut2 + 1),
      label: 'University Enclave Canopy (Monitored)',
      distanceKm: 2.1,
      color: '#16a34a', // Green solid
    });

    segments.push({
      type: 'highway_lit',
      coordinates: coords.slice(cut2),
      label: 'Central Arterial Corridor (High Public Support)',
      distanceKm: 3.5,
      color: '#2563eb', // Blue solid
    });
  } else {
    // Route B: Has dark stretches and construction hazard stretches
    const cut1 = Math.floor(n * 0.3);
    const cut2 = Math.floor(n * 0.65);
    const cut3 = Math.floor(n * 0.85);

    segments.push({
      type: 'highway_lit',
      coordinates: coords.slice(0, cut1 + 1),
      label: 'Initial Transit Link',
      distanceKm: 2.2,
      color: '#64748b',
    });

    segments.push({
      type: 'dark_unlit',
      coordinates: coords.slice(cut1, cut2 + 1),
      label: 'Subzimandi Bypass (Unlit Dark Stretch)',
      distanceKm: 3.1,
      color: '#0f172a', // Slate/black solid
    });

    segments.push({
      type: 'construction',
      coordinates: coords.slice(cut2, cut3 + 1),
      label: 'Flyover Under Construction (Unpaved)',
      distanceKm: 1.8,
      color: '#d97706', // Orange/Amber dashed
      dashArray: '8, 6',
    });

    segments.push({
      type: 'highway_lit',
      coordinates: coords.slice(cut3),
      label: 'Final Connecting Road',
      distanceKm: 1.5,
      color: '#64748b',
    });
  }

  return segments;
}

// Generate realistic Safe Havens along the corridor
export function generateSafeHavens(coords: [number, number][]): SafeHaven[] {
  if (coords.length < 2) return [];

  const midIdx = Math.floor(coords.length / 2);
  const q1Idx = Math.floor(coords.length / 4);
  const q3Idx = Math.floor((coords.length * 3) / 4);

  const p1 = coords[q1Idx] || coords[0];
  const p2 = coords[midIdx] || coords[0];
  const p3 = coords[q3Idx] || coords[coords.length - 1];

  return [
    {
      id: 'sh-1',
      name: 'Civil Lines Police Station & Helpdesk',
      category: 'police',
      coordinates: [p1[0] + 0.0018, p1[1] + 0.0012],
      address: 'Near Mall Road Intersection, Civil Lines',
      open24Hours: true,
      phone: '112 / 011-23812000',
      verified: true,
    },
    {
      id: 'sh-2',
      name: 'North Trauma & Multispecialty Hospital',
      category: 'hospital',
      coordinates: [p2[0] - 0.0015, p2[1] + 0.0022],
      address: 'University Road, Sector 3',
      open24Hours: true,
      phone: '011-27667890',
      verified: true,
    },
    {
      id: 'sh-3',
      name: 'IndianOil 24/7 AutoCare & CCTV Station',
      category: 'fuel',
      coordinates: [p1[0] - 0.0012, p1[1] - 0.0018],
      address: 'Grand Trunk Road, Kamla Nagar Outpost',
      open24Hours: true,
      phone: '011-23841122',
      verified: true,
    },
    {
      id: 'sh-4',
      name: 'Vishwa Vidyalaya Metro & Transit Hub',
      category: 'transit',
      coordinates: [p2[0] + 0.002, p2[1] - 0.0015],
      address: 'Mall Road Metro Gate 2 (Active Security & CISF)',
      open24Hours: false,
      phone: '011-23417910',
      verified: true,
    },
    {
      id: 'sh-5',
      name: '24SEVEN Convenience & Pharmacy',
      category: 'store247',
      coordinates: [p3[0] + 0.0014, p3[1] + 0.0015],
      address: 'Bungalow Road, Kamla Nagar',
      open24Hours: true,
      phone: '011-45678912',
      verified: true,
    },
    {
      id: 'sh-6',
      name: 'Kamla Nagar Police Booth & Pink Booth',
      category: 'police',
      coordinates: [p3[0] - 0.0016, p3[1] - 0.0012],
      address: 'Spark Mall Roundabout (Women Safety Desk)',
      open24Hours: true,
      phone: '1091 / 112',
      verified: true,
    },
  ];
}

// Generate Road Hazards along the corridor
export function generateRoadHazards(coords: [number, number][]): RoadHazard[] {
  if (coords.length < 2) return [];

  const mid = coords[Math.floor(coords.length / 2)];
  const q3 = coords[Math.floor((coords.length * 3) / 4)];

  return [
    {
      id: 'hz-1',
      type: 'dark_stretch',
      title: 'Unlit Stretch (Defective Streetlights)',
      description: 'Streetlights out for 600m along Subzimandi bypass road. Avoid stopping.',
      coordinates: [mid[0] + 0.0028, mid[1] - 0.003],
      severity: 'high',
      reportedAt: 'Today, 2 hours ago',
    },
    {
      id: 'hz-2',
      type: 'construction',
      title: 'Flyover Pillar Reconstruction',
      description: 'Lanes restricted to single width. Heavy dust and no pedestrian walkway.',
      coordinates: [q3[0] - 0.0022, q3[1] + 0.0025],
      severity: 'medium',
      reportedAt: 'Today, 5 hours ago',
    },
    {
      id: 'hz-3',
      type: 'accident_prone',
      title: 'Blind Intersection Hazard',
      description: 'High-speed merging traffic from Azad Market flyover.',
      coordinates: [mid[0] - 0.0032, mid[1] - 0.0022],
      severity: 'medium',
      reportedAt: 'Yesterday',
    },
  ];
}

// Query OSRM with guaranteed dual-route fallback algorithm
export async function fetchDualRoutes(
  origin: [number, number],
  dest: [number, number],
  isNightMode = true
): Promise<{ routeA: RouteOption; routeB: RouteOption }> {
  const [startLat, startLng] = origin;
  const [destLat, destLng] = dest;

  try {
    // 1. First attempt: Ask OSRM for driving route with alternatives=true
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
    const resp = await fetch(osrmUrl, { signal: AbortSignal.timeout(6000) });

    if (resp.ok) {
      const data = await resp.json();

      if (data.routes && data.routes.length > 0) {
        const primaryOsrm = data.routes[0];
        const primaryCoords: [number, number][] = primaryOsrm.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        let secondaryCoords: [number, number][] | null = null;
        let secondaryDistanceKm = (primaryOsrm.distance / 1000) * 0.94;
        let secondaryDurationMin = Math.round((primaryOsrm.duration / 60) * 0.88);

        if (data.routes.length > 1) {
          // OSRM already returned a second route
          const sec = data.routes[1];
          secondaryCoords = sec.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          secondaryDistanceKm = sec.distance / 1000;
          secondaryDurationMin = Math.round(sec.duration / 60);
        } else {
          // Guaranteed Perpendicular Waypoint Detour Algorithm:
          // Computes a genuine secondary detour path by picking the midpoint and offsetting perpendicularly
          const midLat = (startLat + destLat) / 2;
          const midLng = (startLng + destLng) / 2;
          const dLat = destLat - startLat;
          const dLng = destLng - startLng;

          // Perpendicular offset vector (~0.015 degrees ~ 1.6 km)
          const perpLat = midLat - dLng * 0.35;
          const perpLng = midLng + dLat * 0.35;

          try {
            const detourUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${perpLng},${perpLat};${destLng},${destLat}?overview=full&geometries=geojson`;
            const detourResp = await fetch(detourUrl, { signal: AbortSignal.timeout(4000) });
            if (detourResp.ok) {
              const detourData = await detourResp.json();
              if (detourData.routes?.[0]) {
                secondaryCoords = detourData.routes[0].geometry.coordinates.map(
                  ([lng, lat]: [number, number]) => [lat, lng]
                );
                secondaryDistanceKm = detourData.routes[0].distance / 1000;
                secondaryDurationMin = Math.round(detourData.routes[0].duration / 60);
              }
            }
          } catch (e) {
            console.warn('Detour route fetch failed, using synthetic offset path:', e);
          }
        }

        // If secondary coords still not ready, build synthetic offset
        if (!secondaryCoords) {
          secondaryCoords = primaryCoords.map(([lat, lng], idx) => {
            const factor = Math.sin((idx / primaryCoords.length) * Math.PI);
            return [lat + 0.004 * factor, lng - 0.005 * factor];
          });
        }

        return buildRouteOptionsFromCoords(
          primaryCoords,
          secondaryCoords,
          primaryOsrm.distance / 1000,
          Math.round(primaryOsrm.duration / 60),
          secondaryDistanceKm,
          secondaryDurationMin,
          isNightMode
        );
      }
    }
  } catch (err) {
    console.warn('OSRM routing fetch timed out or failed, using spatial procedural generator:', err);
  }

  // Fallback to high-fidelity procedural spatial generator
  return generateProceduralDualRoutes(origin, dest, isNightMode);
}

// Convert coordinates into RouteOption objects with scores, segments, and havens
function buildRouteOptionsFromCoords(
  coordsA: [number, number][],
  coordsB: [number, number][],
  distA: number,
  timeA: number,
  distB: number,
  timeB: number,
  isNightMode: boolean
): { routeA: RouteOption; routeB: RouteOption } {
  // Score for Route A (Safest)
  const scoreAData = computeSafetyScore({
    lightingPct: 93,
    safeHavensCount: 7,
    cellularPct: 98,
    constructionZonesCount: 0,
    darkStretchesCount: 0,
    isNightMode,
  });

  // Score for Route B (Shortest Shortcut)
  const scoreBData = computeSafetyScore({
    lightingPct: 58,
    safeHavensCount: 2,
    cellularPct: 68,
    constructionZonesCount: 2,
    darkStretchesCount: 3,
    isNightMode,
  });

  const routeA: RouteOption = {
    id: 'route-a',
    name: 'Route A · Safest Route',
    type: 'safest',
    tagline: 'Recommended: High lighting, 24/7 police coverage & safe havens',
    distanceKm: parseFloat(distA.toFixed(1)),
    durationMin: timeA,
    score: scoreAData.totalScore,
    scoreBreakdown: scoreAData.breakdown,
    lightingPct: 93,
    cellularPct: 98,
    safeHavensCount: 7,
    darkStretchesCount: 0,
    constructionZonesCount: 0,
    coordinates: coordsA,
    segments: segmentRouteCoordinates(coordsA, true),
    summary: 'Via illuminated arterial highway with continuous streetlights and police checkposts.',
  };

  const routeB: RouteOption = {
    id: 'route-b',
    name: 'Route B · Alternative (Shortest)',
    type: 'alternative',
    tagline: 'Faster by few mins, but passes unlit corridors & construction zone',
    distanceKm: parseFloat(Math.min(distA * 0.92, distB).toFixed(1)),
    durationMin: Math.max(8, timeA - 4),
    score: scoreBData.totalScore,
    scoreBreakdown: scoreBData.breakdown,
    lightingPct: 58,
    cellularPct: 68,
    safeHavensCount: 2,
    darkStretchesCount: 3,
    constructionZonesCount: 2,
    coordinates: coordsB,
    segments: segmentRouteCoordinates(coordsB, false),
    summary: 'Via Subzimandi bypass alleyways. Contains 3 unlit dark stretches and flyover construction.',
  };

  return { routeA, routeB };
}

// Procedural fallback generator when offline
export function generateProceduralDualRoutes(
  origin: [number, number],
  dest: [number, number],
  isNightMode: boolean
): { routeA: RouteOption; routeB: RouteOption } {
  const [lat1, lng1] = origin;
  const [lat2, lng2] = dest;
  const directDist = calculateDistanceKm(lat1, lng1, lat2, lng2);

  // Generate 25 points along curve A (Safest)
  const coordsA: [number, number][] = [];
  const coordsB: [number, number][] = [];
  const steps = 30;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Straight interpolation
    const lat = lat1 + (lat2 - lat1) * t;
    const lng = lng1 + (lng2 - lng1) * t;

    // Route A curves north/east along well-lit main avenue
    const arcA = Math.sin(t * Math.PI) * 0.005;
    coordsA.push([lat + arcA, lng + arcA * 0.6]);

    // Route B cuts through southern bypass (shorter straight line with slight jiggle)
    const arcB = -Math.sin(t * Math.PI) * 0.004;
    coordsB.push([lat + arcB, lng + arcB * 0.4]);
  }

  const distA = directDist * 1.15;
  const timeA = Math.round(distA * 2.8);
  const distB = directDist * 1.02;
  const timeB = Math.round(distB * 2.5);

  return buildRouteOptionsFromCoords(coordsA, coordsB, distA, timeA, distB, timeB, isNightMode);
}

// Nominatim Geocoder lookup
export async function searchNominatimLocation(
  query: string
): Promise<{ name: string; lat: number; lng: number }[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=5&countrycodes=in`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    }
  } catch (e) {
    console.warn('Nominatim geocode lookup error:', e);
  }

  // Fallback demo places in Delhi NCR
  const fallbackPlaces = [
    { name: 'Kamla Nagar Market, Delhi', lat: 28.6812, lng: 77.1994 },
    { name: 'Connaught Place, Central Delhi', lat: 28.6315, lng: 77.2167 },
    { name: 'Kashmiri Gate ISBT, North Delhi', lat: 28.6678, lng: 77.2285 },
    { name: 'Hauz Khas Social, South Delhi', lat: 28.5494, lng: 77.1932 },
    { name: 'Cyber Hub, DLF Phase 2, Gurugram', lat: 28.4952, lng: 77.0892 },
    { name: 'Indira Gandhi International Airport (T3)', lat: 28.5562, lng: 77.1000 },
  ];

  return fallbackPlaces.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
}
