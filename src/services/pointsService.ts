import api from './api';

interface PointsResponse {
  points: number;
}

class PointsService {
  async getUserPoints(): Promise<number> {
    const response = await api.get<PointsResponse>('/api/points');
    return response.data.points;
  }
}

export default new PointsService();
