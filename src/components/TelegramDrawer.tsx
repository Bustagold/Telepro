import React from 'react';
import {
  X,
  Briefcase,
  Users,
  Building,
  LogOut,
  UserCheck,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { UserProfile } from '../types';

interface TelegramDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onOpenMyProfile: () => void;
  onOpenConnections: () => void;
  onOpenOrgDirectory: () => void;
  onOpenNewDirectChat: () => void;
  onSignOut: () => void;
  pendingRequestsCount: number;
}

export const TelegramDrawer: React.FC<TelegramDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenMyProfile,
  onOpenConnections,
  onOpenOrgDirectory,
  onOpenNewDirectChat,
  onSignOut,
  pendingRequestsCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-72 sm:w-80 max-w-[85%] h-full bg-[#17212b] border-r border-[#0e1621] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header (Telegram Profile Card) */}
        <div className="p-5 bg-gradient-to-b from-[#202b36] to-[#17212b] border-b border-[#0e1621]">
          <div className="flex items-start justify-between mb-3">
            <div
              onClick={() => {
                onOpenMyProfile();
                onClose();
              }}
              className="w-14 h-14 rounded-full overflow-hidden bg-[#2481cc] ring-2 ring-[#2481cc]/40 flex items-center justify-center text-white font-bold text-xl cursor-pointer shadow-lg hover:scale-105 transition"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#242f3d] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={() => {
              onOpenMyProfile();
              onClose();
            }}
            className="cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition truncate">
                {currentUser.displayName}
              </h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            </div>
            <p className="text-xs font-mono text-[#2481cc] mt-0.5">@{currentUser.handle}</p>
            <p className="text-[11px] text-gray-400 truncate mt-1">
              {currentUser.headline || 'TelePro Network Member'}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-gray-800/40 text-xs sm:text-sm custom-scrollbar">
          <div className="py-1">
            <button
              onClick={() => {
                onOpenMyProfile();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-[#2481cc]" />
              <span className="font-medium">My Professional Resume</span>
            </button>

            <button
              onClick={() => {
                onOpenNewDirectChat();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left cursor-pointer"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Find Real Users (@handle)</span>
            </button>

            <button
              onClick={() => {
                onOpenConnections();
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left cursor-pointer"
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
              className="w-full flex items-center gap-3.5 px-5 py-3 text-gray-200 hover:bg-[#242f3d] hover:text-white transition text-left cursor-pointer"
            >
              <Building className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Organizations Directory</span>
            </button>

            {/* In-app Download / Install PWA */}
            <PWAInstallButton variant="menu-item" />
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-rose-400 hover:bg-[#242f3d] hover:text-rose-300 transition text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#121922] border-t border-[#0e1621] text-[11px] text-gray-400 flex items-center justify-between">
          <span>TelePro Production</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Firebase Firestore
          </span>
        </div>
      </div>
    </div>
  );
};
