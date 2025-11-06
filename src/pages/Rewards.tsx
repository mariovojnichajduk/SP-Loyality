import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import rewardService, { type Reward } from '../services/rewardService';
import pointsService from '../services/pointsService';
import styles from './Rewards.module.css';

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsData, points] = await Promise.all([
        rewardService.getAllRewards(),
        pointsService.getUserPoints(),
      ]);

      setRewards(rewardsData);
      setUserPoints(points);
    } catch (error) {
      toast.error('Failed to load rewards');
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string, pointsCost: number) => {
    if (userPoints < pointsCost) {
      toast.error(`You need ${pointsCost} points but only have ${userPoints}`);
      return;
    }

    setRedeeming(rewardId);

    try {
      await rewardService.redeemReward(rewardId);
      toast.success('Reward redeemed successfully! Check your redemption history.');

      // Update user points
      const newPoints = await pointsService.getUserPoints();
      setUserPoints(newPoints);

      // Refresh rewards list (stock might have changed)
      const updatedRewards = await rewardService.getAllRewards();
      setRewards(updatedRewards);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to redeem reward';
      toast.error(errorMessage);
      console.error('Error redeeming reward:', error);
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header points={userPoints} />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <p>Loading rewards...</p>
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
          <div className={styles.header}>
            <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
              <svg
                className={styles.backIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Home
            </button>
            <h1 className={styles.title}>Available Rewards</h1>
            <div className={styles.pointsDisplay}>
              <svg
                className={styles.coinIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className={styles.pointsText}>Your Points: {userPoints}</span>
            </div>
          </div>

          {rewards.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No rewards available at the moment</p>
              <p className={styles.emptyStateSubtext}>
                Check back later for exciting rewards!
              </p>
            </div>
          ) : (
            <div className={styles.rewardsGrid}>
              {rewards.map((reward) => {
                const canAfford = userPoints >= reward.pointsCost;
                const isOutOfStock = reward.status === 'out_of_stock' ||
                                      (reward.stock !== null && reward.stock === 0);
                const isActive = reward.status === 'active';

                return (
                  <div
                    key={reward.id}
                    className={`${styles.rewardCard} ${!isActive || isOutOfStock ? styles.disabled : ''}`}
                  >
                    {reward.imageUrl && (
                      <div className={styles.imageContainer}>
                        <img
                          src={reward.imageUrl}
                          alt={reward.name}
                          className={styles.rewardImage}
                        />
                      </div>
                    )}

                    <div className={styles.rewardContent}>
                      <h3 className={styles.rewardName}>{reward.name}</h3>
                      <p className={styles.rewardDescription}>{reward.description}</p>

                      <div className={styles.rewardFooter}>
                        <div className={styles.costContainer}>
                          <svg
                            className={styles.coinIconSmall}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <span className={styles.cost}>{reward.pointsCost} pts</span>
                        </div>

                        {reward.stock !== null && (
                          <div className={styles.stockInfo}>
                            {reward.stock > 0 ? (
                              <span className={styles.inStock}>{reward.stock} left</span>
                            ) : (
                              <span className={styles.outOfStock}>Out of stock</span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRedeem(reward.id, reward.pointsCost)}
                        disabled={
                          !canAfford ||
                          !isActive ||
                          isOutOfStock ||
                          redeeming === reward.id
                        }
                        className={styles.redeemButton}
                      >
                        {redeeming === reward.id ? (
                          'Redeeming...'
                        ) : !isActive ? (
                          'Unavailable'
                        ) : isOutOfStock ? (
                          'Out of Stock'
                        ) : !canAfford ? (
                          `Need ${reward.pointsCost - userPoints} more pts`
                        ) : (
                          'Redeem'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
