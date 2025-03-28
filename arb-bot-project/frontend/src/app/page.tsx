"use client";

import { useEffect, useState } from "react";
import { LineChart } from "@/components/LineChart";
import { Stats } from "@/components/Stats";
import { TradesTable } from "@/components/TradesTable";
import { MLSignal } from "@/components/MLSignal";
import { Card, CardContent } from "@/components/ui/card";

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
    const ws = new WebSocket(process.env.NEXT_PUBLIC_API_BASE_URL!.replace('http', 'ws'));
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMarketData({
        binancePrice: data.binance_price,
        coinbasePrice: data.coinbase_price,
        priceDifference: ((data.coinbase_price - data.binance_price) / data.binance_price) * 100,
        cumulativePnL: data.cumulative_pnl || 0,
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">HFT Crypto Arbitrage Simulator</h1>
            <p className="text-sm text-muted-foreground">Real-time arbitrage simulation between Binance and Coinbase</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-400">Binance BTC/USDT</p>
              <div className="text-2xl font-bold mt-2">
                ${marketData.binancePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-400">Coinbase BTC/USD</p>
              <div className="text-2xl font-bold mt-2">
                ${marketData.coinbasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-400">Price Difference</p>
              <div className={`text-2xl font-bold mt-2 ${marketData.priceDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketData.priceDifference.toFixed(4)}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-400">Cumulative P&L</p>
              <div className={`text-2xl font-bold mt-2 ${marketData.cumulativePnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${marketData.cumulativePnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Data Chart */}
        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Market Data</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Real-time price comparison between Binance and Coinbase
            </p>
            <div className="h-[400px]">
              <LineChart />
            </div>
          </CardContent>
        </Card>

        {/* Trading Activity and ML Signal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Recent Trades</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Latest simulated arbitrage trades
                </p>
                <TradesTable />
              </CardContent>
            </Card>
          </div>
          <div>
            <MLSignal />
          </div>
        </div>
      </div>
    </main>
  );
} 