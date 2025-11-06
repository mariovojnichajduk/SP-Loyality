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
          <span>Loyalty Program</span>
        </div>

        <div className={styles.navItems}>
          <button onClick={() => navigate('/dashboard')} className={styles.navButton}>
            Home
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
