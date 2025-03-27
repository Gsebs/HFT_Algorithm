import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trade } from '../utils/api';
import { formatCurrency, formatDateTime, formatPercentage } from '../utils/format';

interface TradeLogProps {
  trades: Trade[];
  isLoading: boolean;
}

const TradeLog: React.FC<TradeLogProps> = ({ trades, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No trades executed yet. Waiting for arbitrage opportunities...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-right py-2 px-2">Buy Price</th>
                  <th className="text-right py-2 px-2">Sell Price</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-right py-2 px-2">Fees</th>
                  <th className="text-right py-2 px-2">Slippage</th>
                  <th className="text-right py-2 px-2">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-2 text-xs">
                      {formatDateTime(trade.time)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {formatCurrency(trade.buy_price)}
                      <div className="text-xs text-gray-500">{trade.buy_exchange}</div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      {formatCurrency(trade.sell_price)}
                      <div className="text-xs text-gray-500">{trade.sell_exchange}</div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      {trade.amount.toFixed(4)}
                    </td>
                    <td className="py-2 px-2 text-right text-red-500">
                      {formatCurrency(trade.fees)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {formatPercentage(trade.slippage_impact)}
                    </td>
                    <td className={`py-2 px-2 text-right ${trade.profit >= 0 ? 'profit' : 'loss'}`}>
                      {formatCurrency(trade.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeLog;
