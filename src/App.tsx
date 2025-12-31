import React from 'react';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { UnlockWallet } from './components/UnlockWallet';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';

function MainContent() {
  const { hasWallet, isLocked } = useWallet();

  if (!hasWallet) {
    return <WelcomeScreen />;
  }

  if (isLocked) {
    return <UnlockWallet />;
  }

  return (
    <>
      <Dashboard />
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <WalletProvider>
        <MainContent />
        <Toaster position="top-right" richColors />
      </WalletProvider>
    </div>
  );
}