import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { AdminModeProvider } from './contexts/AdminModeContext';
import App from './App';
import './index.css';
import { initializeTestData } from './services/testData';

// Initialize test data before rendering
initializeTestData().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <AdminModeProvider>
          <App />
        </AdminModeProvider>
      </AuthProvider>
    </StrictMode>,
  );
});