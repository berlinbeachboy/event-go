import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SpotType } from '@/models/models';

interface SpotCalculatorProps {
    spotTypes: SpotType[];
    soliAmount: number
    isLoading?: boolean;
  }

const SpotCalculator = ({spotTypes, soliAmount, isLoading}: SpotCalculatorProps) => {
  const [spotCounts, setSpotCounts] = useState<Record<number, number>>(
    () => {
        const initialCounts: Record<number, number> = {};
        spotTypes.forEach(spot => {
          initialCounts[spot.id] = spot.limit;
        });
        return initialCounts;
    }
  );
  const [solidarityAmount, setsolidarityAmount] = useState(soliAmount);

  const [hausCost, setHausCost] = useState(9800);
  const [foodCost, setFoodCost] = useState(1200);
  const [techCost, setTechCost] = useState(270);
  const [mobCost, setMobCost] = useState(370);
  const [funCost, setFunCost] = useState(300);
  const [puffer, setPuffer] = useState(250);

  const handleSpotCountChange = (spotId: number, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setSpotCounts(prev => ({
      ...prev,
      [spotId]: numValue
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const spotSubtotal = Object.entries(spotCounts).reduce((total, [spotId, count]) => {
      const spot = spotTypes.find(s => s.id === Number(spotId));
      return total + (spot?.price || 0) * count;
    }, 0);

    const allCosts = hausCost + foodCost + funCost + techCost + mobCost + puffer
    // const solidarityBalance = (solidarityGivers * 25) - (solidarityTakers * 25);
    const total = spotSubtotal + solidarityAmount;
    const totalGuests = Object.values(spotCounts).reduce((sum, count) => sum + count, 0);
    const final = total - allCosts

    return {
      allCosts,
      spotSubtotal,
      solidarityAmount,
      total,
      totalGuests,
      final
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4 relative">
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Finanzerecke</CardTitle>
      </CardHeader>
      {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
        <CardContent className="space-y-6">
            {/* Spot Type Inputs */}
            <div className="space-y-4">
            {spotTypes.map(spot => (
              <div key={spot.id} className="flex items-center gap-4">
                <Label className="w-32">{spot.name}</Label>
                <Input
                  type="number"
                  min="0"
                  max={spot.limit}
                  value={spotCounts[spot.id] || 0}
                  onChange={(e) => handleSpotCountChange(spot.id, e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">
                  €{spot.price} each (max: {spot.limit})
                </span>
              </div>
            ))}
          </div>
  
          <Separator />
  
          {/* Solidarity System */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="w-32">Soli</Label>
              <Input
                type="number"
                value={solidarityAmount}
                onChange={(e) => setsolidarityAmount(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
  
          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="w-32">Haus</Label>
              <Input
                type="number"
                value={hausCost}
                onChange={(e) => setHausCost(parseInt(e.target.value))}
                className="w-24"
              />
              <Label className="w-32">Essen</Label>
              <Input
                type="number"
                value={foodCost}
                onChange={(e) => setFoodCost(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-32">Technik</Label>
              <Input
                type="number"
                value={techCost}
                onChange={(e) => setTechCost(parseInt(e.target.value))}
                className="w-24"
              />
              <Label className="w-32">Mobilität</Label>
              <Input
                type="number"
                value={mobCost}
                onChange={(e) => setMobCost(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Label className="w-32">Fun</Label>
              <Input
                type="number"
                value={funCost}
                onChange={(e) => setFunCost(parseInt(e.target.value))}
                className="w-24"
              />
              <Label className="w-32">Puffer</Label>
              <Input
                type="number"
                value={puffer}
                onChange={(e) => setPuffer(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
          <Separator />
  
          {/* Summary */}
          <div className="space-y-2">
            <h3 className="font-medium">Ergebnis</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Anzahl Gäste:</span>
              <span>{totals.totalGuests}</span>
              
              <span>Tickets:</span>
              <span>€{totals.spotSubtotal.toFixed(2)}</span>
              
              <span>Soli:</span>
              <span>
                €{totals.solidarityAmount.toFixed(2)}
              </span>

              <span>Kosten:</span>
              <span>€{totals.allCosts}</span>
              
              <span className="font-medium">Gesamtbudget:</span>
              <span className="font-medium">€{totals.total.toFixed(2)}</span>

              <span className="font-medium">Ergebnis:</span>
              <span className={totals.final >= 0 ? 'text-green-600' : 'text-red-600'}>€{totals.final.toFixed(2)}</span>
            </div>
          </div>
        
        
      </CardContent>
      )}
    </Card>
    </div>
  );
};

export default SpotCalculator;