import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { categoryService, budgetService } from '../../services/api';
import toast from 'react-hot-toast';

export default function BudgetModal({ isOpen, onClose, initialData = null, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState('MONTHLY');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (initialData) {
        setAmount(initialData.amount);
        setCategoryId(initialData.categoryId);
        setPeriod(initialData.period);
        setStartDate(new Date(initialData.startDate).toISOString().split('T')[0]);
      } else {
        setAmount('');
        setCategoryId('');
        setPeriod('MONTHLY');
        const d = new Date();
        d.setDate(1);
        setStartDate(d.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialData]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.categories.filter(c => c.type === 'EXPENSE'));
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId || !startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        categoryId,
        period,
        startDate: new Date(startDate).toISOString(),
      };

      if (initialData) {
        await budgetService.update(initialData.id, payload);
        toast.success('Budget updated');
      } else {
        await budgetService.create(payload);
        toast.success('Budget created');
      }
      
      window.dispatchEvent(new Event('data-updated'));
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <form id="budget-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Category *</label>
              <select 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="" disabled>Select an expense category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Budget Amount (₹) *</label>
              <Input 
                type="number" 
                step="0.01"
                min="0"
                placeholder="0.00" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="text-lg font-semibold h-12 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Period</label>
                <select 
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Start Date *</label>
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400"
                  required
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <Button 
            type="submit" 
            form="budget-form"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-11"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Budget' : 'Save Budget')}
          </Button>
        </div>
      </div>
    </div>
  );
}
