import time
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime

from app.streams import latest_prices, last_update
from app.models.ml_model import arbitrage_model
from app.utils.config import (
    BINANCE_FEE,
    COINBASE_FEE, 
    SIMULATED_LATENCY,
    SLIPPAGE_RATE,
    TRADE_AMOUNT
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global variable to store trade history
trade_log: List[Dict] = []

async def simulate_trade(price_buy: float, price_sell: float) -> Optional[Dict]:
    """
    Simulate an arbitrage trade with latency, slippage, and fees
    
    Args:
        price_buy: Initial price to buy at (Binance)
        price_sell: Initial price to sell at (Coinbase)
    
    Returns:
        Dict with trade details or None if trade failed
    """
    # Simulate network latency
    await asyncio.sleep(SIMULATED_LATENCY)
    
    # Capture prices after latency
    current_prices = latest_prices.copy()
    exec_price_buy = current_prices["binance"] or price_buy
    exec_price_sell = current_prices["coinbase"] or price_sell
    
    # Apply slippage
    exec_price_buy *= (1 + SLIPPAGE_RATE)
    exec_price_sell *= (1 - SLIPPAGE_RATE)
    
    # Calculate cost and revenue
    cost = exec_price_buy * TRADE_AMOUNT  # Amount paid to buy on Binance
    revenue = exec_price_sell * TRADE_AMOUNT  # Amount received from selling on Coinbase
    
    # Apply fees
    cost_with_fee = cost * (1 + BINANCE_FEE)
    revenue_after_fee = revenue * (1 - COINBASE_FEE)
    
    # Calculate profit/loss
    profit = revenue_after_fee - cost_with_fee
    
    # Record the trade
    timestamp = time.time()
    trade_record = {
        "time": timestamp,
        "datetime": datetime.fromtimestamp(timestamp).isoformat(),
        "buy_exchange": "Binance",
        "sell_exchange": "Coinbase",
        "buy_price": exec_price_buy,
        "sell_price": exec_price_sell,
        "amount": TRADE_AMOUNT,
        "fees": (cost * BINANCE_FEE) + (revenue * COINBASE_FEE),
        "profit": profit,
        "initial_spread": price_sell - price_buy,
        "execution_spread": exec_price_sell - exec_price_buy,
        "slippage_impact": ((exec_price_buy/price_buy - 1) + (1 - exec_price_sell/price_sell)) * 100
    }
    
    trade_log.append(trade_record)
    
    logger.info(f"Executed arbitrage: Buy@{exec_price_buy:.2f}, Sell@{exec_price_sell:.2f}, Profit=${profit:.2f}")
    
    return trade_record

async def arbitrage_strategy():
    """
    Main arbitrage strategy loop.
    Continuously checks for arbitrage opportunities using ML predictions.
    """
    logger.info("Starting arbitrage strategy")
    
    min_spread_threshold = 0.05  # Minimum 0.05% spread to consider
    min_confidence_threshold = 0.7  # Minimum 70% confidence from ML model
    
    while True:
        try:
            # Get current prices
            binance_price = latest_prices.get("binance")
            coinbase_price = latest_prices.get("coinbase")
            
            # Check if we have valid prices from both exchanges
            if binance_price is not None and coinbase_price is not None:
                # Calculate current spread percentage
                spread_pct = (coinbase_price - binance_price) / binance_price * 100
                
                # Update model with current spread
                arbitrage_model.update_spreads(spread_pct)
                
                # Check basic threshold before using ML model (optimization)
                if spread_pct > min_spread_threshold:
                    # Get ML model prediction and confidence
                    prediction = arbitrage_model.predict()
                    
                    if prediction is not None:
                        is_profitable, confidence = prediction
                        
                        # Execute trade if ML model predicts profit with high confidence
                        if is_profitable and confidence >= min_confidence_threshold:
                            # Double-check raw profitability after fees
                            fee_cost = (binance_price * BINANCE_FEE) + (coinbase_price * COINBASE_FEE)
                            net_diff = coinbase_price - binance_price - fee_cost
                            
                            if net_diff > 0:
                                logger.info(f"Arbitrage opportunity detected! Spread: {spread_pct:.4f}%, Confidence: {confidence:.4f}")
                                await simulate_trade(binance_price, coinbase_price)
                            else:
                                logger.debug(f"Model predicted profitable but spread ({spread_pct:.4f}%) below fee threshold")
                        else:
                            logger.debug(f"Not profitable or low confidence: {confidence:.4f}")
                    else:
                        logger.debug("Not enough data for ML prediction")
            else:
                if binance_price is None:
                    logger.debug("Waiting for Binance price update")
                if coinbase_price is None:
                    logger.debug("Waiting for Coinbase price update")
                    
        except Exception as e:
            logger.error(f"Error in arbitrage strategy: {str(e)}")
            
        # Short sleep to prevent CPU hogging, but still check frequently
        await asyncio.sleep(0.01)  # 10ms

def get_status():
    """
    Get current system status
    """
    # Calculate price gap if both prices are available
    price_gap = None
    spread_pct = None
    
    if latest_prices["binance"] and latest_prices["coinbase"]:
        price_gap = latest_prices["coinbase"] - latest_prices["binance"]
        spread_pct = (price_gap / latest_prices["binance"]) * 100
    
    # Calculate total profit
    total_profit = sum(trade["profit"] for trade in trade_log)
    
    # Calculate last trade time
    last_trade_time = trade_log[-1]["time"] if trade_log else None
    
    return {
        "binance_price": latest_prices["binance"],
        "coinbase_price": latest_prices["coinbase"],
        "price_gap": price_gap,
        "spread_percentage": spread_pct,
        "trades_executed": len(trade_log),
        "total_profit": total_profit,
        "last_trade_time": last_trade_time,
        "binance_last_update": last_update["binance"],
        "coinbase_last_update": last_update["coinbase"]
    }

def get_trades(limit: int = 50):
    """
    Get trade history
    
    Args:
        limit: Maximum number of trades to return
    
    Returns:
        List of trade records
    """
    return trade_log[-limit:] if limit > 0 else trade_log
