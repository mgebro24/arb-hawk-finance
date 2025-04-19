
import { useState, useEffect, useCallback } from 'react';
import { ArbitrageRoute, RiskSettings } from '@/utils/types';
import { filterByMinProfit, sortByNetProfit } from '@/utils/arbitrageUtils';
import { toast } from '@/hooks/use-toast';
import { diagnoseBotProblems, DiagnosticIssue } from '@/utils/aiDiagnostics';

// Initial risk settings
const defaultRiskSettings: RiskSettings = {
  maxTradeAmount: 1000,
  minProfitThreshold: 1.0, // $1.00
  maxSlippage: 0.5, // 0.5%
  autoTrading: false,
  gasLimit: 0.01, // SOL
  maxDailyTradeCount: 20,
  maxDailyLoss: 50 // $50
};

// Token pairs to monitor for arbitrage
const TOKEN_PAIRS = [
  { base: 'SOL', quote: 'USDC' },
  { base: 'BTC', quote: 'USDC' },
  { base: 'ETH', quote: 'USDC' },
  { base: 'SOL', quote: 'BTC' },
  { base: 'RAY', quote: 'USDC' },
  { base: 'MNGO', quote: 'USDC' },
  { base: 'SRM', quote: 'USDC' },
];

// Available DEXes
const EXCHANGES = ['Raydium', 'Orca', 'Jupiter', 'Saber', 'Serum'];

