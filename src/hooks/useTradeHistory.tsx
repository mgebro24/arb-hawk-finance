
import { useState, useCallback } from 'react';
import { ArbitrageRoute, TradeHistory } from '@/utils/types';
import { toast } from './use-toast';

export const useTradeHistory = () => {
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);

  // Add a new trade to history
  const addTradeToHistory = useCallback((
    route: ArbitrageRoute, 
    status: 'completed' | 'failed' | 'pending' = 'pending',
    txHash?: string,
    actualProfit?: number
  ) => {
    const newTrade: TradeHistory = {
      id: crypto.randomUUID(),
      route,
      executionTime: Date.now(),
      status,
      txHash,
      actualProfit
    };

    setTradeHistory(prev => [newTrade, ...prev]);
    
    // Update total profit when trade is completed
    if (status === 'completed' && actualProfit) {
      setTotalProfit(prev => prev + actualProfit);
      
      toast({
        title: actualProfit > 0 ? "Profit Added" : "Loss Recorded",
        description: `Total profit: ${(totalProfit + actualProfit).toFixed(4)} SOL`,
        variant: actualProfit > 0 ? "default" : "destructive",
      });
    }

    return newTrade;
  }, [totalProfit]);

  // Update an existing trade's status
  const updateTradeStatus = useCallback((
    id: string, 
    status: 'completed' | 'failed' | 'pending',
    txHash?: string,
    actualProfit?: number
  ) => {
    setTradeHistory(prev => prev.map(trade => {
      if (trade.id === id) {
        // If trade is being completed and has profit, update total profit
        if (status === 'completed' && actualProfit && trade.status !== 'completed') {
          setTotalProfit(prev => prev + actualProfit);
          
          toast({
            title: actualProfit > 0 ? "Profit Added" : "Loss Recorded",
            description: `Total profit: ${(totalProfit + actualProfit).toFixed(4)} SOL`,
            variant: actualProfit > 0 ? "default" : "destructive",
          });
        }
        
        return {
          ...trade,
          status,
          txHash,
          actualProfit
        };
      }
      return trade;
    }));
  }, [totalProfit]);

  // Clear all trade history
  const clearTradeHistory = useCallback(() => {
    setTradeHistory([]);
    setTotalProfit(0);
  }, []);

  return {
    tradeHistory,
    totalProfit,
    addTradeToHistory,
    updateTradeStatus,
    clearTradeHistory
  };
};
