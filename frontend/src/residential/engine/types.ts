export type Region = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Orientation = 'TOP' | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'BOTTOM';
export type WallOrientation = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type StructureType = 'wood_conventional' | 'wood_2x4' | 'steel' | 'rc';
export type WallInputMethod = 'dimensions' | 'direct_area';
export type AdjacencyType = 'exterior' | 'ground' | 'unheated_space' | 'underfloor' | 'separator' | 'separator_zero';
export type OpeningType = 'window' | 'door';
export type SashType = 'metal' | 'metal_resin' | 'resin' | 'wood';

export interface WallSegment {
  id: string;
  orientation: WallOrientation;
  input_method: WallInputMethod;
  width?: number;
  height?: number;
  area_gross?: number;
  insulation_type: string;
  insulation_thickness?: number;
  u_value?: number;
  adjacency?: AdjacencyType;
}

export interface Opening {
  id: string;
  symbol?: string;
  type: OpeningType;
  orientation: WallOrientation;
  width: number;
  height: number;
  quantity?: number;
  sash_type?: SashType;
  glass_type?: string;
  product_id?: string;
  product_name?: string;
  adjacency?: string;
  u_value?: number;
  eta_d_H?: number;
  eta_d_C?: number;
  cost_per_unit?: number;
}

export interface RoofPart {
  area: number;
  u_value?: number;
  adjacency?: string;
}

export interface CeilingPart {
  area: number;
  u_value?: number;
  adjacency?: string;
}

export interface FloorPart {
  area: number;
  u_value?: number;
  adjacency?: string;
}

export interface FoundationPart {
  length: number;
  psi_value?: number;
  h_value?: number;
}

export interface ResidentialProject {
  id: string;
  name: string;
  region: Region;
  structure: StructureType;
  stories: number;
  walls: WallSegment[];
  openings: Opening[];
  roof?: RoofPart | null;
  ceiling?: CeilingPart | null;
  floor?: FloorPart | null;
  foundation?: FoundationPart | null;
  a_a?: number;
}

export type EnvelopePartType = 'wall' | 'window' | 'door' | 'roof' | 'ceiling' | 'floor' | 'foundation';

export interface EnvelopePart {
  type: EnvelopePartType;
  orientation: Orientation | string;
  area: number;
  u_value: number;
  h_value: number;
  adjacency?: string;
  sash_type?: string;
  glass_type?: string;
  eta_d_H?: number;
  eta_d_C?: number;
  psi_value?: number;
  length?: number;
}

export interface EnvelopeInput {
  region: number;
  a_env: number;
  a_a: number;
  parts: EnvelopePart[];
}

export interface AreaRow {
  gross: number;
  openings: number;
  net: number;
}

export interface AreaSummary {
  by_orientation: Record<WallOrientation, AreaRow>;
  gross_total: number;
  opening_total: number;
  net_total: number;
}

export interface ProductSize {
  code: string;
  w: number;
  h: number;
  cost: number;
}

export interface ProductSpec {
  id: string;
  name: string;
  series: string;
  sash_type: SashType;
  glass_type: string;
  u_value: number;
  eta_d_h: number;
  eta_d_c: number;
  cost_per_m2: number;
  sizes: ProductSize[];
}

export interface OpeningThermalSpec {
  source: 'product' | 'combination' | 'fallback';
  product?: ProductSpec;
  u_value: number;
  eta_d_H: number;
  eta_d_C: number;
  cost_per_m2?: number;
}

export interface PartDetail extends EnvelopePart {
  heat_loss: number;
  solar_gain_cooling: number;
}

export interface ResidentialResult {
  envelope_input: EnvelopeInput;
  ua_value: number;
  eta_a_c: number;
  eta_a_h: number;
  grade: 4 | 5 | 6 | 7 | null;
  zeh_ok: boolean;
  thresholds: Record<number, number>;
  parts_detail: PartDetail[];
  area_summary: AreaSummary;
  window_cost_total: number;
}

export interface VerifyState {
  loading?: boolean;
  ok?: boolean;
  message?: string;
}

export const ORIENTATIONS: WallOrientation[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export const STRUCTURE_TYPES: StructureType[] = ['wood_conventional', 'wood_2x4', 'steel', 'rc'];

export const WALL_INPUT_METHODS: WallInputMethod[] = ['dimensions', 'direct_area'];

export const ADJACENCY_TYPES: AdjacencyType[] = ['exterior', 'ground', 'unheated_space', 'underfloor'];

export const OPENING_TYPES: OpeningType[] = ['window', 'door'];

export const SASH_TYPES: SashType[] = ['metal', 'metal_resin', 'resin', 'wood'];
