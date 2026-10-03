import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  X, 
  AlertCircle,
  Briefcase
} from 'lucide-react';

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', variant: 'default', color: 'text-slate-400' },
  IN_PROGRESS: { label: 'In Progress', variant: 'brand', color: 'text-brand-400' },
  COMPLETED: { label: 'Completed', variant: 'emerald', color: 'text-emerald-400' },
};

const ProjectTracker = () => {
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedProjects, setExpandedProjects] = useState({});

  // Project Modal State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState('NOT_STARTED');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  // Task Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('NOT_STARTED');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Alerts
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectList, summaryData] = await Promise.all([
        projectService.getProjects(),
        projectService.getSummary()
      ]);
      setProjects(projectList || []);
      setSummary(summaryData || null);

      // Auto-expand projects by default
      const expandedMap = {};
      (projectList || []).forEach(p => { expandedMap[p.id] = true; });
      setExpandedProjects(expandedMap);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load project records.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setMessage(msg);
    setError('');
    setTimeout(() => setMessage(''), 4500);
  };

  const toggleExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // --- Project Handlers ---
  const handleOpenProjectModal = (project = null) => {
    setError('');
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
      setProjectDescription(project.description || '');
      setProjectStatus(project.status || 'NOT_STARTED');
      setStartDate(project.startDate || '');
      setEndDate(project.endDate || '');
    } else {
      setEditingProject(null);
      setProjectName('');
      setProjectDescription('');
      setProjectStatus('NOT_STARTED');
      setStartDate('');
      setEndDate('');
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setSavingProject(true);
    setError('');
    try {
      const payload = {
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        status: projectStatus,
        startDate: startDate || null,
        endDate: endDate || null
      };

      if (editingProject) {
        await projectService.updateProject(editingProject.id, payload);
        showSuccess(`Project "${projectName}" updated successfully!`);
      } else {
        await projectService.createProject(payload);
        showSuccess(`Project "${projectName}" created successfully!`);
      }

      setProjectModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId, name) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}" and all its tasks?`)) return;
    try {
      await projectService.deleteProject(projectId);
      showSuccess(`Project "${name}" removed successfully.`);
      await loadData();
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.response?.data?.message || 'Error deleting project.');
    }
  };

  // --- Task Handlers ---
  const handleOpenTaskModal = (projectId, task = null) => {
    setError('');
    setTargetProjectId(projectId);
    if (task) {
      setEditingTask(task);
      setTaskName(task.name);
      setTaskDescription(task.description || '');
      setTaskStatus(task.status || 'NOT_STARTED');
      setTaskDueDate(task.dueDate || '');
    } else {
      setEditingTask(null);
      setTaskName('');
      setTaskDescription('');
      setTaskStatus('NOT_STARTED');
      setTaskDueDate('');
    }
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim() || !targetProjectId) return;
    setSavingTask(true);
    setError('');
    try {
      const payload = {
        name: taskName.trim(),
        description: taskDescription.trim() || null,
        status: taskStatus,
        dueDate: taskDueDate || null
      };

      if (editingTask) {
        await projectService.updateTask(targetProjectId, editingTask.id, payload);
        showSuccess(`Task "${taskName}" updated!`);
      } else {
        await projectService.createTask(targetProjectId, payload);
        showSuccess(`Task "${taskName}" added to project!`);
      }

      setTaskModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleTaskStatus = async (projectId, task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await projectService.updateTask(projectId, task.id, {
        name: task.name,
        description: task.description,
        status: nextStatus,
        dueDate: task.dueDate
      });
      await loadData();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.response?.data?.message || 'Could not update task status.');
    }
  };

  const handleDeleteTask = async (projectId, taskId, taskTitle) => {
    if (!window.confirm(`Delete task "${taskTitle}"?`)) return;
    try {
      await projectService.deleteTask(projectId, taskId);
      showSuccess(`Task "${taskTitle}" deleted.`);
      await loadData();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || 'Error deleting task.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading full-stack engineering projects and tasks..." />;
  }

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    if (activeFilter === 'ALL') return true;
    return p.status === activeFilter;
  });

  const totalProjects = summary?.totalProjects || projects.length;
  const activeProjects = summary?.activeProjects || projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = summary?.completedProjects || projects.filter(p => p.status === 'COMPLETED').length;
  const overallPercentage = summary?.overallCompletionPercentage || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Engineering Deliverables & Task Roadmap</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Project Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage projects, monitor milestone completion rates, and track tasks from inception to production deployment
          </p>
        </div>

        <button
          onClick={() => handleOpenProjectModal()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition shrink-0 shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          subtitle="Engineering initiatives"
          icon={FolderKanban}
          color="brand"
          onClick={() => setActiveFilter('ALL')}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          subtitle="Currently in development"
          icon={Clock}
          color="blue"
          onClick={() => setActiveFilter('IN_PROGRESS')}
        />
        <StatCard
          title="Completed Projects"
          value={completedProjects}
          subtitle="Shipped to production"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => setActiveFilter('COMPLETED')}
        />
        <StatCard
          title="Milestone Completion"
          value={`${overallPercentage}%`}
          subtitle={`${summary?.completedTasks || 0} / ${summary?.totalTasks || 0} Tasks Completed`}
          icon={CheckSquare}
          color="purple"
          trend={`${overallPercentage}% Overall`}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {[
          { key: 'ALL', label: 'All Projects' },
          { key: 'IN_PROGRESS', label: 'In Progress' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'NOT_STARTED', label: 'Not Started' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="space-y-5">
          {filteredProjects.map(project => {
            const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.NOT_STARTED;
            const isExpanded = expandedProjects[project.id];
            const tasks = project.tasks || [];

            return (
              <div 
                key={project.id}
                className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
              >
                {/* Project Header Bar */}
                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {project.name}
                      </h3>
                      <Badge variant={statusConfig.variant} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                        {project.description}
                      </p>
                    )}

                    {/* Meta Dates & Task Count */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      {project.startDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Starts: {project.startDate}</span>
                        </div>
                      )}
                      {project.endDate && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target: {project.endDate}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 font-medium text-slate-400">
                        <span>Tasks: {project.completedTasks} / {project.totalTasks} Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Action Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-[280px]">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Completion Rate</span>
                        <span className="text-brand-400 font-bold">{project.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, project.completionPercentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenTaskModal(project.id)}
                        className="px-2.5 py-1.5 bg-brand-600/10 hover:bg-brand-600/20 text-brand-400 border border-brand-500/20 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                        title="Add Task"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Task</span>
                      </button>

                      <button
                        onClick={() => handleOpenProjectModal(project)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(project.id)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title={isExpanded ? 'Collapse Tasks' : 'Expand Tasks'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Child Tasks Section */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-900/40 p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Tasks & Checklist ({tasks.length})
                      </span>
                      <button
                        onClick={() => handleOpenTaskModal(project.id)}
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>

                    {tasks.length > 0 ? (
                      <div className="space-y-2">
                        {tasks.map(task => {
                          const isDone = task.status === 'COMPLETED';
                          return (
                            <div 
                              key={task.id}
                              className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700/80 transition"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleToggleTaskStatus(project.id, task)}
                                  className="text-slate-400 hover:text-emerald-400 transition shrink-0"
                                >
                                  {isDone ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className={`text-sm font-medium ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {task.name}
                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-slate-500 truncate max-w-xl">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 shrink-0 pl-3">
                                {task.dueDate && (
                                  <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.dueDate}</span>
                                  </span>
                                )}

                                <Badge 
                                  variant={task.status === 'COMPLETED' ? 'emerald' : task.status === 'IN_PROGRESS' ? 'brand' : 'default'}
                                  size="sm"
                                >
                                  {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status === 'COMPLETED' ? 'Done' : 'Pending'}
                                </Badge>

                                <button
                                  onClick={() => handleOpenTaskModal(project.id, task)}
                                  className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition"
                                  title="Edit Task"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteTask(project.id, task.id, task.name)}
                                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                        No tasks registered for this project yet. Click "+ Add Task" to begin breaking down work units.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            activeFilter === 'ALL'
              ? 'Get started by creating your first engineering project to track tasks, deadlines, and completion metrics.'
              : `No projects found with status "${activeFilter.replace('_', ' ')}".`
          }
          actionLabel="Create Project"
          onAction={() => handleOpenProjectModal()}
        />
      )}

      {/* --- Project Modal (Create & Edit) --- */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {editingProject ? 'Update Project' : 'Create New Project'}
              </h3>
              <button 
                onClick={() => setProjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cache Engine, Next.js Portfolio"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Architectural overview, key libraries, or core milestones..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 active:scale-95"
                >
                  {savingProject ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Task Modal (Create & Edit) --- */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button 
                onClick={() => setTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Task Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Set up JWT security filter"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Task Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Sub-task details or acceptance criteria..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 active:scale-95"
                >
                  {savingTask ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTracker;
