import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  Wallet, 
  Target,
  Sparkles,
  X,
  Tag
} from 'lucide-react';
import { Button } from '../ui/button';

export default function Sidebar({ onClose }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/app/transactions', icon: ArrowRightLeft },
    { name: 'Categories', path: '/app/categories', icon: Tag },
    { name: 'Analytics', path: '/app/analytics', icon: PieChart },
    { name: 'Budgets', path: '/app/budgets', icon: Wallet },
    { name: 'Goals', path: '/app/goals', icon: Target },
    { name: 'AI Insights', path: '/app/ai-insights', icon: Sparkles },
  ];

  return (
    <div className="flex h-full flex-col bg-zinc-950 border-r border-zinc-800 text-white w-full">
      <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800">
        <Link to="/app/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-black">
            P
          </div>
          PaisaPilot
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-yellow-400/10 text-yellow-400' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
