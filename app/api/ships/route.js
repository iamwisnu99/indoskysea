import { NextResponse } from 'next/server';
import WebSocket from 'ws';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory vessel cache across serverless warm requests
if (!globalThis._shipAisCache) {
  globalThis._shipAisCache = {
    ships: new Map(), // MMSI -> Vessel Object
    lastUpdate: 0,
    wsClient: null,
    isConnecting: false,
    lastConnectedTime: 0,
  };
}

// Realistic baseline Indonesian maritime traffic (Strait of Malacca, Sunda Strait, Java Sea, Bali Strait, Makassar)
const REALISTIC_INDONESIAN_VESSELS = [
  { mmsi: 525015001, name: 'KM KELUD (PELNI)', type: 'Passenger', flag: 'ID', flagName: 'Indonesia', latitude: -5.9234, longitude: 106.0125, sog: 16.2, cog: 235, heading: 235, destination: 'BATAM -> TANJUNG PRIOK', navStatus: 'Under way using engine' },
  { mmsi: 525008012, name: 'KMP PORTLINK III', type: 'Ferry / Ro-Ro', flag: 'ID', flagName: 'Indonesia', latitude: -5.8712, longitude: 105.9841, sog: 12.8, cog: 78, heading: 80, destination: 'BAKAUHENI -> MERAK', navStatus: 'Under way using engine' },
  { mmsi: 525021004, name: 'PERTAMINA GAS 2', type: 'LPG Tanker', flag: 'ID', flagName: 'Indonesia', latitude: -6.2105, longitude: 108.3412, sog: 14.5, cog: 110, heading: 112, destination: 'BALONGAN REFINERY', navStatus: 'Under way using engine' },
  { mmsi: 563012900, name: 'MAERSK MC-KINNEY MOLLER', type: 'Container Ship', flag: 'SG', flagName: 'Singapore', latitude: 1.2150, longitude: 103.8210, sog: 18.4, cog: 295, heading: 295, destination: 'SINGAPORE -> ROTTERDAM', navStatus: 'Under way using engine' },
  { mmsi: 352001420, name: 'EVER GIVEN', type: 'Container Ship', flag: 'PA', flagName: 'Panama', latitude: 1.1520, longitude: 103.6540, sog: 15.1, cog: 118, heading: 119, destination: 'TANJUNG PELEPAS', navStatus: 'Under way using engine' },
  { mmsi: 525019888, name: 'MERATUS KAHAYAN', type: 'Cargo Ship', flag: 'ID', flagName: 'Indonesia', latitude: -7.1520, longitude: 112.7150, sog: 11.2, cog: 345, heading: 342, destination: 'TANJUNG PERAK -> BANJARMASIN', navStatus: 'Under way using engine' },
  { mmsi: 525112003, name: 'KM BUKIT RAYA', type: 'Passenger', flag: 'ID', flagName: 'Indonesia', latitude: 0.8520, longitude: 107.5120, sog: 14.8, cog: 45, heading: 45, destination: 'NATUNA ISLANDS', navStatus: 'Under way using engine' },
  { mmsi: 525003119, name: 'KMP DHARMA RUCITRA', type: 'Ferry / Ro-Ro', flag: 'ID', flagName: 'Indonesia', latitude: -8.1250, longitude: 114.4500, sog: 10.5, cog: 92, heading: 90, destination: 'KETAPANG -> GILIMANUK', navStatus: 'Under way using engine' },
  { mmsi: 538008123, name: 'TI EUROPE (ULCC)', type: 'Crude Oil Tanker', flag: 'MH', flagName: 'Marshall Islands', latitude: 2.4500, longitude: 101.8500, sog: 13.9, cog: 130, heading: 130, destination: 'STRAIT OF MALACCA S-BOUND', navStatus: 'Under way using engine' },
  { mmsi: 525014902, name: 'KM LABOBAR', type: 'Passenger', flag: 'ID', flagName: 'Indonesia', latitude: -5.1120, longitude: 119.3800, sog: 15.6, cog: 190, heading: 192, destination: 'MAKASSAR -> SURABAYA', navStatus: 'Under way using engine' },
  { mmsi: 525091244, name: 'SAMUDERA MAS', type: 'General Cargo', flag: 'ID', flagName: 'Indonesia', latitude: -3.3210, longitude: 114.5900, sog: 9.8, cog: 160, heading: 160, destination: 'BANJARMASIN -> JAKARTA', navStatus: 'Under way using engine' },
  { mmsi: 525001278, name: 'KRI DIPONEGORO 365', type: 'Naval Patrol', flag: 'ID', flagName: 'Indonesia', latitude: -6.0500, longitude: 106.9100, sog: 22.0, cog: 40, heading: 40, destination: 'KOARMADA I PATROL', navStatus: 'Engaged in patrol' },
  { mmsi: 525024110, name: 'ASIAN PEARL', type: 'Bulk Carrier', flag: 'ID', flagName: 'Indonesia', latitude: -1.2500, longitude: 117.0500, sog: 11.5, cog: 185, heading: 185, destination: 'BALIKPAPAN COAL TERMINAL', navStatus: 'Under way using engine' },
  { mmsi: 525018765, name: 'KM AWU', type: 'Passenger', flag: 'ID', flagName: 'Indonesia', latitude: -8.5800, longitude: 116.1000, sog: 14.1, cog: 95, heading: 95, destination: 'LEMBAR -> WAINGAPU', navStatus: 'Under way using engine' },
  { mmsi: 525011999, name: 'TB MITRA ANUGERAH 08', type: 'Tug & Barge', flag: 'ID', flagName: 'Indonesia', latitude: -0.5500, longitude: 117.2500, sog: 5.4, cog: 120, heading: 120, destination: 'MAHAKAM RIVER TOWING', navStatus: 'Restricted manoeuvrability' }
];

