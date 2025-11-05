import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ProcessReceiptResponse } from '../services/receiptService';
import productService from '../services/productService';
import styles from './ReceiptModal.module.css';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ProcessReceiptResponse | null;
}

export default function ReceiptModal({ isOpen, onClose, receiptData }: ReceiptModalProps) {
  const [approvalStatus, setApprovalStatus] = useState<Record<string, boolean>>({});
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchApprovalStatus();
    }
  }, [isOpen]);

  const fetchApprovalStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await productService.getApprovalStatus();
      setApprovalStatus(response.approvalStatus);
    } catch (error) {
      console.error('Failed to fetch approval status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleRequestApproval = async (productName: string) => {
    try {
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

      const response = await productService.requestApproval(requestData);
      toast.success(`Approval requested for "${productName}"`);

      // Update approval status to disable the button
      setApprovalStatus(prev => ({
        ...prev,
        [productName]: true,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to request approval';
      toast.error(errorMessage);
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
          <button onClick={onClose} className={styles.closeButton}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {receiptData.storeName && (
            <div className={styles.infoSection}>
              <p className={styles.storeName}>{receiptData.storeName}</p>
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
                      onClick={() => handleRequestApproval(product.product)}
                      className={styles.approvalButton}
                      disabled={approvalStatus[product.product] === true}
                    >
                      {approvalStatus[product.product] ? 'Pending' : 'Request Approval'}
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
          <button onClick={onClose} className={styles.doneButton}>
            Collect Points
          </button>
        </div>
      </div>
    </div>
  );
}
