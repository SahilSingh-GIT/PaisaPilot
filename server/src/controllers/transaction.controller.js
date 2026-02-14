import * as transactionService from '../services/transaction.service.js';

export async function getTransactions(req, res) {
  try {
    const result = await transactionService.getTransactions(req.user.id, req.query);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('[Transaction getTransactions]', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transactions' });
  }
}

export async function getTransaction(req, res) {
  try {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(req.user.id, id);
    res.status(200).json({ status: 'success', data: { transaction } });
  } catch (error) {
    console.error('[Transaction getTransaction]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to fetch transaction' });
  }
}

export async function createTransaction(req, res) {
  try {
    const { categoryId, type, amount, title, description, transactionDate, paymentMethod, merchant, notes } = req.body;
    
    if (!categoryId || !type || !amount || !title || !transactionDate) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const transaction = await transactionService.createTransaction(req.user.id, {
      categoryId, type, amount, title, description, 
      transactionDate: new Date(transactionDate), 
      paymentMethod, merchant, notes
    });
    
    res.status(201).json({ status: 'success', data: { transaction } });
  } catch (error) {
    console.error('[Transaction createTransaction]', error);
    if (error.message === 'INVALID_CATEGORY') {
      return res.status(400).json({ status: 'error', message: 'Invalid or unauthorized category' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to create transaction' });
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.transactionDate) data.transactionDate = new Date(data.transactionDate);
    
    const transaction = await transactionService.updateTransaction(req.user.id, id, data);
    res.status(200).json({ status: 'success', data: { transaction } });
  } catch (error) {
    console.error('[Transaction updateTransaction]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    if (error.message === 'INVALID_CATEGORY') {
      return res.status(400).json({ status: 'error', message: 'Invalid or unauthorized category' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to update transaction' });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    await transactionService.deleteTransaction(req.user.id, id);
    res.status(200).json({ status: 'success', message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('[Transaction deleteTransaction]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to delete transaction' });
  }
}
