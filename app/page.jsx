'use client';

import dynamic from 'next/dynamic';
import { Radio, Plane, Ship } from 'lucide-react';

// Dynamic import with ssr: false to guarantee zero SSR/window undefined issues with Leaflet
const MapTracker = dynamic(() => import('./components/MapTracker'), {
  ssr: false,
  loading: () => <LoadingRadarSkeleton />,
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-radar-bg">
      <MapTracker />
    </main>
  );
}

// Sleek tactical radar loading skeleton
function LoadingRadarSkeleton() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-radar-bg text-slate-200">
      {/* Background Radar Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

      {/* Rotating Radar Beacon Animation */}
      <div className="relative flex items-center justify-center w-52 h-52 rounded-full border border-sky-500/30 bg-slate-900/60 shadow-[0_0_50px_rgba(56,189,248,0.15)] mb-6">
        <div className="absolute w-36 h-36 rounded-full border border-sky-500/20"></div>
        <div className="absolute w-20 h-20 rounded-full border border-sky-500/20"></div>

        {/* Sweep scanner */}
        <div className="absolute inset-0 rounded-full animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(56,189,248,0.35)_360deg)] pointer-events-none"></div>

        {/* Center Icons */}
        <div className="relative z-10 flex items-center space-x-2">
          <Plane className="w-6 h-6 text-amber-400 animate-pulse" />
          <Radio className="w-7 h-7 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <Ship className="w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 text-center space-y-2">
        <h2 className="text-lg font-bold tracking-widest text-slate-100 uppercase">
          MEMUAT NUSANTARA RADAR
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Inisialisasi Leaflet Engine &amp; Menghubungkan Telemetri ADS-B / AIS...
        </p>
      </div>
    </div>
  );
}
