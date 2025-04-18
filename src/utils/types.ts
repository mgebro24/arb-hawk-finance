
// Exchange and token types
export type Exchange = 'Raydium' | 'Orca' | 'Jupiter' | 'Saber' | 'Serum';

export interface Token {
  name: string;
  symbol: string;
  address: string;
  logo?: string;
}

// Arbitrage opportunity types
export interface ArbitrageRoute {
  path: Token[];
  exchanges: Exchange[];
  entryAmount: number;
  expectedReturn: number;
  profit: number;
  profitPercentage: number;
  gasFee: number;
  netProfit: number;
  timestamp: number;
  isTriangular: boolean;
}

// Wallet related types
export interface WalletInfo {
  address: string;
  balance: number;
  connected: boolean;
}

// Trading related types
export interface TradeHistory {
  id: string;
  route: ArbitrageRoute;
  executionTime: number;
  status: 'completed' | 'failed' | 'pending';
  txHash?: string;
  actualProfit?: number;
}

// Risk management types
export interface RiskSettings {
  maxTradeAmount: number;
  minProfitThreshold: number;
  maxSlippage: number;
  autoTrading: boolean;
  gasLimit: number;
  maxDailyTradeCount: number;
  maxDailyLoss: number;
}

// Application state
export interface AppState {
  wallet: WalletInfo;
  arbitrageOpportunities: ArbitrageRoute[];
  tradeHistory: TradeHistory[];
  riskSettings: RiskSettings;
  isTestnet: boolean;
  networkStatus: {
    connected: boolean;
    lastUpdate: number;
    rpcEndpoint: string;
  };
}
