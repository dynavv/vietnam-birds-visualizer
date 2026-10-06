import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Layers,
  Trees,
  Plus,
  Minus,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { BirdSpecies, EBARegion } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { vietnamBoundaryData } from '../../data';
import { EndemicFocusCard } from './EndemicFocusCard';
import { EBARegionLegend } from './EBARegionLegend';
import { EBAMobileBottomSheet, type SheetSnapPoint } from './EBAMobileBottomSheet';
import { MobileFloatingSpeciesCard } from './MobileFloatingSpeciesCard';
import { GeminiNaturalistModal } from '../AI/GeminiNaturalistModal';

// Center, zoom and bounds defaults for Vietnam overview
const VIETNAM_CENTER: [number, number] = [16.0, 107.5];
const VIETNAM_DEFAULT_ZOOM = 6;
const VIETNAM_MIN_ZOOM = 4.5; // Zoom out toàn cảnh Việt Nam bao quát trọn vẹn biển đảo
const VIETNAM_MAX_ZOOM = 13; // Zoom in cấp độ sinh cảnh vùng/khu bảo tồn (tránh hiểu lầm tọa độ)
const VIETNAM_FULL_BOUNDS: [[number, number], [number, number]] = [[6.8, 102.0], [23.8, 116.5]];

// Type-guard to validate that coordinates are valid non-NaN numbers
export const isValidLatLng = (coords: unknown): coords is [number, number] => {
  return (
    Array.isArray(coords) &&
    coords.length >= 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number' &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1]) &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1])
  );
};

// Phạm vi kéo mở rộng thoải mái cho toàn bộ vùng Tây Bắc, Đông Bắc, Biển Đông và Tây Nam Bộ
const VIETNAM_MAX_BOUNDS: [[number, number], [number, number]] = [
  [4.0, 96.0], // Tây Nam (Vịnh Thái Lan, Cà Mau, Biển Tây)
  [27.0, 122.0] // Đông Bắc (Điện Biên, Fansipan, Hà Giang, Hoàng Sa, Trường Sa)
];

// Sovereign maritime territories of Vietnam
const SOVEREIGNTY_POINTS = [
  {
    name: 'Quần đảo Hoàng Sa',
    subname: '(Việt Nam)',
    coordinates: [16.5, 112.0] as [number, number]
  },
  {
    name: 'Quần đảo Trường Sa',
    subname: '(Việt Nam)',
    coordinates: [9.5, 114.0] as [number, number]
  }
];

// DivIcon Caches to eliminate memory churn and DOM recreation thrashing
const iconCache = new Map<string, L.DivIcon>();

// Helper to create custom Leaflet divIcon for sovereign markers (cached)
const getSovereigntyDivIcon = (name: string, subname: string) => {
  const key = `sov-${name}-${subname}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: 'custom-sovereignty-marker',
      html: `
        <div class="bg-paper-100/90 backdrop-blur-sm border border-paper-border/90 px-2.5 py-1 rounded-lg shadow-sm text-center pointer-events-none select-none">
          <div class="font-serif font-bold text-xs text-ink-900 tracking-wide">${name}</div>
          <div class="font-sans text-[10px] text-natural-forest font-semibold italic">${subname}</div>
        </div>
      `,
      iconSize: [140, 36],
      iconAnchor: [70, 18]
    });
    iconCache.set(key, icon);
  }
  return icon;
};

// Helper to create custom EBA DivIcon (cached)
const getEBADivIcon = (regionName: string, index: number, isSelected: boolean) => {
  const key = `eba-${regionName}-${index}-${isSelected}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: 'custom-eba-marker',
      html: `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <div class="w-8 h-8 rounded-full ${
            isSelected
              ? 'bg-natural-terracotta ring-4 ring-natural-terracotta/30 scale-110'
              : 'bg-natural-moss ring-2 ring-paper-50'
          } shadow-natural text-paper-50 flex items-center justify-center font-serif font-bold text-xs transform transition-transform hover:scale-115">
            ${index + 1}
          </div>
          <div class="mt-1 bg-paper-100/95 backdrop-blur-sm border border-paper-border px-2 py-0.5 rounded shadow-sm text-[11px] font-serif font-semibold text-ink-900 whitespace-nowrap pointer-events-none opacity-90 group-hover:opacity-100">
            ${regionName}
          </div>
        </div>
      `,
      iconSize: [32, 48],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
    iconCache.set(key, icon);
  }
  return icon;
};

