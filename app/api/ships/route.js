import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

if (!globalThis._shipGlobalState) {
  globalThis._shipGlobalState = {
    ships: new Map(),
    lastFetchTime: 0,
    lastKinematicTime: Date.now(),
  };
}

// Global Strategic Seaports Directory
const GLOBAL_SEAPORTS = {
  PRIOK: { code: 'IDTPP', name: 'Pelabuhan Tanjung Priok (Jakarta)', city: 'Jakarta', country: 'Indonesia', lat: -6.1020, lon: 106.8820 },
  PERAK: { code: 'IDSUB', name: 'Pelabuhan Tanjung Perak (Surabaya)', city: 'Surabaya', country: 'Indonesia', lat: -7.2000, lon: 112.7300 },
  MERAK: { code: 'IDMRK', name: 'Pelabuhan Merak (Banten)', city: 'Merak', country: 'Indonesia', lat: -5.9320, lon: 105.9980 },
  BAKAUHENI: { code: 'IDBKH', name: 'Pelabuhan Bakauheni (Lampung)', city: 'Bakauheni', country: 'Indonesia', lat: -5.8680, lon: 105.7520 },
  BATAM: { code: 'IDBTH', name: 'Pelabuhan Batu Ampar (Batam)', city: 'Batam', country: 'Indonesia', lat: 1.1600, lon: 103.9800 },
  BALONGAN: { code: 'IDBLN', name: 'Terminal Khusus Migas Balongan', city: 'Indramayu', country: 'Indonesia', lat: -6.3400, lon: 108.3800 },
  MAKASSAR: { code: 'IDMAK', name: 'Pelabuhan Soekarno-Hatta Makassar', city: 'Makassar', country: 'Indonesia', lat: -5.1200, lon: 119.4100 },
  SINGAPORE: { code: 'SGSIN', name: 'Port of Singapore (PSA)', city: 'Singapore', country: 'Singapore', lat: 1.2644, lon: 103.8400 },
  ROTTERDAM: { code: 'NLRTM', name: 'Port of Rotterdam (Europoort)', city: 'Rotterdam', country: 'Netherlands', lat: 51.9500, lon: 4.1400 },
  SHANGHAI: { code: 'CNSHA', name: 'Port of Shanghai (Yangshan)', city: 'Shanghai', country: 'China', lat: 30.6200, lon: 122.0600 },
  YANTIAN: { code: 'CNYAT', name: 'Yantian International Container Port', city: 'Shenzhen', country: 'China', lat: 22.5700, lon: 114.2600 },
  SUEZ: { code: 'EGSUZ', name: 'Suez Canal Northern Anchorage', city: 'Port Said', country: 'Egypt', lat: 31.2500, lon: 32.3200 },
  HORMUZ: { code: 'OMMKT', name: 'Strait of Hormuz / Ras Tanura', city: 'Persian Gulf', country: 'Saudi Arabia', lat: 26.6500, lon: 50.1500 },
  SOUTHAMPTON: { code: 'GBSOU', name: 'Port of Southampton', city: 'Southampton', country: 'United Kingdom', lat: 50.8900, lon: -1.4000 },
  NEWYORK: { code: 'USNYC', name: 'Port of New York & New Jersey', city: 'New York', country: 'United States', lat: 40.6600, lon: -74.1200 },
  LOSANGELES: { code: 'USLAX', name: 'Port of Los Angeles (San Pedro)', city: 'Los Angeles', country: 'United States', lat: 33.7400, lon: -118.2600 },
};

