import api from './api';

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number | null;
  imageUrl: string | null;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'completed' | 'cancelled';
  reward: {
    name: string;
    description: string;
  };
  createdAt: string;
}

class RewardService {
  async getAllRewards(): Promise<Reward[]> {
    const response = await api.get<Reward[]>('/api/rewards');
    return response.data;
  }

  async getRewardById(id: string): Promise<Reward> {
    const response = await api.get<Reward>(`/api/rewards/${id}`);
    return response.data;
  }

  async redeemReward(rewardId: string): Promise<Redemption> {
    const response = await api.post<Redemption>('/api/rewards/redeem', {
      rewardId,
    });
    return response.data;
  }

  async getUserRedemptions(): Promise<Redemption[]> {
    const response = await api.get<Redemption[]>('/api/rewards/user/redemptions');
    return response.data;
  }
}

export default new RewardService();
