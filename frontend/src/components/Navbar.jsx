import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Code2
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#111827]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              DevTrack <span className="text-brand-400">Pro</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-800/60 transition group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-brand-400 transition">
                {user?.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                {user?.email}
              </div>
            </div>
          </button>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
