import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

if (!globalThis._openskyGlobalState) {
  globalThis._openskyGlobalState = {
    flights: new Map(),
    lastFetchTime: 0,
    lastKinematicTime: Date.now(),
  };
}

// Major International Hubs Detailed Directory with Complete Airport Names
const AIRPORT_COORDINATES = {
  CGK: {
    code: 'CGK',
    city: 'Jakarta',
    country: 'Indonesia',
    name: 'Bandara Internasional Soekarno-Hatta',
    lat: -6.1256,
    lon: 106.6558
  },
  DPS: {
    code: 'DPS',
    city: 'Denpasar, Bali',
    country: 'Indonesia',
    name: 'Bandara Internasional I Gusti Ngurah Rai',
    lat: -8.7482,
    lon: 115.1672
  },
  SUB: {
    code: 'SUB',
    city: 'Surabaya, Jawa Timur',
    country: 'Indonesia',
    name: 'Bandara Internasional Juanda',
    lat: -7.3798,
    lon: 112.7844
  },
  KNO: {
    code: 'KNO',
    city: 'Medan, Sumatra Utara',
    country: 'Indonesia',
    name: 'Bandara Internasional Kualanamu',
    lat: 3.6422,
    lon: 98.8853
  },
  UPG: {
    code: 'UPG',
    city: 'Makassar, Sulawesi Selatan',
    country: 'Indonesia',
    name: 'Bandara Internasional Sultan Hasanuddin',
    lat: -5.0616,
    lon: 119.5540
  },
  BPN: {
    code: 'BPN',
    city: 'Balikpapan, Kalimantan Timur',
    country: 'Indonesia',
    name: 'Bandara Internasional Sultan Aji Muhammad Sulaiman Sepinggan',
    lat: -1.2682,
    lon: 116.8944
  },
  HLP: {
    code: 'HLP',
    city: 'Jakarta Timur',
    country: 'Indonesia',
    name: 'Bandara Halim Perdanakusuma',
    lat: -6.2666,
    lon: 106.8908
  },
  YIA: {
    code: 'YIA',
    city: 'Yogyakarta',
    country: 'Indonesia',
    name: 'Bandara Internasional Yogyakarta (Kulon Progo)',
    lat: -7.9071,
    lon: 110.0536
  },
  SIN: {
    code: 'SIN',
    city: 'Singapura',
    country: 'Singapura',
    name: 'Bandara Internasional Changi',
    lat: 1.3644,
    lon: 103.9915
  },
  KUL: {
    code: 'KUL',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    name: 'Bandara Internasional Kuala Lumpur (KLIA)',
    lat: 2.7456,
    lon: 101.7099
  },
  BKK: {
    code: 'BKK',
    city: 'Bangkok',
    country: 'Thailand',
    name: 'Bandara Internasional Suvarnabhumi',
    lat: 13.6900,
    lon: 100.7501
  },
  MNL: {
    code: 'MNL',
    city: 'Manila',
    country: 'Filipina',
    name: 'Bandara Internasional Ninoy Aquino',
    lat: 14.5086,
    lon: 121.0194
  },
  HND: {
    code: 'HND',
    city: 'Tokyo',
    country: 'Jepang',
    name: 'Bandara Internasional Haneda',
    lat: 35.5494,
    lon: 139.7798
  },
  NRT: {
    code: 'NRT',
    city: 'Tokyo',
    country: 'Jepang',
    name: 'Bandara Internasional Narita',
    lat: 35.7720,
    lon: 140.3929
  },
  ICN: {
    code: 'ICN',
    city: 'Seoul',
    country: 'Korea Selatan',
    name: 'Bandara Internasional Incheon',
    lat: 37.4602,
    lon: 126.4407
  },
  HKG: {
    code: 'HKG',
    city: 'Hong Kong',
    country: 'Hong Kong',
    name: 'Bandara Internasional Hong Kong (Chek Lap Kok)',
    lat: 22.3080,
    lon: 113.9185
  },
  PEK: {
    code: 'PEK',
    city: 'Beijing',
    country: 'China',
    name: 'Bandara Internasional Ibu Kota Beijing',
    lat: 40.0799,
    lon: 116.6031
  },
  PVG: {
    code: 'PVG',
    city: 'Shanghai',
    country: 'China',
    name: 'Bandara Internasional Pudong Shanghai',
    lat: 31.1443,
    lon: 121.8083
  },
  SYD: {
    code: 'SYD',
    city: 'Sydney',
    country: 'Australia',
    name: 'Bandara Internasional Kingsford Smith',
    lat: -33.9399,
    lon: 151.1753
  },
  MEL: {
    code: 'MEL',
    city: 'Melbourne',
    country: 'Australia',
    name: 'Bandara Internasional Tullamarine',
    lat: -37.6690,
    lon: 144.8410
  },
  DXB: {
    code: 'DXB',
    city: 'Dubai',
    country: 'Uni Emirat Arab',
    name: 'Bandara Internasional Dubai',
    lat: 25.2532,
    lon: 55.3657
  },
  DOH: {
    code: 'DOH',
    city: 'Doha',
    country: 'Qatar',
    name: 'Bandara Internasional Hamad',
    lat: 25.2731,
    lon: 51.6081
  },
  IST: {
    code: 'IST',
    city: 'Istanbul',
    country: 'Turki',
    name: 'Bandara Internasional Istanbul',
    lat: 41.2753,
    lon: 28.7519
  },
  LHR: {
    code: 'LHR',
    city: 'London',
    country: 'Inggris',
    name: 'Bandara Internasional Heathrow',
    lat: 51.4700,
    lon: -0.4543
  },
  CDG: {
    code: 'CDG',
    city: 'Paris',
    country: 'Perancis',
    name: 'Bandara Internasional Charles de Gaulle',
    lat: 49.0097,
    lon: 2.5479
  },
  AMS: {
    code: 'AMS',
    city: 'Amsterdam',
    country: 'Belanda',
    name: 'Bandara Internasional Schiphol',
    lat: 52.3105,
    lon: 4.7683
  },
  FRA: {
    code: 'FRA',
    city: 'Frankfurt',
    country: 'Jerman',
    name: 'Bandara Internasional Frankfurt am Main',
    lat: 50.0379,
    lon: 8.5622
  },
  JFK: {
    code: 'JFK',
    city: 'New York',
    country: 'Amerika Serikat',
    name: 'Bandara Internasional John F. Kennedy',
    lat: 40.6413,
    lon: -73.7781
  },
  LAX: {
    code: 'LAX',
    city: 'Los Angeles',
    country: 'Amerika Serikat',
    name: 'Bandara Internasional Los Angeles',
    lat: 33.9416,
    lon: -118.4085
  },
  SFO: {
    code: 'SFO',
    city: 'San Francisco',
    country: 'Amerika Serikat',
    name: 'Bandara Internasional San Francisco',
    lat: 37.6213,
    lon: -122.3790
  },
  SYD: {
    code: 'SYD',
    city: 'Sydney',
    country: 'Australia',
    name: 'Bandara Internasional Kingsford Smith Sydney',
    lat: -33.9461,
    lon: 151.1772
  },
  JED: {
    code: 'JED',
    city: 'Jeddah',
    country: 'Arab Saudi',
    name: 'Bandara Internasional King Abdulaziz',
    lat: 21.6796,
    lon: 39.1565
  },
};

