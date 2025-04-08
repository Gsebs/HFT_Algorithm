# HFT Latency Arbitrage Trading Simulation

A full-stack application that simulates high-frequency trading (HFT) latency arbitrage between cryptocurrency exchanges (Binance and Coinbase).

## Overview

This project simulates a high-frequency trading system that exploits price differences between Binance and Coinbase cryptocurrency exchanges. It includes:

1. **Data Collection**: Gathers historical tick-level data from both exchanges
2. **ML Model**: Predicts profitable arbitrage opportunities based on price gaps and other features
3. **Async Backend**: FastAPI server that connects to exchange WebSocket feeds and simulates trades
4. **Real-time Dashboard**: Next.js frontend to visualize live prices, arbitrage opportunities, and trade execution

The system accounts for realistic trading conditions including network latency, slippage, and exchange fees to accurately simulate real-world trading scenarios.

## System Architecture

![Architecture Diagram](https://via.placeholder.com/800x400?text=System+Architecture+Diagram)

### Components

- **Data Pipeline**: Collects and processes historical price data from both exchanges
- **ML Training**: XGBoost model trained to identify profitable arbitrage opportunities
- **FastAPI Backend**: 
  - WebSocket connections to exchange data feeds
  - Real-time arbitrage detection algorithm
  - Trade simulation with configurable parameters
  - REST API endpoints for the frontend
- **Next.js Frontend**: 
  - Live price display for both exchanges
  - Spread visualization and opportunity detection
  - Trade history and profit/loss tracking
  - Performance metrics dashboard

## Features

- **Real-time Data Processing**: Connects to exchange WebSockets for live market data
- **ML-based Prediction**: Uses a trained model to predict profitable opportunities
- **Configurable Simulation**: Adjustable parameters for latency, slippage, and fees
- **Trade Execution Simulation**: Simulates buy/sell across exchanges with realistic conditions
- **Performance Tracking**: Monitors and displays trade history, profit/loss, and key metrics
- **Responsive Dashboard**: Real-time visualization of all trading activities

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+
- Binance and Coinbase API keys (for authenticated endpoints)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file:
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys and configuration
   ```

5. Create directories for data and models:
   ```bash
   mkdir -p data/datasets models
   ```

6. Collect historical data:
   ```bash
   python -m data.collector
   ```

7. Train the ML model:
   ```bash
   python -m ml.train
   ```

8. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env.local file:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your backend API URL
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Configuration

### Backend Configuration

Major configuration options in `.env`:

- `USE_TESTNET`: Set to "true" to use exchange testnet/sandbox environments
- `TRADING_PAIR`: The trading pair to monitor (e.g., "BTC-USD")
- `BINANCE_SYMBOL`: The symbol format for Binance (e.g., "BTCUSDT")
- `TRADE_AMOUNT`: Amount of cryptocurrency to trade in each arbitrage
- `BINANCE_FEE`/`COINBASE_FEE`: Exchange fee rates
- `SIMULATED_LATENCY`: Network latency to simulate (in seconds)
- `SLIPPAGE_RATE`: Price slippage to simulate

### Frontend Configuration

Configuration in `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL`: URL of the backend API

## Project Structure

```
arb-bot-project/
├── backend/               # FastAPI backend
│   ├── app/               # Application code
│   │   ├── main.py        # FastAPI entry point
│   │   ├── streams.py     # Exchange WebSocket connections
│   │   ├── strategy.py    # Arbitrage strategy and simulation
│   │   └── models/        # ML model code
│   ├── data/              # Data collection scripts
│   ├── ml/                # Model training code
│   └── models/            # Saved ML models
└── frontend/              # Next.js frontend
    ├── public/            # Static assets
    ├── src/               # Source code
    │   ├── components/    # React components
    │   ├── pages/         # Next.js pages
    │   ├── styles/        # CSS styles
    │   └── utils/         # Utility functions
    └── .env.local         # Environment variables
```

## Technology Stack

- **Backend**:
  - Python 3.10+
  - FastAPI
  - WebSockets
  - XGBoost
  - Pandas
  - NumPy

- **Frontend**:
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  - SWR for data fetching
  - Recharts for visualizations

## Limitations

- This is a simulation and does not execute real trades
- Performance depends on the quality of the ML model and historical data
- Market conditions change rapidly; model retraining is necessary for accuracy
- The simulation assumes perfect execution (all orders filled at simulated prices)

## Future Improvements

- Add support for multiple trading pairs
- Implement backtesting with historical data
- Add more advanced ML models or ensemble methods
- Integrate order book data for more accurate slippage simulation
- Add testnet trade execution for end-to-end validation
- Implement risk management algorithms

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is for educational and research purposes only. It is not intended for use in actual trading of securities or cryptocurrencies. The authors take no responsibility for financial losses incurred from using this software for real trading.
