import { useState } from 'react';
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
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpotType } from '@/models/models';
import AdminSpotForm from './AdminSpotForm';

import {
  MoreVertical,
  Trash2,
  Edit,
  Search,
  PlusCircle,
} from "lucide-react";


interface AdminSpotTableProps {
  spotTypes: SpotType[];
  isLoading?: boolean;
  onCreateSpot: (spotData: Partial<SpotType>) => Promise<void>;
  onUpdateSpot: (spotId: number, spotData: Partial<SpotType>) => Promise<void>;
  onDeleteSpot: (spotId: number) => Promise<void>;
}

const AdminSpotTable = ({ 
  spotTypes, 
  isLoading = false,
  onCreateSpot,
  onUpdateSpot,
  onDeleteSpot,
}: AdminSpotTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const filteredSpots = spotTypes.filter(spot => 
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (spot.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleCreateSpot = async (spotData: Partial<SpotType>) => {
    try {
      await onCreateSpot(spotData);
      setIsCreating(false);
    } catch (error) {
      console.error('Could not create spot:', error);
    }
  };

  const handleUpdateSpot = async (spotId: number, spotData: Partial<SpotType>) => {
    try {
      await onUpdateSpot(spotId, spotData);
      setIsEditing(false);
    } catch (error) {
      console.error('Could not update spot:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Create */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search spot types..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Sheet open={isCreating} onOpenChange={setIsCreating}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Spot Type
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Spot Type</SheetTitle>
            </SheetHeader>
            <AdminSpotForm
              onSubmit={handleCreateSpot}
              isCreating={true}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spot Types Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Spots Taken</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpots.map((spot) => (
                <TableRow key={spot.id}>
                  <TableCell className="font-medium">{spot.name}</TableCell>
                  <TableCell className="max-w-sm sm:max-w-md truncate">{spot.description}</TableCell>
                  <TableCell className="text-right">{spot.price}€</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      spot.currentCount >= spot.limit 
                        ? 'bg-red-100 text-red-800' 
                        : spot.currentCount >= spot.limit * 0.8 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {spot.currentCount} / {spot.limit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{spot.limit}</TableCell>
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
                              Edit Spot Type
                            </DropdownMenuItem>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Edit Spot Type: {spot.name}</SheetTitle>
                            </SheetHeader>
                            <AdminSpotForm
                              spotType={spot}
                              onSubmit={(updatedData) => handleUpdateSpot(spot.id, updatedData)}
                            />
                          </SheetContent>
                        </Sheet>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDeleteSpot(spot.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Spot Type
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

export default AdminSpotTable;

