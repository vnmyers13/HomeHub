import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import { apiClient } from './api/client';

// Placeholder components - will be implemented in later sprints
const SetupWizard = () => <div className="p-8">Setup Wizard - Coming Soon</div>;
const Login = () => <div className="p-8">Login - Coming Soon</div>;
const Dashboard = () => <div className="p-8">Dashboard - Coming Soon</div>;
const CalendarPage = () => <div className="p-8">Calendar - Coming Soon</div>;
const WallLayout = () => <div className="p-8">Wall Display - Coming Soon</div>;
const ManageUsers = () => <div className="p-8">Manage Users - Coming Soon</div>;
const CalendarSettings = () => <div className="p-8">Calendar Settings - Coming Soon</div>;
const AdminSettings = () => <div className="p-8">Admin Settings - Coming Soon</div>;

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if setup is complete
        const setupResponse = await apiClient.get('/auth/setup/status');
        if (!setupResponse.data.setup_complete) {
          window.location.href = '/setup';
          return;
        }

        // Check if user is authenticated
        const userResponse = await apiClient.get('/auth/me');
        setUser(userResponse.data);
      } catch (error) {
        // Not authenticated, redirect to login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/setup') {
          window.location.href = '/login';
        }
      }
    };

    checkAuth();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/wall" element={<WallLayout />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/calendars" element={<CalendarSettings />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
