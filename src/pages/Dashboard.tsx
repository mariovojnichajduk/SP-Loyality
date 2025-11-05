import authService from '../services/authService';

export default function Dashboard() {
  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Dashboard</h1>
      <p>Welcome to your loyalty program dashboard!</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-bg-primary)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        Logout
      </button>
    </div>
  );
}