// Determine country from MMSI Maritime Identification Digits (MID)
function getCountryFromMMSI(mmsiStr) {
  if (!mmsiStr) return { code: 'UN', name: 'Unknown' };
  const mid = mmsiStr.substring(0, 3);
  const midMap = {
    '525': { code: 'ID', name: 'Indonesia' },
    '563': { code: 'SG', name: 'Singapore' },
    '564': { code: 'SG', name: 'Singapore' },
    '565': { code: 'SG', name: 'Singapore' },
    '566': { code: 'SG', name: 'Singapore' },
    '533': { code: 'MY', name: 'Malaysia' },
    '548': { code: 'PH', name: 'Philippines' },
    '567': { code: 'TH', name: 'Thailand' },
    '574': { code: 'VN', name: 'Vietnam' },
    '351': { code: 'PA', name: 'Panama' },
    '352': { code: 'PA', name: 'Panama' },
    '353': { code: 'PA', name: 'Panama' },
    '354': { code: 'PA', name: 'Panama' },
    '355': { code: 'PA', name: 'Panama' },
    '356': { code: 'PA', name: 'Panama' },
    '357': { code: 'PA', name: 'Panama' },
    '636': { code: 'LR', name: 'Liberia' },
    '538': { code: 'MH', name: 'Marshall Islands' },
    '412': { code: 'CN', name: 'China' },
    '413': { code: 'CN', name: 'China' },
    '414': { code: 'CN', name: 'China' },
    '431': { code: 'JP', name: 'Japan' },
    '440': { code: 'KR', name: 'South Korea' },
  };
  return midMap[mid] || { code: 'INT', name: 'International' };
}

// Map AIS Ship Type code to human-readable category
function getVesselTypeLabel(typeCode) {
  if (!typeCode) return 'Vessel / Unspecified';
  const code = Number(typeCode);
  if (code >= 20 && code <= 29) return 'Wing In Ground';
  if (code === 30) return 'Fishing Vessel';
  if (code === 31 || code === 32) return 'Towing / Tug';
  if (code === 35) return 'Military Ops';
  if (code === 36) return 'Sailing Vessel';
  if (code === 37) return 'Pleasure Craft / Yacht';
  if (code >= 40 && code <= 49) return 'High Speed Craft';
  if (code === 50) return 'Pilot Vessel';
  if (code === 51) return 'Search & Rescue';
  if (code === 52) return 'Tugboat';
  if (code === 53) return 'Port Tender';
  if (code === 55) return 'Law Enforcement';
  if (code >= 60 && code <= 69) return 'Passenger / Ferry';
  if (code >= 70 && code <= 79) return 'Cargo Ship';
  if (code >= 80 && code <= 89) return 'Tanker';
  if (code >= 90 && code <= 99) return 'Other Special Craft';
  return 'Merchant Vessel';
}

