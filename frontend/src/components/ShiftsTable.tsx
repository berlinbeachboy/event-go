import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Info, Pencil, Trash, Plus, Calendar, Clock, X, Check, ChevronsUpDown } from "lucide-react";
import { Shift, User } from "@/models/models";

// Props for the ShiftsTable component
interface ShiftsTableProps {
  shifts: Shift[];
  users: User[];
  onFetchShifts: () => Promise<void>;
  onCreateShift: (shiftData: Partial<Shift>) => Promise<void>;
  onUpdateShift: (shiftId: number, shiftData: Partial<Shift>) => Promise<void>;
  onDeleteShift: (shiftId: number) => Promise<void>;
  onAddUserToShift: (shiftId: number, userId: number) => Promise<boolean>;
  onRemoveUserFromShift: (shiftId: number, userId: number) => Promise<boolean>;
}

export default function ShiftsTable({ shifts, users, onFetchShifts, onCreateShift, onUpdateShift, onDeleteShift, onAddUserToShift, onRemoveUserFromShift}: ShiftsTableProps) {
//   const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [currentShiftForUsers, setCurrentShiftForUsers] = useState<Shift | null>(null);
  const [userOperationInProgress, setUserOperationInProgress] = useState(false);

  // Filter states
  const [dayFilter, setDayFilter] = useState<string | null>("-");
  
  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setIsLoading(true);
    await onFetchShifts();
    setIsLoading(false);
  };

  const handleAddShift = () => {
    setCurrentShift(null);
    setOpenDialog(true);
  };

  const handleEditShift = (shift: Shift) => {
    setCurrentShift(shift);
    setOpenDialog(true);
  };

  const handleDeleteShift = async (id: number) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      setIsDeleting(true);
      await onDeleteShift(id);
      setIsDeleting(false);
    }
  };

  const handleSubmitShift = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (currentShift) {
        // Update existing shift
        await onUpdateShift(currentShift.id, data);
        setOpenDialog(false);
      } else {
        // Create new shift
        await onCreateShift(data);
        setOpenDialog(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUserManagement = (shift: Shift) => {
    setCurrentShiftForUsers(shift);
    setUserDialogOpen(true);
  };

  const handleAddUser = async (shiftId: number, userId: number) => {
    setUserOperationInProgress(true);
    try {
      const success = await onAddUserToShift(shiftId, userId);
      if (success) {
        // Find the user that was added
        const user = users.find(u => u.id === userId);
        if (user && currentShiftForUsers) {
          // Update the local state
          const updatedShift = { 
            ...currentShiftForUsers,
            userNames: [
              ...(currentShiftForUsers.userNames || []),
              user.fullName
            ],
            currentCount: currentShiftForUsers.currentCount + 1
          };
          
          setCurrentShiftForUsers(updatedShift);
        }
      }
    } finally {
      setUserOperationInProgress(false);
    }
  };

  const handleRemoveUser = async (shiftId: number, userId: number, userName: string) => {
    setUserOperationInProgress(true);
    try {
      const success = await onRemoveUserFromShift(shiftId, userId);
      if (success && currentShiftForUsers) {
        // Update the local state
        const updatedShift = { 
          ...currentShiftForUsers,
          userNames: currentShiftForUsers.userNames?.filter(name => name !== userName) || [],
          currentCount: Math.max(0, currentShiftForUsers.currentCount - 1)
        };
        
        setCurrentShiftForUsers(updatedShift);
      }
    } finally {
      setUserOperationInProgress(false);
    }
  };

  // Find user ID by name
  const findUserIdByName = (fullName: string): number | null => {
    const user = users.find(u => u.fullName === fullName);
    return user ? user.id : null;
  };

  const filteredShifts = shifts.filter(shift => {
    if (shift && dayFilter !== "-" && shift.day !== dayFilter) return false;
    return true;
  });

//   Sort shifts by day and time
  const sortedShifts = [...shifts].sort((a, b) => {
    // First compare days
    const dayOrder: {[key: string]: number} = {
      "Freitag": 1,
      "Samstag": 2,
      "Sonntag": 3,
      "Montag": 4
    };
    
    const dayA = a.day ? dayOrder[a.day] : 0;
    const dayB = b.day ? dayOrder[b.day] : 0;
    
    if (dayA !== dayB) return dayA - dayB;
    
    // Then compare times
    if (a.startTime && b.startTime) {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }
    
    return 0;
  });

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '—';
    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Set to true if you want 12-hour format
      });
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Shifts</h2>
        <Button onClick={handleAddShift} className="flex items-center gap-1">
          <Plus size={16} /> Add Shift
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={dayFilter || ''} onValueChange={(value) => setDayFilter(value || null)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-">All Days</SelectItem>
            <SelectItem value="Friday">Freitag</SelectItem>
            <SelectItem value="Saturday">Samstag</SelectItem>
            <SelectItem value="Sunday">Sonntag</SelectItem>
            <SelectItem value="Sunday">Montag</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Lade Schichten...</div>
      ) : sortedShifts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Noch ziemlich leer hier...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Tag</TableHead>
                <TableHead className="hidden md:table-cell">Zeit</TableHead>
                <TableHead className="text-center">Punkte</TableHead>
                <TableHead className="text-center">Anzahl</TableHead>
                <TableHead className="hidden md:table-cell">Menschen</TableHead>
                <TableHead className="text-right"> - </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    <div>
                      {shift.name}
                      
                      {/* Mobile-only day and time indicators */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 md:hidden">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {shift.day || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {formatTime(shift.startTime)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{shift.day || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTime(shift.startTime)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={shift.points > 1 ? "destructive" : "default"}>
                      {shift.points} {shift.points === 1 ? 'point' : 'points'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`${shift.currentCount >= shift.headCount ? 'text-red-500' : 'text-green-500'}`}>
                      {shift.currentCount}/{shift.headCount}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {shift.userNames && shift.userNames.length > 0 ? (
                        shift.userNames.slice(0, 6).map((name, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Noch niemand</span>
                      )}
                      
                      {shift.userNames && shift.userNames.length > 6 && (
                        <Badge variant="outline" className="bg-gray-100">
                          +{shift.userNames.length - 6} mehr
                        </Badge>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2"
                        onClick={() => openUserManagement(shift)}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Info size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-xs p-2">
                              <p className="font-semibold">Beschreibung:</p>
                              <p>{shift.description || 'No description available'}</p>
                              
                              {shift.userNames && shift.userNames.length > 0 && (
                                <>
                                  <p className="font-semibold mt-2">Menschen:</p>
                                  <ul className="list-disc pl-5">
                                    {shift.userNames.map((name, index) => (
                                      <li key={index}>{name}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Mobile-only user management button */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="md:hidden"
                        onClick={() => openUserManagement(shift)}
                      >
                        <Plus size={16} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditShift(shift)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteShift(shift.id)}
                        disabled={isDeleting}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Shift edit/create dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentShift ? 'Schicht anpassen' : 'Neue Schicht'}</DialogTitle>
            <DialogDescription>
              {currentShift ? 'Update the details for this shift.' : 'Enter the details for the new shift.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input 
                id="name" 
                defaultValue={currentShift?.name || ''} 
                placeholder="Shift name" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="day" className="text-sm font-medium">Tage</label>
                <Select defaultValue={currentShift?.day || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Welcher Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Freitag">Freitag</SelectItem>
                    <SelectItem value="Samstag">Samstag</SelectItem>
                    <SelectItem value="Sonntag">Sonntag</SelectItem>
                    <SelectItem value="Montag">Montag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="startTime" className="text-sm font-medium">Beginn</label>
                <Input 
                  id="startTime" 
                  type="startTime"
                  defaultValue={currentShift?.startTime ? 
                    new Date(currentShift.startTime).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit', hour12: false
                      }) : 
                    ''}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="headCount" className="text-sm font-medium">Anzahl Menschen</label>
                <Input 
                  id="headCount" 
                  type="number" 
                  min="1"
                  defaultValue={currentShift?.headCount || 1} 
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="points" className="text-sm font-medium">Punkte</label>
                <Select defaultValue={String(currentShift?.points || 1)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Punkt</SelectItem>
                    <SelectItem value="2">2 Punkte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Beschreibung</label>
              <Textarea 
                id="description" 
                defaultValue={currentShift?.description || ''} 
                placeholder="Add details about this shift"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Abbrechen</Button>
            <Button type="submit" disabled={isSubmitting} onClick={() => handleSubmitShift({})}>
              {isSubmitting ? 'Saving...' : currentShift ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User management dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Users for {currentShiftForUsers?.name}</DialogTitle>
            <DialogDescription>
              Add or remove users from this shift.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* User typeahead selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add User</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={
                      !currentShiftForUsers || 
                      (currentShiftForUsers.currentCount >= currentShiftForUsers.headCount)
                    }
                  >
                    Select a user...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {users
                        .filter(user => {
                          // Filter out users already assigned to this shift
                          return !currentShiftForUsers?.userNames?.includes(user.fullName);
                        })
                        .map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.fullName}
                            onSelect={() => {
                              if (currentShiftForUsers) {
                                handleAddUser(currentShiftForUsers.id, user.id);
                              }
                            }}
                          >
                            <Check className="mr-2 h-4 w-4 opacity-0" />
                            <span>{user.fullName}</span>
                            {user.nickname && (
                              <span className="ml-2 text-gray-500">({user.nickname})</span>
                            )}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Current users list */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aktuelle Menschen</label>
              <div className="border rounded-md p-2 min-h-24 space-y-2">
                {currentShiftForUsers?.userNames && currentShiftForUsers.userNames.length > 0 ? (
                  currentShiftForUsers.userNames.map((name, index) => {
                    const userId = findUserIdByName(name);
                    return (
                      <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <span>{name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (currentShiftForUsers && userId !== null) {
                              handleRemoveUser(currentShiftForUsers.id, userId, name);
                            }
                          }}
                          disabled={userOperationInProgress}
                          className="h-6 px-2"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    No users assigned to this shift
                  </div>
                )}
              </div>
            </div>
            
            {currentShiftForUsers && (
              <div className="text-sm text-right">
                <span className={`${
                  currentShiftForUsers.currentCount >= currentShiftForUsers.headCount 
                    ? 'text-red-500' 
                    : 'text-green-500'
                }`}>
                  {currentShiftForUsers.currentCount}/{currentShiftForUsers.headCount} spots filled
                </span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setUserDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}