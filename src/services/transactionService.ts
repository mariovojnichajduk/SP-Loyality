import api from './api';

export interface Product {
  id: string;
  name: string;
  pointValue: number;
  isApproved: boolean;
}

export interface TransactionProduct {
  productId: string;
  quantity: number;
  pointsValue: number;
  pointsAwarded: boolean;
  product: Product;
}

export interface Shop {
  id: string;
  name: string;
  location: string;
}

export interface Transaction {
  id: string;
  date: string;
  points: number;
  receiptId: string | null;
  shop: Shop;
  transactionProducts: TransactionProduct[];
  createdAt: string;
}

class TransactionService {
  async getMyTransactions(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/api/transactions/my-transactions');
    return response.data;
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/api/transactions/${id}`);
    return response.data;
  }
}

export default new TransactionService();
