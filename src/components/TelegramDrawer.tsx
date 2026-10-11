import React from 'react';
import {
  X,
  User,
  Building,
  Video,
  Bookmark,
  LogOut,
  Users,
  Settings,
  Briefcase,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface TelegramDrawerProps {
  isOpen: boolean;
  currentUser: UserProfile;
  pendingRequestsCount?: number;
  onClose: () => void;
  onOpenMyProfile: () => void;
  onOpenOrgDirectory: () => void;
  onOpenConnections: () => void;
  onStartMeet: () => void;
  onSwitchUser: () => void;
  onSignOut: () => void;
}

export const TelegramDrawer: React.FC<TelegramDrawerProps> = ({
  isOpen,
  currentUser,
  pendingRequestsCount = 0,
  onClose,
  onOpenMyProfile,
  onOpenOrgDirectory,
  onOpenConnections,
  onStartMeet,
  onSwitchUser,
  onSignOut
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content (Telegram left slide-out) */}
      <div className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-[#17212b] border-r border-[#0e1621] text-white flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* User Card Header */}
        <div className="p-5 bg-[#242f3d] border-b border-[#0e1621] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            onClick={() => {
              onOpenMyProfile();
              onClose();
            }}
            className="cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-600 mb-3 border-2 border-white/20 shadow-md group-hover:scale-105 transition">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl">
                  {currentUser.displayName.charAt(0)}
                </div>
              )}
            </div>

            <h3 className="font-bold text-base text-white group-hover:text-blue-300 transition truncate">
              {currentUser.displayName}
            </h3>
            <p className="text-xs font-mono text-[#64b5f6]">@{currentUser.handle}</p>
            <p className="text-[11px] text-gray-300 line-clamp-1 mt-1 font-medium">{currentUser.headline}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-gray-800/40 text-xs sm:text-sm">
          <div className="py-1">
            <button
              onClick={() => {
                onOpenMyProfile();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left"
            >
              <Briefcase className="w-4 h-4 text-[#2481cc]" />
              <span className="font-medium">My Professional Resume</span>
            </button>

            <button
              onClick={() => {
                onOpenConnections();
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left"
            >
              <div className="flex items-center gap-3.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Connect Requests</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="bg-[#2481cc] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenOrgDirectory();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left"
            >
              <Building className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Organizations Directory</span>
            </button>

            <button
              onClick={() => {
                onStartMeet();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left"
            >
              <Video className="w-4 h-4 text-[#ea4335]" />
              <span className="font-medium">Instant Google Meet</span>
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                onSwitchUser();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span className="font-medium">Switch / Test Profile</span>
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-rose-400 hover:bg-[#242f3d] hover:text-rose-300 transition text-left"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#121922] border-t border-[#0e1621] text-[11px] text-gray-400 flex items-center justify-between">
          <span>TelePro Web v1.2</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Firebase Live
          </span>
        </div>
      </div>
    </div>
  );
};
