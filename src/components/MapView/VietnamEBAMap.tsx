import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Layers,
  Trees,
  ChevronRight
} from 'lucide-react';
import type { BirdSpecies, EBARegion } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { EndemicFocusCard } from './EndemicFocusCard';
import { EBARegionLegend } from './EBARegionLegend';

// Center and zoom defaults for Vietnam overview
const VIETNAM_CENTER: [number, number] = [16.0, 107.5];
const VIETNAM_DEFAULT_ZOOM = 6;

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

// Helper to create custom Leaflet divIcon for sovereign markers
const createSovereigntyDivIcon = (name: string, subname: string) => {
  return L.divIcon({
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
};

// Helper to create custom EBA DivIcon
const createEBADivIcon = (regionName: string, index: number, isSelected: boolean) => {
  return L.divIcon({
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
};

// Helper to create Selected Species DivIcon
const createSelectedSpeciesDivIcon = (species: BirdSpecies) => {
  return L.divIcon({
    className: 'custom-species-selected-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute -inset-2.5 rounded-full bg-natural-ochre/40 animate-ping"></span>
        <span class="absolute -inset-1 rounded-full bg-natural-ochre/30"></span>
        <div class="relative w-10 h-10 rounded-full bg-natural-ochre border-2 border-paper-50 shadow-natural-lg flex items-center justify-center text-paper-50 text-base transform hover:scale-110 transition-transform">
          ${species.isEndemic ? '⭐' : '🪶'}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Helper to create regular Species DivIcon
const createSpeciesDivIcon = (species: BirdSpecies) => {
  return L.divIcon({
    className: 'custom-species-marker',
    html: `
      <div class="w-6 h-6 rounded-full ${
        species.isEndemic ? 'bg-natural-terracotta ring-1 ring-natural-ochre' : 'bg-natural-forest'
      } border-2 border-paper-50 shadow-md flex items-center justify-center text-paper-50 text-[10px] transform hover:scale-125 transition-transform cursor-pointer">
        ${species.isEndemic ? '★' : '•'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Inner Map Controller component to handle flyTo animations
interface MapFlyToControllerProps {
  target: {
    coordinates: [number, number];
    zoom: number;
  } | null;
}

const MapFlyToController: React.FC<MapFlyToControllerProps> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target.coordinates, target.zoom, {
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
  }, [map, target]);

  return null;
};

export interface VietnamEBAMapProps {
  className?: string;
}

export const VietnamEBAMap: React.FC<VietnamEBAMapProps> = ({ className = '' }) => {
  const {
    selectedSpecies,
    selectSpecies,
    filteredSpecies,
    ebaRegions
  } = useTaxonomy();

  const [selectedEBARegionId, setSelectedEBARegionId] = useState<string | null>(null);
  const [showEBACircles, setShowEBACircles] = useState<boolean>(true);
  const [showAllSpeciesPins, setShowAllSpeciesPins] = useState<boolean>(true);
  const [flyTarget, setFlyTarget] = useState<{
    coordinates: [number, number];
    zoom: number;
  } | null>(null);

  // Mobile drawer tabs: 'card' | 'legend' | 'map'
  const [mobileTab, setMobileTab] = useState<'card' | 'legend' | 'map'>('map');

  // Fly to selected species whenever it changes
  useEffect(() => {
    if (selectedSpecies?.distribution?.coordinates) {
      setFlyTarget({
        coordinates: selectedSpecies.distribution.coordinates,
        zoom: 9
      });
    }
  }, [selectedSpecies]);

  // Handle region select from legend or map
  const handleSelectRegion = useCallback((region: EBARegion) => {
    setSelectedEBARegionId(region.id);
    setFlyTarget({
      coordinates: region.coordinates,
      zoom: region.zoomLevel
    });
  }, []);

  // Handle reset to full Vietnam overview
  const handleResetOverview = () => {
    setSelectedEBARegionId(null);
    setFlyTarget({
      coordinates: VIETNAM_CENTER,
      zoom: VIETNAM_DEFAULT_ZOOM
    });
  };

  // Group species without selected species to avoid duplicate marker
  const otherSpeciesList = useMemo(() => {
    if (!selectedSpecies) return filteredSpecies;
    return filteredSpecies.filter(s => s.id !== selectedSpecies.id);
  }, [filteredSpecies, selectedSpecies]);

  return (
    <div
      className={`relative w-full h-full flex-1 min-h-[480px] md:min-h-0 overflow-hidden bg-paper-100 ${className}`}
      data-testid="vietnam-eba-map"
    >
      {/* Leaflet MapContainer */}
      <MapContainer
        center={VIETNAM_CENTER}
        zoom={VIETNAM_DEFAULT_ZOOM}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%', background: '#FAF8F5' }}
      >
        {/* CartoDB Voyager TileLayer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={['a', 'b', 'c', 'd']}
        />

        <MapFlyToController target={flyTarget} />

        {/* Sovereignty Island Markers (Hoàng Sa & Trường Sa) */}
        {SOVEREIGNTY_POINTS.map((point, idx) => (
          <Marker
            key={`sov-${idx}`}
            position={point.coordinates}
            icon={createSovereigntyDivIcon(point.name, point.subname)}
            interactive={false}
          />
        ))}

        {/* 6 EBA Region Haloes & Center Markers */}
        {ebaRegions.map((region, index) => {
          const isSelected = selectedEBARegionId === region.id;

          return (
            <React.Fragment key={region.id}>
              {/* Soft ecological boundary halo */}
              {showEBACircles && (
                <CircleMarker
                  center={region.coordinates}
                  radius={isSelected ? 45 : 32}
                  pathOptions={{
                    color: isSelected ? '#C2593F' : '#2D5A27',
                    fillColor: isSelected ? '#C2593F' : '#2D5A27',
                    fillOpacity: isSelected ? 0.18 : 0.08,
                    weight: isSelected ? 2.5 : 1.5,
                    dashArray: isSelected ? undefined : '4, 4'
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
                </CircleMarker>
              )}

              {/* EBA Center Icon Marker */}
              <Marker
                position={region.coordinates}
                icon={createEBADivIcon(region.vietnameseName, index, isSelected)}
                eventHandlers={{
                  click: () => handleSelectRegion(region)
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Other Filtered Species Pins */}
        {showAllSpeciesPins &&
          otherSpeciesList.map(species => {
            if (!species.distribution?.coordinates) return null;

            return (
              <Marker
                key={species.id}
                position={species.distribution.coordinates}
                icon={createSpeciesDivIcon(species)}
                eventHandlers={{
                  click: () => selectSpecies(species.id)
                }}
              >
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
                        <span className="text-[10px] px-1 py-0.2 bg-natural-ochre/20 text-natural-amber font-semibold rounded">
                          Đặc hữu VN
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
              </Marker>
            );
          })}

        {/* Currently Selected Species Pin (Highlighted / Animated) */}
        {selectedSpecies?.distribution?.coordinates && (
          <Marker
            position={selectedSpecies.distribution.coordinates}
            icon={createSelectedSpeciesDivIcon(selectedSpecies)}
            zIndexOffset={1000}
          >
            <Popup className="naturalist-map-popup" autoPan={false}>
              <div className="p-1.5 max-w-[220px] text-ink-900 space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-natural-moss font-semibold uppercase tracking-wider">
                    Đang quan sát
                  </span>
                  {selectedSpecies.isEndemic && (
                    <span className="text-[10px] px-1 py-0.2 bg-natural-ochre/20 text-natural-amber font-semibold rounded">
                      Đặc hữu
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
          </Marker>
        )}
      </MapContainer>

      {/* Floating Left Panel: EBA Region Legend (Desktop) */}
      <div className="hidden lg:block absolute top-4 left-4 z-10 max-w-xs lg:max-w-sm pointer-events-auto">
        <EBARegionLegend
          selectedRegionId={selectedEBARegionId}
          onSelectRegion={handleSelectRegion}
        />
      </div>

      {/* Floating Right Panel: Endemic Focus Card (Desktop) */}
      <div className="hidden md:block absolute top-4 right-4 z-10 max-w-sm lg:max-w-md pointer-events-auto">
        <EndemicFocusCard />
      </div>

      {/* Mobile Drawer Floating Panel */}
      <div className="md:hidden absolute bottom-14 left-2 right-2 z-20 pointer-events-auto max-h-[60vh] overflow-y-auto">
        {mobileTab === 'card' && (
          <EndemicFocusCard className="w-full" />
        )}
        {mobileTab === 'legend' && (
          <EBARegionLegend
            className="w-full"
            selectedRegionId={selectedEBARegionId}
            onSelectRegion={(reg) => {
              handleSelectRegion(reg);
              setMobileTab('map');
            }}
          />
        )}
      </div>

      {/* Bottom Controls Bar (Map Tools & Mobile Tabs) */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Map Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-paper-100/90 backdrop-blur-md p-1.5 rounded-xl border border-paper-border shadow-paper-card">
          <button
            type="button"
            onClick={handleResetOverview}
            title="Toàn cảnh Việt Nam"
            aria-label="Toàn cảnh Việt Nam"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-200/80 hover:bg-natural-moss hover:text-paper-50 text-ink-800 text-xs font-semibold transition-all border border-paper-border"
          >
            <Compass className="w-3.5 h-3.5 text-natural-moss" />
            <span className="hidden sm:inline">Toàn cảnh VN</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEBACircles(prev => !prev)}
            title={showEBACircles ? 'Ẩn vùng EBA' : 'Hiện vùng EBA'}
            aria-label={showEBACircles ? 'Ẩn vùng EBA' : 'Hiện vùng EBA'}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
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
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              showAllSpeciesPins
                ? 'bg-natural-moss/10 text-natural-forest border-natural-moss/30 font-semibold'
                : 'bg-paper-200/60 text-ink-500 border-paper-border'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Mobile Navigation Buttons */}
        <div className="flex md:hidden items-center gap-1 pointer-events-auto bg-paper-100/90 backdrop-blur-md p-1 rounded-xl border border-paper-border shadow-paper-card text-xs">
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === 'card' ? 'map' : 'card')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mobileTab === 'card'
                ? 'bg-natural-moss text-paper-50 shadow-sm'
                : 'text-ink-700 hover:bg-paper-200'
            }`}
          >
            Hồ sơ loài
          </button>
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === 'legend' ? 'map' : 'legend')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              mobileTab === 'legend'
                ? 'bg-natural-moss text-paper-50 shadow-sm'
                : 'text-ink-700 hover:bg-paper-200'
            }`}
          >
            6 Vùng EBA
          </button>
        </div>

      </div>
    </div>
  );
};

export default VietnamEBAMap;
