import { UserType , SpotType } from '../models';


import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Euro, Users } from 'lucide-react';
import axios from '../axiosConfig';

interface SpotSelectionCardProps {
  user: UserType;
  spotTypes: SpotType[];
  onUpdate: () => void;
}

const SpotSelectionCard = ({ user, spotTypes, onUpdate}: SpotSelectionCardProps) => {
  const [userUpdate, setUserUpdate] = useState({
    givesSoli: user.givesSoli,
    takesSoli: user.takesSoli,
    spotTypeID: user.spotTypeId,
  });
  const [isSelectingSpot, setIsSelectingSpot] = useState(false);
  const [soliSelection, setSoliSelection] = useState(() => {
    if (user.givesSoli) return "give";
    if (user.takesSoli) return "take";
    return "none";
  });
  
  const hasSpot = (user.spotTypeId !== 0 && user.spotTypeId !== null);
  /// setIsSelectingSpot(!hasSpot)
  const currentSpotType = spotTypes.find(spot => spot.id === user.spotTypeId);
  const remainingToPay = user.amountToPay;
  const soliAmount = 25;

  const updateMe = async () => {
    try {
      const response = await axios.put('/user/me', userUpdate);
      if (response.status === 200) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error fetching user info after login', error);
    }
  };

  const handleSoliChange = (value: string) => {
    setSoliSelection(value)
    var givesSoli = value === "give";
    var takesSoli = value === "take";
    setUserUpdate({givesSoli: givesSoli, takesSoli: takesSoli, spotTypeID: userUpdate.spotTypeID});
  };

  return (
    <div className="space-y-4 md:min-w-md">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{hasSpot ? "Dein Platz: " + user.spotType.name : "Bitte wähle deinen Platz :)"}</span>
            {hasSpot && (
              <Badge className={remainingToPay <= 0 ? "bg-green-500" : "bg-yellow-500"}>
                {remainingToPay <= 0 ? "Paid" : `${remainingToPay}€ remaining`}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Spot Info */}
          {hasSpot && !isSelectingSpot && currentSpotType && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{currentSpotType.name}</h3>
                <span className="font-bold">{currentSpotType.price}€</span>
              </div>
              <p className="text-gray-600">{currentSpotType.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                <span>{currentSpotType.currentCount}/{currentSpotType.limit} spots taken</span>
              </div>
            </div>
          )}
          
          {/* Spot Selection */}
          {(!hasSpot || isSelectingSpot) && (
            <div className="grid gap-4 md:grid-cols-2">
              {spotTypes.map(spot => (
                <Button
                  key={spot.id}
                  variant={spot.id === userUpdate.spotTypeID ? "default" : "outline"}
                  disabled={spot.currentCount >= spot.limit}
                  onClick={() => {
                    setUserUpdate({givesSoli: userUpdate.givesSoli, takesSoli: userUpdate.takesSoli, spotTypeID: spot.id})
                    // updateMe();
                  }}
                  className="w-full p-4 h-auto flex flex-col items-start text-left"
                >
                  <div className="flex justify-between w-full  items-start">
                    <span className="font-bold">{spot.name}</span>
                    <span className="ml-2 whitespace-nowrap">{spot.price}€</span>
                  </div>
                  <p className="text-xs whitespace-normal break-words w-full line-clamp-3">{spot.description}</p>
                  <div className="text-xs w-full">
                    {spot.currentCount}/{spot.limit} spots taken
                  </div>
                </Button>
              ))}
            </div>
          )}
          {hasSpot && !isSelectingSpot && (
            <Button
              variant="outline"
              onClick={() => setIsSelectingSpot(true)}
            >
              Platz Ändern
            </Button>
          )}
          {hasSpot && isSelectingSpot && (
            <Button
              variant="outline"
              onClick={() => setIsSelectingSpot(false)}
            >
              Doch nicht
            </Button>
          )}
          
          {/* Solidarity Options */}
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Soli</h3>
            <RadioGroup
              value={soliSelection}
              onValueChange={handleSoliChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="give" id="give-soli" />
                <Label htmlFor="give-soli" className="flex items-center">
                  <Euro className="w-4 h-4 mr-2" />
                  Give {soliAmount}€
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="take" id="take-soli" />
                <Label htmlFor="take-soli" className="flex items-center">
                  <Euro className="w-4 h-4 mr-2" />
                  Request {soliAmount}€
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="no-soli" />
                <Label htmlFor="no-soli">No solidarity contribution</Label>
              </div>
            </RadioGroup>
          </div>
          
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            
            variant="outline"
            onClick={() => {updateMe(); setIsSelectingSpot(false);}}
          >
            Speichern
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SpotSelectionCard;