
import { ArbitrageRoute, TradeHistory } from '@/utils/types';

// AI diagnostic categories
export type DiagnosticCategory = 
  | 'price_simulation' 
  | 'transaction_failure' 
  | 'connectivity' 
  | 'performance' 
  | 'configuration'
  | 'security'
  | 'unknown';

// Diagnostic issue structure
export interface DiagnosticIssue {
  id: string;
  category: DiagnosticCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  potentialFix: string;
  timestamp: number;
}

/**
 * Analyzes the bot's state and operations to identify potential issues
 */
export const diagnoseBotProblems = (
  opportunities: ArbitrageRoute[],
  tradeHistory: TradeHistory[],
  isTestnet: boolean,
  lastUpdate: number,
  error: string | null,
  rpcEndpoint: string,
  isAutoTrading: boolean
): DiagnosticIssue[] => {
  const issues: DiagnosticIssue[] = [];
  const now = Date.now();

  // Check for simulated data (demo mode)
  if (opportunities.length > 0 && opportunities.every(o => 
    o.timestamp > now - 120000 && // Data less than 2 minutes old
    Math.abs(o.profitPercentage) < 0.05 // Realistic profit range
  ) === false) {
    issues.push({
      id: crypto.randomUUID(),
      category: 'price_simulation',
      severity: 'medium',
      title: 'Simulated Price Data Detected',
      description: 'The bot appears to be using simulated price data rather than real market information. This can lead to unrealistic profit expectations.',
      potentialFix: 'Connect to actual exchange APIs for real-time market data instead of using simulated values.',
      timestamp: now
    });
  }

  // Check for transaction failures
  const recentTrades = tradeHistory.filter(t => t.executionTime > now - 3600000); // Last hour
  const failedTrades = recentTrades.filter(t => t.status === 'failed');
  if (failedTrades.length > 0 && failedTrades.length / recentTrades.length > 0.3) {
    issues.push({
      id: crypto.randomUUID(),
      category: 'transaction_failure',
      severity: 'high',
      title: 'High Transaction Failure Rate',
      description: `${failedTrades.length} out of ${recentTrades.length} recent trades have failed (${Math.round(failedTrades.length/recentTrades.length*100)}% failure rate).`,
      potentialFix: 'Check wallet connectivity, gas settings, and slippage tolerance. Consider using a more reliable RPC endpoint.',
      timestamp: now
    });
  }

  // Check for stale data
  if (lastUpdate && now - lastUpdate > 60000) {
    issues.push({
      id: crypto.randomUUID(),
      category: 'connectivity',
      severity: 'high',
      title: 'Stale Market Data',
      description: `Market data has not been updated in ${Math.round((now - lastUpdate)/1000)} seconds.`,
      potentialFix: 'Check your internet connection and the RPC endpoint status. Consider switching to a different RPC provider.',
      timestamp: now
    });
  }

  // Check for explicit errors
  if (error) {
    issues.push({
      id: crypto.randomUUID(),
      category: 'connectivity',
      severity: 'high',
      title: 'Connection Error Detected',
      description: `Error message: ${error}`,
      potentialFix: 'Check your internet connection and verify the RPC endpoint is operational. Try switching to a different RPC provider.',
      timestamp: now
    });
  }

  // Check for public RPC usage
  if (rpcEndpoint.includes('api.mainnet-beta.solana.com') && !isTestnet) {
    issues.push({
      id: crypto.randomUUID(),
      category: 'performance',
      severity: 'medium',
      title: 'Using Public RPC Endpoint',
      description: 'You are using a public RPC endpoint which may have rate limits and reliability issues.',
      potentialFix: 'Consider using a dedicated RPC provider like QuickNode, Alchemy, or Helius for better reliability and performance.',
      timestamp: now
    });
  }

  // Check for testnet in production scenario
  if (isTestnet && isAutoTrading) {
    issues.push({
      id: crypto.randomUUID(),
      category: 'configuration',
      severity: 'critical',
      title: 'Auto-Trading Enabled on Testnet',
      description: 'You have auto-trading enabled while in testnet mode. This may lead to confusion about real trading activity.',
      potentialFix: 'Either disable auto-trading or switch to mainnet if you intend to perform real trades.',
      timestamp: now
    });
  }

  // If no specific issues found, but there are no opportunities
  if (issues.length === 0 && opportunities.length === 0) {
    issues.push({
      id: crypto.randomUUID(),
      category: 'unknown',
      severity: 'medium',
      title: 'No Arbitrage Opportunities Found',
      description: 'The bot is not finding any arbitrage opportunities, which could be normal in current market conditions or indicate an issue.',
      potentialFix: 'Adjust your minimum profit threshold or check if market data is being received correctly.',
      timestamp: now
    });
  }

  return issues;
};

// Helper to get a color class based on severity
export const getSeverityColorClass = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-blue-500';
    default:
      return 'text-slate-500';
  }
};

// Helper to get an icon for each category
export const getCategoryDescription = (category: DiagnosticCategory): string => {
  switch (category) {
    case 'price_simulation':
      return 'Issues related to price data accuracy or simulation';
    case 'transaction_failure':
      return 'Problems with executing transactions';
    case 'connectivity':
      return 'Network or API connection issues';
    case 'performance':
      return 'Bot performance and efficiency concerns';
    case 'configuration':
      return 'Configuration and settings problems';
    case 'security':
      return 'Security vulnerabilities or risks';
    case 'unknown':
      return 'Unclassified or general issues';
    default:
      return 'Miscellaneous issues';
  }
};
