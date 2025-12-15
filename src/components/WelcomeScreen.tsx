import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Wallet, Download } from 'lucide-react';
import { CreateWalletModal } from './CreateWalletModal';
import { ImportWalletModal } from './ImportWalletModal';

export function WelcomeScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-20 bg-indigo-600 rounded-full mb-4">
            <Wallet className="size-10 text-white" />
          </div>
          <h1 className="text-3xl mb-2">IBOSOL Wallet</h1>
          <p className="text-gray-600">Your gateway to the IBOSOL network</p>
        </div>

        <div className="space-y-3">
          <Button onClick={() => setShowCreate(true)} className="w-full h-12">
            <Wallet className="size-5 mr-2" />
            Create New Wallet
          </Button>

          <Button onClick={() => setShowImport(true)} variant="outline" className="w-full h-12">
            <Download className="size-5 mr-2" />
            Import Existing Wallet
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure • Decentralized • Open Source</p>
        </div>
      </Card>

      <CreateWalletModal open={showCreate} onClose={() => setShowCreate(false)} />
      <ImportWalletModal open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
