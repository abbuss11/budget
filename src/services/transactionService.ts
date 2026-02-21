import axios from 'axios';

const API_URL = '/api';

export interface Transaction {
  id: number | string;
  accountId: number | string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  createdAt: string;
}

class TransactionService {
  async getByAccount(accountId: number | string): Promise<Transaction[]> {
    const res = await axios.get(`${API_URL}/transactions?accountId=${accountId}&_sort=createdAt&_order=desc`);
    return res.data;
  }

  async create(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTx = { ...tx, createdAt: new Date().toISOString(), id: Date.now() } as Transaction;
    const res = await axios.post(`${API_URL}/transactions`, newTx);
    return res.data;
  }
}

export default new TransactionService();
