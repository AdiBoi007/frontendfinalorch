import type { BrainCategory } from "../brain.types";
import { fibonacciSphere } from "./fibonacciSphere";

const CATEGORY_BANDS: Record<BrainCategory, { lat: number; lng: number }> = {
  doc: { lat: 38, lng: -72 },
  decision: { lat: 8, lng: -148 },
  comms: { lat: 24, lng: 58 },
  team: { lat: -36, lng: 92 },
  change: { lat: -28, lng: -38 }
};

function hashId(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deterministicPosition(id: string, category: BrainCategory, index: number, count: number) {
  const base = CATEGORY_BANDS[category];
  const distributed = fibonacciSphere(index, count);
  const hash = hashId(id);
  const jitterLat = (((hash & 255) / 255) - 0.5) * 18;
  const jitterLng = ((((hash >> 8) & 255) / 255) - 0.5) * 34;

  return {
    lat: Math.max(-68, Math.min(68, base.lat + distributed.lat * 0.08 + jitterLat)),
    lng: ((base.lng + distributed.lng * 0.08 + jitterLng + 540) % 360) - 180
  };
}
