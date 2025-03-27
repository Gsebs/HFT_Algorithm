import React from 'react';
import { Card, CardContent } from './ui/card';

interface StatCardProps {
  title: string;
  value: string | number | null;
  icon?: React.ReactNode;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  helpText?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  isLoading = false,
  trend,
  helpText
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <div className="animate-pulse h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
              {icon && <div className="text-gray-400">{icon}</div>}
            </div>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold">{value ?? 'N/A'}</p>
              
              {trend && (
                <span className={`ml-2 text-sm font-medium ${
                  trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                  trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                </span>
              )}
            </div>
            {helpText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
