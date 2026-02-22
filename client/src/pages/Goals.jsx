import { useState, useEffect } from 'react';
import { goalService } from '../services/api';
import { Button } from '../components/ui/button';
import GoalModal from '../components/shared/GoalModal';
import LoadingState from '../components/shared/LoadingState';
import { Pencil, Trash2, Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    fetchGoals();

    const handleUpdate = () => {
      fetchGoals();
    };

    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalService.getAll();
      setGoals(res.data.goals);
    } catch (error) {
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goalService.delete(id);
      toast.success('Goal deleted');
      window.dispatchEvent(new Event('data-updated'));
      
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const openEditModal = (goal) => {
    setSelectedGoal(goal);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Goals</h1>
          <p className="text-zinc-400 mt-1">Track your savings targets</p>
        </div>
        <Button 
          onClick={() => { setSelectedGoal(null); setIsModalOpen(true); }}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading goals..." />
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-xl">
          <Target className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500">No active financial goals. Start saving today!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {goals.map((goal) => {
            const current = Number(goal.currentAmount);
            const target = Number(goal.targetAmount);
            const percentage = Math.min(target > 0 ? (current / target) * 100 : 0, 100);
            
            return (
              <div key={goal.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                    {goal.targetDate && (
                      <p className="text-xs text-zinc-500">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(goal)} className="h-8 w-8 text-zinc-400 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)} className="h-8 w-8 text-zinc-400 hover:text-rose-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(current)}</p>
                      <p className="text-xs text-zinc-500">saved of {formatCurrency(target)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">
                        {percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-zinc-500">completed</p>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedGoal}
        onSuccess={fetchGoals}
      />
    </div>
  );
}
