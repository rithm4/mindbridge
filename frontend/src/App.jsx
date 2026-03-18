import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Pages
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import CalendarPage     from './pages/CalendarPage';
import BookPage         from './pages/BookPage';
import VideoCallPage    from './pages/VideoCallPage';
import ProfilePage      from './pages/ProfilePage';

// Layout
import AppShell from './components/common/AppShell';
import { FullPageSpinner } from './components/common/Spinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Private — wrapped in AppShell */}
      <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="calendar"     element={<CalendarPage />} />
        <Route path="book"         element={<BookPage />} />
        <Route path="profile"      element={<ProfilePage />} />
      </Route>

      {/* Video call — fullscreen, fără shell */}
      <Route
        path="/call/:roomId"
        element={<PrivateRoute><VideoCallPage /></PrivateRoute>}
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
