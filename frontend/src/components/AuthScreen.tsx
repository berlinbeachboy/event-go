import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { Button } from "@/components/ui/button";

interface AuthScreenProps {
  onSuccess: () => Promise<void>;
}

const AuthScreen = ({ onSuccess }: AuthScreenProps) => {
  const [view, setView] = useState<'login' | 'register'>('login');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-screen h-screen">
      {/* Left side - Image and welcome text */}
      <div className="hidden lg:flex bg-muted items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        <div className="relative z-10 max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            {view === 'login' ? 'Welcome Back!' : 'Join Us!'}
          </h1>
          <p className="text-muted-foreground">
            {view === 'login' 
              ? 'Enter your credentials to access your account'
              : 'Create an account to get started'
            }
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-sm mx-auto space-y-6">
          {view === 'login' ? (
            <LoginForm onLogin={onSuccess} />
          ) : (
            <RegisterForm onSuccess={onSuccess} />
          )}
          
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-primary"
            onClick={() => setView(view === 'login' ? 'register' : 'login')}
          >
            {view === 'login'
              ? "Don't have an account? Register here"
              : "Already have an account? Login here"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;