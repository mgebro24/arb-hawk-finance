
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/arbitrageUtils";

interface TotalProfitProps {
  totalProfit: number;
  isTestnet: boolean;
}

const TotalProfit = ({ totalProfit, isTestnet }: TotalProfitProps) => {
  const isPositive = totalProfit >= 0;

  return (
    <Card className={`border-muted ${isPositive ? 'bg-success/5' : 'bg-destructive/5'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {isPositive ? (
            <TrendingUp className="h-5 w-5 mr-2 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 mr-2 text-destructive" />
          )}
          Total Profit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(totalProfit)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isTestnet ? "Testnet Mode" : "Mainnet Mode"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalProfit;
