import { useState, useEffect } from 'react';
import axios from './axiosConfig';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import SpotSelectionCard from './components/SpotSelection';
import { UserType , SpotType } from './models';
import AdminTable from './components/AdminTable';
import AdminSpotTable from './components/SpotTypeTable';
import { AppSidebar } from './components/SidebarNew';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [spots, setSpots] = useState<SpotType[]>([]);
  const [noLoginView, setNoLoginView] = useState<'login' | 'register'>('login');
  const [view, setView] = useState<'spotSelect' | 'changeMe' | 'userTable' | 'spotTable'>('spotSelect');
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetchUserInfo();
    fetchSpotInfo();
  }, []);
  const fetchUserInfo = async () => {
    try {
      const { data } = await axios.get('/user/me');
      setUserInfo(data);
      setIsLoggedIn(true);
      setIsAdmin(data.type === "admin");
      console.log("Last Login: " + data.lastLogin)
    } catch (error) {
      console.error('Error fetching user info', error);
    }
  };
  const fetchSpotInfo = async () => {
    try {
      const { data } = await axios.get('/user/spots/');
      setSpots(data);
    } catch (error) {
      console.error('Error fetching Spot Types', error);
    }
  };

  const handleLogin = async () => {
    fetchUserInfo();
    fetchSpotInfo();
  };

  const handleLogout = async () => {
    try {
      await axios.post('/user/logout');
      setIsLoggedIn(false);
      setUserInfo(null);
      setNoLoginView('login');
    } catch (error) {
      console.error('Error during logout', error);
    }
  };

  return (
    <div className="flex w-full">
      
      {isLoggedIn && userInfo && <SidebarProvider>
        <SidebarTrigger className="-ml-1 p-2 rounded fixed top-4 left-4 z-50 block md:hidden" />
        <AppSidebar user={userInfo} handleLogout={handleLogout} changeView={setView}/>
      </SidebarProvider>}
      {/* {isLoggedIn && userInfo ? (
        <Sidebar userInfo={userInfo} onLogout={handleLogout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      ) : null} */}
      <div className={`flex-2 p-2 w-full md:p-8 `}>
        <div className="w-full">
          {!isLoggedIn ? (
            <div>
              {noLoginView === 'login' ? <LoginForm onLogin={handleLogin} /> : <RegisterForm />}
              <p className="text-center mt-4 text-gray-800">
                {noLoginView === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setNoLoginView('register')}
                      className="text-blue-500 hover:underline"
                    >
                      Register here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setNoLoginView('login')}
                      className="text-blue-500 hover:underline"
                    >
                      Login here
                    </button>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className={`flex-2 p-2 w-full md:p-8 `}>
              {view === 'spotSelect' && userInfo && spots && <SpotSelectionCard user={userInfo} spotTypes={spots} onUpdate={handleLogin}/>}
              {view === 'userTable' && userInfo && spots && isAdmin && <AdminTable spotTypes={spots} />}
              {view === 'spotTable' && userInfo && spots && isAdmin && <AdminSpotTable spotTypes={spots} onUpdate={fetchSpotInfo}/>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
