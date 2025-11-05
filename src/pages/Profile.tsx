import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import userService from '../services/userService';
import pointsService from '../services/pointsService';
import authService from '../services/authService';
import styles from './Profile.module.css';

export default function Profile() {
  const [userPoints, setUserPoints] = useState(0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [profile, points] = await Promise.all([
        userService.getUserProfile(),
        pointsService.getUserPoints()
      ]);

      setEmail(profile.email);
      setName(profile.name);
      setNewName(profile.name);
      setCreatedAt(new Date(profile.createdAt).toLocaleDateString());
      setUserPoints(points);

      // Update stored user data
      authService.setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        points: points
      });
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (newName === name) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);

    try {
      await userService.updateName({ name: newName });
      setName(newName);
      setIsEditingName(false);
      toast.success('Name updated successfully');

      // Update stored user data
      const user = authService.getUser();
      if (user) {
        authService.setUser({ ...user, name: newName });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update name');
      console.error('Error updating name:', error);
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(name);
    setIsEditingName(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header points={userPoints} />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <p>Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header points={userPoints} />

      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>My Profile</h1>

          <div className={styles.profileCard}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Account Information</h2>

              <div className={styles.infoGroup}>
                <label className={styles.label}>Email</label>
                <div className={styles.infoValue}>{email}</div>
              </div>

              <div className={styles.infoGroup}>
                <label className={styles.label}>Name</label>
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className={styles.editForm}>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={styles.editInput}
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <div className={styles.editButtons}>
                      <button
                        type="submit"
                        disabled={savingName}
                        className={styles.saveButton}
                      >
                        {savingName ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={savingName}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.infoValueEditable}>
                    <span>{name}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.infoGroup}>
                <label className={styles.label}>Member Since</label>
                <div className={styles.infoValue}>{createdAt}</div>
              </div>

              <div className={styles.infoGroup}>
                <label className={styles.label}>Loyalty Points</label>
                <div className={styles.pointsValue}>
                  <svg
                    className={styles.coinIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{userPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
