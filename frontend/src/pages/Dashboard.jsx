import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { githubService } from '../services/githubService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { 
  FolderKanban, 
  Github, 
  CheckCircle2, 
  Clock, 
  CheckSquare, 
  Users, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  Code2,
  Calendar,
  Sparkles,
  Star
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#10b981',
  NOT_STARTED: '#64748b'
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projectSummary, setProjectSummary] = useState(null);
  const [github, setGithub] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [projRes, ghRes] = await Promise.allSettled([
        projectService.getSummary(),
        githubService.getMyStats()
      ]);

      if (projRes.status === 'fulfilled') setProjectSummary(projRes.value);
      if (ghRes.status === 'fulfilled') setGithub(ghRes.value);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling developer project metrics and GitHub telemetry..." />;
  }

  const githubLinked = Boolean(github && github.githubUsername);
  const totalProjects = projectSummary?.totalProjects || 0;
  const activeProjects = projectSummary?.activeProjects || 0;
  const completedProjects = projectSummary?.completedProjects || 0;
  const overallPercentage = projectSummary?.overallCompletionPercentage || 0;
  const recentProjects = projectSummary?.recentProjects || [];

  // Prepare Bar Chart Data: Project Completion Analytics
  const completionChartData = recentProjects.map(p => ({
    name: p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name,
    fullName: p.name,
    completion: p.completionPercentage,
    completedTasks: p.completedTasks,
    totalTasks: p.totalTasks
  }));

  // Prepare Pie Chart Data: Status Distribution
  const rawStatus = projectSummary?.statusDistribution || {};
  const statusPieData = [
    { name: 'In Progress', value: rawStatus['IN_PROGRESS'] || 0, color: STATUS_COLORS.IN_PROGRESS },
    { name: 'Completed', value: rawStatus['COMPLETED'] || 0, color: STATUS_COLORS.COMPLETED },
    { name: 'Not Started', value: rawStatus['NOT_STARTED'] || 0, color: STATUS_COLORS.NOT_STARTED },
  ].filter(d => d.value > 0);

  const languageEntries = github?.languageDistribution 
    ? Object.entries(github.languageDistribution).slice(0, 5) 
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer Progress & Delivery Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track engineering project deliverables, milestone completion rates, and synchronized open-source GitHub velocity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track Projects</span>
          </Link>
          <Link
            to="/github"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95"
          >
            <Github className="w-3.5 h-3.5 text-blue-400" />
            <span>Sync GitHub</span>
          </Link>
        </div>
      </div>

      {/* Onboarding Checklist for Fresh Accounts */}
      {(totalProjects === 0 || !githubLinked) && (
        <div className="bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Workspace Setup Guide</span>
              </div>
              <h2 className="text-lg font-bold text-white">Get started with DevTrack</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete these two simple steps to populate your real developer analytics:
              </p>
            </div>
            <div className="text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 self-start md:self-auto">
              {(githubLinked ? 1 : 0) + (totalProjects > 0 ? 1 : 0)} of 2 Steps Completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: GitHub Sync */}
            <div className={`p-4 rounded-xl border transition ${
              githubLinked 
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    githubLinked ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {githubLinked ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Connect GitHub Profile</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {githubLinked 
                        ? `Connected as @${github.githubUsername} (${github.repositories || 0} repos synced)` 
                        : 'Import public repositories, followers, and language distribution'}
                    </p>
                  </div>
                </div>
                {!githubLinked && (
                  <Link 
                    to="/github" 
                    className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                  >
                    Sync Now
                  </Link>
                )}
              </div>
            </div>

            {/* Step 2: Create Project */}
            <div className={`p-4 rounded-xl border transition ${
              totalProjects > 0 
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    totalProjects > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {totalProjects > 0 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Track Your First Project</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {totalProjects > 0 
                        ? `${totalProjects} project(s) tracked with dynamic completion %` 
                        : 'Create an engineering roadmap with tasks, milestones, and deadlines'}
                    </p>
                  </div>
                </div>
                {totalProjects === 0 && (
                  <Link 
                    to="/projects" 
                    className="shrink-0 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    Create Project
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards (Interactive, click redirects to module) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          subtitle="Engineering roadmaps"
          icon={FolderKanban}
          color="brand"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          subtitle="In development"
          icon={Clock}
          color="blue"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Completed"
          value={completedProjects}
          subtitle="Shipped milestones"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Completion Rate"
          value={`${overallPercentage}%`}
          subtitle={`${projectSummary?.completedTasks || 0} / ${projectSummary?.totalTasks || 0} Tasks`}
          icon={CheckSquare}
          color="purple"
          trend={`${overallPercentage}% Done`}
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Public Repos"
          value={githubLinked ? (github.repositories || 0) : 'Not Linked'}
          subtitle={githubLinked ? `Top: ${github.topLanguage || 'None'}` : 'Connect your GitHub'}
          icon={Github}
          color="brand"
          trend={githubLinked ? github.topLanguage : undefined}
          onClick={() => navigate('/github')}
        />
        <StatCard
          title="GitHub Network"
          value={githubLinked ? `${github.followers || 0} Followers` : 'Not Linked'}
          subtitle={githubLinked ? `${github.following || 0} Following` : 'Sync profile'}
          icon={Users}
          color="rose"
          onClick={() => navigate('/github')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Project Completion Analytics (Bar Chart) */}
        <Card
          className="lg:col-span-7"
          title="Project Completion Analytics"
          subtitle="Percentage of finished deliverables across active initiatives"
          action={
            <Link
              to="/projects"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              <span>Manage Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {completionChartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionChartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} interval={0} angle={-15} textAnchor="end" height={45} />
                  <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                    formatter={(val, name, item) => [`${val}% (${item.payload.completedTasks}/${item.payload.totalTasks} tasks)`, 'Completion Rate']}
                  />
                  <Bar dataKey="completion" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="No project completion data"
              description="Create your first project to start generating real completion analytics."
              actionLabel="Add Project"
              onAction={() => navigate('/projects')}
            />
          )}
        </Card>

        {/* Right: Project Status Distribution (Donut/Pie Chart) */}
        <Card
          className="lg:col-span-5 flex flex-col justify-between"
          title="Project Status Distribution"
          subtitle="Live status allocation across all repository projects"
        >
          {statusPieData.length > 0 ? (
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                    formatter={(val, name) => [`${val} Projects`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No status data"
              description="Project status metrics will appear here once projects are tracked."
            />
          )}
        </Card>
      </div>

      {/* Bottom Grid: Recent Projects & GitHub Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Projects Table */}
        <Card
          className="lg:col-span-7"
          title="Recent Projects & Roadmaps"
          subtitle="Latest initiatives recorded in MySQL"
          action={
            <Link
              to="/projects"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map(proj => (
                <div 
                  key={proj.id}
                  onClick={() => navigate('/projects')}
                  className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl hover:border-slate-700 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white truncate">{proj.name}</span>
                      <Badge 
                        variant={proj.status === 'COMPLETED' ? 'emerald' : proj.status === 'IN_PROGRESS' ? 'brand' : 'default'} 
                        size="sm"
                      >
                        {proj.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {proj.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{proj.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="w-24">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>{proj.completedTasks}/{proj.totalTasks} tasks</span>
                        <span className="font-semibold text-white">{proj.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, proj.completionPercentage)}%` }} 
                        />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 hover:text-white transition" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No projects created yet. Click "Track Projects" to add your first project.
            </div>
          )}
        </Card>

        {/* GitHub Telemetry Snapshot */}
        <Card
          className="lg:col-span-5 flex flex-col justify-between"
          title="GitHub Telemetry Snapshot"
          subtitle="Synchronized live from GitHub REST API"
          action={
            <Link
              to="/github"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              <span>View GitHub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {githubLinked ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center space-x-3.5">
                  {github.avatarUrl ? (
                    <img 
                      src={github.avatarUrl} 
                      alt={github.githubUsername} 
                      className="w-11 h-11 rounded-xl border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="p-2.5 bg-slate-800 rounded-xl text-white">
                      <Github className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-white truncate">{github.name || github.githubUsername}</div>
                    <div className="text-xs text-brand-400 font-mono">@{github.githubUsername}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Primary: {github.topLanguage || 'None'}</div>
                  </div>
                </div>

                {github.bio && (
                  <p className="mt-2.5 text-xs text-slate-400 italic line-clamp-2">
                    "{github.bio}"
                  </p>
                )}

                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Repos</span>
                    <span className="text-sm font-bold text-white">{github.repositories || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Followers</span>
                    <span className="text-sm font-bold text-white">{(github.followers || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Following</span>
                    <span className="text-sm font-bold text-white">{(github.following || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 uppercase font-semibold block">Stars</span>
                    <span className="text-sm font-bold text-amber-400">{(github.stars || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {languageEntries.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Detected Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {languageEntries.map(([lang, count], idx) => (
                      <Badge key={idx} variant="brand" size="sm">
                        {lang}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={github.profileUrl || `https://github.com/${github.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <span>Open GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Github}
              title="GitHub Not Synchronized"
              description="Enter your GitHub username to fetch repositories, followers, following, and top languages."
              actionLabel="Sync Profile"
              onAction={() => navigate('/github')}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
