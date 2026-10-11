import React, { useState } from 'react';
import {
  X,
  Briefcase,
  GraduationCap,
  MapPin,
  Building,
  UserPlus,
  Check,
  MessageCircle,
  Video,
  Copy,
  Edit3,
  ThumbsUp,
  Share2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  profile: UserProfile;
  currentUser: UserProfile;
  connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  onClose: () => void;
  onSendConnect?: (targetUserId: string) => void;
  onAcceptConnect?: (targetUserId: string) => void;
  onStartChat?: (profile: UserProfile) => void;
  onStartMeet?: (profile: UserProfile) => void;
  onSaveProfile?: (updatedData: Partial<UserProfile>) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  currentUser,
  connectionStatus = 'none',
  onClose,
  onSendConnect,
  onAcceptConnect,
  onStartChat,
  onStartMeet,
  onSaveProfile
}) => {
  const isOwnProfile = profile.userId === currentUser.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    headline: profile.headline || '',
    company: profile.company || '',
    location: profile.location || '',
    bio: profile.bio || '',
    skills: profile.skills || '',
    experience: profile.experience || '',
    education: profile.education || ''
  });

  // Endorsements counter mock state
  const [endorsedSkills, setEndorsedSkills] = useState<{ [skill: string]: number }>({
    'Architecture': 42,
    'Distributed Systems': 38,
    'Cloud Computing': 29,
    'Go': 24,
    'TypeScript': 19
  });

  const handleCopyTelegramLink = () => {
    navigator.clipboard?.writeText?.(`https://t.me/${profile.handle}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  const handleEndorseSkill = (skill: string) => {
    setEndorsedSkills(prev => ({
      ...prev,
      [skill]: (prev[skill] || 10) + 1
    }));
  };

  const handleSave = () => {
    if (onSaveProfile) {
      onSaveProfile(formData);
    }
    setIsEditing(false);
  };

  const skillsList = (isEditing ? formData.skills : (profile.skills || ''))
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#242f3d] border border-[#17212b] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-white relative max-h-[90vh] flex flex-col my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Banner (LinkedIn Style) */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-[#1d3557] via-[#2b5278] to-[#457b9d] relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-xs font-medium text-white transition backdrop-blur-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Resume</span>
            </button>
          )}
        </div>

        {/* Profile Header Info */}
        <div className="px-6 pb-6 pt-0 relative flex-1 overflow-y-auto">
          {/* Avatar and Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#242f3d] bg-gray-700 overflow-hidden shadow-xl">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-4xl font-bold">
                    {profile.displayName?.charAt(0) || 'P'}
                  </div>
                )}
              </div>
              <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#242f3d]"></span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {!isOwnProfile ? (
                <>
                  {connectionStatus === 'none' && onSendConnect && (
                    <button
                      onClick={() => onSendConnect(profile.userId)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#2481cc] hover:bg-[#1f70b3] text-white rounded-full text-xs font-semibold shadow transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  )}

                  {connectionStatus === 'pending_sent' && (
                    <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
                      <span>Request Sent</span>
                    </span>
                  )}

                  {connectionStatus === 'pending_received' && onAcceptConnect && (
                    <button
                      onClick={() => onAcceptConnect(profile.userId)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Connect</span>
                    </button>
                  )}

                  {connectionStatus === 'connected' && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 rounded-full text-xs font-medium">
                      <Check className="w-3.5 h-3.5" /> 1st Degree
                    </span>
                  )}

                  {onStartChat && (
                    <button
                      onClick={() => {
                        onStartChat(profile);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#17212b] hover:bg-[#1e2c3a] border border-[#2b5278]/40 text-blue-300 rounded-full text-xs font-semibold transition"
                    >
                      <MessageCircle className="w-4 h-4 text-[#2481cc]" />
                      <span>Message</span>
                    </button>
                  )}

                  {onStartMeet && (
                    <button
                      onClick={() => {
                        onStartMeet(profile);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-semibold shadow transition"
                    >
                      <Video className="w-4 h-4" />
                      <span>Start Meet</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleCopyTelegramLink}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#17212b] hover:bg-[#1e2c3a] border border-[#2b5278] text-gray-200 rounded-full text-xs font-medium transition"
                >
                  {copiedHandle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{copiedHandle ? 'Link Copied' : 'Share Profile'}</span>
                </button>
              )}
            </div>
          </div>

          {/* User Names & Telegram ID */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-white tracking-tight">{profile.displayName}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#2481cc]/20 text-[#64b5f6] border border-[#2481cc]/40">
                @{profile.handle}
              </span>
            </div>

            <p className="text-base text-gray-200 font-medium mt-1 leading-snug">
              {profile.headline || 'Technology Professional'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2.5">
              {profile.company && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-blue-400 font-mono">
                <ExternalLink className="w-3 h-3" />
                <button onClick={handleCopyTelegramLink} className="hover:underline">
                  t.me/{profile.handle}
                </button>
              </div>
            </div>
          </div>

          {/* Edit Mode Panel */}
          {isEditing ? (
            <div className="space-y-4 bg-[#17212b] p-5 rounded-2xl border border-blue-900/40">
              <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                <h3 className="font-semibold text-sm text-blue-400">Edit Your Professional Profile & Resume</h3>
                <span className="text-xs text-gray-400">LinkedIn & Telegram Sync</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Current Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-gray-400 block mb-1">Professional Headline (LinkedIn Style)</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={e => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Lead Distributed Architect | ex-Google | Building AI Agents"
                  className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-xs">
                <label className="text-gray-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-xs">
                <label className="text-gray-400 block mb-1">About / Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-xs">
                <label className="text-gray-400 block mb-1">Work Experience & Timeline</label>
                <textarea
                  rows={4}
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="• Role — Company (Year - Present)&#10;Key achievements and technical responsibilities"
                  className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="text-xs">
                <label className="text-gray-400 block mb-1">Education</label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={e => setFormData({ ...formData, education: e.target.value })}
                  placeholder="Degree — University (Year)"
                  className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-xs">
                <label className="text-gray-400 block mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Distributed Systems, Go, Kubernetes, TypeScript, Strategy"
                  className="w-full bg-[#242f3d] rounded-lg px-3 py-2 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-semibold text-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#2481cc] hover:bg-[#1f70b3] rounded-lg text-xs font-semibold text-white transition shadow"
                >
                  Save Resume
                </button>
              </div>
            </div>
          ) : (
            /* View Resume Mode */
            <div className="space-y-6">
              {/* About Section */}
              <div className="bg-[#17212b] p-4 rounded-xl border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> About
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {profile.bio || 'Professional on TelePro collaborating on modern engineering, startups, and technology.'}
                </p>
              </div>

              {/* Experience Timeline */}
              <div className="bg-[#17212b] p-4 rounded-xl border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" /> Experience
                </h3>
                {profile.experience ? (
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                    {profile.experience}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No experience records added yet.</p>
                )}
              </div>

              {/* Education */}
              <div className="bg-[#17212b] p-4 rounded-xl border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" /> Education
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {profile.education || 'Degree in Computer Science & Engineering'}
                </p>
              </div>

              {/* Skills & Endorsements */}
              <div className="bg-[#17212b] p-4 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-indigo-400" /> Skills & Endorsements
                  </h3>
                  <span className="text-[11px] text-gray-400">Click to endorse</span>
                </div>
                {skillsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map(skill => (
                      <button
                        key={skill}
                        onClick={() => handleEndorseSkill(skill)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242f3d] hover:bg-[#2b5278] border border-gray-700 text-xs text-gray-200 transition"
                      >
                        <span className="font-medium">{skill}</span>
                        <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded-full font-mono group-hover:bg-blue-800">
                          {endorsedSkills[skill] || 12}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No skills listed yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
