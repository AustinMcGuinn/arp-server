import type { Vector3, Vector4 } from "@framework/types";

/**
 * Calculate distance between two 3D points
 */
export function distance(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate 2D distance (ignoring Z axis)
 */
export function distance2d(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is within a certain distance of another
 */
export function isNear(a: Vector3, b: Vector3, maxDistance: number): boolean {
  return distance(a, b) <= maxDistance;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Convert heading to direction vector
 */
export function headingToDirection(heading: number): Vector3 {
  const rad = (heading * Math.PI) / 180;
  return {
    x: -Math.sin(rad),
    y: Math.cos(rad),
    z: 0,
  };
}

/**
 * Convert Vector4 (with heading) to Vector3
 */
export function vec4ToVec3(v: Vector4): Vector3 {
  return { x: v.x, y: v.y, z: v.z };
}

/**
 * Create Vector3
 */
export function vec3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

/**
 * Create Vector4
 */
export function vec4(x: number, y: number, z: number, w: number): Vector4 {
  return { x, y, z, w };
}
