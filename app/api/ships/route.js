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

// Global Strategic Seaports & Cruise Terminals Directory
const GLOBAL_SEAPORTS = {
  // 🇮🇩 Indonesia Key Ports
  PRIOK: {
    code: 'IDTPP',
    name: 'Pelabuhan Tanjung Priok (Jakarta)',
    city: 'Jakarta Utara',
    country: 'Indonesia',
    lat: -6.1020,
    lon: 106.8820
  },
  PERAK: {
    code: 'IDSUB',
    name: 'Pelabuhan Tanjung Perak',
    city: 'Surabaya, Jawa Timur',
    country: 'Indonesia',
    lat: -7.2000,
    lon: 112.7300
  },
  MERAK: {
    code: 'IDMRK',
    name: 'Pelabuhan Penyeberangan Merak',
    city: 'Cilegon, Banten',
    country: 'Indonesia',
    lat: -5.9320,
    lon: 105.9980
  },
  BAKAUHENI: {
    code: 'IDBKH',
    name: 'Pelabuhan Penyeberangan Bakauheni',
    city: 'Lampung Selatan',
    country: 'Indonesia',
    lat: -5.8680,
    lon: 105.7520
  },
  BATAM: {
    code: 'IDBTH',
    name: 'Pelabuhan Batu Ampar',
    city: 'Batam, Kepulauan Riau',
    country: 'Indonesia',
    lat: 1.1600,
    lon: 103.9800
  },
  BALONGAN: {
    code: 'IDBLN',
    name: 'Terminal Khusus Migas Kilang Balongan',
    city: 'Indramayu, Jawa Barat',
    country: 'Indonesia',
    lat: -6.3400,
    lon: 108.3800
  },
  MAKASSAR: {
    code: 'IDMAK',
    name: 'Pelabuhan Soekarno-Hatta Makassar',
    city: 'Makassar, Sulawesi Selatan',
    country: 'Indonesia',
    lat: -5.1200,
    lon: 119.4100
  },
  BENOA: {
    code: 'IDBOA',
    name: 'Pelabuhan Wisata & Pesiar Benoa',
    city: 'Denpasar, Bali',
    country: 'Indonesia',
    lat: -8.7450,
    lon: 115.2150
  },
  BELAWAN: {
    code: 'IDBLW',
    name: 'Pelabuhan Belawan International',
    city: 'Medan, Sumatra Utara',
    country: 'Indonesia',
    lat: 3.7850,
    lon: 98.6850
  },
  SORONG: {
    code: 'IDSOQ',
    name: 'Pelabuhan Sorong (Pintu Raja Ampat)',
    city: 'Sorong, Papua Barat Daya',
    country: 'Indonesia',
    lat: -0.8750,
    lon: 131.2500
  },
  AMBON: {
    code: 'IDAMB',
    name: 'Pelabuhan Yos Sudarso Ambon',
    city: 'Ambon, Maluku',
    country: 'Indonesia',
    lat: -3.6950,
    lon: 128.1800
  },
  LEMBAR: {
    code: 'IDLMB',
    name: 'Pelabuhan Lembar Lombok',
    city: 'Lombok Barat, NTB',
    country: 'Indonesia',
    lat: -8.7250,
    lon: 116.0700
  },
  NATUNA: {
    code: 'IDNTN',
    name: 'Pangkalan Maritim Ranai Natuna',
    city: 'Kepulauan Natuna',
    country: 'Indonesia',
    lat: 3.9400,
    lon: 108.3800
  },

  // 🌍 Global Major Cruise & Hub Ports
  MIAMI: {
    code: 'USMIA',
    name: 'PortMiami (Ibukota Kapal Pesiar Dunia)',
    city: 'Miami, Florida',
    country: 'Amerika Serikat',
    lat: 25.7740,
    lon: -80.1700
  },
  NASSAU: {
    code: 'BSNAS',
    name: 'Pelabuhan Kapal Pesiar Nassau Harbour',
    city: 'Nassau, New Providence',
    country: 'Bahamas',
    lat: 25.0800,
    lon: -77.3400
  },
  COZUMEL: {
    code: 'MXCZM',
    name: 'Terminal Pesiar Internasional Cozumel',
    city: 'Quintana Roo',
    country: 'Meksiko',
    lat: 20.4900,
    lon: -86.9700
  },
  BARCELONA: {
    code: 'ESBCN',
    name: 'Port de Barcelona (Hub Pesiar Mediterania)',
    city: 'Barcelona, Katalunya',
    country: 'Spanyol',
    lat: 41.3500,
    lon: 2.1700
  },
  CIVITAVECCHIA: {
    code: 'ITCVV',
    name: 'Pelabuhan Pesiar Roma (Civitavecchia)',
    city: 'Roma / Lazio',
    country: 'Italia',
    lat: 42.0900,
    lon: 11.7900
  },
  SOUTHAMPTON: {
    code: 'GBSOU',
    name: 'Pelabuhan Kapal Pesiar Southampton',
    city: 'Southampton, Hampshire',
    country: 'Inggris',
    lat: 50.8900,
    lon: -1.4000
  },
  NEWYORK: {
    code: 'USNYC',
    name: 'Pelabuhan New York & Manhattan Cruise Terminal',
    city: 'New York',
    country: 'Amerika Serikat',
    lat: 40.6600,
    lon: -74.1200
  },
  LOSANGELES: {
    code: 'USLAX',
    name: 'Pelabuhan Los Angeles & World Cruise Center',
    city: 'San Pedro, California',
    country: 'Amerika Serikat',
    lat: 33.7400,
    lon: -118.2600
  },
  SINGAPORE: {
    code: 'SGSIN',
    name: 'Marina Bay Cruise Centre & PSA Port',
    city: 'Singapura',
    country: 'Singapura',
    lat: 1.2644,
    lon: 103.8400
  },
  ROTTERDAM: {
    code: 'NLRTM',
    name: 'Pelabuhan Internasional Rotterdam (Europoort)',
    city: 'Rotterdam',
    country: 'Belanda',
    lat: 51.9500,
    lon: 4.1400
  },
  SHANGHAI: {
    code: 'CNSHA',
    name: 'Pelabuhan Shanghai (Yangshan Deep-Water Port)',
    city: 'Shanghai',
    country: 'China',
    lat: 30.6200,
    lon: 122.0600
  },
  YANTIAN: {
    code: 'CNYAT',
    name: 'Pelabuhan Kontainer Yantian',
    city: 'Shenzhen',
    country: 'China',
    lat: 22.5700,
    lon: 114.2600
  },
  YOKOHAMA: {
    code: 'JPYOK',
    name: 'Pelabuhan Kapal Pesiar Osanbashi Yokohama',
    city: 'Yokohama / Tokyo',
    country: 'Jepang',
    lat: 35.4500,
    lon: 139.6500
  },
  SYDNEY: {
    code: 'AUSYD',
    name: 'Overseas Passenger Terminal Sydney Harbour',
    city: 'Sydney, New South Wales',
    country: 'Australia',
    lat: -33.8580,
    lon: 151.2100
  },
  SUEZ: {
    code: 'EGSUZ',
    name: 'Pintu Masuk Terusan Suez (Port Said)',
    city: 'Port Said',
    country: 'Mesir',
    lat: 31.2500,
    lon: 32.3200
  },
  HORMUZ: {
    code: 'OMMKT',
    name: 'Terminal Minyak Selat Hormuz / Ras Tanura',
    city: 'Teluk Persia',
    country: 'Arab Saudi',
    lat: 26.6500,
    lon: 50.1500
  },
  DUBAI: {
    code: 'AEDXB',
    name: 'Dubai Cruise Terminal Mina Rashid',
    city: 'Dubai',
    country: 'Uni Emirat Arab',
    lat: 25.2600,
    lon: 55.2800
  },
};

