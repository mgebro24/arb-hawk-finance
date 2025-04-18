
import { useState, useCallback } from 'react';
import { TradeHistory, ArbitrageRoute } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';

export const useTradeHistory = () => {
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([
    // Add some mock initial history for demo purposes
    {
      id: "t1",
      route: {
        path: [
          { name: 'Solana', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
          { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }
        ],
        exchanges: ['Jupiter'],
        entryAmount: 100,
        expectedReturn: 100.73,
        profit: 0.73,
        profitPercentage: 0.0073,
        gasFee: 0.001,
        netProfit: 0.729,
        timestamp: Date.now() - 5 * 60 * 1000,
        isTriangular: false
      },
      executionTime: Date.now() - 5 * 60 * 1000,
      status: 'completed',
      txHash: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
      actualProfit: 0.73
    },
    {
      id: "t2",
      route: {
        path: [
          { name: 'Raydium', symbol: 'RAY', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
          { name: 'Solana', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
          { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
          { name: 'Raydium', symbol: 'RAY', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' }
        ],
        exchanges: ['Raydium', 'Jupiter', 'Orca'],
        entryAmount: 200,
        expectedReturn: 201.21,
        profit: 1.21,
        profitPercentage: 0.00605,
        gasFee: 0.003,
        netProfit: 1.207,
        timestamp: Date.now() - 12 * 60 * 1000,
        isTriangular: true
      },
      executionTime: Date.now() - 12 * 60 * 1000,
      status: 'completed',
      txHash: "6zDjXyCfMr4Gxvnf7LFffzkMH6MXQNmzCGP3bRFXx2Eq",
      actualProfit: 1.21
    },
    {
      id: "t3",
      route: {
        path: [
          { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
          { name: 'Wrapped BTC', symbol: 'wBTC', address: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E' }
        ],
        exchanges: ['Saber'],
        entryAmount: 150,
        expectedReturn: 149.95,
        profit: -0.05,
        profitPercentage: -0.00033,
        gasFee: 0.002,
        netProfit: -0.052,
        timestamp: Date.now() - 25 * 60 * 1000,
        isTriangular: false
      },
      executionTime: Date.now() - 25 * 60 * 1000,
      status: 'failed',
      txHash: "2K3aPaAuoiB5h8tPAPFCKJRfug1DKUECbAXgzuGzsFBh",
      actualProfit: -0.18
    },
    {
      id: "t4",
      route: {
        path: [
          { name: 'Solana', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
          { name: 'USD Coin', symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
          { name: 'Raydium', symbol: 'RAY', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' }
        ],
        exchanges: ['Jupiter', 'Raydium'],
        entryAmount: 75,
        expectedReturn: 75.32,
        profit: 0.32,
        profitPercentage: 0.00427,
        gasFee: 0.002,
        netProfit: 0.318,
        timestamp: Date.now() - 1 * 60 * 1000,
        isTriangular: false
      },
      executionTime: Date.now() - 1 * 60 * 1000,
      status: 'pending'
    }
  ]);

  // Add a new trade to history
  const addTradeToHistory = useCallback((
    route: ArbitrageRoute, 
    status: 'completed' | 'failed' | 'pending' = 'pending',
    txHash?: string,
    actualProfit?: number
  ) => {
    const newTrade: TradeHistory = {
      id: uuidv4(),
      route,
      executionTime: Date.now(),
      status,
      txHash,
      actualProfit
    };
    
    setTradeHistory(prev => [newTrade, ...prev]);
    return newTrade;
  }, []);

  // Update an existing trade's status
  const updateTradeStatus = useCallback((
    id: string,
    status: 'completed' | 'failed' | 'pending',
    txHash?: string,
    actualProfit?: number
  ) => {
    setTradeHistory(prev => 
      prev.map(trade => 
        trade.id === id 
          ? { ...trade, status, txHash, actualProfit } 
          : trade
      )
    );
  }, []);

  // Clear all trade history
  const clearTradeHistory = useCallback(() => {
    setTradeHistory([]);
  }, []);

  return {
    tradeHistory,
    addTradeToHistory,
    updateTradeStatus,
    clearTradeHistory
  };
};

// Add uuid dependency to ensure unique IDs for trades
<lov-add-dependency>uuid@latest</lov-add-dependency>
<lov-add-dependency>@types/uuid@latest</lov-add-dependency>
