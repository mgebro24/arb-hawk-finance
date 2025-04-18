
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, LogOut } from "lucide-react";

const WalletConnect = () => {
  const { walletInfo, isLoading, connectWallet, disconnectWallet, isPhantomInstalled } = useWallet();

  // Format the wallet address to show only first and last 4 characters
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Format balance to 4 decimal places
  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  if (!isPhantomInstalled) {
    return (
      <Button 
        variant="outline" 
        className="text-primary hover:text-primary-foreground border-primary hover:bg-primary transition-colors"
        onClick={() => window.open("https://phantom.app/", "_blank")}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Install Phantom
      </Button>
    );
  }

  if (walletInfo.connected) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-medium">{formatAddress(walletInfo.address)}</span>
          <span className="text-xs text-muted-foreground">{formatBalance(walletInfo.balance)} SOL</span>
        </div>
        <Button 
          variant="outline" 
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={disconnectWallet}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="md:block">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={connectWallet} 
      disabled={isLoading}
      className="bg-gradient-1 hover:opacity-90 transition-opacity"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletConnect;
