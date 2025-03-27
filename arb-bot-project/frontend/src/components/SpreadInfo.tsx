import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, formatPercentage } from '../utils/format';

interface SpreadInfoProps {
  priceGap: number | null;
  spreadPercentage: number | null;
  isLoading: boolean;
  isProfitable: boolean;
}

const SpreadInfo: React.FC<SpreadInfoProps> = ({
  priceGap,
  spreadPercentage,
  isLoading,
  isProfitable,
}) => {
  // Determine if we should highlight this as an arbitrage opportunity
  const isOpportunity = isProfitable && priceGap !== null && priceGap > 0;
  const cardClass = isOpportunity ? 'arbitrage-opportunity' : '';

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Price Spread</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">
                  {priceGap !== null ? formatCurrency(priceGap) : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {spreadPercentage !== null ? formatPercentage(spreadPercentage) : 'N/A'}
                </p>
              </div>
              
              {isOpportunity && (
                <div className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  Arbitrage Opportunity
                </div>
              )}
            </div>
            
            {isOpportunity && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Buy on Binance, sell on Coinbase
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SpreadInfo;
