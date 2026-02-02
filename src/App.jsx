// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';  // ← make sure these are imported
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BoardsPage from './pages/BoardsPage';
import BoardDetailPage from './pages/BoardDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);


  return (
    <AuthProvider>
      <Routes>
        {/* Public routes – no protection */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes – wrap the whole layout */}
        <Route
          path="/*"
          element={
            <ProtectedLayout>
              <div className="grid grid-cols-[auto_1fr] h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors duration-300">
                <div className="relative">
                  <Sidebar isSidebarCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
                </div>

                {!isSidebarCollapsed && (
                  <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={toggleSidebar} />
                )}

                <div className="flex flex-col min-h-0">
                  <Header
                    toggleDarkMode={toggleDarkMode}
                    darkMode={darkMode}
                    toggleSidebar={toggleSidebar}
                    isSidebarCollapsed={isSidebarCollapsed}
                  />

                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      {/* ← IMPORTANT: Nested <Routes> for the protected part */}
                      <Route path="/" element={<BoardsPage isSidebarCollapsed={isSidebarCollapsed} />} />
                      <Route path="/board/:boardId" element={<BoardDetailPage />} />
                      <Route path="/my-tasks" element={<MyTasksPage isSidebarCollapsed={isSidebarCollapsed} />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>

                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      borderRadius: '12px',
                      padding: '16px 24px',
                      fontSize: '16px',
                      maxWidth: '400px',
                    },
                    success: {
                      style: {
                        background: '#10b981',
                        color: 'white',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                        color: 'white',
                      },
                    },
                  }}
                />
              </div>
            </ProtectedLayout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;