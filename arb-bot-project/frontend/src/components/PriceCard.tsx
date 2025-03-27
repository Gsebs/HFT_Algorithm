import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency } from '../utils/format';

interface PriceCardProps {
  title: string;
  price: number | null;
  lastUpdate: number | null;
  isLoading: boolean;
  isLower?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({
  title,
  price,
  lastUpdate,
  isLoading,
  isLower,
}) => {
  // Calculate time since last update
  const getUpdateText = () => {
    if (!lastUpdate) return 'Awaiting data...';
    
    const now = new Date().getTime() / 1000;
    const secondsAgo = Math.floor(now - lastUpdate);
    
    if (secondsAgo < 5) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
    
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
  };

  // Determine card class based on isLower prop
  const cardClass = isLower ? `price-card ${title.toLowerCase()}-lower` : 'price-card';

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title} Price</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : (
          <>
            <p className="text-3xl font-bold">
              {price ? formatCurrency(price) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Updated: {getUpdateText()}
            </p>
            {isLower && (
              <div className="mt-2 text-xs font-medium py-1 px-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                Best price to buy
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceCard;
