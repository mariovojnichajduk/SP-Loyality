import { toast } from 'react-toastify';
import type { ProcessReceiptResponse } from '../services/receiptService';
import styles from './ReceiptModal.module.css';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ProcessReceiptResponse | null;
}

export default function ReceiptModal({ isOpen, onClose, receiptData }: ReceiptModalProps) {
  if (!isOpen || !receiptData) return null;

  const handleRequestApproval = (productName: string) => {
    // TODO: Implement approval request API call
    toast.info(`Approval request for "${productName}" will be implemented`);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const missingProducts = receiptData.products.filter(p => p.doesExist === false);
  const existingProducts = receiptData.products.filter(p => p.doesExist === true);

  const totalPoints = existingProducts.reduce((sum, product) => {
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

          {existingProducts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Products Found ({existingProducts.length})
              </h3>
              <div className={styles.productList}>
                {existingProducts.map((product, index) => (
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
                    >
                      Request Approval
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.summarySection}>
            {totalPoints > 0 && (
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
            )}

            {receiptData.totalAmount && (
              <div className={styles.totalSection}>
                <span className={styles.totalLabel}>Total Amount:</span>
                <span className={styles.totalAmount}>{receiptData.totalAmount.toFixed(2)} RSD</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.doneButton}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
