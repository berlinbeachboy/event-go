import { useState } from "react";
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
import { Info, Pencil, Trash, Plus, Calendar, Clock, X, Check, ChevronsUpDown, Users } from "lucide-react";
import { Shift, User } from "@/models/models";
import CsvUpload from "./ShiftCsvUpload";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatFullName, getInitials, formatTime, compareTimeOnly } from '@/lib/utils';
import UserPopover from "./UserPopover";

// Props for the ShiftsTable component
interface ShiftsTableProps {
  shifts: Shift[];
  users: User[];
  onCreateShift: (shiftData: Partial<Shift>) => Promise<void>;
  onUpdateShift: (shiftId: number, shiftData: Partial<Shift>) => Promise<void>;
  onDeleteShift: (shiftId: number) => Promise<void>;
  onAddUserToShift: (shiftId: number, userId: number) => Promise<boolean>;
  onRemoveUserFromShift: (shiftId: number, userId: number) => Promise<boolean>;
}

export default function ShiftsTable({ shifts, users, onCreateShift, onUpdateShift, onDeleteShift, onAddUserToShift, onRemoveUserFromShift}: ShiftsTableProps) {
//   const [shifts, setShifts] = useState<Shift[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [currentShiftForUsers, setCurrentShiftForUsers] = useState<Shift | null>(null);
  const [userOperationInProgress, setUserOperationInProgress] = useState(false);

  // Filter states
  const [dayFilter, setDayFilter] = useState<string>("-");

  const handleAddShift = () => {
    setCurrentShift(null);
    setOpenDialog(true);
  };

  const handleEditShift = (shift: Shift) => {
    setCurrentShift(shift);
    setFormData(() => (
      {
        name: shift.name,
        headCount: shift.headCount,
        points: shift.points,
        day: shift.day,
        description: shift.description,
        startTime: formatTime(shift.startTime)
    }
    ));
    setOpenDialog(true);
  };

  const handleDeleteShift = async (shift: Shift) => {
    if (shift.currentCount > 0){
      alert("Du kannst die Schicht erst löschen, wenn du alle Teilnehmer entfert hast.")
    }
    else{
      if (confirm("Bist du sicher, dass du die Schicht löschen willst?")) {
        setIsDeleting(true);
        await onDeleteShift(shift.id);
        setIsDeleting(false);
      }
    }
  };

  const handleSubmitShift = async (data: Partial<Shift>) => {
    if (data.startTime){
      data.startTime = "2025-05-01T"+data.startTime+":00+02:00"
    }
    setIsSubmitting(true);
    console.log(data)
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
  // Find user Small Avatar by name
  const findUserAvtByName = (fullName: string, lg: boolean = false): string => {
    const user = users.find(u => u.fullName === fullName);
    if (lg){
      return user ? user.avatarUrlLg : "";
    }
    return user ? user.avatarUrlSm : "";
  };
  // Find user nickname by name
  const findUserNickByName = (fullName: string): string => {
    const user = users.find(u => u.fullName === fullName);
    return user ? user.nickname : "";
  };

  const filteredShifts = shifts.filter(shift => {
    if (shift && dayFilter !== "-" && shift.day !== dayFilter) return false;
    return true;
  });

//   Sort shifts by day and time
  const dayOrder: {[key: string]: number} = {
        "Freitag": 1,
        "Samstag": 2,
        "Sonntag": 3,
        "Montag": 4
      };
    
    //   Sort shifts by day and time
      const sortedShifts = [...filteredShifts].sort((a, b) => {
        // First compare days
        const dayA = a.day ? dayOrder[a.day] : 0;
        const dayB = b.day ? dayOrder[b.day] : 0;
        
        if (dayA !== dayB) return dayA - dayB;
        
        // Then compare times
        if (a.startTime && b.startTime) {
          return compareTimeOnly(new Date(a.startTime), new Date(b.startTime))
          // return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }
        
        return 0;
      });

  const [formData, setFormData] = useState<Partial<Shift>>(
          currentShift ?? {
              name: 'putzeputze',
              headCount: 2,
              points: 1,
              day: 'Freitag',
              description: '',
              startTime: '12:30'
          }
      );
  const handleFormDataCh = (field: keyof Shift, value: string | number) => {
          setFormData(prev => ({...prev, [field]: value}));
      };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schichten</h2>
        <Button onClick={handleAddShift} className="flex items-center gap-1">
          <Plus size={18} /> Schicht hinzufügen
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={dayFilter || ''} onValueChange={(value) => setDayFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Alle Tage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-">Allen Tage</SelectItem>
            <SelectItem value="Freitag">Freitag</SelectItem>
            <SelectItem value="Samstag">Samstag</SelectItem>
            <SelectItem value="Sonntag">Sonntag</SelectItem>
            <SelectItem value="Montag">Montag</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedShifts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Noch ziemlich leer hier...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead></TableHead>
                <TableHead className="hidden md:table-cell">Tag</TableHead>
                <TableHead className="hidden md:table-cell">Zeit</TableHead>
                <TableHead className="hidden text-center md:table-cell">Punkte</TableHead>
                <TableHead className="text-center md:hidden">Pkte</TableHead>
                <TableHead className="text-center"></TableHead>
                <TableHead className="hidden md:table-cell">Menschen</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <div className="font-medium">
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
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2"
                        >
                          <Info size={14} />
                        </Button>
                      </PopoverTrigger>
                        <PopoverContent className="w-120">
                          <div className="max-w-xs font-medium p-2">
                            <p className="font-bold">Infos:</p>
                            <p>{shift.description || 'Keine Beschreibung verfügbar'}</p>
                            
                            {shift.userNames && shift.userNames.length > 0 && (
                              <div className="md:hidden">
                                <p className="font-semibold mt-2">Menschen:</p>
                                <ul className="list-disc pl-5">
                                  {shift.userNames.map((name, index) => (
                                    <li key={index}>{name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                  </TableCell>
                  
                  <TableCell className="hidden md:table-cell">{shift.day || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatTime(shift.startTime)}</TableCell>

                  {/* Column more narrow in mobile */}
                  <TableCell className="hidden md:table-cell text-center ">
                    <Badge variant={shift.points > 1 ? "destructive" : "default"}>
                      {shift.points} {shift.points === 1 ? 'Punkt' : 'Punkte'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center md:hidden">
                    <Badge variant={shift.points > 1 ? "destructive" : "default"}>
                      {shift.points}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className={`${shift.currentCount >= shift.headCount ? 'text-red-500' : 'text-green-500'}`}>
                      {shift.currentCount}/{shift.headCount}
                    </span>
                  </TableCell>
                  {/* Cell with People in them */}
                  <TableCell className="hidden md:table-cell p-1">
                    <div className="flex flex-wrap gap-1 w-full">
                      {shift.userNames && shift.userNames.length > 0 ? (
                        shift.userNames.slice(0, 6).map((name, index) => (
                          <Badge key={index} variant="outline" className="flex items-center p-1 gap-1 h-11">
                            {/* Small Avatar Img as Popover that loads and displays larger Image */}
                            <UserPopover
                              fullname={name} 
                              nickname={findUserNickByName(name)} 
                              avatarUrlLg={findUserAvtByName(name, true)}
                              triggerElement={
                                <Avatar className="h-10 w-10 border-1 border-gray-200 cursor-pointer">
                                  <AvatarImage id={"av-hid-"+index} src={findUserAvtByName(name)} />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                    {getInitials(name)}
                                  </AvatarFallback>
                                </Avatar>
                              }
                            />
                            
                            {formatFullName(name)}
                            <Button
                              variant="ghost"
                              onClick={() => {
                                const userId = findUserIdByName(name)
                                if (userId !== null) {
                                  handleRemoveUser(shift.id, userId, name);
                                }
                              }}
                              disabled={userOperationInProgress}
                              className="h-6 w-6 px-2"
                            >
                              <X size={10} />
                            </Button>
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
                      <div className={shift.currentCount >= shift.headCount ? "hidden" : ""}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2"
                              onClick={() => setCurrentShiftForUsers(shift)}
                            >
                              <Users size={12} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-120">
                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium leading-none">Menschen</h4>
                                <Command>
                                  <CommandInput placeholder="Search users..." />
                                  <CommandEmpty>Niemand da.</CommandEmpty>
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
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-1">
                    <div className="flex justify-end gap-1">
                      
                      {/* Mobile-only user management button */}
                      <Button 
                        variant="ghost" 
                        className="md:hidden h-7 w-7"
                        onClick={() => openUserManagement(shift)}
                      >
                        <Users size={14} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleEditShift(shift)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleDeleteShift(shift)}
                        disabled={isDeleting}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
        </div>
        
      )}
      <Button onClick={() => setShowUpload(!showUpload)}>{showUpload ? "Upload ausblenden" : "CSV Import"}</Button>
      <div className={showUpload ? "" : "hidden"}>
      <CsvUpload/>
      </div>

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
                placeholder="Schichtname" 
                onChange={(e) => handleFormDataCh('name', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="day" className="text-sm font-medium">Tage</label>
                <Select value={formData?.day || undefined} onValueChange={(value) => handleFormDataCh('day', value)}>
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
                  type="time"
                  onChange={(e) => handleFormDataCh('startTime', e.target.value)}
                  value={formData.startTime ? formData.startTime : "12:30"}
                  required
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
                  defaultValue={formData?.headCount || 1} 
                  onChange={(e) => handleFormDataCh('headCount', parseInt(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="points" className="text-sm font-medium">Punkte</label>
                <Select value={String(formData?.points || 1)} onValueChange={(value) => handleFormDataCh('points', parseInt(value))}>
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
                value={formData?.description || ''} 
                placeholder="Add details about this shift"
                onChange={(e) => handleFormDataCh('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Abbrechen</Button>
            <Button type="submit" disabled={isSubmitting} onClick={() => handleSubmitShift(formData)}>
              {isSubmitting ? 'Saving...' : currentShift ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User management dialog, only for mobile*/}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Menschen für {currentShiftForUsers?.name} am {currentShiftForUsers?.day}</DialogTitle>
            <DialogDescription>
              Hier Menschen hinzufügen oder rausnehmen.
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
                    Füge jemanden hinzu
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2 ">
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
                              <Avatar className="h-10 w-10 border-2 border-gray-200">
                                <AvatarImage src={findUserAvtByName(user.fullName)} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                  {getInitials(user.fullName)}
                                </AvatarFallback>
                              </Avatar>
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
                        <UserPopover
                              fullname={name} 
                              nickname={findUserNickByName(name)} 
                              avatarUrlLg={findUserAvtByName(name, true)}
                              triggerElement={
                                <Avatar className="h-10 w-10 border-2 border-gray-200 cursor-pointer">
                                  <AvatarImage id={"av-hid-"+index} src={findUserAvtByName(name)} />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                    {getInitials(name)}
                                  </AvatarFallback>
                                </Avatar>
                              }
                            />
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