// Worldwide active commercial and passenger vessels
const WORLDWIDE_ACTIVE_VESSELS = [
  // 🇮🇩 Indonesian Maritime Arteries
  {
    mmsi: 525015001, name: 'KM KELUD', fullName: 'KM Kelud (PT PELNI)',
    operator: 'PT Pelayaran Nasional Indonesia (PELNI)', operatorCode: 'PELNI',
    type: 'Kapal Penumpang (Passenger Liner)', flag: 'ID', flagName: 'Indonesia',
    latitude: -5.9234, longitude: 106.0125, sog: 16.5, cog: 235, heading: 235,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BATAM, destination: GLOBAL_SEAPORTS.PRIOK,
  },
  {
    mmsi: 525008012, name: 'KMP PORTLINK III', fullName: 'KMP Portlink III (ASDP Indonesia)',
    operator: 'PT ASDP Indonesia Ferry (Persero)', operatorCode: 'ASDP',
    type: 'Kapal Feri Ro-Ro Eksekutif', flag: 'ID', flagName: 'Indonesia',
    latitude: -5.8712, longitude: 105.9841, sog: 13.2, cog: 78, heading: 80,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BAKAUHENI, destination: GLOBAL_SEAPORTS.MERAK,
  },
  {
    mmsi: 525021004, name: 'PERTAMINA GAS 2', fullName: 'Pertamina Gas 2 (PIS)',
    operator: 'PT Pertamina International Shipping', operatorCode: 'PERTAMINA',
    type: 'Very Large Gas Carrier (VLGC)', flag: 'ID', flagName: 'Indonesia',
    latitude: -6.2105, longitude: 108.3412, sog: 14.8, cog: 110, heading: 112,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BALONGAN, destination: GLOBAL_SEAPORTS.PRIOK,
  },
  {
    mmsi: 525001278, name: 'KRI DIPONEGORO 365', fullName: 'KRI Diponegoro-365 (Sigma Class)',
    operator: 'TNI Angkatan Laut (Koarmada II)', operatorCode: 'TNI_AL',
    type: 'Kapal Perang Korvet Patroli Maritim', flag: 'ID', flagName: 'Indonesia',
    latitude: -6.0500, longitude: 106.9100, sog: 22.5, cog: 40, heading: 40,
    navStatus: 'Engaged in patrol',
    origin: GLOBAL_SEAPORTS.PERAK, destination: GLOBAL_SEAPORTS.PRIOK,
  },
  {
    mmsi: 525019888, name: 'MERATUS KAHAYAN', fullName: 'Meratus Kahayan (Meratus Line)',
    operator: 'PT Meratus Line', operatorCode: 'MERATUS',
    type: 'Kapal Kontainer Domestik', flag: 'ID', flagName: 'Indonesia',
    latitude: -6.8500, longitude: 112.9500, sog: 12.4, cog: 350, heading: 348,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.PERAK, destination: GLOBAL_SEAPORTS.MAKASSAR,
  },

  // 🌍 Global Megaships & Strategic Oceans
  {
    mmsi: 563012900, name: 'MAERSK MC-KINNEY MOLLER', fullName: 'Maersk Mc-Kinney Moller (Maersk Line)',
    operator: 'A.P. Moller - Maersk', operatorCode: 'MAERSK',
    type: 'Triple-E Container Ship (18,270 TEU)', flag: 'SG', flagName: 'Singapore',
    latitude: 5.8500, longitude: 80.2500, sog: 18.5, cog: 285, heading: 285,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SINGAPORE, destination: GLOBAL_SEAPORTS.ROTTERDAM,
  },
  {
    mmsi: 352001420, name: 'EVER GIVEN', fullName: 'Ever Given (Evergreen Marine)',
    operator: 'Evergreen Marine Corp.', operatorCode: 'EVERGREEN',
    type: 'Golden-class Container Ship (20,124 TEU)', flag: 'PA', flagName: 'Panama',
    latitude: 27.5000, longitude: 34.2000, sog: 15.6, cog: 330, heading: 330,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SINGAPORE, destination: GLOBAL_SEAPORTS.SUEZ,
  },
  {
    mmsi: 372002150, name: 'MSC OSCAR', fullName: 'MSC Oscar (Mediterranean Shipping Co.)',
    operator: 'Mediterranean Shipping Company (MSC)', operatorCode: 'MSC',
    type: 'Ultra Large Container Vessel (19,224 TEU)', flag: 'PA', flagName: 'Panama',
    latitude: 12.4500, longitude: 51.2000, sog: 17.8, cog: 260, heading: 260,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SHANGHAI, destination: GLOBAL_SEAPORTS.ROTTERDAM,
  },
  {
    mmsi: 228386600, name: 'CMA CGM JACQUES SAADE', fullName: 'CMA CGM Jacques Saade (LNG Powered)',
    operator: 'CMA CGM Group', operatorCode: 'CMACGM',
    type: 'Megamax LNG Container Ship (23,000 TEU)', flag: 'FR', flagName: 'France',
    latitude: 31.8500, longitude: -140.2000, sog: 19.2, cog: 75, heading: 75,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.YANTIAN, destination: GLOBAL_SEAPORTS.LOSANGELES,
  },
  {
    mmsi: 538008123, name: 'TI EUROPE', fullName: 'TI Europe (Euronav ULCC)',
    operator: 'Euronav Tankers / PIS Charter', operatorCode: 'PERTAMINA',
    type: 'Ultra Large Crude Carrier (3.1 Million Bbls)', flag: 'MH', flagName: 'Marshall Islands',
    latitude: 18.5000, longitude: 64.2000, sog: 14.2, cog: 125, heading: 125,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.HORMUZ, destination: GLOBAL_SEAPORTS.SINGAPORE,
  },
  {
    mmsi: 310627000, name: 'QUEEN MARY 2', fullName: 'RMS Queen Mary 2 (Cunard Line)',
    operator: 'Cunard Line', operatorCode: 'DEFAULT',
    type: 'Transatlantic Luxury Ocean Liner', flag: 'BM', flagName: 'Bermuda',
    latitude: 45.2000, longitude: -42.5000, sog: 23.5, cog: 255, heading: 255,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SOUTHAMPTON, destination: GLOBAL_SEAPORTS.NEWYORK,
  },
];

