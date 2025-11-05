import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import authService from '../services/authService';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    // Load user data from localStorage
    const user = authService.getUser();
    if (user) {
      setUserPoints(user.points);
    }
  }, []);

  const handleScanQR = () => {
    // TODO: Implement QR scanner functionality
    toast.info('QR Scanner will be implemented soon');
  };

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!link.trim()) {
      toast.error('Please enter a valid link');
      return;
    }

    setLoading(true);

    try {
      // TODO: Send link to API for processing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Link processed successfully!');
      setLink('');
    } catch (error) {
      toast.error('Failed to process link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header points={userPoints} />

      <main className={styles.main}>
        <h1 className={styles.title}>Earn Loyalty Points</h1>
        <p className={styles.subtitle}>
          Scan a QR code or enter a link manually to collect your points
        </p>

        <div className={styles.actionsContainer}>
          {/* QR Scanner Card */}
          <div className={styles.actionCard}>
            <h2 className={styles.actionTitle}>
              <svg
                className={styles.actionIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
                <rect x="16" y="16" width="3" height="3" fill="currentColor"/>
              </svg>
              Scan QR Code
            </h2>
            <p className={styles.actionDescription}>
              Use your device camera to scan a QR code and instantly earn points
            </p>
            <button
              onClick={handleScanQR}
              className={styles.scanButton}
            >
              Open Scanner
            </button>
          </div>

          {/* Manual Link Entry Card */}
          <div className={styles.actionCard}>
            <h2 className={styles.actionTitle}>
              <svg
                className={styles.actionIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Enter Link Manually
            </h2>
            <p className={styles.actionDescription}>
              Have a loyalty link? Paste it here to collect your points
            </p>
            <form onSubmit={handleSubmitLink} className={styles.inputGroup}>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Paste your loyalty link here..."
                className={styles.linkInput}
              />
              <button
                type="submit"
                disabled={loading || !link.trim()}
                className={styles.submitButton}
              >
                {loading ? 'Processing...' : 'Submit Link'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
