
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ArbitrageTable from "@/components/ArbitrageTable";
import RiskControls from "@/components/RiskControls";
import TradingHistory from "@/components/TradingHistory";
import ArbitrageChart from "@/components/ArbitrageChart";
import BotDiagnostics from "@/components/BotDiagnostics";
import { useArbitrageData } from "@/hooks/useArbitrageData";
import { useWallet } from "@/hooks/useWallet";
import { useTradeHistory } from "@/hooks/useTradeHistory";

const Index = () => {
  const [isTestnet, setIsTestnet] = useState(true);
  
  const { 
    tradeHistory, 
    totalProfit, 
    addTradeToHistory, 
    updateTradeStatus 
  } = useTradeHistory();
  
  const { 
    opportunities, 
    allOpportunities,
    isLoading, 
    lastUpdate, 
    riskSettings, 
    isAutoTrading,
    rpcEndpoint,
    updateRiskSettings, 
    toggleAutoTrading, 
    refreshData,
    changeRpcEndpoint,
    diagnosticIssues,
    isDiagnosticLoading,
    runDiagnostics
  } = useArbitrageData(isTestnet);
  
  const { walletInfo } = useWallet();
  
  // Toggle between testnet and mainnet
  const toggleTestnet = () => {
    setIsTestnet(prev => !prev);
  };

  // Execute trade and update trade history
  const executeTradeWithHistory = async (opportunity) => {
    // Add pending trade to history
    const tradeRecord = addTradeToHistory(opportunity, 'pending');
    
    try {
      // Simulate trade execution (in real app, this would interact with blockchain)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 80% chance of success for demo purposes
      const success = Math.random() > 0.2;
      
      if (success) {
        // Generate fake transaction hash for successful trades
        const txHash = generateRandomTxHash();
        // Calculate actual profit (slight variance from expected)
        const actualProfit = opportunity.netProfit * (0.9 + Math.random() * 0.2);
        
        // Update trade status in history
        updateTradeStatus(tradeRecord.id, 'completed', txHash, actualProfit);
        
        return true;
      } else {
        // Update trade status to failed
        updateTradeStatus(tradeRecord.id, 'failed');
        return false;
      }
    } catch (error) {
      console.error("Trade execution error:", error);
      // Update trade status to failed
      updateTradeStatus(tradeRecord.id, 'failed');
      return false;
    }
  };
  
  // Generate random transaction hash for demo
  const generateRandomTxHash = () => {
    return Array.from({ length: 88 }, () => 
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[
        Math.floor(Math.random() * 62)
      ]
    ).join('');
  };

  // Auto-execute trades if auto-trading is enabled and wallet is connected
  useEffect(() => {
    if (!isAutoTrading || !walletInfo.connected) return;
    
    // Find the most profitable opportunity above threshold
    const bestOpportunity = opportunities[0];
    
    // Execute the trade if it exists and meets minimum threshold
    if (bestOpportunity && bestOpportunity.netProfit >= riskSettings.minProfitThreshold) {
      const lastTradeTime = tradeHistory[0]?.executionTime || 0;
      const timeSinceLastTrade = Date.now() - lastTradeTime;
      
      // Don't trade too frequently (at least 5 seconds between trades for demo)
      if (timeSinceLastTrade > 5000) {
        executeTradeWithHistory(bestOpportunity);
      }
    }
  }, [opportunities, isAutoTrading, walletInfo.connected, riskSettings.minProfitThreshold, tradeHistory]);

  // Run diagnostics when component mounts and when relevant state changes
  useEffect(() => {
    // Create a shallow copy of tradeHistory to prevent reference issues
    const tradeHistoryCopy = [...tradeHistory];
    runDiagnostics(tradeHistoryCopy);
  }, [runDiagnostics, tradeHistory, isTestnet, isAutoTrading, rpcEndpoint]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        refreshData={refreshData}
        isLoading={isLoading}
        lastUpdate={lastUpdate}
        isTestnet={isTestnet}
        toggleTestnet={toggleTestnet}
        changeRpcEndpoint={changeRpcEndpoint}
        rpcEndpoint={rpcEndpoint}
      />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on desktop */}
          <div className="md:col-span-2 space-y-6">
            <ArbitrageTable 
              opportunities={opportunities}
              isLoading={isLoading}
              isAutoTrading={isAutoTrading}
              executeTrade={executeTradeWithHistory}
              walletConnected={walletInfo.connected}
            />
            
            <ArbitrageChart 
              opportunities={allOpportunities}
            />
            
            <TradingHistory />
          </div>
          
          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            <RiskControls 
              riskSettings={riskSettings}
              updateRiskSettings={updateRiskSettings}
              isAutoTrading={isAutoTrading}
              toggleAutoTrading={toggleAutoTrading}
              isTestnet={isTestnet}
            />
            
            <BotDiagnostics 
              issues={diagnosticIssues}
              onRefresh={() => runDiagnostics(tradeHistory)}
              isLoading={isDiagnosticLoading}
            />
          </div>
        </div>
      </main>
      
      <footer className="border-t border-muted py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ArbHawk Finance
          </p>
          <p className="text-sm text-muted-foreground">
            {isTestnet ? "Testnet Mode" : "Mainnet Mode"} • {opportunities.length} opportunities found
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
