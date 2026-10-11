import React, { useState } from 'react';
import {
  X,
  Search,
  AtSign,
  UserPlus,
  MessageCircle,
  Video,
  Briefcase,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface NewDirectChatModalProps {
  currentUser: UserProfile;
  availableProfiles: UserProfile[];
  onClose: () => void;
  onStartChat: (profile: UserProfile) => void;
  onViewResume: (profile: UserProfile) => void;
  onSendConnect: (targetUserId: string) => void;
}

export const NewDirectChatModal: React.FC<NewDirectChatModalProps> = ({
  currentUser,
  availableProfiles,
  onClose,
  onStartChat,
  onViewResume,
  onSendConnect
}) => {
  const [handleInput, setHandleInput] = useState('');

  const otherProfiles = availableProfiles.filter(p => p.userId !== currentUser.userId);

  const filtered = otherProfiles.filter(p => {
    const q = handleInput.toLowerCase().replace('@', '').trim();
    if (!q) return true;
    return (
      p.handle.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      (p.headline && p.headline.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#242f3d] border border-[#17212b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#17212b] flex items-center justify-between bg-[#17212b]/80">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AtSign className="w-4 h-4 text-[#2481cc]" /> Start Chat or Connect by Telegram ID
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Type a user's @handle to message or send a professional connect request.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-b border-[#17212b]">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 font-mono text-sm font-bold">
              @
            </span>
            <input
              type="text"
              value={handleInput}
              onChange={e => setHandleInput(e.target.value)}
              placeholder="e.g. alex_cto, elena_ai, sarah_lead..."
              className="w-full bg-[#17212b] text-sm text-white rounded-xl pl-8 pr-4 py-2.5 border border-gray-700 focus:outline-none focus:border-[#2481cc] placeholder:text-gray-500 font-mono"
            />
          </div>
        </div>

        {/* Profiles List */}
        <div className="max-h-80 overflow-y-auto p-4 divide-y divide-gray-800/60">
          {filtered.length > 0 ? (
            filtered.map(profile => (
              <div
                key={profile.userId}
                className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div
                  onClick={() => onViewResume(profile)}
                  className="flex items-center gap-3 cursor-pointer group min-w-0"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-600">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white bg-blue-600">
                        {profile.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-white group-hover:text-blue-300 transition truncate">
                      {profile.displayName}
                    </p>
                    <p className="text-[11px] font-mono text-blue-400">@{profile.handle}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                      {profile.headline || 'Professional'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      onStartChat(profile);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-[#2481cc] hover:bg-[#1f70b3] text-white transition"
                    title="Direct Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onViewResume(profile)}
                    className="p-2 rounded-lg bg-[#17212b] hover:bg-gray-700 text-gray-300 transition"
                    title="View LinkedIn Resume"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-xs">No user found matching "@{handleInput}"</p>
              {handleInput.trim() && (
                <button
                  onClick={() => {
                    // Create chat for custom handle
                    const customProfile: UserProfile = {
                      userId: 'user_' + handleInput.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                      handle: handleInput.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                      displayName: `@${handleInput}`,
                      email: `${handleInput}@telepro.network`,
                      headline: 'Professional on TelePro Network',
                      bio: 'Discovered via Telegram ID handle.',
                      skills: 'Tech, Product, Innovation',
                      experience: 'Experienced Leader',
                      education: 'Higher Education'
                    };
                    onStartChat(customProfile);
                    onClose();
                  }}
                  className="mt-3 px-4 py-1.5 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-lg text-xs font-semibold"
                >
                  Message @{handleInput} directly
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
