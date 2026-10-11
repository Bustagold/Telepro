import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  MessageSquare,
  Hand,
  Copy,
  Check,
  Maximize2,
  Monitor,
  Sparkles,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleMeetRoomProps {
  roomCode: string;
  meetingTitle: string;
  currentUser: UserProfile;
  onLeave: () => void;
  onShareToChat?: (roomCode: string, title: string) => void;
}

interface Participant {
  id: string;
  name: string;
  handle: string;
  headline: string;
  avatar: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isHost?: boolean;
  isHandRaised?: boolean;
}

export const GoogleMeetRoom: React.FC<GoogleMeetRoomProps> = ({
  roomCode,
  meetingTitle,
  currentUser,
  onLeave,
  onShareToChat
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'none' | 'people' | 'chat'>('none');
  const [copied, setCopied] = useState(false);
  const [meetingTimer, setMeetingTimer] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'TelePro Assistant', text: 'Welcome to Google Meet on TelePro. Share the link to invite colleagues.', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);

  // Simulated peer participants
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'p_alex',
      name: 'Alexandre Mercer',
      handle: 'alex_cto',
      headline: 'CTO @ CloudMatrix',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isMuted: false,
      isVideoOff: false,
      isHost: false
    },
    {
      id: 'p_elena',
      name: 'Dr. Elena Rostova',
      handle: 'elena_ai',
      headline: 'Principal AI Scientist @ NexusLabs',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      isMuted: true,
      isVideoOff: false
    }
  ]);

  // Request real camera stream if available
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
            setHasWebcamAccess(true);
          }
        }
      } catch (err) {
        console.log('Webcam not active or permission not granted, using professional avatar preview.');
        setHasWebcamAccess(false);
      }
    };

    if (isVideoOn) {
      startCamera();
    } else {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        localVideoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isVideoOn]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setMeetingTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://meet.telepro.app/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerReaction = (emoji: string) => {
    setFloatingReaction(emoji);
    setTimeout(() => setFloatingReaction(null), 2500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        sender: currentUser.displayName,
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#202124] text-white flex flex-col font-sans select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#3c4043] bg-[#202124]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
              <span className="text-[#8ab4f8] font-bold">Google Meet</span>
              <span className="text-gray-400 font-normal">|</span>
              <span className="truncate max-w-xs sm:max-w-md text-gray-200">{meetingTitle}</span>
            </span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#303134] text-xs text-gray-300 font-mono">
            {formatTime(meetingTimer)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share room code button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#303134] hover:bg-[#3c4043] text-gray-200 rounded-full text-xs font-medium transition"
            title="Copy Meeting Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            <span className="font-mono">{roomCode}</span>
            {copied && <span className="text-emerald-400 font-medium">Copied!</span>}
          </button>

          {onShareToChat && (
            <button
              onClick={() => onShareToChat(roomCode, meetingTitle)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-medium transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share in Telegram Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative p-4 gap-4">
        {/* Floating reaction display */}
        {floatingReaction && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-40 text-7xl animate-bounce pointer-events-none drop-shadow-2xl">
            {floatingReaction}
          </div>
        )}

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-center p-2 auto-rows-fr">
          {/* User's local tile */}
          <div className="relative bg-[#3c4043] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border-2 border-transparent hover:border-[#8ab4f8] transition h-full min-h-[220px]">
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${hasWebcamAccess ? 'block' : 'hidden'}`}
              />
            ) : null}

            {(!isVideoOn || !hasWebcamAccess) && (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden border-2 border-white/20">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.displayName.charAt(0)
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white text-base">{currentUser.displayName} (You)</p>
                  <p className="text-xs text-blue-300 font-mono">@{currentUser.handle}</p>
                </div>
              </div>
            )}

            {/* Bottom Info Tag */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#202124]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
              <span className="font-medium truncate max-w-[150px]">{currentUser.displayName} (You)</span>
              {isMicOn ? (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              ) : (
                <MicOff className="w-3.5 h-3.5 text-red-400" />
              )}
            </div>

            {isHandRaised && (
              <div className="absolute top-3 right-3 bg-amber-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                <Hand className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Screen Sharing Tile if active */}
          {isScreenSharing && (
            <div className="relative bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl flex flex-col border-2 border-blue-500 h-full min-h-[220px] p-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Monitor className="w-4 h-4" /> Presenting Screen: TelePro Architecture Schema
                </span>
                <span className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded text-[10px]">1080p 60fps</span>
              </div>
              <div className="flex-1 font-mono text-xs text-emerald-400 overflow-hidden pt-3 opacity-90 leading-relaxed bg-[#121212] rounded-lg p-3 my-2 border border-gray-800">
                <div className="text-purple-400">// TelePro Real-Time Cluster Orchestrator</div>
                <div>export const connectPeerMesh = async (clusterId: string) =&gt; &#123;</div>
                <div className="pl-4 text-cyan-300">const meetSession = await firebase.meetings.createSession(&#123;</div>
                <div className="pl-8 text-yellow-300">audioCodec: 'OPUS', videoCodec: 'VP9', bitrate: 2500</div>
                <div className="pl-4">&#125;);</div>
                <div className="pl-4 text-gray-400">// Telegram & LinkedIn syncing state</div>
                <div className="pl-4 text-emerald-300">broadcastStatus('LIVE_IN_MEET');</div>
                <div>&#125;</div>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Presenter: {currentUser.displayName}</span>
                <span className="text-blue-400 underline cursor-pointer hover:text-blue-300">Switch Window</span>
              </div>
            </div>
          )}

          {/* Remote Participants */}
          {participants.map(peer => (
            <div
              key={peer.id}
              className="relative bg-[#3c4043] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border-2 border-transparent hover:border-[#8ab4f8] transition h-full min-h-[220px]"
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden border-2 border-white/20">
                  <img src={peer.avatar} alt={peer.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center px-4">
                  <p className="font-semibold text-white text-base">{peer.name}</p>
                  <p className="text-xs text-gray-300 font-medium truncate max-w-[200px]">{peer.headline}</p>
                  <p className="text-[11px] text-[#8ab4f8] font-mono">@{peer.handle}</p>
                </div>
              </div>

              {/* Status bar */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#202124]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
                <span className="font-medium truncate max-w-[150px]">{peer.name}</span>
                {peer.isMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Side Panel: People or Chat */}
        {activeSidePanel !== 'none' && (
          <div className="w-80 sm:w-96 bg-[#282a2d] rounded-2xl border border-[#3c4043] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-[#3c4043] flex items-center justify-between">
              <h3 className="font-semibold text-white text-base">
                {activeSidePanel === 'people' ? `Participants (${participants.length + 1})` : 'In-call Messages'}
              </h3>
              <button
                onClick={() => setActiveSidePanel('none')}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#3c4043] transition"
              >
                ✕
              </button>
            </div>

            {/* People List */}
            {activeSidePanel === 'people' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* You */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#303134]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        currentUser.displayName[0]
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{currentUser.displayName} (You)</p>
                      <p className="text-xs text-blue-300">Host • @{currentUser.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                    {isVideoOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
                  </div>
                </div>

                {/* Peers */}
                {participants.map(peer => (
                  <div key={peer.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#303134] transition">
                    <div className="flex items-center gap-3">
                      <img src={peer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-white">{peer.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{peer.headline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      {peer.isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                      <Video className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat View */}
            {activeSidePanel === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-[#303134] p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#8ab4f8]">{msg.sender}</span>
                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                      </div>
                      <p className="text-xs text-gray-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="p-3 border-t border-[#3c4043] flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Send a message to everyone..."
                    className="flex-1 bg-[#202124] text-xs text-white rounded-full px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-xs font-semibold rounded-full text-white transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar (Authentic Google Meet layout) */}
      <div className="h-20 bg-[#202124] px-6 flex items-center justify-between border-t border-[#3c4043]">
        {/* Left info */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
          <span className="font-mono text-gray-300 font-semibold">{formatTime(meetingTimer)}</span>
          <span>|</span>
          <span className="font-mono">{roomCode}</span>
          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" /> End-to-end synced
          </span>
        </div>

        {/* Center Control Pills */}
        <div className="flex items-center gap-3 mx-auto">
          {/* Mic */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isMicOn ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
            }`}
            title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isVideoOn ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isScreenSharing ? 'bg-[#8ab4f8] text-[#202124]' : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title="Present now"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Raise Hand */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isHandRaised ? 'bg-amber-500 text-white animate-bounce' : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title="Raise hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Reactions */}
          <div className="relative group">
            <button
              className="w-12 h-12 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-white flex items-center justify-center transition shadow-lg"
              title="Send a reaction"
            >
              <Smile className="w-5 h-5" />
            </button>
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1.5 bg-[#303134] p-2 rounded-full shadow-2xl border border-[#3c4043]">
              {['👍', '👏', '❤️', '🎉', '🚀', '💡'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="hover:scale-125 transition text-xl p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* End Call Button */}
          <button
            onClick={onLeave}
            className="px-6 h-12 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center gap-2 font-semibold text-sm transition shadow-lg ml-2"
            title="Leave call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden sm:inline">Leave call</span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'people' ? 'none' : 'people')}
            className={`p-3 rounded-full transition ${
              activeSidePanel === 'people' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-gray-300 hover:bg-[#3c4043]'
            }`}
            title="Show participants"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'chat' ? 'none' : 'chat')}
            className={`p-3 rounded-full transition ${
              activeSidePanel === 'chat' ? 'bg-[#8ab4f8] text-[#202124]' : 'text-gray-300 hover:bg-[#3c4043]'
            }`}
            title="Chat with everyone"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
