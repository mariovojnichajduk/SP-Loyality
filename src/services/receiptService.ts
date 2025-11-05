import api from './api';

export interface ReceiptProduct {
  product: string;
  quantity: number;
  doesExist?: boolean;
  pointValue?: number;
}

export interface ProcessReceiptResponse {
  products: ReceiptProduct[];
  totalAmount?: number;
  receiptDate?: string;
  storeName?: string;
}

class ReceiptService {
  async processReceipt(receiptUrl: string): Promise<ProcessReceiptResponse> {
    const response = await api.post<ProcessReceiptResponse>('/receipts/process', {
      receiptUrl,
    });
    return response.data;
  }
}

export default new ReceiptService();
