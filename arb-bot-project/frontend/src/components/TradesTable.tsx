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
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";

interface Trade {
  id: string;
  timestamp: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  volume: number;
  profitLoss: number;
}

export function TradesTable() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trades?limit=10`);
        const data = await response.json();
        setTrades(data);
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    // Initial fetch
    fetchTrades();

    // Set up polling every 1 second
    const interval = setInterval(fetchTrades, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-md border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">Time</TableHead>
            <TableHead className="text-muted-foreground font-medium">Buy Exchange</TableHead>
            <TableHead className="text-muted-foreground font-medium">Sell Exchange</TableHead>
            <TableHead className="text-muted-foreground font-medium">Buy Price</TableHead>
            <TableHead className="text-muted-foreground font-medium">Sell Price</TableHead>
            <TableHead className="text-muted-foreground font-medium">Volume (BTC)</TableHead>
            <TableHead className="text-right text-muted-foreground font-medium">Profit/Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow
              key={trade.id}
              className="hover:bg-muted/5 transition-colors"
            >
              <TableCell className="font-medium">
                {new Date(trade.timestamp).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {trade.buyExchange}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {trade.sellExchange}
                </span>
              </TableCell>
              <TableCell>${trade.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>${trade.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>{trade.volume.toFixed(4)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {trade.profitLoss >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      trade.profitLoss >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"
                    }
                  >
                    ${Math.abs(trade.profitLoss).toFixed(2)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {trades.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                Waiting for trades...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 