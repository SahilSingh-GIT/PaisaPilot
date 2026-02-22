import { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import TransactionModal from '../components/shared/TransactionModal';
import LoadingState from '../components/shared/LoadingState';
import { Pencil, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    fetchTransactions();

    const handleUpdate = () => {
      fetchTransactions();
    };

    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, [type, search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAll({ 
        search, 
        type: type || undefined,
        limit: 100 // keeping it simple for now without pagination controls
      });
      setTransactions(res.data.transactions);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionService.delete(id);
      toast.success('Transaction deleted');
      window.dispatchEvent(new Event('data-updated'));
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const openEditModal = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-zinc-400 mt-1">Manage your income and expenses</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTx(null);
            setIsModalOpen(true);
          }}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          Add Transaction
        </Button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            {/* this realtive absolute drama as ham chahte hai search icon search
            bar ke andar ho so absolute pos relative to the parent */}
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Types</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        {loading ? (
          <LoadingState message="Loading transactions..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-zinc-300">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-zinc-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {tx.title}
                        {tx.paymentMethod && (
                          <span className="ml-2 text-xs text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-800">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: tx.category?.color || "#52525b",
                            }}
                          />
                          {tx.category?.name}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(tx)}
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tx.id)}
                            className="h-8 w-8 text-zinc-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedTx}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
