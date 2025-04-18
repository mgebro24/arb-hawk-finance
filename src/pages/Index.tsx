
import { useState } from "react";
import Header from "@/components/Header";
import ArbitrageTable from "@/components/ArbitrageTable";
import RiskControls from "@/components/RiskControls";
import TradingHistory from "@/components/TradingHistory";
import ArbitrageChart from "@/components/ArbitrageChart";
import { useArbitrageData } from "@/hooks/useArbitrageData";
import { useWallet } from "@/hooks/useWallet";

const Index = () => {
  const [isTestnet, setIsTestnet] = useState(true);
  
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
    executeTrade
  } = useArbitrageData(isTestnet);
  
  const { walletInfo } = useWallet();
  
  // Toggle between testnet and mainnet
  const toggleTestnet = () => {
    setIsTestnet(prev => !prev);
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
            <ArbitrageTable 
              opportunities={opportunities}
              isLoading={isLoading}
              isAutoTrading={isAutoTrading}
              executeTrade={executeTrade}
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
