import { useState, useEffect } from 'react';
import { budgetService, dashboardService } from '../services/api';
import { Button } from '../components/ui/button';
import BudgetModal from '../components/shared/BudgetModal';
import LoadingState from '../components/shared/LoadingState';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]); // This will come from dashboard progress to get spent amounts
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();

    const handleUpdate = () => {
      fetchBudgets();
    };

    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      // Get the full list of budgets, but we really want their progress.
      // Since dashboard summary already calculates progress for active budgets, we can use that for simplicity here,
      // or we can fetch raw budgets and dashboard separately. Let's use dashboard service for progress, 
      // but if a user has inactive budgets, we might need a dedicated endpoint. 
      // For this milestone, dashboard service progress is a good proxy for "current active budgets".
      
      const [budgetsRes, summaryRes] = await Promise.all([
        budgetService.getAll(),
        dashboardService.getSummary()
      ]);

      const rawBudgets = budgetsRes.data.budgets;
      const progressData = summaryRes.data.summary.budgetProgress || [];

      // Merge raw budget data with calculated progress
      const enrichedBudgets = rawBudgets.map(rb => {
        const prog = progressData.find(p => p.id === rb.id);
        return {
          ...rb,
          spent: prog ? prog.spent : 0,
          percentage: prog ? prog.percentage : 0,
          isExceeded: prog ? prog.isExceeded : false
        };
      });

      setBudgets(enrichedBudgets);
    } catch (error) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await budgetService.delete(id);
      toast.success('Budget deleted');
      window.dispatchEvent(new Event('data-updated'));
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const openEditModal = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Budgets</h1>
          <p className="text-zinc-400 mt-1">Control your spending limits</p>
        </div>
        <Button 
          onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading budgets..." />
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-xl">
          <p className="text-zinc-500">No budgets created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${budget.category?.color || '#52525b'}20`, color: budget.category?.color || '#a1a1aa' }}>
                    <span className="text-lg font-semibold">{budget.category?.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{budget.category?.name}</h3>
                    <p className="text-xs text-zinc-500 capitalize">{budget.period.toLowerCase()} Budget</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(budget)} className="h-8 w-8 text-zinc-400 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)} className="h-8 w-8 text-zinc-400 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(budget.spent)}</p>
                    <p className="text-xs text-zinc-500">spent of {formatCurrency(budget.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${budget.isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {formatCurrency(Math.max(0, budget.amount - budget.spent))}
                    </p>
                    <p className="text-xs text-zinc-500">remaining</p>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${budget.isExceeded ? 'bg-rose-500' : 'bg-yellow-400'}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedBudget}
        onSuccess={fetchBudgets}
      />
    </div>
  );
}
