# IndoSkySea

Real-Time ADS-B Aviation & Maritime AIS Global Tracking Platform.

IndoSkySea is an open-architecture, high-performance web tracking platform designed to visualize commercial, national, private, and defense movements across global airspace and maritime corridors. Built using Next.js 14, Leaflet, and Google Maps tiles, IndoSkySea delivers real-time telemetry tracking with zero expensive enterprise satellite subscription overheads through an intelligent hybrid streaming architecture.

---

## Architecture Overview

IndoSkySea addresses the industry challenge of expensive satellite feeds (S-AIS and space-based ADS-B) by implementing a dual-layer hybrid architecture:

1. **Live Open Telemetry Feeds**:
   - Ingests real-time ADS-B and AIS data from open crowdsourced networks and governmental maritime endpoints (such as Digitraffic open maritime feeds and open ADS-B aggregators).
2. **Kinematic Dead Reckoning Engine**:
   - For mid-ocean crossings, remote archipelagic corridors, and intercontinental flights outside ground antenna line-of-sight, IndoSkySea calculates sub-second position translations based on true ground speed (knots), heading, course over ground (COG), and great-circle navigation routes.
3. **Route & Trajectory Visualizer**:
   - Renders a continuous solid line representing the trajectory already completed, and a dashed line projecting the route forward to the destination waypoint.

---

## Key Capabilities

### Aviation Monitoring (ADS-B)
- Tracks international commercial airliners, regional domestic carriers, cargo freighters, and long-haul intercontinental routes.
- Includes military transport and defense logistics (e.g., TNI AU Super Hercules, C-17) and private corporate charter jets (e.g., Gulfstream G650ER).
- Computes calibrated air speed, barometric altitude, vertical rate, squawk code, registration, and full official airport origin and destination names.

### Maritime Monitoring (AIS)
- Tracks world-class ocean cruise liners (e.g., Royal Caribbean, Carnival Cruise Line, Cunard, Princess Cruises) across the Caribbean, Mediterranean, and Pacific.
- Comprehensive Indonesian archipelagic fleet: PT PELNI passenger liners, ASDP Ro-Ro ferries, Pertamina VLCC supertankers, and coastal container vessels.
- Strategic defense and security vessels: TNI Angkatan Laut corvettes/frigates, BAKAMLA offshore patrol vessels, and international naval assets.
- Luxury private superyachts and container giants (e.g., Maersk, Evergreen, MSC, CMA CGM).

### User Experience & Interface
- **Unified Desktop Header**: Combines brand identity, live search, entity filters (Planes/Ships), regional presets, and map layer controls in a single streamlined row.
- **Ergonomic Mobile Bottom Sheet**: Touch-enabled drawer with a minimalist pull handle, supporting peek state and smooth 90% viewport expansion.
- **Official Vector Branding**: Lightweight vector SVG logos rendered client-side for airlines, cruise lines, and shipping companies.
- **Progressive Web App (PWA)**: Standalone installation support across Windows, macOS, Android, and iOS Safari.
- **Legal & Compliance Framework**: Clean, markdown-style terms of use and disclaimer modal for responsible monitoring and emergency contact use.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Map & Geospatial**: Leaflet.js with Google Maps Roadmap Tiles
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Icons**: Lucide React & Custom SVG Vector Library
- **PWA**: Service Worker with Web App Manifest (standalone mode)
- **Runtime**: Node.js 18+

---

## Project Structure

```text
flight-radar/
├── app/
│   ├── api/
│   │   ├── planes/
│   │   │   └── route.js          # ADS-B ingestion & global flight kinematics
│   │   └── ships/
│   │       └── route.js          # AIS open feed consumer & maritime dead reckoning
│   ├── components/
│   │   ├── DisclaimerModal.jsx   # Professional legal paper disclaimer modal
│   │   ├── MapTracker.jsx        # Core Leaflet map, filters, and telemetry drawer
│   │   └── PwaInstallModal.jsx   # PWA installation prompt and iOS guide
│   ├── lib/
│   │   └── logos.js              # Vector SVG library for airlines & maritime lines
│   ├── globals.css               # Design tokens, Leaflet markers, glassmorphism
│   ├── layout.jsx                # Root layout, PWA meta tags, and favicons
│   └── page.jsx                  # Entry point with dynamic SSR client loader
├── public/
│   ├── apple-touch-icon.png      # 180x180 iOS touch icon
│   ├── favicon-96x96.png         # High-resolution 96x96 favicon
│   ├── favicon.svg               # Vector brand favicon
│   ├── site.webmanifest          # PWA web manifest specification
│   └── sw.js                     # PWA caching service worker
├── next.config.js                # Next.js security headers and optimization
├── tailwind.config.js            # Tailwind theme tokens
├── package.json                  # Dependencies and build scripts
├── LICENSE                       # MIT License
└── README.md                     # Documentation
```

---

## Getting Started

### Prerequisites
- Node.js version 18.17.0 or higher
- npm or yarn

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/your-username/flight-radar.git
   cd flight-radar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

5. Build for production:
   ```bash
   npm run build
   npm run start
   ```

---

## Disclaimer

IndoSkySea is developed as a technical visualization and monitoring tool for public awareness, research, and educational purposes. Telemetry data is presented "as is" and should not be relied upon as an official Air Traffic Control (ATC) or Vessel Traffic Service (VTS) navigation system.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
