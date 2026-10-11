import { Organization, UserProfile } from '../types';

export const INITIAL_SEED_ORGANIZATIONS: Omit<Organization, 'orgId'>[] = [
  {
    name: 'Tech Founders & CTOs Network',
    slug: 'tech-founders-ctos',
    category: 'Startup',
    description: 'A curated professional network of high-growth tech founders, CTOs, and technical leaders building global scalable architectures and raising Series A+.',
    website: 'https://foundershub.example.com',
    ownerId: 'seed_alex_cto',
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
    ownerId: 'seed_elena_ai',
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
    ownerId: 'seed_marcus_fin',
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
    ownerId: 'seed_clara_design',
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
    ownerId: 'seed_david_cloud',
    memberCount: 1650,
    isPublic: true,
    logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SEED_PROFILES: UserProfile[] = [
  {
    userId: 'seed_alex_cto',
    handle: 'alex_cto',
    displayName: 'Alexandre Mercer',
    email: 'alex.mercer@techhub.io',
    headline: 'CTO @ CloudMatrix | ex-Uber Staff Infra | Distributed Systems',
    company: 'CloudMatrix Inc.',
    location: 'San Francisco, CA',
    bio: '14+ years designing high-throughput transaction backends and multi-region Kubernetes clusters. Passionate about developer tooling, open source, and high-performance teams.',
    skills: 'Distributed Systems, Go, Rust, Kubernetes, Architecture, High-Scale SQL, Mentorship',
    experience: `• CTO & Co-Founder — CloudMatrix (2022 - Present)
Leading 42 engineers building serverless event pipelines processing 10B+ events/day.

• Staff Infrastructure Engineer — Uber (2018 - 2022)
Spearheaded core edge routing rewrite saving $14M annually in compute costs.

• Senior Backend Engineer — Stripe (2015 - 2018)
Core member of banking integrations team.`,
    education: 'M.S. in Computer Science — Stanford University (2015)\nB.S. in Electrical Engineering & CS — UC Berkeley (2013)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    userId: 'seed_elena_ai',
    handle: 'elena_ai',
    displayName: 'Dr. Elena Rostova',
    email: 'elena.rostova@nexuslabs.ai',
    headline: 'Principal AI Research Scientist @ NexusLabs | ex-Google Brain',
    company: 'NexusLabs AI',
    location: 'Zurich / Remote',
    bio: 'PhD in Machine Learning. Author of 12 peer-reviewed papers on sparse attention mechanisms, generative reasoning models, and agentic workflows.',
    skills: 'PyTorch, Transformers, Agentic AI, CUDA Optimization, Vector Search, Python, Research Leadership',
    experience: `• Principal Research Scientist — NexusLabs (2023 - Present)
Architecting multimodal foundation models for autonomous code synthesis.

• Staff Research Engineer — Google Brain (2019 - 2023)
Contributed to state-of-the-art transformer pretraining algorithms and retrieval grounding.`,
    education: 'Ph.D. in Computer Science & Artificial Intelligence — ETH Zürich (2019)\nB.S. in Mathematics — Oxford University (2015)',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  },
  {
    userId: 'seed_clara_design',
    handle: 'clara_design',
    displayName: 'Clara Beaumont',
    email: 'clara.design@craftstudio.io',
    headline: 'VP of Product Design @ CraftStudio | Ex-Airbnb Design Lead',
    company: 'CraftStudio',
    location: 'New York, NY',
    bio: 'Obsessed with micro-interactions, typography, and intuitive UX for complex enterprise systems. Mentor for junior product designers.',
    skills: 'Design Systems, Figma, Mobile UX, User Research, Prototyping, Design Leadership',
    experience: `• VP of Product Design — CraftStudio (2021 - Present)
Leading 18 product and brand designers building next-gen collaboration workspaces.

• Lead Product Designer — Airbnb (2017 - 2021)
Redesigned host dashboard experience serving 4M+ hosts globally.`,
    education: 'B.F.A. in Graphic & Interactive Design — Rhode Island School of Design (RISD) (2016)',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
  }
];
