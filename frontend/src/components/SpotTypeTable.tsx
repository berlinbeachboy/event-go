import { useState } from 'react';
import axios from '../axiosConfig';
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
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SpotType } from '../models';
import {
  MoreVertical,
  Trash2,
  Edit,
  Search,
  PlusCircle,
} from "lucide-react";

interface AdminSpotTableProps {
  spotTypes: SpotType[];
  onUpdate: () => void;
}

const SpotTypeForm = ({ 
  spotType,
  onSubmit,
  isCreating = false 
}: { 
  spotType?: SpotType;
  onSubmit: (data: Partial<SpotType>) => void;
  isCreating?: boolean;
}) => {
  const [formData, setFormData] = useState<Partial<SpotType>>(
    spotType ?? {
      price: 0,
      limit: 0,
    }
  );

  const handleChange = (field: keyof SpotType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description ?? ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (€)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price ?? 0}
          onChange={(e) => handleChange('price', parseFloat(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="limit">Spot Limit</Label>
        <Input
          id="limit"
          type="number"
          value={formData.limit ?? 0}
          onChange={(e) => handleChange('limit', parseInt(e.target.value))}
        />
      </div>

      <SheetFooter>
        <Button onClick={() => onSubmit(formData)}>
          {isCreating ? 'Create Spot Type' : 'Save Changes'}
        </Button>
      </SheetFooter>
    </div>
  );
};

const AdminSpotTable = ({ 
  spotTypes, 
  onUpdate,
}: AdminSpotTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setisEditing] = useState(false);

  const onUpdateSpot = async (userId: number, updatedData: Partial<SpotType>) => {
    try {
      const response = await axios.put('/admin/spots/' + userId, updatedData);
      if (response.status === 200) {
        onUpdate();
      }
    } catch (error) {
      console.error('Could not Update spot', error);
    }
  };

  const onCreateSpot = async (spotData: Partial<SpotType>) => {
    try {
      const response = await axios.post('/admin/spots/', spotData);
      if (response.status === 201) {
        onUpdate();
      }
    } catch (error) {
      console.error('Could not Create spot', error);
    }
  };

  const onDeleteSpot = async (spotId: number) => {
    try {
      const response = await axios.delete('/admin/spots/' + spotId,);
      if (response.status === 200) {
        onUpdate();
      }
    } catch (error) {
      console.error('Could not Delete spot', error);
    }
  };

  const filteredSpots = spotTypes.filter(spot => 
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <SpotTypeForm
              onSubmit={(spotData) => {
                onCreateSpot(spotData);
                setIsCreating(false);
              }}
              isCreating={true}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spot Types Table */}
      <div className="rounded-md border">
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
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => {setisEditing(true)}}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Sheet open={isEditing} onOpenChange={setisEditing}>
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
                          <SpotTypeForm
                            spotType={spot}
                            onSubmit={(updatedData) => {onUpdateSpot(spot.id, updatedData); setisEditing(false)}}
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
      </div>
    </div>
  );
};

export default AdminSpotTable;