// Comprehensive Global Active Vessels Fleet (Cruise Ships, Cargo, Tankers, Ferries, Warships, Superyachts)
const WORLDWIDE_ACTIVE_VESSELS = [
  // 🚢 1. GLOBAL LUXURY CRUISE SHIPS (KAPAL PESIAR DUNIA)
  {
    mmsi: 311001201, name: 'ICON OF THE SEAS', fullName: 'Icon of the Seas (Royal Caribbean)',
    operator: 'Royal Caribbean International', operatorCode: 'ROYAL_CARIBBEAN',
    type: 'Kapal Pesiar Raksasa (World Largest Cruise Ship - 250,800 GT)', flag: 'BS', flagName: 'Bahamas',
    latitude: 23.4500, longitude: -83.2500, sog: 21.2, cog: 245, heading: 245,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.MIAMI, destination: GLOBAL_SEAPORTS.COZUMEL,
  },
  {
    mmsi: 311000759, name: 'SYMPHONY OF THE SEAS', fullName: 'Symphony of the Seas (Oasis Class)',
    operator: 'Royal Caribbean International', operatorCode: 'ROYAL_CARIBBEAN',
    type: 'Kapal Pesiar Mewah (Oasis-class - 228,081 GT)', flag: 'BS', flagName: 'Bahamas',
    latitude: 41.6500, longitude: 7.4500, sog: 20.5, cog: 110, heading: 110,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BARCELONA, destination: GLOBAL_SEAPORTS.CIVITAVECCHIA,
  },
  {
    mmsi: 311001033, name: 'WONDER OF THE SEAS', fullName: 'Wonder of the Seas (Royal Caribbean)',
    operator: 'Royal Caribbean International', operatorCode: 'ROYAL_CARIBBEAN',
    type: 'Kapal Pesiar Super (236,857 GT)', flag: 'BS', flagName: 'Bahamas',
    latitude: 25.4500, longitude: -78.8500, sog: 19.8, cog: 95, heading: 95,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.MIAMI, destination: GLOBAL_SEAPORTS.NASSAU,
  },
  {
    mmsi: 310627000, name: 'QUEEN MARY 2', fullName: 'RMS Queen Mary 2 (Cunard Ocean Liner)',
    operator: 'Cunard Line', operatorCode: 'CUNARD',
    type: 'Kapal Pesiar Samudra Transatlantik (149,215 GT)', flag: 'BM', flagName: 'Bermuda',
    latitude: 45.2000, longitude: -42.5000, sog: 24.2, cog: 255, heading: 255,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SOUTHAMPTON, destination: GLOBAL_SEAPORTS.NEWYORK,
  },
  {
    mmsi: 311001140, name: 'CARNIVAL JUBILEE', fullName: 'Carnival Jubilee (Carnival Cruise Line)',
    operator: 'Carnival Cruise Line', operatorCode: 'CARNIVAL',
    type: 'Kapal Pesiar LNG Kelas Excel (183,521 GT)', flag: 'PA', flagName: 'Panama',
    latitude: 24.1500, longitude: -90.8500, sog: 18.6, cog: 165, heading: 165,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.MIAMI, destination: GLOBAL_SEAPORTS.COZUMEL,
  },
  {
    mmsi: 311000850, name: 'CARNIVAL PANORAMA', fullName: 'Carnival Panorama (Vista Class)',
    operator: 'Carnival Cruise Line', operatorCode: 'CARNIVAL',
    type: 'Kapal Pesiar Samudra Pasifik (133,500 GT)', flag: 'PA', flagName: 'Panama',
    latitude: 28.5000, longitude: -115.4000, sog: 19.5, cog: 145, heading: 145,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.LOSANGELES, destination: GLOBAL_SEAPORTS.COZUMEL,
  },
  {
    mmsi: 310500001, name: 'DIAMOND PRINCESS', fullName: 'Diamond Princess (Princess Cruises)',
    operator: 'Princess Cruises', operatorCode: 'PRINCESS',
    type: 'Kapal Pesiar Internasional (115,875 GT)', flag: 'GB', flagName: 'United Kingdom',
    latitude: 33.2000, longitude: 135.8000, sog: 18.0, cog: 220, heading: 220,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.YOKOHAMA, destination: GLOBAL_SEAPORTS.SHANGHAI,
  },
  {
    mmsi: 311000570, name: 'GENTING DREAM', fullName: 'Genting Dream (Resorts World Cruises)',
    operator: 'Resorts World Cruises', operatorCode: 'ROYAL_CARIBBEAN',
    type: 'Kapal Pesiar Megah Asia Tenggara (150,695 GT)', flag: 'BS', flagName: 'Bahamas',
    latitude: -4.8500, longitude: 111.4500, sog: 21.0, cog: 135, heading: 135,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SINGAPORE, destination: GLOBAL_SEAPORTS.BENOA,
  },

  // 🇮🇩 2. ARMADA NASIONAL INDONESIA (PELNI, FERI ASDP, & MIGAS PERTAMINA)
  {
    mmsi: 525015001, name: 'KM KELUD', fullName: 'KM Kelud (PT PELNI Persero)',
    operator: 'PT Pelayaran Nasional Indonesia (PELNI)', operatorCode: 'PELNI',
    type: 'Kapal Penumpang Antar-Pulau (14,665 GT)', flag: 'ID', flagName: 'Indonesia',
    latitude: -5.9234, longitude: 106.0125, sog: 16.5, cog: 235, heading: 235,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BATAM, destination: GLOBAL_SEAPORTS.PRIOK,
  },
  {
    mmsi: 525015002, name: 'KM LABOBAR', fullName: 'KM Labobar (PELNI Tol Laut)',
    operator: 'PT Pelayaran Nasional Indonesia (PELNI)', operatorCode: 'PELNI',
    type: 'Kapal Penumpang & Kargo Tol Laut (15,136 GT)', flag: 'ID', flagName: 'Indonesia',
    latitude: -3.8500, longitude: 122.4500, sog: 16.2, cog: 75, heading: 75,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.MAKASSAR, destination: GLOBAL_SEAPORTS.SORONG,
  },
  {
    mmsi: 525015003, name: 'KM DOBONSOLO', fullName: 'KM Dobonsolo (Lintas Jawa - Maluku - Papua)',
    operator: 'PT Pelayaran Nasional Indonesia (PELNI)', operatorCode: 'PELNI',
    type: 'Kapal Penumpang & Kendaraan (14,640 GT)', flag: 'ID', flagName: 'Indonesia',
    latitude: -6.4500, longitude: 116.8500, sog: 15.8, cog: 85, heading: 85,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.PERAK, destination: GLOBAL_SEAPORTS.AMBON,
  },
  {
    mmsi: 525015004, name: 'KM BUKIT RAYA', fullName: 'KM Bukit Raya (Jalur Kepulauan Riau & Natuna)',
    operator: 'PT Pelayaran Nasional Indonesia (PELNI)', operatorCode: 'PELNI',
    type: 'Kapal Penumpang Perintis Nusantara', flag: 'ID', flagName: 'Indonesia',
    latitude: 1.8500, longitude: 107.4500, sog: 14.5, cog: 25, heading: 25,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.PRIOK, destination: GLOBAL_SEAPORTS.NATUNA,
  },
  {
    mmsi: 525008012, name: 'KMP PORTLINK III', fullName: 'KMP Portlink III (Eksekutif Merak - Bakauheni)',
    operator: 'PT ASDP Indonesia Ferry (Persero)', operatorCode: 'ASDP',
    type: 'Kapal Feri Ro-Ro Eksekutif Selat Sunda (12,654 GT)', flag: 'ID', flagName: 'Indonesia',
    latitude: -5.8712, longitude: 105.9841, sog: 13.5, cog: 78, heading: 80,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BAKAUHENI, destination: GLOBAL_SEAPORTS.MERAK,
  },
  {
    mmsi: 525008035, name: 'KMP LEGUNDI', fullName: 'KMP Legundi (Lintas Surabaya - Lombok)',
    operator: 'PT ASDP Indonesia Ferry (Persero)', operatorCode: 'ASDP',
    type: 'Kapal Feri Ro-Ro Jarak Jauh (Long Distance Ferry)', flag: 'ID', flagName: 'Indonesia',
    latitude: -7.9500, longitude: 114.8500, sog: 14.2, cog: 115, heading: 115,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.PERAK, destination: GLOBAL_SEAPORTS.LEMBAR,
  },
  {
    mmsi: 525021004, name: 'PERTAMINA GAS 2', fullName: 'Pertamina Gas 2 (PIS VLGC)',
    operator: 'PT Pertamina International Shipping', operatorCode: 'PERTAMINA',
    type: 'Very Large Gas Carrier (VLGC 84,000 CBM)', flag: 'ID', flagName: 'Indonesia',
    latitude: -6.2105, longitude: 108.3412, sog: 15.2, cog: 110, heading: 112,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BALONGAN, destination: GLOBAL_SEAPORTS.PRIOK,
  },
  {
    mmsi: 525021009, name: 'PERTAMINA PRIDE', fullName: 'Pertamina Pride (Very Large Crude Carrier)',
    operator: 'PT Pertamina International Shipping', operatorCode: 'PERTAMINA',
    type: 'Very Large Crude Carrier (VLCC 2 Juta Barel - 301,000 DWT)', flag: 'ID', flagName: 'Indonesia',
    latitude: 3.1500, longitude: 100.8500, sog: 14.5, cog: 135, heading: 135,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.HORMUZ, destination: GLOBAL_SEAPORTS.BALONGAN,
  },
  {
    mmsi: 525019888, name: 'MERATUS KAHAYAN', fullName: 'Meratus Kahayan (Meratus Line)',
    operator: 'PT Meratus Line', operatorCode: 'MERATUS',
    type: 'Kapal Kontainer Domestik Indonesia', flag: 'ID', flagName: 'Indonesia',
    latitude: -6.8500, longitude: 112.9500, sog: 12.8, cog: 350, heading: 348,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.PERAK, destination: GLOBAL_SEAPORTS.MAKASSAR,
  },
  {
    mmsi: 525019890, name: 'SPIL CITRA', fullName: 'Spil Citra (Salam Pacific Indonesia Lines)',
    operator: 'PT Salam Pacific Indonesia Lines', operatorCode: 'DEFAULT',
    type: 'Kapal Kontainer Tol Laut', flag: 'ID', flagName: 'Indonesia',
    latitude: -2.1500, longitude: 105.4500, sog: 13.5, cog: 320, heading: 320,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.PRIOK, destination: GLOBAL_SEAPORTS.BELAWAN,
  },

  // 🛡️ 3. KAPAL NEGARA, PERTAHANAN & PENJAGA PANTAI (DEFENSE & COAST GUARD)
  {
    mmsi: 525001278, name: 'KRI DIPONEGORO 365', fullName: 'KRI Diponegoro-365 (Korvet Sigma Class)',
    operator: 'TNI Angkatan Laut (Koarmada II)', operatorCode: 'TNI_AL',
    type: 'Kapal Perang Korvet Patroli Maritim Terpadu', flag: 'ID', flagName: 'Indonesia',
    latitude: -6.0500, longitude: 106.9100, sog: 23.5, cog: 40, heading: 40,
    navStatus: 'Engaged in patrol',
    origin: GLOBAL_SEAPORTS.PERAK, destination: GLOBAL_SEAPORTS.PRIOK,
  },
  {
    mmsi: 525001331, name: 'KRI R.E. MARTADINATA 331', fullName: 'KRI Raden Eddy Martadinata-331 (Fregat SIGMA 10514)',
    operator: 'TNI Angkatan Laut (Koarmada I)', operatorCode: 'TNI_AL',
    type: 'Fregat Tempur Rudal Kawal Perusak', flag: 'ID', flagName: 'Indonesia',
    latitude: 3.4500, longitude: 107.8500, sog: 26.0, cog: 15, heading: 15,
    navStatus: 'Engaged in patrol',
    origin: GLOBAL_SEAPORTS.BATAM, destination: GLOBAL_SEAPORTS.NATUNA,
  },
  {
    mmsi: 525009101, name: 'KN TANJUNG DATU 1101', fullName: 'KN Tanjung Datu 1101 (BAKAMLA RI)',
    operator: 'Badan Keamanan Laut (BAKAMLA RI)', operatorCode: 'BAKAMLA',
    type: 'Kapal Patroli Penjaga Pantai Lepas Pantai (110 Meter)', flag: 'ID', flagName: 'Indonesia',
    latitude: 2.8500, longitude: 108.9500, sog: 18.5, cog: 345, heading: 345,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.BATAM, destination: GLOBAL_SEAPORTS.NATUNA,
  },
  {
    mmsi: 338800078, name: 'USS GERALD R. FORD', fullName: 'USS Gerald R. Ford (CVN-78 Nuclear Aircraft Carrier)',
    operator: 'United States Navy', operatorCode: 'USNAVY',
    type: 'Kapal Induk Bertenaga Nuklir (100,000 Tonase)', flag: 'US', flagName: 'United States',
    latitude: 36.8500, longitude: -35.4000, sog: 28.5, cog: 85, heading: 85,
    navStatus: 'Restricted manoeuvrability',
    origin: GLOBAL_SEAPORTS.NEWYORK, destination: GLOBAL_SEAPORTS.SOUTHAMPTON,
  },

  // 🛥️ 4. KAPAL SWASTA / SUPERYACHT MEWAH (PRIVATE LUXURY YACHTS)
  {
    mmsi: 470000001, name: 'AZZAM', fullName: 'Superyacht Azzam (180 Meter Private Megayacht)',
    operator: 'Private Luxury Fleet', operatorCode: 'YACHT',
    type: 'Superyacht Pribadi Terpanjang di Dunia (180 Meter)', flag: 'AE', flagName: 'United Arab Emirates',
    latitude: 25.1500, longitude: 54.8500, sog: 18.0, cog: 65, heading: 65,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.DUBAI, destination: GLOBAL_SEAPORTS.HORMUZ,
  },
  {
    mmsi: 310000162, name: 'ECLIPSE', fullName: 'Superyacht Eclipse (162.5 Meter Mega Yacht)',
    operator: 'Private Luxury Fleet', operatorCode: 'YACHT',
    type: 'Superyacht Mewah Pribadi (Helipad Ganda & Submarine)', flag: 'BM', flagName: 'Bermuda',
    latitude: 37.4500, longitude: 24.1500, sog: 16.5, cog: 140, heading: 140,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.CIVITAVECCHIA, destination: GLOBAL_SEAPORTS.SUEZ,
  },

  // 🌍 5. RAKSASA LOGISTIK SAMUDRA DUNIA (CONTAINER & ULCC SUPERTANKERS)
  {
    mmsi: 563012900, name: 'MAERSK MC-KINNEY MOLLER', fullName: 'Maersk Mc-Kinney Moller (Triple-E Container)',
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
    latitude: 27.5000, longitude: 34.2000, sog: 16.2, cog: 330, heading: 330,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SINGAPORE, destination: GLOBAL_SEAPORTS.SUEZ,
  },
  {
    mmsi: 352002440, name: 'EVER ACE', fullName: 'Ever Ace (Megamax-24 Container 24,000 TEU)',
    operator: 'Evergreen Marine Corp.', operatorCode: 'EVERGREEN',
    type: 'Megamax Ultra Large Container Ship (24,000 TEU)', flag: 'PA', flagName: 'Panama',
    latitude: 14.8500, longitude: 114.2000, sog: 19.5, cog: 215, heading: 215,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SHANGHAI, destination: GLOBAL_SEAPORTS.SINGAPORE,
  },
  {
    mmsi: 372002150, name: 'MSC OSCAR', fullName: 'MSC Oscar (Mediterranean Shipping Co.)',
    operator: 'Mediterranean Shipping Company (MSC)', operatorCode: 'MSC',
    type: 'Ultra Large Container Vessel (19,224 TEU)', flag: 'PA', flagName: 'Panama',
    latitude: 12.4500, longitude: 51.2000, sog: 18.2, cog: 260, heading: 260,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.SHANGHAI, destination: GLOBAL_SEAPORTS.ROTTERDAM,
  },
  {
    mmsi: 352001999, name: 'MSC IRINA', fullName: 'MSC Irina (World Record Capacity Container Ship)',
    operator: 'Mediterranean Shipping Company (MSC)', operatorCode: 'MSC',
    type: 'Ultra Large Container Giant (24,346 TEU)', flag: 'PA', flagName: 'Panama',
    latitude: 25.8000, longitude: -150.5000, sog: 19.8, cog: 70, heading: 70,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.YANTIAN, destination: GLOBAL_SEAPORTS.LOSANGELES,
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
    mmsi: 538008123, name: 'TI EUROPE', fullName: 'TI Europe (Euronav ULCC Supertanker)',
    operator: 'Euronav Tankers / PIS Charter', operatorCode: 'PERTAMINA',
    type: 'Ultra Large Crude Carrier (ULCC 3.1 Juta Barel - 441,561 DWT)', flag: 'MH', flagName: 'Marshall Islands',
    latitude: 18.5000, longitude: 64.2000, sog: 14.8, cog: 125, heading: 125,
    navStatus: 'Under way using engine',
    origin: GLOBAL_SEAPORTS.HORMUZ, destination: GLOBAL_SEAPORTS.SINGAPORE,
  },
];

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

