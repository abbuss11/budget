import axios from 'axios';

const API_URL = '/api';

export interface Account {
  id: number | string;
  userId: string | number;
  name: string;
  balance: number;
  budgetLimit?: number;
  createdAt: string;
}

class AccountService {
  async getAccountsByUser(userId: string | number): Promise<Account[]> {
    try {
      // Filter client-side to avoid string/number userId mismatches returned by json-server data.
      const response = await axios.get<Account[]>(`${API_URL}/accounts`);
      return response.data.filter((account) => String(account.userId) === String(userId));
    } catch (error) {
      console.error('getAccountsByUser error', error);
      if (axios.isAxiosError(error)) throw new Error(error.message || 'Erreur reseau');
      throw error;
    }
  }

  async createAccount(payload: {
    userId: string | number;
    name: string;
    balance: number;
    budgetLimit?: number;
  }): Promise<Account> {
    try {
      const newAccount: Account = {
        id: Date.now(),
        userId: payload.userId,
        name: payload.name,
        balance: payload.balance,
        budgetLimit: payload.budgetLimit ?? 0,
        createdAt: new Date().toISOString(),
      };

      const response = await axios.post<Account>(`${API_URL}/accounts`, newAccount);
      return response.data;
    } catch (error) {
      console.error('createAccount error', error);
      if (axios.isAxiosError(error)) throw new Error(error.message || 'Erreur reseau');
      throw error;
    }
  }

  async updateAccount(id: number | string, data: Partial<Account>): Promise<Account> {
    const response = await axios.patch<Account>(`${API_URL}/accounts/${id}`, data);
    return response.data;
  }

  async deleteAccount(id: number | string): Promise<void> {
    await axios.delete(`${API_URL}/accounts/${id}`);
  }
}

export default new AccountService();
