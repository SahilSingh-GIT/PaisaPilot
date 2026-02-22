import { Menu, Plus, Sparkles, User, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TransactionModal from './TransactionModal';
import QuickAddModal from './QuickAddModal';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden text-zinc-400">
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold hidden sm:block truncate max-w-[200px]">
            Welcome, {user?.name?.split(' ')[0]}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            onClick={() => setIsTransactionModalOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-9 px-3 sm:px-4"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>

          <Button 
            variant="outline" 
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 h-9 px-3 sm:px-4"
            onClick={() => setIsQuickAddOpen(true)}
          >
            <span className="hidden sm:inline mr-2">Quick Add</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </Button>

          <div className="relative ml-2">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              <User className="h-4 w-4 text-zinc-300" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-zinc-900 border border-zinc-800 shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/app/profile" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Profile
                  </Link>
                  <button 
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />
      <QuickAddModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  );
}
