import os
import time
import json
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
import logging
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.utils.config import TRADING_PAIR, BINANCE_SYMBOL, BINANCE_FEE, COINBASE_FEE

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def fetch_binance_klines(symbol, interval="1m", start_time=None, end_time=None, limit=1000):
    """
    Fetch kline/candlestick data from Binance
    
    Args:
        symbol: Trading pair symbol (e.g., 'BTCUSDT')
        interval: Candle interval (default: '1m')
        start_time: Start time in milliseconds
        end_time: End time in milliseconds
        limit: Maximum number of candles to return (default: 1000, max: 1000)
        
    Returns:
        DataFrame with candlestick data
    """
    endpoint = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }
    
    if start_time:
        params["startTime"] = start_time
    if end_time:
        params["endTime"] = end_time
        
    logger.info(f"Fetching Binance klines: {symbol}, {interval}, {start_time} to {end_time}")
    
    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        
        # Parse response
        candles = response.json()
        
        # Create DataFrame
        columns = [
            "open_time", "open", "high", "low", "close", "volume",
            "close_time", "quote_volume", "trades", "taker_buy_base_volume",
            "taker_buy_quote_volume", "ignore"
        ]
        df = pd.DataFrame(candles, columns=columns)
        
        # Convert types
        numeric_columns = ["open", "high", "low", "close", "volume", "quote_volume"]
        for column in numeric_columns:
            df[column] = pd.to_numeric(df[column])
            
        # Convert timestamps to datetime
        df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
        df["close_time"] = pd.to_datetime(df["close_time"], unit="ms")
        
        # Add exchange identifier
        df["exchange"] = "binance"
        
        return df
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Binance data: {str(e)}")
        return pd.DataFrame()

def fetch_coinbase_candles(product_id, granularity=60, start=None, end=None):
    """
    Fetch candle data from Coinbase
    
    Args:
        product_id: Trading pair (e.g., 'BTC-USD')
        granularity: Candle duration in seconds (default: 60 = 1 minute)
        start: Start time as ISO string
        end: End time as ISO string
        
    Returns:
        DataFrame with candlestick data
    """
    endpoint = f"https://api.exchange.coinbase.com/products/{product_id}/candles"
    params = {
        "granularity": granularity
    }
    
    if start:
        params["start"] = start
    if end:
        params["end"] = end
        
    logger.info(f"Fetching Coinbase candles: {product_id}, {granularity}s, {start} to {end}")
    
    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        
        # Parse response
        candles = response.json()
        
        # Create DataFrame
        columns = ["time", "low", "high", "open", "close", "volume"]
        df = pd.DataFrame(candles, columns=columns)
        
        # Convert timestamp to datetime
        df["time"] = pd.to_datetime(df["time"], unit="s")
        
        # Add exchange identifier
        df["exchange"] = "coinbase"
        
        return df
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching Coinbase data: {str(e)}")
        return pd.DataFrame()

def sync_and_merge_data(binance_df, coinbase_df):
    """
    Synchronize and merge data from both exchanges
    
    Args:
        binance_df: DataFrame with Binance data
        coinbase_df: DataFrame with Coinbase data
        
    Returns:
        Merged DataFrame with synchronized timestamps
    """
    logger.info("Synchronizing and merging exchange data")
    
    # Rename columns for clarity
    binance_renamed = binance_df.rename(columns={
        "open_time": "timestamp", 
        "close": "binance_price"
    })
    
    coinbase_renamed = coinbase_df.rename(columns={
        "time": "timestamp", 
        "close": "coinbase_price"
    })
    
    # Select only needed columns
    binance_selected = binance_renamed[["timestamp", "binance_price"]]
    coinbase_selected = coinbase_renamed[["timestamp", "coinbase_price"]]
    
    # Merge on timestamp
    merged = pd.merge(
        binance_selected, 
        coinbase_selected, 
        on="timestamp", 
        how="inner"
    )
    
    logger.info(f"Merged data contains {len(merged)} rows")
    
    return merged

