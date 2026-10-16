import React from 'react';

// Crisp, high-definition SVG flag icons with clean borders and authentic color palettes

export function FlagIndonesia({ className = "w-4.5 h-3" }) {
  return (
    <svg viewBox="0 0 640 480" className={`${className} rounded-xs border border-slate-200/90 shadow-xs shrink-0 overflow-hidden`}>
      <rect width="640" height="240" fill="#e11d48" />
      <rect y="240" width="640" height="240" fill="#ffffff" />
    </svg>
  );
}

export function FlagWorld({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} text-sky-600 shrink-0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function FlagAsiaPacific({ className = "w-4.5 h-3" }) {
  return (
    <svg viewBox="0 0 640 480" className={`${className} rounded-xs border border-slate-200/90 shadow-xs shrink-0 overflow-hidden`}>
      <rect width="640" height="480" fill="#002b7f" />
      <circle cx="320" cy="240" r="140" fill="#ce1126" />
      <circle cx="320" cy="240" r="110" fill="#ffffff" />
      <circle cx="320" cy="240" r="75" fill="#fcd116" />
    </svg>
  );
}

export function FlagEurope({ className = "w-4.5 h-3" }) {
  return (
    <svg viewBox="0 0 640 480" className={`${className} rounded-xs border border-slate-200/90 shadow-xs shrink-0 overflow-hidden`}>
      <rect width="640" height="480" fill="#003399" />
      <g fill="#ffcc00">
        <circle cx="320" cy="100" r="14" />
        <circle cx="390" cy="118" r="14" />
        <circle cx="442" cy="170" r="14" />
        <circle cx="460" cy="240" r="14" />
        <circle cx="442" cy="310" r="14" />
        <circle cx="390" cy="362" r="14" />
        <circle cx="320" cy="380" r="14" />
        <circle cx="250" cy="362" r="14" />
        <circle cx="198" cy="310" r="14" />
        <circle cx="180" cy="240" r="14" />
        <circle cx="198" cy="170" r="14" />
        <circle cx="250" cy="118" r="14" />
      </g>
    </svg>
  );
}

export function FlagUSA({ className = "w-4.5 h-3" }) {
  return (
    <svg viewBox="0 0 640 480" className={`${className} rounded-xs border border-slate-200/90 shadow-xs shrink-0 overflow-hidden`}>
      <rect width="640" height="480" fill="#b22234" />
      <rect y="37" width="640" height="37" fill="#ffffff" />
      <rect y="111" width="640" height="37" fill="#ffffff" />
      <rect y="185" width="640" height="37" fill="#ffffff" />
      <rect y="259" width="640" height="37" fill="#ffffff" />
      <rect y="333" width="640" height="37" fill="#ffffff" />
      <rect y="407" width="640" height="37" fill="#ffffff" />
      <rect width="260" height="259" fill="#3c3b6e" />
      <g fill="#ffffff">
        <circle cx="45" cy="45" r="9" />
        <circle cx="105" cy="45" r="9" />
        <circle cx="165" cy="45" r="9" />
        <circle cx="225" cy="45" r="9" />
        <circle cx="75" cy="85" r="9" />
        <circle cx="135" cy="85" r="9" />
        <circle cx="195" cy="85" r="9" />
        <circle cx="45" cy="125" r="9" />
        <circle cx="105" cy="125" r="9" />
        <circle cx="165" cy="125" r="9" />
        <circle cx="225" cy="125" r="9" />
        <circle cx="75" cy="165" r="9" />
        <circle cx="135" cy="165" r="9" />
        <circle cx="195" cy="165" r="9" />
        <circle cx="45" cy="205" r="9" />
        <circle cx="105" cy="205" r="9" />
        <circle cx="165" cy="205" r="9" />
        <circle cx="225" cy="205" r="9" />
      </g>
    </svg>
  );
}
