import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache across serverless warm invocations
// Prevents OpenSky 429 rate limit errors (especially for anonymous requests)
if (!globalThis._openskyCache) {
  globalThis._openskyCache = {
    data: null,
    timestamp: 0,
    etag: null,
  };
}

// High-fidelity fallback flights in Indonesian Airspace if OpenSky is rate-limited (429) or offline
const FALLBACK_INDONESIAN_FLIGHTS = [
  { id: '8a01f1', callsign: 'GIA404', country: 'Indonesia', longitude: 106.8451, latitude: -6.2146, altitude: 7620, altitudeFeet: 25000, velocity: 410, velocityKmh: 760, heading: 115, verticalRate: 2.1, onGround: false, squawk: '1240' },
  { id: '8a02a4', callsign: 'GIA712', country: 'Indonesia', longitude: 115.1668, latitude: -8.7482, altitude: 3048, altitudeFeet: 10000, velocity: 240, velocityKmh: 444, heading: 270, verticalRate: -3.5, onGround: false, squawk: '2105' },
  { id: '8a03b2', callsign: 'BTK6890', country: 'Indonesia', longitude: 112.7844, latitude: -7.3798, altitude: 9144, altitudeFeet: 30000, velocity: 435, velocityKmh: 805, heading: 290, verticalRate: 0.0, onGround: false, squawk: '3312' },
  { id: '8a04c7', callsign: 'LNI802', country: 'Indonesia', longitude: 119.5540, latitude: -5.0616, altitude: 8534, altitudeFeet: 28000, velocity: 420, velocityKmh: 778, heading: 45, verticalRate: 1.2, onGround: false, squawk: '4521' },
  { id: '8a05d8', callsign: 'AWQ551', country: 'Indonesia', longitude: 98.6722, latitude: 3.5952, altitude: 10058, altitudeFeet: 33000, velocity: 460, velocityKmh: 852, heading: 135, verticalRate: 0.0, onGround: false, squawk: '5120' },
  { id: '8a06e9', callsign: 'CTV134', country: 'Indonesia', longitude: 107.6098, latitude: -6.9175, altitude: 6096, altitudeFeet: 20000, velocity: 350, velocityKmh: 648, heading: 90, verticalRate: 3.0, onGround: false, squawk: '1102' },
  { id: '8a07fa', callsign: 'GIA182', country: 'Indonesia', longitude: 102.2655, latitude: -3.7928, altitude: 10668, altitudeFeet: 35000, velocity: 470, velocityKmh: 870, heading: 140, verticalRate: -0.5, onGround: false, squawk: '6241' },
  { id: '8a081b', callsign: 'SIA958', country: 'Singapore', longitude: 104.9912, latitude: 1.1301, altitude: 9448, altitudeFeet: 31000, velocity: 445, velocityKmh: 824, heading: 160, verticalRate: 0.0, onGround: false, squawk: '7301' },
  { id: '8a092c', callsign: 'MAS717', country: 'Malaysia', longitude: 101.4478, latitude: 0.5071, altitude: 10363, altitudeFeet: 34000, velocity: 450, velocityKmh: 833, heading: 175, verticalRate: 0.0, onGround: false, squawk: '2411' },
  { id: '8a0a3d', callsign: 'GIA610', country: 'Indonesia', longitude: 116.8942, latitude: -1.2654, altitude: 8839, altitudeFeet: 29000, velocity: 415, velocityKmh: 768, heading: 60, verticalRate: 1.5, onGround: false, squawk: '3502' },
  { id: '8a0b4e', callsign: 'SJY240', country: 'Indonesia', longitude: 122.5165, latitude: -3.9785, altitude: 7924, altitudeFeet: 26000, velocity: 395, velocityKmh: 731, heading: 210, verticalRate: -1.8, onGround: false, squawk: '4210' },
  { id: '8a0c5f', callsign: 'GIA230', country: 'Indonesia', longitude: 124.8428, latitude: 1.4748, altitude: 10058, altitudeFeet: 33000, velocity: 460, velocityKmh: 852, heading: 195, verticalRate: 0.0, onGround: false, squawk: '5532' },
  { id: '8a0d60', callsign: 'LNI770', country: 'Indonesia', longitude: 128.1814, latitude: -3.6547, altitude: 7315, altitudeFeet: 24000, velocity: 380, velocityKmh: 704, heading: 265, verticalRate: -2.0, onGround: false, squawk: '6114' },
  { id: '8a0e71', callsign: 'GIA654', country: 'Indonesia', longitude: 134.0620, latitude: -0.8615, altitude: 9753, altitudeFeet: 32000, velocity: 440, velocityKmh: 815, heading: 105, verticalRate: 0.8, onGround: false, squawk: '7103' },
  { id: '8a0f82', callsign: 'BAT810', country: 'Indonesia', longitude: 140.7181, latitude: -2.5916, altitude: 4572, altitudeFeet: 15000, velocity: 290, velocityKmh: 537, heading: 250, verticalRate: -3.2, onGround: false, squawk: '1422' }
];

