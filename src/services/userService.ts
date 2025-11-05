import api from './api';

interface UpdateNameData {
  name: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  points: number;
  favoriteShops: string[];
  createdAt: string;
}

class UserService {
  async getUserProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/api/user/me');
    return response.data;
  }

  async updateName(data: UpdateNameData): Promise<{ message: string; name: string }> {
    const response = await api.patch('/api/user/me/name', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.patch('/api/user/me/password', data);
    return response.data;
  }
}

export default new UserService();
