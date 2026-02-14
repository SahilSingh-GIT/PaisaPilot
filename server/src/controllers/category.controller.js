import * as categoryService from '../services/category.service.js';

export async function getCategories(req, res) {
  try {
    const categories = await categoryService.getCategoriesForUser(req.user.id);
    res.status(200).json({ status: 'success', data: { categories } });
  } catch (error) {
    console.error('[Category getCategories]', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories' });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, type, icon, color } = req.body;
    if (!name || !type) {
      return res.status(400).json({ status: 'error', message: 'Name and type are required' });
    }

    const category = await categoryService.createCustomCategory(req.user.id, { name, type, icon, color });
    res.status(201).json({ status: 'success', data: { category } });
  } catch (error) {
    console.error('[Category createCategory]', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ status: 'error', message: 'Category already exists' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to create category' });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    
    const category = await categoryService.updateCustomCategory(req.user.id, id, { name, icon, color });
    res.status(200).json({ status: 'success', data: { category } });
  } catch (error) {
    console.error('[Category updateCategory]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(403).json({ status: 'error', message: 'Forbidden or not found' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to update category' });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    await categoryService.deleteCustomCategory(req.user.id, id);
    res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    console.error('[Category deleteCategory]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(403).json({ status: 'error', message: 'Forbidden or not found' });
    }
    if (error.message === 'CATEGORY_IN_USE') {
      return res.status(400).json({ status: 'error', message: 'Cannot delete category that is in use by transactions or budgets' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to delete category' });
  }
}
