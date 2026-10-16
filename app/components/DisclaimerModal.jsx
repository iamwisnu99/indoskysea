'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function DisclaimerModal({ isOpen, onClose, onAccept }) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onAccept) onAccept();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div 
        className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-300 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150 font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        {/* Document Header (Clean Legal Paper Style) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h1 id="disclaimer-title" className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Ketentuan Layanan &amp; Pernyataan Sanggahan (Disclaimer)
            </h1>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Dokumen Ketentuan Penggunaan • IndoSkySea
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-md hover:bg-slate-100"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Document Body (Clean Markdown Paper Format) */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
          
          {/* Markdown Blockquote */}
          <blockquote className="border-l-4 border-slate-400 pl-3.5 py-1.5 text-slate-600 bg-slate-50 italic rounded-r">
            Situs web ini menyajikan visualisasi data telemetri penerbangan (ADS-B) dan maritim (AIS) secara real-time untuk keperluan monitoring publik, riset, dan pemantauan pribadi yang bertanggung jawab.
          </blockquote>

          {/* Section 1 */}
          <section className="space-y-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              1. Prinsip Layanan (&quot;As Is&quot;)
            </h2>
            <p className="text-slate-600 leading-normal pl-3">
              Seluruh data pergerakan armada disajikan <strong>sebagaimana adanya (&quot;as is&quot;)</strong> tanpa jaminan kelengkapan atau akurasi mutlak. Informasi bergantung pada ketersediaan sinyal transponder publik dan jaringan stasiun penerima pihak ketiga.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              2. Batasan &amp; Larangan Penggunaan
            </h2>
            <p className="text-slate-600 leading-normal pl-3">
              Dilarang keras menyalahgunakan informasi dalam situs ini untuk perbuatan melanggar hukum, ancaman terhadap keselamatan transportasi publik, komersialisasi tidak berizin, maupun kepentingan yang tidak bertanggung jawab.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              3. Pemantauan &amp; Situasi Darurat (Loss Contact)
            </h2>
            <p className="text-slate-600 leading-normal pl-3">
              Layanan ini dapat dimanfaatkan sebagai referensi pemantauan mandiri dan sarana bantu darurat saat terjadi kendala komunikasi atau kondisi <em>loss contact</em> dengan pesawat atau kapal tujuan yang terdata, guna memverifikasi rekaman koordinat dan jejak posisi terakhir yang berhasil ditangkap oleh stasiun radar.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              4. Peringatan Navigasi Resmi
            </h2>
            <p className="text-slate-600 leading-normal pl-3">
              Situs ini <strong>bukan merupakan pengganti sistem kendali resmi</strong> <em>Air Traffic Control (ATC)</em> ataupun <em>Vessel Traffic Service (VTS)</em>, dan tidak boleh dijadikan acuan tunggal operasional yang berkaitan langsung dengan keselamatan jiwa.
            </p>
          </section>

          <hr className="border-slate-200 my-2" />

          {/* Acknowledgement Checkbox */}
          <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-800 leading-normal select-none">
              Saya telah membaca, memahami, dan menyetujui seluruh ketentuan layanan serta batasan penggunaan di atas.
            </span>
          </label>

        </div>

        {/* Document Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            {agreed ? '✓ Ketentuan telah disetujui' : 'Menunggu persetujuan pengguna'}
          </span>
          <button
            onClick={handleConfirm}
            disabled={!agreed}
            className={`px-5 h-9 rounded-lg font-semibold text-xs transition-all ${
              agreed
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Setuju &amp; Lanjutkan
          </button>
        </div>

      </div>
    </div>
  );
}
