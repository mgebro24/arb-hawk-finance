
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/arbitrageUtils";
import { History, CheckCircle2, XCircle, Clock, Link, TrendingUp } from "lucide-react";
import { useTradeHistory } from "@/hooks/useTradeHistory";
import { useEffect } from "react";
import { Exchange } from "@/utils/types";

const TradingHistory = () => {
  const { tradeHistory, totalProfit, addTradeToHistory } = useTradeHistory();

  // Add some sample trades for demonstration when component mounts
  useEffect(() => {
    // Only add sample trades if none exist
    if (tradeHistory.length === 0) {
      // Add sample completed trade
      const completedTrade = {
        path: [
          { name: 'Solana', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
          { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }
        ],
        exchanges: ['Jupiter' as Exchange],
        entryAmount: 500,
        expectedReturn: 512.5,
        profit: 12.5,
        profitPercentage: 0.025,
        gasFee: 0.2,
        netProfit: 12.3,
        timestamp: Date.now() - 600000, // 10 minutes ago
        isTriangular: false
      };
      
      addTradeToHistory(
        completedTrade, 
        'completed', 
        '5KKsRYYGgq6mT6tLmGJ9vTpFNMbRxQZqJmwy6biMqoTQ29Nso4Jb3LbaPU6XCJXKxJXtyxZcUkaGFmnmM2Uamb9M',
        12.3
      );
      
      // Add sample failed trade
      const failedTrade = {
        path: [
          { name: 'Wrapped Bitcoin', symbol: 'BTC', address: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E' },
          { name: 'Raydium', symbol: 'RAY', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
          { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
          { name: 'Wrapped Bitcoin', symbol: 'BTC', address: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E' }
        ],
        exchanges: ['Raydium' as Exchange, 'Orca' as Exchange, 'Jupiter' as Exchange],
        entryAmount: 750,
        expectedReturn: 763.5,
        profit: 13.5,
        profitPercentage: 0.018,
        gasFee: 0.35,
        netProfit: 13.15,
        timestamp: Date.now() - 300000, // 5 minutes ago
        isTriangular: true
      };
      
      addTradeToHistory(
        failedTrade, 
        'failed', 
        '3pMfhJKXLYbaMVXTkNntyYuBLnHQFd8UEgvM1toqhzWpQJuRnmpabZTcayDneBgfGcWZaEfbGDtNmAqXqvJeNTzw'
      );
      
      // Add sample pending trade
      const pendingTrade = {
        path: [
          { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
          { name: 'Serum', symbol: 'SRM', address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt' }
        ],
        exchanges: ['Serum' as Exchange],
        entryAmount: 300,
        expectedReturn: 304.5,
        profit: 4.5,
        profitPercentage: 0.015,
        gasFee: 0.15,
        netProfit: 4.35,
        timestamp: Date.now() - 60000, // 1 minute ago
        isTriangular: false
      };
      
      addTradeToHistory(
        pendingTrade, 
        'pending'
      );
    }
  }, [tradeHistory.length, addTradeToHistory]);

  // Helper function to format the date
  const formatDate = (date: number) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to render status icon
  const renderStatusIcon = (status: 'completed' | 'failed' | 'pending') => {
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
  const getStatusText = (status: 'completed' | 'failed' | 'pending') => {
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-lg">
              <History className="h-5 w-5 mr-2 text-primary" />
              Trade History
            </CardTitle>
            <CardDescription>Recent arbitrage trades and their results</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Profit:</span>
            </div>
            <div className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(totalProfit)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tradeHistory.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No trades executed yet
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {tradeHistory.map((trade) => (
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
                        : formatCurrency(trade.actualProfit || 0)
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
        )}
      </CardContent>
    </Card>
  );
};

export default TradingHistory;
