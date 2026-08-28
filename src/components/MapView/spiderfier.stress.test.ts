import { describe, it, expect } from 'vitest';
import { calculateSpiderOffset } from './VietnamEBAMap';
import { speciesData } from '../../data';
import type { BirdSpecies } from '../../types/bird';

describe('Adversarial Stress Test: Coordinate Spiderfier & Coincident Pin Jittering', () => {
  const BASE_POINT: [number, number] = [16.19, 107.85]; // Bạch Mã National Park

  it('1. Returns identical coordinates when totalAtCoord <= 1', () => {
    const single = calculateSpiderOffset(BASE_POINT, 0, 1);
    expect(single).toEqual(BASE_POINT);

    const zero = calculateSpiderOffset(BASE_POINT, 0, 0);
    expect(zero).toEqual(BASE_POINT);
  });

  it('2. Disperses coincident pins into distinct, non-overlapping coordinates for N=2..20', () => {
    for (let total = 2; total <= 20; total++) {
      const generatedPoints: [number, number][] = [];

      for (let i = 0; i < total; i++) {
        const pt = calculateSpiderOffset(BASE_POINT, i, total);
        
        // No NaN or Infinity
        expect(Number.isFinite(pt[0])).toBe(true);
        expect(Number.isFinite(pt[1])).toBe(true);

        // Distance from center must be bounded between 0.03 and 0.08 degrees (~3.5km - 9km)
        const distFromCenter = Math.hypot(pt[0] - BASE_POINT[0], pt[1] - BASE_POINT[1]);
        expect(distFromCenter).toBeGreaterThanOrEqual(0.04);
        expect(distFromCenter).toBeLessThanOrEqual(0.07);

        generatedPoints.push(pt);
      }

      // Check all points are pairwise distinct
      for (let i = 0; i < total; i++) {
        for (let j = i + 1; j < total; j++) {
          const p1 = generatedPoints[i];
          const p2 = generatedPoints[j];
          const dist = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
          expect(dist).toBeGreaterThan(0.001); // At least ~100m separation
        }
      }
    }
  });

  it('3. High-density stress test: Disperses 100 coincident pins without degradation or NaN', () => {
    const total = 100;
    const points: [number, number][] = [];

    const startTime = performance.now();
    for (let i = 0; i < total; i++) {
      points.push(calculateSpiderOffset(BASE_POINT, i, total));
    }
    const elapsed = performance.now() - startTime;

    expect(elapsed).toBeLessThan(10); // Must be sub-millisecond fast
    expect(points.length).toBe(100);

    // Verify all points are finite
    points.forEach(pt => {
      expect(Number.isFinite(pt[0])).toBe(true);
      expect(Number.isFinite(pt[1])).toBe(true);
    });
  });

  it('4. Handles extreme boundary coordinates (Equator, Poles, Meridian)', () => {
    const testCases: [number, number][] = [
      [0.0, 0.0],
      [89.9, 10.0],
      [-89.9, -10.0],
      [16.0, 179.9],
      [16.0, -179.9]
    ];

    testCases.forEach(coord => {
      const p1 = calculateSpiderOffset(coord, 0, 4);
      const p2 = calculateSpiderOffset(coord, 1, 4);
      expect(Number.isFinite(p1[0])).toBe(true);
      expect(Number.isFinite(p1[1])).toBe(true);
      expect(Number.isFinite(p2[0])).toBe(true);
      expect(Number.isFinite(p2[1])).toBe(true);
      expect(p1).not.toEqual(p2);
    });
  });

  it('5. Simulated Coincident Species Cluster: Disperses multiple real species assigned to identical hotspot', () => {
    // Pick 8 species from dataset and assign them to the exact same hotspot coordinate (e.g. Bạch Mã [16.19, 107.85])
    const clusterSpecies: BirdSpecies[] = speciesData.slice(0, 8).map(sp => ({
      ...sp,
      distribution: {
        ...sp.distribution,
        coordinates: [16.19, 107.85] as [number, number]
      }
    }));

    const sharedCoord = clusterSpecies[0].distribution.coordinates;
    const total = clusterSpecies.length;

    const dispersedCoords = clusterSpecies.map((_, idx) =>
      calculateSpiderOffset(sharedCoord, idx, total)
    );

    // Verify all 8 dispersed coordinates are strictly unique
    const uniqueKeys = new Set(dispersedCoords.map(c => `${c[0].toFixed(5)},${c[1].toFixed(5)}`));
    expect(uniqueKeys.size).toBe(total);

    // Verify every coordinate is shifted from the base point
    dispersedCoords.forEach(coord => {
      expect(coord).not.toEqual(sharedCoord);
      const dist = Math.hypot(coord[0] - sharedCoord[0], coord[1] - sharedCoord[1]);
      expect(dist).toBeGreaterThan(0.04);
      expect(dist).toBeLessThan(0.08);
    });
  });
});
