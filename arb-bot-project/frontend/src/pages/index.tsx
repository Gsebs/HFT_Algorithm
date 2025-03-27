import { useState, useEffect } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { fetchStatus, fetchTrades, Status, Trade } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/format';

// Components
import PriceCard from '../components/PriceCard';
import SpreadInfo from '../components/SpreadInfo';
import TradeLog from '../components/TradeLog';
import ProfitChart from '../components/ProfitChart';
import StatCard from '../components/StatCard';

// Icons
import { TrendingUp, BarChart3, DollarSign, Clock } from 'lucide-react';

export default function Dashboard() {
  // Data fetching with SWR for real-time updates
  const { data: status, error: statusError, isLoading: statusLoading } = 
    useSWR('/status', fetchStatus, { refreshInterval: 1000 });
  
  const { data: trades, error: tradesError, isLoading: tradesLoading } = 
    useSWR('/trades', () => fetchTrades(50), { refreshInterval: 5000 });
  
  // State for detecting arbitrage opportunities
  const [isProfitable, setIsProfitable] = useState(false);
  
  // Effect to detect profitable arbitrage opportunities
  useEffect(() => {
    if (status && status.price_gap && status.price_gap > 0) {
      // Basic check if spread is positive
      setIsProfitable(true);
      
      // Flash effect - reset after 3 seconds
      const timer = setTimeout(() => {
        setIsProfitable(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Calculate relevant statistics
  const totalTrades = status?.trades_executed || 0;
  const totalProfit = status?.total_profit || 0;
  const lastTradeTime = status?.last_trade_time ? 
    new Date(status.last_trade_time * 1000).toLocaleTimeString() : 'N/A';
  
  // Determine if Binance price is lower (better to buy on Binance)
  const binanceIsLower = status?.binance_price && status?.coinbase_price 
    ? status.binance_price < status.coinbase_price : false;
  
  // Loading and error states
  const isLoading = statusLoading || tradesLoading;
  const hasError = statusError || tradesError;
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200">
          <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
          <p>Failed to connect to the backend API. Please check that the server is running.</p>
          <p className="mt-4 text-sm">Error details: {statusError?.message || tradesError?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>HFT Arbitrage Dashboard</title>
        <meta name="description" content="Real-time HFT crypto arbitrage trading simulation dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              HFT Crypto Arbitrage Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Real-time arbitrage simulation between Binance and Coinbase
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Price Cards and Spread */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <PriceCard 
              title="Binance" 
              price={status?.binance_price || null}
              lastUpdate={status?.binance_last_update || null}
              isLoading={isLoading}
              isLower={binanceIsLower}
            />
            
            <SpreadInfo 
              priceGap={status?.price_gap || null}
              spreadPercentage={status?.spread_percentage || null}
              isLoading={isLoading}
              isProfitable={isProfitable}
            />
            
            <PriceCard 
              title="Coinbase" 
              price={status?.coinbase_price || null}
              lastUpdate={status?.coinbase_last_update || null}
              isLoading={isLoading}
              isLower={!binanceIsLower}
            />
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Trades"
              value={formatNumber(totalTrades)}
              icon={<BarChart3 size={18} />}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Total Profit/Loss"
              value={formatCurrency(totalProfit)}
              icon={<DollarSign size={18} />}
              isLoading={isLoading}
              trend={totalProfit > 0 ? 'up' : totalProfit < 0 ? 'down' : 'neutral'}
            />
            
            <StatCard
              title="Average Profit per Trade"
              value={totalTrades > 0 ? formatCurrency(totalProfit / totalTrades) : '$0.00'}
              icon={<TrendingUp size={18} />}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Last Trade"
              value={lastTradeTime}
              icon={<Clock size={18} />}
              isLoading={isLoading}
            />
          </div>
          
          {/* Profit Chart */}
          <div className="mb-6">
            <ProfitChart
              trades={trades || []}
              isLoading={isLoading}
            />
          </div>
          
          {/* Trade Log */}
          <div>
            <TradeLog
              trades={trades || []}
              isLoading={isLoading}
            />
          </div>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              HFT Arbitrage Simulation — Powered by FastAPI and Next.js
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
