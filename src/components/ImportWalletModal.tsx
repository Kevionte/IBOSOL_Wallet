import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';

interface ImportWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportWalletModal({ open, onClose }: ImportWalletModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [importMethod, setImportMethod] = useState<'phrase' | 'key'>('phrase');
  const { importWallet, importWithPrivateKey } = useWallet();

  const handleImport = () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (importMethod === 'phrase') {
      const words = recoveryPhrase.trim().split(/\s+/);
      if (words.length !== 12) {
        toast.error('Recovery phrase must contain exactly 12 words');
        return;
      }
      importWallet(password, recoveryPhrase.trim());
      toast.success('Wallet imported successfully with recovery phrase!');
    } else {
      if (!privateKey.trim()) {
        toast.error('Please enter a private key');
        return;
      }
      importWithPrivateKey(password, privateKey.trim());
      toast.success('Wallet imported successfully with private key!');
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setRecoveryPhrase('');
    setPrivateKey('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Wallet</DialogTitle>
        </DialogHeader>

        <Tabs value={importMethod} onValueChange={(v:any) => setImportMethod(v as 'phrase' | 'key')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phrase">Recovery Phrase</TabsTrigger>
            <TabsTrigger value="key">Private Key</TabsTrigger>
          </TabsList>

          <TabsContent value="phrase" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phrase">Recovery Phrase (12 words)</Label>
              <textarea
                id="phrase"
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                placeholder="Enter your 12-word recovery phrase"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min. 8 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>

            <Button onClick={handleImport} className="w-full">
              Import Wallet
            </Button>
          </TabsContent>

          <TabsContent value="key" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key (with or without 0x)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Create Password</Label>
              <Input
                id="password2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min. 8 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword2">Confirm Password</Label>
              <Input
                id="confirmPassword2"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>

            <Button onClick={handleImport} className="w-full">
              Import Wallet
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