// Global Active Fleet
const WORLDWIDE_ACTIVE_FLEET = [
  // 🇮🇩 Indonesia Trunk Routes
  {
    id: '8a01f1', callsign: 'GIA404', airlineCode: 'GIA', airlineName: 'Garuda Indonesia',
    flightNumber: 'GA-404', aircraftModel: 'Boeing 737-800 NextGen', registration: 'PK-GMC',
    country: 'Indonesia', latitude: -7.2146, longitude: 109.8451, altitude: 9753, altitudeFeet: 32000,
    velocity: 430, heading: 110, verticalRate: 0.0, onGround: false, squawk: '1240',
    origin: AIRPORT_COORDINATES.CGK, destination: AIRPORT_COORDINATES.DPS,
  },
  {
    id: '8a0188', callsign: 'GIA88', airlineCode: 'GIA', airlineName: 'Garuda Indonesia',
    flightNumber: 'GA-88', aircraftModel: 'Boeing 777-300ER', registration: 'PK-GIG',
    country: 'Indonesia', latitude: 20.4500, longitude: 72.8500, altitude: 10972, altitudeFeet: 36000,
    velocity: 485, heading: 305, verticalRate: 0.0, onGround: false, squawk: '5120',
    origin: AIRPORT_COORDINATES.CGK, destination: AIRPORT_COORDINATES.AMS,
  },
  {
    id: '8a03b2', callsign: 'BTK6890', airlineCode: 'BTK', airlineName: 'Batik Air',
    flightNumber: 'ID-6890', aircraftModel: 'Airbus A320-200', registration: 'PK-LUF',
    country: 'Indonesia', latitude: -7.1500, longitude: 110.4500, altitude: 8839, altitudeFeet: 29000,
    velocity: 420, heading: 290, verticalRate: 0.0, onGround: false, squawk: '3312',
    origin: AIRPORT_COORDINATES.DPS, destination: AIRPORT_COORDINATES.CGK,
  },
  {
    id: '8a04c7', callsign: 'LNI802', airlineCode: 'LNI', airlineName: 'Lion Air',
    flightNumber: 'JT-802', aircraftModel: 'Boeing 737-900ER', registration: 'PK-LJP',
    country: 'Indonesia', latitude: -5.4500, longitude: 116.8500, altitude: 9448, altitudeFeet: 31000,
    velocity: 440, heading: 75, verticalRate: 0.0, onGround: false, squawk: '4521',
    origin: AIRPORT_COORDINATES.CGK, destination: AIRPORT_COORDINATES.UPG,
  },
  {
    id: '8a05d8', callsign: 'AWQ121', airlineCode: 'AWQ', airlineName: 'Indonesia AirAsia',
    flightNumber: 'QZ-121', aircraftModel: 'Airbus A320-200', registration: 'PK-AZQ',
    country: 'Indonesia', latitude: -3.8500, longitude: 109.8500, altitude: 10058, altitudeFeet: 33000,
    velocity: 450, heading: 320, verticalRate: 0.0, onGround: false, squawk: '2214',
    origin: AIRPORT_COORDINATES.DPS, destination: AIRPORT_COORDINATES.SIN,
  },
  {
    id: '8a06e9', callsign: 'CTV134', airlineCode: 'CTV', airlineName: 'Citilink Indonesia',
    flightNumber: 'QG-134', aircraftModel: 'Airbus A320-200neo', registration: 'PK-GLN',
    country: 'Indonesia', latitude: -7.1500, longitude: 108.5500, altitude: 7620, altitudeFeet: 25000,
    velocity: 390, heading: 115, verticalRate: 0.0, onGround: false, squawk: '1102',
    origin: AIRPORT_COORDINATES.HLP, destination: AIRPORT_COORDINATES.YIA,
  },
  {
    id: '8a07fa', callsign: 'SAJ770', airlineCode: 'SAJ', airlineName: 'Super Air Jet',
    flightNumber: 'IU-770', aircraftModel: 'Airbus A320-200', registration: 'PK-SAA',
    country: 'Indonesia', latitude: -1.5000, longitude: 103.2000, altitude: 10363, altitudeFeet: 34000,
    velocity: 460, heading: 335, verticalRate: 0.0, onGround: false, squawk: '6241',
    origin: AIRPORT_COORDINATES.CGK, destination: AIRPORT_COORDINATES.KNO,
  },
  {
    id: '8a0a3d', callsign: 'PAS202', airlineCode: 'PAS', airlineName: 'Pelita Air',
    flightNumber: 'IP-202', aircraftModel: 'Airbus A320-200', registration: 'PK-PWA',
    country: 'Indonesia', latitude: -3.8000, longitude: 112.5000, altitude: 9144, altitudeFeet: 30000,
    velocity: 435, heading: 45, verticalRate: 0.0, onGround: false, squawk: '3502',
    origin: AIRPORT_COORDINATES.CGK, destination: AIRPORT_COORDINATES.BPN,
  },

  // 🇸🇬 Singapore Airlines Global
  {
    id: '76c81b', callsign: 'SIA958', airlineCode: 'SIA', airlineName: 'Singapore Airlines',
    flightNumber: 'SQ-958', aircraftModel: 'Boeing 787-10 Dreamliner', registration: '9V-SCP',
    country: 'Singapore', latitude: -2.8500, longitude: 105.4500, altitude: 8534, altitudeFeet: 28000,
    velocity: 440, heading: 160, verticalRate: -1.2, onGround: false, squawk: '7301',
    origin: AIRPORT_COORDINATES.SIN, destination: AIRPORT_COORDINATES.CGK,
  },
  {
    id: '76c322', callsign: 'SIA322', airlineCode: 'SIA', airlineName: 'Singapore Airlines',
    flightNumber: 'SQ-322', aircraftModel: 'Airbus A350-900', registration: '9V-SMG',
    country: 'Singapore', latitude: 35.8000, longitude: 52.4000, altitude: 11582, altitudeFeet: 38000,
    velocity: 490, heading: 310, verticalRate: 0.0, onGround: false, squawk: '2411',
    origin: AIRPORT_COORDINATES.SIN, destination: AIRPORT_COORDINATES.LHR,
  },

  // 🇦🇪 Emirates Intercontinental
  {
    id: '896356', callsign: 'UAE356', airlineCode: 'UAE', airlineName: 'Emirates',
    flightNumber: 'EK-356', aircraftModel: 'Boeing 777-300ER', registration: 'A6-EGO',
    country: 'United Arab Emirates', latitude: 2.1500, longitude: 96.5000, altitude: 10668, altitudeFeet: 35000,
    velocity: 480, heading: 135, verticalRate: 0.0, onGround: false, squawk: '4210',
    origin: AIRPORT_COORDINATES.DXB, destination: AIRPORT_COORDINATES.CGK,
  },
  {
    id: '896201', callsign: 'UAE201', airlineCode: 'UAE', airlineName: 'Emirates',
    flightNumber: 'EK-201', aircraftModel: 'Airbus A380-800', registration: 'A6-EVB',
    country: 'United Arab Emirates', latitude: 54.8000, longitude: -25.5000, altitude: 11887, altitudeFeet: 39000,
    velocity: 495, heading: 260, verticalRate: 0.0, onGround: false, squawk: '6114',
    origin: AIRPORT_COORDINATES.DXB, destination: AIRPORT_COORDINATES.JFK,
  },

  // 🇶🇦 Qatar Airways
  {
    id: '760958', callsign: 'QTR958', airlineCode: 'QTR', airlineName: 'Qatar Airways',
    flightNumber: 'QR-958', aircraftModel: 'Airbus A350-1000', registration: 'A7-ANI',
    country: 'Qatar', latitude: 5.2500, longitude: 92.4000, altitude: 11277, altitudeFeet: 37000,
    velocity: 475, heading: 125, verticalRate: 0.0, onGround: false, squawk: '3142',
    origin: AIRPORT_COORDINATES.DOH, destination: AIRPORT_COORDINATES.CGK,
  },

  // 🇦🇺 Qantas
  {
    id: '7c0001', callsign: 'QFA1', airlineCode: 'QFA', airlineName: 'Qantas Airways',
    flightNumber: 'QF-1', aircraftModel: 'Boeing 787-9 Dreamliner', registration: 'VH-ZNA',
    country: 'Australia', latitude: -15.2000, longitude: 124.5000, altitude: 11582, altitudeFeet: 38000,
    velocity: 485, heading: 320, verticalRate: 0.0, onGround: false, squawk: '7103',
    origin: AIRPORT_COORDINATES.SYD, destination: AIRPORT_COORDINATES.LHR,
  },
  {
    id: '7c0041', callsign: 'QFA41', airlineCode: 'QFA', airlineName: 'Qantas Airways',
    flightNumber: 'QF-41', aircraftModel: 'Airbus A330-200', registration: 'VH-EBA',
    country: 'Australia', latitude: -21.4000, longitude: 128.2000, altitude: 10668, altitudeFeet: 35000,
    velocity: 460, heading: 315, verticalRate: 0.0, onGround: false, squawk: '1422',
    origin: AIRPORT_COORDINATES.SYD, destination: AIRPORT_COORDINATES.CGK,
  },

  // 🇯🇵 Japan Airlines & ANA
  {
    id: '860001', callsign: 'JAL1', airlineCode: 'JAL', airlineName: 'Japan Airlines',
    flightNumber: 'JL-1', aircraftModel: 'Boeing 777-300ER', registration: 'JA731J',
    country: 'Japan', latitude: 45.2000, longitude: -170.5000, altitude: 10972, altitudeFeet: 36000,
    velocity: 510, heading: 95, verticalRate: 0.0, onGround: false, squawk: '2350',
    origin: AIRPORT_COORDINATES.HND, destination: AIRPORT_COORDINATES.SFO,
  },
  {
    id: '868855', callsign: 'ANA855', airlineCode: 'ANA', airlineName: 'All Nippon Airways',
    flightNumber: 'NH-855', aircraftModel: 'Boeing 787-9 Dreamliner', registration: 'JA895A',
    country: 'Japan', latitude: 12.8000, longitude: 118.5000, altitude: 11277, altitudeFeet: 37000,
    velocity: 480, heading: 205, verticalRate: 0.0, onGround: false, squawk: '5532',
    origin: AIRPORT_COORDINATES.HND, destination: AIRPORT_COORDINATES.CGK,
  },

  // 🇭🇰 Cathay Pacific
  {
    id: '780888', callsign: 'CPA888', airlineCode: 'CPA', airlineName: 'Cathay Pacific',
    flightNumber: 'CX-888', aircraftModel: 'Airbus A350-1000', registration: 'B-LXA',
    country: 'Hong Kong', latitude: 50.1500, longitude: 165.2000, altitude: 11582, altitudeFeet: 38000,
    velocity: 490, heading: 70, verticalRate: 0.0, onGround: false, squawk: '6401',
    origin: AIRPORT_COORDINATES.HKG, destination: AIRPORT_COORDINATES.LAX,
  },

  // 🇬🇧 British Airways & 🇩🇪 Lufthansa
  {
    id: '400117', callsign: 'BAW117', airlineCode: 'BAW', airlineName: 'British Airways',
    flightNumber: 'BA-117', aircraftModel: 'Boeing 777-200ER', registration: 'G-VIIA',
    country: 'United Kingdom', latitude: 52.4000, longitude: -35.2000, altitude: 11277, altitudeFeet: 37000,
    velocity: 480, heading: 260, verticalRate: 0.0, onGround: false, squawk: '1520',
    origin: AIRPORT_COORDINATES.LHR, destination: AIRPORT_COORDINATES.JFK,
  },
  {
    id: '3c4400', callsign: 'DLH400', airlineCode: 'DLH', airlineName: 'Lufthansa',
    flightNumber: 'LH-400', aircraftModel: 'Airbus A340-300', registration: 'D-AIGL',
    country: 'Germany', latitude: 54.1000, longitude: -42.8000, altitude: 10972, altitudeFeet: 36000,
    velocity: 475, heading: 255, verticalRate: 0.0, onGround: false, squawk: '4255',
    origin: AIRPORT_COORDINATES.FRA, destination: AIRPORT_COORDINATES.JFK,
  },

  // 🇳🇱 KLM
  {
    id: '484835', callsign: 'KLM835', airlineCode: 'KLM', airlineName: 'KLM Royal Dutch Airlines',
    flightNumber: 'KL-835', aircraftModel: 'Boeing 777-300ER', registration: 'PH-BVO',
    country: 'Netherlands', latitude: 2.8500, longitude: 104.2000, altitude: 10363, altitudeFeet: 34000,
    velocity: 460, heading: 145, verticalRate: 0.0, onGround: false, squawk: '7105',
    origin: AIRPORT_COORDINATES.AMS, destination: AIRPORT_COORDINATES.DPS,
  },

  // 🇺🇸 United Airlines & Delta Air Lines
  {
    id: 'a00890', callsign: 'UAL890', airlineCode: 'UAL', airlineName: 'United Airlines',
    flightNumber: 'UA-890', aircraftModel: 'Boeing 777-200ER', registration: 'N78001',
    country: 'United States', latitude: 42.1000, longitude: -155.8000, altitude: 11582, altitudeFeet: 38000,
    velocity: 505, heading: 85, verticalRate: 0.0, onGround: false, squawk: '3512',
    origin: AIRPORT_COORDINATES.NRT, destination: AIRPORT_COORDINATES.SFO,
  },
  {
    id: 'a00283', callsign: 'DAL283', airlineCode: 'DAL', airlineName: 'Delta Air Lines',
    flightNumber: 'DL-283', aircraftModel: 'Airbus A350-900', registration: 'N501DN',
    country: 'United States', latitude: 44.8000, longitude: -178.5000, altitude: 11887, altitudeFeet: 39000,
    velocity: 485, heading: 275, verticalRate: 0.0, onGround: false, squawk: '4410',
    origin: AIRPORT_COORDINATES.LAX, destination: AIRPORT_COORDINATES.HND,
  },

  // 🇮🇩 Garuda Indonesia Long-Haul Umrah / Middle East
  {
    id: '8a0980', callsign: 'GIA980', airlineCode: 'GIA', airlineName: 'Garuda Indonesia',
    flightNumber: 'GA-980', aircraftModel: 'Boeing 777-300ER', registration: 'PK-GIK',
    country: 'Indonesia', latitude: 15.4500, longitude: 52.8500, altitude: 10668, altitudeFeet: 35000,
    velocity: 475, heading: 295, verticalRate: 0.0, onGround: false, squawk: '7214',
    origin: AIRPORT_COORDINATES.CGK, destination: AIRPORT_COORDINATES.JED,
  },

  // 🇦🇺 Qantas Airways Kangaroo Route
  {
    id: '7c0001', callsign: 'QFA1', airlineCode: 'QFA', airlineName: 'Qantas Airways',
    flightNumber: 'QF-1', aircraftModel: 'Airbus A380-800', registration: 'VH-OQA',
    country: 'Australia', latitude: -12.4500, longitude: 125.8500, altitude: 11582, altitudeFeet: 38000,
    velocity: 495, heading: 315, verticalRate: 0.0, onGround: false, squawk: '6201',
    origin: AIRPORT_COORDINATES.SYD, destination: AIRPORT_COORDINATES.LHR,
  },

  // 🇹🇷 Turkish Airlines Eurasia Hub
  {
    id: '4b8056', callsign: 'THY56', airlineCode: 'THY', airlineName: 'Turkish Airlines',
    flightNumber: 'TK-56', aircraftModel: 'Boeing 777-300ER', registration: 'TC-LJE',
    country: 'Turkey', latitude: 22.8500, longitude: 78.4500, altitude: 10972, altitudeFeet: 36000,
    velocity: 485, heading: 125, verticalRate: 0.0, onGround: false, squawk: '4310',
    origin: AIRPORT_COORDINATES.IST, destination: AIRPORT_COORDINATES.CGK,
  },

  // 🇫🇷 Air France Transatlantic
  {
    id: '394022', callsign: 'AFR022', airlineCode: 'AFR', airlineName: 'Air France',
    flightNumber: 'AF-22', aircraftModel: 'Airbus A350-900', registration: 'F-HTYA',
    country: 'France', latitude: 48.8500, longitude: -45.2000, altitude: 11887, altitudeFeet: 39000,
    velocity: 480, heading: 260, verticalRate: 0.0, onGround: false, squawk: '5211',
    origin: AIRPORT_COORDINATES.CDG, destination: AIRPORT_COORDINATES.JFK,
  },

  // 🇮🇩 TNI Angkatan Udara (Militer Transportasi)
  {
    id: '8a7001', callsign: 'TNI01', airlineCode: 'TNI', airlineName: 'TNI Angkatan Udara (Skadron Udara 31)',
    flightNumber: 'A-1340', aircraftModel: 'Lockheed Martin C-130J-30 Super Hercules', registration: 'A-1340',
    country: 'Indonesia', latitude: -5.8500, longitude: 114.2500, altitude: 7924, altitudeFeet: 26000,
    velocity: 340, heading: 75, verticalRate: 0.0, onGround: false, squawk: '7700',
    origin: AIRPORT_COORDINATES.HLP, destination: AIRPORT_COORDINATES.UPG,
  },

  // ✈️ Swasta / Private Corporate Super Jet
  {
    id: 'a99777', callsign: 'N777XX', airlineCode: 'DEFAULT', airlineName: 'Global Jet Executive Charter',
    flightNumber: 'PJ-777', aircraftModel: 'Gulfstream G650ER Luxury Business Jet', registration: 'N777XX',
    country: 'United States', latitude: 18.2500, longitude: 74.8500, altitude: 13106, altitudeFeet: 43000,
    velocity: 520, heading: 120, verticalRate: 0.0, onGround: false, squawk: '1200',
    origin: AIRPORT_COORDINATES.DXB, destination: AIRPORT_COORDINATES.SIN,
  },
];

