import api from './api';

export interface ReceiptProduct {
  product: string;
  quantity: number;
  doesExist?: boolean;
  pointValue?: number;
}

export interface ProcessReceiptResponse {
  products: ReceiptProduct[];
  receiptDate?: string;
  storeName?: string;
  rawStoreName?: string;
  shopId?: string;
  receiptId?: string;
  shopLocation?: string;
}

class ReceiptService {
  async processReceipt(receiptUrl: string): Promise<ProcessReceiptResponse> {
    const response = await api.post<ProcessReceiptResponse>('/receipts/process', {
      receiptUrl,
    });
    return response.data;
  }

  async collectPoints(receiptData: ProcessReceiptResponse): Promise<{ message: string; pointsAwarded: number; transactionId: string }> {
    const response = await api.post('/receipts/collect-points', {
      receiptData,
    });
    return response.data;
  }
}

export default new ReceiptService();
