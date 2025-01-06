// components/layout/MainLayout.tsx
import { UserResponse } from '@/models/models';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/SidebarNew';
import { ReactNode } from 'react';

interface MainLayoutProps {
  user: UserResponse;
  onLogout: () => Promise<void>;
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function MainLayout({
  user,
  onLogout,
  children,
  currentView,
  onViewChange
}: MainLayoutProps) {
    console.log('currentView:', currentView);
  return (
    <>
      <SidebarTrigger className="-ml-1 p-2 rounded fixed top-4 left-4 z-50 block md:hidden" />
      <AppSidebar 
        user={user} 
        handleLogout={onLogout} 
        changeView={onViewChange}
      />
      <main className="flex-1 p-2 md:p-8">
        <div className="w-full h-full">{children}</div>
      </main>
    </>
  );
}
