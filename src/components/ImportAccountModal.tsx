import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';

interface ImportAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportAccountModal({ open, onClose }: ImportAccountModalProps) {
  const [password, setPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [importMethod, setImportMethod] = useState<'phrase' | 'key'>('phrase');
  const { importAccount, importAccountWithKey, accounts } = useWallet();

  const handleImport = () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    if (!accountName.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    try {
      if (importMethod === 'phrase') {
        const words = recoveryPhrase.trim().split(/\s+/);
        if (words.length !== 12) {
          toast.error('Recovery phrase must contain exactly 12 words');
          return;
        }
        importAccount(password, recoveryPhrase.trim(), accountName.trim());
        toast.success('Account imported successfully with recovery phrase!');
      } else {
        if (!privateKey.trim()) {
          toast.error('Please enter a private key');
          return;
        }
        importAccountWithKey(password, privateKey.trim(), accountName.trim());
        toast.success('Account imported successfully with private key!');
      }

      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to import account');
    }
  };

  const resetForm = () => {
    setPassword('');
    setRecoveryPhrase('');
    setPrivateKey('');
    setAccountName('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Account</DialogTitle>
        </DialogHeader>

        <Tabs value={importMethod} onValueChange={(v:any) => setImportMethod(v as 'phrase' | 'key')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phrase">Recovery Phrase</TabsTrigger>
            <TabsTrigger value="key">Private Key</TabsTrigger>
          </TabsList>

          <TabsContent value="phrase" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={`Account ${accounts.length + 1}`}
              />
            </div>

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
              <Label htmlFor="password">Enter Your Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your wallet password"
              />
            </div>

            <Button onClick={handleImport} className="w-full">
              Import Account
            </Button>
          </TabsContent>

          <TabsContent value="key" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName2">Account Name</Label>
              <Input
                id="accountName2"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={`Account ${accounts.length + 1}`}
              />
            </div>

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
              <Label htmlFor="password2">Enter Your Password</Label>
              <Input
                id="password2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your wallet password"
              />
            </div>

            <Button onClick={handleImport} className="w-full">
              Import Account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
