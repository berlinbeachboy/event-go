// src/pages/AdminPage.tsx
import { useAdmin } from '@/api/hooks/use-admin';
import { Loader2 } from 'lucide-react';
import AdminTable from '@/components/AdminTable';
import AdminSpotTable from '@/components/SpotTypeTable';
import { useState, useEffect } from 'react'; // Removed useEffect
import { Button } from '@/components/ui/button';
import SpotCalculator from '@/components/SpotCalculator';

type ViewType = 'userTable' | 'spotTable';

const AdminPage = () => {
  const {
    spots,
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    fetchSpots,
    fetchUsers,
    createSpot,
    updateSpot,
    deleteSpot
  } = useAdmin();

  const [view, setView] = useState<ViewType>('userTable');
  useEffect(() => {
    const fetchData = async () => {
        await fetchUsers();
        await fetchSpots();
    };

    fetchData();
  }, [view, fetchUsers, fetchSpots]);
  const soliAmount = users.reduce((sum, user) => {
    if (user.takesSoli) {
      return sum + (user.soliAmount - 25);
    } else {
      return sum + user.soliAmount;
    }
  }, 0);


  return (
    <div className="flex w-full">
      <main className="flex-1 p-2 md:p-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="w-full">
            <div className="md:hidden"><br/><br></br><br/></div>
            <div className="mb-4 space-x-2">
              <Button
                variant={view === 'userTable' ? 'default' : 'secondary'}
                onClick={() => setView('userTable')}
              >
                Users
              </Button>
              <Button
                variant={view === 'spotTable' ? 'default' : 'secondary'}
                onClick={() => setView('spotTable')}
              >
                Spots
              </Button>
            </div>

            {view === 'userTable' && (
              <AdminTable
                users={users}
                spotTypes={spots}
                isLoading={isLoading}
                onCreateUser={createUser}
                onUpdateUser={updateUser}
                onDeleteUser={deleteUser}
              />
            )}

            {view === 'spotTable' && (
              <>
                <AdminSpotTable
                  spotTypes={spots}
                  isLoading={isLoading}
                  onCreateSpot={createSpot}
                  onUpdateSpot={updateSpot}
                  onDeleteSpot={deleteSpot}
                />
                <br></br><br></br>
                <SpotCalculator
                  spotTypes={spots}
                  soliAmount={soliAmount}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;