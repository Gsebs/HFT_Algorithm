"use client";

import { useEffect, useState } from "react";
import { LineChart } from "@/components/LineChart";
import { Stats } from "@/components/Stats";
import { TradesTable } from "@/components/TradesTable";
import { MLSignal } from "@/components/MLSignal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

interface MarketData {
  binancePrice: number;
  coinbasePrice: number;
  priceDifference: number;
  cumulativePnL: number;
}

export default function Home() {
  const [marketData, setMarketData] = useState<MarketData>({
    binancePrice: 0,
    coinbasePrice: 0,
    priceDifference: 0,
    cumulativePnL: 0,
  });

  useEffect(() => {
    // Generate mock data for development
    const mockDataInterval = setInterval(() => {
      const basePrice = 45000 + Math.random() * 1000;
      const binancePrice = basePrice;
      const coinbasePrice = basePrice * (1 + (Math.random() - 0.5) * 0.002);
      const priceDifference = ((coinbasePrice - binancePrice) / binancePrice) * 100;
      
      setMarketData(prev => ({
        binancePrice,
        coinbasePrice,
        priceDifference,
        cumulativePnL: prev.cumulativePnL + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 10,
      }));
    }, 1000);

    const ws = new WebSocket(process.env.NEXT_PUBLIC_API_BASE_URL!.replace('http', 'ws'));
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.binance_price && data.coinbase_price) {
        clearInterval(mockDataInterval);
        setMarketData({
          binancePrice: data.binance_price,
          coinbasePrice: data.coinbase_price,
          priceDifference: ((data.coinbase_price - data.binance_price) / data.binance_price) * 100,
          cumulativePnL: data.cumulative_pnl || 0,
        });
      }
    };

    return () => {
      ws.close();
      clearInterval(mockDataInterval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              HFT Latency Arbitrage Dashboard
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Real-time arbitrage simulation between Binance and Coinbase</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400">Last updated</div>
            <div className="text-sm font-medium">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-400">Binance BTC/USDT</p>
                <div className="flex items-center gap-1">
                  {marketData.binancePrice > 0 && (
                    <span className="text-xs text-zinc-500">
                      {marketData.binancePrice > marketData.coinbasePrice ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold">
                ${marketData.binancePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-400">Coinbase BTC/USD</p>
                <div className="flex items-center gap-1">
                  {marketData.coinbasePrice > 0 && (
                    <span className="text-xs text-zinc-500">
                      {marketData.coinbasePrice > marketData.binancePrice ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold">
                ${marketData.coinbasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-400">Price Difference</p>
                <div className={`text-sm font-medium ${marketData.priceDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketData.priceDifference >= 0 ? '+' : ''}{marketData.priceDifference.toFixed(4)}%
                </div>
              </div>
              <div className="text-sm text-zinc-400">
                {Math.abs(marketData.priceDifference) < 0.1 
                  ? "Normal market conditions"
                  : Math.abs(marketData.priceDifference) < 0.5 
                    ? "Minor arbitrage spread"
                    : "High arbitrage spread!"}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-400">Cumulative P&L</p>
                <div className={`text-sm font-medium ${marketData.cumulativePnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketData.cumulativePnL >= 0 ? '+' : ''}${Math.abs(marketData.cumulativePnL).toFixed(2)}
                </div>
              </div>
              <div className="text-2xl font-bold">
                ${(10000 + marketData.cumulativePnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Market Prices</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              <LineChart />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">ML Signal</CardTitle>
            </CardHeader>
            <CardContent>
              <MLSignal />
            </CardContent>
          </Card>
        </div>

        {/* Trades Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Trades</CardTitle>
            <p className="text-sm text-zinc-400">Latest arbitrage executions</p>
          </CardHeader>
          <CardContent>
            <TradesTable />
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 