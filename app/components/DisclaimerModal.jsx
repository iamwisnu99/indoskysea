'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Radio, ExternalLink, X } from 'lucide-react';

export default function DisclaimerModal({ isOpen, onClose, onAccept }) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onAccept) onAccept();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div 
        className="relative w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 id="disclaimer-title" className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center space-x-1.5">
                <span>Ketentuan Penggunaan & Disclaimer</span>
              </h2>
              <p className="text-[11px] text-sky-200/80 font-medium">
                IndoSkySea • Pemantauan Radar Non-Komersial
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
          
          {/* Highlight Notice Box */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 flex items-start space-x-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-amber-900 block">Pemberitahuan Penting untuk Pengunjung</span>
              <p className="text-amber-800 leading-normal">
                Layanan situs web ini disediakan <strong>sebagaimana adanya (&quot;as is&quot;)</strong> tanpa jaminan komersial. Harap membaca dan memahami ketentuan penggunaan di bawah ini sebelum melanjutkan.
              </p>
            </div>
          </div>

          {/* Key Points */}
          <div className="space-y-3 divide-y divide-slate-100">
            
            {/* Point 1: As-Is & Non-Commercial */}
            <div className="pt-2 first:pt-0">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tujuan Monitoring & Non-Komersial</span>
              </h3>
              <p className="text-slate-600 text-xs pl-7 leading-normal">
                Situs ini dibuat semata-mata untuk keperluan <strong>edukasi, riset, pemantauan pribadi</strong>, dan transparansi lalu lintas publik. Tidak ditujukan untuk keuntungan komersial, penjualan data, maupun kepentingan bisnis yang tidak berizin.
              </p>
            </div>

            {/* Point 2: Negative/Irresponsible Use Prohibited */}
            <div className="pt-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">2</span>
                <span className="text-rose-950">Larangan Penggunaan Negatif</span>
              </h3>
              <p className="text-slate-600 text-xs pl-7 leading-normal">
                Dilarang keras menyalahgunakan informasi pelacakan ini untuk perbuatan melanggar hukum, ancaman keselamatan penerbangan/pelayaran, tindakan kriminal, atau kepentingan yang tidak bertanggung jawab.
              </p>
            </div>

            {/* Point 3: Emergency & Loss Contact Reference */}
            <div className="pt-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">3</span>
                <span>Referensi Darurat & Situasi Loss Contact</span>
              </h3>
              <p className="text-slate-600 text-xs pl-7 leading-normal">
                Data transponder (ADS-B &amp; AIS) dapat dijadikan rujukan pemantauan posisi darurat apabila terjadi kendala komunikasi atau kondisi <em>loss contact</em> dengan pesawat/kapal tujuan yang terdata di sistem, guna membantu verifikasi jejak terakhir yang terpantau jaringan stasiun penerima.
              </p>
            </div>

            {/* Point 4: Not Official ATC / VTS */}
            <div className="pt-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">4</span>
                <span>Bukan Pengganti Sistem Navigasi Resmi</span>
              </h3>
              <p className="text-slate-600 text-xs pl-7 leading-normal">
                Informasi ini <strong>bukan merupakan sistem resmi</strong> <em>Air Traffic Control (ATC)</em> atau <em>Vessel Traffic Service (VTS)</em> otoritas berwenang dan tidak boleh dijadikan acuan tunggal dalam navigasi operasional keselamatan jiwa.
              </p>
            </div>

          </div>

          {/* Acknowledgement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start space-x-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer shrink-0"
              />
              <span className="text-xs font-semibold text-slate-800 leading-normal select-none">
                Saya telah membaca, memahami, dan menyetujui seluruh ketentuan di atas serta bertanggung jawab penuh atas penggunaan situs ini.
              </span>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 self-start sm:self-center">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>IndoSkySea Global & Nusantara Tracker</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!agreed}
            className={`w-full sm:w-auto h-11 px-5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md ${
              agreed
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Saya Mengerti & Lanjutkan</span>
          </button>
        </div>

      </div>
    </div>
  );
}
