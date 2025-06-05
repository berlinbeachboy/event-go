// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/api/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
//import { MusicPlayer } from './components/MusicPlayer';

// Pages
import HomePage from '@/pages/home';
import UserPage from '@/pages/user';
import AdminPage from '@/pages/admin';
import AuthScreen from './components/AuthScreen';
import { Navbar } from '@/components/Navbar';
import { useSpots } from './api/hooks/use-spots';
import { MusicPlayer } from './components/MusicPlayer';
import SpotPage from './pages/spot';
import ImprintPage from './pages/imprint';
import PrivacyPage from './pages/privacy';
import ShiftPage from './pages/shift';
import SchedulePage from './pages/schedule';
import DjsPage from './pages/djs';

// Footer Component
const Footer = () => (
  <footer className="w-full text-grey text-center p-4">
    <div className="flex justify-center space-x-4">
      <a href="/" className="hover:underline">
        Home
      </a>
      <a href="/impressum" className="hover:underline">
        Impressum
      </a>
      <a href="/privacy" className="hover:underline">
        Datenschutz
      </a>
    </div>
  </footer>
);

const App = () => {
  const { toast } = useToast();
  var { user, fetchUser } = useAuth();
  const { userSpots, fetchUserSpots } = useSpots()
  

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetchUser();
        await fetchUserSpots()
        

      } catch (error) {
        console.log(error)
        user = null
      }
    };

    initializeApp();
  }, [fetchUser, fetchUserSpots, user?.type, toast]);


  return (
    <Router>
      <div className="min-h-screen w-screen bg-background">
        {!user ? (
          <>
          <Routes>
              <Route path="/register" element={<AuthScreen onSuccess={fetchUser} startView='register'/>} />
              <Route path="/impressum" element={<ImprintPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<AuthScreen onSuccess={fetchUser} startView='login' />} />
            </Routes>
          </>
        ) : (
          <>
            <Navbar onLogout={fetchUser}/>
            <MusicPlayer />
            <div>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/register" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage spotTypes={userSpots}/>} />
                <Route
                  path="/shifts"
                  element={<ShiftPage />}
                />
                <Route
                  path="/schedule"
                  element={<SchedulePage />}
                />
                <Route
                  path="/timetable"
                  element={<DjsPage />}
                />
                <Route path="/spot" element={<SpotPage userSpots={userSpots}/>} />
                <Route path="/user" element={<UserPage/>} />
                <Route path="/impressum" element={<ImprintPage/>} />
                <Route path="/privacy" element={<PrivacyPage/>} />
                <Route
                  path="/admin"
                  element={
                    user.type === 'admin' ? <AdminPage /> : <Navigate to="/home" replace />
                  }
                />
              </Routes>
            </div>
            
          </>
        )}
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
};

export default App;