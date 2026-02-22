import { useEffect, useState } from 'react';
import { dashboardService, aiService } from '../services/api';
import StatCard from '../components/shared/StatCard';
import LoadingState from '../components/shared/LoadingState';
import EmptyState from '../components/shared/EmptyState';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();

    const handleUpdate = () => {
      fetchDashboard();
    };

    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getSummary();
      setData(res.data.summary);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  const hasData = data && (data.income > 0 || data.expenses > 0 || data.recentTransactions?.length > 0);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Good Morning👋</h1>
        <EmptyState 
          title="Welcome to PaisaPilot"
          description="You haven't tracked any finances yet. Add your first expense to see your dashboard come to life."
        />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const { income, expenses, balance, savingsRate, recentTransactions, budgetProgress } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Financial Overview</h1>
        <p className="text-zinc-400 mt-1">Here is your summary for this month</p>
      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Balance" 
          value={formatCurrency(balance)} 
          icon={Wallet}
        />
        <StatCard 
          title="Income" 
          value={formatCurrency(income)} 
          icon={TrendingUp}
        />
        <StatCard 
          title="Expenses" 
          value={formatCurrency(expenses)} 
          icon={TrendingDown}
        />
        <StatCard 
          title="Savings Rate" 
          value={`${savingsRate.toFixed(1)}%`} 
          icon={PiggyBank}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <Link to="/app/transactions" className="text-sm text-yellow-400 hover:text-yellow-300 font-medium flex items-center">
              View all <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions?.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${tx.category?.color || '#52525b'}20`, color: tx.category?.color || '#a1a1aa' }}
                    >
                      <span className="text-lg font-semibold">{tx.category?.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.title}</p>
                      <p className="text-xs text-zinc-500">{new Date(tx.transactionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Budget Progress</h3>
            <Link to="/app/budgets" className="text-sm text-yellow-400 hover:text-yellow-300 font-medium flex items-center">
              Manage <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-6">
            {budgetProgress?.length > 0 ? (
              budgetProgress.map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: budget.color || '#FACC15' }} />
                      {budget.categoryName}
                    </span>
                    <span className="text-zinc-400">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${budget.isExceeded ? 'bg-rose-500' : 'bg-yellow-400'}`}
                      style={{ width: `${budget.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-zinc-500">No active budgets this month</p>
                <Link to="/app/budgets" className="text-yellow-400 text-sm mt-2 inline-block">Create a budget</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
