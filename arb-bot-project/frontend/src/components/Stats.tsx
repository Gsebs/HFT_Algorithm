"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  totalTrades: number;
  winRate: number;
  averageProfit: number;
  totalVolume: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export function Stats() {
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    winRate: 0,
    averageProfit: 0,
    totalVolume: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
  });

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_API_BASE_URL!.replace('http', 'ws'));
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.stats) {
        setStats({
          totalTrades: data.stats.total_trades,
          winRate: data.stats.win_rate * 100,
          averageProfit: data.stats.average_profit,
          totalVolume: data.stats.total_volume,
          maxDrawdown: data.stats.max_drawdown,
          sharpeRatio: data.stats.sharpe_ratio,
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-zinc-400">Total Trades</p>
            <div className="text-sm text-zinc-400">24h</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.totalTrades}</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-zinc-400">Win Rate</p>
            <div className="text-sm text-zinc-400">24h</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">{stats.winRate.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-zinc-400">Average Profit</p>
            <div className="text-sm text-zinc-400">24h</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            ${stats.averageProfit.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-zinc-400">Total Volume</p>
            <div className="text-sm text-zinc-400">24h</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            {stats.totalVolume.toFixed(2)} BTC
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-zinc-400">Max Drawdown</p>
            <div className="text-sm text-zinc-400">24h</div>
          </div>
          <div className="text-2xl font-bold text-red-500">
            {stats.maxDrawdown.toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-zinc-400">Sharpe Ratio</p>
            <div className="text-sm text-zinc-400">24h</div>
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            {stats.sharpeRatio.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 