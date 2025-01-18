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

interface PasswordResetFormProps {
  token: string;
  onReset: () => void;
}

export default function PasswordResetForm({ token, onReset }: PasswordResetFormProps) {
  const [formData, setFormData] = useState({token: token, password: '', passwordConfirm: '' });
  const { resetPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(formData);
      toast({
        title: "Hat geklappt!",
        description: "Jetzt nochmal anmelden mit die neue Password bidde",
      });
      onReset()
    } catch (error) {
      console.error(error);
      toast({
        title: "Hat nicht geklappt",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Passwort Zurücksetzen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="Dein neues Passwort"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Password</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              placeholder="Weisch's noch?"
              type="passwordConfirm"
              value={formData.password}
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
            Passwort Zurücksetzen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}