import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { githubService } from '../services/githubService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { 
  Github, 
  Users, 
  Code2, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  FolderGit2,
  Calendar,
  Briefcase,
  Star,
  GitFork,
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const GitHubAnalytics = () => {
  const { refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await githubService.getMyStats();
      if (data) {
        setStats(data);
        if (data.githubUsername) {
          setUsername(data.githubUsername);
        }
      }
    } catch (e) {
      console.warn('No existing GitHub stats found, waiting for user input.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    let val = e.target.value;
    if (val.includes('github.com/')) {
      val = val.substring(val.indexOf('github.com/') + 'github.com/'.length);
    }
    if (val.startsWith('@')) {
      val = val.substring(1);
    }
    if (val.includes('/')) {
      val = val.split('/')[0];
    }
    setUsername(val);
  };

  const handleFetch = async (e, force = false, overrideUsername = null) => {
    if (e) e.preventDefault();
    const target = (overrideUsername || username || '').trim();
    if (!target) return;

    setSyncing(true);
    setMessage('');
    setError('');

    try {
      const data = force 
        ? await githubService.forceRefresh(target)
        : await githubService.fetchStats(target);
      setStats(data);
      setUsername(data.githubUsername || target);
      if (refreshUser) {
        await refreshUser();
      }
      setMessage(`Successfully synchronized official GitHub data for @${data.githubUsername}!`);
      setTimeout(() => setMessage(''), 4500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch GitHub profile. Please verify the username.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching real-time GitHub telemetry..." />;
  }

  const isLinked = Boolean(stats && stats.githubUsername);

  // Format language distribution for Recharts
  const languageChartData = stats?.languageDistribution && Object.keys(stats.languageDistribution).length > 0
    ? Object.entries(stats.languageDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Sync Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <Github className="w-4 h-4" />
            <span>Official GitHub REST API Integration</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            GitHub Developer Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronizes official public repositories, followers, following, stars, bio, and language distributions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/projects"
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition shrink-0 active:scale-95"
          >
            <Briefcase className="w-3.5 h-3.5 text-brand-400" />
            <span>View Projects</span>
          </Link>

          <form onSubmit={(e) => handleFetch(e, false)} className="flex items-center space-x-2">
            <div className="relative flex-1 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Github className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="e.g. mskapase370822"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={syncing || !username.trim()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition shrink-0 disabled:opacity-50 active:scale-95 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>
            {isLinked && (
              <button
                type="button"
                onClick={(e) => handleFetch(e, true)}
                disabled={syncing}
                title="Bypass cache and force-fetch live data from api.github.com"
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition shrink-0 disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Force Refresh</span>
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLinked ? (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Public Repositories"
              value={stats.repositories || 0}
              subtitle="Open source codebases"
              icon={FolderGit2}
              color="brand"
            />
            <StatCard
              title="Followers"
              value={(stats.followers || 0).toLocaleString()}
              subtitle="Community followers"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Following"
              value={(stats.following || 0).toLocaleString()}
              subtitle="Engineers followed"
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Total Stargazers"
              value={(stats.stars || 0).toLocaleString()}
              subtitle="Stars across repos"
              icon={Star}
              color="amber"
            />
            <StatCard
              title="Dominant Language"
              value={stats.topLanguage || 'None'}
              subtitle="Top detected stack"
              icon={Code2}
              color="emerald"
            />
          </div>

          {/* Charts & Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Language Breakdown Bar Chart */}
            <Card
              className="lg:col-span-7"
              title="Repository Tech Stack & Languages"
              subtitle="Calculated dynamically across active public repositories"
              action={
                stats.topLanguage && (
                  <Badge variant="brand">
                    Top: {stats.topLanguage}
                  </Badge>
                )
              }
            >
              {languageChartData.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={languageChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} 
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Score / Repos">
                        {languageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={Code2}
                  title="No language data detected"
                  description="Your public repositories do not have detected languages yet."
                />
              )}
            </Card>

            {/* Profile Overview Card */}
            <Card
              className="lg:col-span-5 flex flex-col justify-between"
              title="Profile Overview"
              subtitle="Live account data from official GitHub API"
            >
              <div>
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl my-2">
                  <div className="flex items-start space-x-3.5">
                    {stats.avatarUrl ? (
                      <img 
                        src={stats.avatarUrl} 
                        alt={stats.githubUsername} 
                        className="w-14 h-14 rounded-xl border border-slate-700 object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="p-3.5 bg-slate-800 rounded-xl text-white">
                        <Github className="w-7 h-7" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-bold text-white truncate">
                        {stats.name || stats.githubUsername}
                      </div>
                      <div className="text-xs text-brand-400 font-mono">@{stats.githubUsername}</div>
                      
                      {(stats.company || stats.location) && (
                        <div className="mt-2 space-y-1">
                          {stats.company && (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{stats.company}</span>
                            </div>
                          )}
                          {stats.location && (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{stats.location}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {stats.bio && (
                    <div className="mt-3.5 p-2.5 bg-slate-800/70 border border-slate-700/60 rounded-lg text-xs text-slate-300 italic">
                      "{stats.bio}"
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Public Repositories</span>
                      <span className="text-white font-semibold">{stats.repositories || 0}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Followers</span>
                      <span className="text-white font-semibold">{(stats.followers || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Following</span>
                      <span className="text-white font-semibold">{(stats.following || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Total Stargazers</span>
                      <span className="text-amber-400 font-semibold">{(stats.stars || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Total Repository Forks</span>
                      <span className="text-white font-semibold">{(stats.totalForks || 0).toLocaleString()}</span>
                    </div>
                    {stats.publicGists !== undefined && stats.publicGists !== null && (
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span>Public Gists</span>
                        <span className="text-white font-semibold">{stats.publicGists}</span>
                      </div>
                    )}
                    {stats.accountCreatedAt && (
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Member Since</span>
                        </span>
                        <span className="text-white font-semibold">
                          {new Date(stats.accountCreatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span>Last Synchronized</span>
                      <span className="text-white font-semibold">
                        {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>

                {languageChartData.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-slate-400 block mb-2">Detected Tech Stack:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {languageChartData.map((item, idx) => (
                        <Badge key={idx} variant="brand" size="sm">
                          {item.name}: {item.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <a
                  href={stats.profileUrl || `https://github.com/${stats.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <span>Open Official GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto text-white shadow-inner">
            <Github className="w-8 h-8 text-brand-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Connect Official GitHub Profile
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Synchronize official public repositories, followers, stars, forks, and language distribution directly from GitHub REST APIs.
            </p>
          </div>

          <form onSubmit={(e) => handleFetch(e, false)} className="space-y-3 max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Github className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter username (e.g. mskapase370822)"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={syncing || !username.trim()}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Fetching from GitHub REST API...' : 'Synchronize Profile'}</span>
            </button>
          </form>

          {/* Quick test profile chips */}
          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-500 block mb-2.5 font-medium">Quick Test Profiles:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['mskapase370822', 'torvalds', 'octocat'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setUsername(preset);
                    handleFetch(null, false, preset);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-mono transition active:scale-95"
                >
                  @{preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubAnalytics;
