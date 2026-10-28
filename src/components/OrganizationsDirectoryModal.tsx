import React, { useState } from 'react';
import {
  X,
  Search,
  Building2,
  Users,
  Plus,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Organization, OrgCategory, UserProfile } from '../types';

interface OrganizationsDirectoryModalProps {
  organizations: Organization[];
  joinedOrgIds: string[];
  currentUser: UserProfile;
  onClose: () => void;
  onJoinOrg: (org: Organization) => void;
  onOpenOrgChat: (org: Organization) => void;
  onCreateOrg: (newOrg: { name: string; category: OrgCategory; description: string; website: string }) => void;
}

const CATEGORIES: Array<OrgCategory | 'All'> = ['All', 'Tech', 'Startup', 'AI & ML', 'Design', 'Finance', 'Product'];

export const OrganizationsDirectoryModal: React.FC<OrganizationsDirectoryModalProps> = ({
  organizations,
  joinedOrgIds,
  currentUser,
  onClose,
  onJoinOrg,
  onOpenOrgChat,
  onCreateOrg
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OrgCategory | 'All'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCategory, setNewOrgCategory] = useState<OrgCategory>('Tech');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [newOrgWebsite, setNewOrgWebsite] = useState('');

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || org.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    onCreateOrg({
      name: newOrgName.trim(),
      category: newOrgCategory,
      description: newOrgDesc.trim(),
      website: newOrgWebsite.trim()
    });

    setNewOrgName('');
    setNewOrgDesc('');
    setNewOrgWebsite('');
    setShowCreateModal(false);
  };

  const getCategoryColor = (cat: OrgCategory) => {
    switch (cat) {
      case 'Tech':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Startup':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'AI & ML':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Design':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'Finance':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Product':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#242f3d] border border-[#17212b] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl text-white relative max-h-[90vh] flex flex-col my-auto">
        {/* Top Header */}
        <div className="p-6 border-b border-[#17212b] flex items-center justify-between bg-[#17212b]/80">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2481cc]" />
              <h2 className="text-xl font-bold text-white tracking-tight">Professional Organizations & Groups</h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Discover industry networks, join tech channels, and collaborate via Telegram chat & Google Meet.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-full text-xs font-semibold shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Organization</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-6 pb-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Look up organizations by name, category, or industry keywords (e.g. AI, Startup, Quant)..."
              className="w-full bg-[#17212b] text-sm text-white rounded-xl pl-10 pr-4 py-2.5 border border-gray-700 focus:outline-none focus:border-[#2481cc] placeholder:text-gray-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#2481cc] text-white shadow'
                    : 'bg-[#17212b] text-gray-300 hover:bg-gray-800 border border-gray-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {filteredOrgs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrgs.map(org => {
                const isMember = joinedOrgIds.includes(org.orgId);
                return (
                  <div
                    key={org.orgId}
                    className="bg-[#17212b] rounded-2xl p-5 border border-gray-800/80 hover:border-gray-700 transition flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Org Header */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-13 h-13 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-lg text-blue-400">
                              {org.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white text-base leading-snug truncate">{org.name}</h3>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(
                                org.category
                              )}`}
                            >
                              {org.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-blue-400" />
                              {(org.memberCount || 1).toLocaleString()} professionals
                            </span>
                            {org.website && (
                              <a
                                href={org.website}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-blue-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Website</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-300 mt-3 leading-relaxed line-clamp-2">
                        {org.description || 'Professional collaboration hub on TelePro.'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                      {isMember ? (
                        <>
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Member
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onOpenOrgChat(org);
                                onClose();
                              }}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Open Chat</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] text-gray-400">Open to join</span>
                          <button
                            onClick={() => onJoinOrg(org)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
                          >
                            <span>Join Organization</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-300">No organizations found</p>
              <p className="text-xs text-gray-500 mt-1">Try another search term or create a new organization above.</p>
            </div>
          )}
        </div>

        {/* Create Organization Modal Overlay */}
        {showCreateModal && (
          <div className="absolute inset-0 bg-[#17212b]/95 backdrop-blur-md z-30 p-6 flex flex-col justify-center animate-in fade-in duration-150">
            <div className="max-w-md w-full mx-auto bg-[#242f3d] p-6 rounded-2xl border border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white">Create New Organization</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-gray-300 block mb-1 font-medium">Organization / Company Name</label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={e => setNewOrgName(e.target.value)}
                    placeholder="e.g. NextGen Web3 Founders Guild"
                    className="w-full bg-[#17212b] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-medium">Industry Category</label>
                  <select
                    value={newOrgCategory}
                    onChange={e => setNewOrgCategory(e.target.value as OrgCategory)}
                    className="w-full bg-[#17212b] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={newOrgDesc}
                    onChange={e => setNewOrgDesc(e.target.value)}
                    placeholder="Describe what your organization is focused on, topics discussed, and who should join..."
                    className="w-full bg-[#17212b] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-medium">Official Website (optional)</label>
                  <input
                    type="url"
                    value={newOrgWebsite}
                    onChange={e => setNewOrgWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#17212b] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-[#2481cc]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2481cc] hover:bg-[#1f70b3] rounded-lg text-xs font-semibold text-white shadow"
                  >
                    Create & Start Group Chat
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
