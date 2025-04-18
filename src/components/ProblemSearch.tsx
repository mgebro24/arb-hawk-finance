
import { useState } from "react";
import { Bug, Search, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// Common bot problems that can be detected
const commonProblems = [
  {
    id: 'simulated-prices',
    title: 'Using simulated prices',
    description: 'Bot is using mock/simulated price data instead of real API data',
    solution: 'Configure a valid RPC endpoint or API keys to fetch real price data'
  },
  {
    id: 'wallet-connection',
    title: 'Wallet connection issues',
    description: 'Bot cannot connect to wallet or maintain connection',
    solution: 'Install Phantom wallet extension, ensure it is unlocked, and has sufficient SOL'
  },
  {
    id: 'transaction-failure',
    title: 'Transaction failures',
    description: 'Transactions are being submitted but failing to complete',
    solution: 'Check for sufficient SOL for gas fees, reduce slippage tolerance, or check for RPC issues'
  },
  {
    id: 'rate-limiting',
    title: 'API rate limiting',
    description: 'Bot may be hitting rate limits on RPC or price API endpoints',
    solution: 'Use multiple fallback RPCs, implement exponential backoff, or upgrade to a paid RPC service'
  },
  {
    id: 'high-latency',
    title: 'High latency',
    description: 'Slow response times from RPC or high network congestion',
    solution: 'Use a faster RPC endpoint, optimize code, or adjust trading parameters to account for latency'
  }
];

interface ProblemSearchProps {
  isTestnet: boolean;
  rpcEndpoint: string;
  isAutoTrading: boolean;
  lastUpdate: number;
  walletConnected: boolean;
  error: string | null;
}

const ProblemSearch = ({ 
  isTestnet, 
  rpcEndpoint, 
  isAutoTrading, 
  lastUpdate, 
  walletConnected,
  error
}: ProblemSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [detectedProblems, setDetectedProblems] = useState<typeof commonProblems>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  // Auto-detect issues based on bot state
  const detectIssues = () => {
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      const foundProblems = [];
      
      // Check for simulated prices
      if (rpcEndpoint === 'https://api.mainnet-beta.solana.com' && !isTestnet) {
        foundProblems.push(commonProblems[0]); // Simulated prices problem
      }
      
      // Check wallet connection
      if (!walletConnected) {
        foundProblems.push(commonProblems[1]); // Wallet connection problem
      }
      
      // Check for rate limiting/API issues
      if (error || Date.now() - lastUpdate > 10000) {
        foundProblems.push(commonProblems[3]); // Rate limiting problem
      }
      
      setDetectedProblems(foundProblems);
      setIsScanning(false);
      
      toast({
        title: foundProblems.length 
          ? `${foundProblems.length} potential issues found` 
          : "No issues detected",
        description: foundProblems.length 
          ? "View the problem scanner for details" 
          : "Bot appears to be functioning normally",
        variant: foundProblems.length ? "destructive" : "default",
      });
    }, 2000);
  };
  
  // Filter problems based on search term
  const filteredProblems = searchTerm 
    ? commonProblems.filter(problem => 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : detectedProblems;
  
  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Bug className="h-5 w-5 mr-2 text-primary" />
          Problem Scanner
        </CardTitle>
        <CardDescription>Find and solve common bot issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for issues..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={detectIssues} 
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? "Scanning..." : "Scan Now"}
          </Button>
        </div>
        
        {filteredProblems.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredProblems.map((problem) => (
              <div 
                key={problem.id}
                className="p-3 border border-destructive/30 rounded-md bg-destructive/5"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{problem.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{problem.description}</p>
                    <div className="mt-2">
                      <span className="text-xs font-medium">Solution: </span>
                      <span className="text-xs">{problem.solution}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No problems matching "{searchTerm}"</p>
          </div>
        ) : detectedProblems.length === 0 && !isScanning ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bug className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Run a scan to detect potential issues</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ProblemSearch;
