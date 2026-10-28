import React, { useState } from 'react';
import {
  Menu,
  Search,
  Users,
  Building,
  Plus,
  CheckCheck,
  Hash,
  AtSign,
  Globe,
  Sparkles
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { Conversation, Organization, UserProfile } from '../types';

interface TelegramSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUser: UserProfile;
  organizations: Organization[];
  onSelectConversation: (conversationId: string) => void;
  onOpenDrawer: () => void;
  onOpenOrgDirectory: () => void;
  onOpenNewDirectChat: () => void;
}

type TabType = 'all' | 'direct' | 'channels' | 'orgs';

export const TelegramSidebar: React.FC<TelegramSidebarProps> = ({
  conversations,
  activeConversationId,
  currentUser,
  onSelectConversation,
  onOpenDrawer,
  onOpenOrgDirectory,
  onOpenNewDirectChat
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    // Tab filter
    if (activeTab === 'direct' && conv.type !== 'direct') return false;
    if (activeTab === 'channels' && conv.type !== 'channel') return false;
    if (activeTab === 'orgs' && conv.type !== 'organization') return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = conv.title?.toLowerCase().includes(q);
    const messageMatch = conv.lastMessage?.toLowerCase().includes(q);
    const handleMatch = Object.values(conv.participantHandles || {}).some(h =>
      h.toLowerCase().includes(q)
    );
    return titleMatch || messageMatch || handleMatch;
  });

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full bg-[#17212b] border-r border-[#0e1621] flex flex-col select-none relative z-10">
      {/* Top Telegram Header */}
      <div className="p-3.5 flex items-center gap-3 border-b border-[#0e1621] bg-[#17212b]">
        {/* Hamburger Menu Icon */}
        <button
          onClick={onOpenDrawer}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#202b36] transition flex-shrink-0 cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search @handle, channels..."
            className="w-full bg-[#242f3d] text-xs text-white rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-[#2481cc] focus:outline-none placeholder:text-gray-400 transition"
          />
        </div>

        <div className="flex-shrink-0">
          <PWAInstallButton variant="button" />
        </div>
      </div>

      {/* Telegram Folder / Tabs Bar */}
      <div className="flex items-center px-2 py-1.5 bg-[#17212b] border-b border-[#0e1621] text-xs font-medium text-gray-400 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'text-white bg-[#242f3d] font-bold shadow-sm'
              : 'hover:text-gray-200'
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`px-3 py-1.5 rounded-full transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeTab === 'channels'
              ? 'text-white bg-[#242f3d] font-bold shadow-sm'
              : 'hover:text-gray-200'
          }`}
        >
          <Hash className="w-3 h-3 text-[#2481cc]" />
          <span>Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('direct')}
          className={`px-3 py-1.5 rounded-full transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeTab === 'direct'
              ? 'text-white bg-[#242f3d] font-bold shadow-sm'
              : 'hover:text-gray-200'
          }`}
        >
          <AtSign className="w-3 h-3 text-emerald-400" />
          <span>Direct</span>
        </button>

        <button
          onClick={() => setActiveTab('orgs')}
          className={`px-3 py-1.5 rounded-full transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeTab === 'orgs'
              ? 'text-white bg-[#242f3d] font-bold shadow-sm'
              : 'hover:text-gray-200'
          }`}
        >
          <Building className="w-3 h-3 text-purple-400" />
          <span>Organizations</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#0e1621] custom-scrollbar">
        {filteredConversations.map(conv => {
          const isActive = conv.conversationId === activeConversationId;
          const isChannel = conv.type === 'channel';
          const isOrg = conv.type === 'organization';

          // For direct chats, find peer's data
          let displayName = conv.title || 'Chat';
          let displayHandle = '';
          let photoURL = '';

          if (!isChannel && !isOrg && conv.participants) {
            const peerId = conv.participants.find(p => p !== currentUser.userId);
            if (peerId) {
              displayName = conv.participantNames?.[peerId] || conv.title || 'Professional';
              displayHandle = conv.participantHandles?.[peerId] || '';
              photoURL = conv.participantPhotos?.[peerId] || '';
            }
          }

          const timeFormatted = conv.lastMessageTime
            ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div
              key={conv.conversationId}
              onClick={() => onSelectConversation(conv.conversationId)}
              className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition select-none ${
                isActive ? 'bg-[#2b5278] text-white' : 'hover:bg-[#202b36] text-gray-200'
              }`}
            >
              {/* Avatar Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-white shadow-sm">
                  {isChannel ? (
                    <div className="w-full h-full bg-gradient-to-tr from-[#2481cc] to-[#1a73e8] flex items-center justify-center">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                  ) : isOrg ? (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-700 to-indigo-800 flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  ) : photoURL ? (
                    <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold">{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {!isChannel && !isOrg && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#17212b]"></span>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {displayName}
                    </h3>
                    {displayHandle && (
                      <span className="text-[10px] font-mono text-blue-300 truncate">
                        @{displayHandle}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                    {timeFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 truncate pr-2">
                    {conv.lastMessage || (isChannel ? 'Join channel conversation' : 'Send a direct message')}
                  </p>

                  {conv.unreadCount && conv.unreadCount > 0 ? (
                    <span className="bg-[#2481cc] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-white">No chats found</p>
            <p className="text-[11px] text-gray-400 mt-1 mb-4">
              Search by @handle to start messaging other registered members.
            </p>
            <button
              onClick={onOpenNewDirectChat}
              className="px-3.5 py-1.5 bg-[#242f3d] hover:bg-[#202b36] text-blue-400 rounded-full text-xs font-medium transition border border-blue-500/30 cursor-pointer"
            >
              Start Chat by @Handle
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button (Telegram Pencil/Plus) */}
      <div className="absolute bottom-5 right-5 z-20">
        {showFabMenu && (
          <div className="absolute bottom-14 right-0 bg-[#242f3d] border border-gray-700 rounded-2xl shadow-2xl p-2 w-60 flex flex-col gap-1 text-xs animate-in slide-in-from-bottom duration-150">
            <button
              onClick={() => {
                setShowFabMenu(false);
                onOpenNewDirectChat();
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-[#2b5278] hover:text-white transition text-left cursor-pointer"
            >
              <AtSign className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-semibold block">New Direct Chat</span>
                <span className="text-[10px] text-gray-400">Search member by @handle</span>
              </div>
            </button>

            <button
              onClick={() => {
                setShowFabMenu(false);
                onOpenOrgDirectory();
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-200 hover:bg-[#2b5278] hover:text-white transition text-left cursor-pointer"
            >
              <Building className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-semibold block">Organizations Directory</span>
                <span className="text-[10px] text-gray-400">Join industry communities</span>
              </div>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className="w-13 h-13 rounded-full bg-[#2481cc] hover:bg-[#1f70b3] text-white flex items-center justify-center shadow-2xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
          title="New Action"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};
