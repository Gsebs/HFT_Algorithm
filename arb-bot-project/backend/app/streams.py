import json
import asyncio
import logging
import websockets
from typing import Dict, Any, Optional
from websockets.exceptions import ConnectionClosed

from app.utils.config import (
    BINANCE_WS_URL,
    COINBASE_WS_URL,
    TRADING_PAIR,
    BINANCE_SYMBOL
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global variables to store latest prices
latest_prices: Dict[str, Optional[float]] = {
    "binance": None,
    "coinbase": None,
}

# Timestamp of last update
last_update: Dict[str, Optional[float]] = {
    "binance": None,
    "coinbase": None,
}

async def connect_binance():
    """
    Connect to Binance WebSocket and continuously receive ticker updates
    """
    uri = f"{BINANCE_WS_URL}/{BINANCE_SYMBOL.lower()}@bookTicker"
    
    reconnect_delay = 1.0  # Start with 1 second delay
    max_reconnect_delay = 60.0  # Maximum reconnect delay of 60 seconds
    
    while True:
        try:
            logger.info(f"Connecting to Binance WebSocket: {uri}")
            async with websockets.connect(uri) as ws:
                logger.info("Connected to Binance WebSocket")
                reconnect_delay = 1.0  # Reset delay on successful connection
                
                async for message in ws:
                    try:
                        data = json.loads(message)
                        # Extract the ask price (price to buy on Binance)
                        best_ask = float(data.get('a', 0))
                        if best_ask > 0:
                            latest_prices["binance"] = best_ask
                            last_update["binance"] = asyncio.get_event_loop().time()
                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse Binance message: {message}")
                    except Exception as e:
                        logger.error(f"Error processing Binance message: {str(e)}")
                        
        except ConnectionClosed:
            logger.warning("Binance WebSocket connection closed. Reconnecting...")
        except Exception as e:
            logger.error(f"Binance WebSocket error: {str(e)}")
        
        # Exponential backoff for reconnection
        logger.info(f"Reconnecting to Binance in {reconnect_delay} seconds...")
        await asyncio.sleep(reconnect_delay)
        reconnect_delay = min(reconnect_delay * 1.5, max_reconnect_delay)

async def connect_coinbase():
    """
    Connect to Coinbase WebSocket and continuously receive ticker updates
    """
    uri = COINBASE_WS_URL
    
    reconnect_delay = 1.0
    max_reconnect_delay = 60.0
    
    while True:
        try:
            logger.info(f"Connecting to Coinbase WebSocket: {uri}")
            async with websockets.connect(uri) as ws:
                logger.info("Connected to Coinbase WebSocket")
                reconnect_delay = 1.0  # Reset delay on successful connection
                
                # Subscribe to ticker channel
                subscribe_message = {
                    "type": "subscribe",
                    "product_ids": [TRADING_PAIR],
                    "channels": ["ticker"]
                }
                await ws.send(json.dumps(subscribe_message))
                
                async for message in ws:
                    try:
                        data = json.loads(message)
                        if data.get("type") == "ticker":
                            # Get the price from the ticker (last trade price)
                            price = float(data.get("price", 0))
                            if price > 0:
                                latest_prices["coinbase"] = price
                                last_update["coinbase"] = asyncio.get_event_loop().time()
                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse Coinbase message: {message}")
                    except Exception as e:
                        logger.error(f"Error processing Coinbase message: {str(e)}")
        
        except ConnectionClosed:
            logger.warning("Coinbase WebSocket connection closed. Reconnecting...")
        except Exception as e:
            logger.error(f"Coinbase WebSocket error: {str(e)}")
        
        # Exponential backoff for reconnection
        logger.info(f"Reconnecting to Coinbase in {reconnect_delay} seconds...")
        await asyncio.sleep(reconnect_delay)
        reconnect_delay = min(reconnect_delay * 1.5, max_reconnect_delay)

async def start_streams():
    """
    Start both exchange streams concurrently
    """
    binance_task = asyncio.create_task(connect_binance())
    coinbase_task = asyncio.create_task(connect_coinbase())
    
    # Run both tasks concurrently
    await asyncio.gather(binance_task, coinbase_task)
