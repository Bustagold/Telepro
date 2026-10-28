import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TelegramSidebar } from './components/TelegramSidebar';
import { TelegramChatView } from './components/TelegramChatView';
import { TelegramDrawer } from './components/TelegramDrawer';
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
import { INITIAL_SEED_ORGANIZATIONS, INITIAL_COMMUNITY_CHANNELS } from './data/seedData';
import {
  Building,
  AtSign,
  Briefcase,
  Users,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Search,
  Globe,
  LogIn
} from 'lucide-react';

function MainPlatform() {
  const { currentUser, userProfile, signOutUser, updateProfileData, loading } = useAuth();

  // Core State
  const [channels, setChannels] = useState<Conversation[]>(INITIAL_COMMUNITY_CHANNELS);
  const [directChats, setDirectChats] = useState<Conversation[]>([]);
  const [orgChats, setOrgChats] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('channel_general_network');
  const [messages, setMessages] = useState<Message[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [joinedOrgIds, setJoinedOrgIds] = useState<string[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  // Modals & Navigation
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOrgDirectoryOpen, setIsOrgDirectoryOpen] = useState(false);
  const [isNewDirectChatOpen, setIsNewDirectChatOpen] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Combine channels, direct chats, and org chats into a unified conversation list
  const allConversations: Conversation[] = [
    ...channels,
    ...directChats,
    ...orgChats
  ];

  // Active conversation object
  const activeConversation = allConversations.find(c => c.conversationId === activeConversationId);

  // 1. Initialize official community channels in Firestore if not already present
  useEffect(() => {
    const initOfficialChannels = async () => {
      try {
        for (const ch of INITIAL_COMMUNITY_CHANNELS) {
          const chRef = doc(db, 'conversations', ch.conversationId);
          const chSnap = await getDoc(chRef);
          if (!chSnap.exists() && auth.currentUser) {
            await setDoc(chRef, {
              ...ch,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        // Fallback gracefully if not yet authenticated
      }
    };

    if (currentUser) {
      initOfficialChannels();
    }
  }, [currentUser]);

  // 2. Real-time listener for public community channels
  useEffect(() => {
    const q = query(collection(db, 'conversations'), where('type', '==', 'channel'));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (!snapshot.empty) {
          const loaded: Conversation[] = [];
          snapshot.forEach(d => loaded.push(d.data() as Conversation));
          setChannels(loaded);
        } else {
          setChannels(INITIAL_COMMUNITY_CHANNELS);
        }
      },
      error => {
        console.warn('Channels sync fallback to local defaults:', error);
        setChannels(INITIAL_COMMUNITY_CHANNELS);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Real-time listener for direct chats belonging to the signed-in user
  useEffect(() => {
    if (!currentUser) {
      setDirectChats([]);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('type', '==', 'direct'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const loaded: Conversation[] = [];
        snapshot.forEach(d => loaded.push(d.data() as Conversation));
        setDirectChats(loaded);
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'conversations(direct)');
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 4. Real-time listener for all registered users in TelePro (scale to 1,000+ real signups)
  useEffect(() => {
    const q = query(collection(db, 'users'), limit(500));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const users: UserProfile[] = [];
        snapshot.forEach(d => users.push(d.data() as UserProfile));
        setAllProfiles(users);
      },
      error => {
        console.warn('Users directory sync note:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 5. Real-time listener for incoming connection requests
  useEffect(() => {
    if (!currentUser) {
      setConnections([]);
      return;
    }

    const q = query(
      collection(db, 'connections'),
      where('toUserId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const list: Connection[] = [];
        snapshot.forEach(d => list.push(d.data() as Connection));
        setConnections(list);
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'connections');
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 6. Real-time listener for messages in the active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const messagesCol = collection(db, 'conversations', activeConversationId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'asc'), limit(150));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const msgs: Message[] = [];
        snapshot.forEach(d => msgs.push({ messageId: d.id, ...(d.data() as Omit<Message, 'messageId'>) }));
        setMessages(msgs);
      },
      error => {
        console.warn('Active conversation messages onSnapshot fallback:', error);
      }
    );

    return () => unsubscribe();
  }, [activeConversationId]);

  // 7. Initialize organizations
  useEffect(() => {
    const initOrgs = async () => {
      try {
        const orgsSnap = await getDocs(collection(db, 'organizations'));
        if (orgsSnap.empty) {
          const loadedOrgs: Organization[] = [];
          for (const seed of INITIAL_SEED_ORGANIZATIONS) {
            const orgId = 'org_' + (seed.slug || Math.random().toString(36).substring(7));
            const newOrg: Organization = {
              ...seed,
              orgId,
              createdAt: new Date().toISOString()
            };
            if (auth.currentUser) {
              try {
                await setDoc(doc(db, 'organizations', orgId), newOrg);
              } catch {
                // Ignore if unauthed
              }
            }
            loadedOrgs.push(newOrg);
          }
          setOrganizations(loadedOrgs);
        } else {
          const orgList: Organization[] = [];
          orgsSnap.forEach(d => orgList.push(d.data() as Organization));
          setOrganizations(orgList);
        }
      } catch {
        setOrganizations(
          INITIAL_SEED_ORGANIZATIONS.map((s, idx) => ({
            ...s,
            orgId: 'org_' + (s.slug || idx),
            createdAt: new Date().toISOString()
          }))
        );
      }
    };

    initOrgs();
  }, []);

  // Send a real-time message
  const handleSendMessage = async (text: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!activeConversationId || !userProfile || !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const now = new Date().toISOString();
    const newMsg: Omit<Message, 'messageId'> = {
      conversationId: activeConversationId,
      senderId: userProfile.userId,
      senderName: userProfile.displayName,
      senderHandle: userProfile.handle,
      senderPhoto: userProfile.photoURL || '',
      text,
      type,
      createdAt: now
    };

    try {
      // 1. Add message doc to subcollection
      const messagesRef = collection(db, 'conversations', activeConversationId, 'messages');
      await addDoc(messagesRef, newMsg);

      // 2. Update parent conversation metadata for fast sidebar sorting
      const convRef = doc(db, 'conversations', activeConversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageSenderId: userProfile.userId,
        lastMessageSenderName: userProfile.displayName,
        lastMessageTime: now,
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${activeConversationId}/messages`);
    }
  };

  // Start direct conversation with any real registered user
  const handleStartDirectChat = async (targetProfile: UserProfile) => {
    if (!userProfile || !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (targetProfile.userId === userProfile.userId) {
      alert('You cannot start a direct chat with yourself.');
      return;
    }

    // Deterministic conversation ID to prevent duplicate direct chats between two users
    const directConvId = `direct_${[userProfile.userId, targetProfile.userId].sort().join('_')}`;
    const convRef = doc(db, 'conversations', directConvId);

    try {
      const snap = await getDoc(convRef);
      if (!snap.exists()) {
        const newDirectConv: Conversation = {
          conversationId: directConvId,
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
          lastMessage: 'Direct conversation started',
          lastMessageSenderId: userProfile.userId,
          lastMessageSenderName: userProfile.displayName,
          lastMessageTime: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(convRef, newDirectConv);
      }

      setActiveConversationId(directConvId);
      setIsNewDirectChatOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${directConvId}`);
    }
  };

  // Send a real connection request
  const handleSendConnect = async (targetUserId: string) => {
    if (!userProfile || !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const connectionId = `${userProfile.userId}_${targetUserId}`;
    const connRef = doc(db, 'connections', connectionId);

    try {
      const targetUser = allProfiles.find(p => p.userId === targetUserId);
      const newConn: Connection = {
        connectionId,
        fromUserId: userProfile.userId,
        toUserId: targetUserId,
        status: 'pending',
        fromUserName: userProfile.displayName,
        fromUserHandle: userProfile.handle,
        fromUserHeadline: userProfile.headline,
        fromUserPhoto: userProfile.photoURL,
        toUserName: targetUser?.displayName,
        toUserHandle: targetUser?.handle,
        toUserHeadline: targetUser?.headline,
        toUserPhoto: targetUser?.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(connRef, newConn);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `connections/${connectionId}`);
    }
  };

  // Accept a connection request
  const handleAcceptConnect = async (fromUserId: string) => {
    if (!currentUser) return;
    const connectionId = `${fromUserId}_${currentUser.uid}`;
    const connRef = doc(db, 'connections', connectionId);

    try {
      await updateDoc(connRef, {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `connections/${connectionId}`);
    }
  };

  // Decline a connection request
  const handleDeclineConnect = async (fromUserId: string) => {
    if (!currentUser) return;
    const connectionId = `${fromUserId}_${currentUser.uid}`;
    const connRef = doc(db, 'connections', connectionId);

    try {
      await updateDoc(connRef, {
        status: 'declined',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `connections/${connectionId}`);
    }
  };

  // Open an organization group chat
  const handleOpenOrgChat = async (org: Organization) => {
    const orgConvId = `conv_${org.orgId}`;
    const convRef = doc(db, 'conversations', orgConvId);

    try {
      const snap = await getDoc(convRef);
      if (!snap.exists() && userProfile) {
        const newOrgConv: Conversation = {
          conversationId: orgConvId,
          type: 'organization',
          orgId: org.orgId,
          title: org.name,
          description: org.description,
          lastMessage: `Welcome to ${org.name}!`,
          lastMessageSenderId: 'system',
          lastMessageSenderName: 'TelePro Bot',
          lastMessageTime: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(convRef, newOrgConv);
      }
      setActiveConversationId(orgConvId);
      setIsOrgDirectoryOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${orgConvId}`);
    }
  };

  // Join an organization
  const handleJoinOrg = async (org: Organization) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!joinedOrgIds.includes(org.orgId)) {
      setJoinedOrgIds(prev => [...prev, org.orgId]);
    }
    handleOpenOrgChat(org);
  };

  // Open profile modal by ID
  const handleOpenProfileById = async (userId: string) => {
    if (userProfile && userId === userProfile.userId) {
      setViewingProfile(userProfile);
      return;
    }

    const found = allProfiles.find(p => p.userId === userId);
    if (found) {
      setViewingProfile(found);
    } else {
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (snap.exists()) {
          setViewingProfile(snap.data() as UserProfile);
        }
      } catch {
        // Fallback
      }
    }
  };

  const pendingRequestsCount = connections.filter(c => c.status === 'pending').length;

  return (
    <div className="flex h-screen w-full bg-[#0e1621] text-white overflow-hidden font-sans">
      {/* Telegram Sidebar */}
      <div
        className={`${
          activeConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 h-full flex-shrink-0 z-20`}
      >
        <TelegramSidebar
          conversations={allConversations}
          activeConversationId={activeConversationId}
          currentUser={
            userProfile || {
              userId: 'guest',
              handle: 'guest',
              displayName: 'Guest User',
              email: ''
            }
          }
          organizations={organizations}
          onSelectConversation={id => setActiveConversationId(id)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenOrgDirectory={() => setIsOrgDirectoryOpen(true)}
          onOpenNewDirectChat={() => setIsNewDirectChatOpen(true)}
        />
      </div>

      {/* Main Telegram Chat View or Empty State */}
      <div
        className={`${
          activeConversationId ? 'flex' : 'hidden md:flex'
        } flex-1 h-full flex-col z-10`}
      >
        {activeConversation ? (
          <TelegramChatView
            conversation={activeConversation}
            messages={messages}
            currentUser={
              userProfile || {
                userId: 'guest',
                handle: 'guest',
                displayName: 'Guest User',
                email: ''
              }
            }
            onSendMessage={handleSendMessage}
            onOpenProfile={handleOpenProfileById}
            onBackMobile={() => setActiveConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0e1621] select-none">
            <div className="w-20 h-20 rounded-3xl bg-[#17212b] border border-gray-800 flex items-center justify-center text-blue-400 mb-4 shadow-xl">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Select a Chat or Channel</h2>
            <p className="text-xs text-gray-400 max-w-sm mb-6">
              Join live community discussions or search any member by @handle to start messaging.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveConversationId('channel_general_network')}
                className="px-4 py-2 bg-[#2481cc] hover:bg-[#1f70b3] rounded-full text-xs font-semibold text-white shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Join General Network</span>
              </button>
              <button
                onClick={() => setIsNewDirectChatOpen(true)}
                className="px-4 py-2 bg-[#242f3d] hover:bg-[#2e3c4e] rounded-full text-xs font-semibold text-blue-300 border border-blue-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <AtSign className="w-4 h-4" />
                <span>Find by @Handle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Navigation Drawer */}
      {userProfile && (
        <TelegramDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentUser={userProfile}
          onOpenMyProfile={() => setViewingProfile(userProfile)}
          onOpenConnections={() => setIsConnectionsModalOpen(true)}
          onOpenOrgDirectory={() => setIsOrgDirectoryOpen(true)}
          onOpenNewDirectChat={() => setIsNewDirectChatOpen(true)}
          onSignOut={signOutUser}
          pendingRequestsCount={pendingRequestsCount}
        />
      )}

      {/* User LinkedIn Resume Profile Modal */}
      {viewingProfile && (
        <UserProfileModal
          profile={viewingProfile}
          currentUser={
            userProfile || {
              userId: 'guest',
              handle: 'guest',
              displayName: 'Guest',
              email: ''
            }
          }
          connectionStatus={
            connections.some(c => c.toUserId === viewingProfile.userId && c.status === 'accepted')
              ? 'connected'
              : connections.some(c => c.toUserId === viewingProfile.userId && c.status === 'pending')
              ? 'pending_sent'
              : connections.some(c => c.fromUserId === viewingProfile.userId && c.status === 'pending')
              ? 'pending_received'
              : 'none'
          }
          onClose={() => setViewingProfile(null)}
          onSendConnect={handleSendConnect}
          onAcceptConnect={handleAcceptConnect}
          onStartChat={handleStartDirectChat}
          onSaveProfile={updateProfileData}
        />
      )}

      {/* Organizations Directory Modal */}
      {isOrgDirectoryOpen && (
        <OrganizationsDirectoryModal
          organizations={organizations}
          joinedOrgIds={joinedOrgIds}
          currentUser={
            userProfile || {
              userId: 'guest',
              handle: 'guest',
              displayName: 'Guest',
              email: ''
            }
          }
          onClose={() => setIsOrgDirectoryOpen(false)}
          onJoinOrg={handleJoinOrg}
          onOpenOrgChat={handleOpenOrgChat}
          onCreateOrg={async newOrg => {
            if (!userProfile) return;
            const orgId = 'org_' + Math.random().toString(36).substring(7);
            const created: Organization = {
              ...newOrg,
              orgId,
              ownerId: userProfile.userId,
              memberCount: 1,
              isPublic: true,
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(doc(db, 'organizations', orgId), created);
              setOrganizations(prev => [...prev, created]);
              handleJoinOrg(created);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `organizations/${orgId}`);
            }
          }}
        />
      )}

      {/* Find Members / New Direct Chat Modal */}
      {isNewDirectChatOpen && (
        <NewDirectChatModal
          currentUser={
            userProfile || {
              userId: 'guest',
              handle: 'guest',
              displayName: 'Guest',
              email: ''
            }
          }
          availableProfiles={allProfiles}
          onClose={() => setIsNewDirectChatOpen(false)}
          onStartChat={handleStartDirectChat}
          onViewResume={p => setViewingProfile(p)}
          onSendConnect={handleSendConnect}
          connectedUserIds={connections.filter(c => c.status === 'accepted').map(c => c.toUserId)}
        />
      )}

      {/* Connections Modal */}
      {isConnectionsModalOpen && (
        <ConnectionsModal
          connections={connections}
          allProfiles={allProfiles}
          currentUser={
            userProfile || {
              userId: 'guest',
              handle: 'guest',
              displayName: 'Guest',
              email: ''
            }
          }
          onClose={() => setIsConnectionsModalOpen(false)}
          onAccept={handleAcceptConnect}
          onDecline={handleDeclineConnect}
          onOpenProfile={handleOpenProfileById}
          onStartChat={handleStartDirectChat}
        />
      )}

      {/* Authentication Modal (Google / Gmail / Email) */}
      <AuthModal
        isOpen={!currentUser && !loading ? true : isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
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
