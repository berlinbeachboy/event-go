import { useEffect, useState } from 'react';
import { useAuth } from '@/api/hooks/use-auth';
import { useSpots } from '@/api/hooks/use-spots';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Components
import AuthScreen from './components/AuthScreen';
import SpotSelectionCard from '@/components/SpotSelection';
import AdminTable from '@/components/AdminTable';
import AdminSpotTable from '@/components/SpotTypeTable';
import { AppSidebar } from '@/components/SidebarNew';
import { SidebarTrigger } from '@/components/ui/sidebar';

// View type management
type ViewType = 'spotSelect' | 'changeMe' | 'userTable' | 'spotTable';
const DEFAULT_VIEW: ViewType = 'spotSelect';

const App = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading, fetchUser, logout } = useAuth();
  const { spots, isLoading: spotsLoading, fetchSpots } = useSpots();
  const [view, setView] = useState<ViewType>(DEFAULT_VIEW);

  // Initial data fetch
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([fetchUser(), fetchSpots()]);
      } catch (error) {
        console.log(error)
        toast({
          title: "Error loading app data",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      }
    };

    initializeApp();
  }, [fetchUser, fetchSpots, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('Logging out');
      await logout();
      setView(DEFAULT_VIEW);
    } catch (error) {
      toast({
        title: "Error logging out: " + error,
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.type === 'admin';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen bg-background">
        {!user ? (
          <AuthScreen onSuccess={async () => {
            await Promise.allSettled([fetchUser(), fetchSpots()]);
          }} />
        ) : (
          <div className="flex w-full">
            <SidebarTrigger className="-ml-1 p-2 rounded fixed top-4 left-4 z-50 block md:hidden" />
            <AppSidebar 
              user={user} 
              handleLogout={handleLogout} 
              changeView={setView}
            />
            <main className="flex-1 p-2 md:p-8">
              {spotsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="w-full">
                  {view === 'spotSelect' && (
                    <SpotSelectionCard 
                      user={user} 
                      spotTypes={spots} 
                      onUpdate={fetchSpots}
                    />
                  )}
                  {view === 'userTable' && isAdmin && (
                    <AdminTable spotTypes={spots} />
                  )}
                  {view === 'spotTable' && isAdmin && (
                    <AdminSpotTable 
                      spotTypes={spots} 
                      onUpdate={fetchSpots}
                    />
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default App;