// Caching layer for Digitraffic open live AIS feed
let lastDigitrafficFetch = 0;
let cachedLiveVessels = [];

async function fetchLiveOpenAisVessels() {
  const now = Date.now();
  if (now - lastDigitrafficFetch < 60000 && cachedLiveVessels.length > 0) {
    return cachedLiveVessels;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://meri.digitraffic.fi/api/ais/v1/locations', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IndoSkySea-OpenMaritimeRadar/1.0',
      },
      next: { revalidate: 60 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features && Array.isArray(data.features)) {
        // Filter active sailing vessels (sog > 1.5 knots)
        const moving = data.features
          .filter((f) => f.properties && f.properties.sog > 1.5 && f.geometry && f.geometry.coordinates)
          .slice(0, 30); // Take top 30 active live vessels

        cachedLiveVessels = moving.map((f, idx) => {
          const coords = f.geometry.coordinates; // [lon, lat]
          const p = f.properties;
          const lon = coords[0];
          const lat = coords[1];

          return {
            mmsi: p.mmsi || (700000000 + idx),
            name: `AIS LIVE ${p.mmsi}`,
            fullName: `Kapal Niaga Internasional (MMSI: ${p.mmsi})`,
            operator: 'International Maritime Commercial',
            operatorCode: 'DEFAULT',
            type: p.sog > 18 ? 'Kapal Cepat / Kontainer AIS Live' : 'Kapal Niaga Pelayaran Bebas (Live AIS)',
            flag: 'EU',
            flagName: 'International (European Waters)',
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lon.toFixed(4)),
            sog: Number(p.sog.toFixed(1)),
            cog: Math.round(p.cog || 0),
            heading: Math.round(p.heading || p.cog || 0),
            navStatus: 'Under way using engine',
            destinationName: 'International Open Waters',
            pastTrail: [
              [Number((lat - 0.05).toFixed(4)), Number((lon - 0.05).toFixed(4))],
              [Number(lat.toFixed(4)), Number(lon.toFixed(4))],
            ],
            futureTrail: [
              [Number(lat.toFixed(4)), Number(lon.toFixed(4))],
              [Number((lat + 0.05).toFixed(4)), Number((lon + 0.05).toFixed(4))],
            ],
            lastSeen: now,
          };
        });

        lastDigitrafficFetch = now;
        return cachedLiveVessels;
      }
    }
  } catch (err) {
    // Graceful fallback to pure internal kinematics without failing
  }

  return cachedLiveVessels;
}

export async function GET() {
  const securityHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'X-Content-Type-Options': 'nosniff',
  };

  const now = Date.now();
  const state = globalThis._shipGlobalState;

  // Ensure all worldwide active vessels are seeded in state
  WORLDWIDE_ACTIVE_VESSELS.forEach((s) => {
    if (!state.ships.has(s.mmsi)) {
      const { pastTrail, futureTrail } = generateShipTrajectory(s.origin, s.latitude, s.longitude, s.destination);
      state.ships.set(s.mmsi, {
        ...s,
        destinationName: `${s.origin.name} ➔ ${s.destination.name}`,
        pastTrail,
        futureTrail,
        lastSeen: now,
      });
    }
  });

  // Advance primary worldwide fleet using real physics
  const activeVessels = advanceWorldwideVessels(Array.from(state.ships.values()), now);

  // Fetch optional open live AIS feed asynchronously
  const openAisVessels = await fetchLiveOpenAisVessels();
  const combinedVessels = [...activeVessels, ...openAisVessels];

  return NextResponse.json(
    {
      success: true,
      count: combinedVessels.length,
      timestamp: Math.floor(now / 1000),
      source: 'worldwide_ais_hybrid_stream',
      data: combinedVessels,
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
