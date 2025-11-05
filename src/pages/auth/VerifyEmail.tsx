import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Auth.module.css';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyEmail({ email, code: verificationCode });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await authService.resendVerification(email);
      setSuccessMessage('Verification code sent to your email');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Verify Your Email</h1>
          <p>
            We've sent a 6-digit code to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}

          <div className={styles.codeInputs}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={styles.codeInput}
                required
              />
            ))}
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className={styles.resendSection}>
            <p>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              className={styles.resendButton}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
