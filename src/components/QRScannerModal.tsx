import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'react-toastify';
import styles from './QRScannerModal.module.css';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLink, setManualLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedText = result[0].rawValue;

      // Validate that the URL contains suf.purs.gov.rs
      if (!scannedText.includes('suf.purs.gov.rs')) {
        toast.error('Invalid receipt QR code. Please scan a valid PU RS receipt.');
        return;
      }

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
      handleClose();
    }
  };

  const handleClose = () => {
    setShowManualInput(false);
    setManualLink('');
    setSubmitting(false);
    onClose();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualLink.trim()) {
      toast.error('Please enter a valid link');
      return;
    }

    setSubmitting(true);
    try {
      await onScan(manualLink);
      setManualLink('');
      handleClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {showManualInput ? 'Enter Link Manually' : 'Scan QR Code'}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {!showManualInput ? (
          <>
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
                  }
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

            <div className={styles.footer}>
              <button
                onClick={() => setShowManualInput(true)}
                className={styles.manualLinkButton}
              >
                Having issues? Try entering link manually
              </button>
            </div>
          </>
        ) : (
          <div className={styles.manualInputContainer}>
            <p className={styles.manualInstructions}>
              Paste your loyalty receipt link below
            </p>
            <form onSubmit={handleManualSubmit} className={styles.manualForm}>
              <input
                type="text"
                value={manualLink}
                onChange={(e) => setManualLink(e.target.value)}
                placeholder="Paste your loyalty link here..."
                className={styles.manualInput}
                autoFocus
              />
              <div className={styles.manualButtons}>
                <button
                  type="submit"
                  disabled={submitting || !manualLink.trim()}
                  className={styles.submitButton}
                >
                  {submitting ? 'Processing...' : 'Submit Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualInput(false);
                    setManualLink('');
                  }}
                  className={styles.backButton}
                >
                  Back to Scanner
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
