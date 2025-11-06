import api from './api';

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  points: number;
}

class FamilyService {
  async getInvitationCode(): Promise<string> {
    const response = await api.get('/api/family/invitation-code');
    return response.data.invitationCode;
  }

  async joinFamily(invitationCode: string): Promise<void> {
    await api.post('/api/family/join', { invitationCode });
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    const response = await api.get('/api/family/members');
    return response.data;
  }

  async removeFamilyMember(memberId: string): Promise<void> {
    await api.delete(`/api/family/members/${memberId}`);
  }
}

export default new FamilyService();
