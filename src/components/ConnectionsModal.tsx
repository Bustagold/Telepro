import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Check,
  UserX,
  MessageCircle,
  Briefcase,
  ExternalLink,
  Users
} from 'lucide-react';
import { Connection, UserProfile } from '../types';

interface ConnectionsModalProps {
  connections: Connection[];
  allProfiles: UserProfile[];
  currentUser: UserProfile;
  onClose: () => void;
  onAccept: (connectionId: string) => void;
  onDecline: (connectionId: string) => void;
  onOpenProfile: (userId: string) => void;
  onStartChat: (profile: UserProfile) => void;
}

export const ConnectionsModal: React.FC<ConnectionsModalProps> = ({
  connections,
  allProfiles,
  currentUser,
  onClose,
  onAccept,
  onDecline,
  onOpenProfile,
  onStartChat
}) => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'connected'>('received');

  const receivedRequests = connections.filter(
    c => c.toUserId === currentUser.userId && c.status === 'pending'
  );
  const sentRequests = connections.filter(
    c => c.fromUserId === currentUser.userId && c.status === 'pending'
  );
  const acceptedConnections = connections.filter(
    c => (c.toUserId === currentUser.userId || c.fromUserId === currentUser.userId) && c.status === 'accepted'
  );

  const getProfile = (userId: string): UserProfile | undefined => {
    return allProfiles.find(p => p.userId === userId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#242f3d] border border-[#17212b] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-white flex flex-col my-auto max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#17212b] flex items-center justify-between bg-[#17212b]/80">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Professional Connections</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#17212b] px-4 bg-[#17212b]/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('received')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'received'
                ? 'text-[#2481cc] border-[#2481cc]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <span>Received Requests</span>
            {receivedRequests.length > 0 && (
              <span className="bg-[#2481cc] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {receivedRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('connected')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'connected'
                ? 'text-[#2481cc] border-[#2481cc]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <span>My Network</span>
            <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.2 rounded-full">
              {acceptedConnections.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'sent'
                ? 'text-[#2481cc] border-[#2481cc]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <span>Sent ({sentRequests.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-800/60">
          {activeTab === 'received' && (
            <div>
              {receivedRequests.length > 0 ? (
                receivedRequests.map(conn => {
                  const profile = getProfile(conn.fromUserId);
                  return (
                    <div key={conn.connectionId} className="py-3 flex items-center justify-between gap-3">
                      <div
                        onClick={() => onOpenProfile(conn.fromUserId)}
                        className="flex items-center gap-3 cursor-pointer group min-w-0"
                      >
                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                          {conn.fromUserName?.charAt(0) || 'P'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-white group-hover:text-blue-300 transition truncate">
                            {conn.fromUserName || 'Professional'}
                          </p>
                          <p className="text-[11px] font-mono text-blue-400">@{conn.fromUserHandle}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                            {conn.fromUserHeadline || 'Looking to connect'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => onAccept(conn.connectionId)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => onDecline(conn.connectionId)}
                          className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
                          title="Ignore"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <UserCheck className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-300">No pending received requests</p>
                  <p className="text-xs text-gray-500 mt-1">When someone sends you a connect request, it will appear here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'connected' && (
            <div>
              {acceptedConnections.length > 0 ? (
                acceptedConnections.map(conn => {
                  const otherId = conn.fromUserId === currentUser.userId ? conn.toUserId : conn.fromUserId;
                  const profile = getProfile(otherId);
                  const name = profile?.displayName || conn.fromUserName || 'Connection';
                  const handle = profile?.handle || conn.fromUserHandle || 'user';

                  return (
                    <div key={conn.connectionId} className="py-3 flex items-center justify-between gap-3">
                      <div
                        onClick={() => onOpenProfile(otherId)}
                        className="flex items-center gap-3 cursor-pointer group min-w-0"
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white flex-shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-white group-hover:text-blue-300 transition truncate">
                            {name}
                          </p>
                          <p className="text-[11px] font-mono text-emerald-400">@{handle}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                            {profile?.headline || 'Connected 1st Degree'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {profile && (
                          <button
                            onClick={() => {
                              onStartChat(profile);
                              onClose();
                            }}
                            className="p-2 rounded-lg bg-[#2481cc] hover:bg-[#1f70b3] text-white transition"
                            title="Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onOpenProfile(otherId)}
                          className="p-2 rounded-lg bg-[#17212b] hover:bg-gray-700 text-gray-300 transition"
                          title="View Resume"
                        >
                          <Briefcase className="w-4 h-4 text-blue-400" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-300">Your network is empty</p>
                  <p className="text-xs text-gray-500 mt-1">Send connect requests to professionals or join industry organizations.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div>
              {sentRequests.length > 0 ? (
                sentRequests.map(conn => {
                  const profile = getProfile(conn.toUserId);
                  const name = profile?.displayName || 'Colleague';
                  const handle = profile?.handle || 'user';

                  return (
                    <div key={conn.connectionId} className="py-3 flex items-center justify-between gap-3">
                      <div
                        onClick={() => onOpenProfile(conn.toUserId)}
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-white truncate">{name}</p>
                          <p className="text-[11px] font-mono text-gray-400">@{handle}</p>
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-xs text-gray-500">No sent requests pending.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
