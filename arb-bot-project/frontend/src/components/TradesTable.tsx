"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";

interface Trade {
  id: string;
  timestamp: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  volume: number;
  profit: number;
  status: "success" | "failed" | "pending";
}

export function TradesTable() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Generate mock data for development
    const mockTrades: Trade[] = Array.from({ length: 5 }, (_, i) => {
      const basePrice = 45000 + Math.random() * 1000;
      const buyPrice = basePrice;
      const sellPrice = basePrice * (1 + (Math.random() - 0.5) * 0.004);
      const volume = 0.1 + Math.random() * 0.4;
      const profit = (sellPrice - buyPrice) * volume;
      
      return {
        id: `mock-${i}`,
        timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString(),
        buyExchange: Math.random() > 0.5 ? "Binance" : "Coinbase",
        sellExchange: Math.random() > 0.5 ? "Binance" : "Coinbase",
        buyPrice,
        sellPrice,
        volume,
        profit,
        status: Math.random() > 0.7 ? "pending" : Math.random() > 0.2 ? "success" : "failed",
      };
    });
    setTrades(mockTrades);

    const mockDataInterval = setInterval(() => {
      const basePrice = 45000 + Math.random() * 1000;
      const buyPrice = basePrice;
      const sellPrice = basePrice * (1 + (Math.random() - 0.5) * 0.004);
      const volume = 0.1 + Math.random() * 0.4;
      const profit = (sellPrice - buyPrice) * volume;

      const newTrade: Trade = {
        id: `mock-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        buyExchange: Math.random() > 0.5 ? "Binance" : "Coinbase",
        sellExchange: Math.random() > 0.5 ? "Binance" : "Coinbase",
        buyPrice,
        sellPrice,
        volume,
        profit,
        status: Math.random() > 0.7 ? "pending" : Math.random() > 0.2 ? "success" : "failed",
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 10));
    }, 3000);

    const ws = new WebSocket(process.env.NEXT_PUBLIC_API_BASE_URL!.replace('http', 'ws'));
    
    ws.onopen = () => {
      setIsConnected(true);
      clearInterval(mockDataInterval);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.trades) {
        setTrades((prevTrades) => {
          const newTrades = data.trades.map((trade: any) => ({
            id: trade.id,
            timestamp: new Date(trade.timestamp).toLocaleTimeString(),
            buyExchange: trade.buy_exchange,
            sellExchange: trade.sell_exchange,
            buyPrice: trade.buy_price,
            sellPrice: trade.sell_price,
            volume: trade.volume,
            profit: trade.profit,
            status: trade.status,
          }));
          return [...newTrades, ...prevTrades].slice(0, 10);
        });
      }
    };

    return () => {
      ws.close();
      clearInterval(mockDataInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div className="rounded-md border border-zinc-800">
      <div className="relative">
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg z-10">
            <div className="text-zinc-400 animate-pulse">Connecting to trade data...</div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Time</TableHead>
              <TableHead className="text-zinc-400 font-medium">Buy Exchange</TableHead>
              <TableHead className="text-zinc-400 font-medium">Sell Exchange</TableHead>
              <TableHead className="text-zinc-400 font-medium">Buy Price</TableHead>
              <TableHead className="text-zinc-400 font-medium">Sell Price</TableHead>
              <TableHead className="text-zinc-400 font-medium">Volume</TableHead>
              <TableHead className="text-zinc-400 font-medium">Profit</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow
                key={trade.id}
                className="hover:bg-zinc-900/50 transition-colors animate-in fade-in-50 duration-300"
              >
                <TableCell className="font-medium text-zinc-300">{trade.timestamp}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {trade.buyExchange}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    {trade.sellExchange}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-300">
                  ${trade.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-zinc-300">
                  ${trade.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-zinc-300">
                  {trade.volume.toFixed(4)} BTC
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {trade.profit >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-medium ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.profit >= 0 ? '+' : ''}${Math.abs(trade.profit).toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                    {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {trades.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-zinc-400">
                  No trades executed yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 