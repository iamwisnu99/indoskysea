'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Plane,
  Ship,
  Layers,
  Radio,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Navigation,
  Compass,
  Gauge,
  MapPin,
  Anchor,
  Maximize2,
  Minimize2,
  Sliders,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Tile provider options
const MAP_LAYERS = {
  dark: {
    name: 'Radar Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satelit Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: '',
    maxZoom: 18,
  },
};

// Preset locations in Indonesia
const PRESET_LOCATIONS = [
  { name: 'Nusantara (Full)', coords: [-2.5489, 118.0149], zoom: 5 },
  { name: 'Selat Malaka / SG', coords: [1.25, 103.85], zoom: 9 },
  { name: 'Selat Sunda (Merak-Bakauheni)', coords: [-5.9, 105.95], zoom: 10 },
  { name: 'Jakarta Airspace & Priok', coords: [-6.15, 106.85], zoom: 10 },
  { name: 'Laut Jawa / Surabaya', coords: [-7.1, 112.75], zoom: 9 },
  { name: 'Selat Bali & Denpasar', coords: [-8.4, 115.1], zoom: 9 },
  { name: 'Selat Makassar', coords: [-3.5, 118.8], zoom: 7 },
];

export default function MapTracker() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const planeMarkersRef = useRef(new Map());
  const shipMarkersRef = useRef(new Map());

  // Data states
  const [planes, setPlanes] = useState([]);
  const [ships, setShips] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [loadingShips, setLoadingShips] = useState(false);
  const [planesStatus, setPlanesStatus] = useState({ online: true, source: 'idle', count: 0, lastUpdated: null });
  const [shipsStatus, setShipsStatus] = useState({ online: true, source: 'idle', count: 0, keyConfigured: false, lastUpdated: null });

  // UI Control states
  const [showPlanes, setShowPlanes] = useState(true);
  const [showShips, setShowShips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTile, setActiveTile] = useState('dark');
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'plane'|'ship', data: {...} }
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(15); // seconds (0 = off)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined') return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      // Ensure container exists
      if (!mapContainerRef.current) return;

      // Indonesia Center: [-2.5489, 118.0149], Zoom: 5
      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
        minZoom: 3,
        maxZoom: 18,
      });

      // Add Zoom control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Tile Layer
      const baseConfig = MAP_LAYERS[activeTile] || MAP_LAYERS.dark;
      const tileLayer = L.tileLayer(baseConfig.url, {
        attribution: baseConfig.attribution,
        subdomains: baseConfig.subdomains,
        maxZoom: baseConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Close inspector when clicking empty map space
      map.on('click', (e) => {
        // If clicked on empty area, deselect entity
        if (e.originalEvent?.target?.classList?.contains('leaflet-container')) {
          setSelectedEntity(null);
        }
      });
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Layer Switching
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    async function switchLayer() {
      const L = (await import('leaflet')).default;
      const newConfig = MAP_LAYERS[activeTile] || MAP_LAYERS.dark;
      mapInstanceRef.current.removeLayer(tileLayerRef.current);

      tileLayerRef.current = L.tileLayer(newConfig.url, {
        attribution: newConfig.attribution,
        subdomains: newConfig.subdomains,
        maxZoom: newConfig.maxZoom,
      }).addTo(mapInstanceRef.current);
    }
    switchLayer();
  }, [activeTile]);

  // Fetch Planes from internal Route Handler /api/planes
  const fetchPlanes = useCallback(async () => {
    setLoadingPlanes(true);
    try {
      const res = await fetch('/api/planes', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPlanes(json.data);
        setPlanesStatus({
          online: true,
          source: json.source || 'opensky',
          count: json.data.length,
          lastUpdated: new Date().toLocaleTimeString(),
          rateLimitNotice: json.rateLimitNotice,
        });
      } else {
        throw new Error(json.warning || 'Format data pesawat tidak valid');
      }
    } catch (err) {
      console.error('Error fetching planes:', err);
      setPlanesStatus((prev) => ({
        ...prev,
        online: false,
        error: err.message,
      }));
    } finally {
      setLoadingPlanes(false);
    }
  }, []);

  // Fetch Ships from internal Route Handler /api/ships
  const fetchShips = useCallback(async () => {
    setLoadingShips(true);
    try {
      const res = await fetch('/api/ships', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShips(json.data);
        setShipsStatus({
          online: true,
          source: json.source || 'ais',
          count: json.data.length,
          keyConfigured: Boolean(json.keyConfigured),
          notice: json.notice,
          lastUpdated: new Date().toLocaleTimeString(),
        });
      } else {
        throw new Error(json.notice || 'Format data kapal tidak valid');
      }
    } catch (err) {
      console.error('Error fetching ships:', err);
      setShipsStatus((prev) => ({
        ...prev,
        online: false,
        error: err.message,
      }));
    } finally {
      setLoadingShips(false);
    }
  }, []);

  // Initial fetch and auto-refresh interval
  useEffect(() => {
    fetchPlanes();
    fetchShips();
  }, [fetchPlanes, fetchShips]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchPlanes();
      fetchShips();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchPlanes, fetchShips]);

  // Render & Update Plane Markers on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    let isSubscribed = true;

    async function updatePlaneMarkers() {
      const L = (await import('leaflet')).default;
      if (!isSubscribed || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;
      const existing = planeMarkersRef.current;
      const currentIds = new Set();

      if (!showPlanes) {
        // Remove all planes if layer is hidden
        existing.forEach((marker) => map.removeLayer(marker));
        existing.clear();
        return;
      }

      // Filter planes by search query if present
      const query = searchQuery.trim().toLowerCase();
      const filteredPlanes = planes.filter((p) => {
        if (!query) return true;
        return (
          p.callsign?.toLowerCase().includes(query) ||
          p.id?.toLowerCase().includes(query) ||
          p.country?.toLowerCase().includes(query)
        );
      });

      filteredPlanes.forEach((plane) => {
        currentIds.add(plane.id);
        const heading = plane.heading || 0;
        const isSelected = selectedEntity?.type === 'plane' && selectedEntity?.data?.id === plane.id;

        // Custom HTML for aerodynamic airplane marker
        const iconHtml = `
          <div class="marker-plane-wrapper group" style="width: 32px; height: 32px;">
            ${isSelected ? '<div class="absolute inset-0 rounded-full bg-amber-400 opacity-60 radar-ping-ring"></div>' : ''}
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-300"
                 style="transform: rotate(${heading}deg);">
              <svg viewBox="0 0 24 24" class="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.85)] filter hover:scale-125 transition-transform" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-900/90 text-amber-300 rounded border border-amber-500/30 whitespace-nowrap shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              ${plane.callsign}
            </div>
          </div>
        `;

        const planeIcon = L.divIcon({
          html: iconHtml,
          className: 'plane-custom-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        // Popup HTML content
        const popupContent = `
          <div class="p-3.5 min-w-[240px] text-xs font-sans">
            <div class="flex items-center justify-between pb-2 border-b border-slate-700/80 mb-2">
              <div class="flex items-center space-x-1.5">
                <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span class="font-bold text-sm text-amber-400 font-mono">${plane.callsign}</span>
              </div>
              <span class="px-2 py-0.5 text-[10px] uppercase font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">ADS-B</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-slate-300 mb-2.5">
              <div>
                <span class="text-slate-400 text-[10px] block">ICAO 24-bit</span>
                <span class="font-mono font-medium text-slate-100">${plane.id.toUpperCase()}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Asal / Registrasi</span>
                <span class="font-medium text-slate-100">${plane.country}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Ketinggian</span>
                <span class="font-mono font-medium text-amber-300">${plane.altitudeFeet ? plane.altitudeFeet.toLocaleString() + ' ft' : (plane.altitude ? plane.altitude + ' m' : 'N/A')}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Kecepatan</span>
                <span class="font-mono font-medium text-slate-100">${plane.velocity ? plane.velocity + ' kts' : '0 kts'} <span class="text-[10px] text-slate-400">(${plane.velocityKmh || 0} km/h)</span></span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Arah (Heading)</span>
                <span class="font-mono font-medium text-slate-100">${plane.heading}&deg;</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Vertical Rate</span>
                <span class="font-mono font-medium ${plane.verticalRate > 0 ? 'text-emerald-400' : (plane.verticalRate < 0 ? 'text-rose-400' : 'text-slate-100')}">
                  ${plane.verticalRate > 0 ? '▲ +' : (plane.verticalRate < 0 ? '▼ ' : '')}${plane.verticalRate} m/s
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Pos: ${plane.latitude.toFixed(3)}, ${plane.longitude.toFixed(3)}</span>
              <span>Squawk: ${plane.squawk || '----'}</span>
            </div>
          </div>
        `;

        if (existing.has(plane.id)) {
          const marker = existing.get(plane.id);
          marker.setLatLng([plane.latitude, plane.longitude]);
          marker.setIcon(planeIcon);
          marker.setPopupContent(popupContent);
        } else {
          const marker = L.marker([plane.latitude, plane.longitude], { icon: planeIcon })
            .bindPopup(popupContent, { maxWidth: 300, minWidth: 240 })
            .addTo(map);

          marker.on('click', () => {
            setSelectedEntity({ type: 'plane', data: plane });
          });

          existing.set(plane.id, marker);
        }
      });

      // Cleanup departed planes
      existing.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          map.removeLayer(marker);
          existing.delete(id);
        }
      });
    }

    updatePlaneMarkers();

    return () => {
      isSubscribed = false;
    };
  }, [planes, showPlanes, searchQuery, selectedEntity]);

  // Render & Update Ship Markers on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    let isSubscribed = true;

    async function updateShipMarkers() {
      const L = (await import('leaflet')).default;
      if (!isSubscribed || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;
      const existing = shipMarkersRef.current;
      const currentIds = new Set();

      if (!showShips) {
        existing.forEach((marker) => map.removeLayer(marker));
        existing.clear();
        return;
      }

      const query = searchQuery.trim().toLowerCase();
      const filteredShips = ships.filter((s) => {
        if (!query) return true;
        return (
          s.name?.toLowerCase().includes(query) ||
          String(s.mmsi).includes(query) ||
          s.type?.toLowerCase().includes(query) ||
          s.destination?.toLowerCase().includes(query)
        );
      });

      filteredShips.forEach((ship) => {
        currentIds.add(ship.mmsi);
        const heading = ship.heading || ship.cog || 0;
        const isSelected = selectedEntity?.type === 'ship' && selectedEntity?.data?.mmsi === ship.mmsi;

        // Custom HTML for modern vessel/ship marker
        const iconHtml = `
          <div class="marker-ship-wrapper group" style="width: 28px; height: 28px;">
            ${isSelected ? '<div class="absolute inset-0 rounded-full bg-cyan-400 opacity-60 radar-ping-ring"></div>' : ''}
            <div class="relative flex items-center justify-center w-7 h-7 rounded-full transition-transform duration-300"
                 style="transform: rotate(${heading}deg);">
              <svg viewBox="0 0 24 24" class="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.85)] filter hover:scale-125 transition-transform" fill="currentColor">
                <!-- Sleek pointed vessel bow silhouette -->
                <path d="M12 2L6 8v11a2 2 0 002 2h8a2 2 0 002-2V8l-6-6zm0 3.5l3.5 3.5h-7L12 5.5zM8 11h8v7H8v-7z"/>
              </svg>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-900/90 text-cyan-300 rounded border border-cyan-500/30 whitespace-nowrap shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              ${ship.name}
            </div>
          </div>
        `;

        const shipIcon = L.divIcon({
          html: iconHtml,
          className: 'ship-custom-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const popupContent = `
          <div class="p-3.5 min-w-[250px] text-xs font-sans">
            <div class="flex items-center justify-between pb-2 border-b border-slate-700/80 mb-2">
              <div class="flex items-center space-x-1.5">
                <span class="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span class="font-bold text-sm text-cyan-400 truncate max-w-[160px]">${ship.name}</span>
              </div>
              <span class="px-2 py-0.5 text-[10px] uppercase font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full">AIS</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-slate-300 mb-2.5">
              <div>
                <span class="text-slate-400 text-[10px] block">MMSI</span>
                <span class="font-mono font-medium text-slate-100">${ship.mmsi}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Bendera / Negara</span>
                <span class="font-medium text-slate-100 flex items-center gap-1">
                  <span class="font-bold text-cyan-300 text-[10px]">${ship.flag || 'ID'}</span> ${ship.flagName || 'Indonesia'}
                </span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Tipe Kapal</span>
                <span class="font-medium text-cyan-300 truncate block">${ship.type || 'Vessel'}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Kecepatan (SOG)</span>
                <span class="font-mono font-medium text-slate-100">${ship.sog || 0} knots</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Arah (COG)</span>
                <span class="font-mono font-medium text-slate-100">${ship.cog || 0}&deg;</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Status Navigasi</span>
                <span class="text-[11px] font-medium text-slate-200 truncate block">${ship.navStatus || 'Under way'}</span>
              </div>
            </div>

            ${ship.destination ? `
              <div class="bg-slate-800/60 rounded px-2 py-1 mb-2 text-[11px] border border-slate-700/50">
                <span class="text-slate-400 text-[9px] block">Destinasi Pelabuhan</span>
                <span class="text-slate-200 font-medium">${ship.destination}</span>
              </div>
            ` : ''}

            <div class="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Pos: ${ship.latitude.toFixed(3)}, ${ship.longitude.toFixed(3)}</span>
            </div>
          </div>
        `;

        if (existing.has(ship.mmsi)) {
          const marker = existing.get(ship.mmsi);
          marker.setLatLng([ship.latitude, ship.longitude]);
          marker.setIcon(shipIcon);
          marker.setPopupContent(popupContent);
        } else {
          const marker = L.marker([ship.latitude, ship.longitude], { icon: shipIcon })
            .bindPopup(popupContent, { maxWidth: 320, minWidth: 250 })
            .addTo(map);

          marker.on('click', () => {
            setSelectedEntity({ type: 'ship', data: ship });
          });

          existing.set(ship.mmsi, marker);
        }
      });

      // Cleanup
      existing.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          map.removeLayer(marker);
          existing.delete(id);
        }
      });
    }

    updateShipMarkers();

    return () => {
      isSubscribed = false;
    };
  }, [ships, showShips, searchQuery, selectedEntity]);

  // Jump to location
  const handleJumpTo = (coords, zoom) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(coords, zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  };

  // Center on selected entity
  const handleCenterOnEntity = () => {
    if (!selectedEntity || !mapInstanceRef.current) return;
    const { data } = selectedEntity;
    mapInstanceRef.current.flyTo([data.latitude, data.longitude], 12, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-radar-bg font-sans">
      {/* 1. Leaflet Interactive Map Container */}
      <div id="radar-map" ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* 2. Top-Left Floating Header & Radar Brand */}
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2 max-w-sm pointer-events-auto">
        <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 shadow-inner">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase">NUSANTARA RADAR</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">ADS-B (Udara) &bull; AIS (Laut) Indonesia</p>
            </div>
          </div>

          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
            title={isPanelCollapsed ? 'Tampilkan Kontrol' : 'Sembunyikan Kontrol'}
          >
            {isPanelCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari Callsign, MMSI, Nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-panel pl-9 pr-8 py-2 text-xs rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all shadow-lg"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Top-Right Control & Filter Panel */}
      <div className={`absolute top-4 right-4 z-20 w-80 max-w-[calc(100vw-2rem)] transition-all duration-300 pointer-events-auto ${isPanelCollapsed ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 backdrop-blur-md space-y-4">
          
          {/* Layer Toggles & Real-time Counters */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Layer Pelacakan Aktif
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Flight Toggle */}
              <button
                onClick={() => setShowPlanes(!showPlanes)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  showPlanes
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Plane className={`w-4 h-4 ${showPlanes ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold">Pesawat</span>
                </div>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-400">
                  {loadingPlanes ? '...' : planes.length}
                </span>
              </button>

              {/* Ship Toggle */}
              <button
                onClick={() => setShowShips(!showShips)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  showShips
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Ship className={`w-4 h-4 ${showShips ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold">Kapal</span>
                </div>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-cyan-400">
                  {loadingShips ? '...' : ships.length}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Preset Location Focus */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Fokus Wilayah Strategis
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJumpTo(loc.coords, loc.zoom)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition-colors flex items-center space-x-1"
                >
                  <MapPin className="w-2.5 h-2.5 text-sky-400" />
                  <span>{loc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tile Layer Chooser */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Tampilan Peta
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(MAP_LAYERS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setActiveTile(key)}
                  className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all text-center ${
                    activeTile === key
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Connection Status & Manual Refresh */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${planesStatus.online ? 'bg-amber-400' : 'bg-rose-500'}`}></span>
                <span className="text-slate-300">ADS-B OpenSky:</span>
              </div>
              <span className="font-mono text-slate-400">{planesStatus.source}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${shipsStatus.online ? 'bg-cyan-400' : 'bg-rose-500'}`}></span>
                <span className="text-slate-300">AIS AISStream:</span>
              </div>
              <span className="font-mono text-slate-400">{shipsStatus.source}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setStatusModalOpen(true)}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1 underline underline-offset-2"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Info Keamanan & API</span>
              </button>

              <button
                onClick={() => {
                  fetchPlanes();
                  fetchShips();
                }}
                disabled={loadingPlanes || loadingShips}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center space-x-1.5 shadow transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${(loadingPlanes || loadingShips) ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Telemetry Bar */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center space-x-2 text-xs font-mono text-slate-400 pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-white/10 flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-200">BBOX: 11.0°S - 6.0°N / 95.0°E - 141.0°E</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>Pesawat: <strong className="text-amber-400">{planes.length}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Kapal: <strong className="text-cyan-400">{ships.length}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Pembaruan: {planesStatus.lastUpdated || '-'}</span>
        </div>
      </div>

      {/* 5. Selected Entity Detail Inspector Drawer (Right Side) */}
      {selectedEntity && (
        <div className="absolute bottom-4 right-4 md:bottom-auto md:top-20 md:right-4 z-30 w-84 max-w-[calc(100vw-2rem)] glass-panel rounded-2xl p-4 shadow-2xl border border-white/15 animate-in slide-in-from-right-4 duration-200 pointer-events-auto">
          <div className="flex items-start justify-between pb-3 border-b border-slate-700/80 mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-xl ${selectedEntity.type === 'plane' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'}`}>
                {selectedEntity.type === 'plane' ? <Plane className="w-5 h-5" /> : <Ship className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {selectedEntity.type === 'plane' ? 'Penerbangan ADS-B' : 'Kapal Laut AIS'}
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedEntity.type === 'plane' ? selectedEntity.data.callsign : selectedEntity.data.name}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedEntity.type === 'plane' ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Ketinggian</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {selectedEntity.data.altitudeFeet ? selectedEntity.data.altitudeFeet.toLocaleString() + ' ft' : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">({selectedEntity.data.altitude || 0} m)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kecepatan Udara</span>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    {selectedEntity.data.velocity || 0} kts
                  </span>
                  <span className="text-[10px] text-slate-500 block">({selectedEntity.data.velocityKmh || 0} km/h)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Heading (Arah)</span>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    {selectedEntity.data.heading}&deg;
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Vertical Climb/Desc</span>
                  <span className={`text-sm font-bold font-mono ${selectedEntity.data.verticalRate > 0 ? 'text-emerald-400' : (selectedEntity.data.verticalRate < 0 ? 'text-rose-400' : 'text-slate-100')}`}>
                    {selectedEntity.data.verticalRate} m/s
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">ICAO Transponder:</span>
                  <span className="font-mono text-slate-200">{selectedEntity.data.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Negara Registrasi:</span>
                  <span className="text-slate-200">{selectedEntity.data.country}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Squawk Code:</span>
                  <span className="font-mono text-amber-400">{selectedEntity.data.squawk || '----'}</span>
                </div>
                <div className="flex justify-between py-1 text-[11px]">
                  <span className="text-slate-400">Koordinat:</span>
                  <span className="font-mono text-slate-200">{selectedEntity.data.latitude.toFixed(4)}, {selectedEntity.data.longitude.toFixed(4)}</span>
                </div>
              </div>

              <button
                onClick={handleCenterOnEntity}
                className="w-full mt-2 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <Navigation className="w-4 h-4" />
                <span>Kunci Kamera ke Pesawat Ini</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Kecepatan (SOG)</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {selectedEntity.data.sog || 0} kts
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Course (COG)</span>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    {selectedEntity.data.cog || 0}&deg;
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block">Tipe Kapal</span>
                  <span className="text-sm font-bold text-slate-100">
                    {selectedEntity.data.type || 'Vessel'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">MMSI:</span>
                  <span className="font-mono text-slate-200">{selectedEntity.data.mmsi}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Bendera:</span>
                  <span className="text-slate-200 font-medium">{selectedEntity.data.flagName || 'Indonesia'} ({selectedEntity.data.flag || 'ID'})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                  <span className="text-slate-400">Status Navigasi:</span>
                  <span className="text-slate-200 truncate max-w-[150px]">{selectedEntity.data.navStatus || 'Under way'}</span>
                </div>
                {selectedEntity.data.destination && (
                  <div className="flex justify-between py-1 border-b border-slate-800 text-[11px]">
                    <span className="text-slate-400">Tujuan:</span>
                    <span className="text-cyan-300 font-medium">{selectedEntity.data.destination}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-[11px]">
                  <span className="text-slate-400">Koordinat:</span>
                  <span className="font-mono text-slate-200">{selectedEntity.data.latitude.toFixed(4)}, {selectedEntity.data.longitude.toFixed(4)}</span>
                </div>
              </div>

              <button
                onClick={handleCenterOnEntity}
                className="w-full mt-2 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <Anchor className="w-4 h-4" />
                <span>Kunci Kamera ke Kapal Ini</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Security & API Information Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-white/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Arsitektur Keamanan & API Vercel</span>
              </h3>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>100% Proteksi API Key di Server Vercel</span>
                </div>
                <p className="text-slate-400">
                  Seluruh API Key (<code className="text-slate-200">AISSTREAM_API_KEY</code>, <code className="text-slate-200">OPENSKY_USERNAME</code>, <code className="text-slate-200">OPENSKY_PASSWORD</code>) dieksekusi eksklusif di server Node.js Next.js Route Handlers (<code className="text-slate-200">/app/api</code>). Browser klien hanya mengakses proxy internal dan tidak dapat melihat token via DevTools.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">Cara Menghubungkan Live API di Vercel:</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Buat akun gratis di <a href="https://aisstream.io" target="_blank" rel="noreferrer" className="text-sky-400 underline">Aisstream.io</a> untuk mendapatkan API Key.</li>
                  <li>Di Dashboard Proyek Vercel, buka tab <strong>Settings &rarr; Environment Variables</strong>.</li>
                  <li>Tambahkan variable <code className="text-sky-300">AISSTREAM_API_KEY</code> dengan API Key Anda.</li>
                  <li>(Opsional) Tambahkan <code className="text-sky-300">OPENSKY_USERNAME</code> &amp; <code className="text-sky-300">OPENSKY_PASSWORD</code> untuk batas kuota OpenSky yang lebih tinggi.</li>
                </ol>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg text-amber-200/90 text-[11px]">
                💡 Saat API Key belum dikonfigurasi, sistem secara otomatis beralih ke simulasi lalu lintas realistik perairan dan ruang udara Nusantara agar peta selalu aktif dan siap didemonstrasikan.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
