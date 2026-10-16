// Master SVG Logo Library for Airlines and Shipping Lines
// High quality, crisp vector graphics that render instantly without external CDN dependencies

export const AIRLINE_LOGOS = {
  // 1. Garuda Indonesia
  GIA: {
    name: 'Garuda Indonesia',
    color: '#005b82',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0c4a60"/>
      <path d="M22 42c8-8 24-12 36-6 12 6 22 18 24 24-8-2-20-4-28-2-12 3-22 10-26 14 3-8 8-22-6-30z" fill="#00a3e0"/>
      <path d="M30 48c6-5 18-8 28-4 10 4 18 13 20 18-6-2-16-3-22-2-9 2-17 7-20 10 2-6 6-16-6-22z" fill="#008080"/>
      <path d="M42 35c4-3 12-4 18-2 6 2 11 8 13 11-4-1-10-2-14-1-6 1-11 5-13 7 1-4 4-11-4-15z" fill="#8ae000"/>
    </svg>`,
  },

  // 2. Singapore Airlines
  SIA: {
    name: 'Singapore Airlines',
    color: '#00205b',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#00205b"/>
      <path d="M15 65l35-32 35 12-25 5 15 15-40-10-5 10z" fill="#f0b323"/>
      <path d="M35 50l25-5 12 12-18-4z" fill="#ffffff"/>
    </svg>`,
  },

  // 3. Lion Air
  LNI: {
    name: 'Lion Air',
    color: '#e11d48',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#dc2626"/>
      <path d="M26 62c4-14 15-26 29-28 6-1 12 1 17 5 3 2 6 6 8 10-3-2-7-3-11-2-7 1-13 7-16 14-3 6-3 12-3 13-3-2-7-6-9-10-8-1-12-1-15-2z" fill="#ffffff"/>
      <circle cx="62" cy="42" r="3.5" fill="#facc15"/>
      <path d="M48 24c8 3 14 9 18 17-5-2-11-1-15 2-4 3-7 8-9 13-2-9 0-24 6-32z" fill="#facc15"/>
    </svg>`,
  },

  // 4. Batik Air
  BTK: {
    name: 'Batik Air',
    color: '#831843',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#701a75"/>
      <path d="M50 18l14 18-6 8 16 4-10 14 16 10-24 10-6-10-6 10-24-10 16-10-10-14 16-4-6-8z" fill="#f59e0b"/>
      <circle cx="50" cy="50" r="10" fill="#ffffff"/>
      <circle cx="50" cy="50" r="5" fill="#701a75"/>
    </svg>`,
  },

  // 5. Citilink
  CTV: {
    name: 'Citilink Indonesia',
    color: '#15803d',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#15803d"/>
      <path d="M20 70C35 45 60 30 85 25c-8 15-20 32-40 45-8 5-16 5-25 0z" fill="#84cc16"/>
      <path d="M25 78c18-8 35-22 52-42-4 12-14 26-28 36-8 6-16 8-24 6z" fill="#ffffff"/>
    </svg>`,
  },

  // 6. Indonesia AirAsia / AirAsia
  AWQ: {
    name: 'Indonesia AirAsia',
    color: '#dc2626',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#e11d48"/>
      <text x="50" y="60" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="28" fill="#ffffff" text-anchor="middle">Air</text>
      <text x="50" y="78" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="16" fill="#ffffff" text-anchor="middle">Asia</text>
    </svg>`,
  },

  // 7. Super Air Jet
  SAJ: {
    name: 'Super Air Jet',
    color: '#b45309',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#78350f"/>
      <path d="M20 60l25-30 35 15-20 8 20 12-40-2-10 7z" fill="#fbbf24"/>
      <circle cx="70" cy="35" r="4" fill="#ffffff"/>
    </svg>`,
  },

  // 8. Pelita Air
  PAS: {
    name: 'Pelita Air',
    color: '#0369a1',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0284c7"/>
      <path d="M25 65C40 35 65 30 80 40c-15 5-25 15-32 30-8-2-16-3-23-5z" fill="#ef4444"/>
      <path d="M35 70c12-18 30-22 45-18-10 6-18 15-24 25-7-2-14-4-21-7z" fill="#ffffff"/>
    </svg>`,
  },

  // 9. Emirates
  UAE: {
    name: 'Emirates',
    color: '#b91c1c',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#dc2626"/>
      <text x="50" y="58" font-family="serif" font-weight="bold" font-size="44" fill="#fef08a" text-anchor="middle">إ</text>
      <text x="50" y="80" font-family="sans-serif" font-weight="bold" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1">EMIRATES</text>
    </svg>`,
  },

  // 10. Qatar Airways
  QTR: {
    name: 'Qatar Airways',
    color: '#5b062c',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#581c87"/>
      <path d="M35 72l12-32 10 10 12-28-5 35-10-4-8 19z" fill="#e9d5ff"/>
      <circle cx="65" cy="28" r="4" fill="#cbd5e1"/>
    </svg>`,
  },

  // 11. Qantas Airways
  QFA: {
    name: 'Qantas Airways',
    color: '#dc2626',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#e11d48"/>
      <!-- Flying Kangaroo silhouette -->
      <path d="M20 72c15-5 35-22 42-38 3-7 4-14 3-18-2 8-8 16-16 22-8 6-18 11-28 14 5 5 10 12 15 20z" fill="#ffffff"/>
      <path d="M65 18c3 4 5 10 3 15-2-4-4-8-7-10 2-2 3-4 4-5z" fill="#ffffff"/>
    </svg>`,
  },

  // 12. Malaysia Airlines
  MAS: {
    name: 'Malaysia Airlines',
    color: '#1e3a8a',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#1e3a8a"/>
      <!-- Wau Bulan crescent kite -->
      <path d="M22 55c12-18 32-26 56-22-14 10-24 24-26 40-10-4-20-10-30-18z" fill="#ef4444"/>
      <path d="M35 52c10-12 24-18 42-16-10 8-18 18-20 30-8-3-15-8-22-14z" fill="#ffffff"/>
    </svg>`,
  },

  // 13. Cathay Pacific
  CPA: {
    name: 'Cathay Pacific',
    color: '#047857',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#064e3b"/>
      <!-- Brushwing jade emblem -->
      <path d="M20 62c16-8 34-22 58-36-8 14-22 30-40 42-7 5-13 4-18-6z" fill="#ffffff"/>
      <path d="M36 54c12-6 26-16 42-26-6 10-16 22-30 30-5 3-9 2-12-4z" fill="#ef4444"/>
    </svg>`,
  },

  // 14. Japan Airlines (JAL)
  JAL: {
    name: 'Japan Airlines',
    color: '#dc2626',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#dc2626" stroke-width="4"/>
      <!-- Tsurumaru Red Crane Circle -->
      <path d="M30 50c5-16 20-28 38-26-4 8-12 18-22 24 12-2 24 2 30 10-16 2-30-2-46-8z" fill="#dc2626"/>
      <circle cx="68" cy="35" r="4.5" fill="#dc2626"/>
    </svg>`,
  },

  // 15. All Nippon Airways (ANA)
  ANA: {
    name: 'All Nippon Airways',
    color: '#1d4ed8',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#1e40af"/>
      <text x="50" y="58" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="30" fill="#ffffff" text-anchor="middle">ANA</text>
      <path d="M25 70l50-8" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
  },

  // 16. British Airways
  BAW: {
    name: 'British Airways',
    color: '#1e3a8a',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#0f172a"/>
      <!-- Speedmark ribbon -->
      <path d="M20 45C45 35 70 38 85 45c-20 6-40 6-65 0z" fill="#2563eb"/>
      <path d="M40 48c20-4 40-2 45 4-15 4-30 4-45-4z" fill="#dc2626"/>
      <text x="50" y="80" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle">BRITISH AIRWAYS</text>
    </svg>`,
  },

  // 17. Lufthansa
  DLH: {
    name: 'Lufthansa',
    color: '#1e3a8a',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#1e3a8a"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <!-- Encircled crane -->
      <path d="M32 58l22-20 18 4-14 6 12 12-24-6-6 6z" fill="#f59e0b"/>
    </svg>`,
  },

  // 18. KLM Royal Dutch Airlines
  KLM: {
    name: 'KLM Royal Dutch Airlines',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0284c7"/>
      <!-- KLM Royal Crown -->
      <circle cx="34" cy="38" r="4" fill="#ffffff"/>
      <circle cx="44" cy="34" r="4" fill="#ffffff"/>
      <circle cx="56" cy="34" r="4" fill="#ffffff"/>
      <circle cx="66" cy="38" r="4" fill="#ffffff"/>
      <path d="M30 46l8 12h24l8-12-10 6-10-8-10 8z" fill="#ffffff"/>
      <text x="50" y="80" font-family="sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">KLM</text>
    </svg>`,
  },

  // 19. Air France
  AFR: {
    name: 'Air France',
    color: '#002157',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <path d="M25 65l40-35 15 15-20 5 10 15-35-10z" fill="#002157"/>
      <path d="M72 40l10 10-5 2z" fill="#ef4444"/>
    </svg>`,
  },

  // 20. United Airlines
  UAL: {
    name: 'United Airlines',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0f172a"/>
      <!-- Blue Globe lines -->
      <circle cx="50" cy="50" r="32" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <ellipse cx="50" cy="50" rx="16" ry="32" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <line x1="18" y1="50" x2="82" y2="50" stroke="#38bdf8" stroke-width="2"/>
      <line x1="24" y1="35" x2="76" y2="35" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="24" y1="65" x2="76" y2="65" stroke="#38bdf8" stroke-width="1.5"/>
    </svg>`,
  },

  // 21. Delta Air Lines
  DAL: {
    name: 'Delta Air Lines',
    color: '#b91c1c',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#0f172a"/>
      <!-- Red Widget Triangle -->
      <polygon points="50,22 80,72 50,60" fill="#dc2626"/>
      <polygon points="50,22 20,72 50,60" fill="#991b1b"/>
      <polygon points="50,60 80,72 50,78 20,72" fill="#ef4444"/>
    </svg>`,
  },

  // 22. Turkish Airlines
  THY: {
    name: 'Turkish Airlines',
    color: '#dc2626',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#dc2626"/>
      <circle cx="50" cy="50" r="34" fill="#ffffff"/>
      <!-- Flying wild goose -->
      <path d="M34 58c8-12 18-18 32-16-6 6-12 12-16 18 6-2 14-2 18 2-12 2-22 0-34-4z" fill="#dc2626"/>
    </svg>`,
  },

  // 23. TNI Angkatan Udara
  TNI: {
    name: 'TNI Angkatan Udara',
    color: '#0369a1',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0284c7" stroke="#fbbf24" stroke-width="3"/>
      <!-- Swa Bhuwana Paksa Eagle -->
      <path d="M50 24l8 12 14-4-6 14 14 6-12 10 6 14-16-4-8 12-8-12-16 4 6-14-12-10 14-6-6-14 14 4z" fill="#fbbf24"/>
      <circle cx="50" cy="50" r="10" fill="#dc2626"/>
      <polygon points="50,42 53,48 59,48 54,52 56,58 50,54 44,58 46,52 41,48 47,48" fill="#ffffff"/>
    </svg>`,
  },

  // Default fallback aircraft
  DEFAULT: {
    name: 'Penerbangan Komersial',
    color: '#f59e0b',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#f59e0b"/>
      <path d="M50 20l6 22 22 8-22 6-6 24-6-24-22-6 22-8z" fill="#ffffff"/>
    </svg>`,
  },
};

export const SHIP_LOGOS = {
  // 1. PT PELNI
  PELNI: {
    name: 'PT PELNI (Persero)',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0369a1"/>
      <!-- Compass star and anchor -->
      <circle cx="50" cy="50" r="34" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M50 26v48M34 50h32" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <path d="M38 64c6 6 18 6 24 0" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="34" r="5" fill="#facc15"/>
    </svg>`,
  },

  // 2. PT ASDP Indonesia Ferry
  ASDP: {
    name: 'PT ASDP Indonesia Ferry',
    color: '#0d9488',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0f766e"/>
      <!-- Modern waves and ferry bow -->
      <path d="M24 60c12-6 24-6 36 0 10 4 18 2 24-2" fill="none" stroke="#5eead4" stroke-width="5" stroke-linecap="round"/>
      <path d="M20 72c14-6 28-6 42 0 10 4 20 2 26-2" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <path d="M38 32l24 16H38z" fill="#facc15"/>
    </svg>`,
  },

  // 3. PT Pertamina International Shipping (PIS)
  PERTAMINA: {
    name: 'PT Pertamina International Shipping',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <!-- Pertamina Tri-color Logo -->
      <path d="M32 30h22l-10 24H22z" fill="#0284c7"/>
      <path d="M48 54h22l-10 24H38z" fill="#16a34a"/>
      <path d="M56 30h22l-10 24H46z" fill="#dc2626"/>
    </svg>`,
  },

  // 4. Maersk Line
  MAERSK: {
    name: 'A.P. Moller - Maersk',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#42b0d5"/>
      <!-- Iconic Maersk 7-pointed white star -->
      <polygon points="50,20 57,38 76,34 65,48 78,62 59,62 50,80 41,62 22,62 35,48 24,34 43,38" fill="#ffffff"/>
    </svg>`,
  },

  // 5. Evergreen Marine
  EVERGREEN: {
    name: 'Evergreen Marine Corp.',
    color: '#15803d',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#166534"/>
      <!-- Evergreen globe and 16-point star -->
      <circle cx="50" cy="50" r="32" fill="none" stroke="#ffffff" stroke-width="3"/>
      <circle cx="50" cy="50" r="16" fill="#f97316"/>
      <path d="M50 22v56M22 50h56" stroke="#ffffff" stroke-width="2"/>
    </svg>`,
  },

  // 6. MSC (Mediterranean Shipping Company)
  MSC: {
    name: 'Mediterranean Shipping Company (MSC)',
    color: '#0f172a',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#0f172a"/>
      <circle cx="50" cy="40" r="14" fill="#eab308"/>
      <path d="M50 35v35M35 55c8 10 22 10 30 0" fill="none" stroke="#eab308" stroke-width="4" stroke-linecap="round"/>
      <text x="50" y="86" font-family="serif" font-weight="bold" font-size="14" fill="#ffffff" text-anchor="middle">MSC</text>
    </svg>`,
  },

  // 7. CMA CGM
  CMACGM: {
    name: 'CMA CGM Group',
    color: '#1e3a8a',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <path d="M22 50c18-12 38-12 56 0" fill="none" stroke="#1d4ed8" stroke-width="6" stroke-linecap="round"/>
      <path d="M22 62c18-12 38-12 56 0" fill="none" stroke="#dc2626" stroke-width="5" stroke-linecap="round"/>
      <text x="50" y="38" font-family="sans-serif" font-weight="900" font-size="12" fill="#0f172a" text-anchor="middle">CMA CGM</text>
    </svg>`,
  },

  // 8. TNI Angkatan Laut
  TNI_AL: {
    name: 'TNI Angkatan Laut',
    color: '#1e3a8a',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#fbbf24" stroke-width="3"/>
      <!-- Jalesveva Jayamahe anchor shield -->
      <path d="M50 24v50M32 54c10 14 26 14 36 0" fill="none" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="30" r="6" fill="none" stroke="#fbbf24" stroke-width="3"/>
      <polygon points="50,42 58,52 42,52" fill="#dc2626"/>
    </svg>`,
  },

  // 9. Meratus Line
  MERATUS: {
    name: 'PT Meratus Line',
    color: '#dc2626',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <rect width="100" height="100" rx="20" fill="#dc2626"/>
      <text x="50" y="60" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">M</text>
      <path d="M30 72h40" stroke="#facc15" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
  },

  // Default fallback ship
  DEFAULT: {
    name: 'Armada Maritim',
    color: '#0284c7',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#0284c7"/>
      <path d="M50 24L30 46h40L50 24zM32 54h36v20H32z" fill="#ffffff"/>
    </svg>`,
  },
};

