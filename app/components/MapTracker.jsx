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
  Activity,
  Radio,
  Building,
  Tag
} from 'lucide-react';

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
  terrain: {
    name: 'Google Maps (Terrain)',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
};

export default function MapTracker() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const planeMarkersRef = useRef(new Map());
  const shipMarkersRef = useRef(new Map());

  // Data states
  const [planes, setPlanes] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & UI states
  const [showPlanes, setShowPlanes] = useState(true);
  const [showShips, setShowShips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tileMode, setTileMode] = useState('roadmap');
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'plane'|'ship', id: '...' }

  // Initialize Leaflet Map with Google Maps Tiles
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined') return;
      if (mapInstanceRef.current || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Center of Indonesia: [-2.5489, 118.0149], Zoom: 5
      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        zoomControl: false,
        attributionControl: true,
        minZoom: 3,
        maxZoom: 19,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const tileConfig = GOOGLE_MAP_TILES[tileMode] || GOOGLE_MAP_TILES.roadmap;
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        subdomains: tileConfig.subdomains,
        maxZoom: tileConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Deselect when clicking on empty map
      map.on('click', (e) => {
        if (e.originalEvent?.target?.classList?.contains('leaflet-container')) {
          setSelectedEntity(null);
        }
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    async function switchTile() {
      const L = (await import('leaflet')).default;
      const tileConfig = GOOGLE_MAP_TILES[tileMode] || GOOGLE_MAP_TILES.roadmap;
      mapInstanceRef.current.removeLayer(tileLayerRef.current);

      tileLayerRef.current = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        subdomains: tileConfig.subdomains,
        maxZoom: tileConfig.maxZoom,
      }).addTo(mapInstanceRef.current);
    }

    switchTile();
  }, [tileMode]);

  // Fetch planes from internal Route Handler
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

  // Fetch ships from internal Route Handler
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

  // Initial load and periodic server sync (every 10s)
  useEffect(() => {
    refreshData();
    const serverSyncInterval = setInterval(refreshData, 10000);
    return () => clearInterval(serverSyncInterval);
  }, [refreshData]);

  // Client-Side Real-Time Dead Reckoning Engine (Every 1 second):
  // Continuously advances plane and ship positions smoothly according to true speed and heading
  useEffect(() => {
    const kinematicTicker = setInterval(() => {
      // 1. Advance aircraft positions in real-time
      setPlanes((prevPlanes) =>
        prevPlanes.map((p) => {
          if (p.onGround || !p.velocity) return p;
          // velocity in knots -> meters per second
          const vMs = p.velocity * 0.514444;
          const rad = ((p.heading || 0) * Math.PI) / 180;
          // 1 deg latitude ≈ 111,139 meters
          const dLat = (vMs * Math.cos(rad)) / 111139;
          const dLon = (vMs * Math.sin(rad)) / (111139 * Math.cos((p.latitude * Math.PI) / 180));

          return {
            ...p,
            latitude: Number((p.latitude + dLat).toFixed(5)),
            longitude: Number((p.longitude + dLon).toFixed(5)),
          };
        })
      );

      // 2. Advance ship positions in real-time
      setShips((prevShips) =>
        prevShips.map((s) => {
          if (!s.sog || s.sog < 0.3) return s;
          const vMs = s.sog * 0.514444;
          const rad = (((s.heading || s.cog || 0)) * Math.PI) / 180;
          const dLat = (vMs * Math.cos(rad)) / 111139;
          const dLon = (vMs * Math.sin(rad)) / (111139 * Math.cos((s.latitude * Math.PI) / 180));

          return {
            ...s,
            latitude: Number((s.latitude + dLat).toFixed(5)),
            longitude: Number((s.longitude + dLon).toFixed(5)),
          };
        })
      );
    }, 1000);

    return () => clearInterval(kinematicTicker);
  }, []);

  // Update plane markers on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    let isSubscribed = true;

    async function updatePlanes() {
      const L = (await import('leaflet')).default;
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
          p.country?.toLowerCase().includes(q)
        );
      });

      filtered.forEach((plane) => {
        currentIds.add(plane.id);
        const heading = plane.heading || 0;
        const isSelected = selectedEntity?.type === 'plane' && selectedEntity?.id === plane.id;

        const iconHtml = `
          <div class="marker-plane-wrapper group" style="width: 34px; height: 34px;">
            ${isSelected ? '<div class="absolute inset-0 rounded-full bg-amber-500/40 ping-selected pointer-events-none"></div>' : ''}
            <div class="relative flex items-center justify-center w-8 h-8 transition-transform duration-300"
                 style="transform: rotate(${heading}deg);">
              <svg viewBox="0 0 24 24" class="w-6 h-6 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] hover:scale-125 transition-transform" fill="currentColor">
                <path fill="#f59e0b" stroke="#0f172a" stroke-width="0.8" stroke-linejoin="round" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[9px] font-sans font-bold bg-white/95 text-slate-800 rounded shadow border border-slate-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ${plane.realName || plane.callsign}
            </div>
          </div>
        `;

        const planeIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-plane-icon',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        if (existing.has(plane.id)) {
          const marker = existing.get(plane.id);
          marker.setLatLng([plane.latitude, plane.longitude]);
          marker.setIcon(planeIcon);
        } else {
          const marker = L.marker([plane.latitude, plane.longitude], { icon: planeIcon }).addTo(map);

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

      const q = searchQuery.trim().toLowerCase();
      const filtered = ships.filter((s) => {
        if (!q) return true;
        return (
          s.name?.toLowerCase().includes(q) ||
          s.fullName?.toLowerCase().includes(q) ||
          s.operator?.toLowerCase().includes(q) ||
          String(s.mmsi).includes(q) ||
          s.type?.toLowerCase().includes(q)
        );
      });

      filtered.forEach((ship) => {
        currentIds.add(ship.mmsi);
        const heading = ship.heading || ship.cog || 0;
        const isSelected = selectedEntity?.type === 'ship' && selectedEntity?.id === ship.mmsi;

        const iconHtml = `
          <div class="marker-ship-wrapper group" style="width: 28px; height: 28px;">
            ${isSelected ? '<div class="absolute inset-0 rounded-full bg-cyan-500/40 ping-selected pointer-events-none"></div>' : ''}
            <div class="relative flex items-center justify-center w-7 h-7 transition-transform duration-300"
                 style="transform: rotate(${heading}deg);">
              <svg viewBox="0 0 24 24" class="w-5 h-5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:scale-125 transition-transform" fill="currentColor">
                <path fill="#0284c7" stroke="#0f172a" stroke-width="0.8" stroke-linejoin="round" d="M12 2L6 8v11a2 2 0 002 2h8a2 2 0 002-2V8l-6-6zm0 3.5l3.5 3.5h-7L12 5.5zM8 11h8v7H8v-7z"/>
              </svg>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[9px] font-sans font-bold bg-white/95 text-slate-800 rounded shadow border border-slate-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ${ship.fullName || ship.name}
            </div>
          </div>
        `;

        const shipIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-ship-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        if (existing.has(ship.mmsi)) {
          const marker = existing.get(ship.mmsi);
          marker.setLatLng([ship.latitude, ship.longitude]);
          marker.setIcon(shipIcon);
        } else {
          const marker = L.marker([ship.latitude, ship.longitude], { icon: shipIcon }).addTo(map);

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

  // Currently selected entity live data (safe against null)
  const currentSelectedData = selectedEntity
    ? (selectedEntity.type === 'plane'
        ? planes.find((p) => p.id === selectedEntity.id)
        : ships.find((s) => s.mmsi === selectedEntity.id))
    : null;

  // Center camera onto selected entity
  const handleCenterOnEntity = () => {
    if (!currentSelectedData || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [currentSelectedData.latitude, currentSelectedData.longitude],
      11,
      { duration: 1.2 }
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-100 font-sans select-none">
      {/* 1. Leaflet Map Container with Google Maps Tiles */}
      <div id="radar-map" ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* 2. Sleek Floating Header Pill Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Brand & Search */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="glass-clean rounded-full px-4 py-2 flex items-center space-x-2.5 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold tracking-wide text-slate-800 uppercase">
              Nusantara Radar
            </span>
          </div>

          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Cari Pesawat, Maskapai, Kapal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-clean pl-8 pr-7 py-2 text-xs rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-56 lg:w-72 transition-all shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Filter Buttons & Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Plane Toggle */}
          <button
            onClick={() => setShowPlanes(!showPlanes)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
              showPlanes
                ? 'bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-white/90 text-slate-500 hover:bg-white hover:text-slate-700 border border-slate-200/80'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Pesawat</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${showPlanes ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {planes.length}
            </span>
          </button>

          {/* Ship Toggle */}
          <button
            onClick={() => setShowShips(!showShips)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
              showShips
                ? 'bg-sky-600 text-white shadow-sky-600/20'
                : 'bg-white/90 text-slate-500 hover:bg-white hover:text-slate-700 border border-slate-200/80'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Kapal</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${showShips ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {ships.length}
            </span>
          </button>

          {/* Google Maps Layer Switcher */}
          <button
            onClick={() => setTileMode(tileMode === 'roadmap' ? 'satellite' : 'roadmap')}
            className="glass-clean p-2 rounded-full text-slate-600 hover:text-sky-600 transition-colors shadow-sm"
            title={tileMode === 'roadmap' ? 'Ganti ke Google Satelit' : 'Ganti ke Google Maps Standar'}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={loading}
            className="glass-clean p-2 rounded-full text-slate-600 hover:text-sky-600 transition-colors shadow-sm disabled:opacity-50"
            title="Segarkan Radar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Detail Telemetri On-Demand (HANYA MUNCUL KETIKA PESAWAT ATAU KAPAL DITEKAN) */}
      {currentSelectedData && (
        <div className="absolute bottom-5 right-4 left-4 sm:left-auto sm:w-[410px] z-30 animate-in fade-in slide-in-from-bottom-4 duration-250 pointer-events-auto">
          <div className="glass-clean-card rounded-2xl p-5 shadow-2xl border border-slate-200/90 space-y-4">
            
            {/* Header: Genuine Name & Close Button */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${
                  selectedEntity.type === 'plane'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                    : 'bg-sky-50 text-sky-600 border border-sky-200/60'
                }`}>
                  {selectedEntity.type === 'plane' ? <Plane className="w-5 h-5" /> : <Ship className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">
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
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Tutup Detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estimated Route Banner */}
            {selectedEntity.type === 'plane' && currentSelectedData.estimatedRoute && (
              <div className="bg-sky-50/70 border border-sky-100 rounded-xl px-3 py-2 flex items-center space-x-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Perkiraan Rute Penerbangan</span>
                  <span className="font-semibold text-sky-900">{currentSelectedData.estimatedRoute}</span>
                </div>
              </div>
            )}

            {/* Vessel Destination Banner */}
            {selectedEntity.type === 'ship' && currentSelectedData.destination && (
              <div className="bg-sky-50/70 border border-sky-100 rounded-xl px-3 py-2 flex items-center space-x-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Rute Pelabuhan Tujuan</span>
                  <span className="font-semibold text-sky-900">{currentSelectedData.destination}</span>
                </div>
              </div>
            )}

            {/* Metric Stats Cards */}
            {selectedEntity.type === 'plane' ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Altitude */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Ketinggian Jelajah</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {currentSelectedData.altitudeFeet ? `${currentSelectedData.altitudeFeet.toLocaleString()} ft` : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({currentSelectedData.altitude ? `${currentSelectedData.altitude.toLocaleString()} m` : '-'})
                    </span>
                  </div>

                  {/* Velocity */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Kecepatan Udara</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {currentSelectedData.velocity ? `${currentSelectedData.velocity} kts` : '0 kts'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({currentSelectedData.velocityKmh ? `${currentSelectedData.velocityKmh} km/h` : '-'})
                    </span>
                  </div>

                  {/* Heading */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Arah (Heading)</span>
                    <span className="text-base font-bold text-slate-900 font-mono flex items-center space-x-1">
                      <Compass className="w-4 h-4 text-slate-400 inline" />
                      <span>{currentSelectedData.heading}&deg;</span>
                    </span>
                  </div>

                  {/* Vertical Speed */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
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
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Kode Registrasi (Ekor):</span>
                    <span className="font-mono font-semibold text-slate-800">{currentSelectedData.registration || 'PK-AIRCRAFT'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Model Pesawat:</span>
                    <span className="font-semibold text-slate-800">{currentSelectedData.aircraftModel}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Squawk Transponder:</span>
                    <span className="font-mono font-semibold text-slate-800">{currentSelectedData.squawk || '1200'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Posisi Koordinat Real-Time:</span>
                    <span className="font-mono text-slate-700">
                      {currentSelectedData.latitude.toFixed(4)}, {currentSelectedData.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Center Camera Action */}
                <button
                  onClick={handleCenterOnEntity}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Kunci Kamera ke Pesawat Ini</span>
                </button>
              </div>
            ) : (
              /* Vessel Details */
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Kecepatan (SOG)</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {currentSelectedData.sog || 0} knots
                    </span>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Haluan (COG)</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {currentSelectedData.cog || 0}&deg;
                    </span>
                  </div>

                  <div className="col-span-2 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Operator Armada</span>
                    <span className="text-sm font-bold text-slate-800">
                      {currentSelectedData.operator || 'Operator Maritim'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Nomor MMSI:</span>
                    <span className="font-mono font-semibold text-slate-800">{currentSelectedData.mmsi}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Bendera / Negara:</span>
                    <span className="font-medium text-slate-800">{currentSelectedData.flagName || 'Indonesia'} ({currentSelectedData.flag || 'ID'})</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Status Navigasi:</span>
                    <span className="font-medium text-slate-800">{currentSelectedData.navStatus || 'Under way'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Posisi Koordinat Real-Time:</span>
                    <span className="font-mono text-slate-700">
                      {currentSelectedData.latitude.toFixed(4)}, {currentSelectedData.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCenterOnEntity}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Kunci Kamera ke Kapal Ini</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