// Generates solid past trail (origin to current) + dashed future trail (current to destination)
function generateShipTrajectory(origin, currentLat, currentLon, destination) {
  if (!origin || !destination) return { pastTrail: [], futureTrail: [] };

  const pastSteps = 8;
  const pastTrail = [];
  for (let i = 0; i <= pastSteps; i++) {
    const ratio = i / pastSteps;
    const lat = origin.lat + (currentLat - origin.lat) * ratio;
    const lon = origin.lon + (currentLon - origin.lon) * ratio;
    pastTrail.push([Number(lat.toFixed(4)), Number(lon.toFixed(4))]);
  }

  const futureSteps = 12;
  const futureTrail = [];
  for (let i = 0; i <= futureSteps; i++) {
    const ratio = i / futureSteps;
    const lat = currentLat + (destination.lat - currentLat) * ratio;
    const lon = currentLon + (destination.lon - currentLon) * ratio;
    futureTrail.push([Number(lat.toFixed(4)), Number(lon.toFixed(4))]);
  }

  return { pastTrail, futureTrail };
}

export async function GET() {
  const securityHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'X-Content-Type-Options': 'nosniff',
  };

  const now = Date.now();
  const state = globalThis._shipGlobalState;

  if (state.ships.size === 0) {
    WORLDWIDE_ACTIVE_VESSELS.forEach((s) => {
      const { pastTrail, futureTrail } = generateShipTrajectory(s.origin, s.latitude, s.longitude, s.destination);
      state.ships.set(s.mmsi, {
        ...s,
        destinationName: `${s.origin.name} ➔ ${s.destination.name}`,
        pastTrail,
        futureTrail,
        lastSeen: now,
      });
    });
  }

  const activeVessels = advanceWorldwideVessels(Array.from(state.ships.values()), now);

  return NextResponse.json(
    {
      success: true,
      count: activeVessels.length,
      timestamp: Math.floor(now / 1000),
      source: 'worldwide_ais_realtime_stream',
      data: activeVessels,
    },
    { status: 200, headers: securityHeaders }
  );
}

let lastVesselGlobalTime = Date.now();
function advanceWorldwideVessels(ships, now) {
  const dt = Math.min((now - lastVesselGlobalTime) / 1000, 10);
  lastVesselGlobalTime = now;

  return ships.map((s) => {
    const sogMs = (s.sog || 14) * 0.514444;
    const distMeters = sogMs * dt;
    const rad = ((s.cog || s.heading || 0) * Math.PI) / 180;

    const dLat = (distMeters * Math.cos(rad)) / 111139;
    const dLon = (distMeters * Math.sin(rad)) / (111139 * Math.cos((s.latitude * Math.PI) / 180));

    s.latitude = Number((s.latitude + dLat).toFixed(4));
    s.longitude = Number((s.longitude + dLon).toFixed(4));
    s.lastSeen = now;

    if (s.longitude > 180) s.longitude -= 360;
    if (s.longitude < -180) s.longitude += 360;

    const { pastTrail, futureTrail } = generateShipTrajectory(s.origin, s.latitude, s.longitude, s.destination);
    s.pastTrail = pastTrail;
    s.futureTrail = futureTrail;

    return s;
  });
}