// Maintain AISStream WebSocket connection safely on server
async function ensureAisStreamConnection(apiKey) {
  const cache = globalThis._shipAisCache;
  const now = Date.now();

  // If already connected and active within last 25s, do not recreate
  if (cache.wsClient && cache.wsClient.readyState === WebSocket.OPEN) {
    return;
  }

  // Prevent concurrent connection floods
  if (cache.isConnecting) {
    return;
  }

  cache.isConnecting = true;

  try {
    const ws = new WebSocket('wss://stream.aisstream.io/v0/stream', {
      handshakeTimeout: 5000,
    });

    ws.on('open', () => {
      console.log('[AISStream] Connected to wss://stream.aisstream.io/v0/stream');
      cache.isConnecting = false;
      cache.wsClient = ws;
      cache.lastConnectedTime = Date.now();

      // Subscribe to Indonesian & Southeast Asian waters
      // Bounding Box: lamin=-11.0, lamax=6.0, lomin=95.0, lomax=141.0
      const subscribeMsg = {
        APIKey: apiKey,
        BoundingBoxes: [
          [
            [-11.0, 95.0],
            [6.0, 141.0],
          ],
        ],
        FilterMessageTypes: [
          'PositionReport',
          'StandardClassBPositionReport',
          'ShipStaticData',
        ],
      };

      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const meta = msg.MetaData || {};
        const mmsi = meta.MMSI || meta.mmsi;
        if (!mmsi) return;

        const mmsiStr = String(mmsi);
        const countryInfo = getCountryFromMMSI(mmsiStr);

        let ship = cache.ships.get(mmsi) || {
          mmsi,
          name: (meta.ShipName || meta.ship_name || `MMSI-${mmsi}`).trim(),
          flag: countryInfo.code,
          flagName: countryInfo.name,
          type: 'Cargo / Merchant',
          latitude: meta.latitude || meta.Latitude,
          longitude: meta.longitude || meta.Longitude,
          sog: 0,
          cog: 0,
          heading: 0,
          navStatus: 'Under way',
          destination: 'IN TRANSIT',
          lastSeen: Date.now(),
        };

        if (msg.MessageType === 'PositionReport' && msg.Message?.PositionReport) {
          const p = msg.Message.PositionReport;
          ship.latitude = p.Latitude ?? meta.latitude;
          ship.longitude = p.Longitude ?? meta.longitude;
          ship.sog = p.Sog !== undefined ? Number(p.Sog.toFixed(1)) : ship.sog;
          ship.cog = p.Cog !== undefined ? Math.round(p.Cog) : ship.cog;
          ship.heading = p.TrueHeading !== undefined && p.TrueHeading !== 511 ? p.TrueHeading : ship.cog;
          ship.navStatus = p.NavigationalStatus !== undefined ? `Status ${p.NavigationalStatus}` : ship.navStatus;
        } else if (msg.MessageType === 'StandardClassBPositionReport' && msg.Message?.StandardClassBPositionReport) {
          const b = msg.Message.StandardClassBPositionReport;
          ship.latitude = b.Latitude ?? meta.latitude;
          ship.longitude = b.Longitude ?? meta.longitude;
          ship.sog = b.Sog !== undefined ? Number(b.Sog.toFixed(1)) : ship.sog;
          ship.cog = b.Cog !== undefined ? Math.round(b.Cog) : ship.cog;
          ship.heading = b.TrueHeading !== undefined && b.TrueHeading !== 511 ? b.TrueHeading : ship.cog;
        } else if (msg.MessageType === 'ShipStaticData' && msg.Message?.ShipStaticData) {
          const s = msg.Message.ShipStaticData;
          if (s.Name) ship.name = s.Name.trim();
          if (s.Type) ship.type = getVesselTypeLabel(s.Type);
          if (s.Destination) ship.destination = s.Destination.trim();
        }

        ship.lastSeen = Date.now();

        // Ensure valid coordinates inside Indonesia box
        if (
          ship.latitude >= -11.0 &&
          ship.latitude <= 6.0 &&
          ship.longitude >= 95.0 &&
          ship.longitude <= 141.0
        ) {
          cache.ships.set(mmsi, ship);
        }

        // Limit cache size to prevent memory bloat (max 500 ships)
        if (cache.ships.size > 500) {
          const firstKey = cache.ships.keys().next().value;
          cache.ships.delete(firstKey);
        }
      } catch (err) {
        // Ignore malformed individual frame
      }
    });

    ws.on('error', (err) => {
      console.warn('[AISStream WS Error]:', err.message);
      cache.isConnecting = false;
    });

    ws.on('close', () => {
      console.log('[AISStream] Socket closed.');
      cache.isConnecting = false;
      cache.wsClient = null;
    });
  } catch (err) {
    console.error('[AISStream Connection Init Error]:', err);
    cache.isConnecting = false;
  }
}

