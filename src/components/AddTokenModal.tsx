import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';
import { PlusCircle, AlertCircle } from 'lucide-react';

interface AddTokenModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTokenModal({ open, onClose }: AddTokenModalProps) {
  const [address, setAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [decimals, setDecimals] = useState('18');
  const { addToken } = useWallet();

  const handleAddToken = () => {
    if (!address || !symbol || !name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!address.startsWith('0x') || address.length !== 42) {
      toast.error('Invalid token contract address');
      return;
    }

    const decimalsNum = parseInt(decimals);
    if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 18) {
      toast.error('Decimals must be between 0 and 18');
      return;
    }

    addToken({
      address,
      symbol: symbol.toUpperCase(),
      name,
      decimals: decimalsNum,
    });

    toast.success(`${symbol} token added successfully!`);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setAddress('');
    setSymbol('');
    setName('');
    setDecimals('18');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="size-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <PlusCircle className="size-4 text-indigo-600" />
            </div>
            Add Custom Token
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenAddress" className="text-sm font-medium text-gray-700">Token Contract Address *</Label>
              <Input
                id="tokenAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-5 transition-colors duration-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenSymbol" className="text-sm font-medium text-gray-700">Token Symbol *</Label>
              <Input
                id="tokenSymbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g., USDT"
                className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-5 transition-colors duration-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenName" className="text-sm font-medium text-gray-700">Token Name *</Label>
              <Input
                id="tokenName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tether USD"
                className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-5 transition-colors duration-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenDecimals" className="text-sm font-medium text-gray-700">Decimals</Label>
              <Input
                id="tokenDecimals"
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                placeholder="18"
                className="rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-5 transition-colors duration-200 shadow-sm"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5 text-blue-800 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Security Note</p>
                <p className="text-sm">Make sure you trust the token contract before adding it. Only add tokens from verified sources.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleAddToken} 
            className="w-full py-5 rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Add Token
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
