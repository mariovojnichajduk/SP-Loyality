import api from './api';

interface RequestApprovalData {
  productName: string;
  shopId?: string;
  rawStoreName?: string;
}

interface RequestApprovalResponse {
  message: string;
  product: {
    id: string;
    name: string;
    isApproved: boolean;
  };
}

interface ApprovalStatusResponse {
  approvalStatus: Record<string, boolean>;
}

class ProductService {
  async requestApproval(data: RequestApprovalData): Promise<RequestApprovalResponse> {
    const response = await api.post<RequestApprovalResponse>('/api/products/request-approval', data);
    return response.data;
  }

  async getApprovalStatus(): Promise<ApprovalStatusResponse> {
    const response = await api.get<ApprovalStatusResponse>('/api/products/approval-status');
    return response.data;
  }
}

export default new ProductService();