// Helper to create Selected Species DivIcon (cached)
const getSelectedSpeciesDivIcon = (species: BirdSpecies) => {
  const key = `sel-${species.id}-${species.isEndemic}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: 'custom-species-selected-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute -inset-2.5 rounded-full ${species.isEndemic ? 'bg-amber-400/40' : 'bg-natural-moss/40'} animate-ping"></span>
          <span class="absolute -inset-1 rounded-full ${species.isEndemic ? 'bg-amber-400/30' : 'bg-natural-moss/30'}"></span>
          <div class="relative w-10 h-10 rounded-full ${
            species.isEndemic
              ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 ring-2 ring-amber-300'
              : 'bg-gradient-to-br from-natural-moss to-natural-forest ring-2 ring-natural-moss/50'
          } border-2 border-paper-50 shadow-natural-lg flex items-center justify-center text-paper-50 transform hover:scale-110 transition-transform">
            ${
              species.isEndemic
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-white drop-shadow-sm">
                    <path d="M16 7h.01"/>
                    <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 18z"/>
                    <path d="m2 18 7-7"/>
                    <path d="m5 18 5-5"/>
                    <path d="m8 18 3-3"/>
                  </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="transform -rotate-12">
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                    <line x1="16" y1="8" x2="2" y2="22"/>
                    <line x1="17.5" y1="15" x2="9" y2="15"/>
                  </svg>`
            }
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
    iconCache.set(key, icon);
  }
  return icon;
};

