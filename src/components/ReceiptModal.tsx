import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ProcessReceiptResponse } from '../services/receiptService';
import productService from '../services/productService';
import receiptService from '../services/receiptService';
import styles from './ReceiptModal.module.css';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ProcessReceiptResponse | null;
  onPointsCollected?: () => void;
}

export default function ReceiptModal({ isOpen, onClose, receiptData, onPointsCollected }: ReceiptModalProps) {
  const [approvalStatus, setApprovalStatus] = useState<Record<string, boolean>>({});
  const [collectingPoints, setCollectingPoints] = useState(false);
  const [receiptSaved, setReceiptSaved] = useState(false);
  const [requestingApproval, setRequestingApproval] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      fetchApprovalStatus();
      setReceiptSaved(false); // Reset saved flag when modal opens
    }
  }, [isOpen]);

  const fetchApprovalStatus = async () => {
    try {
      const response = await productService.getApprovalStatus();
      setApprovalStatus(response.approvalStatus);
    } catch (error) {
      console.error('Failed to fetch approval status:', error);
    }
  };

  const handleRequestApproval = async (productName: string) => {
    if (!receiptData) return;

    // Set loading state for this specific product
    setRequestingApproval(prev => ({ ...prev, [productName]: true }));

    try {
      // First, save the receipt if not already saved
      if (!receiptSaved) {
        try {
          const response = await receiptService.collectPoints(receiptData);
          setReceiptSaved(true);

          // Show the same toast as collect points
          if (response.pointsAwarded > 0) {
            toast.success(`${response.pointsAwarded} points collected successfully!`);
          } else {
            toast.info(response.message || 'Receipt saved. Points will be awarded when products are approved.');
          }

          // Notify parent to refresh points
          if (onPointsCollected) {
            onPointsCollected();
          }
        } catch (saveError: any) {
          // If receipt was already collected, mark as saved but don't show error
          const errorMessage = saveError.response?.data?.message || '';
          if (errorMessage.includes('already been used')) {
            setReceiptSaved(true);
          } else {
            // For other errors, show the error and disable button permanently
            toast.error(errorMessage || 'Failed to save receipt');
            setApprovalStatus(prev => ({ ...prev, [productName]: true })); // Disable button
            return;
          }
        }
      }

      const requestData: { productName: string; shopId?: string; rawStoreName?: string } = {
        productName,
      };

      // Only include shopId if it exists
      if (receiptData.shopId) {
        requestData.shopId = receiptData.shopId;
      }

      // Include rawStoreName for shop lookup if not found by cleaned name
      if (receiptData.rawStoreName) {
        requestData.rawStoreName = receiptData.rawStoreName;
      }

      await productService.requestApproval(requestData);
      toast.success(`Approval requested for "${productName}"`);

      // Update approval status to disable the button
      setApprovalStatus(prev => ({
        ...prev,
        [productName]: true,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to request approval';
      toast.error(errorMessage);
      // Disable button on error
      setApprovalStatus(prev => ({ ...prev, [productName]: true }));
    } finally {
      // Clear loading state
      setRequestingApproval(prev => ({ ...prev, [productName]: false }));
    }
  };

  const handleCollectPoints = async (skipClose = false) => {
    if (!receiptData) return;

    // Close modal immediately when user clicks the button (not when called from approval request)
    if (!skipClose) {
      onClose();
    }

    try {
      setCollectingPoints(true);
      const response = await receiptService.collectPoints(receiptData);

      // Mark receipt as saved
      setReceiptSaved(true);

      // Show appropriate message based on points awarded (only if not called silently)
      if (!skipClose) {
        if (response.pointsAwarded > 0) {
          toast.success(`${response.pointsAwarded} points collected successfully!`);
        } else {
          toast.info(response.message || 'Receipt saved. Points will be awarded when products are approved.');
        }
      }

      // Notify parent to refresh points
      if (onPointsCollected) {
        onPointsCollected();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to collect points';

      // Only show error if not skipping close (user explicitly clicked the button)
      if (!skipClose) {
        toast.error(errorMessage);
      }
      console.error('Error collecting points:', error);
      throw error; // Re-throw so approval request can handle it
    } finally {
      setCollectingPoints(false);
    }
  };

  if (!isOpen || !receiptData) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const missingProducts = receiptData.products.filter(p => p.doesExist === false);
  const existingProducts = receiptData.products.filter(p => p.doesExist === true);

  // Separate existing products into approved and pending
  const approvedProducts = existingProducts.filter(p => (p.pointValue || 0) > 0);
  const pendingProducts = existingProducts.filter(p => p.pointValue === 0);

  const totalPoints = approvedProducts.reduce((sum, product) => {
    return sum + (product.pointValue || 0) * product.quantity;
  }, 0);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Receipt Processed</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {(receiptData.storeName || receiptData.rawStoreName) && (
            <div className={styles.infoSection}>
              <p className={styles.storeName}>
                {receiptData.storeName || receiptData.rawStoreName}
              </p>
              {receiptData.receiptDate && (
                <p className={styles.receiptDate}>{receiptData.receiptDate}</p>
              )}
            </div>
          )}

          {approvedProducts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Approved Products ({approvedProducts.length})
              </h3>
              <div className={styles.productList}>
                {approvedProducts.map((product, index) => (
                  <div key={index} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.product}</span>
                      <div className={styles.productMeta}>
                        <span className={styles.productQuantity}>x{product.quantity}</span>
                        {product.pointValue !== undefined && (
                          <span className={styles.productPoints}>
                            {product.pointValue * product.quantity} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingProducts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg className={styles.pendingIcon} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Pending Approval ({pendingProducts.length})
              </h3>
              <div className={styles.productList}>
                {pendingProducts.map((product, index) => (
                  <div key={index} className={styles.productItemPending}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.product}</span>
                      <div className={styles.productMeta}>
                        <span className={styles.productQuantity}>x{product.quantity}</span>
                      </div>
                    </div>
                    <span className={styles.pendingLabel}>Pending Approval</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {missingProducts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Products Not in Database ({missingProducts.length})
              </h3>
              <div className={styles.productList}>
                {missingProducts.map((product, index) => (
                  <div key={index} className={styles.productItemMissing}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.product}</span>
                      <span className={styles.productQuantity}>x{product.quantity}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRequestApproval(product.product)}
                      className={styles.approvalButton}
                      disabled={approvalStatus[product.product] === true || requestingApproval[product.product] === true}
                    >
                      {requestingApproval[product.product]
                        ? 'Requesting...'
                        : approvalStatus[product.product]
                        ? 'Pending'
                        : 'Request Approval'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalPoints > 0 && (
            <div className={styles.summarySection}>
              <div className={styles.pointsTotal}>
                <span className={styles.pointsLabel}>
                  <svg className={styles.coinIcon} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Total Points:
                </span>
                <span className={styles.pointsTotalValue}>{totalPoints}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => handleCollectPoints()}
            className={styles.doneButton}
            disabled={collectingPoints}
          >
            {collectingPoints
              ? 'Processing...'
              : totalPoints > 0
              ? 'Collect Points'
              : pendingProducts.length > 0
              ? 'Save Receipt'
              : 'Collect Points'}
          </button>
          {pendingProducts.length > 0 && totalPoints === 0 && (
            <p className={styles.pendingNote}>
              Your receipt will be saved. Points will be awarded when products are approved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
