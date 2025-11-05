# Loyalty Program - Frontend

A Progressive Web Application (PWA) built with React, TypeScript, and Vite for a loyalty program application.

## Features

- Progressive Web App (PWA) support
- Modern React with TypeScript
- Dark theme with pastel green accents
- Responsive design for mobile and desktop
- Complete authentication flow:
  - User registration
  - Email verification with 6-digit code
  - Login
  - Password reset with verification code
- Protected routes
- JWT token-based authentication

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite PWA Plugin** - Progressive Web App support

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (or use the existing one):
```env
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── Auth.module.css
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── authService.ts
│   ├── components/
│   ├── contexts/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── public/
├── .env
├── vite.config.ts
└── package.json
```

## Theme Colors

The application uses a dark theme with the following color palette:

- **Primary Background:** `#1a1a1a` (Dark Gray)
- **Secondary Background:** `#2d2d2d` (Medium Gray)
- **Tertiary Background:** `#3a3a3a` (Light Gray)
- **Primary Text:** `#e5e5e5` (Light Gray)
- **Secondary Text:** `#b0b0b0` (Medium Gray)
- **Accent:** `#a8d5ba` (Pastel Green)
- **Accent Hover:** `#8bc9a3`
- **Accent Dark:** `#7ab893`

## Authentication Flow

1. **Register** → User creates account with email, name, and password
2. **Verify Email** → User enters 6-digit code sent to their email
3. **Login** → User logs in with verified credentials
4. **Dashboard** → Protected area accessible only after authentication

### Password Reset Flow

1. **Forgot Password** → User requests reset code
2. **Reset Password** → User enters code and new password
3. **Login** → User logs in with new password

## API Integration

The frontend communicates with the NestJS backend API. All requests include JWT tokens for authenticated routes.

### API Endpoints Used

- `POST /auth/register` - Register new user
- `POST /auth/verify-email` - Verify email with code
- `POST /auth/resend-verification` - Resend verification code
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with code

## PWA Features

The application is configured as a Progressive Web App with:

- Offline support
- Install to home screen
- Service worker for caching
- App manifest for native-like experience

## License

MIT
