
import { useState, useEffect, useCallback } from 'react';
import { WalletInfo } from '@/utils/types';
import { toast } from '@/hooks/use-toast';

export const useWallet = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    balance: 0,
    connected: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Check if Phantom wallet is installed
  const checkIfPhantomInstalled = useCallback(() => {
    const isPhantomInstalled = window.phantom?.solana?.isPhantom;
    return !!isPhantomInstalled;
  }, []);

  // Connect to Phantom wallet
  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!checkIfPhantomInstalled()) {
        toast({
          title: "Phantom wallet not found",
          description: "Please install Phantom wallet extension first",
          variant: "destructive"
        });
        return false;
      }
      
      const { solana } = window.phantom!;
      
      // Connect to wallet
      const response = await solana.connect();
      const publicKey = response.publicKey.toString();
      
      // Get SOL balance (simplified for demo)
      const balance = Math.random() * 10; // Mocked balance for now
      
      setWalletInfo({
        address: publicKey,
        balance,
        connected: true
      });
      
      toast({
        title: "Wallet connected",
        description: `Connected to ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkIfPhantomInstalled]);

  // Disconnect from wallet
  const disconnectWallet = useCallback(() => {
    try {
      if (window.phantom?.solana && walletInfo.connected) {
        window.phantom.solana.disconnect();
      }
      
      setWalletInfo({
        address: '',
        balance: 0,
        connected: false
      });
      
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      });
      
      return true;
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
      return false;
    }
  }, [walletInfo.connected]);

  // Effect to check wallet connection on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!checkIfPhantomInstalled()) return;
      
      try {
        // Check if already connected
        if (window.phantom?.solana?.isConnected) {
          const publicKey = window.phantom.solana.publicKey?.toString();
          if (publicKey) {
            // Get SOL balance (simplified for demo)
            const balance = Math.random() * 10; // Mocked balance for now
            
            setWalletInfo({
              address: publicKey,
              balance,
              connected: true
            });
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkWalletConnection();
    
    // Cleanup function
    return () => {
      // Cleanup when component unmounts
    };
  }, [checkIfPhantomInstalled]);

  return {
    walletInfo,
    isLoading,
    connectWallet,
    disconnectWallet,
    isPhantomInstalled: checkIfPhantomInstalled()
  };
};

// Add TypeScript augmentation for the Phantom wallet
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean;
        isConnected: boolean;
        publicKey?: {
          toString(): string;
        };
        connect(): Promise<{
          publicKey: {
            toString(): string;
          };
        }>;
        disconnect(): Promise<void>;
      };
    };
  }
}
