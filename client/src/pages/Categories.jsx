import { useState, useEffect } from 'react';
import { categoryService } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import LoadingState from '../components/shared/LoadingState';
import { Pencil, Trash2, Plus, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [color, setColor] = useState('#facc15');

  useEffect(() => {
    fetchCategories();

    const handleUpdate = () => {
      fetchCategories();
    };

    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.categories);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will fail if the category is used by transactions or budgets.')) return;
    try {
      await categoryService.delete(id);
      toast.success('Category deleted');
      window.dispatchEvent(new Event('data-updated'));
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const openModal = (cat = null) => {
    setSelectedCategory(cat);
    if (cat) {
      setName(cat.name);
      setType(cat.type);
      setColor(cat.color || '#facc15');
    } else {
      setName('');
      setType('EXPENSE');
      setColor('#facc15');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (selectedCategory) {
        await categoryService.update(selectedCategory.id, { name, color });
        toast.success('Category updated');
      } else {
        await categoryService.create({ name, type, color });
        toast.success('Category created');
      }
      setIsModalOpen(false);
      window.dispatchEvent(new Event('data-updated'));
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-zinc-400 mt-1">Manage transaction classifications</p>
        </div>
        <Button onClick={() => openModal()} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color || '#facc15'}20`, color: cat.color || '#facc15' }}>
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                  <p className="text-xs text-zinc-500">{cat.type}</p>
                </div>
              </div>
              
              {!cat.isDefault && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openModal(cat)} className="h-8 w-8 text-zinc-400 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-8 w-8 text-zinc-400 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {cat.isDefault && (
                <span className="text-xs font-medium px-2 py-1 bg-zinc-900 text-zinc-400 rounded-full">Default</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Inline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {selectedCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-zinc-400">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Type</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value)}
                  disabled={!!selectedCategory} // Can't change type after creation
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Name</label>
                <Input 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-zinc-900 text-white border-zinc-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Color</label>
                <input 
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </div>

              <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold mt-4">
                Save
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
