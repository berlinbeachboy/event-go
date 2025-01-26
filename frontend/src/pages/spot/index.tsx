import { useState } from 'react';
import { useAuth } from '@/api/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SpotType } from '@/models/models';
import { cn } from '@/lib/utils';

interface UserPageProps {
  userSpots: SpotType[];
}

const SpotCard = ({ 
  spot, 
  selected, 
  onSelect, 
  disabled 
}: { 
  spot: SpotType; 
  selected: boolean; 
  onSelect: () => void;
  disabled: boolean;
}) => {
  const spotTypeImageMap: Record<string, string> = {
    "Zeltplatz": "/images/tent_mn.PNG",
    "Hausplatz": "/images/bed_mn.PNG",
    "Glamping-Tipi": "/images/tent_mn.PNG",
    "Yogaraum": "/images/bed_mn.PNG",
    "Leider nicht dabei" : "/images/sad.PNG"
  };
  
  function resolveSpotTypeImage(spotTypeName: string): string {
  // Exact match
  if (spotTypeImageMap[spotTypeName]) {
      return spotTypeImageMap[spotTypeName];
  }

  // Partial match (case-insensitive)
  const matchedKey = Object.keys(spotTypeImageMap).find(
      key => spotTypeName.toLowerCase().includes(key.toLowerCase())
  );

  return matchedKey ? spotTypeImageMap[matchedKey] : "/images/tnt_mn.jpg";
  }

  return (
    <div
      onClick={() => !disabled && onSelect()}
      className={cn(
        "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
        selected ? "border-black bg-custom-aquamarine/20" : "border-gray-200 hover:border-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        "flex items-center gap-4"
      )}
    >
    <div className="flex-grow pr-4">
      <h3 className="text-xl font-medium text-black mb-2">{spot.name}   </h3>
      <p className="text-sm text-gray-600">{spot.price}€     
        <span className={cn(
            "px-2 py-1 rounded-full",
            spot.currentCount >= spot.limit 
              ? "bg-red-100 text-red-800" 
              : "bg-green-100 text-green-800"
          )}>
            {spot.currentCount} / {spot.limit}
          </span>
        </p>
        <br></br>
      <p className="text-gray-600">{spot.description}</p>
    </div>
    {resolveSpotTypeImage(spot.name) && (
        <div className="ml-0 w-28 flex-shrink-0">
        <img 
            src={resolveSpotTypeImage(spot.name)} 
            alt={spot.name} 
            className="rounded-lg object-cover w-full h-32"
        />
        </div>
    )}
      {/* <div className="text-center">
        <h4 className="font-medium">{spot.name}</h4>
        <p className="text-sm text-gray-600">{spot.price}€</p>
        <div className="mt-2 text-xs">
          <span className={cn(
            "px-2 py-1 rounded-full",
            spot.currentCount >= spot.limit 
              ? "bg-red-100 text-red-800" 
              : "bg-green-100 text-green-800"
          )}>
            {spot.currentCount} / {spot.limit} spots
          </span>
        </div>
      </div> */}
    </div>
  );
};


  const SpotPage = ({ userSpots }: UserPageProps) => {
    const { user, updateUser, isLoading } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(true);
    const [formData, setFormData] = useState({
      soliType: user?.givesSoli ? 'give' : user?.takesSoli ? 'take' : 'none',
      spotTypeId: user?.spotTypeId || 0,
    });
    const noSpot = {
      id: 0,
      name: "Leider nicht dabei",
      price: 0,
      limit: 0,
      description: ":(",
      currentCount: 0
    }

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateUser({
        ...formData,
        givesSoli: formData.soliType === 'give',
        takesSoli: formData.soliType === 'take',
      });
      setIsEditing(false);
      toast({
        title: "Hat geklappt!",
        description: "Dein Spot wurde geuptdated!",
      });
    } catch {
      toast({
        title: "Fehler",
        description: "Mist, hat leider nicht geklappt.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-5xl md:p-24">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Dein Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Spot Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Wähle hier deinen Spot aus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotCard
                  key={0}
                  spot={noSpot}
                  selected={formData.spotTypeId === 0 || !formData.spotTypeId || formData.spotTypeId == null}
                  onSelect={() => handleChange('spotTypeId', 0)}
                  disabled={!isEditing}
                />
              {userSpots.map(spot => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  selected={formData.spotTypeId === spot.id}
                  onSelect={() => handleChange('spotTypeId', spot.id)}
                  disabled={!isEditing || (spot.currentCount >= spot.limit && formData.spotTypeId !== spot.id)}
                />
              ))}
            </div>

            {/* Soli Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Soli von 25€ Beantragen oder Spendieren</h3>
            <RadioGroup 
              value={formData.soliType} 
              onValueChange={(value) => handleChange('soliType', value)}
              disabled={!isEditing}
              className="gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">Kein Soli</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="give" id="give" />
                <Label htmlFor="give" className="flex items-center">
                  Ich möchte den Soli spendieren ❤️
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="take" id="take" />
                <Label htmlFor="take">Soli beantragen (Kein Grund zum Schämen!)</Label>
              </div>
            </RadioGroup>
          </div>

            {/* Current Subscription Info */}
            <div className="grid gap-4 mt-6">
              <div className="flex justify-between items-center py-3 px-6 bg-muted rounded-lg">
                <span>Dein Spot: </span>
                <span className="font-medium">{user.spotType?.name || 'Noch kein Spot ausgewählt'}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-6 bg-muted rounded-lg">
                <span>Zahlungsstatus</span>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  user.amountPaid >= (user.amountToPay || 0)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.amountPaid}€ / {user.amountToPay + user.amountPaid}€
                </div>
              </div>
              <div className="flex justify-between items-center py-3 px-6 bg-muted rounded-lg">
                <span>Zahlen müsst ihr erst bis Ende April, Zahlungsinfos folgen </span>
              </div>
            </div>
          </div>
          </CardContent>

        <CardFooter className="flex justify-end gap-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    soliType: user.givesSoli ? 'give' : user.takesSoli ? 'take' : 'none',
                    spotTypeId: user.spotTypeId || 0,
                  });
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Änderungen vornehmen
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SpotPage;