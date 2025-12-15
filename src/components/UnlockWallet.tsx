import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWallet } from '../contexts/WalletContext';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export function UnlockWallet() {
  const [password, setPassword] = useState('');
  const { unlockWallet } = useWallet();

  const handleUnlock = () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    const success = unlockWallet(password);
    if (!success) {
      toast.error('Incorrect password');
      return;
    }

    toast.success('Wallet unlocked');
    setPassword('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-16 bg-indigo-100 rounded-full mb-4">
            <Lock className="size-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl mb-2">Welcome Back</h1>
          <p className="text-gray-600">Unlock your wallet to continue</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              autoFocus
            />
          </div>

          <Button onClick={handleUnlock} className="w-full">
            Unlock Wallet
          </Button>
        </div>
      </Card>
    </div>
  );
}
