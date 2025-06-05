import BalloonGame from '@/components/BallonGame';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from 'react';

  const DjsPage = () => {

    const [isBallooning, setIsBallooning] = useState(false);

  return (
    <div className="min-h-screen bg-white relative">
            {isBallooning && <BalloonGame/>}
    <div className="container mx-auto max-w-7xl md:p-24">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Timetable</CardTitle>
        </CardHeader>
        <CardContent>
            <div>
                <img 
                src="/images/djs.png" 
                alt="Mist, nix da"
                className="object-cover"
            />
            </div>
        </CardContent>
      </Card>
      <br></br>
    </div>
    <div className="ml-2 w-64 cursor-pointer" onClick={() => setIsBallooning(!isBallooning)}
            >
                <img 
                    src="/images/balloons/blue.png"
                    alt="balloon_button"
                    className="rounded-lg object-cover w-full h-full"
                />
                </div>
    </div>
  );
};

export default DjsPage;