// Helper function to resolve airline logo
export function getAirlineLogo(airlineCode, callsign, airlineName) {
  const code = (airlineCode || '').toUpperCase();
  const cs = (callsign || '').toUpperCase();
  const name = (airlineName || '').toLowerCase();

  if (AIRLINE_LOGOS[code]) return AIRLINE_LOGOS[code];

  if (cs.startsWith('GIA') || cs.startsWith('GA') || name.includes('garuda')) return AIRLINE_LOGOS.GIA;
  if (cs.startsWith('SIA') || cs.startsWith('SQ') || name.includes('singapore')) return AIRLINE_LOGOS.SIA;
  if (cs.startsWith('LNI') || cs.startsWith('JT') || name.includes('lion')) return AIRLINE_LOGOS.LNI;
  if (cs.startsWith('BTK') || cs.startsWith('ID') || name.includes('batik')) return AIRLINE_LOGOS.BTK;
  if (cs.startsWith('CTV') || cs.startsWith('QG') || name.includes('citilink')) return AIRLINE_LOGOS.CTV;
  if (cs.startsWith('AWQ') || cs.startsWith('QZ') || cs.startsWith('AK') || name.includes('airasia')) return AIRLINE_LOGOS.AWQ;
  if (cs.startsWith('SAJ') || cs.startsWith('IU') || name.includes('super air jet')) return AIRLINE_LOGOS.SAJ;
  if (cs.startsWith('PAS') || cs.startsWith('IP') || name.includes('pelita')) return AIRLINE_LOGOS.PAS;
  if (cs.startsWith('UAE') || cs.startsWith('EK') || name.includes('emirates')) return AIRLINE_LOGOS.UAE;
  if (cs.startsWith('QTR') || cs.startsWith('QR') || name.includes('qatar')) return AIRLINE_LOGOS.QTR;
  if (cs.startsWith('QFA') || cs.startsWith('QF') || name.includes('qantas')) return AIRLINE_LOGOS.QFA;
  if (cs.startsWith('MAS') || cs.startsWith('MH') || name.includes('malaysia')) return AIRLINE_LOGOS.MAS;
  if (cs.startsWith('CPA') || cs.startsWith('CX') || name.includes('cathay')) return AIRLINE_LOGOS.CPA;
  if (cs.startsWith('JAL') || cs.startsWith('JL') || name.includes('japan')) return AIRLINE_LOGOS.JAL;
  if (cs.startsWith('ANA') || cs.startsWith('NH') || name.includes('all nippon')) return AIRLINE_LOGOS.ANA;
  if (cs.startsWith('BAW') || cs.startsWith('BA') || name.includes('british')) return AIRLINE_LOGOS.BAW;
  if (cs.startsWith('DLH') || cs.startsWith('LH') || name.includes('lufthansa')) return AIRLINE_LOGOS.DLH;
  if (cs.startsWith('KLM') || cs.startsWith('KL') || name.includes('klm')) return AIRLINE_LOGOS.KLM;
  if (cs.startsWith('AFR') || cs.startsWith('AF') || name.includes('air france')) return AIRLINE_LOGOS.AFR;
  if (cs.startsWith('UAL') || cs.startsWith('UA') || name.includes('united')) return AIRLINE_LOGOS.UAL;
  if (cs.startsWith('DAL') || cs.startsWith('DL') || name.includes('delta')) return AIRLINE_LOGOS.DAL;
  if (cs.startsWith('THY') || cs.startsWith('TK') || name.includes('turkish')) return AIRLINE_LOGOS.THY;
  if (cs.startsWith('TNI') || name.includes('tni')) return AIRLINE_LOGOS.TNI;

  return AIRLINE_LOGOS.DEFAULT;
}

