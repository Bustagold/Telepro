import React, { useState } from 'react';
import {
  LogIn,
  AtSign,
  Briefcase,
  Users,
  Sparkles,
  ShieldCheck,
  Video,
  Building,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_SEED_PROFILES } from '../data/seedData';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInAsDemo, registerProfile, isHandleSetupNeeded, userProfile } = useAuth();

  const [handleInput, setHandleInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [headlineInput, setHeadlineInput] = useState('');

  if (!isOpen && !isHandleSetupNeeded) return null;

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim() || !nameInput.trim()) return;
    registerProfile(handleInput.trim(), nameInput.trim(), headlineInput.trim());
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white p-6 sm:p-8 relative">
        {/* Top Branding (Telegram + Professional) */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2481cc] to-[#1a73e8] mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-3 border border-white/20">
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">TelePro Network</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Telegram instant messaging, LinkedIn professional resumes, and Google Meet video rooms in one unified platform.
          </p>
        </div>

        {isHandleSetupNeeded ? (
          /* Profile & Telegram ID Setup Step */
          <form onSubmit={handleCompleteSetup} className="space-y-4">
            <div className="bg-[#242f3d] p-3.5 rounded-xl border border-blue-500/30 text-xs text-blue-200">
              <span className="font-semibold block text-white mb-0.5">Welcome! Complete your Telegram ID:</span>
              Choose your unique handle and professional headline to start messaging.
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-medium">Unique Telegram ID</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2481cc] font-mono text-sm font-bold">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={handleInput}
                  onChange={e => setHandleInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="your_handle (e.g. busta_dev)"
                  className="w-full bg-[#242f3d] rounded-xl pl-8 pr-4 py-2.5 text-white text-sm font-mono border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-[#242f3d] rounded-xl px-4 py-2.5 text-white text-sm border border-gray-700 focus:outline-none focus:border-[#2481cc]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-medium">Professional Headline (LinkedIn style)</label>
              <input
                type="text"
                value={headlineInput}
                onChange={e => setHeadlineInput(e.target.value)}
                placeholder="e.g. Senior Full-Stack Architect | Distributed Systems"
                className="w-full bg-[#242f3d] rounded-xl px-4 py-2.5 text-white text-sm border border-gray-700 focus:outline-none focus:border-[#2481cc]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2481cc] hover:bg-[#1f70b3] rounded-xl text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              <span>Launch TelePro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Sign In Options */
          <div className="space-y-4">
            {/* Real Firebase Google Sign-In */}
            <button
              onClick={signInWithGoogle}
              className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Or Try Demo Persona
              </span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            {/* Demo Personas for multi-user preview testing */}
            <div className="space-y-2">
              {INITIAL_SEED_PROFILES.map(demo => (
                <button
                  key={demo.userId}
                  onClick={() => {
                    signInAsDemo(demo.handle, demo.displayName, demo.headline || 'Leader');
                    if (onClose) onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#242f3d] hover:bg-[#2b5278] border border-gray-700/60 transition text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={demo.photoURL}
                      alt={demo.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-blue-300 truncate">
                        {demo.displayName}
                      </p>
                      <p className="text-[10px] font-mono text-blue-400">@{demo.handle}</p>
                      <p className="text-[10px] text-gray-400 truncate">{demo.company}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-400 font-medium group-hover:translate-x-1 transition flex items-center">
                    Select →
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800/80 text-center">
              <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Firebase Real-Time Auth & Firestore Sync Active
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