def calculate_arbitrage_features(df):
    """
    Calculate arbitrage-related features and label profitable opportunities
    
    Args:
        df: DataFrame with synchronized price data
        
    Returns:
        DataFrame with added features and labels
    """
    logger.info("Calculating arbitrage features and labels")
    
    # Calculate price difference and percentage
    df["price_diff"] = df["coinbase_price"] - df["binance_price"]
    df["spread_pct"] = (df["price_diff"] / df["binance_price"]) * 100
    
    # Calculate transaction costs (fees)
    df["binance_fee"] = df["binance_price"] * BINANCE_FEE
    df["coinbase_fee"] = df["coinbase_price"] * COINBASE_FEE
    df["total_fee_cost"] = df["binance_fee"] + df["coinbase_fee"]
    
    # Calculate net profit after fees
    df["net_profit"] = df["price_diff"] - df["total_fee_cost"]
    
    # Label profitable arbitrage opportunities (1 = profitable, 0 = not profitable)
    df["label"] = (df["net_profit"] > 0).astype(int)
    
    # Create rolling features (using previous data to predict current opportunity)
    window_sizes = [5, 10, 20]
    
    for window in window_sizes:
        # Moving average of spread
        df[f"spread_ma_{window}"] = df["spread_pct"].rolling(window=window).mean()
        
        # Moving standard deviation (volatility)
        df[f"spread_std_{window}"] = df["spread_pct"].rolling(window=window).std()
        
        # Trend (difference from previous periods)
        df[f"spread_trend_{window}"] = df["spread_pct"] - df["spread_pct"].shift(window)
    
    # Drop rows with NaN values (from rolling calculations)
    df = df.dropna()
    
    logger.info(f"Feature calculation complete. DataFrame has {len(df)} rows and {len(df.columns)} columns")
    logger.info(f"Profitable opportunities: {df['label'].sum()} ({df['label'].mean()*100:.2f}%)")
    
    return df

def collect_historical_data(days=7, interval="1m"):
    """
    Collect and process historical data from both exchanges
    
    Args:
        days: Number of days of historical data to collect
        interval: Candle interval
        
    Returns:
        Processed DataFrame ready for ML training
    """
    logger.info(f"Collecting {days} days of historical data at {interval} interval")
    
    # Calculate time range
    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)
    
    # Convert to milliseconds for Binance
    start_ms = int(start_time.timestamp() * 1000)
    end_ms = int(end_time.timestamp() * 1000)
    
    # Convert to ISO format for Coinbase
    start_iso = start_time.isoformat()
    end_iso = end_time.isoformat()
    
    # Fetch data in chunks (Binance limit is 1000 candles per request)
    binance_chunks = []
    coinbase_chunks = []
    
    current_start_ms = start_ms
    current_start_iso = start_iso
    
    # For Binance, we'll use 1-day chunks
    chunk_size_ms = 24 * 60 * 60 * 1000  # 1 day in milliseconds
    
    while current_start_ms < end_ms:
        chunk_end_ms = min(current_start_ms + chunk_size_ms, end_ms)
        chunk_end_iso = datetime.fromtimestamp(chunk_end_ms / 1000).isoformat()
        
        # Fetch Binance data
        binance_chunk = fetch_binance_klines(
            symbol=BINANCE_SYMBOL,
            interval=interval,
            start_time=current_start_ms,
            end_time=chunk_end_ms
        )
        binance_chunks.append(binance_chunk)
        
        # Fetch Coinbase data
        coinbase_chunk = fetch_coinbase_candles(
            product_id=TRADING_PAIR,
            granularity=60,  # 1 minute in seconds
            start=current_start_iso,
            end=chunk_end_iso
        )
        coinbase_chunks.append(coinbase_chunk)
        
        # Sleep to avoid rate limits
        time.sleep(1)
        
        # Update start times for next chunk
        current_start_ms = chunk_end_ms
        current_start_iso = chunk_end_iso
    
    # Combine all chunks
    binance_df = pd.concat(binance_chunks, ignore_index=True)
    coinbase_df = pd.concat(coinbase_chunks, ignore_index=True)
    
    logger.info(f"Collected {len(binance_df)} rows from Binance and {len(coinbase_df)} rows from Coinbase")
    
    # Merge and process data
    merged_df = sync_and_merge_data(binance_df, coinbase_df)
    processed_df = calculate_arbitrage_features(merged_df)
    
    # Save to CSV
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, f"arbitrage_data_{start_time.date()}_{end_time.date()}.csv")
    processed_df.to_csv(output_path, index=False)
    
    logger.info(f"Data saved to {output_path}")
    
    return processed_df

if __name__ == "__main__":
    # Collect 7 days of historical data at 1-minute intervals
    collect_historical_data(days=7, interval="1m")
