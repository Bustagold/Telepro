import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Video,
  User,
  Paperclip,
  Smile,
  MoreVertical,
  ArrowLeft,
  CheckCheck,
  Radio,
  ExternalLink,
  ShieldCheck,
  Building,
  AtSign,
  PhoneCall
} from 'lucide-react';
import { Conversation, Message, UserProfile } from '../types';

interface TelegramChatViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: UserProfile;
  onSendMessage: (text: string, type?: 'text' | 'meet_invite' | 'connect_card', meetRoomCode?: string) => void;
  onOpenProfile: (profileOrUserId: string) => void;
  onLaunchMeet: (conversationId: string, title: string) => void;
  onJoinMeet: (roomCode: string, title: string) => void;
  onBackMobile: () => void;
}

export const TelegramChatView: React.FC<TelegramChatViewProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onOpenProfile,
  onLaunchMeet,
  onJoinMeet,
  onBackMobile
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOrg = conversation.type === 'organization';

  // Determine other participant for direct chat
  let otherUserId = '';
  let otherName = conversation.title || 'Chat';
  let otherHandle = '';
  let otherPhoto = '';

  if (!isOrg && conversation.participants) {
    const peerId = conversation.participants.find(p => p !== currentUser.userId);
    if (peerId) {
      otherUserId = peerId;
      otherName = conversation.participantNames?.[peerId] || conversation.title || 'Professional';
      otherHandle = conversation.participantHandles?.[peerId] || '';
      otherPhoto = conversation.participantPhotos?.[peerId] || '';
    }
  }

  // Auto-scroll to bottom
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e1621] relative overflow-hidden select-none">
      {/* Top Header (Telegram authentic bar) */}
      <div className="h-15 px-4 bg-[#17212b] border-b border-[#0e1621] flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#202b36] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div
            onClick={() => {
              if (!isOrg && otherUserId) onOpenProfile(otherUserId);
            }}
            className={`w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0 cursor-pointer shadow ${
              !isOrg ? 'hover:ring-2 hover:ring-[#2481cc]' : ''
            }`}
          >
            {isOrg ? (
              <div className="w-full h-full bg-gradient-to-tr from-blue-700 to-indigo-800 flex items-center justify-center text-sm">
                <Building className="w-5 h-5 text-white" />
              </div>
            ) : otherPhoto ? (
              <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" />
            ) : (
              <span>{otherName.charAt(0)}</span>
            )}
          </div>

          {/* Name & Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2
                onClick={() => {
                  if (!isOrg && otherUserId) onOpenProfile(otherUserId);
                }}
                className={`text-sm font-semibold text-white truncate ${
                  !isOrg ? 'cursor-pointer hover:underline' : ''
                }`}
              >
                {otherName}
              </h2>
              {otherHandle && (
                <span className="text-[11px] font-mono text-blue-300 hidden sm:inline">@{otherHandle}</span>
              )}
            </div>

            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 truncate">
              {isOrg ? (
                <span>Industry Organization Group • Active Telegram Channel</span>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-emerald-400 font-medium">online</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 truncate">Professional Profile</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Top Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Instant Google Meet Call Button */}
          <button
            onClick={() => onLaunchMeet(conversation.conversationId, `${otherName} Meeting`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-semibold shadow transition transform hover:scale-105"
            title="Start Google Meet Video Call"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Meet</span>
          </button>

          {/* View Profile / Resume Button for direct chat */}
          {!isOrg && otherUserId && (
            <button
              onClick={() => onOpenProfile(otherUserId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242f3d] hover:bg-[#202b36] border border-gray-700 text-blue-300 rounded-full text-xs font-medium transition"
              title="View LinkedIn Resume & Profile"
            >
              <User className="w-3.5 h-3.5 text-[#2481cc]" />
              <span className="hidden sm:inline">Resume</span>
            </button>
          )}

          <button
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#202b36] transition"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Canvas with Telegram wallpaper background */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 relative bg-[#0e1621] bg-[radial-gradient(#1e2c3a_1px,transparent_1px)] [background-size:20px_20px]">
        {/* Encryption & Professional Badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#17212b]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-800 text-[11px] text-gray-400 flex items-center gap-1.5 shadow">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Synced in real-time across devices via Firebase Cloud</span>
          </div>
        </div>

        {messages.map(msg => {
          const isMe = msg.senderId === currentUser.userId;

          // Special Meet Invite Card
          if (msg.type === 'meet_invite' || msg.meetRoomCode) {
            const roomCode = msg.meetRoomCode || 'tele-meet-room';
            return (
              <div key={msg.messageId} className="flex justify-center my-4">
                <div className="bg-[#17212b] border-2 border-[#1a73e8] rounded-2xl p-4 max-w-sm sm:max-w-md w-full shadow-2xl text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-700/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-white">Google Meet Video Call</h4>
                        <p className="text-[10px] text-blue-300 font-mono">Room: {roomCode}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 my-3 leading-relaxed">
                    {msg.text || `${msg.senderName} started a Google Meet video conference.`}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-400">
                      Started by <strong className="text-gray-300">@{msg.senderHandle}</strong>
                    </span>
                    <button
                      onClick={() => onJoinMeet(roomCode, 'Google Meet Session')}
                      className="px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-bold shadow transition flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Video Call</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Special Professional Connect Card
          if (msg.type === 'connect_card') {
            return (
              <div key={msg.messageId} className="flex justify-center my-3">
                <div className="bg-[#17212b] border border-blue-500/40 rounded-xl p-3.5 max-w-sm w-full shadow-lg text-white">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                      🤝
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{msg.senderName}</p>
                      <p className="text-[10px] text-blue-300">Telegram Connect Request</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mb-3">{msg.text}</p>
                  <button
                    onClick={() => onOpenProfile(msg.senderId)}
                    className="w-full py-1.5 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-lg text-xs font-semibold transition"
                  >
                    View Professional Resume
                  </button>
                </div>
              </div>
            );
          }

          // Standard Telegram Message Bubble
          return (
            <div
              key={msg.messageId}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-md rounded-2xl px-3.5 py-2 shadow-md relative text-xs sm:text-sm leading-relaxed ${
                  isMe
                    ? 'bg-[#2b5278] text-white rounded-br-xs'
                    : 'bg-[#182533] text-gray-100 rounded-bl-xs border border-gray-800/80'
                }`}
              >
                {/* Author name in group chats */}
                {!isMe && isOrg && (
                  <div className="font-semibold text-xs text-[#64b5f6] mb-0.5 flex items-center gap-1">
                    <span>{msg.senderName}</span>
                    <span className="text-[10px] font-mono opacity-70">@{msg.senderHandle}</span>
                  </div>
                )}

                {/* Message body */}
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                {/* Timestamp and delivery checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-300/80 font-mono">
                  <span>
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Quick Bar */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-[#17212b] border-t border-[#0e1621] flex items-center gap-2 overflow-x-auto text-xl">
          {['👍', '🚀', '🎯', '🤝', '💼', '💡', '🔥', '👏', '✅', '📈', '💻'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="hover:scale-125 transition p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Bar (Telegram Desktop authentic style) */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#17212b] border-t border-[#0e1621] flex items-center gap-2 relative z-10"
      >
        {/* Attachment clip */}
        <button
          type="button"
          onClick={() => {
            onSendMessage('📄 Attached Professional Portfolio & Resume Document (PDF)', 'text');
          }}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#202b36] transition"
          title="Share document or resume"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji Toggle */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#202b36] transition"
          title="Reactions"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Message ${otherName}...`}
          className="flex-1 bg-[#242f3d] text-xs sm:text-sm text-white rounded-full px-4 py-2.5 border border-transparent focus:border-[#2481cc] focus:outline-none placeholder:text-gray-400 transition"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow ${
            inputText.trim()
              ? 'bg-[#2481cc] hover:bg-[#1f70b3] text-white scale-100'
              : 'bg-[#242f3d] text-gray-500 cursor-not-allowed'
          }`}
          title="Send"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};
