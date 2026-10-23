export type RouteType = 'safest' | 'alternative';

export type SegmentType = 'highway_lit' | 'forest_canopy' | 'dark_unlit' | 'construction';

export interface RouteSegment {
  type: SegmentType;
  coordinates: [number, number][]; // [lat, lng]
  label: string;
  distanceKm: number;
  color: string;
  dashArray?: string;
}

export interface SafeHaven {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'fuel' | 'transit' | 'store247';
  coordinates: [number, number]; // [lat, lng]
  address: string;
  open24Hours: boolean;
  phone?: string;
  verified: boolean;
}

export interface RoadHazard {
  id: string;
  type: 'construction' | 'dark_stretch' | 'waterlogging' | 'isolated_area' | 'accident_prone';
  title: string;
  description: string;
  coordinates: [number, number];
  severity: 'low' | 'medium' | 'high';
  reportedAt: string;
}

export interface SafetyScoreBreakdown {
  lightingScore: number; // max 25
  publicSupportScore: number; // max 25
  telecomActivityScore: number; // max 20
  roadConditionPenalty: number; // up to -15
  forestDarkPenalty: number; // up to -20
  timeOfTravelBonusOrPenalty: number;
  totalScore: number; // 0 - 100
}

export interface RouteOption {
  id: string;
  name: string;
  type: RouteType;
  tagline: string;
  distanceKm: number;
  durationMin: number;
  score: number;
  scoreBreakdown: SafetyScoreBreakdown;
  lightingPct: number;
  cellularPct: number;
  safeHavensCount: number;
  darkStretchesCount: number;
  constructionZonesCount: number;
  coordinates: [number, number][]; // complete geojson path
  segments: RouteSegment[];
  summary: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  isPrimary: boolean;
}

export interface IncidentReport {
  id: string;
  title: string;
  category: 'unlit_road' | 'harassment' | 'suspicious_activity' | 'pothole' | 'accident' | 'police_assistance';
  locationName: string;
  coordinates: [number, number];
  description: string;
  upvotes: number;
  timestamp: string;
  anonymous: boolean;
  status: 'verified' | 'investigating' | 'resolved';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}
