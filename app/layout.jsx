import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export const metadata = {
  metadataBase: new URL('https://indoskysea.vercel.app'),
  title: {
    default: 'IndoSkySea: Radar Pesawat & Kapal Real-Time',
    template: '%s | IndoSkySea',
  },
  description: 'Aplikasi pelacakan penerbangan (ADS-B) dan armada maritim (AIS) real-time global dan Indonesia. Pantau pesawat komersial, kapal pesiar samudra, armada PELNI, dan kapal pertahanan di Google Maps.',
  keywords: [
    'IndoSkySea',
    'Flight Radar Indonesia',
    'Ship Tracker Real-Time',
    'Pelacakan Pesawat Real-Time',
    'Radar Kapal Laut AIS',
    'ADS-B Tracker',
    'Kapal Pesiar Cruise Tracker',
    'PELNI Tracker',
    'Google Maps Flight Radar',
    'Live Maritime Tracker',
    'OpenSky ADS-B',
    'AIS Maritime',
    'PWA Radar',
  ],
  authors: [{ name: 'IndoSkySea Team', url: 'https://github.com/iamwisnu99/indoskysea' }],
  creator: 'IndoSkySea',
  publisher: 'IndoSkySea',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://indoskysea.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://indoskysea.vercel.app',
    siteName: 'IndoSkySea',
    title: 'IndoSkySea: Radar Pesawat & Kapal Real-Time',
    description: 'Aplikasi pelacakan penerbangan (ADS-B) dan armada maritim (AIS) real-time global dan Indonesia. Pantau pesawat komersial, kapal pesiar samudra, armada PELNI, dan kapal pertahanan di Google Maps.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IndoSkySea: Radar Pesawat & Kapal Real-Time',
        type: 'image/png',
      },
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'IndoSkySea Favicon Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IndoSkySea: Radar Pesawat & Kapal Real-Time',
    description: 'Aplikasi pelacakan penerbangan (ADS-B) dan armada maritim (AIS) real-time global dan Indonesia dengan peta interaktif Google Maps.',
    images: ['/og-image.png'],
    creator: '@indoskysea',
    site: '@indoskysea',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IndoSkySea',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="light">
      <head>
        {/* Open Graph & Social Media Preview Meta (WhatsApp, Telegram, Facebook, LinkedIn, Twitter/X, Instagram) */}
        <meta property="og:site_name" content="IndoSkySea" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://indoskysea.vercel.app" />
        <meta property="og:title" content="IndoSkySea: Radar Pesawat &amp; Kapal Real-Time" />
        <meta property="og:description" content="Aplikasi pelacakan penerbangan (ADS-B) dan armada maritim (AIS) real-time global dan Indonesia. Pantau pesawat komersial, kapal pesiar samudra, armada PELNI, dan kapal pertahanan di Google Maps." />
        <meta property="og:image" content="https://indoskysea.vercel.app/og-image.png" />
        <meta property="og:image:secure_url" content="https://indoskysea.vercel.app/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="IndoSkySea: Radar Pesawat &amp; Kapal Real-Time" />
        <meta property="og:locale" content="id_ID" />

        {/* Twitter / X Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@indoskysea" />
        <meta name="twitter:creator" content="@indoskysea" />
        <meta name="twitter:title" content="IndoSkySea: Radar Pesawat &amp; Kapal Real-Time" />
        <meta name="twitter:description" content="Aplikasi pelacakan penerbangan (ADS-B) dan armada maritim (AIS) real-time global dan Indonesia dengan peta interaktif Google Maps." />
        <meta name="twitter:image" content="https://indoskysea.vercel.app/og-image.png" />
        <meta name="twitter:image:alt" content="IndoSkySea: Radar Pesawat &amp; Kapal Real-Time" />

        {/* Canonical URL Link */}
        <link rel="canonical" href="https://indoskysea.vercel.app" />

        {/* Favicon & Icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* PWA Manifest & Mobile Web App Meta */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IndoSkySea" />
        <meta name="application-name" content="IndoSkySea" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />

        {/* Styles & External Fonts */}
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

        {/* Register Service Worker for PWA Offline & Installability */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('PWA ServiceWorker registered with scope:', registration.scope);
                    },
                    function(err) {
                      console.log('PWA ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen overflow-hidden select-none font-sans">
        {children}
      </body>
    </html>
  );
}