// Helper function to resolve shipping line logo
export function getShipLogo(operatorName, shipName) {
  const op = (operatorName || '').toLowerCase();
  const name = (shipName || '').toLowerCase();

  if (op.includes('pelni') || name.includes('pelni') || name.startsWith('km ')) return SHIP_LOGOS.PELNI;
  if (op.includes('asdp') || name.includes('asdp') || name.startsWith('kmp ')) return SHIP_LOGOS.ASDP;
  if (op.includes('pertamina') || name.includes('pertamina')) return SHIP_LOGOS.PERTAMINA;
  if (op.includes('maersk') || name.includes('maersk')) return SHIP_LOGOS.MAERSK;
  if (op.includes('evergreen') || name.includes('ever given') || name.includes('ever ')) return SHIP_LOGOS.EVERGREEN;
  if (op.includes('msc') || name.includes('msc ')) return SHIP_LOGOS.MSC;
  if (op.includes('cma cgm') || name.includes('cma ')) return SHIP_LOGOS.CMACGM;
  if (op.includes('meratus') || name.includes('meratus')) return SHIP_LOGOS.MERATUS;
  if (op.includes('tni') || name.startsWith('kri ')) return SHIP_LOGOS.TNI_AL;

  return SHIP_LOGOS.DEFAULT;
}
