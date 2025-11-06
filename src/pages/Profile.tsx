import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import userService from '../services/userService';
import pointsService from '../services/pointsService';
import authService from '../services/authService';
import transactionService, { type Transaction } from '../services/transactionService';
import rewardService, { type Redemption } from '../services/rewardService';
import styles from './Profile.module.css';

export default function Profile() {
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Redemptions state
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);

  // Collapsible sections state
  const [isTransactionsExpanded, setIsTransactionsExpanded] = useState(false);
  const [isRedemptionsExpanded, setIsRedemptionsExpanded] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
    fetchRedemptions();
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

  const fetchTransactions = async () => {
    try {
      const transactionsData = await transactionService.getMyTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      toast.error('Failed to load transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const redemptionsData = await rewardService.getUserRedemptions();
      setRedemptions(redemptionsData);
    } catch (error) {
      toast.error('Failed to load redemption history');
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoadingRedemptions(false);
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

          {/* Family Members Quick Link */}
          <div className={styles.profileCard} style={{ marginTop: '2rem' }}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Family Members</h2>
              <p className={styles.sectionDescription}>
                Share points with family! When you earn more than 5 points on a receipt, each family member gets 1 bonus point.
              </p>
              <button
                onClick={() => navigate('/family')}
                className={styles.familyButton}
              >
                <svg
                  className={styles.familyIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Manage Family Members
              </button>
            </div>
          </div>

          {/* Transactions Card */}
          <div className={styles.profileCard} style={{ marginTop: '2rem' }}>
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => setIsTransactionsExpanded(!isTransactionsExpanded)}
              >
                <h2 className={styles.sectionTitle}>
                  Transaction History
                  {!loadingTransactions && transactions.length > 0 && (
                    <span className={styles.count}>({transactions.length})</span>
                  )}
                </h2>
                <svg
                  className={`${styles.chevron} ${isTransactionsExpanded ? styles.expanded : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {isTransactionsExpanded && (
                <>
                  {loadingTransactions ? (
                    <div className={styles.loadingText}>Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No transactions yet</p>
                      <p className={styles.emptyStateSubtext}>
                        Start scanning receipts to earn points!
                      </p>
                    </div>
                  ) : (
                <div className={styles.transactionsList}>
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className={styles.transactionItem}>
                      <div className={styles.transactionHeader}>
                        <div className={styles.transactionShop}>
                          <svg
                            className={styles.shopIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div>
                            <div className={styles.shopName}>{transaction.shop.name}</div>
                            <div className={styles.shopLocation}>{transaction.shop.location}</div>
                          </div>
                        </div>
                        <div className={styles.transactionPoints}>
                          <svg
                            className={styles.coinIconSmall}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <span>{transaction.points}</span>
                        </div>
                      </div>

                      <div className={styles.transactionDate}>
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      {transaction.transactionProducts.length > 0 && (
                        <div className={styles.productsList}>
                          <div className={styles.productsHeader}>Products:</div>
                          {transaction.transactionProducts.map((tp) => (
                            <div key={tp.productId} className={styles.productItem}>
                              <div className={styles.productInfo}>
                                <span className={styles.productName}>
                                  {tp.product.name}
                                </span>
                                <span className={styles.productQuantity}>
                                  x{tp.quantity}
                                </span>
                              </div>
                              <div className={styles.productPoints}>
                                {tp.pointsAwarded ? (
                                  <span className={styles.pointsAwarded}>
                                    {tp.pointsValue} pts
                                  </span>
                                ) : (
                                  <span className={styles.pointsPending}>
                                    Pending approval
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Redemption History Card */}
          <div className={styles.profileCard} style={{ marginTop: '2rem' }}>
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => setIsRedemptionsExpanded(!isRedemptionsExpanded)}
              >
                <h2 className={styles.sectionTitle}>
                  Redemption History
                  {!loadingRedemptions && redemptions.length > 0 && (
                    <span className={styles.count}>({redemptions.length})</span>
                  )}
                </h2>
                <svg
                  className={`${styles.chevron} ${isRedemptionsExpanded ? styles.expanded : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {isRedemptionsExpanded && (
                <>
                  {loadingRedemptions ? (
                <div className={styles.loadingText}>Loading redemptions...</div>
              ) : redemptions.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No redemptions yet</p>
                  <p className={styles.emptyStateSubtext}>
                    Redeem rewards with your points to see them here!
                  </p>
                </div>
              ) : (
                <div className={styles.redemptionsList}>
                  {redemptions.map((redemption) => (
                    <div key={redemption.id} className={styles.redemptionItem}>
                      <div className={styles.redemptionHeader}>
                        <div className={styles.redemptionReward}>
                          <svg
                            className={styles.giftIconSmall}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 12V22H4V12M2 7H22V12H2V7ZM12 7C12 5.89543 11.1046 5 10 5C8.89543 5 8 5.89543 8 7M12 7C12 5.89543 12.8954 5 14 5C15.1046 5 16 5.89543 16 7M12 7V22"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div>
                            <div className={styles.rewardName}>{redemption.reward.name}</div>
                            <div className={styles.rewardDescription}>
                              {redemption.reward.description}
                            </div>
                          </div>
                        </div>
                        <div className={styles.redemptionInfo}>
                          <div className={styles.pointsSpent}>
                            <svg
                              className={styles.coinIconSmall}
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>{redemption.pointsSpent}</span>
                          </div>
                          <span
                            className={`${styles.redemptionStatus} ${styles[redemption.status]}`}
                          >
                            {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.redemptionDate}>
                        {new Date(redemption.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
