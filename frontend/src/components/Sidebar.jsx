import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Github, 
  FolderKanban, 
  User,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/github', label: 'GitHub Analytics', icon: Github },
    { to: '/projects', label: 'Project Tracker', icon: FolderKanban },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 bg-[#0e1424] border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider mb-2">
            Platform Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-400 border border-brand-500/25 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
          <div className="font-semibold text-white flex items-center space-x-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>DevTrack Core</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-snug">
            Track engineering projects, deliver tasks, and analyze GitHub activity.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