// Helper to create regular Species DivIcon (cached)
const getSpeciesDivIcon = (species: BirdSpecies) => {
  const key = `sp-${species.id}-${species.isEndemic}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: 'custom-species-marker',
      html: `
        <div class="w-6 h-6 rounded-full ${
          species.isEndemic ? 'bg-gradient-to-br from-amber-400 to-amber-600 ring-1.5 ring-amber-300' : 'bg-natural-forest'
        } border-2 border-paper-50 shadow-md flex items-center justify-center text-paper-50 transform hover:scale-125 transition-transform cursor-pointer">
          ${
            species.isEndemic
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 7h.01"/>
                  <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 18z"/>
                </svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transform -rotate-12">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                  <line x1="16" y1="8" x2="2" y2="22"/>
                  <line x1="17.5" y1="15" x2="9" y2="15"/>
                </svg>`
          }
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
    iconCache.set(key, icon);
  }
  return icon;
};

// Helper to disperse overlapping markers in a spider radial pattern
export const calculateSpiderOffset = (
  coords: [number, number] | undefined | null,
  index: number = 0,
  totalAtCoord: number = 1
): [number, number] => {
  if (!isValidLatLng(coords)) {
    return VIETNAM_CENTER;
  }
  if (!totalAtCoord || typeof totalAtCoord !== 'number' || !Number.isFinite(totalAtCoord) || totalAtCoord <= 1) {
    return coords;
  }
  const safeIndex = (typeof index === 'number' && Number.isFinite(index)) ? index : 0;
  // Offset radius in degrees (~4-8km geographically)
  const angle = (2 * Math.PI / totalAtCoord) * safeIndex;
  const radius = 0.045 + (safeIndex % 2 === 1 ? 0.015 : 0);
  const latOffset = Math.sin(angle) * radius;
  const lngOffset = Math.cos(angle) * radius;
  const newLat = coords[0] + latOffset;
  const newLng = coords[1] + lngOffset;
  if (!Number.isFinite(newLat) || !Number.isFinite(newLng) || isNaN(newLat) || isNaN(newLng)) {
    return coords;
  }
  return [newLat, newLng];
};

// Inner Map Controller component to handle flyTo animations with cancellation
interface MapFlyToControllerProps {
  target: {
    coordinates?: [number, number];
    zoom?: number;
    bounds?: [[number, number], [number, number]];
  } | null;
  isMobileOffset?: boolean;
}

const MapFlyToController: React.FC<MapFlyToControllerProps> = ({ target, isMobileOffset = false }) => {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    if (target.bounds) {
      try {
        if (map && (map as unknown as { _mapPane?: HTMLElement })._mapPane) {
          map.stop();
        }
        map.fitBounds(target.bounds, { padding: [15, 15], maxZoom: 7, animate: true, duration: 1.2 });
      } catch {
        // Safe fallback if map is being initialized
      }
      return;
    }

    if (target.coordinates && isValidLatLng(target.coordinates)) {
      const zoom = (typeof target.zoom === 'number' && Number.isFinite(target.zoom) && !isNaN(target.zoom)) ? target.zoom : VIETNAM_DEFAULT_ZOOM;
      try {
        if (map && (map as unknown as { _mapPane?: HTMLElement })._mapPane) {
          map.stop();
        }
        if (isMobileOffset && typeof map.project === 'function' && typeof map.unproject === 'function') {
          const point = map.project(target.coordinates, zoom);
          const mapSizeY = map.getSize ? map.getSize().y : 0;
          const offsetY = mapSizeY * 0.22; // Đẩy tâm camera xuống 22% để target nằm chính giữa 54% nửa trên màn hình
          const adjustedPoint = L.point(point.x, point.y + offsetY);
          const adjustedLatLng = map.unproject(adjustedPoint, zoom);
          map.flyTo(adjustedLatLng, zoom, {
            duration: 1.0,
            easeLinearity: 0.25
          });
        } else {
          map.flyTo(target.coordinates, zoom, {
            duration: 1.0,
            easeLinearity: 0.25
          });
        }
      } catch {
        // Safe fallback if map is being initialized
      }
    }
    return () => {
      try {
        if (map && (map as unknown as { _mapPane?: HTMLElement })._mapPane) {
          map.stop();
        }
      } catch {
        // Safe fallback if map unmounted
      }
    };
  }, [map, target, isMobileOffset]);

  return null;
};

// Map Resize Observer & Dynamic Invalidate Controller for Mobile & Responsive containers
const MapResizeController: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    // Initial invalidate after DOM layout stabilizes
    const timer1 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // Safe fallback
      }
    }, 150);

    const timer2 = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // Safe fallback
      }
    }, 600);

    const handleResize = () => {
      try {
        map.invalidateSize();
      } catch {
        // Safe fallback
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map]);

  return null;
};

// Interactive Zoom In / Zoom Out controller using Leaflet map instance
const MapZoomControls: React.FC = () => {
  const map = useMap();
  return (
    <div
      className="absolute bottom-20 left-4 z-[400] hidden md:flex flex-col gap-1.5 bg-paper-100/90 backdrop-blur-md p-1.5 rounded-xl border border-paper-border shadow-paper-card pointer-events-auto"
      data-testid="map-zoom-controls"
    >
      <button
        type="button"
        onClick={() => map.zoomIn()}
        title="Phóng to (+)"
        aria-label="Phóng to bản đồ"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-paper-200/80 hover:bg-natural-moss hover:text-paper-50 text-ink-800 text-sm font-bold transition-all border border-paper-border shadow-xs active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        title="Thu nhỏ (-)"
        aria-label="Thu nhỏ bản đồ"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-paper-200/80 hover:bg-natural-moss hover:text-paper-50 text-ink-800 text-sm font-bold transition-all border border-paper-border shadow-xs active:scale-95 cursor-pointer"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
};

export interface VietnamEBAMapProps {
  className?: string;
}

export const VietnamEBAMap: React.FC<VietnamEBAMapProps> = ({ className = '' }) => {
  const {
    selectedSpecies,
    selectSpecies,
    filteredSpecies,
    ebaRegions,
    allSpecies
  } = useTaxonomy();

  const [selectedEBARegionId, setSelectedEBARegionId] = useState<string | null>(null);
  const [showEBACircles, setShowEBACircles] = useState<boolean>(true);
  const [showAllSpeciesPins, setShowAllSpeciesPins] = useState<boolean>(true);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);
  const showNationalBoundary = true;
  const [flyTarget, setFlyTarget] = useState<{
    coordinates?: [number, number];
    zoom?: number;
    bounds?: [[number, number], [number, number]];
  } | null>(null);
  const [mobileSheetSnap, setMobileSheetSnap] = useState<SheetSnapPoint>('peek');
  const [isMobileSpeciesCardOpen, setIsMobileSpeciesCardOpen] = useState<boolean>(false);

  // Fly to selected species whenever it changes
  useEffect(() => {
    if (isValidLatLng(selectedSpecies?.distribution?.coordinates)) {
      setFlyTarget({
        coordinates: selectedSpecies.distribution.coordinates,
        zoom: 9
      });
    }
  }, [selectedSpecies]);

  // Handle region select from legend or map
  const handleSelectRegion = useCallback((region: EBARegion) => {
    setSelectedEBARegionId(prev => prev === region.id ? null : region.id);
    if (isValidLatLng(region.coordinates)) {
      setFlyTarget({
        coordinates: region.coordinates,
        zoom: typeof region.zoomLevel === 'number' && Number.isFinite(region.zoomLevel) ? region.zoomLevel : 9
      });
    }
  }, []);

  // Handle reset to full Vietnam overview
  const handleResetOverview = () => {
    setSelectedEBARegionId(null);
    setIsMobileSpeciesCardOpen(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      setFlyTarget({
        coordinates: [16.0, 107.5],
        zoom: 5.2
      });
    } else {
      setFlyTarget({
        bounds: VIETNAM_FULL_BOUNDS
      });
    }
  };

  // Tự động căn chỉnh lại tâm bản đồ về chính giữa toàn màn hình khi bấm X thu gọn tab về peek
  useEffect(() => {
    if (mobileSheetSnap === 'peek') {
      if (isValidLatLng(selectedSpecies?.distribution?.coordinates)) {
        setFlyTarget({
          coordinates: selectedSpecies.distribution.coordinates,
          zoom: 9
        });
      } else if (selectedEBARegionId) {
        const region = ebaRegions.find(r => r.id === selectedEBARegionId);
        if (region && isValidLatLng(region.coordinates)) {
          setFlyTarget({
            coordinates: region.coordinates,
            zoom: typeof region.zoomLevel === 'number' && Number.isFinite(region.zoomLevel) ? region.zoomLevel : 9
          });
        }
      }
    }
  }, [mobileSheetSnap, selectedSpecies, selectedEBARegionId, ebaRegions]);

  // Group species without selected species to avoid duplicate marker
  const otherSpeciesList = useMemo(() => {
    if (!selectedSpecies) return filteredSpecies;
    return filteredSpecies.filter(s => s.id !== selectedSpecies.id);
  }, [filteredSpecies, selectedSpecies]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Khi chon 1 loai chim tren mobile, tu dong thu gon EBA bottom sheet ve peek
  useEffect(() => {
    if (selectedSpecies && isMobile) {
      setMobileSheetSnap('peek');
    }
  }, [selectedSpecies, isMobile]);

  return (
    <div
      className={`relative w-full h-full flex-1 min-h-0 overflow-hidden bg-paper-100 ${className}`}
      data-testid="vietnam-eba-map"
    >
      {/* Leaflet MapContainer */}
      <MapContainer
        center={VIETNAM_CENTER}
        zoom={VIETNAM_DEFAULT_ZOOM}
        minZoom={VIETNAM_MIN_ZOOM}
        maxZoom={VIETNAM_MAX_ZOOM}
        maxBounds={VIETNAM_MAX_BOUNDS}
        maxBoundsViscosity={0.2}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%', background: '#FAF8F5' }}
      >
        {/* CartoDB Voyager TileLayer with authorized key */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY || 'cb1_2fry_1_3e9fcd71ed08a90121c82244'}`}
          subdomains={['a', 'b', 'c', 'd']}
        />

        <MapResizeController />
        <MapFlyToController
          target={flyTarget}
          isMobileOffset={isMobile && mobileSheetSnap !== 'peek'}
        />
        <MapZoomControls />

        {/* High-visibility Vietnam National Boundary Layer */}
        {showNationalBoundary && (
          <GeoJSON
            data={vietnamBoundaryData as any}
            style={{
              color: '#2D5A27',
              weight: 2,
              opacity: 0.85,
              fillColor: '#D4A373',
              fillOpacity: 0.08,
              dashArray: '3, 2'
            }}
            interactive={false}
          />
        )}

        {/* Sovereignty Island Markers (Hoàng Sa & Trường Sa) */}
        {SOVEREIGNTY_POINTS.filter(pt => isValidLatLng(pt.coordinates)).map((point, idx) => (
          <Marker
            key={`sov-${idx}`}
            position={point.coordinates}
            icon={getSovereigntyDivIcon(point.name, point.subname)}
            interactive={false}
          />
        ))}

        {/* 7 EBA Region Haloes & Center Markers */}
        {ebaRegions.filter(region => isValidLatLng(region.coordinates)).map((region, index) => {
          const isSelected = selectedEBARegionId === region.id;
          const radius = (typeof region.radiusMeters === 'number' && Number.isFinite(region.radiusMeters)) ? region.radiusMeters : 50000;

          return (
            <React.Fragment key={region.id}>
              {/* Geographic ecological boundary circle (in meters, scales naturally with map zoom) */}
              {showEBACircles && (
                <Circle
                  center={region.coordinates}
                  radius={radius}
                  pathOptions={{
                    color: isSelected ? '#D97706' : '#2D5A27',
                    fillColor: isSelected ? '#F59E0B' : '#2D5A27',
                    fillOpacity: isSelected ? 0.09 : 0.05,
                    weight: isSelected ? 2.2 : 1.6,
                    dashArray: isSelected ? undefined : '6, 6'
                  }}
                  eventHandlers={{
                    click: () => handleSelectRegion(region)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                    <div className="font-serif font-bold text-xs text-ink-900">
                      {region.vietnameseName}
                    </div>
                    <div className="text-[10px] text-ink-600 font-sans">
                      {region.keySpeciesIds.length} loài đặc hữu &amp; tiêu biểu
                    </div>
                  </Tooltip>
                </Circle>
              )}

              {/* EBA Center Icon Marker */}
              <Marker
                position={region.coordinates}
                icon={getEBADivIcon(region.vietnameseName, index, isSelected)}
                eventHandlers={{
                  click: () => handleSelectRegion(region)
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Other Filtered Species Pins with Spiderfier Radial Offset */}
        {showAllSpeciesPins && (() => {
          // Precalculate coordinate groups for spider offset
          const coordCounts = new Map<string, number>();
          otherSpeciesList.forEach(s => {
            if (isValidLatLng(s.distribution?.coordinates)) {
              const [lat, lng] = s.distribution.coordinates;
              const k = `${lat.toFixed(2)},${lng.toFixed(2)}`;
              coordCounts.set(k, (coordCounts.get(k) || 0) + 1);
            }
          });
          const coordTrackers = new Map<string, number>();

          return otherSpeciesList.map(species => {
            if (!isValidLatLng(species.distribution?.coordinates)) return null;
            const originalCoords = species.distribution.coordinates;
            const k = `${originalCoords[0].toFixed(2)},${originalCoords[1].toFixed(2)}`;
            const total = coordCounts.get(k) || 1;
            const currentIdx = coordTrackers.get(k) || 0;
            coordTrackers.set(k, currentIdx + 1);

            const displayCoords = calculateSpiderOffset(originalCoords, currentIdx, total);
            if (!isValidLatLng(displayCoords)) return null;

            return (
              <Marker
                key={species.id}
                position={displayCoords}
                icon={getSpeciesDivIcon(species)}
                eventHandlers={{
                  click: () => {
                    selectSpecies(species.id);
                    if (isMobile) setIsMobileSpeciesCardOpen(true);
                  }
                }}
              >
                {!isMobile && (
                  <Popup className="naturalist-map-popup">
                    <div className="p-1 max-w-[200px] text-ink-900 space-y-1.5">
                      {species.illustration?.imageUrl && (
                        <img
                          src={species.illustration.imageUrl}
                          alt={species.vietnameseName}
                          className="w-full h-20 object-cover rounded border border-paper-border"
                        />
                      )}
                      <div>
                        <h4 className="font-serif font-bold text-xs leading-snug">
                          {species.vietnameseName}
                        </h4>
                        <p className="font-serif italic text-[11px] text-natural-forest">
                          {species.scientificName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {species.isEndemic && (
                          <span className={`text-[10px] px-1 py-0.2 font-semibold rounded ${
                            species.endemicScope === 'indochina'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                              : 'bg-natural-ochre/20 text-natural-amber'
                          }`}>
                            {species.endemicScope === 'indochina' ? 'Đông Dương' : 'Đặc hữu VN'}
                          </span>
                        )}
                        <span className="text-[10px] px-1 py-0.2 bg-paper-200 text-ink-700 rounded font-mono font-bold">
                          {species.conservation.iucn}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectSpecies(species.id)}
                        className="w-full mt-1 py-1 px-2 bg-natural-moss text-paper-50 rounded text-[10px] font-semibold flex items-center justify-center gap-1 hover:bg-natural-forest"
                      >
                        <span>Xem hồ sơ</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          });
        })()}

        {/* Currently Selected Species Pin (Highlighted / Animated) */}
        {isValidLatLng(selectedSpecies?.distribution?.coordinates) && (
          <Marker
            position={selectedSpecies.distribution.coordinates}
            icon={getSelectedSpeciesDivIcon(selectedSpecies)}
            zIndexOffset={1000}
            eventHandlers={{
              click: () => {
                if (isMobile) setIsMobileSpeciesCardOpen(true);
              }
            }}
          >
            {!isMobile && (
              <Popup className="naturalist-map-popup" autoPan={false}>
                <div className="p-1.5 max-w-[220px] text-ink-900 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-natural-moss font-semibold uppercase tracking-wider">
                      Đang quan sát
                    </span>
                    {selectedSpecies.isEndemic && (
                      <span className={`text-[10px] px-1 py-0.2 font-semibold rounded ${
                        selectedSpecies.endemicScope === 'indochina'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                          : 'bg-natural-ochre/20 text-natural-amber'
                      }`}>
                        {selectedSpecies.endemicScope === 'indochina' ? 'Đặc hữu Đông Dương' : 'Đặc hữu VN'}
                      </span>
                    )}
                  </div>
                  {selectedSpecies.illustration?.imageUrl && (
                    <img
                      src={selectedSpecies.illustration.imageUrl}
                      alt={selectedSpecies.vietnameseName}
                      className="w-full h-24 object-cover rounded border border-paper-border"
                    />
                  )}
                  <div>
                    <h4 className="font-serif font-bold text-sm leading-snug">
                      {selectedSpecies.vietnameseName}
                    </h4>
                    <p className="font-serif italic text-xs text-natural-forest">
                      {selectedSpecies.scientificName}
                    </p>
                  </div>
                  <div className="text-[11px] text-ink-600 font-sans">
                    {selectedSpecies.distribution.elevation} • {selectedSpecies.distribution.ebaRegion}
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        )}
      </MapContainer>

      {/* Floating Left Panel: EBA Region Legend (Desktop & Tablet: md:flex) */}
      <div className="hidden md:flex flex-col absolute top-3 left-3 bottom-14 max-h-[calc(100%-56px)] z-10 w-[340px] lg:w-[375px] pointer-events-auto">
        <EBARegionLegend
          selectedRegionId={selectedEBARegionId}
          onSelectRegion={handleSelectRegion}
        />
      </div>

      {/* Floating Right Panel: Endemic Focus Card (Desktop & Tablet: md:flex) */}
      <div className="hidden md:flex flex-col absolute top-3 right-3 bottom-14 max-h-[calc(100%-56px)] z-10 w-80 lg:w-[360px] pointer-events-auto">
        <EndemicFocusCard />
      </div>

      {/* Bottom Map Controls: Positioned bottom-[68px] on mobile (above 48px floating peek card), md:bottom-2.5 on desktop */}
      <div className="absolute bottom-[68px] md:bottom-2.5 left-3 right-3 md:right-auto md:w-auto flex items-center justify-between md:justify-start pointer-events-none z-20 md:z-10">
        {/* Left Control Group */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-paper-100/95 backdrop-blur-md p-1 rounded-xl border border-paper-border shadow-paper-card text-xs">
          <button
            type="button"
            onClick={handleResetOverview}
            title="Toàn cảnh Việt Nam"
            aria-label="Toàn cảnh"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-200/80 hover:bg-natural-moss hover:text-paper-50 text-ink-800 text-xs font-semibold transition-all border border-paper-border cursor-pointer shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-natural-moss" />
            <span>Toàn cảnh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEBACircles(prev => !prev)}
            title={showEBACircles ? 'Ẩn vùng EBA' : 'Hiện vùng EBA'}
            aria-label={showEBACircles ? 'Ẩn vùng EBA' : 'Hiện vùng EBA'}
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
              showEBACircles
                ? 'bg-natural-moss/10 text-natural-forest border-natural-moss/30 font-semibold'
                : 'bg-paper-200/60 text-ink-500 border-paper-border'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowAllSpeciesPins(prev => !prev)}
            title={showAllSpeciesPins ? 'Ẩn các điểm loài' : 'Hiện tất cả điểm loài'}
            aria-label={showAllSpeciesPins ? 'Ẩn các điểm loài' : 'Hiện tất cả điểm loài'}
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
              showAllSpeciesPins
                ? 'bg-natural-moss/10 text-natural-forest border-natural-moss/30 font-semibold'
                : 'bg-paper-200/60 text-ink-500 border-paper-border'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Mobile Avian AI Button (Mobile only: md:hidden) */}
        <div className="flex md:hidden items-center pointer-events-auto">
          <button
            type="button"
            data-testid="map-avian-ai-btn"
            onClick={() => setIsGeminiModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-paper-100/95 backdrop-blur-md border border-paper-border hover:border-natural-moss/40 text-ink-800 hover:text-natural-forest text-xs font-semibold shadow-paper-card cursor-pointer transition-all active:scale-95"
            aria-label="Mở Avian AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Avian AI</span>
          </button>
        </div>
      </div>

      {/* Mobile Floating Species Card (Mobile only: md:hidden) */}
      {selectedSpecies && isMobileSpeciesCardOpen && (
        <MobileFloatingSpeciesCard
          species={selectedSpecies}
          onClose={() => {
            setIsMobileSpeciesCardOpen(false);
            selectSpecies(null);
          }}
        />
      )}

      {/* Mobile Bottom Sheet: Interactive 3-stage sheet (Mobile only: md:hidden) */}
      <EBAMobileBottomSheet
        className="md:hidden"
        regions={ebaRegions}
        allSpecies={allSpecies}
        selectedRegionId={selectedEBARegionId}
        selectedSpecies={selectedSpecies}
        onSelectRegion={handleSelectRegion}
        onSelectSpecies={(sp) => {
          selectSpecies(sp.id);
          if (isMobile) setIsMobileSpeciesCardOpen(true);
        }}
        onResetOverview={handleResetOverview}
        snapPoint={mobileSheetSnap}
        onSnapChange={setMobileSheetSnap}
      />

      {/* Gemini Naturalist Modal for Mobile Map View */}
      <GeminiNaturalistModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
      />
    </div>
  );
};

export default React.memo(VietnamEBAMap);

