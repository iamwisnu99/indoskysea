'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, Smartphone, Monitor, CheckCircle, X } from 'lucide-react';

export default function PwaInstallModal({ isOpen, onClose, deferredPrompt, onInstallSuccess }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(!!standalone);
    }
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted' && onInstallSuccess) {
        onInstallSuccess();
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <img
              src="/favicon-96x96.png"
              alt="IndoSkySea Logo"
              className="w-12 h-12 rounded-xl shadow-xs border border-slate-200/80 p-0.5 bg-white object-contain"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">IndoSkySea Radar</h3>
                <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">PWA</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Install aplikasi langsung ke perangkat Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs text-slate-600">
          {isStandalone ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Aplikasi Sudah Terpasang</span>
                <span>Anda sedang menjalankan IndoSkySea dalam mode aplikasi standalone.</span>
              </div>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center space-x-2 text-sky-900">
                <Smartphone className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-semibold text-xs">Petunjuk Install di Apple iOS (iPhone / iPad):</span>
              </div>
              <ol className="space-y-2.5 pl-1 text-slate-700">
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Ketuk tombol <strong>Bagikan (Share)</strong> <Share2 className="inline w-3.5 h-3.5 mx-0.5 text-sky-600" /> di bilah navigasi Safari.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Gulir ke bawah lalu pilih menu <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-slate-800" /> (Add to Home Screen).</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Ketuk <strong>&quot;Tambah&quot; (Add)</strong> di pojok kanan atas untuk menyelesaikan instalasi.</span>
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            /* Windows / Android 1-click Native Install */
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Nikmati akses cepat satu ketukan langsung dari desktop Windows atau menu aplikasi Android Anda tanpa bilah browser.
              </p>
              <ul className="space-y-1.5 text-slate-600 pl-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Membuka layar penuh layaknya aplikasi native</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Loading lebih cepat dengan penyimpanan offline cache</span>
                </li>
              </ul>
              <button
                onClick={handleNativeInstall}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 cursor-pointer mt-3"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Install IndoSkySea Sekarang</span>
              </button>
            </div>
          ) : (
            /* Browser without direct prompt support (e.g. Firefox/Desktop Safari) */
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Untuk memasang aplikasi ini di browser Anda:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-2 font-semibold text-slate-800">
                  <Monitor className="w-4 h-4 text-slate-600" />
                  <span>Melalui Menu Browser (Chrome / Edge):</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6">
                  Klik menu tiga titik (⋮) di pojok kanan atas browser Anda, lalu pilih <strong>&quot;Install IndoSkySea&quot;</strong> atau <strong>&quot;Simpan dan Bagikan &gt; Pasang Halaman Ini Sebagai Aplikasi&quot;</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
