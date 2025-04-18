
import { useState } from "react";
import { Button } from "@/components/ui/button";
import WalletConnect from "./WalletConnect";
import { 
  Settings, 
  RefreshCw, 
  SwitchCamera,
  Network
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  refreshData: () => void;
  isLoading: boolean;
  lastUpdate: number;
  isTestnet: boolean;
  toggleTestnet?: () => void;
  changeRpcEndpoint: (endpoint: string) => void;
  rpcEndpoint: string;
}

const Header = ({
  refreshData,
  isLoading,
  lastUpdate,
  isTestnet,
  toggleTestnet,
  changeRpcEndpoint,
  rpcEndpoint
}: HeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newRpcEndpoint, setNewRpcEndpoint] = useState(rpcEndpoint);

  // Format the last update time
  const formatLastUpdate = () => {
    if (lastUpdate === 0) return "Never";
    
    const date = new Date(lastUpdate);
    return date.toLocaleTimeString();
  };

  // Save the new RPC endpoint
  const saveRpcEndpoint = () => {
    if (!newRpcEndpoint.trim()) {
      toast({
        title: "Invalid RPC endpoint",
        description: "Please enter a valid RPC endpoint URL",
        variant: "destructive"
      });
      return;
    }
    
    changeRpcEndpoint(newRpcEndpoint.trim());
    setIsSettingsOpen(false);
  };

  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-muted bg-card">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-1">
          ArbHawk Finance
        </h1>
        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-sm text-xs">
          {isTestnet ? "Testnet" : "Mainnet"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground mr-2 hidden md:block">
          Last update: {formatLastUpdate()}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={refreshData}
          disabled={isLoading}
          className="relative"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>

        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Bot Settings</DialogTitle>
              <DialogDescription>
                Configure RPC endpoints and network settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rpc-endpoint">RPC Endpoint</Label>
                <Input
                  id="rpc-endpoint"
                  value={newRpcEndpoint}
                  onChange={(e) => setNewRpcEndpoint(e.target.value)}
                  placeholder="https://api.mainnet-beta.solana.com"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a custom RPC endpoint or use a provider like Helius, QuickNode, or Alchemy
                </p>
              </div>
              
              {toggleTestnet && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="testnet-toggle">Use Testnet</Label>
                  <Button
                    id="testnet-toggle"
                    variant={isTestnet ? "default" : "outline"}
                    size="sm"
                    onClick={toggleTestnet}
                    className="gap-2"
                  >
                    <SwitchCamera className="h-4 w-4" />
                    {isTestnet ? "Switch to Mainnet" : "Switch to Testnet"}
                  </Button>
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveRpcEndpoint}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Network className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick RPC Selection</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => changeRpcEndpoint("https://api.mainnet-beta.solana.com")}>
              Solana Default RPC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeRpcEndpoint("https://rpc.helius.xyz")}>
              Helius RPC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeRpcEndpoint("https://solana-mainnet.g.alchemy.com")}>
              Alchemy RPC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeRpcEndpoint("https://solana.api.nodereal.io")}>
              NodeReal RPC
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <WalletConnect />
      </div>
    </header>
  );
};

export default Header;
