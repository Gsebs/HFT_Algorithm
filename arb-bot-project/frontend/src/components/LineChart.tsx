"use client";

import { useEffect, useState } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PriceData {
  timestamp: string;
  binancePrice: number;
  coinbasePrice: number;
}

interface LineChartProps {
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg shadow-xl p-3">
        <p className="text-sm font-medium text-zinc-400 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-sm" style={{ color: entry.color }}>
              {entry.name}
            </span>
            <span className="text-sm font-medium text-white">
              ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function LineChart({ className }: LineChartProps) {
  const [data, setData] = useState<PriceData[]>([]);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_API_BASE_URL!.replace('http', 'ws'));
    
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData((prevData) => {
        const newDataPoint = {
          timestamp: new Date().toLocaleTimeString(),
          binancePrice: newData.binance_price,
          coinbasePrice: newData.coinbase_price,
        };
        
        // Keep last 100 data points for smooth visualization
        const updatedData = [...prevData, newDataPoint].slice(-100);
        return updatedData;
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="binanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="coinbaseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#27272a"
            opacity={0.4}
          />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: "#71717a" }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={{ stroke: "#27272a" }}
          />
          <YAxis
            tick={{ fill: "#71717a" }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={{ stroke: "#27272a" }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#525252" }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              paddingTop: "8px",
              color: "#71717a"
            }}
          />
          <Line
            type="monotone"
            dataKey="binancePrice"
            name="Binance"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              stroke: "#3b82f6",
              strokeWidth: 2,
              fill: "#18181b"
            }}
          />
          <Line
            type="monotone"
            dataKey="coinbasePrice"
            name="Coinbase"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              stroke: "#8b5cf6",
              strokeWidth: 2,
              fill: "#18181b"
            }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
} 