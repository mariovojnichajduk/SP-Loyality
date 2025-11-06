import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import pointsService from '../services/pointsService';
import shopsService from '../services/shopsService';
import styles from './Stores.module.css';

interface Shop {
  id: string;
  name: string;
  location: string;
  transactionCount: number;
  totalPoints: number;
  additionalPoints: number;
  hasPromotion: boolean;
  isFavorite: boolean;
  isTopPerformer: boolean;
  rank: number | null;
}

export default function Stores() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    fetchShops();
    fetchUserPoints();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await shopsService.getAllShops();
      setShops(data);
    } catch (error) {
      toast.error('Failed to load shops');
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const points = await pointsService.getUserPoints();
      setUserPoints(points);
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const toggleFavorite = async (shopId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await shopsService.removeFromFavorites(shopId);
      } else {
        await shopsService.addToFavorites(shopId);
      }

      setShops((prevShops) =>
        prevShops.map((shop) =>
          shop.id === shopId ? { ...shop, isFavorite: !isFavorite } : shop,
        ),
      );

      // Re-fetch to apply proper sorting
      fetchShops();

      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
      console.error('Error toggling favorite:', error);
    }
  };

  const getMedalIcon = (rank: number | null) => {
    if (!rank) return null;
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
    return (
      <svg
        className={styles.medal}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="14" r="6" fill={colors[rank - 1]} />
        <path
          d="M9 2L12 8L9 14"
          stroke={colors[rank - 1]}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 2L12 8L15 14"
          stroke={colors[rank - 1]}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontWeight="bold"
        >
          {rank}
        </text>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header points={userPoints} />
        <main className={styles.main}>
          <div className={styles.loading}>Loading stores...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header points={userPoints} />

      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Stores</h1>
          <p className={styles.subtitle}>
            Browse all participating stores and mark your favorites
          </p>

          <div className={styles.storesList}>
            {shops.map((shop) => (
              <div key={shop.id} className={`${styles.storeCard} ${shop.hasPromotion ? styles.promotionCard : ''}`}>
                <div className={styles.storeHeader}>
                  <div className={styles.storeInfo}>
                    <div className={styles.storeName}>
                      {shop.name}
                      {shop.isTopPerformer && getMedalIcon(shop.rank)}
                      {shop.hasPromotion && (
                        <span className={styles.promotionBadge}>
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                          +{shop.additionalPoints} bonus
                        </span>
                      )}
                    </div>
                    <div className={styles.storeLocation}>{shop.location}</div>
                  </div>
                  <button
                    className={`${styles.favoriteButton} ${shop.isFavorite ? styles.favorited : ''}`}
                    onClick={() => toggleFavorite(shop.id, shop.isFavorite)}
                    aria-label={shop.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={shop.isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                      />
                    </svg>
                  </button>
                </div>

                <div className={styles.storeStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Transactions</span>
                    <span className={styles.statValue}>{shop.transactionCount}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total Points</span>
                    <span className={styles.statValue}>{shop.totalPoints}</span>
                  </div>
                </div>

                {shop.isFavorite && (
                  <div className={styles.favoriteBadge}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    Favorite
                  </div>
                )}
              </div>
            ))}

            {shops.length === 0 && (
              <div className={styles.emptyState}>
                <p>No stores available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
