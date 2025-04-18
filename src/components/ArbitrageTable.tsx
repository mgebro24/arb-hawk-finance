
import { useMemo } from "react";
import { ArbitrageRoute } from "@/utils/types";
import { formatCurrency, formatPercentage } from "@/utils/arbitrageUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRightCircle, 
  CircleDollarSign, 
  Flame,
  TrendingUp, 
  BarChart3, 
  CornerUpRight,
  Triangle
} from "lucide-react";

interface ArbitrageTableProps {
  opportunities: ArbitrageRoute[];
  isLoading: boolean;
  isAutoTrading: boolean;
  executeTrade: (opportunity: ArbitrageRoute) => Promise<boolean>;
  walletConnected: boolean;
}

const ArbitrageTable = ({
  opportunities,
  isLoading,
  isAutoTrading,
  executeTrade,
  walletConnected
}: ArbitrageTableProps) => {
  // Memoize the top opportunity to prevent unnecessary re-renders
  const topOpportunity = useMemo(() => {
    return opportunities.length > 0 ? opportunities[0] : null;
  }, [opportunities]);

  // Format a timestamp to a relative time string (e.g. "2 seconds ago")
  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    
    return "over an hour ago";
  };

  // Render the path of tokens in an arbitrage route
  const renderPath = (route: ArbitrageRoute) => {
    return (
      <div className="flex items-center text-sm">
        {route.path.map((token, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <div className="flex flex-col items-center mx-1">
                <ArrowRightCircle className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{route.exchanges[index-1]}</span>
              </div>
            )}
            <span className="font-medium">{token.symbol}</span>
          </div>
        ))}
      </div>
    );
  };

  // Show a loading state if there's no data
  if (isLoading && opportunities.length === 0) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Arbitrage Opportunities
          </CardTitle>
          <CardDescription>Loading latest arbitrage opportunities...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Scanning markets...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show a message if there are no opportunities
  if (opportunities.length === 0) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Arbitrage Opportunities
          </CardTitle>
          <CardDescription>No profitable opportunities found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Try adjusting your risk settings to find more opportunities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Arbitrage Opportunities</CardTitle>
          </div>
          
          {isAutoTrading && (
            <div className="bg-success/20 text-success px-2 py-0.5 rounded-sm text-xs flex items-center">
              <Flame className="h-3 w-3 mr-1" />
              Auto-Trading Active
            </div>
          )}
        </div>
        <CardDescription>
          {opportunities.length} opportunities found, sorted by profit
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Highlight the top opportunity */}
        {topOpportunity && (
          <div className="mb-6 bg-secondary p-4 rounded-lg border border-muted">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  {topOpportunity.isTriangular ? (
                    <Triangle className="h-4 w-4 text-purple-400" />
                  ) : (
                    <CornerUpRight className="h-4 w-4 text-blue-400" />
                  )}
                  <h3 className="font-medium">
                    {topOpportunity.isTriangular ? "Triangular" : "Regular"} Arbitrage
                  </h3>
                  <div className="bg-success/20 text-success px-1.5 py-0.5 rounded-sm text-xs">
                    Top Opportunity
                  </div>
                </div>
                <div className="mt-1">{renderPath(topOpportunity)}</div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Expected Profit</div>
                <div className="text-lg font-semibold text-success">
                  {formatCurrency(topOpportunity.netProfit)}
                </div>
                <div className="text-xs text-success">
                  {formatPercentage(topOpportunity.profitPercentage)}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-between items-center">
              <div className="grid grid-cols-3 gap-4 text-sm flex-1">
                <div>
                  <div className="text-muted-foreground">Entry</div>
                  <div>{formatCurrency(topOpportunity.entryAmount)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Gas Fee</div>
                  <div>{formatCurrency(topOpportunity.gasFee)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Updated</div>
                  <div>{formatRelativeTime(topOpportunity.timestamp)}</div>
                </div>
              </div>
              
              <Button 
                className="bg-gradient-1 hover:opacity-90"
                disabled={!walletConnected || isAutoTrading}
                onClick={() => executeTrade(topOpportunity)}
              >
                <CircleDollarSign className="mr-2 h-4 w-4" />
                Execute Trade
              </Button>
            </div>
          </div>
        )}

        {/* List of other opportunities */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {opportunities.slice(1).map((opp, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-3 border border-muted rounded-md hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  {opp.isTriangular ? (
                    <Triangle className="h-3 w-3 text-purple-400" />
                  ) : (
                    <CornerUpRight className="h-3 w-3 text-blue-400" />
                  )}
                  <span className="text-sm font-medium">
                    {opp.isTriangular ? "Triangular" : "Regular"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(opp.timestamp)}
                  </span>
                </div>
                {renderPath(opp)}
              </div>
              
              <div className="flex flex-col items-end mr-4">
                <div className="text-success font-medium">
                  {formatCurrency(opp.netProfit)}
                </div>
                <div className="text-xs text-success">
                  {formatPercentage(opp.profitPercentage)}
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="bg-gradient-1 hover:opacity-90"
                disabled={!walletConnected || isAutoTrading}
                onClick={() => executeTrade(opp)}
              >
                Trade
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageTable;
