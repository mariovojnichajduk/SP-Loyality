import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ReceiptModal from '../components/ReceiptModal';
import QRScannerModal from '../components/QRScannerModal';
import pointsService from '../services/pointsService';
import receiptService, { type ProcessReceiptResponse } from '../services/receiptService';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ProcessReceiptResponse | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user points from API
    const fetchPoints = async () => {
      try {
        const points = await pointsService.getUserPoints();
        setUserPoints(points);
      } catch (error) {
        toast.error('Failed to load points balance');
        console.error('Error fetching points:', error);
      }
    };

    fetchPoints();
  }, []);

  const handleScanQR = () => {
    setIsQRScannerOpen(true);
  };

  const handleQRScan = async (scannedText: string) => {
    console.log('Scanned QR Code:', scannedText);

    // Process the scanned link just like manual submission
    setLoading(true);
    try {
      const data = await receiptService.processReceipt(scannedText);
      setReceiptData(data);
      setIsModalOpen(true);
      toast.success('Receipt processed successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to process receipt. Please try again.';
      toast.error(errorMessage);
      console.error('Error processing receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!link.trim()) {
      toast.error('Please enter a valid link');
      return;
    }

    setLoading(true);

    try {
      const data = await receiptService.processReceipt(link);
      setReceiptData(data);
      setIsModalOpen(true);
      setLink('');
      toast.success('Receipt processed successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to process receipt. Please try again.';
      toast.error(errorMessage);
      console.error('Error processing receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setReceiptData(null);
  };

  const handlePointsCollected = async () => {
    // Refresh user points after collection
    try {
      const points = await pointsService.getUserPoints();
      setUserPoints(points);
    } catch (error) {
      console.error('Error refreshing points:', error);
    }
  };

  return (
    <div className={styles.container}>
      <Header points={userPoints} />

      <main className={styles.main}>
        <div className={styles.content}>
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

          {/* Rewards Button */}
          <div className={styles.rewardsSection}>
            <button
              onClick={() => navigate('/rewards')}
              className={styles.rewardsButton}
            >
              <svg
                className={styles.giftIcon}
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
                <div className={styles.rewardsButtonTitle}>Redeem Points</div>
                <div className={styles.rewardsButtonSubtitle}>Browse available rewards</div>
              </div>
            </button>
          </div>
        </div>
      </main>

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        receiptData={receiptData}
        onPointsCollected={handlePointsCollected}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}
