import { useAuth } from '@/api/hooks/use-auth';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { useToast } from '@/hooks/use-toast';

interface RequestPasswordResetProps {
  onSuccess: () => void;
}

export default function RequestPasswordForm({ onSuccess }: RequestPasswordResetProps) {
  const [emailPWReset, setEmailPWReset] = useState('');
  const { requestPasswordReset, isLoading } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailPWReset(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPasswordReset(emailPWReset);
      
      toast({
        title: "Email isch raus",
        description: "Auch im Spam schauen bidde",
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Hat net geklappt!",
        description: "Sonst Pete Bescheid geben...",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center"> Link zum Zurücksetzen anfordern </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailPWReset">Deine Email</Label>
            <Input
              id="emailPWReset"
              name="emailPWReset"
              placeholder="geileSchnegge69@hotmail.fun"
              type="text"
              value={emailPWReset}
              onChange={handleChange}
              required
            />
          </div>
          <Button 
            className="w-full" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Link beantragen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}