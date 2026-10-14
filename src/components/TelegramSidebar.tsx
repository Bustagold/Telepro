import React, { useState } from 'react';
import {
  Menu,
  Search,
  Users,
  Building,
  Video,
  Plus,
  Check,
  CheckCheck,
  Pin,
  AtSign,
  Radio,
  Briefcase
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
  onStartInstantMeet: () => void;
}

type TabType = 'all' | 'direct' | 'orgs' | 'meets';

export const TelegramSidebar: React.FC<TelegramSidebarProps> = ({
  conversations,
  activeConversationId,
  currentUser,
  organizations,
  onSelectConversation,
  onOpenDrawer,
  onOpenOrgDirectory,
  onOpenNewDirectChat,
  onStartInstantMeet
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    // Tab filter
    if (activeTab === 'direct' && conv.type !== 'direct') return false;
    if (activeTab === 'orgs' && conv.type !== 'organization') return false;
    if (activeTab === 'meets' && !conv.lastMessage?.toLowerCase().includes('meet')) return false;

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
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#202b36] transition"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Telegram Search Field */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search @ID, organizations..."
            className="w-full bg-[#242f3d] text-xs text-white rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-[#2481cc] focus:outline-none placeholder:text-gray-400 transition"
          />
        </div>

        <div className="flex-shrink-0">
          <PWAInstallButton variant="button" />
        </div>
      </div>

      {/* Telegram Folder / Tabs Bar */}
      <div className="flex items-center px-2 border-b border-[#0e1621] bg-[#17212b] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'text-[#2481cc] border-[#2481cc]'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <span>All</span>
          <span className="text-[10px] bg-[#242f3d] px-1.5 py-0.2 rounded-full text-gray-300">
            {conversations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('direct')}
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'direct'
              ? 'text-[#2481cc] border-[#2481cc]'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <AtSign className="w-3.5 h-3.5" />
          <span>Direct @IDs</span>
        </button>

        <button
          onClick={() => setActiveTab('orgs')}
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'orgs'
              ? 'text-[#2481cc] border-[#2481cc]'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Organizations</span>
        </button>

        <button
          onClick={() => setActiveTab('meets')}
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'meets'
              ? 'text-[#2481cc] border-[#2481cc]'
              : 'text-gray-400 border-transparent hover:text-gray-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Meet Rooms</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#0e1621]/40">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conv => {
            const isActive = activeConversationId === conv.conversationId;
            const isOrg = conv.type === 'organization';

            // Find other participant for direct chat
            let otherName = conv.title || 'Chat';
            let otherHandle = '';
            let otherPhoto = '';

            if (!isOrg && conv.participants) {
              const otherId = conv.participants.find(p => p !== currentUser.userId);
              if (otherId) {
                otherName = conv.participantNames?.[otherId] || conv.title || 'Professional';
                otherHandle = conv.participantHandles?.[otherId] || '';
                otherPhoto = conv.participantPhotos?.[otherId] || '';
              }
            }

            const isMeetActive = conv.lastMessage?.toLowerCase().includes('meet');

            return (
              <div
                key={conv.conversationId}
                onClick={() => onSelectConversation(conv.conversationId)}
                className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition select-none ${
                  isActive ? 'bg-[#2b5278]' : 'hover:bg-[#202b36]'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-white shadow">
                    {isOrg ? (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-700 to-indigo-800 flex items-center justify-center text-lg">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                    ) : otherPhoto ? (
                      <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base">{otherName.charAt(0)}</span>
                    )}
                  </div>
                  {/* Status dot */}
                  {isOrg ? (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-[#17212b] flex items-center justify-center text-[8px]">
                      👥
                    </span>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#17212b]"></span>
                  )}
                </div>

                {/* Conversation Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-xs sm:text-sm text-white truncate">{otherName}</span>
                      {otherHandle && (
                        <span className="text-[11px] font-mono text-blue-300/80 truncate">@{otherHandle}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap ml-2">
                      {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-300 truncate leading-relaxed">
                      {isMeetActive ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                          <span>Google Meet Active</span>
                        </span>
                      ) : (
                        conv.lastMessage || 'No messages yet'
                      )}
                    </p>

                    {conv.lastMessageSenderId === currentUser.userId && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-1" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm font-medium text-gray-300">No chats in this folder</p>
            <p className="text-xs text-gray-500 mt-1">Start a direct chat with an @ID or browse organizations.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={onOpenOrgDirectory}
                className="px-3 py-1.5 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-lg text-xs font-semibold transition"
              >
                Browse Organizations Directory
              </button>
              <button
                onClick={onOpenNewDirectChat}
                className="px-3 py-1.5 bg-[#242f3d] hover:bg-[#202b36] text-gray-200 rounded-lg text-xs font-medium transition"
              >
                Find Professional by @ID
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (Telegram Pencil/Plus) */}
      <div className="absolute bottom-5 right-5 z-20">
        {showFabMenu && (
          <div className="absolute bottom-14 right-0 bg-[#242f3d] border border-gray-700 rounded-xl shadow-2xl p-2 w-56 flex flex-col gap-1 text-xs animate-in slide-in-from-bottom duration-150">
            <button
              onClick={() => {
                setShowFabMenu(false);
                onOpenNewDirectChat();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:bg-[#2b5278] hover:text-white transition text-left"
            >
              <AtSign className="w-4 h-4 text-blue-400" />
              <span>New Message by @ID</span>
            </button>

            <button
              onClick={() => {
                setShowFabMenu(false);
                onOpenOrgDirectory();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:bg-[#2b5278] hover:text-white transition text-left"
            >
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Browse Organizations</span>
            </button>

            <button
              onClick={() => {
                setShowFabMenu(false);
                onStartInstantMeet();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:bg-[#2b5278] hover:text-white transition text-left"
            >
              <Video className="w-4 h-4 text-rose-400" />
              <span>Instant Google Meet</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className="w-13 h-13 rounded-full bg-[#2481cc] hover:bg-[#1f70b3] text-white flex items-center justify-center shadow-2xl transition transform hover:scale-105 active:scale-95"
          title="New Action"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};
