import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'Nusantara Radar: ADS-B & AIS Real-Time Tracker',
  description: 'Pelacakan real-time penerbangan (ADS-B OpenSky) dan lalu lintas maritim kapal (AIS AISStream) di Indonesia dan Asia Tenggara dengan peta interaktif.',
  keywords: ['ADS-B', 'AIS', 'Flight Radar Indonesia', 'Ship Tracker', 'OpenSky', 'Aisstream', 'Next.js Leaflet'],
  authors: [{ name: 'Nusantara Radar Team' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-radar-bg text-slate-100 min-h-screen overflow-hidden select-none font-sans">
        {children}
      </body>
    </html>
  );
}
