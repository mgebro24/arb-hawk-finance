
import { useState, useEffect, useCallback } from 'react';
import { ArbitrageRoute, RiskSettings } from '@/utils/types';
import { generateMockArbitrageOpportunities, filterByMinProfit } from '@/utils/arbitrageUtils';
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

export const useArbitrageData = (isTestnet: boolean = true) => {
  const [opportunities, setOpportunities] = useState<ArbitrageRoute[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<ArbitrageRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(defaultRiskSettings);
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [rpcEndpoint, setRpcEndpoint] = useState('https://api.mainnet-beta.solana.com');
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [diagnosticIssues, setDiagnosticIssues] = useState<DiagnosticIssue[]>([]);
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);

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

  // Fetch arbitrage opportunities
  const fetchArbitrageOpportunities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would make actual API calls to DEXes
      // For now, we'll use mock data
      const data = generateMockArbitrageOpportunities(20);
      
      setOpportunities(data);
      setLastUpdate(Date.now());
      
      return data;
    } catch (err) {
      console.error('Error fetching arbitrage opportunities:', err);
      setError('Failed to fetch arbitrage data. Retrying...');
      
      // In a real implementation, we would implement retry logic here
      // with exponential backoff
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters based on risk settings
  useEffect(() => {
    const filtered = filterByMinProfit(opportunities, riskSettings.minProfitThreshold);
    setFilteredOpportunities(filtered);
  }, [opportunities, riskSettings.minProfitThreshold]);

  // Fetch data at regular intervals and when manual refresh is triggered
  useEffect(() => {
    // Initial fetch
    fetchArbitrageOpportunities();
    
    // Set up interval (every 2 seconds as requested)
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
