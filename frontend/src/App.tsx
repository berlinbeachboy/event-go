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
          <AuthScreen onSuccess={fetchUser} />
        ) : (
          <>
            <Navbar onLogout={fetchUser}/>
            <MusicPlayer />
            <div>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage spotTypes={userSpots}/>} />
                <Route path="/spot" element={<SpotPage userSpots={userSpots}/>} />
                <Route path="/user" element={<UserPage/>} />
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
      </div>
      <Toaster />
    </Router>
  );
};

export default App;