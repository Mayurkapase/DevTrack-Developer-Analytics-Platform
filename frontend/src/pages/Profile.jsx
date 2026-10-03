import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Github, 
  CheckCircle2, 
  AlertCircle,
  Save,
  ExternalLink,
  ShieldCheck,
  Edit3
} from 'lucide-react';

const Profile = () => {
  const { user: authUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getCurrentUser();
      setProfile(data);
      setName(data.name || '');
      setGithubUsername(data.githubUsername || '');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Fallback to auth context
      if (authUser) {
        setProfile(authUser);
        setName(authUser.name || '');
        setGithubUsername(authUser.githubUsername || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await updateProfile({ 
        name: name.trim(),
        githubUsername: githubUsername.trim() 
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      setSuccessMsg('Profile updated and GitHub telemetry synchronized in database!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your profile details..." />;
  }

  const formattedJoinedDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Member';

  const githubHandle = profile?.githubUsername;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-brand-500/20 shrink-0">
          {profile?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-center sm:justify-start space-x-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {profile?.role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Software Developer'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>{profile?.email}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center sm:justify-start space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Member since {formattedJoinedDate}</span>
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Details & Update Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Saved Database Details */}
        <Card
          title="Account Details"
          subtitle="Persistent profile records stored in MySQL"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-slate-400 flex items-center space-x-2">
                <User className="w-4 h-4 text-brand-400" />
                <span>Full Name</span>
              </span>
              <span className="text-white font-semibold">{profile?.name}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-slate-400 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>Email Address</span>
              </span>
              <span className="text-white font-mono">{profile?.email}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-slate-400 flex items-center space-x-2">
                <Github className="w-4 h-4 text-brand-400" />
                <span>GitHub Username</span>
              </span>
              {githubHandle ? (
                <a
                  href={`https://github.com/${githubHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300 font-mono flex items-center space-x-1"
                >
                  <span>@{githubHandle}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Badge variant="default" size="sm">Not Synced</Badge>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-slate-400 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>Joined Date</span>
              </span>
              <span className="text-white">{formattedJoinedDate}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authentication Scheme</span>
              </span>
              <span className="text-emerald-400 font-semibold">JWT Bearer Token</span>
            </div>
          </div>
        </Card>

        {/* Right: Update Profile Through API Form */}
        <Card
          title="Update Profile"
          subtitle="Modify your personal information through API"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address <span className="text-slate-500 lowercase">(read-only)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800/80 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                GitHub Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Github className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. mskapase370822"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Saving will automatically synchronize repositories and language telemetry from the GitHub REST API.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
