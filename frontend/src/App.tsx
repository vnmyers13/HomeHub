import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import { useSetupStatus, useMe } from './api/auth';
import SetupWizard from './pages/SetupWizard';
import Login from './pages/Login';
import ManageUsers from './pages/admin/ManageUsers';
import OfflineBanner from './components/OfflineBanner';
import InstallPrompt from './components/InstallPrompt';

// Placeholder components - will be implemented in later sprints
const Dashboard = () => <div className="p-8">Dashboard - Coming Soon</div>;
const CalendarPage = () => <div className="p-8">Calendar - Coming Soon</div>;
const WallLayout = () => <div className="p-8">Wall Display - Coming Soon</div>;
const CalendarSettings = () => <div className="p-8">Calendar Settings - Coming Soon</div>;
const AdminSettings = () => <div className="p-8">Admin Settings - Coming Soon</div>;

function App() {
  const { setUser } = useAuthStore();
  const { data: setupStatus } = useSetupStatus();
  const { data: currentUser } = useMe();

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  return (
    <>
      <OfflineBanner />
      <InstallPrompt />
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
          <Route 
            path="/" 
            element={
              setupStatus?.setup_complete === false ? (
                <Navigate to="/setup" replace />
              ) : currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
