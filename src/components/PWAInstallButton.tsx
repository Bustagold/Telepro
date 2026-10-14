import React, { useState } from 'react';
import { Download, Smartphone, Apple, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'button' | 'menu-item' | 'banner' }> = ({
  variant = 'button'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running standalone, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 3000);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'menu-item' ? (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-5 py-3 text-emerald-400 hover:bg-[#242f3d] hover:text-emerald-300 transition text-left"
        >
          <div className="flex items-center gap-3.5">
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Download / Install App</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
            PWA
          </span>
        </button>
      ) : variant === 'banner' ? (
        <div className="bg-gradient-to-r from-[#2481cc]/20 via-[#1a73e8]/30 to-[#2481cc]/20 border border-[#2481cc]/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2481cc] flex items-center justify-center flex-shrink-0 shadow">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs text-white">Download TelePro to Your Phone</h4>
              <p className="text-[11px] text-gray-300 truncate">Install directly on Android & iOS home screen.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow transition"
          title="Download & Install TelePro"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* Install Guidance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#17212b] border border-gray-700 rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#2481cc] mx-auto flex items-center justify-center mb-3 shadow-lg">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white">Download & Install TelePro</h3>
              <p className="text-xs text-gray-300 mt-1">
                Install as a standalone native-speed app on your mobile device or computer.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Android & Chrome */}
              <div className="bg-[#242f3d] p-3 rounded-xl border border-gray-700/60 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Android / Chrome / Edge</h4>
                  <p className="text-gray-300 text-[11px] mt-0.5">
                    Tap the <strong>three dots (⋮)</strong> in your browser menu and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
                  </p>
                </div>
              </div>

              {/* iPhone / iPad */}
              <div className="bg-[#242f3d] p-3 rounded-xl border border-gray-700/60 flex items-start gap-3">
                <Apple className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">iPhone / iPad (iOS Safari)</h4>
                  <p className="text-gray-300 text-[11px] mt-0.5">
                    Tap the <strong>Share button (📤)</strong> at the bottom of Safari, then scroll down and tap <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-5 py-2.5 bg-[#2481cc] hover:bg-[#1f70b3] rounded-xl text-xs font-bold text-white transition shadow"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
