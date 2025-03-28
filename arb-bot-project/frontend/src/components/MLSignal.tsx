"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MLStats {
  confidence: number;
  signalStrength: "Low" | "Medium" | "High";
  totalTrades: number;
  winRate: number;
}

export function MLSignal() {
  const [mlStats, setMLStats] = useState<MLStats>({
    confidence: 0,
    signalStrength: "Medium",
    totalTrades: 0,
    winRate: 0,
  });

  useEffect(() => {
    const fetchMLStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml-stats`);
        const data = await response.json();
        setMLStats(data);
      } catch (error) {
        console.error('Error fetching ML stats:', error);
      }
    };

    fetchMLStats();
    const interval = setInterval(fetchMLStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case "High":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ML Signal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current ML model confidence in arbitrage opportunity
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ML Confidence</span>
              <span className="text-sm font-medium">{mlStats.confidence}%</span>
            </div>
            <Progress value={mlStats.confidence} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Signal Strength</span>
              <span className={`text-sm font-medium ${getSignalColor(mlStats.signalStrength)}`}>
                {mlStats.signalStrength}
              </span>
            </div>
          </div>

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <div className="text-2xl font-bold">{mlStats.totalTrades}</div>
                  <div className="text-xs text-muted-foreground">Total Trades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{(mlStats.winRate * 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="performance">
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Model Version</span>
                  <span className="text-sm font-medium">v1.2.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
} 