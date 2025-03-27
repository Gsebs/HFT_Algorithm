import axios from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Type definitions for API responses
export interface Trade {
  time: number;
  datetime: string;
  buy_exchange: string;
  sell_exchange: string;
  buy_price: number;
  sell_price: number;
  amount: number;
  fees: number;
  profit: number;
  initial_spread: number;
  execution_spread: number;
  slippage_impact: number;
}

export interface Status {
  binance_price: number | null;
  coinbase_price: number | null;
  price_gap: number | null;
  spread_percentage: number | null;
  trades_executed: number;
  total_profit: number;
  last_trade_time: number | null;
  binance_last_update: number | null;
  coinbase_last_update: number | null;
}

// API functions
export const fetchStatus = async (): Promise<Status> => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
};

export const fetchTrades = async (limit: number = 50): Promise<Trade[]> => {
  try {
    const response = await api.get('/trades', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }
};

export const checkHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export default api;
