
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/arbitrageUtils";
import { History, CheckCircle2, XCircle, Clock, Link } from "lucide-react";
import { TradeHistory as TradeHistoryType } from "@/utils/types";
import { useState } from "react";

interface TradingHistoryProps {
  tradeHistory: TradeHistoryType[];
}

const TradingHistory = ({ tradeHistory = [] }: TradingHistoryProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Show 5 trades by default, or all if showAll is true
  const visibleTrades = showAll ? tradeHistory : tradeHistory.slice(0, 5);
  
  // Helper function to format the date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to render status icon
  const renderStatusIcon = (status: TradeHistoryType['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  // Helper function to get the status text
  const getStatusText = (status: TradeHistoryType['status']) => {
    switch (status) {
      case 'completed':
        return "Completed";
      case 'failed':
        return "Failed";
      case 'pending':
        return "Pending";
    }
  };

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <History className="h-5 w-5 mr-2 text-primary" />
          Trade History
        </CardTitle>
        <CardDescription>Recent arbitrage trades and their results</CardDescription>
      </CardHeader>
      <CardContent>
        {tradeHistory.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No trades executed yet
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {visibleTrades.map((trade) => (
                <div 
                  key={trade.id}
                  className="p-3 border border-muted rounded-md hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        {renderStatusIcon(trade.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(trade.status)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(trade.executionTime)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        {trade.route.path.map((token, index) => (
                          <div key={index} className="flex items-center">
                            {index > 0 && (
                              <span className="mx-1 text-muted-foreground">→</span>
                            )}
                            <span>{token.symbol}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        trade.status === 'pending' 
                          ? 'text-muted-foreground' 
                          : (trade.actualProfit && trade.actualProfit >= 0 ? 'text-success' : 'text-destructive')
                      }`}>
                        {trade.status === 'pending' 
                          ? 'Processing...' 
                          : formatCurrency(trade.actualProfit || trade.route.netProfit)
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {`${formatCurrency(trade.route.entryAmount)} input`}
                      </div>
                    </div>
                  </div>
                  {trade.txHash && (
                    <div className="mt-2 flex items-center justify-end text-xs text-muted-foreground">
                      <Link className="h-3 w-3 mr-1" />
                      <a 
                        href={`https://explorer.solana.com/tx/${trade.txHash}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline"
                      >
                        {`${trade.txHash.slice(0, 8)}...${trade.txHash.slice(-8)}`}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {tradeHistory.length > 5 && (
              <button
                className="w-full mt-3 text-xs text-primary hover:underline text-center py-2"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : `Show All (${tradeHistory.length})`}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingHistory;
