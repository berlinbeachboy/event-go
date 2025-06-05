import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/api/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Info, Calendar, Clock, UserPlus, UserRoundX, RefreshCcw } from "lucide-react";
import { getInitials, formatTime, compareTimeOnly } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserPopover from '@/components/UserPopover';
import { Input } from '@/components/ui/input';
import { UserResponse } from '@/models/models';
import { Label } from '@/components/ui/label';


const ShiftPage = () => {
    const { user,  shifts, userShorts, fetchShifts, fetchUser, fetchUsers, updateUser, addShiftMe, removeShiftMe} = useAuth();
    const { toast } = useToast();

    const [sundayShiftSelect, setSundayShiftSelect] = useState<string>(() => {
        if (!user) return "";
        if (!user?.sundayShift) return ""
        if (user?.sundayShift !== "früh" && user?.sundayShift !== "spät") return "kann nicht"
        return user.sundayShift
    });


    const [formData, setFormData] = useState({
        arrival: user?.arrival || "",
        sundayShift: user?.sundayShift || "",
    });
    const [confirmed, setConfirmed] = useState<boolean>(() => {
        if (!user || !user.sundayShift) return false
        return true
    });
    const hasMounted = useRef(false);
    useEffect(() => {
        const fetchData = async () => {
          if (hasMounted.current) { return; }
          await fetchShifts();
          await fetchUsers();
          hasMounted.current = true;
        };
        fetchData();
      });

    // const [currentShiftForUsers, setCurrentShiftForUsers] = useState<Shift | null>(null);
  
    // Filter states
    const [dayFilter, setDayFilter] = useState<string>("-");
  
  
    const handleAddMe = async (shiftId: number) => {
      const success = await addShiftMe(shiftId);
      if (success){
          toast({
            title: "Hat geklappt, danke!",
            description: "Du hast dich für eine Schicht eingetragen.",
            // variant: "destructive",
          })
      }
      else{
        toast({
          title: "Hat leider nicht geklappt :/",
          description: "Wahrscheinlich war jemand anders schneller.",
          variant: "destructive",
        })
      }
    };
  
    const handleRemoveMe = async (shiftId: number) => {
      
        const success = await removeShiftMe(shiftId);
        if (success){
          toast({
            title: "Hat geklappt, danke!",
            description: "Du hast dich aus der Schicht ausgetragen.",
            // variant: "destructive",
          })
      }
      else{
        toast({
          title: "Hat leider nicht geklappt :/",
          description: "Kein Plan warum :D",
          variant: "destructive",
        })
      }
    };
  
    // Find user Small Avatar by name
    const findUserAvtByName = (fullName: string, lg: boolean = false): string => {
      const us = userShorts?.find(u => u.fullName === fullName);
      if (lg){
        return us ? us.avatarUrlLg : "";
      }
      return us ? us.avatarUrlSm : "";
    };
    // Find user nickname by name
    const findUserNickByName = (fullName: string): string => {
      const us = userShorts?.find(u => u.fullName === fullName);
      return us ? us.nickname : "";
    };
    const updateSundayShift = async (data: Partial<UserResponse>) => {

      try {
        await updateUser(data);
        setConfirmed(true)
        toast({
          title: "Hat geklappt!",
          description: "Danke für deine Infos!",
        });
      } catch {
        toast({
          title: "Fehler",
          description: "Mist, hat leider nicht geklappt.",
          variant: "destructive",
        });
      }
    };

    const handleSelectChange = (value: string): void => {
      const existVal = (user?.sundayShift === "früh" || user?.sundayShift === "spät") ? "Dein Grund" : user?.sundayShift
      const formVal = (value === "früh" || value === "spät") ? value : existVal || "Dein Grund"
      setFormData({...formData, sundayShift: formVal})
      setSundayShiftSelect(value)
    };
  
    const filteredShifts = shifts ? shifts?.filter(shift => {
      if (shift && dayFilter !== "-" && shift.day !== dayFilter) return false;
      return true;
    }) : [];

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

    
    if (!user) return null;
    return (
      <div className="flex w-full">
        <div className="flex-1 p-2 md:p-20">
        <div className="md:hidden"><br/><br></br><br/></div>
          <div className="container mx-auto max-w-2xl p-2 md:p-8">
            <Card className="w-full">
              <CardHeader className="p-2 md:p-4">
                <CardTitle className="text-2xl">Infos zu den Schichten</CardTitle>
              </CardHeader>
                <CardContent className="space-y-8 p-2 md:p-4">
                  <div className="prose prose-gray max-w-none">
                      <ul className="space-y-2 text-gray-700 text-sm">
                          <li>Jede Schicht gibt je nach Aufwand entweder einen oder zwei Punkte.</li>
                          <li>Bitte tragt euch unten für Schichten ein, sodass ihr auf 2 Schichtpunkte kommt.</li>
                          <li>Mehr Infos zu den Schichten gibt's auf dem i-Button.</li>
                          <li>Montags helfen alle mit beim Aufräumen. </li>
                          <li>Bitte gebt uns unten Bescheid, ob ihr Montags früher abreisen wollt oder etwas länger bleiben könnt.</li>
                          <li>Vielen Dank für eure Mithilfe! ❤️</li>
                      </ul>
                  </div>
                  <div className=" space-x-2">
                    {/* <div className="items-center space-y-2 w-100">
                      <Label htmlFor="sundayShift">Weißt du schon wann du wahrscheinlich kommst?</Label>
                      <div className="space-y-2 w-86">
                        <Select
                            value={formData.arrival}
                            onValueChange={(value) => setFormData({... formData, arrival: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Bitte auswählen :)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Freitag">Freitag</SelectItem>
                                <SelectItem value="Samstag">Samstag</SelectItem>
                                <SelectItem value="Weiß nicht">Weiß noch nicht</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      
                    </div> */}

                    <div className="items-center space-y-2 w-88">
                      <Label htmlFor="sundayShift">Weißt du schon wann du wahrscheinlich kommst?</Label>
                      <div className="space-y-2 w-86">
                        <Select
                            value={formData.arrival}
                            onValueChange={(value) => setFormData({... formData, arrival: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Bitte auswählen :)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Fr">Freitag</SelectItem>
                                <SelectItem value="Sa">Samstag</SelectItem>
                                <SelectItem value="?">Weiß noch nicht</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      <br></br>
                      <Label htmlFor="sundayShift">Wie sieht's Montag bei dir aus? Kannst du auch später noch ändern. {":-)"}</Label>
                      <div className="space-y-2 w-86">
                        <Select
                            value={sundayShiftSelect}
                            onValueChange={(value) => handleSelectChange(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Bitte auswählen :)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="früh">Lieber früh - 11:00-12:30 </SelectItem>
                                <SelectItem value="spät">Spät ist ok - 12:30-14:00</SelectItem>
                                <SelectItem value="kann nicht">Muss leider schon vor 11 Uhr los :/</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      <div className={formData.sundayShift == 'früh' || formData.sundayShift == 'spät' || !formData.sundayShift ? 'hidden' : 'items-center'}>
                      <Label htmlFor="sundayShiftInput">Warum musst du früher los?</Label>
                        <Input
                          className='w-full text-sm'
                          id="sundayShiftInput"
                          value={formData.sundayShift}
                          onChange={(e) => setFormData({...formData, sundayShift: e.target.value})}
                        />
                      </div>
                    </div>
                    <br></br>
                    <Button disabled={!sundayShiftSelect || !formData.arrival}
                    variant="outline"
                    onClick={() => {updateSundayShift(formData)}}
                  >
                    {confirmed ? "Speichern" : "Speichern  und Schichten anzeigen"}
                  </Button>
                  </div>

                  {/* Current Subscription Info */}
                  <div className="grid gap-4 mt-6 w-86">
                    
                    <div className="flex justify-between items-center py-3 px-6 bg-muted rounded-lg">
                      <span>Deine Schichtpunkte:</span>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        user.shiftPoints >= 2
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.shiftPoints}/2
                      </div>
                      <Button 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={async () => await fetchUser()}
                      >
                        <RefreshCcw size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
            </Card>
          </div>
          <br></br>
        <div className="space-y-4">
          {/* <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Schichten</h2>
          </div> */}
        { confirmed && (
          <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Select value={dayFilter || ''} onValueChange={(value) => setDayFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Alle Tage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">Alle Tage</SelectItem>
                <SelectItem value="Freitag">Freitag</SelectItem>
                <SelectItem value="Samstag">Samstag</SelectItem>
                <SelectItem value="Sonntag">Sonntag</SelectItem>
                <SelectItem value="Montag">Montag</SelectItem>
              </SelectContent>
            </Select>
          </div>
    
          {sortedShifts.length === 0 || !user? (
            <div className="text-center py-8 text-gray-500">Noch ziemlich leer hier...</div>
            ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">Tag</TableHead>
                    <TableHead className="hidden md:table-cell">Zeit</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead></TableHead>
                    
                    <TableHead className="hidden text-center md:table-cell">Punkte</TableHead>
                    <TableHead className="text-center md:hidden">Pkte</TableHead>
                    <TableHead className="text-center"></TableHead>
                    <TableHead >Teilnehmer:innen</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedShifts.map((shift) => (
                    <TableRow key={shift.id} className={shift.userNames?.includes(user?.fullName) ? "bg-green-100" : ""}>
                      <TableCell className="hidden md:table-cell">{shift.day || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatTime(shift.startTime)}</TableCell>
                      <TableCell className="max-w-3xs md:max-w-2xl">
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
                      <TableCell className='p-0'>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
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
    
                      {/* Column more narrow in mobile */}
                      <TableCell className="hidden md:table-cell text-center ">
                        <Badge variant={shift.points > 1 ? "destructive" : "default"}>
                          {shift.points} {shift.points === 1 ? 'Punkt' : 'Punkte'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-0 md:hidden">
                        <Badge variant={shift.points > 1 ? "destructive" : "default"}>
                          {shift.points}
                        </Badge>
                      </TableCell>
    
                      <TableCell className="text-center p-1">
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
                                
                                {findUserNickByName(name)}
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
                            
                          </div>
                          
                        </div>
                      </TableCell>

                      <TableCell className="md:hidden p-1">
                        <div className="flex flex-wrap gap-1 w-full">
                          {shift.userNames && shift.userNames.length > 0 ? (
                            shift.userNames.slice(0, 6).map((name, index) => (
                                <UserPopover
                                  fullname={name} 
                                  nickname={findUserNickByName(name)} 
                                  avatarUrlLg={findUserAvtByName(name, true)}
                                  triggerElement={
                                    <Avatar className="h-9 w-9 border-1 border-gray-200 cursor-pointer">
                                      <AvatarImage id={"av-hid-"+index} src={findUserAvtByName(name)} />
                                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                        {getInitials(name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  }
                                />
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm"></span>
                          )}
                          
                          {shift.userNames && shift.userNames.length > 6 && (
                            <Badge variant="outline" className="bg-gray-100">
                              +{shift.userNames.length - 6}
                            </Badge>
                          )}
                          
                        </div>
                      </TableCell>

                      <TableCell className="text-right p-1">
                        <div className="flex justify-end gap-1">
                          
                          <Button 
                            variant="outline" 
                            className={!shift.userNames?.includes(user?.fullName) && shift.currentCount < shift.headCount ? "h-7 w-7 " : "hidden"}
                            onClick={() => handleAddMe(shift.id)}
                          >
                            <UserPlus size={14} />
                          </Button>

                          <Button 
                            variant="outline" 
                            className={shift.userNames?.includes(user?.fullName) ? "h-7 w-7 " : "hidden"}
                            onClick={() => handleRemoveMe(shift.id)}
                          >
                            <UserRoundX size={14} />
                          </Button>
                          
                        
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
            </div>
            
          )} </div>)}
    
        </div>
      </div>
      </div>
    );
  }

  export default ShiftPage;