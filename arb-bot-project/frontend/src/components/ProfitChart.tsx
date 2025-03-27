import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trade } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';

interface ProfitChartProps {
  trades: Trade[];
  isLoading: boolean;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ trades, isLoading }) => {
  // Format chart data
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    let cumulativeProfit = 0;
    
    return trades.map((trade, index) => {
      cumulativeProfit += trade.profit;
      
      return {
        index,
        time: trade.time,
        timestamp: new Date(trade.time * 1000).toLocaleTimeString(),
        profit: trade.profit,
        cumulativeProfit: cumulativeProfit,
      };
    });
  }, [trades]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow rounded border border-gray-200 dark:border-gray-700 text-xs">
          <p className="font-medium">{payload[0].payload.timestamp}</p>
          <p>Trade Profit: {formatCurrency(payload[0].payload.profit)}</p>
          <p>Cumulative Profit: {formatCurrency(payload[0].payload.cumulativeProfit)}</p>
        </div>
      );
    }
    
    return null;
  };

  // Determine line color based on final profit value
  const lineColor = useMemo(() => {
    if (chartData.length === 0) return '#9CA3AF'; // Gray
    const lastValue = chartData[chartData.length - 1].cumulativeProfit;
    return lastValue >= 0 ? '#10B981' : '#EF4444'; // Green or red
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-6 text-gray-500 h-64 flex items-center justify-center">
            No trade data available for chart
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Trades', position: 'insideBottomRight', offset: 0 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value).replace('$', '')}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="cumulativeProfit"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitChart;
