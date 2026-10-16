# 🛰️ Nusantara Radar: Real-Time ADS-B & AIS Tracker

Aplikasi pelacakan real-time modern untuk **Penerbangan (ADS-B via OpenSky Network)** dan **Kapal Maritim (AIS via Aisstream.io)** dalam satu peta interaktif berfokus pada wilayah Indonesia dan Asia Tenggara. 

Dibangun dengan **Next.js 14 (App Router)**, **Tailwind CSS**, dan **Leaflet**, dirancang khusus untuk deployment di **Vercel (Hobby Tier Free)** dengan standar keamanan zero-leakage API Key di sisi server.

---

## 🔒 Arsitektur Keamanan Next.js (Vercel Serverless)

Aplikasi ini menggunakan **Next.js Route Handlers (`/app/api`)** sebagai *backend proxy & security shield*:

1. **Zero Client Leakage**:
   - `AISSTREAM_API_KEY`, `OPENSKY_USERNAME`, dan `OPENSKY_PASSWORD` tersimpan 100% aman di Environment Variables server Node.js Vercel.
   - Komponen Frontend (`'use client'`) **HANYA** memanggil endpoint internal `/api/planes` dan `/api/ships`. DevTools browser tidak akan pernah melihat API Key eksternal.
2. **Security Headers**:
   - `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` (mencegah caching data rahasia/stale).
   - `X-Content-Type-Options: nosniff`.
   - `X-Frame-Options: DENY`.
3. **Graceful Failover & Rate Limit Guard**:
   - Menggunakan in-memory caching pada warm serverless invocations untuk mematuhi rate limit publik OpenSky (HTTP 429 guard).
   - Menyediakan simulasi realistik lalu lintas perairan (Selat Sunda, Selat Malaka, Laut Jawa, Selat Bali) dan ruang udara Indonesia jika API Key belum dipasang atau kuota habis, sehingga peta tetap hidup dan interaktif.

---

## 🚀 Fitur Utama

- **Peta Interaktif Multifungsi**:
  - Peta default berpusat di Indonesia (`[-2.5489, 118.0149]`, Zoom 5).
  - Pilihan layer peta: **Radar Dark** (CartoDB Dark Matter), **OpenStreetMap**, dan **Satelit Esri**.
  - Pilihan fokus wilayah kilat: Seluruh Nusantara, Selat Malaka / SG, Selat Sunda (Merak-Bakauheni), Jakarta TMA & Priok, Surabaya & Laut Jawa, Selat Bali, dan Selat Makassar.
- **Marker Pesawat (ADS-B)**:
  - Ikon SVG pesawat aerodinamis modern yang **berotasi dinamis sesuai arah kompas (`heading`)**.
  - Warna kontras *amber/gold* dengan efek radar glow.
  - Popup dan Telemetry Inspector lengkap: Callsign, ICAO 24-bit transponder, Ketinggian (feet & meter), Kecepatan (knots & km/h), Tingkat laju naik/turun (*vertical rate*), Squawk code, dan Negara asal.
- **Marker Kapal (AIS)**:
  - Ikon SVG siluet kapal dengan arah haluan (*course over ground*).
  - Warna kontras *cyan/emerald*.
  - Popup dan Telemetry Inspector: Nama Kapal, MMSI, Bendera Negara (MID-decoded), Tipe Kapal (Ferry, Tanker, Container, Passenger), Kecepatan (SOG knots), Status Navigasi, dan Pelabuhan Tujuan.
- **Glassmorphism Control Panel (Tailwind CSS)**:
  - Checkbox toggle filter layer independen (`[x] Pesawat`, `[x] Kapal`).
  - Indikator status koneksi API real-time (Online / Cache / Error).
  - Counter total pesawat & kapal yang aktif.
  - Live search bar untuk memfilter armada berdasarkan Callsign, MMSI, Nama Kapal, atau Negara.
  - Auto-refresh interval (15 detik) + tombol segarkan manual.
  - Telemetri inspector drawer di sisi samping untuk mengunci kamera ke armada yang dipilih.

---

## 📂 Struktur Project

```text
flight-radar/
├── app/
│   ├── api/
│   │   ├── planes/
│   │   │   └── route.js          # Server Route Handler: OpenSky API Proxy + BBOX Filter + Caching
│   │   └── ships/
│   │       └── route.js          # Server Route Handler: Aisstream.io WebSocket Proxy + Sanitizer
│   ├── components/
│   │   └── MapTracker.jsx        # Client Component: Leaflet Map, SVG Rotation, UI Glassmorphism
│   ├── globals.css               # Tailwind directives & Custom Leaflet styling
│   ├── layout.jsx                # Root layout & Leaflet CDN
│   └── page.jsx                  # Main page entry with SSR-safe dynamic loading & radar skeleton
├── .env.example                  # Template Environment Variables
├── next.config.js                # Next.js production configuration & security headers
├── package.json                  # Dependencies: Next.js 14, Leaflet, Tailwind CSS, Lucide
├── postcss.config.js             # PostCSS plugins
├── tailwind.config.js            # Tailwind custom radar themes & animations
└── README.md                     # Dokumentasi project
```

---

## 🛠️ Panduan Instalasi Lokal

### 1. Clone & Masuk ke Folder Project
```bash
git clone https://github.com/username/flight-radar.git
cd flight-radar
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi kredensial Anda (opsional, aplikasi tetap dapat berjalan dengan simulasi & anonymous OpenSky jika dikosongkan):
```env
# Dapatkan gratis di https://aisstream.io
AISSTREAM_API_KEY=your_aisstream_api_key_here

# Dapatkan gratis di https://opensky-network.org
OPENSKY_USERNAME=your_opensky_username
OPENSKY_PASSWORD=your_opensky_password
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🌐 Panduan Deployment ke Vercel (Hobby Tier Free)

Project ini siap 100% untuk langsung di-deploy ke Vercel:

1. **Push ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release Nusantara Radar ADS-B & AIS Tracker"
   git branch -M main
   git remote add origin https://github.com/username/flight-radar.git
   git push -u origin main
   ```

2. **Import ke Vercel**:
   - Buka [vercel.com](https://vercel.com) dan klik **"Add New Project"**.
   - Pilih repository GitHub Anda.
   - Framework preset akan otomatis terdeteksi sebagai **Next.js**.

3. **Set Environment Variables di Vercel Dashboard**:
   - Di bagian **Environment Variables**, tambahkan:
     * `AISSTREAM_API_KEY`: *(API Key Anda dari aisstream.io)*
     * `OPENSKY_USERNAME`: *(Username OpenSky Anda - opsional)*
     * `OPENSKY_PASSWORD`: *(Password OpenSky Anda - opsional)*
   - Klik **Deploy**.

4. Aplikasi Anda langsung aktif secara global dengan domain gratis `*.vercel.app`!

---

## 📜 Lisensi
MIT License &copy; 2026 Nusantara Radar Team.
