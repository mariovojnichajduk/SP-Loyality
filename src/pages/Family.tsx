import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import pointsService from '../services/pointsService';
import familyService from '../services/familyService';
import styles from './Family.module.css';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  points: number;
}

export default function Family() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [members, code, points] = await Promise.all([
        familyService.getFamilyMembers(),
        familyService.getInvitationCode(),
        pointsService.getUserPoints(),
      ]);
      setFamilyMembers(members);
      setInvitationCode(code);
      setUserPoints(points);
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationCode = () => {
    navigator.clipboard.writeText(invitationCode);
    toast.success('Invitation code copied to clipboard!');
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    try {
      await familyService.joinFamily(joinCode.trim().toUpperCase());
      toast.success('Successfully joined family!');
      setJoinCode('');
      setShowJoinForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join family');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from your family?`)) {
      return;
    }

    try {
      await familyService.removeFamilyMember(memberId);
      toast.success('Family member removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove family member');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header points={userPoints} />
        <main className={styles.main}>
          <div className={styles.loading}>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header points={userPoints} />

      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Family Members</h1>
          <p className={styles.subtitle}>
            Share the joy of earning points! When you earn more than 5 points on a receipt for pre-approved products,
            each family member gets 1 bonus point.
          </p>

          <div className={styles.invitationSection}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Your Invitation Code</h2>
              <p className={styles.cardDescription}>
                Share this code with family members so they can join your family group
              </p>
              <div className={styles.codeDisplay}>
                <span className={styles.code}>{invitationCode}</span>
                <button onClick={copyInvitationCode} className={styles.copyButton}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Join a Family</h2>
              <p className={styles.cardDescription}>
                Have an invitation code? Join another family member's group
              </p>
              {!showJoinForm ? (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className={styles.joinButton}
                >
                  Enter Invitation Code
                </button>
              ) : (
                <form onSubmit={handleJoinFamily} className={styles.joinForm}>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className={styles.joinInput}
                    maxLength={8}
                  />
                  <div className={styles.joinFormButtons}>
                    <button type="submit" className={styles.submitButton}>
                      Join
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowJoinForm(false);
                        setJoinCode('');
                      }}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className={styles.membersSection}>
            <h2 className={styles.sectionTitle}>
              Family Members ({familyMembers.length})
            </h2>
            {familyMembers.length === 0 ? (
              <div className={styles.emptyState}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>No family members yet</p>
                <p className={styles.emptyStateHint}>
                  Share your invitation code or join another family to get started
                </p>
              </div>
            ) : (
              <div className={styles.membersList}>
                {familyMembers.map((member) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberAvatar}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.memberDetails}>
                        <div className={styles.memberName}>{member.name}</div>
                        <div className={styles.memberEmail}>{member.email}</div>
                      </div>
                    </div>
                    <div className={styles.memberActions}>
                      <div className={styles.memberPoints}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {member.points}
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className={styles.removeButton}
                        aria-label="Remove family member"
                        title="Remove family member"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
