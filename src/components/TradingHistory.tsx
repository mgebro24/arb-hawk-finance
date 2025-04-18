
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/arbitrageUtils";
import { History, CheckCircle2, XCircle, Clock, Link } from "lucide-react";

interface Trade {
  id: string;
  date: Date;
  tokens: string[];
  amount: number;
  profit: number;
  status: 'completed' | 'failed' | 'pending';
  txHash?: string;
}

// Mock data for the trading history
const mockTrades: Trade[] = [
  {
    id: "t1",
    date: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    tokens: ["SOL", "USDC"],
    amount: 100,
    profit: 0.73,
    status: 'completed',
    txHash: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
  },
  {
    id: "t2",
    date: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
    tokens: ["RAY", "SOL", "USDC", "RAY"],
    amount: 200,
    profit: 1.21,
    status: 'completed',
    txHash: "6zDjXyCfMr4Gxvnf7LFffzkMH6MXQNmzCGP3bRFXx2Eq"
  },
  {
    id: "t3",
    date: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    tokens: ["USDC", "wBTC"],
    amount: 150,
    profit: -0.18, // Failed trade with loss
    status: 'failed',
    txHash: "2K3aPaAuoiB5h8tPAPFCKJRfug1DKUECbAXgzuGzsFBh"
  },
  {
    id: "t4",
    date: new Date(), // Just now
    tokens: ["SOL", "USDC", "RAY"],
    amount: 75,
    profit: 0,
    status: 'pending'
  }
];

const TradingHistory = () => {
  // Helper function to format the date
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to render status icon
  const renderStatusIcon = (status: Trade['status']) => {
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
  const getStatusText = (status: Trade['status']) => {
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
        {mockTrades.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No trades executed yet
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {mockTrades.map((trade) => (
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
                        {formatDate(trade.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      {trade.tokens.map((token, index) => (
                        <div key={index} className="flex items-center">
                          {index > 0 && (
                            <span className="mx-1 text-muted-foreground">→</span>
                          )}
                          <span>{token}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      trade.status === 'pending' 
                        ? 'text-muted-foreground' 
                        : (trade.profit >= 0 ? 'text-success' : 'text-destructive')
                    }`}>
                      {trade.status === 'pending' 
                        ? 'Processing...' 
                        : formatCurrency(trade.profit)
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {`${formatCurrency(trade.amount)} input`}
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
