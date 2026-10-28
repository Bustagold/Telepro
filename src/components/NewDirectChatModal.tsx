import React, { useState } from 'react';
import {
  X,
  Search,
  AtSign,
  MessageCircle,
  Briefcase,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types';

interface NewDirectChatModalProps {
  currentUser: UserProfile;
  availableProfiles: UserProfile[];
  onClose: () => void;
  onStartChat: (profile: UserProfile) => void;
  onViewResume: (profile: UserProfile) => void;
  onSendConnect: (targetUserId: string) => void;
  connectedUserIds?: string[];
}

export const NewDirectChatModal: React.FC<NewDirectChatModalProps> = ({
  currentUser,
  availableProfiles,
  onClose,
  onStartChat,
  onViewResume,
  onSendConnect,
  connectedUserIds = []
}) => {
  const [handleInput, setHandleInput] = useState('');

  const otherProfiles = availableProfiles.filter(p => p.userId !== currentUser.userId);

  const filtered = otherProfiles.filter(p => {
    const q = handleInput.toLowerCase().replace('@', '').trim();
    if (!q) return true;
    return (
      p.handle.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      (p.headline && p.headline.toLowerCase().includes(q)) ||
      (p.skills && p.skills.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#242f3d] border border-[#17212b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#17212b] flex items-center justify-between bg-[#17212b]/80">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AtSign className="w-4 h-4 text-[#2481cc]" /> Find Real Members (@Handle)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Discover verified TelePro users across 1,000+ members to chat or connect.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition cursor-pointer"
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
              placeholder="Search by handle, name, or skill (e.g. react, python, founder)..."
              className="w-full bg-[#17212b] text-xs sm:text-sm text-white rounded-xl pl-8 pr-4 py-2.5 border border-gray-700 focus:outline-none focus:border-[#2481cc] placeholder:text-gray-500 font-mono"
            />
          </div>
        </div>

        {/* Profiles List */}
        <div className="max-h-80 overflow-y-auto p-4 divide-y divide-gray-800/60 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map(profile => {
              const isConnected = connectedUserIds.includes(profile.userId);

              return (
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
                          {profile.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-xs sm:text-sm text-white group-hover:text-blue-300 transition truncate">
                          {profile.displayName}
                        </p>
                        <span className="text-[10px] font-mono text-blue-400 truncate">@{profile.handle}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                        {profile.headline || 'Professional Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        onStartChat(profile);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#2481cc] hover:bg-[#1f70b3] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow"
                      title="Direct Message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => onViewResume(profile)}
                      className="p-1.5 rounded-lg bg-[#17212b] hover:bg-gray-700 text-gray-300 transition cursor-pointer"
                      title="View LinkedIn Resume"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                    </button>

                    <button
                      disabled={isConnected}
                      onClick={() => onSendConnect(profile.userId)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isConnected
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-[#17212b] hover:bg-gray-700 text-blue-400 hover:text-white'
                      }`}
                      title={isConnected ? 'Connected' : 'Send Connect Request'}
                    >
                      {isConnected ? (
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-xs font-semibold text-white">No members found</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {handleInput.trim()
                  ? `No registered user matches "@${handleInput}".`
                  : 'As more users sign up on TelePro, they will appear here automatically.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