export async function GET() {
  const securityHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow',
  };

  const now = Date.now();
  const apiKey = process.env.AISSTREAM_API_KEY;

  // Prune vessels older than 20 minutes from cache
  const cache = globalThis._shipAisCache;
  if (cache.ships.size > 0) {
    for (const [mmsi, ship] of cache.ships.entries()) {
      if (now - (ship.lastSeen || 0) > 20 * 60 * 1000) {
        cache.ships.delete(mmsi);
      }
    }
  }

  // If AISSTREAM_API_KEY is configured in Vercel/server environment
  if (apiKey && apiKey.trim() !== '') {
    ensureAisStreamConnection(apiKey.trim());

    // If cache already has vessels gathered by the background socket
    if (cache.ships.size > 0) {
      const liveVessels = Array.from(cache.ships.values());
      return NextResponse.json(
        {
          success: true,
          count: liveVessels.length,
          timestamp: Math.floor(now / 1000),
          source: 'aisstream_live',
          keyConfigured: true,
          message: 'Real-time AIS live data relayed from Aisstream.io WebSocket stream.',
          data: liveVessels,
        },
        { status: 200, headers: securityHeaders }
      );
    }

    // If socket is just warming up (first 2-3 seconds of cold start),
    // wait a short moment or return realistic vessels merged with any incoming
    await new Promise((r) => setTimeout(r, 600));

    if (cache.ships.size > 0) {
      const liveVessels = Array.from(cache.ships.values());
      return NextResponse.json(
        {
          success: true,
          count: liveVessels.length,
          timestamp: Math.floor(now / 1000),
          source: 'aisstream_live',
          keyConfigured: true,
          data: liveVessels,
        },
        { status: 200, headers: securityHeaders }
      );
    }
  }

  // Fallback: AISSTREAM_API_KEY is not set or socket is gathering initial frames
  // Provide realistic animated Indonesian maritime traffic (Sunda Strait, Malacca, Priok, Perak, Bali)
  const simulatedVessels = driftSimulatedVessels(REALISTIC_INDONESIAN_VESSELS);

  return NextResponse.json(
    {
      success: true,
      count: simulatedVessels.length,
      timestamp: Math.floor(now / 1000),
      source: apiKey ? 'aisstream_warming_up' : 'demo_realistic_simulation',
      keyConfigured: Boolean(apiKey && apiKey.trim() !== ''),
      notice: apiKey
        ? 'Connecting to Aisstream.io live WebSocket stream. Initial AIS packets loading...'
        : 'AISSTREAM_API_KEY belum disetel di .env / Vercel Environment Variables. Menampilkan simulasi lalulintas kapal perairan Indonesia (Selat Sunda, Selat Malaka, Laut Jawa, Selat Bali).',
      data: simulatedVessels,
    },
    { status: 200, headers: securityHeaders }
  );
}

// Simulates smooth position and movement for high-fidelity fallback vessels
function driftSimulatedVessels(ships) {
  const t = (Date.now() / 15000);
  return ships.map((s, index) => {
    const latOffset = Math.sin(t + index) * 0.005;
    const lonOffset = Math.cos(t + index) * 0.005;
    return {
      ...s,
      latitude: Number((s.latitude + latOffset).toFixed(4)),
      longitude: Number((s.longitude + lonOffset).toFixed(4)),
      lastSeen: Date.now(),
    };
  });
}
