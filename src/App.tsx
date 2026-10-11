import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TelegramSidebar } from './components/TelegramSidebar';
import { TelegramChatView } from './components/TelegramChatView';
import { TelegramDrawer } from './components/TelegramDrawer';
import { GoogleMeetRoom } from './components/GoogleMeetRoom';
import { UserProfileModal } from './components/UserProfileModal';
import { OrganizationsDirectoryModal } from './components/OrganizationsDirectoryModal';
import { NewDirectChatModal } from './components/NewDirectChatModal';
import { ConnectionsModal } from './components/ConnectionsModal';
import { AuthModal } from './components/AuthModal';
import {
  Conversation,
  Message,
  Organization,
  UserProfile,
  Connection,
  OrgCategory
} from './types';
import { INITIAL_SEED_ORGANIZATIONS, INITIAL_SEED_PROFILES } from './data/seedData';
import {
  Video,
  Building,
  AtSign,
  Briefcase,
  Users,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Search
} from 'lucide-react';

function MainPlatform() {
  const { currentUser, userProfile, signOutUser, updateProfileData } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [joinedOrgIds, setJoinedOrgIds] = useState<string[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(INITIAL_SEED_PROFILES);

  // Modals & Overlays
  const [activeMeeting, setActiveMeeting] = useState<{ roomCode: string; title: string } | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOrgDirectoryOpen, setIsOrgDirectoryOpen] = useState(false);
  const [isNewDirectChatOpen, setIsNewDirectChatOpen] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Current active conversation object
  const activeConversation = conversations.find(c => c.conversationId === activeConversationId);

  // Initialize organizations and sample data on load
  useEffect(() => {
    const initData = async () => {
      try {
        const orgsSnap = await getDocs(collection(db, 'organizations'));
        if (orgsSnap.empty) {
          // Seed initial organizations
          const loadedOrgs: Organization[] = [];
          for (const seed of INITIAL_SEED_ORGANIZATIONS) {
            const orgId = 'org_' + (seed.slug || Math.random().toString(36).substring(7));
            const newOrg: Organization = {
              ...seed,
              orgId,
              createdAt: new Date().toISOString()
            };
            try {
              if (auth.currentUser) {
                await setDoc(doc(db, 'organizations', orgId), newOrg);
              }
            } catch {
              // Ignore if unauthed or rules
            }
            loadedOrgs.push(newOrg);
          }
          setOrganizations(loadedOrgs);
        } else {
          const orgList: Organization[] = [];
          orgsSnap.forEach(d => orgList.push(d.data() as Organization));
          setOrganizations(orgList);
        }
      } catch (err) {
        // Fallback to local seeds
        setOrganizations(
          INITIAL_SEED_ORGANIZATIONS.map((s, idx) => ({
            ...s,
            orgId: 'org_' + (s.slug || idx),
            createdAt: new Date().toISOString()
          }))
        );
      }
    };

    initData();
  }, []);

  // Set default initial conversations for the user if none exist
  useEffect(() => {
    if (!userProfile) return;

    // Check if we have initial conversations
    if (conversations.length === 0) {
      const alex = INITIAL_SEED_PROFILES[0];
      const elena = INITIAL_SEED_PROFILES[1];

      const defaultConvs: Conversation[] = [
        {
          conversationId: 'conv_alex_direct',
          type: 'direct',
          title: alex.displayName,
          participants: [userProfile.userId, alex.userId],
          participantNames: { [alex.userId]: alex.displayName, [userProfile.userId]: userProfile.displayName },
          participantHandles: { [alex.userId]: alex.handle, [userProfile.userId]: userProfile.handle },
          participantPhotos: { [alex.userId]: alex.photoURL || '', [userProfile.userId]: userProfile.photoURL || '' },
          lastMessage: 'Welcome to TelePro! Let us know if you want to sync on the architecture.',
          lastMessageSenderId: alex.userId,
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 12).toISOString()
        },
        {
          conversationId: 'conv_tech_founders',
          type: 'organization',
          orgId: 'org_tech-founders-ctos',
          title: 'Tech Founders & CTOs Network',
          lastMessage: '📹 Live Google Meet scheduled: Architecture Review Q4',
          lastMessageSenderId: 'seed_alex_cto',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          conversationId: 'conv_elena_direct',
          type: 'direct',
          title: elena.displayName,
          participants: [userProfile.userId, elena.userId],
          participantNames: { [elena.userId]: elena.displayName, [userProfile.userId]: userProfile.displayName },
          participantHandles: { [elena.userId]: elena.handle, [userProfile.userId]: userProfile.handle },
          participantPhotos: { [elena.userId]: elena.photoURL || '', [userProfile.userId]: userProfile.photoURL || '' },
          lastMessage: 'Check out my latest publication on Agentic Systems.',
          lastMessageSenderId: elena.userId,
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        }
      ];

      setConversations(defaultConvs);
      setJoinedOrgIds(['org_tech-founders-ctos']);
      setActiveConversationId('conv_alex_direct');
    }
  }, [userProfile]);

  // Real-time messages listener when activeConversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    // Default mock messages for seed conversations
    const seedMessagesMap: { [convId: string]: Message[] } = {
      conv_alex_direct: [
        {
          messageId: 'm1',
          conversationId: 'conv_alex_direct',
          senderId: 'seed_alex_cto',
          senderName: 'Alexandre Mercer',
          senderHandle: 'alex_cto',
          text: 'Hey! Glad to connect on TelePro. I saw your professional background on your profile resume.',
          type: 'text',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          messageId: 'm2',
          conversationId: 'conv_alex_direct',
          senderId: 'seed_alex_cto',
          senderName: 'Alexandre Mercer',
          senderHandle: 'alex_cto',
          text: 'We are discussing our distributed event pipelines. Feel free to jump on Google Meet anytime!',
          type: 'text',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        }
      ],
      conv_tech_founders: [
        {
          messageId: 'm_org_1',
          conversationId: 'conv_tech_founders',
          senderId: 'seed_alex_cto',
          senderName: 'Alexandre Mercer',
          senderHandle: 'alex_cto',
          text: 'Welcome everyone to the Tech Founders & CTOs channel.',
          type: 'text',
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          messageId: 'm_org_2',
          conversationId: 'conv_tech_founders',
          senderId: 'seed_alex_cto',
          senderName: 'Alexandre Mercer',
          senderHandle: 'alex_cto',
          text: 'Starting our weekly architecture sync room on Google Meet. Join below!',
          type: 'meet_invite',
          meetRoomCode: 'tele-meet-founders',
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        }
      ],
      conv_elena_direct: [
        {
          messageId: 'm_elena_1',
          conversationId: 'conv_elena_direct',
          senderId: 'seed_elena_ai',
          senderName: 'Dr. Elena Rostova',
          senderHandle: 'elena_ai',
          text: 'Hello! I noticed your skills in distributed engineering. Are you working on AI agent orchestration?',
          type: 'text',
          createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString()
        }
      ]
    };

    if (seedMessagesMap[activeConversationId]) {
      setMessages(seedMessagesMap[activeConversationId]);
    } else {
      setMessages([
        {
          messageId: 'm_init_' + activeConversationId,
          conversationId: activeConversationId,
          senderId: 'system',
          senderName: 'TelePro Assistant',
          senderHandle: 'telepro',
          text: 'Conversation started. Synchronized in real-time.',
          type: 'system',
          createdAt: new Date().toISOString()
        }
      ]);
    }

    // Attach Firestore onSnapshot if authenticated
    if (auth.currentUser) {
      const messagesPath = `conversations/${activeConversationId}/messages`;
      const q = query(collection(db, messagesPath), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          if (!snapshot.empty) {
            const list: Message[] = [];
            snapshot.forEach(d => list.push(d.data() as Message));
            setMessages(list);
          }
        },
        error => {
          handleFirestoreError(error, OperationType.GET, messagesPath);
        }
      );
      return () => unsubscribe();
    }
  }, [activeConversationId]);

  // Send message handler
  const handleSendMessage = async (
    text: string,
    type: 'text' | 'meet_invite' | 'connect_card' = 'text',
    meetRoomCode?: string
  ) => {
    if (!activeConversationId || !userProfile) return;

    const newMessage: Message = {
      messageId: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      conversationId: activeConversationId,
      senderId: userProfile.userId,
      senderName: userProfile.displayName,
      senderHandle: userProfile.handle,
      senderPhoto: userProfile.photoURL,
      text,
      type,
      meetRoomCode,
      createdAt: new Date().toISOString()
    };

    // Update local state immediately for snappy Telegram responsiveness
    setMessages(prev => [...prev, newMessage]);

    // Update conversation preview
    setConversations(prev =>
      prev.map(c =>
        c.conversationId === activeConversationId
          ? {
              ...c,
              lastMessage: type === 'meet_invite' ? '📹 Google Meet Call: ' + (meetRoomCode || 'Room') : text,
              lastMessageSenderId: userProfile.userId,
              lastMessageTime: new Date().toISOString()
            }
          : c
      )
    );

    // Save to Firestore
    try {
      if (auth.currentUser) {
        await addDoc(
          collection(db, `conversations/${activeConversationId}/messages`),
          newMessage
        );
      }
    } catch (err) {
      console.warn('Message saved locally. Firestore synced when authenticated.');
    }
  };

  // Launch Google Meet
  const handleLaunchMeet = (conversationId: string, title: string) => {
    const roomCode = 'tele-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    setActiveMeeting({
      roomCode,
      title
    });

    // Also send Meet Invite card into this conversation!
    handleSendMessage(
      `📹 I started a Google Meet video session: "${title}". Click to join!`,
      'meet_invite',
      roomCode
    );
  };

  const handleJoinMeet = (roomCode: string, title: string) => {
    setActiveMeeting({ roomCode, title });
  };

  // Open User Profile / Resume modal
  const handleOpenProfileById = (userId: string) => {
    const found = allProfiles.find(p => p.userId === userId);
    if (found) {
      setViewingProfile(found);
    } else {
      // Create fallback profile
      setViewingProfile({
        userId,
        handle: 'user_' + userId.slice(0, 6),
        displayName: 'Professional Member',
        email: 'member@telepro.network',
        headline: 'Technology Leader & Contributor',
        bio: 'Connecting with fellow engineers and founders on TelePro.',
        skills: 'Engineering, Leadership, Problem Solving'
      });
    }
  };

  // Start or switch to Direct Chat with a profile
  const handleStartDirectChat = (targetProfile: UserProfile) => {
    if (!userProfile) return;

    // Check if conversation already exists
    const existing = conversations.find(
      c => c.type === 'direct' && c.participants?.includes(targetProfile.userId)
    );

    if (existing) {
      setActiveConversationId(existing.conversationId);
    } else {
      const convId = 'conv_direct_' + targetProfile.userId + '_' + Date.now();
      const newConv: Conversation = {
        conversationId: convId,
        type: 'direct',
        title: targetProfile.displayName,
        participants: [userProfile.userId, targetProfile.userId],
        participantNames: {
          [userProfile.userId]: userProfile.displayName,
          [targetProfile.userId]: targetProfile.displayName
        },
        participantHandles: {
          [userProfile.userId]: userProfile.handle,
          [targetProfile.userId]: targetProfile.handle
        },
        participantPhotos: {
          [userProfile.userId]: userProfile.photoURL || '',
          [targetProfile.userId]: targetProfile.photoURL || ''
        },
        lastMessage: 'Direct conversation opened.',
        lastMessageSenderId: userProfile.userId,
        lastMessageTime: new Date().toISOString()
      };

      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(convId);
    }

    // Ensure target profile is in allProfiles list
    if (!allProfiles.some(p => p.userId === targetProfile.userId)) {
      setAllProfiles(prev => [...prev, targetProfile]);
    }
  };

  // Join Organization
  const handleJoinOrganization = (org: Organization) => {
    if (!joinedOrgIds.includes(org.orgId)) {
      setJoinedOrgIds(prev => [...prev, org.orgId]);
    }

    // Open or create organization conversation
    const existingConv = conversations.find(c => c.orgId === org.orgId);
    if (existingConv) {
      setActiveConversationId(existingConv.conversationId);
    } else {
      const convId = 'conv_org_' + org.orgId;
      const newConv: Conversation = {
        conversationId: convId,
        type: 'organization',
        orgId: org.orgId,
        title: org.name,
        lastMessage: `You joined ${org.name}. Welcome to the organization channel!`,
        lastMessageSenderId: 'system',
        lastMessageTime: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(convId);
    }
  };

  // Create Organization
  const handleCreateOrganization = (data: {
    name: string;
    category: OrgCategory;
    description: string;
    website: string;
  }) => {
    if (!userProfile) return;

    const orgId = 'org_' + Math.random().toString(36).substring(2, 9);
    const newOrg: Organization = {
      orgId,
      name: data.name,
      category: data.category,
      description: data.description,
      website: data.website,
      ownerId: userProfile.userId,
      memberCount: 1,
      isPublic: true,
      logoUrl: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString()
    };

    setOrganizations(prev => [newOrg, ...prev]);
    setJoinedOrgIds(prev => [...prev, orgId]);

    // Create group conversation for this org
    const convId = 'conv_org_' + orgId;
    const newConv: Conversation = {
      conversationId: convId,
      type: 'organization',
      orgId,
      title: data.name,
      lastMessage: `Organization "${data.name}" created by @${userProfile.handle}.`,
      lastMessageSenderId: userProfile.userId,
      lastMessageTime: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(convId);

    // Save to Firestore
    try {
      if (auth.currentUser) {
        setDoc(doc(db, 'organizations', orgId), newOrg);
      }
    } catch (err) {
      console.warn('Org saved locally.');
    }
  };

  // Send Connect Request
  const handleSendConnect = (targetUserId: string) => {
    if (!userProfile) return;

    const target = allProfiles.find(p => p.userId === targetUserId);
    const connectionId = 'conn_' + userProfile.userId + '_' + targetUserId;

    const newConn: Connection = {
      connectionId,
      fromUserId: userProfile.userId,
      toUserId: targetUserId,
      status: 'pending',
      fromUserName: userProfile.displayName,
      fromUserHandle: userProfile.handle,
      fromUserHeadline: userProfile.headline,
      createdAt: new Date().toISOString()
    };

    setConnections(prev => [...prev, newConn]);

    // If chat exists, send a connect card
    if (activeConversationId) {
      handleSendMessage(
        `🤝 @${userProfile.handle} sent a professional connection request to @${target?.handle || 'user'}`,
        'connect_card'
      );
    }
  };

  // Accept Connect Request
  const handleAcceptConnect = (connectionId: string) => {
    setConnections(prev =>
      prev.map(c => (c.connectionId === connectionId ? { ...c, status: 'accepted' } : c))
    );
  };

  const handleDeclineConnect = (connectionId: string) => {
    setConnections(prev =>
      prev.map(c => (c.connectionId === connectionId ? { ...c, status: 'declined' } : c))
    );
  };

  // Determine connection status for active profile modal
  const getConnectionStatus = (targetUserId: string) => {
    if (!userProfile) return 'none';
    const conn = connections.find(
      c =>
        (c.fromUserId === userProfile.userId && c.toUserId === targetUserId) ||
        (c.toUserId === userProfile.userId && c.fromUserId === targetUserId)
    );
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'connected';
    if (conn.fromUserId === userProfile.userId && conn.status === 'pending') return 'pending_sent';
    if (conn.toUserId === userProfile.userId && conn.status === 'pending') return 'pending_received';
    return 'none';
  };

  if (!userProfile) {
    return <AuthModal isOpen={true} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0e1621] text-white font-sans antialiased">
      {/* 1. Left Telegram Sidebar */}
      <div
        className={`${
          activeConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 h-full flex-shrink-0`}
      >
        <TelegramSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          currentUser={userProfile}
          organizations={organizations}
          onSelectConversation={setActiveConversationId}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenOrgDirectory={() => setIsOrgDirectoryOpen(true)}
          onOpenNewDirectChat={() => setIsNewDirectChatOpen(true)}
          onStartInstantMeet={() =>
            handleLaunchMeet(activeConversationId || 'instant_meet', 'Quick Meet Session')
          }
        />
      </div>

      {/* 2. Main Telegram Chat Window or Empty State */}
      <div
        className={`${
          activeConversationId ? 'flex' : 'hidden md:flex'
        } flex-1 h-full flex-col relative`}
      >
        {activeConversation ? (
          <TelegramChatView
            conversation={activeConversation}
            messages={messages}
            currentUser={userProfile}
            onSendMessage={handleSendMessage}
            onOpenProfile={handleOpenProfileById}
            onLaunchMeet={handleLaunchMeet}
            onJoinMeet={handleJoinMeet}
            onBackMobile={() => setActiveConversationId(null)}
          />
        ) : (
          /* Desktop Empty State (Telegram classic look) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0e1621] bg-[radial-gradient(#1e2c3a_1px,transparent_1px)] [background-size:24px_24px] text-center select-none">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#2481cc]/20 to-[#1a73e8]/30 border border-[#2481cc]/40 flex items-center justify-center mb-6 shadow-2xl">
              <MessageSquare className="w-10 h-10 text-[#2481cc]" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">TelePro Messenger</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mt-2 leading-relaxed">
              Real-time messaging with Telegram speed, LinkedIn-grade resumes, discoverable industry organizations, and Google Meet video rooms.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setIsOrgDirectoryOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-xl text-xs font-semibold shadow-lg transition"
              >
                <Building className="w-4 h-4" />
                <span>Explore Organizations</span>
              </button>

              <button
                onClick={() => setIsNewDirectChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#242f3d] hover:bg-[#202b36] border border-gray-700 text-gray-200 rounded-xl text-xs font-semibold transition"
              >
                <AtSign className="w-4 h-4 text-blue-400" />
                <span>Message by @ID</span>
              </button>

              <button
                onClick={() =>
                  handleLaunchMeet('meet_direct_instant', 'Instant TelePro Video Conference')
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold shadow-lg transition"
              >
                <Video className="w-4 h-4" />
                <span>Instant Google Meet</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Google Meet Interactive Room Overlay */}
      {activeMeeting && (
        <GoogleMeetRoom
          roomCode={activeMeeting.roomCode}
          meetingTitle={activeMeeting.title}
          currentUser={userProfile}
          onLeave={() => setActiveMeeting(null)}
          onShareToChat={(code, title) => {
            if (activeConversationId) {
              handleSendMessage(
                `📹 Google Meet Session link: https://meet.telepro.app/${code}`,
                'meet_invite',
                code
              );
            }
          }}
        />
      )}

      {/* 4. LinkedIn-style User Profile & Resume Modal */}
      {viewingProfile && (
        <UserProfileModal
          profile={viewingProfile}
          currentUser={userProfile}
          connectionStatus={getConnectionStatus(viewingProfile.userId)}
          onClose={() => setViewingProfile(null)}
          onSendConnect={handleSendConnect}
          onAcceptConnect={connId => handleAcceptConnect(connId)}
          onStartChat={handleStartDirectChat}
          onStartMeet={p => handleLaunchMeet('meet_' + p.handle, `Meet with ${p.displayName}`)}
          onSaveProfile={updateProfileData}
        />
      )}

      {/* 5. Telegram Drawer Slide-Out */}
      <TelegramDrawer
        isOpen={isDrawerOpen}
        currentUser={userProfile}
        pendingRequestsCount={
          connections.filter(c => c.toUserId === userProfile.userId && c.status === 'pending').length
        }
        onClose={() => setIsDrawerOpen(false)}
        onOpenMyProfile={() => setViewingProfile(userProfile)}
        onOpenOrgDirectory={() => setIsOrgDirectoryOpen(true)}
        onOpenConnections={() => setIsConnectionsModalOpen(true)}
        onStartMeet={() =>
          handleLaunchMeet('instant_meet_' + Date.now(), 'Quick Google Meet Video Room')
        }
        onSwitchUser={() => setIsAuthModalOpen(true)}
        onSignOut={signOutUser}
      />

      {/* 6. Organizations & Groups Directory Modal */}
      {isOrgDirectoryOpen && (
        <OrganizationsDirectoryModal
          organizations={organizations}
          joinedOrgIds={joinedOrgIds}
          currentUser={userProfile}
          onClose={() => setIsOrgDirectoryOpen(false)}
          onJoinOrg={handleJoinOrganization}
          onOpenOrgChat={handleJoinOrganization}
          onStartOrgMeet={org => handleLaunchMeet('org_meet_' + org.orgId, `${org.name} Conference`)}
          onCreateOrg={handleCreateOrganization}
        />
      )}

      {/* 7. New Direct Chat by @ID Modal */}
      {isNewDirectChatOpen && (
        <NewDirectChatModal
          currentUser={userProfile}
          availableProfiles={allProfiles}
          onClose={() => setIsNewDirectChatOpen(false)}
          onStartChat={handleStartDirectChat}
          onViewResume={setViewingProfile}
          onSendConnect={handleSendConnect}
        />
      )}

      {/* 8. Connections Manager Modal */}
      {isConnectionsModalOpen && (
        <ConnectionsModal
          connections={connections}
          allProfiles={allProfiles}
          currentUser={userProfile}
          onClose={() => setIsConnectionsModalOpen(false)}
          onAccept={handleAcceptConnect}
          onDecline={handleDeclineConnect}
          onOpenProfile={handleOpenProfileById}
          onStartChat={handleStartDirectChat}
        />
      )}

      {/* 9. Auth & Switch Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainPlatform />
    </AuthProvider>
  );
}
