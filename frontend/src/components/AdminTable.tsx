import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminUserForm from './AdminUserForm';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MoreVertical,
  Trash2,
  Edit,
  Search,
  UserPlus,
} from "lucide-react";
import { SpotType, User } from '@/models/models';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import UserPopover from './UserPopover';

interface AdminTableProps {
  spotTypes: SpotType[];
}
interface AdminTableProps {
  users: User[];
  spotTypes: SpotType[];
  isLoading?: boolean;
  onCreateUser: (userData: Partial<User>) => Promise<void>;
  onUpdateUser: (userId: number, userData: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
}

const AdminTable = ({ 
  users, 
  spotTypes, 
  isLoading = false,
  onCreateUser,
  onUpdateUser,
  onDeleteUser 
}: AdminTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      await onCreateUser(userData);
      setIsCreating(false);
    } catch (error) {
      console.error('Could not create user:', error);
    }
  };

  const handleUpdateUser = async (userId: number, userData: Partial<User>) => {
    try {
      await onUpdateUser(userId, userData);
      setIsEditing(false);
    } catch (error) {
      console.error('Could not update user:', error);
    }
  };


  const handleDeleteUser = async (userId: number) => {
    try {
      await onDeleteUser(userId);
      setIsEditing(false);
    } catch (error) {
      console.error('Could not update user:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Create */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Sheet open={isCreating} onOpenChange={setIsCreating}>
          <SheetTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Neuer User
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Neuen User erstellen</SheetTitle>
              <SheetDescription className="hidden"></SheetDescription>
            </SheetHeader>
            <AdminUserForm
              spotTypes={spotTypes}
              onSubmit={handleCreateUser}
              isCreating={true}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* User Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Vor- und Nachname</TableHead>
                <TableHead className="hidden sm:table-cell">Username</TableHead>
                <TableHead>Spitzname</TableHead>
                {/* <TableHead className="hidden md:table-cell">Handy</TableHead> */}
                <TableHead className="hidden md:table-cell">Typ </TableHead>
                <TableHead>Spot</TableHead>
                <TableHead>SP</TableHead>
                <TableHead>Mo</TableHead>
                <TableHead>Soli</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead className="hidden md:table-cell">Letzter Login</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  {/* <img src="https://eu.ui-avatars.com/api/?name=John+Doe&size=250"> */}
                  <TableCell className='p-1'>
                  <UserPopover
                    fullname={user.fullName} 
                    nickname={user.nickname} 
                    avatarUrlLg={user.avatarUrlLg}
                    triggerElement={
                      <Avatar className="h-12 w-12 border-2 border-gray-200 cursor-pointer">
                        <AvatarImage src={user.avatarUrlSm} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    }
                  />
                    {/* <Avatar className="h-12 w-12 border-2 border-gray-200">
                      <AvatarImage src={user.avatarUrlSm} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(user?.fullName)}
                      </AvatarFallback>
                    </Avatar> */}
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{user.username}</TableCell>
                  <TableCell>{user.nickname}</TableCell>
                  {/* <TableCell className="hidden md:table-cell">{user.phone}</TableCell> */}
                  <TableCell className="hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.type}
                    </span>
                  </TableCell>
                  <TableCell>{user.spotType?.name || 'No spot'}</TableCell>
                  <TableCell>{user.shiftPoints || '0'}</TableCell>
                  <TableCell className='p-1'>
                  {user.sundayShift &&
                  <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 px-2"
                        >
                          {user.sundayShift == "früh" ? "F" : user.sundayShift == "spät" ? "L" : "X"}
                        </Button>
                      </PopoverTrigger>
                        <PopoverContent className="w-120">
                          <div className="max-w-xs font-medium p-2">
                            <p>{user.sundayShift || ''}</p>
                          </div>
                        </PopoverContent>
                      </Popover>

                  }
                  </TableCell>
                  <TableCell>
                    {user.takesSoli ? (
                    <span className="text-xs">
                      -25€
                    </span>): (
                      <span className="text-xs">
                      {user.soliAmount}€ {user.soliAmount > 0 && user.donatesSoli ? "(Y)" : ""}
                    </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.amountPaid >= user.amountToPay ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.amountPaid}€ / {user.amountToPay + user.amountPaid}€
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.lastLogin !== null ? formatDate(user.lastLogin) : "-"}</TableCell>
                  <TableCell>
                  <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                        <PopoverContent className="w-40" side="left">
                          <Sheet open={isEditing} onOpenChange={setIsEditing}>
                          <SheetTrigger asChild>
                            <Button className="w-full" variant="ghost">
                              <Edit className="mr-2 h-4 w-4" />
                              Update User
                            </Button>
                          </SheetTrigger>
                          <SheetContent className='w-64'>
                            <SheetHeader>
                              <SheetTitle>Update User: {user.fullName}</SheetTitle>
                            </SheetHeader>
                            <AdminUserForm
                              user={user}
                              spotTypes={spotTypes}
                              onSubmit={(updatedData) => handleUpdateUser(user.id, updatedData)}
                            />
                          </SheetContent>
                        </Sheet>
                        <Button
                          className="text-red-600 w-full" variant="ghost"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          User löschen
                        </Button>
                        </PopoverContent>
                      </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};


export default AdminTable;