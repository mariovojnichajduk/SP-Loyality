import api from './api';

export interface Shop {
  id: string;
  name: string;
  location: string;
  transactionCount: number;
  totalPoints: number;
  isFavorite: boolean;
  isTopPerformer: boolean;
  rank: number | null;
}

class ShopsService {
  async getAllShops(): Promise<Shop[]> {
    const response = await api.get('/api/shops');
    return response.data;
  }

  async getFavoriteShops(): Promise<Shop[]> {
    const response = await api.get('/api/shops/favorites');
    return response.data;
  }

  async addToFavorites(shopId: string): Promise<void> {
    await api.post(`/api/shops/favorites/${shopId}`);
  }

  async removeFromFavorites(shopId: string): Promise<void> {
    await api.delete(`/api/shops/favorites/${shopId}`);
  }
}

export default new ShopsService();
