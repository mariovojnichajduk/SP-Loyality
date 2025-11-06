import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import styles from './Header.module.css';

interface HeaderProps {
  points: number;
}

export default function Header({ points }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M140 180 L140 430 C140 445 150 455 165 455 L347 455 C362 455 372 445 372 430 L372 180 Z"
                  fill="none" stroke="currentColor" strokeWidth="40" strokeLinejoin="round"/>
            <line x1="120" y1="180" x2="392" y2="180" stroke="currentColor" strokeWidth="40" strokeLinecap="round"/>
            <path d="M185 180 C185 140 210 110 256 110 C302 110 327 140 327 180"
                  fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round"/>
            <path d="M256 260 L272 300 L315 305 L285 335 L293 378 L256 357 L219 378 L227 335 L197 305 L240 300 Z"
                  fill="currentColor"/>
          </svg>
          <span>M-Star Loyalty</span>
        </div>

        <div className={styles.navItems}>
          <button onClick={() => navigate('/dashboard')} className={styles.navButton}>
            Home
          </button>
          <button onClick={() => navigate('/stores')} className={styles.navButton}>
            Stores
          </button>
          <button onClick={() => navigate('/profile')} className={styles.navButton}>
            My Profile
          </button>
          <button onClick={handleLogout} className={styles.navButton}>
            Logout
          </button>
        </div>

        <button onClick={() => navigate('/rewards')} className={styles.pointsDisplay}>
          <svg
            className={styles.coinIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v12M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
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
          <span className={styles.points}>{points}</span>
        </button>
      </nav>
    </header>
  );
}
