
import { useState } from "react";
import Header from "@/components/Header";
import ArbitrageTable from "@/components/ArbitrageTable";
import RiskControls from "@/components/RiskControls";
import TradingHistory from "@/components/TradingHistory";
import ArbitrageChart from "@/components/ArbitrageChart";
import TotalProfit from "@/components/TotalProfit";
import ProblemSearch from "@/components/ProblemSearch";
import { useArbitrageData } from "@/hooks/useArbitrageData";
import { useWallet } from "@/hooks/useWallet";
import { useTradeHistory } from "@/hooks/useTradeHistory";

const Index = () => {
  const [isTestnet, setIsTestnet] = useState(true);
  
  const { 
    opportunities, 
    allOpportunities,
    isLoading, 
    lastUpdate, 
    error,
    riskSettings, 
    isAutoTrading,
    rpcEndpoint,
    totalProfit,
    updateRiskSettings, 
    toggleAutoTrading, 
    refreshData,
    changeRpcEndpoint,
    executeTrade
  } = useArbitrageData(isTestnet);
  
  const { walletInfo } = useWallet();
  const { tradeHistory, addTradeToHistory, updateTradeStatus } = useTradeHistory();
  
  // Toggle between testnet and mainnet
  const toggleTestnet = () => {
    setIsTestnet(prev => !prev);
  };

  // Execute trade with history tracking
  const handleExecuteTrade = async (opportunity) => {
    // Add to history first as pending
    const newTrade = addTradeToHistory(opportunity, 'pending');
    
    // Execute the trade
    const success = await executeTrade(opportunity);
    
    // Update trade history with result
    updateTradeStatus(
      newTrade.id, 
      success ? 'completed' : 'failed',
      success ? `tx${Math.random().toString(36).substring(2, 10)}` : undefined,
      success ? opportunity.netProfit : -opportunity.gasFee
    );
    
    return success;
  };

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
            {/* Total Profit Component on top of main content */}
            <TotalProfit 
              totalProfit={totalProfit}
              isTestnet={isTestnet}
            />
            
            <ArbitrageTable 
              opportunities={opportunities}
              isLoading={isLoading}
              isAutoTrading={isAutoTrading}
              executeTrade={handleExecuteTrade}
              walletConnected={walletInfo.connected}
            />
            
            <ArbitrageChart 
              opportunities={allOpportunities}
            />
            
            <TradingHistory 
              tradeHistory={tradeHistory}
            />
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
            
            <ProblemSearch 
              isTestnet={isTestnet}
              rpcEndpoint={rpcEndpoint}
              isAutoTrading={isAutoTrading}
              lastUpdate={lastUpdate}
              walletConnected={walletInfo.connected}
              error={error}
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
