import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useWallet } from '../contexts/WalletContext';
import { Copy, Check, QrCode } from 'lucide-react';
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
      <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="size-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <QrCode className="size-4 text-indigo-600" />
            </div>
            Receive Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Scan QR code or copy address to receive funds
            </p>
            {qrCode && (
              <div className="inline-block p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 mb-4 shadow-lg">
                <img src={qrCode} alt="QR Code" className="size-48" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Your Address</div>
            <div className="flex gap-3">
              <div className="flex-1 p-5 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl break-all text-sm font-mono hover:from-gray-100 hover:to-gray-150 shadow-sm transition-all duration-200">
                {address}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyAddress}
                className="border-2 border-gray-300 hover:border-indigo-400 rounded-xl w-12 h-12 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {copied ? <Check className="size-5 text-green-500" /> : <Copy className="size-5 text-gray-600" />}
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-5 text-amber-800 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 size-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Important Notice</p>
                <p className="text-sm">Only send {currentNetwork.symbol} and tokens on the {currentNetwork.name} network to this address.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}