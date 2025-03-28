"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MLStats {
  confidence: number;
  signalStrength: number;
  accuracy: number;
  latency: number;
  prediction: "buy" | "sell" | "hold";
  lastUpdate: string;
}

export function MLSignal() {
  const [stats, setStats] = useState<MLStats>({
    confidence: 0,
    signalStrength: 0,
    accuracy: 0,
    latency: 0,
    prediction: "hold",
    lastUpdate: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    // Generate mock data for development
    const mockDataInterval = setInterval(() => {
      setStats(prev => ({
        confidence: 65 + Math.random() * 20,
        signalStrength: 70 + Math.random() * 15,
        accuracy: 75 + Math.random() * 15,
        latency: 15 + Math.random() * 10,
        prediction: Math.random() > 0.6 ? "buy" : Math.random() > 0.3 ? "sell" : "hold",
        lastUpdate: new Date().toLocaleTimeString(),
      }));
    }, 2000);

    const ws = new WebSocket(process.env.NEXT_PUBLIC_API_BASE_URL!.replace('http', 'ws'));
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.ml_stats) {
        clearInterval(mockDataInterval);
        setStats({
          confidence: data.ml_stats.confidence * 100,
          signalStrength: data.ml_stats.signal_strength * 100,
          accuracy: data.ml_stats.accuracy * 100,
          latency: data.ml_stats.latency,
          prediction: data.ml_stats.prediction || "hold",
          lastUpdate: new Date().toLocaleTimeString(),
        });
      }
    };

    return () => {
      ws.close();
      clearInterval(mockDataInterval);
    };
  }, []);

  const getSignalColor = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "buy":
        return "text-green-500";
      case "sell":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-medium text-zinc-400">Current Prediction</div>
          <div className={`text-2xl font-bold ${getPredictionColor(stats.prediction)}`}>
            {stats.prediction.toUpperCase()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-zinc-400">Last Update</div>
          <div className="text-sm font-medium">{stats.lastUpdate}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Model Confidence</span>
            <span className={`text-sm font-medium ${getSignalColor(stats.confidence)}`}>
              {stats.confidence.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(stats.confidence)}`}
              style={{ width: `${stats.confidence}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Signal Strength</span>
            <span className={`text-sm font-medium ${getSignalColor(stats.signalStrength)}`}>
              {stats.signalStrength.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(stats.signalStrength)}`}
              style={{ width: `${stats.signalStrength}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Prediction Accuracy</span>
            <span className={`text-sm font-medium ${getSignalColor(stats.accuracy)}`}>
              {stats.accuracy.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(stats.accuracy)}`}
              style={{ width: `${stats.accuracy}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">Model Latency</span>
            <span className="text-sm font-medium text-zinc-400">
              {stats.latency.toFixed(2)}ms
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min((stats.latency / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <div className={`text-sm ${getSignalColor(stats.confidence)}`}>
          {stats.confidence >= 80
            ? "Strong trading signal detected"
            : stats.confidence >= 60
            ? "Moderate trading signal"
            : "Weak trading signal"}
        </div>
      </div>
    </div>
  );
} 