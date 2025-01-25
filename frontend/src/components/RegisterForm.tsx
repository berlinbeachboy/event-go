import { useState } from 'react';
import { useAuth } from '@/api/hooks/use-auth';
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
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: '',
    fullName: '',
    phone: '',
    sitePassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      await onSuccess();
      toast({
        title: "Top, jetzt nur noch die Mail bestätigen",
        description: "Check deine Mails (auch Spam) und verfiziere dein Mail!",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "Please check your details and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Jetzt Registrieren</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="username">Email</Label>
            <Input
              id="username"
              name="username"
              type="email"
              placeholder="Deine Email Adresse"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Dein Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Nickname field */}
          <div className="space-y-2">
            <Label htmlFor="nickname">Spitzname</Label>
            <Input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="Dein Spitzname"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </div>

          {/* Full Name field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Vor- und Nachname</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Dein Nachname"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Handynr. (Optional für Whatsapp)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+49 1500 123456"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Site Password field */}
          <div className="space-y-2">
            <Label htmlFor="sitePassword">Passwort der Seite</Label>
            <Input
              id="sitePassword"
              name="sitePassword"
              type="password"
              placeholder="Frag hierfür ein Orgamitglied"
              value={formData.sitePassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2 text-xs">
            Mit der Registrierung stimmst du unseren <a className="hover:underline" href='/privacy'>Datenschutzrichtlinien</a> zu.
          </div>

          {/* Submit button */}
          <Button 
            className="w-full" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Los geht's!
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}