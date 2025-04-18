
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Triangle, CornerUpRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ArbitrageRoute } from "@/utils/types";
import { formatCurrency } from "@/utils/arbitrageUtils";

interface ArbitrageChartProps {
  opportunities: ArbitrageRoute[];
}

const ArbitrageChart = ({ opportunities }: ArbitrageChartProps) => {
  // Process data for the charts
  const chartData = useMemo(() => {
    // No data
    if (!opportunities.length) return [];
    
    // Count by type
    const triangular = opportunities.filter(o => o.isTriangular).length;
    const regular = opportunities.filter(o => !o.isTriangular).length;
    
    return [
      { name: "Triangular", value: triangular, color: "#9b87f5" },
      { name: "Regular", value: regular, color: "#38bdf8" },
    ];
  }, [opportunities]);

  // Process data for the exchanges chart
  const exchangeData = useMemo(() => {
    // No data
    if (!opportunities.length) return [];
    
    // Count by exchange
    const exchangeCount: Record<string, number> = {};
    
    opportunities.forEach(opp => {
      opp.exchanges.forEach(exchange => {
        exchangeCount[exchange] = (exchangeCount[exchange] || 0) + 1;
      });
    });
    
    // Convert to array and sort
    return Object.entries(exchangeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [opportunities]);

  // Calculate total potential profit
  const totalProfit = useMemo(() => {
    return opportunities.reduce((total, opp) => total + opp.netProfit, 0);
  }, [opportunities]);

  // Exchange colors
  const exchangeColors = ["#38bdf8", "#818cf8", "#a78bfa", "#e879f9", "#f472b6"];

  // Custom tooltip for PieChart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-xs text-muted-foreground">{`${Math.round(payload[0].percent * 100)}%`}</p>
        </div>
      );
    }
    
    return null;
  };

  if (!opportunities.length) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Arbitrage Analytics
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No arbitrage opportunities to analyze</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Arbitrage Analytics
        </CardTitle>
        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span>Current opportunity breakdown</span>
          <div className="bg-success/20 text-success px-2 py-0.5 rounded-sm text-xs">
            Total Potential Profit: {formatCurrency(totalProfit)}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Opportunity types chart */}
          <div className="h-64">
            <h3 className="text-sm font-medium mb-2">Opportunity Types</h3>
            <div className="flex items-center h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value, entry, index) => (
                      <span className="text-xs flex items-center">
                        {index === 0 ? (
                          <Triangle className="h-3 w-3 mr-1 text-purple-400" />
                        ) : (
                          <CornerUpRight className="h-3 w-3 mr-1 text-blue-400" />
                        )}
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exchanges chart */}
          <div className="h-64">
            <h3 className="text-sm font-medium mb-2">Exchanges</h3>
            <div className="flex items-center h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exchangeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {exchangeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={exchangeColors[index % exchangeColors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageChart;
