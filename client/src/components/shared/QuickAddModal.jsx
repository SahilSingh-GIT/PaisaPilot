import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { aiService, transactionService, categoryService } from '../../services/api';
import toast from 'react-hot-toast';

export default function QuickAddModal({ isOpen, onClose }) {
  const [step, setStep] = useState('INPUT'); // INPUT, PARSING, REVIEW
  const [text, setText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.categories.filter(c => c.type === 'EXPENSE'));
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setText('');
    setParsedData(null);
    setStep('INPUT');
    onClose();
  };

  const handleParse = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setStep('PARSING');
    try {
      const response = await aiService.parseExpense({ text });
      setParsedData(response.candidate);
      setStep('REVIEW');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to parse expense.');
      setStep('INPUT'); // fallback
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!parsedData.amount || !parsedData.categoryId || !parsedData.transactionDate) {
      toast.error('Please ensure all required fields are filled.');
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionService.create({
        type: 'EXPENSE',
        amount: Number(parsedData.amount),
        categoryId: parsedData.categoryId,
        transactionDate: new Date(parsedData.transactionDate).toISOString(),
        paymentMethod: parsedData.paymentMethod || 'UPI',
        merchant: parsedData.merchant || '',
        notes: parsedData.notes || '',
        title: parsedData.merchant ? `Expense at ${parsedData.merchant}` : 'AI Added Expense'
      });
      
      toast.success('Expense added successfully!');
      window.dispatchEvent(new Event('data-updated'));
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white tracking-tight">Quick Add</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'INPUT' && (
            <form onSubmit={handleParse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Describe your expense naturally
                </label>
                <textarea
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Spent 450 on dinner at Meghana yesterday using UPI"
                  className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>
              <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-11" disabled={!text.trim()}>
                Understand Expense <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 'PARSING' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-yellow-400 animate-spin" />
              <p className="text-zinc-400 font-medium animate-pulse">Analyzing expense...</p>
            </div>
          )}

          {step === 'REVIEW' && parsedData && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-400 text-sm">Amount</span>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 text-sm">₹</span>
                    <input 
                      type="number"
                      required
                      className="bg-transparent text-white font-semibold text-right w-24 focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded px-1"
                      value={parsedData.amount}
                      onChange={(e) => setParsedData({...parsedData, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-400 text-sm">Date</span>
                  <input 
                    type="date"
                    required
                    className="bg-transparent text-white text-right focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded px-1 [color-scheme:dark]"
                    value={parsedData.transactionDate}
                    onChange={(e) => setParsedData({...parsedData, transactionDate: e.target.value})}
                  />
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-400 text-sm">Merchant</span>
                  <input 
                    type="text"
                    placeholder="None"
                    className="bg-transparent text-white text-right focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded px-1"
                    value={parsedData.merchant || ''}
                    onChange={(e) => setParsedData({...parsedData, merchant: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-400 text-sm">Method</span>
                  <select
                    className="bg-zinc-900 text-white text-right focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded px-1 border border-zinc-700"
                    value={parsedData.paymentMethod}
                    onChange={(e) => setParsedData({...parsedData, paymentMethod: e.target.value})}
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="WALLET">Wallet</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-400 text-sm">Category</span>
                  <select
                    required
                    className="bg-zinc-900 text-white text-right focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded px-1 border border-zinc-700 max-w-[150px]"
                    value={parsedData.categoryId || ''}
                    onChange={(e) => setParsedData({...parsedData, categoryId: e.target.value})}
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-1/3 bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={() => setStep('INPUT')}
                  disabled={isSubmitting}
                >
                  Edit Text
                </Button>
                <Button 
                  type="submit" 
                  className="w-2/3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                  disabled={isSubmitting || !parsedData.categoryId}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & Save'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
