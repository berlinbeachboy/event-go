import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SpotType } from '@/models/models';

interface SpotCalculatorProps {
    spotTypes: SpotType[];
    isLoading?: boolean;
  }

const SpotCalculator = ({spotTypes, isLoading}: SpotCalculatorProps) => {
  const [spotCounts, setSpotCounts] = useState<Record<number, number>>(
    () => {
        const initialCounts: Record<number, number> = {};
        spotTypes.forEach(spot => {
          initialCounts[spot.id] = spot.limit;
        });
        return initialCounts;
    }
  );
    
  const [solidarityGivers, setSolidarityGivers] = useState(0);
  const [solidarityTakers, setSolidarityTakers] = useState(0);

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

    const solidarityBalance = (solidarityGivers * 25) - (solidarityTakers * 25);
    const total = spotSubtotal + solidarityBalance;
    const totalGuests = Object.values(spotCounts).reduce((sum, count) => sum + count, 0);

    return {
      spotSubtotal,
      solidarityBalance,
      total,
      totalGuests
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
              <Label className="w-32">Solispendierende</Label>
              <Input
                type="number"
                min="0"
                value={solidarityGivers}
                onChange={(e) => setSolidarityGivers(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-32">Solibeaspruchende</Label>
              <Input
                type="number"
                min="0"
                value={solidarityTakers}
                onChange={(e) => setSolidarityTakers(Math.max(0, parseInt(e.target.value) || 0))}
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
              
              <span>Spots:</span>
              <span>€{totals.spotSubtotal.toFixed(2)}</span>
              
              <span>Soli:</span>
              <span className={totals.solidarityBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                €{totals.solidarityBalance.toFixed(2)}
              </span>
              
              <span className="font-medium">Gesamtbudget:</span>
              <span className="font-medium">€{totals.total.toFixed(2)}</span>
            </div>
          </div>
        
        
      </CardContent>
      )}
    </Card>
    </div>
  );
};

export default SpotCalculator;