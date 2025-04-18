
import { ArbitrageRoute, Exchange, Token } from './types';

// Format a number as currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Calculate gas fee estimate based on network congestion and operation complexity
export const estimateGasFee = (
  isTriangular: boolean,
  tokenCount: number,
  networkCongestion: number = 1
): number => {
  // Base fee for simple operations
  const baseFee = 0.0001;
  
  // Multiplier for triangular arbitrage (more complex)
  const triangularMultiplier = isTriangular ? 1.5 : 1;
  
  // Additional cost per token in the path
  const tokenFee = tokenCount * 0.00005;
  
  // Network congestion factor (1.0 = normal, higher means more congested)
  const congestionFactor = networkCongestion;
  
  return (baseFee + tokenFee) * triangularMultiplier * congestionFactor;
};

// Filter opportunities by minimum profit
export const filterByMinProfit = (
  opportunities: ArbitrageRoute[],
  minProfitThreshold: number
): ArbitrageRoute[] => {
  return opportunities.filter(opp => opp.netProfit >= minProfitThreshold);
};

// Sort opportunities by net profit
export const sortByNetProfit = (
  opportunities: ArbitrageRoute[]
): ArbitrageRoute[] => {
  return [...opportunities].sort((a, b) => b.netProfit - a.netProfit);
};

// Mock function to generate sample arbitrage opportunities
// In a real implementation, this would be replaced with actual DEX API calls
export const generateMockArbitrageOpportunities = (count: number = 10): ArbitrageRoute[] => {
  const tokens: Token[] = [
    { name: 'Solana', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
    { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    { name: 'Wrapped BTC', symbol: 'wBTC', address: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E' },
    { name: 'Raydium', symbol: 'RAY', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
    { name: 'Serum', symbol: 'SRM', address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt' },
    { name: 'Mango', symbol: 'MNGO', address: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac' },
  ];
  
  const exchanges: Exchange[] = ['Raydium', 'Orca', 'Jupiter', 'Saber', 'Serum'];
  
  const opportunities: ArbitrageRoute[] = [];
  
  // Current timestamp in ms
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const isTriangular = Math.random() > 0.5;
    
    // For triangular arbitrage, use 3 tokens, otherwise use 2
    const tokenPath: Token[] = [];
    if (isTriangular) {
      // Start and end with the same token for triangular
      const startToken = tokens[Math.floor(Math.random() * tokens.length)];
      tokenPath.push(startToken);
      
      // Add two more tokens, ensuring no duplicates
      while (tokenPath.length < 3) {
        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        if (!tokenPath.some(t => t.symbol === randomToken.symbol)) {
          tokenPath.push(randomToken);
        }
      }
      
      // Complete the triangle
      tokenPath.push(tokenPath[0]);
    } else {
      // Simple A → B arbitrage
      while (tokenPath.length < 2) {
        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        if (!tokenPath.some(t => t.symbol === randomToken.symbol)) {
          tokenPath.push(randomToken);
        }
      }
    }
    
    // Generate random exchanges for each hop
    const exchangePath: Exchange[] = [];
    for (let j = 0; j < tokenPath.length - 1; j++) {
      exchangePath.push(exchanges[Math.floor(Math.random() * exchanges.length)]);
    }
    
    // Generate random values for the opportunity
    const entryAmount = 50 + Math.random() * 950; // $50 to $1000
    const profitPercentage = 0.001 + Math.random() * 0.03; // 0.1% to 3%
    const profit = entryAmount * profitPercentage;
    const gasFee = estimateGasFee(isTriangular, tokenPath.length);
    const netProfit = profit - gasFee;
    
    // Create the opportunity
    opportunities.push({
      path: tokenPath,
      exchanges: exchangePath,
      entryAmount,
      expectedReturn: entryAmount + profit,
      profit,
      profitPercentage,
      gasFee,
      netProfit,
      timestamp: now - Math.floor(Math.random() * 60000), // Random time in the last minute
      isTriangular
    });
  }
  
  // Sort by net profit descending
  return sortByNetProfit(opportunities);
};
