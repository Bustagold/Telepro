import { Organization, Conversation } from '../types';

export const INITIAL_SEED_ORGANIZATIONS: Omit<Organization, 'orgId'>[] = [
  {
    name: 'Tech Founders & CTOs Network',
    slug: 'tech-founders-ctos',
    category: 'Startup',
    description: 'A curated professional network of high-growth tech founders, CTOs, and technical leaders building global scalable architectures.',
    website: 'https://foundershub.example.com',
    ownerId: 'system_admin',
    memberCount: 1420,
    isPublic: true,
    logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Silicon Valley AI & Agent Systems',
    slug: 'sv-ai-agent-systems',
    category: 'AI & ML',
    description: 'Engineering forum discussing LLM orchestration, multimodal agents, vector databases, and real-time distributed inference pipelines.',
    website: 'https://aiagents.example.org',
    ownerId: 'system_admin',
    memberCount: 2890,
    isPublic: true,
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fintech Engineering & Quant Guild',
    slug: 'fintech-quant-guild',
    category: 'Finance',
    description: 'High-frequency trading engineers, payments infrastructure architects, and smart contract protocol developers.',
    website: 'https://quantfin.example.com',
    ownerId: 'system_admin',
    memberCount: 840,
    isPublic: true,
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Design Systems & Product Craft',
    slug: 'design-systems-craft',
    category: 'Design',
    description: 'World-class Principal UI/UX Designers and Design Technologists building accessible, high-performance design systems for web and mobile.',
    website: 'https://craftdesign.example.com',
    ownerId: 'system_admin',
    memberCount: 1120,
    isPublic: true,
    logoUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Distributed Systems & Cloud Scale',
    slug: 'distributed-systems-cloud',
    category: 'Tech',
    description: 'Kubernetes operators, edge computing specialists, and Site Reliability Engineers running 99.999% SLA microservices.',
    website: 'https://cloudsystems.example.com',
    ownerId: 'system_admin',
    memberCount: 1650,
    isPublic: true,
    logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_COMMUNITY_CHANNELS: Conversation[] = [
  {
    conversationId: 'channel_general_network',
    type: 'channel',
    channelSlug: 'general-network',
    title: '🌐 General Network',
    description: 'Main lobby for all TelePro members across all disciplines. Introduce yourself and share professional updates.',
    lastMessage: 'Welcome to TelePro! Connect with real peers, search @handles, and join discussions.',
    lastMessageSenderId: 'system',
    lastMessageSenderName: 'TelePro Bot',
    lastMessageTime: new Date().toISOString(),
    isPublic: true,
    memberCount: 1048
  },
  {
    conversationId: 'channel_tech_engineering',
    type: 'channel',
    channelSlug: 'tech-engineering',
    title: '⚡ Tech & Engineering',
    description: 'Distributed systems, full-stack development, cloud architecture, and software engineering craft.',
    lastMessage: 'Discussing low-latency messaging patterns and WebSocket vs Firestore streaming.',
    lastMessageSenderId: 'system',
    lastMessageSenderName: 'TelePro Bot',
    lastMessageTime: new Date().toISOString(),
    isPublic: true,
    memberCount: 890
  },
  {
    conversationId: 'channel_ai_agents',
    type: 'channel',
    channelSlug: 'ai-agents',
    title: '🧠 AI & Agent Systems',
    description: 'LLM agents, inference optimization, vector search, RAG pipelines, and generative applications.',
    lastMessage: 'Share your latest breakthroughs in reasoning models and autonomous agent workflows.',
    lastMessageSenderId: 'system',
    lastMessageSenderName: 'TelePro Bot',
    lastMessageTime: new Date().toISOString(),
    isPublic: true,
    memberCount: 760
  },
  {
    conversationId: 'channel_startups_founders',
    type: 'channel',
    channelSlug: 'startups-founders',
    title: '🚀 Startups & Founders',
    description: 'Product launches, fundraising stories, go-to-market strategies, and founder networking.',
    lastMessage: 'Looking for co-founders or sharing early traction? Post your story here.',
    lastMessageSenderId: 'system',
    lastMessageSenderName: 'TelePro Bot',
    lastMessageTime: new Date().toISOString(),
    isPublic: true,
    memberCount: 620
  },
  {
    conversationId: 'channel_product_design',
    type: 'channel',
    channelSlug: 'product-design',
    title: '🎨 Product & Design Craft',
    description: 'UI/UX systems, user research, product strategy, Figma components, and micro-interactions.',
    lastMessage: 'Feedback exchange: share your designs or wireframes for critique.',
    lastMessageSenderId: 'system',
    lastMessageSenderName: 'TelePro Bot',
    lastMessageTime: new Date().toISOString(),
    isPublic: true,
    memberCount: 540
  },
  {
    conversationId: 'channel_job_opportunities',
    type: 'channel',
    channelSlug: 'job-opportunities',
    title: '💼 Job Opportunities & Hiring',
    description: 'Direct referrals, active job openings, and talent discovery across high-growth companies.',
    lastMessage: 'Post your open roles or your professional background if open to new opportunities.',
    lastMessageSenderId: 'system',
    lastMessageSenderName: 'TelePro Bot',
    lastMessageTime: new Date().toISOString(),
    isPublic: true,
    memberCount: 915
  }
];