export async function GET() {
  const securityHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow',
  };

  const now = Date.now();
  // OpenSky rate limits: anonymous users max 1 request per 10s. Authenticated users max 1 per 5s.
  const CACHE_TTL_MS = process.env.OPENSKY_USERNAME ? 5000 : 10000;

  // Check if we have a fresh cached response
  if (globalThis._openskyCache.data && (now - globalThis._openskyCache.timestamp < CACHE_TTL_MS)) {
    return NextResponse.json(
      {
        success: true,
        count: globalThis._openskyCache.data.length,
        timestamp: Math.floor(globalThis._openskyCache.timestamp / 1000),
        source: 'opensky_cache',
        rateLimitNotice: 'Serving from server cache to adhere to OpenSky rate limits',
        data: globalThis._openskyCache.data,
      },
      { status: 200, headers: securityHeaders }
    );
  }

  // Indonesian / Southeast Asian Bounding Box
  // lamin=-11.0, lamax=6.0, lomin=95.0, lomax=141.0
  const url = 'https://opensky-network.org/api/states/all?lamin=-11.0&lamax=6.0&lomin=95.0&lomax=141.0';

  const fetchHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'FlightShipRadar/1.0 (NextJS Vercel Edge/Serverless)',
  };

  // Add Basic Auth if credentials are provided in server environment variables
  if (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) {
    const credentials = Buffer.from(
      `${process.env.OPENSKY_USERNAME}:${process.env.OPENSKY_PASSWORD}`
    ).toString('base64');
    fetchHeaders['Authorization'] = `Basic ${credentials}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500); // 8.5s timeout for Vercel

    const response = await fetch(url, {
      method: 'GET',
      headers: fetchHeaders,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      console.warn('[OpenSky API] 429 Too Many Requests: Rate limited by OpenSky.');
      // Return previous cache or realistic fallback data
      const fallbackData = globalThis._openskyCache.data || simulateDrift(FALLBACK_INDONESIAN_FLIGHTS);
      return NextResponse.json(
        {
          success: true,
          count: fallbackData.length,
          timestamp: Math.floor(now / 1000),
          source: globalThis._openskyCache.data ? 'opensky_cached_fallback' : 'demo_realistic_fallback',
          rateLimitNotice: 'OpenSky public API rate limit reached (HTTP 429). Returning cached/simulated radar traffic for Indonesia.',
          data: fallbackData,
        },
        { status: 200, headers: securityHeaders }
      );
    }

    if (!response.ok) {
      throw new Error(`OpenSky returned status ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const states = json.states || [];

    // Parse and sanitize states array
    // OpenSky format:
    // 0: icao24, 1: callsign, 2: origin_country, 3: time_position, 4: last_contact,
    // 5: longitude, 6: latitude, 7: baro_altitude, 8: on_ground, 9: velocity (m/s),
    // 10: true_track (deg), 11: vertical_rate (m/s), 12: sensors, 13: geo_altitude,
    // 14: squawk, 15: spi, 16: position_source
    const sanitizedFlights = states
      .filter((s) => s[5] !== null && s[6] !== null) // Must have valid coordinates
      .map((s) => {
        const baroAlt = s[7];
        const geoAlt = s[13];
        const altMeters = baroAlt !== null ? Math.round(baroAlt) : (geoAlt !== null ? Math.round(geoAlt) : null);
        const velocityMs = s[9];
        const headingDeg = s[10];

        return {
          id: s[0] || 'UNKNOWN',
          callsign: (s[1] || '').trim() || (s[0] ? `ICAO-${s[0].toUpperCase()}` : 'UNKNOWN'),
          country: s[2] || 'International',
          longitude: Number(s[5]),
          latitude: Number(s[6]),
          altitude: altMeters,
          altitudeFeet: altMeters !== null ? Math.round(altMeters * 3.28084) : null,
          velocity: velocityMs !== null ? Math.round(velocityMs * 1.94384) : null, // in knots
          velocityKmh: velocityMs !== null ? Math.round(velocityMs * 3.6) : null,   // in km/h
          heading: headingDeg !== null ? Math.round(headingDeg) : 0,
          verticalRate: s[11] !== null ? Number(s[11].toFixed(1)) : 0,
          onGround: Boolean(s[8]),
          squawk: s[14] || '----',
          lastContact: s[4] || json.time || Math.floor(now / 1000),
        };
      });

    // Update server memory cache
    globalThis._openskyCache = {
      data: sanitizedFlights,
      timestamp: now,
    };

    return NextResponse.json(
      {
        success: true,
        count: sanitizedFlights.length,
        timestamp: json.time || Math.floor(now / 1000),
        source: 'opensky_live',
        authStatus: process.env.OPENSKY_USERNAME ? 'authenticated' : 'anonymous',
        data: sanitizedFlights,
      },
      { status: 200, headers: securityHeaders }
    );
  } catch (error) {
    console.error('[OpenSky API Error]', error.message);

    // Fallback gracefully without breaking the UI
    const fallbackData = globalThis._openskyCache.data || simulateDrift(FALLBACK_INDONESIAN_FLIGHTS);
    return NextResponse.json(
      {
        success: true,
        count: fallbackData.length,
        timestamp: Math.floor(now / 1000),
        source: globalThis._openskyCache.data ? 'opensky_cache_error_fallback' : 'demo_realistic_fallback',
        warning: `Upstream error: ${error.message}. Serving fallback radar state.`,
        data: fallbackData,
      },
      { status: 200, headers: securityHeaders }
    );
  }
}

// Helper to simulate tiny position drift for realistic radar visualization
function simulateDrift(flights) {
  const t = (Date.now() / 10000) % 360;
  return flights.map((f, i) => {
    const rad = ((f.heading || 0) * Math.PI) / 180;
    const speedDeg = ((f.velocity || 400) / 3600) * 0.05; // tiny step
    const offsetLat = Math.sin(t + i) * 0.01;
    const offsetLon = Math.cos(t + i) * 0.01;
    return {
      ...f,
      latitude: Number((f.latitude + offsetLat).toFixed(4)),
      longitude: Number((f.longitude + offsetLon).toFixed(4)),
    };
  });
}
