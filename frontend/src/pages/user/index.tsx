import { useState } from 'react';
import { useAuth } from '@/api/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

  const UserPage = () => {
    const { user, updateUser, isLoading } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(true);
    const [formData, setFormData] = useState({
      username: user?.username || '',
      nickname: user?.nickname || '',
      fullName: user?.fullName || '',
      phone: user?.phone || ''
    });

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateUser({
        ...formData
      });
      setIsEditing(false);
      toast({
        title: "Hat geklappt!",
        description: "Dein Profil wurde geuptdated!",
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
    <div className="container mx-auto max-w-4xl md:p-24">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Dein Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kontaktinfo</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Spitzname</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Vor- und Nachname</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Handynummer</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
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
                    username: user.username || '',
                    nickname: user.nickname || '',
                    fullName: user.fullName || '',
                    phone: user.phone || ''
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

export default UserPage;