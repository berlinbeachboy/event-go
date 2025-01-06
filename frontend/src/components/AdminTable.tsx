import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Trash2,
  Edit,
  Search,
  UserPlus,
} from "lucide-react";
import { SpotType, User } from '@/models/models';
import { useAdmin } from '@/api/hooks/use-admin';

interface AdminTableProps {
  spotTypes: SpotType[];
}

const UserForm = ({ 
  user, 
  spotTypes, 
  onSubmit, 
  isCreating = false,
}: { 
  user?: User;
  spotTypes: SpotType[]; 
  onSubmit: (data: Partial<User>) => void;
  isCreating?: boolean;
}) => {
  const [formData, setFormData] = useState<Partial<User>>(
    user ?? {
      type: 'reg',
      amountPaid: 0,
      spotTypeId: 0,
    }
  );

  const handleChange = (field: keyof User, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username ?? ''}
          onChange={(e) => handleChange('username', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName ?? ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          value={formData.nickname ?? ''}
          onChange={(e) => handleChange('nickname', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone ?? ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">User Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reg">Regular</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="spotTypeId">Spot Type</Label>
        <Select
          value={formData.spotTypeId?.toString()}
          onValueChange={(value) => handleChange('spotTypeId', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select spot type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No spot</SelectItem>
            {spotTypes.map(spot => (
              <SelectItem key={spot.id} value={spot.id.toString()}>
                {spot.name} - {spot.price}€
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amountPaid">Amount Paid (€)</Label>
        <Input
          id="amountPaid"
          type="number"
          value={formData.amountPaid ?? 0}
          onChange={(e) => handleChange('amountPaid', parseFloat(e.target.value))}
        />
      </div>

      <SheetFooter>
        <Button onClick={() => onSubmit(formData)}>
          {isCreating ? 'Create User' : 'Save Changes'}
        </Button>
      </SheetFooter>
    </div>
  );
};

const AdminTable = ({ spotTypes }: AdminTableProps) => {
  const { users, fetchUsers, createUser, updateUser, deleteUser, isLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      await createUser(userData);
      setIsCreating(false);
    } catch (error) {
      console.error('Could not create user:', error);
    }
  };

  const handleUpdateUser = async (userId: number, userData: Partial<User>) => {
    try {
      await updateUser(userId, userData);
      setIsEditing(false);
    } catch (error) {
      console.error('Could not update user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error('Could not delete user:', error);
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
              New User
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New User</SheetTitle>
              <SheetDescription className="hidden"></SheetDescription>
            </SheetHeader>
            <UserForm
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
                <TableHead>Full Name</TableHead>
                <TableHead className="hidden sm:block">Username</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Spot</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell className="hidden sm:block">{user.username}</TableCell>
                  <TableCell>{user.nickname}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.type}
                    </span>
                  </TableCell>
                  <TableCell>{user.spotType?.name || 'No spot'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.amountPaid >= user.amountToPay ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.amountPaid}€ / {user.amountToPay}€
                    </span>
                  </TableCell>
                  <TableCell>{user.lastLogin !== null ? formatDate(user.lastLogin) : "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Sheet open={isEditing} onOpenChange={setIsEditing}>
                          <SheetTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Edit User: {user.fullName}</SheetTitle>
                            </SheetHeader>
                            <UserForm
                              user={user}
                              spotTypes={spotTypes}
                              onSubmit={(updatedData) => handleUpdateUser(user.id, updatedData)}
                            />
                          </SheetContent>
                        </Sheet>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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