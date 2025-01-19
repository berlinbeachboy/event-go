import { useState } from 'react';
import { useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { Button } from "@/components/ui/button";
import RequestPasswordForm from './RequestPassword';
import PasswordResetForm from './ResetPasswordForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthScreenProps {
  onSuccess: () => Promise<void>;
}

const AuthScreen = ({ onSuccess }: AuthScreenProps) => {
  const [view, setView] = useState<'login' | 'register' | 'requestPw' | 'updatePw'>('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, _] = useSearchParams();
  const resetToken = searchParams.get("resetToken")
  const emailVerify = searchParams.get("verify")
  const resetTokenPass = resetToken as string

  useEffect(() => {
    if (emailVerify === "success"){
    toast({
         title: "Dein Account wurde verfiziert!",
         description: "Ab geht die Post!",
       });
  }
  if (resetToken !== null){
    setView('updatePw')
  }

  })
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-screen h-screen">
      {/* Left side - Image and welcome text */}
      <div className="hidden lg:flex bg-muted items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        <div className="relative z-10 max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            {view === 'register' ?  "Registriere dich für Schönfeld '25" : 'Schönfeld geht in die nächste Runde!'}
          </h1>
          <p className="text-muted-foreground">
            {view === 'register' 
              ? "Registrieren heißt noch nicht, dass du kommen oder zahlen musst ;-)" : 'Hier einloggen'
            }
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-sm mx-auto space-y-6">
          {view === 'login' ? (
            <LoginForm onLogin={onSuccess} />
          ) : view === 'register' ? (
            <RegisterForm onSuccess={() => setView('login')} />
          ) : view === 'requestPw' ? (
            <RequestPasswordForm onSuccess={() => setView('login')}/>
          ) : <PasswordResetForm token={resetTokenPass} onReset={() => navigate('/')} />}
          
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-primary"
            onClick={() => setView(view === 'login' ? 'register' : 'login')}
          >
            {view === 'login'
              ? "Du willst dich registrieren?"
              : "Du bist schon angemeldet? Dann hier entlang!"}
          </Button>
          {view !== 'requestPw' && view !== 'updatePw' && <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-primary"
            onClick={() => setView('requestPw')}
          >
            Passwort vergessen?
          </Button>}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;