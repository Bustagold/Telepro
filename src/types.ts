export interface UserProfile {
  userId: string;
  handle: string; // telegram handle e.g. "alex_chen"
  displayName: string;
  email: string;
  photoURL?: string;
  headline?: string; // e.g. "Staff AI Engineer | Ex-Google | Distributed Systems"
  bio?: string;
  company?: string;
  location?: string;
  skills?: string; // comma-separated or formatted string
  experience?: string; // rich resume text or JSON string
  education?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Connection {
  connectionId: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  fromUserName?: string;
  fromUserHandle?: string;
  fromUserHeadline?: string;
  createdAt?: string;
}

export type OrgCategory = 'Tech' | 'Startup' | 'AI & ML' | 'Design' | 'Finance' | 'Product' | 'General';

export interface Organization {
  orgId: string;
  name: string;
  slug?: string;
  category: OrgCategory;
  description?: string;
  logoUrl?: string;
  website?: string;
  ownerId: string;
  memberCount?: number;
  isPublic?: boolean;
  createdAt?: string;
}

export interface OrgMember {
  memberId: string;
  orgId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'pending';
  joinedAt?: string;
}

export interface Conversation {
  conversationId: string;
  type: 'direct' | 'organization';
  orgId?: string;
  title?: string;
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageTime?: string;
  participants?: string[];
  participantHandles?: { [userId: string]: string };
  participantNames?: { [userId: string]: string };
  participantPhotos?: { [userId: string]: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderHandle: string;
  senderPhoto?: string;
  text: string;
  type: 'text' | 'meet_invite' | 'system' | 'connect_card';
  meetUrl?: string;
  meetRoomCode?: string;
  createdAt: string;
}

export interface Meeting {
  meetingId: string;
  roomCode: string; // e.g. "tele-meet-842"
  title: string;
  conversationId: string;
  hostId: string;
  hostName: string;
  status: 'active' | 'ended';
  participantsCount?: number;
  createdAt?: string;
}
