'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Plane,
  Ship,
  Search,
  RefreshCw,
  Compass,
  Navigation,
  X,
  Layers,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Route,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  Download
} from 'lucide-react';
import { getAirlineLogo, getShipLogo } from '../lib/logos';
import {
  FlagIndonesia,
  FlagWorld,
  FlagAsiaPacific,
  FlagEurope,
  FlagUSA
} from '../lib/flags';
import DisclaimerModal from './DisclaimerModal';
import PwaInstallModal from './PwaInstallModal';

// Google Maps Tile Providers
const GOOGLE_MAP_TILES = {
  roadmap: {
    name: 'Google Maps (Peta)',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  satellite: {
    name: 'Google Maps (Satelit Hybrid)',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
};

// Global Regional Camera Presets with Authentic Flag Icons
const REGION_PRESETS = [
  { id: 'id', name: 'Indonesia', shortName: 'Indonesia', flag: FlagIndonesia, center: [-2.5489, 118.0149], zoom: 5 },
  { id: 'world', name: 'Seluruh Dunia', shortName: 'Dunia', flag: FlagWorld, center: [20.0, 10.0], zoom: 2.2 },
  { id: 'asia', name: 'Asia-Pasifik', shortName: 'Asia', flag: FlagAsiaPacific, center: [15.0, 115.0], zoom: 4 },
  { id: 'europe', name: 'Eropa & Timur Tengah', shortName: 'Eropa', flag: FlagEurope, center: [40.0, 25.0], zoom: 4 },
  { id: 'usa', name: 'Amerika', shortName: 'Amerika', flag: FlagUSA, center: [38.0, -95.0], zoom: 4 },
];

export default function MapTracker() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const leafletModuleRef = useRef(null);
  const isMapInteractingRef = useRef(false);
  const planeMarkersRef = useRef(new Map());
  const shipMarkersRef = useRef(new Map());

  // Trajectory Layer References (Solid Past line, Dashed Future line, Origin/Dest pins)
  const trajectoryLayersRef = useRef({
    solidLine: null,
    dashedLine: null,
    originMarker: null,
    destMarker: null,
    entityId: null,
  });

  // Data states
  const [planes, setPlanes] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & UI states
  const [showPlanes, setShowPlanes] = useState(true);
  const [showShips, setShowShips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);
  const [tileMode, setTileMode] = useState('roadmap');
  const [activeRegion, setActiveRegion] = useState('id');
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'plane'|'ship', id: '...' }

  // Disclaimer & PWA Install states
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Check disclaimer acceptance on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('indoskysea_disclaimer_accepted_v1');
      if (!accepted) {
        setShowDisclaimerModal(true);
      }
    }
  }, []);

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Touch gesture tracking for mobile bottom sheet
  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);

  // Reset bottom sheet to peek state on new selection
  useEffect(() => {
    if (selectedEntity) {
      setMobileSheetExpanded(false);
    }
  }, [selectedEntity?.id, selectedEntity?.type]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    // Swiping upward -> expand bottom sheet to 90%
    if (touchDeltaY.current < -35) {
      setMobileSheetExpanded(true);
    }
    // Swiping downward -> collapse to peek or close
    else if (touchDeltaY.current > 35) {
      if (mobileSheetExpanded) {
        setMobileSheetExpanded(false);
      } else {
        setSelectedEntity(null);
      }
    }
  };

  // Initialize Leaflet Map with Google Maps
  useEffect(() => {
    let isMounted = true;
    let handleResize = null;

    async function initMap() {
      if (typeof window === 'undefined') return;
      if (mapInstanceRef.current || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted) return;
      leafletModuleRef.current = L;

      // Default Indonesia View with Canvas rendering & mobile GPU optimization
      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
        minZoom: 2,
        maxZoom: 19,
        preferCanvas: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Track touch drag / zoom interactions to pause background kinematic ticks and achieve 60fps
      map.on('movestart', () => { isMapInteractingRef.current = true; });
      map.on('moveend', () => { isMapInteractingRef.current = false; });

      const tileConfig = GOOGLE_MAP_TILES[tileMode] || GOOGLE_MAP_TILES.roadmap;
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        subdomains: tileConfig.subdomains,
        maxZoom: tileConfig.maxZoom,
        keepBuffer: 1, // Minimize RAM overhead on low-spec phones
        updateWhenIdle: false, // Progressive streaming while panning
        updateWhenZooming: false, // Defer tile decode until zoom finishes
        updateInterval: 150,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Deselect when clicking on empty map
      map.on('click', (e) => {
        if (e.originalEvent?.target?.classList?.contains('leaflet-container')) {
          setSelectedEntity(null);
        }
      });

      // Handle orientation change and viewport resizing seamlessly
      handleResize = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
        }
      };
      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('orientationchange', handleResize, { passive: true });

      // Invalidate size once layout settles
      requestAnimationFrame(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Google Maps Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    async function switchTile() {
      const L = leafletModuleRef.current || (await import('leaflet')).default;
      leafletModuleRef.current = L;
      const tileConfig = GOOGLE_MAP_TILES[tileMode] || GOOGLE_MAP_TILES.roadmap;
      mapInstanceRef.current.removeLayer(tileLayerRef.current);

      tileLayerRef.current = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        subdomains: tileConfig.subdomains,
        maxZoom: tileConfig.maxZoom,
        keepBuffer: 1,
        updateWhenIdle: false,
        updateWhenZooming: false,
        updateInterval: 150,
      }).addTo(mapInstanceRef.current);
    }

    switchTile();
  }, [tileMode]);

  // Fetch worldwide planes
  const fetchPlanes = useCallback(async () => {
    try {
      const res = await fetch('/api/planes', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPlanes(json.data);
      }
    } catch (err) {
      console.error('Error fetching planes:', err);
    }
  }, []);

  // Fetch worldwide ships
  const fetchShips = useCallback(async () => {
    try {
      const res = await fetch('/api/ships', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShips(json.data);
      }
    } catch (err) {
      console.error('Error fetching ships:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([fetchPlanes(), fetchShips()]);
    setLoading(false);
  }, [fetchPlanes, fetchShips]);

  // Initial load and periodic server sync (auto-throttled when page is hidden/tab is inactive)
  useEffect(() => {
    refreshData();
    const serverSyncInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        refreshData();
      }
    }, 10000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        refreshData();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(serverSyncInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [refreshData]);

  // Client-Side Real-Time Dead Reckoning Engine (Every 2.5 seconds):
  // Continuously advances plane and ship positions smoothly worldwide
  useEffect(() => {
    const kinematicTicker = setInterval(() => {
      // Pause kinematic calculation when tab is hidden or user is actively panning/zooming map
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isMapInteractingRef.current) return;

      const deltaSeconds = 2.5;

      // 1. Advance aircraft in real-time
      setPlanes((prevPlanes) =>
        prevPlanes.map((p) => {
          if (p.onGround || !p.velocity) return p;
          const vMs = p.velocity * 0.514444 * deltaSeconds;
          const rad = ((p.heading || 0) * Math.PI) / 180;
          const dLat = (vMs * Math.cos(rad)) / 111139;
          const dLon = (vMs * Math.sin(rad)) / (111139 * Math.cos((p.latitude * Math.PI) / 180));

          let newLat = Number((p.latitude + dLat).toFixed(5));
          let newLon = Number((p.longitude + dLon).toFixed(5));

          if (newLon > 180) newLon -= 360;
          if (newLon < -180) newLon += 360;

          return {
            ...p,
            latitude: newLat,
            longitude: newLon,
          };
        })
      );

      // 2. Advance ships in real-time
      setShips((prevShips) =>
        prevShips.map((s) => {
          if (!s.sog || s.sog < 0.3) return s;
          const vMs = s.sog * 0.514444 * deltaSeconds;
          const rad = (((s.heading || s.cog || 0)) * Math.PI) / 180;
          const dLat = (vMs * Math.cos(rad)) / 111139;
          const dLon = (vMs * Math.sin(rad)) / (111139 * Math.cos((s.latitude * Math.PI) / 180));

          let newLat = Number((s.latitude + dLat).toFixed(5));
          let newLon = Number((s.longitude + dLon).toFixed(5));

          if (newLon > 180) newLon -= 360;
          if (newLon < -180) newLon += 360;

          return {
            ...s,
            latitude: newLat,
            longitude: newLon,
          };
        })
      );
    }, 2500);

    return () => clearInterval(kinematicTicker);
  }, []);

  // Update plane markers on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    let isSubscribed = true;

    async function updatePlanes() {
      const L = leafletModuleRef.current || (await import('leaflet')).default;
      leafletModuleRef.current = L;
      if (!isSubscribed || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;
      const existing = planeMarkersRef.current;
      const currentIds = new Set();

      if (!showPlanes) {
        existing.forEach((marker) => map.removeLayer(marker));
        existing.clear();
        return;
      }

      const q = searchQuery.trim().toLowerCase();
      const filtered = planes.filter((p) => {
        if (!q) return true;
        return (
          p.callsign?.toLowerCase().includes(q) ||
          p.realName?.toLowerCase().includes(q) ||
          p.airlineName?.toLowerCase().includes(q) ||
          p.aircraftModel?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.country?.toLowerCase().includes(q) ||
          p.estimatedRoute?.toLowerCase().includes(q)
        );
      });

      filtered.forEach((plane) => {
        currentIds.add(plane.id);
        const heading = plane.heading || 0;
        const isSelected = selectedEntity?.type === 'plane' && selectedEntity?.id === plane.id;

        const buildPlaneIcon = () => {
          const iconHtml = `
            <div class="marker-plane-wrapper group" style="width: 34px; height: 34px;">
              ${isSelected ? '<div class="absolute inset-0 rounded-full bg-amber-500/40 ping-selected pointer-events-none"></div>' : ''}
              <div class="marker-rotator relative flex items-center justify-center w-8 h-8 transition-transform duration-300"
                   style="transform: rotate(${heading}deg);">
                <svg viewBox="0 0 24 24" class="w-6 h-6 hover:scale-125 transition-transform" fill="currentColor">
                  <path fill="#f59e0b" stroke="#0f172a" stroke-width="0.8" stroke-linejoin="round" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-sans font-bold bg-white text-slate-800 rounded-md shadow border border-slate-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${plane.realName || plane.callsign}
              </div>
            </div>
          `;
          return L.divIcon({
            html: iconHtml,
            className: 'custom-plane-icon',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });
        };

        if (existing.has(plane.id)) {
          const marker = existing.get(plane.id);
          marker.setLatLng([plane.latitude, plane.longitude]);

          // Only reconstruct DOM node if selection ring status toggled
          if (marker._isSelected !== isSelected) {
            marker._isSelected = isSelected;
            marker._heading = heading;
            marker.setIcon(buildPlaneIcon());
          } else {
            // Ultra-lightweight GPU rotation: in-place CSS transform without recreating DOM nodes
            const el = marker.getElement();
            if (el && marker._heading !== heading) {
              const rotator = el.querySelector('.marker-rotator');
              if (rotator) {
                rotator.style.transform = `rotate(${heading}deg)`;
              }
              marker._heading = heading;
            }
          }
        } else {
          const planeIcon = buildPlaneIcon();
          const marker = L.marker([plane.latitude, plane.longitude], { icon: planeIcon }).addTo(map);
          marker._isSelected = isSelected;
          marker._heading = heading;

          marker.on('click', () => {
            setSelectedEntity({ type: 'plane', id: plane.id });
          });

          existing.set(plane.id, marker);
        }
      });

      existing.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          map.removeLayer(marker);
          existing.delete(id);
        }
      });
    }

    updatePlanes();

    return () => {
      isSubscribed = false;
    };
  }, [planes, showPlanes, searchQuery, selectedEntity]);

  // Update ship markers on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    let isSubscribed = true;

    async function updateShips() {
      const L = leafletModuleRef.current || (await import('leaflet')).default;
      leafletModuleRef.current = L;
      if (!isSubscribed || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;
      const existing = shipMarkersRef.current;
      const currentIds = new Set();

      if (!showShips) {
        existing.forEach((marker) => map.removeLayer(marker));
        existing.clear();
        return;
      }

      const q = searchQuery.trim().toLowerCase();
      const filtered = ships.filter((s) => {
        if (!q) return true;
        return (
          s.name?.toLowerCase().includes(q) ||
          s.fullName?.toLowerCase().includes(q) ||
          s.operator?.toLowerCase().includes(q) ||
          String(s.mmsi).includes(q) ||
          s.type?.toLowerCase().includes(q) ||
          s.destination?.name?.toLowerCase().includes(q) ||
          s.destination?.city?.toLowerCase().includes(q) ||
          s.origin?.name?.toLowerCase().includes(q) ||
          s.origin?.city?.toLowerCase().includes(q) ||
          s.destinationName?.toLowerCase().includes(q) ||
          s.flagName?.toLowerCase().includes(q)
        );
      });

      filtered.forEach((ship) => {
        currentIds.add(ship.mmsi);
        const heading = ship.heading || ship.cog || 0;
        const isSelected = selectedEntity?.type === 'ship' && selectedEntity?.id === ship.mmsi;

        const buildShipIcon = () => {
          const iconHtml = `
            <div class="marker-ship-wrapper group" style="width: 28px; height: 28px;">
              ${isSelected ? '<div class="absolute inset-0 rounded-full bg-cyan-500/40 ping-selected pointer-events-none"></div>' : ''}
              <div class="marker-rotator relative flex items-center justify-center w-7 h-7 transition-transform duration-300"
                   style="transform: rotate(${heading}deg);">
                <svg viewBox="0 0 24 24" class="w-5 h-5 hover:scale-125 transition-transform" fill="currentColor">
                  <path fill="#0284c7" stroke="#0f172a" stroke-width="0.8" stroke-linejoin="round" d="M12 2L6 8v11a2 2 0 002 2h8a2 2 0 002-2V8l-6-6zm0 3.5l3.5 3.5h-7L12 5.5zM8 11h8v7H8v-7z"/>
                </svg>
              </div>
              <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-sans font-bold bg-white text-slate-800 rounded-md shadow border border-slate-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${ship.fullName || ship.name}
              </div>
            </div>
          `;
          return L.divIcon({
            html: iconHtml,
            className: 'custom-ship-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
        };

        if (existing.has(ship.mmsi)) {
          const marker = existing.get(ship.mmsi);
          marker.setLatLng([ship.latitude, ship.longitude]);

          // Only reconstruct DOM node if selection ring status toggled
          if (marker._isSelected !== isSelected) {
            marker._isSelected = isSelected;
            marker._heading = heading;
            marker.setIcon(buildShipIcon());
          } else {
            // Ultra-lightweight GPU rotation: in-place CSS transform without recreating DOM nodes
            const el = marker.getElement();
            if (el && marker._heading !== heading) {
              const rotator = el.querySelector('.marker-rotator');
              if (rotator) {
                rotator.style.transform = `rotate(${heading}deg)`;
              }
              marker._heading = heading;
            }
          }
        } else {
          const shipIcon = buildShipIcon();
          const marker = L.marker([ship.latitude, ship.longitude], { icon: shipIcon }).addTo(map);
          marker._isSelected = isSelected;
          marker._heading = heading;

          marker.on('click', () => {
            setSelectedEntity({ type: 'ship', id: ship.mmsi });
          });

          existing.set(ship.mmsi, marker);
        }
      });

      existing.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          map.removeLayer(marker);
          existing.delete(id);
        }
      });
    }

    updateShips();

    return () => {
      isSubscribed = false;
    };
  }, [ships, showShips, searchQuery, selectedEntity]);

  // Safe selected entity data
  const currentSelectedData = selectedEntity
    ? (selectedEntity.type === 'plane'
        ? planes.find((p) => p.id === selectedEntity.id)
        : ships.find((s) => s.mmsi === selectedEntity.id))
    : null;

  // Render Trajectory Lines (SOLID for past trail, DASHED for destination projection)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    let isSubscribed = true;

    async function updateTrajectory() {
      const L = (await import('leaflet')).default;
      if (!isSubscribed || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;
      const ref = trajectoryLayersRef.current;

      if (!currentSelectedData) {
        if (ref.solidLine) { map.removeLayer(ref.solidLine); ref.solidLine = null; }
        if (ref.dashedLine) { map.removeLayer(ref.dashedLine); ref.dashedLine = null; }
        if (ref.originMarker) { map.removeLayer(ref.originMarker); ref.originMarker = null; }
        if (ref.destMarker) { map.removeLayer(ref.destMarker); ref.destMarker = null; }
        ref.entityId = null;
        return;
      }

      const isPlane = selectedEntity.type === 'plane';
      const lineColor = isPlane ? '#f59e0b' : '#0284c7';
      const isSameEntity = ref.entityId === selectedEntity?.id;

      if (isSameEntity) {
        // Fast-path: Update existing polylines in-place (Zero DOM allocations)
        if (ref.solidLine && Array.isArray(currentSelectedData.pastTrail)) {
          ref.solidLine.setLatLngs(currentSelectedData.pastTrail);
        }
        if (ref.dashedLine && Array.isArray(currentSelectedData.futureTrail)) {
          ref.dashedLine.setLatLngs(currentSelectedData.futureTrail);
        }
        return;
      }

      // Entity selection changed: Clean up previous trajectory and create new pins
      if (ref.solidLine) { map.removeLayer(ref.solidLine); ref.solidLine = null; }
      if (ref.dashedLine) { map.removeLayer(ref.dashedLine); ref.dashedLine = null; }
      if (ref.originMarker) { map.removeLayer(ref.originMarker); ref.originMarker = null; }
      if (ref.destMarker) { map.removeLayer(ref.destMarker); ref.destMarker = null; }

      ref.entityId = selectedEntity?.id;

      // 1. Solid Line for path already traversed (Origin -> Current position)
      if (Array.isArray(currentSelectedData.pastTrail) && currentSelectedData.pastTrail.length > 0) {
        ref.solidLine = L.polyline(currentSelectedData.pastTrail, {
          color: lineColor,
          weight: 3.5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);
      }

      // 2. Dashed Line for projected trajectory to destination (Current position -> Destination)
      if (Array.isArray(currentSelectedData.futureTrail) && currentSelectedData.futureTrail.length > 0) {
        ref.dashedLine = L.polyline(currentSelectedData.futureTrail, {
          color: lineColor,
          weight: 3,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);
      }

      // 3. Origin Waypoint Pin (Simpel Lingkaran Sesuai Garis Lajur + Teks Jelas & Mudah Dibaca)
      if (currentSelectedData.origin && currentSelectedData.origin.lat && currentSelectedData.origin.lon) {
        const originLabelText = isPlane ? 'Keberangkatan' : 'Pelabuhan Asal';
        const originTooltip = `${originLabelText}: ${currentSelectedData.origin.name} (${currentSelectedData.origin.city}, ${currentSelectedData.origin.country})`;

        const originHtml = `
          <div style="transform: translate(-50%, -10px); display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
            <!-- Lingkaran Simpel Sesuai Garis Lajur -->
            <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
              <span class="animate-ping" style="position: absolute; width: 16px; height: 16px; border-radius: 9999px; background-color: ${lineColor}; opacity: 0.65;"></span>
              <span style="position: relative; width: 13px; height: 13px; border-radius: 9999px; background-color: ${lineColor}; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></span>
            </div>
            <!-- Teks Jelas & Mudah Dibaca -->
            <div class="mt-1 px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 border border-slate-300 shadow-md backdrop-blur-xs text-center whitespace-nowrap">
              <div class="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center justify-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>${originLabelText}</span>
              </div>
              <div class="text-xs font-bold text-slate-900 leading-tight">
                ${currentSelectedData.origin.city} ${currentSelectedData.origin.code ? `(${currentSelectedData.origin.code})` : ''}
              </div>
              <div class="text-[10px] text-slate-500 font-medium max-w-[210px] truncate leading-tight">
                ${currentSelectedData.origin.name}
              </div>
            </div>
          </div>
        `;

        const originIcon = L.divIcon({
          html: originHtml,
          className: 'origin-simple-waypoint-pin',
          iconAnchor: [0, 0],
        });
        ref.originMarker = L.marker([currentSelectedData.origin.lat, currentSelectedData.origin.lon], { icon: originIcon })
          .bindTooltip(originTooltip, { direction: 'top', offset: [0, -10] })
          .addTo(map);
      }

      // 4. Destination Waypoint Pin (Simpel Lingkaran Sesuai Garis Lajur + Teks Jelas & Mudah Dibaca)
      if (currentSelectedData.destination && currentSelectedData.destination.lat && currentSelectedData.destination.lon) {
        const destLabelText = isPlane ? 'Tujuan' : 'Pelabuhan Tujuan';
        const destTooltip = `${destLabelText}: ${currentSelectedData.destination.name} (${currentSelectedData.destination.city}, ${currentSelectedData.destination.country})`;

        const destHtml = `
          <div style="transform: translate(-50%, -10px); display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
            <!-- Lingkaran Simpel Sesuai Garis Lajur -->
            <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
              <span class="animate-ping" style="position: absolute; width: 16px; height: 16px; border-radius: 9999px; background-color: ${lineColor}; opacity: 0.65;"></span>
              <span style="position: relative; width: 13px; height: 13px; border-radius: 9999px; background-color: ${lineColor}; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></span>
            </div>
            <!-- Teks Jelas & Mudah Dibaca -->
            <div class="mt-1 px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 border border-slate-300 shadow-md backdrop-blur-xs text-center whitespace-nowrap">
              <div class="text-[9px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center justify-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                <span>${destLabelText}</span>
              </div>
              <div class="text-xs font-bold text-slate-900 leading-tight">
                ${currentSelectedData.destination.city} ${currentSelectedData.destination.code ? `(${currentSelectedData.destination.code})` : ''}
              </div>
              <div class="text-[10px] text-slate-500 font-medium max-w-[210px] truncate leading-tight">
                ${currentSelectedData.destination.name}
              </div>
            </div>
          </div>
        `;

        const destIcon = L.divIcon({
          html: destHtml,
          className: 'dest-simple-waypoint-pin',
          iconAnchor: [0, 0],
        });
        ref.destMarker = L.marker([currentSelectedData.destination.lat, currentSelectedData.destination.lon], { icon: destIcon })
          .bindTooltip(destTooltip, { direction: 'top', offset: [0, -10] })
          .addTo(map);
      }
    }

    updateTrajectory();

    return () => {
      isSubscribed = false;
    };
  }, [currentSelectedData, selectedEntity]);

  // Center camera onto selected entity
  const handleCenterOnEntity = () => {
    if (!currentSelectedData || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [currentSelectedData.latitude, currentSelectedData.longitude],
      10,
      { duration: 1.2 }
    );
  };

  // Jump to regional camera preset
  const handleJumpRegion = (preset) => {
    setActiveRegion(preset.id);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(preset.center, preset.zoom, { duration: 1.5 });
  };

  // Resolve official SVG logo
  const activeLogo = currentSelectedData
    ? (selectedEntity?.type === 'plane'
        ? getAirlineLogo(currentSelectedData.airlineCode, currentSelectedData.callsign, currentSelectedData.airlineName)
        : getShipLogo(currentSelectedData.operator, currentSelectedData.fullName || currentSelectedData.name))
    : null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-100 font-sans select-none">
      {/* 1. Leaflet Map with Google Maps Tiles */}
      <div id="radar-map" ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* 2. Top Floating Header & Filter Bar (Unified 1 Row on Desktop, Ergonomic 2 Rows on Mobile) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-col space-y-2 pointer-events-none">
        
        {/* Main Unified Header Bar */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-none w-full">
          
          {/* Left: Brand & Search */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 pointer-events-auto shrink-0">
            {/* Brand Logo & Name */}
            <div
              onClick={() => {
                handleJumpRegion(REGION_PRESETS[0]);
                setSelectedEntity(null);
              }}
              className="glass-clean rounded-xl px-2.5 sm:px-3.5 h-9 sm:h-11 flex items-center space-x-2 sm:space-x-2.5 shadow-sm cursor-pointer hover:bg-white/95 active:scale-95 transition-all select-none"
              title="IndoSkySea - Klik untuk reset ke tampilan Indonesia"
            >
              <img
                src="/favicon-96x96.png"
                alt="IndoSkySea Logo"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg object-contain shadow-2xs shrink-0"
              />
              <span className="text-xs sm:text-[13px] font-black tracking-wider text-slate-800 uppercase whitespace-nowrap">
                IndoSkySea
              </span>
            </div>

            {/* Desktop Search Input (>= lg) */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Cari Pesawat, Maskapai, Kapal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-clean pl-9 pr-8 h-10 md:h-11 text-xs rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-44 xl:w-56 transition-all shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 md:top-4" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-3.5 md:top-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Center: Unified Entity Toggles + Regional Filters (Single Row on Desktop >= lg) */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 glass-clean p-1 rounded-xl shadow-sm pointer-events-auto shrink-0 overflow-x-auto no-scrollbar">
            
            {/* Toggle Pesawat */}
            <button
              onClick={() => setShowPlanes(!showPlanes)}
              className={`h-9 px-2.5 xl:px-3 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                showPlanes
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5 shrink-0" />
              <span>Pesawat</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${showPlanes ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {planes.length}
              </span>
            </button>

            {/* Toggle Kapal */}
            <button
              onClick={() => setShowShips(!showShips)}
              className={`h-9 px-2.5 xl:px-3 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                showShips
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Ship className="w-3.5 h-3.5 shrink-0" />
              <span>Kapal</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${showShips ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {ships.length}
              </span>
            </button>

            {/* Subtle Divider */}
            <div className="h-4.5 w-px bg-slate-300/80 mx-0.5 shrink-0" />

            {/* Regional Presets with Flags */}
            {REGION_PRESETS.map((preset) => {
              const FlagComponent = preset.flag;
              const isActive = activeRegion === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleJumpRegion(preset)}
                  className={`h-9 px-2.5 xl:px-3 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <FlagComponent className="w-4 h-2.5 shrink-0" />
                  <span>{preset.name}</span>
                </button>
              );
            })}

            {/* Subtle Divider */}
            <div className="h-4.5 w-px bg-slate-300/80 mx-0.5 shrink-0" />

            {/* Disclaimer Button in Desktop Ribbon */}
            <button
              onClick={() => setShowDisclaimerModal(true)}
              className="h-9 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all shrink-0 whitespace-nowrap"
              title="Ketentuan Penggunaan & Disclaimer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Disclaimer</span>
            </button>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center space-x-1.5 pointer-events-auto shrink-0">
            {/* Mobile Search Toggle Button (< lg) */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className={`lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                showMobileSearch || searchQuery
                  ? 'bg-sky-600 text-white shadow-sky-600/25'
                  : 'glass-clean text-slate-600 hover:text-sky-600'
              }`}
              title="Cari Pesawat / Kapal"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* PWA Install Button */}
            <button
              onClick={() => setShowInstallModal(true)}
              className="glass-clean w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors shadow-sm"
              title="Install Aplikasi IndoSkySea (PWA)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Google Maps Layer Switcher */}
            <button
              onClick={() => setTileMode(tileMode === 'roadmap' ? 'satellite' : 'roadmap')}
              className="glass-clean w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors shadow-sm"
              title={tileMode === 'roadmap' ? 'Ganti ke Google Satelit Hybrid' : 'Ganti ke Google Maps Standar'}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="glass-clean w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              title="Segarkan Radar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Search Input Bar (Smooth slide-down below header on mobile) */}
        {showMobileSearch && (
          <div className="lg:hidden pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative glass-clean rounded-xl p-1 shadow-md">
              <input
                type="text"
                autoFocus
                placeholder="Cari Pesawat, Maskapai, Kapal, Bandara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-9 pr-9 h-9 sm:h-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile-Only Filter Strip (Only shown on < lg screens. On desktop, this is unified into 1 line above!) */}
        <div className="lg:hidden pointer-events-auto max-w-full">
          <div className="glass-clean p-1 rounded-xl shadow-sm flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar max-w-full">
            
            {/* Mobile Entity Toggles */}
            <div className="flex items-center space-x-1 shrink-0">
              {/* Toggle Pesawat (Mobile) */}
              <button
                onClick={() => setShowPlanes(!showPlanes)}
                className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                  showPlanes
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white/95 text-slate-600 hover:bg-white border border-slate-200/90'
                }`}
              >
                <Plane className="w-3.5 h-3.5 shrink-0" />
                <span>Pesawat</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${showPlanes ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {planes.length}
                </span>
              </button>

              {/* Toggle Kapal (Mobile) */}
              <button
                onClick={() => setShowShips(!showShips)}
                className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                  showShips
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white/95 text-slate-600 hover:bg-white border border-slate-200/90'
                }`}
              >
                <Ship className="w-3.5 h-3.5 shrink-0" />
                <span>Kapal</span>
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${showShips ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {ships.length}
                </span>
              </button>

              {/* Subtle Vertical Divider between Entity and Region Filters */}
              <div className="h-4.5 w-px bg-slate-300/80 mx-0.5 shrink-0" />
            </div>

            {/* Regional Presets with Authentic Country Flags */}
            {REGION_PRESETS.map((preset) => {
              const FlagComponent = preset.flag;
              const isActive = activeRegion === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleJumpRegion(preset)}
                  className={`h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <FlagComponent className="w-4 h-2.5 sm:w-4.5 sm:h-3 shrink-0" />
                  <span className="sm:hidden">{preset.shortName}</span>
                  <span className="hidden sm:inline">{preset.name}</span>
                </button>
              );
            })}

            {/* Subtle Divider */}
            <div className="h-4.5 w-px bg-slate-300/80 mx-0.5 shrink-0" />

            {/* Disclaimer & Info Button */}
            <button
              onClick={() => setShowDisclaimerModal(true)}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-all shrink-0 whitespace-nowrap text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              title="Ketentuan Penggunaan & Disclaimer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Disclaimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Detail Telemetri / Mobile Bottom Sheet */}
      {currentSelectedData && (
        <div
          className={`fixed z-30 transition-all duration-300 ease-out pointer-events-auto flex flex-col
            /* Desktop (md: and above): Floating Card with strictly bounded height for smooth scrolling */
            md:bottom-5 md:right-4 md:left-auto md:w-[430px] md:h-[82vh] md:max-h-[82vh] md:rounded-2xl md:shadow-2xl md:border md:border-slate-200/90 md:overflow-hidden
            /* Mobile (< md:): Full-width Bottom Sheet docked at bottom, left-0, right-0, with rounded corners at top-left & top-right ONLY */
            max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:rounded-t-[28px] max-md:rounded-b-none max-md:shadow-[0_-10px_35px_rgba(0,0,0,0.14)]
            ${mobileSheetExpanded
              ? 'max-md:h-[88dvh] max-md:max-h-[88dvh]'
              : 'max-md:h-[195px] max-md:max-h-[195px]'
            }
          `}
        >
          <div className="glass-clean-card flex-1 min-h-0 md:rounded-2xl max-md:rounded-t-[28px] max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0 max-md:border-t max-md:border-slate-200/90 flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl">
            
            {/* Mobile Pull Handle Pill (Minimal sleek pill bar, no text, rounded top) */}
            <div
              className="md:hidden pt-3 pb-2 px-4 cursor-grab active:cursor-grabbing flex justify-center items-center select-none bg-slate-50/80 border-b border-slate-100/90 max-md:rounded-t-[28px]"
              onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors"></div>
            </div>

            {/* Header: Official Vector Logo, Full Genuine Name & Close Button */}
            <div className="p-4 pb-3 border-b border-slate-100 flex items-start justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                {activeLogo && (
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shadow-xs border border-slate-100 flex items-center justify-center p-1 bg-white shrink-0"
                    dangerouslySetInnerHTML={{ __html: activeLogo.svg }}
                  />
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      {selectedEntity.type === 'plane'
                        ? (currentSelectedData.realName || currentSelectedData.callsign)
                        : (currentSelectedData.fullName || currentSelectedData.name)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedEntity.type === 'plane'
                      ? `${currentSelectedData.aircraftModel} • ${currentSelectedData.airlineName || currentSelectedData.country}`
                      : `${currentSelectedData.type} • ${currentSelectedData.operator || currentSelectedData.flagName}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEntity(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Tutup Detail"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Mobile Collapsed State: Concise Route & Mini Telemetry Preview */}
            {!mobileSheetExpanded && (
              <div
                className="md:hidden px-4 py-2.5 space-y-2 cursor-pointer"
                onClick={() => setMobileSheetExpanded(true)}
              >
                {/* Quick Route Preview */}
                <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-bold text-slate-800 truncate max-w-[125px]">
                      {currentSelectedData.origin?.city} ({currentSelectedData.origin?.code})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400 font-semibold px-2">
                    <span>➔</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    <span className="font-bold text-slate-800 truncate max-w-[125px]">
                      {currentSelectedData.destination?.city} ({currentSelectedData.destination?.code})
                    </span>
                  </div>
                </div>

                {/* Quick Mini Telemetry Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                  <span>
                    {selectedEntity.type === 'plane'
                      ? `Ketinggian: ${currentSelectedData.altitudeFeet?.toLocaleString() || '-'} ft • Kecepatan: ${currentSelectedData.velocity || 0} kts`
                      : `Kecepatan: ${currentSelectedData.sog || 0} kts • Haluan: ${currentSelectedData.cog || 0}°`}
                  </span>
                  <span className="text-sky-600 font-semibold flex items-center space-x-0.5">
                    <span>Detail</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}

            {/* Scrollable Full Details (Visible on Desktop OR when Mobile Sheet is Expanded) */}
            <div className={`flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 ${!mobileSheetExpanded ? 'hidden md:block' : 'block'}`}>
              
              {/* Trajectory & Detailed Navigation Route Section */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-700 tracking-wider flex items-center space-x-1.5">
                    <Route className="w-3.5 h-3.5 text-sky-600" />
                    <span>Rute Navigasi Lengkap</span>
                  </span>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md">
                    {selectedEntity.type === 'plane' ? 'Jalur Penerbangan' : 'Pelayaran Laut'}
                  </span>
                </div>

                {/* Origin Airport / Seaport */}
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{selectedEntity.type === 'plane' ? 'Bandara Keberangkatan (Asal)' : 'Pelabuhan Asal'}</span>
                    </span>
                    {currentSelectedData.origin?.code && (
                      <span className="text-[11px] font-mono font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {currentSelectedData.origin.code}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {currentSelectedData.origin?.city || 'Kota Asal'}, {currentSelectedData.origin?.country}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {currentSelectedData.origin?.name || 'Bandara Keberangkatan'}
                  </div>
                </div>

                {/* Visual Connecting Divider */}
                <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-semibold py-0.5">
                  <span className="w-12 h-px bg-slate-300"></span>
                  <span className="flex items-center space-x-1 text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    <span>Sedang Menuju</span>
                    <ArrowDownRight className="w-3 h-3 text-sky-600" />
                  </span>
                  <span className="w-12 h-px bg-slate-300"></span>
                </div>

                {/* Destination Airport / Seaport */}
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>{selectedEntity.type === 'plane' ? 'Bandara Tujuan (Pendaratan)' : 'Pelabuhan Tujuan'}</span>
                    </span>
                    {currentSelectedData.destination?.code && (
                      <span className="text-[11px] font-mono font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {currentSelectedData.destination.code}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {currentSelectedData.destination?.city || 'Kota Tujuan'}, {currentSelectedData.destination?.country}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {currentSelectedData.destination?.name || 'Bandara Pendaratan'}
                  </div>
                </div>

                {/* Trajectory Color Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-4 h-0.5 ${selectedEntity.type === 'plane' ? 'bg-amber-500' : 'bg-sky-600'}`}></span>
                    <span>Sudah Dilewati (Garis Lurus)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-4 h-0.5 border-b-2 border-dashed ${selectedEntity.type === 'plane' ? 'border-amber-500' : 'border-sky-600'}`}></span>
                    <span>Menuju Tujuan (Putus-putus)</span>
                  </div>
                </div>
              </div>

              {/* Metric Stats Cards */}
              {selectedEntity.type === 'plane' ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Altitude */}
                    <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100 min-h-[72px] flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-slate-500 block">Ketinggian Jelajah</span>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {currentSelectedData.altitudeFeet ? `${currentSelectedData.altitudeFeet.toLocaleString()} ft` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({currentSelectedData.altitude ? `${currentSelectedData.altitude.toLocaleString()} m` : '-'})
                      </span>
                    </div>

                    {/* Velocity */}
                    <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100 min-h-[72px] flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-slate-500 block">Kecepatan Udara</span>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {currentSelectedData.velocity ? `${currentSelectedData.velocity} kts` : '0 kts'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({currentSelectedData.velocity ? `${Math.round(currentSelectedData.velocity * 1.852)} km/h` : '-'})
                      </span>
                    </div>

                    {/* Heading */}
                    <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100 min-h-[72px] flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-slate-500 block">Arah (Heading)</span>
                      <span className="text-base font-bold text-slate-900 font-mono flex items-center space-x-1">
                        <Compass className="w-4 h-4 text-slate-400 inline" />
                        <span>{currentSelectedData.heading}&deg;</span>
                      </span>
                    </div>

                    {/* Vertical Speed */}
                    <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100 min-h-[72px] flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-slate-500 block">Laju Vertikal</span>
                      <span className={`text-base font-bold font-mono flex items-center space-x-1 ${
                        currentSelectedData.verticalRate > 0
                          ? 'text-emerald-600'
                          : currentSelectedData.verticalRate < 0
                          ? 'text-rose-600'
                          : 'text-slate-800'
                      }`}>
                        {currentSelectedData.verticalRate > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : currentSelectedData.verticalRate < 0 ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{currentSelectedData.verticalRate} m/s</span>
                      </span>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="text-xs text-slate-600 divide-y divide-slate-100">
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Kode Registrasi (Ekor):</span>
                      <span className="font-mono font-semibold text-slate-800">{currentSelectedData.registration || 'AIRCRAFT'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Model Pesawat:</span>
                      <span className="font-semibold text-slate-800">{currentSelectedData.aircraftModel}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Squawk Transponder:</span>
                      <span className="font-mono font-semibold text-slate-800">{currentSelectedData.squawk || '1200'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Posisi Koordinat Real-Time:</span>
                      <span className="font-mono text-slate-700">
                        {currentSelectedData.latitude.toFixed(4)}, {currentSelectedData.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Vessel Details */
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100 min-h-[72px] flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-slate-500 block">Kecepatan (SOG)</span>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {currentSelectedData.sog || 0} knots
                      </span>
                    </div>

                    <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100 min-h-[72px] flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-slate-500 block">Haluan (COG)</span>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {currentSelectedData.cog || 0}&deg;
                      </span>
                    </div>

                    <div className="col-span-2 bg-slate-50/80 rounded-lg p-3.5 border border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500 block">Operator Pelayaran</span>
                      <span className="text-sm font-bold text-slate-800">
                        {currentSelectedData.operator || 'Operator Maritim Global'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 divide-y divide-slate-100">
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Nomor MMSI:</span>
                      <span className="font-mono font-semibold text-slate-800">{currentSelectedData.mmsi}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Bendera / Registrasi:</span>
                      <span className="font-medium text-slate-800">{currentSelectedData.flagName || 'International'} ({currentSelectedData.flag || 'UN'})</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Status Navigasi:</span>
                      <span className="font-medium text-slate-800">{currentSelectedData.navStatus || 'Under way'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Posisi Koordinat Real-Time:</span>
                      <span className="font-mono text-slate-700">
                        {currentSelectedData.latitude.toFixed(4)}, {currentSelectedData.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer: Kunci Kamera ke Armada (Always visible on desktop and expanded mobile) */}
            <div className={`p-3.5 sm:p-4 border-t border-slate-100/90 bg-white/95 backdrop-blur-md shrink-0 ${!mobileSheetExpanded ? 'hidden md:block' : 'block'}`}>
              <button
                onClick={handleCenterOnEntity}
                className={`w-full h-11 rounded-xl text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 cursor-pointer ${
                  selectedEntity.type === 'plane'
                    ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                    : 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
                }`}
              >
                <Navigation className="w-4 h-4 text-sky-400" />
                <span>
                  {selectedEntity.type === 'plane' ? 'Kunci Kamera ke Pesawat Ini' : 'Kunci Kamera ke Kapal Ini'}
                </span>
              </button>

              {/* Mobile Collapse Button */}
              <button
                onClick={() => setMobileSheetExpanded(false)}
                className="md:hidden w-full h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all mt-2 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Ciutkan Detail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Ketentuan Penggunaan & Emergency Monitoring Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
        onAccept={() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('indoskysea_disclaimer_accepted_v1', 'true');
          }
          setShowDisclaimerModal(false);
        }}
      />

      {/* 5. PWA Install Guide & Trigger Modal (Windows, Android & iOS) */}
      <PwaInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setDeferredPrompt(null)}
      />
    </div>
  );
}

