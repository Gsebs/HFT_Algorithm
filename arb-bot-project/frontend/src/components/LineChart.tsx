"use client";

import { useEffect, useState } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface PriceData {
  timestamp: string;
  binancePrice: number;
  coinbasePrice: number;
  spread: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 shadow-lg">
        <p className="text-sm text-zinc-400">{label}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">
            <span className="text-blue-400">Binance:</span>{" "}
            ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm">
            <span className="text-purple-400">Coinbase:</span>{" "}
            ${payload[1].value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm">
            <span className="text-emerald-400">Spread:</span>{" "}
            {payload[2]?.value?.toFixed(4)}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function LineChart() {
  const [data, setData] = useState<PriceData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Generate some initial mock data
    const mockData = Array.from({ length: 50 }, (_, i) => {
      const basePrice = 45000 + Math.random() * 1000;
      return {
        timestamp: new Date(Date.now() - (50 - i) * 1000).toLocaleTimeString(),
        binancePrice: basePrice,
        coinbasePrice: basePrice * (1 + (Math.random() - 0.5) * 0.002),
        spread: 0,
      };
    });
    setData(mockData);

    const ws = new WebSocket(process.env.NEXT_PUBLIC_API_BASE_URL!.replace('http', 'ws'));
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };
    
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      const timestamp = new Date().toLocaleTimeString();
      
      if (newData.binance_price && newData.coinbase_price) {
        setData((prevData) => {
          const spread = ((newData.coinbase_price - newData.binance_price) / newData.binance_price) * 100;
          const updatedData = [
            ...prevData,
            {
              timestamp,
              binancePrice: newData.binance_price,
              coinbasePrice: newData.coinbase_price,
              spread,
            },
          ];
          return updatedData.slice(-100);
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="relative">
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg z-10">
          <div className="text-zinc-400 animate-pulse">Connecting to market data...</div>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="binanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="coinbaseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" opacity={0.3} />
          <XAxis
            dataKey="timestamp"
            stroke="#71717A"
            tick={{ fill: "#71717A" }}
            tickFormatter={(value) => value.split(" ")[1]}
          />
          <YAxis
            yAxisId="price"
            stroke="#71717A"
            tick={{ fill: "#71717A" }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={['auto', 'auto']}
          />
          <YAxis
            yAxisId="spread"
            orientation="right"
            stroke="#34D399"
            tick={{ fill: "#34D399" }}
            tickFormatter={(value) => `${value.toFixed(2)}%`}
            domain={[-0.5, 0.5]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            content={({ payload }) => (
              <div className="flex justify-end gap-4 text-sm">
                {payload?.map((entry) => (
                  <div key={entry.value} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-zinc-400">{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="binancePrice"
            name="Binance"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#60A5FA" }}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="coinbasePrice"
            name="Coinbase"
            stroke="#A78BFA"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#A78BFA" }}
          />
          <Area
            yAxisId="spread"
            type="monotone"
            dataKey="spread"
            name="Spread"
            stroke="#34D399"
            fill="url(#spreadGradient)"
            strokeWidth={1}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 