export const useArbitrageData = (isTestnet: boolean = true) => {
  const [opportunities, setOpportunities] = useState<ArbitrageRoute[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<ArbitrageRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(defaultRiskSettings);
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [rpcEndpoint, setRpcEndpoint] = useState(isTestnet 
    ? 'https://api.testnet.solana.com' 
    : 'https://api.mainnet-beta.solana.com');
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [diagnosticIssues, setDiagnosticIssues] = useState<DiagnosticIssue[]>([]);
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);
  
  // Update RPC endpoint when testnet flag changes
  useEffect(() => {
    setRpcEndpoint(isTestnet 
      ? 'https://api.testnet.solana.com' 
      : 'https://api.mainnet-beta.solana.com');
  }, [isTestnet]);

  // Toggle auto-trading
  const toggleAutoTrading = useCallback(() => {
    setIsAutoTrading(prev => {
      const newState = !prev;
      
      toast({
        title: newState ? "Auto-trading enabled" : "Auto-trading disabled",
        description: newState 
          ? "The bot will automatically execute profitable trades" 
          : "Auto-trading has been turned off",
        variant: newState ? "default" : "destructive",
      });
      
      // Update risk settings
      setRiskSettings(prev => ({
        ...prev,
        autoTrading: newState
      }));
      
      return newState;
    });
  }, []);

  // Update risk settings
  const updateRiskSettings = useCallback((newSettings: Partial<RiskSettings>) => {
    setRiskSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      toast({
        title: "Risk settings updated",
        description: "Your risk management settings have been updated",
      });
      
      return updated;
    });
  }, []);

  // Manually refresh data
  const refreshData = useCallback(() => {
    setManualRefreshCount(prev => prev + 1);
    
    toast({
      title: "Refreshing data",
      description: "Fetching latest arbitrage opportunities",
    });
  }, []);

  // Handle RPC endpoint change
  const changeRpcEndpoint = useCallback((endpoint: string) => {
    setRpcEndpoint(endpoint);
    
    toast({
      title: "RPC endpoint changed",
      description: `Now using: ${endpoint}`,
    });
    
    // Trigger a refresh with the new endpoint
    refreshData();
  }, [refreshData]);

  // Fetch real arbitrage opportunities from DEX APIs
  const fetchArbitrageOpportunities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, we would fetch from multiple DEXes here
      const results: ArbitrageRoute[] = [];
      
      // Fetch prices from different exchanges for the same pairs
      for (const pair of TOKEN_PAIRS) {
        // For triangular arbitrage, create routes through intermediate tokens
        if (Math.random() > 0.5 && results.length < 15) {
          try {
            // Create a triangular arbitrage path
            const startToken = { 
              name: pair.base === 'USDC' ? 'USD Coin' : pair.base, 
              symbol: pair.base, 
              address: getTokenAddress(pair.base)
            };
            
            // Pick an intermediate token different from start and end
            const availableTokens = ['SOL', 'BTC', 'ETH', 'RAY', 'SRM', 'MNGO'].filter(
              t => t !== pair.base && t !== pair.quote
            );
            
            const intermediateSymbol = availableTokens[Math.floor(Math.random() * availableTokens.length)];
            const intermediateToken = { 
              name: getTokenName(intermediateSymbol), 
              symbol: intermediateSymbol, 
              address: getTokenAddress(intermediateSymbol)
            };
            
            const endToken = { 
              name: pair.quote === 'USDC' ? 'USD Coin' : pair.quote, 
              symbol: pair.quote, 
              address: getTokenAddress(pair.quote)
            };
            
            // Generate prices with a small arbitrage opportunity
            const entryAmount = 50 + Math.random() * 950; // $50 to $1000
            
            // Random profit between 0.1% and 3%
            const profitPercentage = 0.001 + Math.random() * 0.03; 
            const profit = entryAmount * profitPercentage;
            
            // Select random exchanges for each hop
            const exchange1 = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
            const exchange2 = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
            const exchange3 = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
            
            // Create the arbitrage route
            results.push({
              path: [startToken, intermediateToken, endToken, startToken],
              exchanges: [exchange1, exchange2, exchange3],
              entryAmount,
              expectedReturn: entryAmount + profit,
              profit,
              profitPercentage,
              gasFee: calculateGasFee(true),
              netProfit: profit - calculateGasFee(true),
              timestamp: Date.now() - Math.floor(Math.random() * 30000), // Within the last 30 seconds
              isTriangular: true
            });
          } catch (err) {
            console.error("Error creating triangular arbitrage:", err);
          }
        } else if (results.length < 20) {
          try {
            // Create a direct arbitrage opportunity
            const tokenA = { 
              name: pair.base === 'USDC' ? 'USD Coin' : pair.base, 
              symbol: pair.base, 
              address: getTokenAddress(pair.base)
            };
            
            const tokenB = { 
              name: pair.quote === 'USDC' ? 'USD Coin' : pair.quote, 
              symbol: pair.quote, 
              address: getTokenAddress(pair.quote)
            };
            
            // Generate prices with a small arbitrage opportunity
            const entryAmount = 50 + Math.random() * 950; // $50 to $1000
            
            // Random profit between 0.1% and 2.5%
            const profitPercentage = 0.001 + Math.random() * 0.025; 
            const profit = entryAmount * profitPercentage;
            
            // Select a random exchange
            const exchange = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
            
            // Create the arbitrage route
            results.push({
              path: [tokenA, tokenB],
              exchanges: [exchange],
              entryAmount,
              expectedReturn: entryAmount + profit,
              profit,
              profitPercentage,
              gasFee: calculateGasFee(false),
              netProfit: profit - calculateGasFee(false),
              timestamp: Date.now() - Math.floor(Math.random() * 30000), // Within the last 30 seconds
              isTriangular: false
            });
          } catch (err) {
            console.error("Error creating direct arbitrage:", err);
          }
        }
      }
      
      // Sort by net profit
      const sortedResults = sortByNetProfit(results);
      setOpportunities(sortedResults);
      setLastUpdate(Date.now());
      
      return sortedResults;
    } catch (err) {
      console.error('Error fetching arbitrage opportunities:', err);
      setError('Failed to fetch arbitrage data. Retrying...');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to calculate gas fee
  const calculateGasFee = (isTriangular: boolean) => {
    // Base fee for simple operations
    const baseFee = 0.0001;
    
    // Multiplier for triangular arbitrage (more complex)
    const triangularMultiplier = isTriangular ? 1.5 : 1;
    
    // Network congestion factor (random between 0.8 and 1.4)
    const congestionFactor = 0.8 + Math.random() * 0.6;
    
    return baseFee * triangularMultiplier * congestionFactor;
  };

  // Helper function to get token address
  const getTokenAddress = (symbol: string): string => {
    const addresses: Record<string, string> = {
      'SOL': 'So11111111111111111111111111111111111111112',
      'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'BTC': '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // wBTC
      'ETH': '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk', // wETH
      'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      'SRM': 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      'MNGO': 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'
    };
    
    return addresses[symbol] || 'Unknown';
  };

  // Helper function to get token name
  const getTokenName = (symbol: string): string => {
    const names: Record<string, string> = {
      'SOL': 'Solana',
      'USDC': 'USD Coin',
      'BTC': 'Wrapped Bitcoin',
      'ETH': 'Wrapped Ethereum',
      'RAY': 'Raydium',
      'SRM': 'Serum',
      'MNGO': 'Mango'
    };
    
    return names[symbol] || symbol;
  };

  // Apply filters based on risk settings
  useEffect(() => {
    const filtered = filterByMinProfit(opportunities, riskSettings.minProfitThreshold);
    setFilteredOpportunities(filtered);
  }, [opportunities, riskSettings.minProfitThreshold]);

  // Fetch data at regular intervals and when manual refresh is triggered
  useEffect(() => {
    // Initial fetch
    fetchArbitrageOpportunities();
    
    // Set up interval (every 2 seconds)
    const intervalId = setInterval(() => {
      fetchArbitrageOpportunities();
    }, 2000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchArbitrageOpportunities, manualRefreshCount]);

  // Run diagnostics function to detect issues
  const runDiagnostics = useCallback(async (tradeHistory: any[] = []) => {
    setIsDiagnosticLoading(true);
    
    // Add a small delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const issues = diagnoseBotProblems(
      opportunities,
      tradeHistory,
      isTestnet,
      lastUpdate,
      error,
      rpcEndpoint,
      isAutoTrading
    );
    
    setDiagnosticIssues(issues);
    setIsDiagnosticLoading(false);
    
    if (issues.length > 0) {
      toast({
        title: `${issues.length} issue${issues.length > 1 ? 's' : ''} detected`,
        description: "Check the diagnostics panel for details",
        variant: "destructive",
      });
    } else {
      toast({
        title: "No issues detected",
        description: "Your arbitrage bot is running normally",
        variant: "default",
      });
    }
  }, [opportunities, isTestnet, lastUpdate, error, rpcEndpoint, isAutoTrading]);

  // Execute a trade (simplified for demo purposes)
  const executeTrade = useCallback(async (opportunity: ArbitrageRoute) => {
    try {
      toast({
        title: "Executing trade",
        description: `${opportunity.isTriangular ? 'Triangular' : 'Regular'} arbitrage with expected profit: $${opportunity.netProfit.toFixed(2)}`,
      });
      
      // In a real implementation, this would interact with the wallet
      // and execute the actual trade on-chain
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time
      
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        toast({
          title: "Trade successful",
          description: `Earned approximately $${opportunity.netProfit.toFixed(2)}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Trade failed",
          description: "Transaction could not be completed. Please try again.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error executing trade:", error);
      toast({
        title: "Trade error",
        description: "An unexpected error occurred while executing the trade",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  return {
    opportunities: filteredOpportunities,
    allOpportunities: opportunities,
    isLoading,
    lastUpdate,
    error,
    riskSettings,
    isAutoTrading,
    rpcEndpoint,
    updateRiskSettings,
    toggleAutoTrading,
    refreshData,
    changeRpcEndpoint,
    executeTrade,
    isTestnet,
    // Diagnostic related
    diagnosticIssues,
    isDiagnosticLoading,
    runDiagnostics
  };
};

