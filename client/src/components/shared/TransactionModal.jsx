import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { categoryService, transactionService } from '../../services/api';
import toast from 'react-hot-toast';

export default function TransactionModal({ isOpen, onClose, initialData = null, onSuccess }) {
  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount);
        setCategoryId(initialData.categoryId);
        setTitle(initialData.title);
        setTransactionDate(new Date(initialData.transactionDate).toISOString().split('T')[0]);
        setPaymentMethod(initialData.paymentMethod);
      } else {
        // Reset
        setType('EXPENSE');
        setAmount('');
        setCategoryId('');
        setTitle('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('UPI');
      }
    }
  }, [isOpen, initialData]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId || !title || !transactionDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        categoryId,
        title,
        transactionDate: new Date(transactionDate).toISOString(),
        paymentMethod
      };

      if (initialData) {
        await transactionService.update(initialData.id, payload);
        toast.success('Transaction updated');
      } else {
        await transactionService.create(payload);
        toast.success('Transaction added');
      }
      
      // Notify other components to refresh their data
      window.dispatchEvent(new Event('data-updated'));
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction');
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
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex p-1 bg-zinc-900 rounded-lg">
            <button
              type="button"
              onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'EXPENSE' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => { setType('INCOME'); setCategoryId(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'INCOME' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Income
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Amount (₹) *</label>
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Category *</label>
              <select 
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                required
              >
                <option value="" disabled>Select a category</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Title / Merchant *</label>
              <Input 
                type="text" 
                placeholder={type === 'EXPENSE' ? 'e.g., Swiggy, Uber' : 'e.g., Salary, Freelance'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Date *</label>
                <div className="relative">
                  <Input 
                    type="date" 
                    value={transactionDate}
                    onChange={e => setTransactionDate(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 pl-10"
                    required
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <option value="UPI">UPI</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="WALLET">Wallet</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <Button 
            type="submit" 
            form="transaction-form"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-11"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Transaction' : 'Save Transaction')}
          </Button>
        </div>
      </div>
    </div>
  );
}
