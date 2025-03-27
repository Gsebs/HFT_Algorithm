import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Exchange API configurations
BINANCE_API_KEY = os.getenv("BINANCE_API_KEY", "")
BINANCE_API_SECRET = os.getenv("BINANCE_API_SECRET", "")
COINBASE_API_KEY = os.getenv("COINBASE_API_KEY", "")
COINBASE_API_SECRET = os.getenv("COINBASE_API_SECRET", "")
COINBASE_API_PASSPHRASE = os.getenv("COINBASE_API_PASSPHRASE", "")

# Toggle between testnet and mainnet
USE_TESTNET = os.getenv("USE_TESTNET", "false").lower() == "true"

# WebSocket URLs
BINANCE_WS_URL = "wss://testnet.binance.vision/ws" if USE_TESTNET else "wss://stream.binance.com:9443/ws"
COINBASE_WS_URL = "wss://ws-feed-public.sandbox.exchange.coinbase.com" if USE_TESTNET else "wss://ws-feed.exchange.coinbase.com"

# Trading parameters
TRADING_PAIR = os.getenv("TRADING_PAIR", "BTC-USD")  # Coinbase format
BINANCE_SYMBOL = os.getenv("BINANCE_SYMBOL", "BTCUSDT")  # Binance format
TRADE_AMOUNT = float(os.getenv("TRADE_AMOUNT", "0.001"))  # Amount of BTC to trade in each arbitrage

# Trading fees (as percentages)
BINANCE_FEE = float(os.getenv("BINANCE_FEE", "0.001"))  # 0.1% default
COINBASE_FEE = float(os.getenv("COINBASE_FEE", "0.005"))  # 0.5% default

# Simulation parameters
SIMULATED_LATENCY = float(os.getenv("SIMULATED_LATENCY", "0.05"))  # 50ms default
SLIPPAGE_RATE = float(os.getenv("SLIPPAGE_RATE", "0.0005"))  # 0.05% default

# Model file path
MODEL_PATH = os.getenv("MODEL_PATH", "models/arb_model.pkl")

# CORS settings
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# API configurations
API_PORT = int(os.getenv("API_PORT", "8000"))
API_HOST = os.getenv("API_HOST", "0.0.0.0")
