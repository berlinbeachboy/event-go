// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
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

const App = () => {
  const { toast } = useToast();
  const { user, fetchUser } = useAuth();
  const { userSpots, fetchUserSpots } = useSpots()
  const [searchParams, _] = useSearchParams();
  const resetToken = searchParams.get("resetToken")
  const emailVerify = searchParams.get("verify")

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetchUser();
        await fetchUserSpots()
        if (emailVerify === "success"){
          toast({
               title: "Dein Account wurde verfiziert!",
               description: "Ab geht die Post!",
             });
        }

      } catch (error) {
        console.log(error)
      }
    };

    initializeApp();
  }, [fetchUser, fetchUserSpots, user?.type, toast]);


  return (
    <Router>
      <div className="min-h-screen w-screen bg-background">
        {!user ? (
          <AuthScreen pwResetToken={resetToken} onSuccess={fetchUser} />
        ) : (
          <>
            <Navbar />
            {/* <MusicPlayer /> */}
            <div className="pt-24">
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/user" element={<UserPage userSpots={userSpots} />} />
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