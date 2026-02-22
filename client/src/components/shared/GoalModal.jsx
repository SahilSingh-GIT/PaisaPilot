import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { goalService } from '../../services/api';
import toast from 'react-hot-toast';

export default function GoalModal({ isOpen, onClose, initialData = null, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setTargetAmount(initialData.targetAmount);
        setCurrentAmount(initialData.currentAmount);
        setTargetDate(initialData.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '');
      } else {
        setName('');
        setDescription('');
        setTargetAmount('');
        setCurrentAmount('0');
        setTargetDate('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      toast.error('Name and target amount are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || 0),
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
      };

      if (initialData) {
        await goalService.update(initialData.id, payload);
        toast.success('Goal updated');
      } else {
        await goalService.create(payload);
        toast.success('Goal created');
      }
      
      window.dispatchEvent(new Event('data-updated'));
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save goal');
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
            {initialData ? 'Edit Goal' : 'Create Goal'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Goal Name *</label>
              <Input 
                type="text" 
                placeholder="e.g., Emergency Fund" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Target (₹) *</label>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00" 
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Current Saved (₹)</label>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00" 
                  value={currentAmount}
                  onChange={e => setCurrentAmount(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Target Date (Optional)</label>
              <Input 
                type="date" 
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400"
              />
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <Button 
            type="submit" 
            form="goal-form"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-11"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Goal' : 'Save Goal')}
          </Button>
        </div>
      </div>
    </div>
  );
}
