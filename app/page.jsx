'use client';

import dynamic from 'next/dynamic';
import { Plane, Ship } from 'lucide-react';

// Dynamic import dengan ssr: false untuk menjamin 0 error window/document undefined di Next.js
const MapTracker = dynamic(() => import('./components/MapTracker'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-50">
      <MapTracker />
    </main>
  );
}

// Clean elegant light theme loading skeleton
function LoadingSkeleton() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl border border-slate-200/80 mb-5">
        <div className="absolute inset-0 rounded-2xl border-2 border-sky-500 border-t-transparent animate-spin"></div>
        <Plane className="w-8 h-8 text-sky-600 animate-pulse" />
      </div>

      <div className="relative z-10 text-center space-y-1.5">
        <h2 className="text-sm font-bold tracking-widest text-slate-900 uppercase">
          Memuat Peta Nusantara
        </h2>
        <p className="text-xs text-slate-500">
          Sinkronisasi Google Maps Tile &amp; Telemetri ADS-B / AIS...
        </p>
      </div>
    </div>
  );
}
