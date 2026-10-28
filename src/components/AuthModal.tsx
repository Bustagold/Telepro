import React, { useState } from 'react';
import {
  LogIn,
  AtSign,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    registerProfile,
    isHandleSetupNeeded,
    userProfile,
    authError,
    clearAuthError
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle setup state
  const [handleInput, setHandleInput] = useState(userProfile?.handle || '');
  const [nameInput, setNameInput] = useState(userProfile?.displayName || '');
  const [headlineInput, setHeadlineInput] = useState(userProfile?.headline || '');

  if (!isOpen && !isHandleSetupNeeded) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const success = await signInWithGoogle();
    setIsSubmitting(false);
    if (success && onClose && !isHandleSetupNeeded) {
      onClose();
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsSubmitting(true);

    let success = false;
    if (mode === 'signup') {
      success = await signUpWithEmail(email, password, fullName);
    } else {
      success = await signInWithEmail(email, password);
    }
    setIsSubmitting(false);

    if (success && onClose && !isHandleSetupNeeded) {
      onClose();
    }
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim() || !nameInput.trim()) return;
    registerProfile(handleInput.trim(), nameInput.trim(), headlineInput.trim());
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white p-6 sm:p-8 relative">
        {onClose && !isHandleSetupNeeded && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#242f3d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2481cc] to-[#1a73e8] mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-3 border border-white/20">
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">TelePro Network</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Real-time professional messaging, discoverable @handles, and LinkedIn-grade networking.
          </p>
        </div>

        {/* Error notification banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{authError}</span>
            </div>
            <button onClick={clearAuthError} className="text-red-400 hover:text-red-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isHandleSetupNeeded ? (
          /* Profile & Unique Handle Onboarding */
          <form onSubmit={handleCompleteSetup} className="space-y-4">
            <div className="bg-[#242f3d] p-3.5 rounded-xl border border-blue-500/30 text-xs text-blue-200">
              <span className="font-semibold block text-white mb-0.5">Welcome! Choose your unique TelePro @handle:</span>
              Your @handle allows other real users to discover and message you directly.
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-medium">Telegram ID / @Handle</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2481cc] font-mono text-sm font-bold">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={handleInput}
                  onChange={e => setHandleInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. sarah_dev"
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
              <label className="text-xs text-gray-300 block mb-1 font-medium">Professional Headline</label>
              <input
                type="text"
                value={headlineInput}
                onChange={e => setHeadlineInput(e.target.value)}
                placeholder="e.g. Senior Software Architect | Ex-Meta"
                className="w-full bg-[#242f3d] rounded-xl px-4 py-2.5 text-white text-sm border border-gray-700 focus:outline-none focus:border-[#2481cc]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2481cc] hover:bg-[#1f70b3] rounded-xl text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              <span>Enter TelePro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Sign In & Sign Up Views */
          <div className="space-y-4">
            {/* Real Google One-Tap Sign In */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Or with Email
              </span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            {/* Mode Switch (Sign In / Sign Up) */}
            <div className="flex bg-[#242f3d] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  clearAuthError();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  mode === 'signin' ? 'bg-[#2481cc] text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  clearAuthError();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  mode === 'signup' ? 'bg-[#2481cc] text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#242f3d] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs sm:text-sm border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-300 block mb-1">Email Address (Gmail, Work, or Personal)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-[#242f3d] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs sm:text-sm border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#242f3d] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs sm:text-sm border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#2481cc] hover:bg-[#1f70b3] disabled:opacity-50 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : mode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-3 border-t border-gray-800 text-center">
              <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Firebase Real-Time Auth & Cloud Firestore
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