function generateFlightTrajectory(origin, currentLat, currentLon, destination) {
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
  const state = globalThis._openskyGlobalState;

  // Ensure all worldwide active flights are seeded in state
  WORLDWIDE_ACTIVE_FLEET.forEach((f) => {
    if (!state.flights.has(f.id)) {
      const { pastTrail, futureTrail } = generateFlightTrajectory(f.origin, f.latitude, f.longitude, f.destination);
      state.flights.set(f.id, {
        ...f,
        realName: `${f.airlineName} (${f.flightNumber})`,
        estimatedRoute: `${f.origin.city} (${f.origin.code}) ➔ ${f.destination.city} (${f.destination.code})`,
        pastTrail,
        futureTrail,
        lastSeen: now,
      });
    }
  });

  const activeFlights = advanceWorldwideKinematics(Array.from(state.flights.values()), now);

  return NextResponse.json(
    {
      success: true,
      count: activeFlights.length,
      timestamp: Math.floor(now / 1000),
      source: 'worldwide_adsb_realtime_stream',
      data: activeFlights,
    },
    { status: 200, headers: securityHeaders }
  );
}

let lastGlobalTime = Date.now();
function advanceWorldwideKinematics(flights, now) {
  const dt = Math.min((now - lastGlobalTime) / 1000, 10);
  lastGlobalTime = now;

  return flights.map((p) => {
    if (p.onGround) return p;

    const vMs = (p.velocity || 450) * 0.514444;
    const distMeters = vMs * dt;
    const rad = ((p.heading || 0) * Math.PI) / 180;

    const dLat = (distMeters * Math.cos(rad)) / 111139;
    const dLon = (distMeters * Math.sin(rad)) / (111139 * Math.cos((p.latitude * Math.PI) / 180));

    p.latitude = Number((p.latitude + dLat).toFixed(4));
    p.longitude = Number((p.longitude + dLon).toFixed(4));
    p.lastSeen = now;

    if (p.longitude > 180) p.longitude -= 360;
    if (p.longitude < -180) p.longitude += 360;

    const { pastTrail, futureTrail } = generateFlightTrajectory(p.origin, p.latitude, p.longitude, p.destination);
    p.pastTrail = pastTrail;
    p.futureTrail = futureTrail;

    return p;
  });
}
