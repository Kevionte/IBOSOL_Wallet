import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useWallet } from '../contexts/WalletContext';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReceiveModal({ open, onClose }: ReceiveModalProps) {
  const { address, currentNetwork } = useWallet();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    if (address && open) {
      QRCode.toDataURL(address, { width: 256 })
        .then(setQrCode)
        .catch(console.error);
    }
  }, [address, open]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Scan QR code or copy address to receive funds
            </p>
            {qrCode && (
              <div className="inline-block p-4 bg-white rounded-lg border">
                <img src={qrCode} alt="QR Code" className="size-64" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">Your Address</div>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg break-all text-sm">
                {address}
              </div>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <p><strong>Important:</strong> Only send {currentNetwork.symbol} and tokens on the {currentNetwork.name} network to this address.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}