import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Contract Address *</Label>
            <Input
              id="tokenAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol *</Label>
            <Input
              id="tokenSymbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., USDT"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name *</Label>
            <Input
              id="tokenName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tether USD"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenDecimals">Decimals</Label>
            <Input
              id="tokenDecimals"
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              placeholder="18"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p><strong>Note:</strong> Make sure you trust the token contract before adding it. Only add tokens from verified sources.</p>
          </div>

          <Button onClick={handleAddToken} className="w-full">
            Add Token
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
