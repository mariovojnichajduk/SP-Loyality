import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'react-toastify';
import styles from './QRScannerModal.module.css';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  if (!isOpen) return null;

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedText = result[0].rawValue;
      onScan(scannedText);
      onClose();
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
    toast.error('Failed to access camera');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Scan QR Code</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.scannerContainer}>
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment',
            }}
            styles={{
              container: {
                width: '100%',
                height: '100%',
              },
              finderBorder: 4,
            }}
            components={{
              finder: false,
            }}
          />
          <div className={styles.scannerOverlay}>
            <div className={styles.scannerFrame}></div>
          </div>
        </div>

        <div className={styles.instructions}>
          <p>Position the QR code within the frame to scan</p>
        </div>
      </div>
    </div>
  );
}
