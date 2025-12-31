import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';
import { Download, Key, FileText } from 'lucide-react';

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
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="size-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Download className="size-4 text-indigo-600" />
            </div>
            Import Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs value={importMethod} onValueChange={(v:any) => setImportMethod(v as 'phrase' | 'key')}>
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 p-1.5 mt-2 shadow-inner">
            <TabsTrigger 
              value="phrase" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-2.5 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4" />
                <span>Recovery Phrase</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="key" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-2.5 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Key className="size-4" />
                <span>Private Key</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phrase" className="space-y-5 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phrase" className="text-sm font-medium text-gray-700">Recovery Phrase (12 words)</Label>
                <textarea
                  id="phrase"
                  value={recoveryPhrase}
                  onChange={(e) => setRecoveryPhrase(e.target.value)}
                  placeholder="Enter your 12-word recovery phrase"
                  className="w-full min-h-[140px] px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min. 8 characters)"
                  className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors duration-200 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors duration-200 shadow-sm"
                />
              </div>
            </div>

            <Button 
              onClick={handleImport} 
              className="w-full py-5 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Import Wallet
            </Button>
          </TabsContent>

          <TabsContent value="key" className="space-y-5 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privateKey" className="text-sm font-medium text-gray-700">Private Key</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key (with or without 0x)"
                  className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors duration-200 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2" className="text-sm font-medium text-gray-700">Create Password</Label>
                <Input
                  id="password2"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min. 8 characters)"
                  className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors duration-200 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword2" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword2"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-3 transition-colors duration-200 shadow-sm"
                />
              </div>
            </div>

            <Button 
              onClick={handleImport} 
              className="w-full py-5 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Import Wallet
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
