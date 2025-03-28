"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

interface Stats {
  totalTrades: number;
  successfulTrades: number;
  totalProfitLoss: number;
  averageSpread: number;
  winRate: number;
  largestProfit: number;
  largestLoss: number;
  averageTradeSize: number;
}

export function Stats() {
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    successfulTrades: 0,
    totalProfitLoss: 0,
    averageSpread: 0,
    winRate: 0,
    largestProfit: 0,
    largestLoss: 0,
    averageTradeSize: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          <div className={stats.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}>
            {stats.totalProfitLoss >= 0 ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${Math.abs(stats.totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            From {stats.totalTrades} total trades
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          <div className="text-green-500">
            <ArrowUpIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.winRate * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.successfulTrades} successful trades
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Spread</CardTitle>
          <div className="text-blue-500">
            <span className="text-sm font-medium">USD</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.averageSpread.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Per trade opportunity
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Trade Size</CardTitle>
          <div className="text-purple-500">
            <span className="text-sm font-medium">BTC</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageTradeSize.toFixed(4)}
          </div>
          <p className="text-xs text-muted-foreground">
            Average volume per trade
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 