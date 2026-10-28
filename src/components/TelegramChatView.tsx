import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Paperclip,
  Smile,
  ArrowLeft,
  CheckCheck,
  Building,
  Hash,
  Copy,
  Check,
  Image as ImageIcon,
  Sparkles,
  Search,
  Globe
} from 'lucide-react';
import { Conversation, Message, UserProfile } from '../types';

interface TelegramChatViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: UserProfile;
  onSendMessage: (text: string, type?: 'text' | 'image' | 'file') => void;
  onOpenProfile: (profileOrUserId: string) => void;
  onBackMobile: () => void;
}

const QUICK_EMOJIS = ['👍', '🔥', '🚀', '👏', '❤️', '💡', '🎉', '🤝', '💯', '✨'];

export const TelegramChatView: React.FC<TelegramChatViewProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onOpenProfile,
  onBackMobile
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [searchInChat, setSearchInChat] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isChannel = conversation.type === 'channel';
  const isOrg = conversation.type === 'organization';

  // Determine other participant for direct chat
  let otherUserId = '';
  let otherName = conversation.title || 'Chat';
  let otherHandle = '';
  let otherPhoto = '';

  if (!isChannel && !isOrg && conversation.participants) {
    const peerId = conversation.participants.find(p => p !== currentUser.userId);
    if (peerId) {
      otherUserId = peerId;
      otherName = conversation.participantNames?.[peerId] || conversation.title || 'Professional Member';
      otherHandle = conversation.participantHandles?.[peerId] || '';
      otherPhoto = conversation.participantPhotos?.[peerId] || '';
    }
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleQuickEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSendMessage(`📷 Shared photo: ${file.name}`, 'image');
        }
      };
      reader.readAsDataURL(file);
    } else {
      onSendMessage(`📎 Shared document: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredMessages = searchInChat.trim()
    ? messages.filter(m => m.text.toLowerCase().includes(searchInChat.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e1621] relative overflow-hidden select-none">
      {/* Top Header (Telegram authentic bar) */}
      <div className="h-15 px-4 bg-[#17212b] border-b border-[#0e1621] flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#202b36] transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar / Icon */}
          <div
            onClick={() => {
              if (!isChannel && !isOrg && otherUserId) onOpenProfile(otherUserId);
            }}
            className={`w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0 shadow ${
              !isChannel && !isOrg ? 'cursor-pointer hover:ring-2 hover:ring-[#2481cc]' : ''
            }`}
          >
            {isChannel ? (
              <div className="w-full h-full bg-gradient-to-tr from-[#2481cc] to-[#1a73e8] flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
            ) : isOrg ? (
              <div className="w-full h-full bg-gradient-to-tr from-purple-700 to-indigo-800 flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
            ) : otherPhoto ? (
              <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold">{otherName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                onClick={() => {
                  if (!isChannel && !isOrg && otherUserId) onOpenProfile(otherUserId);
                }}
                className={`text-sm font-semibold text-white truncate ${
                  !isChannel && !isOrg ? 'cursor-pointer hover:underline' : ''
                }`}
              >
                {otherName}
              </h2>
              {otherHandle && (
                <span className="text-[11px] font-mono text-blue-300 hidden sm:inline">@{otherHandle}</span>
              )}
            </div>

            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 truncate">
              {isChannel ? (
                <span>Public Channel • {conversation.memberCount || '1,000+'} members • Realtime Sync</span>
              ) : isOrg ? (
                <span>Organization Network • Live Professional Group</span>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-emerald-400 font-medium">online</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 truncate">Direct Secure Chat</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {isSearching ? (
            <div className="flex items-center bg-[#242f3d] rounded-full px-3 py-1 border border-gray-700">
              <input
                type="text"
                autoFocus
                value={searchInChat}
                onChange={e => setSearchInChat(e.target.value)}
                placeholder="Search in chat..."
                className="bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none w-28 sm:w-44"
              />
              <button onClick={() => { setIsSearching(false); setSearchInChat(''); }} className="text-gray-400 hover:text-white text-xs ml-1">
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              title="Search in conversation"
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#242f3d] transition"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {!isChannel && !isOrg && otherUserId && (
            <button
              onClick={() => onOpenProfile(otherUserId)}
              className="flex items-center gap-1.5 text-xs text-blue-300 bg-[#242f3d] hover:bg-[#2e3c4e] px-3 py-1.5 rounded-full font-medium transition border border-blue-500/20"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">View Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 custom-scrollbar">
        {conversation.description && (
          <div className="max-w-md mx-auto text-center p-3 rounded-2xl bg-[#17212b]/80 border border-gray-800 text-xs text-gray-300 shadow-sm mb-4">
            <span className="font-semibold text-white block mb-0.5">{conversation.title}</span>
            {conversation.description}
          </div>
        )}

        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-14 h-14 rounded-full bg-[#17212b] border border-gray-800 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-white">No messages yet</p>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              {isChannel
                ? 'Be the first to post a message in this channel!'
                : `Say hello to ${otherName} to start your real-time conversation.`}
            </p>
          </div>
        ) : (
          filteredMessages.map(msg => {
            const isMe = msg.senderId === currentUser.userId;

            return (
              <div
                key={msg.messageId}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                    isMe
                      ? 'bg-[#2b5278] text-white rounded-br-none border border-blue-600/30'
                      : 'bg-[#182533] text-gray-100 rounded-bl-none border border-gray-800'
                  }`}
                >
                  {/* Sender Name in Channels/Groups */}
                  {(isChannel || isOrg) && !isMe && (
                    <div className="flex items-center gap-1.5 mb-1 cursor-pointer" onClick={() => onOpenProfile(msg.senderId)}>
                      <span className="text-[11px] font-bold text-blue-400 hover:underline">
                        {msg.senderName}
                      </span>
                      {msg.senderHandle && (
                        <span className="text-[10px] font-mono text-gray-400">@{msg.senderHandle}</span>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <p className="whitespace-pre-wrap break-words leading-relaxed select-text text-[13px]">
                    {msg.text}
                  </p>

                  {/* Footer (Timestamp + Delivery Ticks + Copy button) */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-gray-300/80">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
                    <button
                      onClick={() => handleCopyText(msg.text, msg.messageId)}
                      title="Copy text"
                      className="opacity-0 group-hover:opacity-100 transition p-0.5 hover:text-white"
                    >
                      {copiedMsgId === msg.messageId ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Bar */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-[#17212b] border-t border-gray-800 flex items-center gap-2 overflow-x-auto">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="text-lg p-1.5 hover:scale-125 transition rounded-lg hover:bg-[#242f3d]"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Bottom Message Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-[#17212b] border-t border-[#0e1621] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className={`p-2 rounded-full transition ${
            showEmojiPicker ? 'text-[#2481cc] bg-[#242f3d]' : 'text-gray-400 hover:text-white hover:bg-[#242f3d]'
          }`}
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#242f3d] rounded-full transition"
          title="Attach file or image"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={isChannel ? 'Write a message to the channel...' : `Message ${otherName}...`}
          className="flex-1 bg-[#242f3d] text-white text-xs sm:text-sm rounded-2xl px-4 py-2.5 border border-transparent focus:border-[#2481cc] focus:outline-none placeholder:text-gray-400 transition"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-[#2481cc] hover:bg-[#1f70b3] disabled:opacity-40 disabled:hover:bg-[#2481cc] text-white rounded-full transition shadow-md flex-shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
