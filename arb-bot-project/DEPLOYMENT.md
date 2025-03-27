# Deployment Instructions

This document provides step-by-step instructions on how to deploy the HFT Arbitrage Trading Simulation system.

## Overview

The system consists of two main components:

1. **Backend (FastAPI)**: Deployed on a cloud provider like Fly.io, Railway, or Render
2. **Frontend (Next.js)**: Deployed on Vercel

## Prerequisites

Before deploying, make sure you have:

- Git repository set up
- Node.js and npm installed
- Python 3.10+ installed
- Accounts on:
  - Vercel (for frontend)
  - Fly.io, Railway, or Render (for backend)
- API keys for Binance and Coinbase (if using authenticated endpoints)

## Backend Deployment

### Option 1: Deploy on Fly.io

1. **Install Fly CLI**:
   ```bash
   # Install Fly CLI
   curl -L https://fly.io/install.sh | sh
   
   # Log in to your Fly account
   fly auth login
   ```

2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

3. **Create a .env file**:
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys and other settings
   ```

4. **Initialize Fly app**:
   ```bash
   fly launch
   ```
   - Choose an app name (e.g., `hft-arbitrage-api`)
   - Select a region close to exchange servers for low latency:
     - US East (Virginia) is good for Coinbase proximity
     - Tokyo (if available) is good for Binance proximity
   - Choose to deploy a single instance

5. **Set secrets for environment variables**:
   ```bash
   fly secrets set BINANCE_API_KEY=your_key BINANCE_API_SECRET=your_secret COINBASE_API_KEY=your_key
   ```

6. **Deploy the app**:
   ```bash
   fly deploy
   ```

7. **Get your API URL**:
   ```bash
   fly status
   ```
   Note the URL (e.g., `https://hft-arbitrage-api.fly.dev`) for frontend configuration.

### Option 2: Deploy on Render

1. **Create a new Web Service on Render**:
   - Connect to your GitHub repository
   - Select the backend directory
   - Choose "Python" as the environment
   - Set the Build Command: `pip install -r requirements.txt`
   - Set the Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Configure environment variables**:
   - Add all variables from `.env.example` with your values

3. **Deploy the service**:
   - Choose "Yes" for Auto-Deploy
   - Select a region close to exchange servers
   - Choose an instance type (at least 0.5 CPU / 512 MB RAM)

4. **Note your service URL**:
   - It will look like `https://hft-arbitrage-api.onrender.com`

### Option 3: Deploy on Railway

1. **Create a new project on Railway**:
   - Connect to your GitHub repository
   - Select the backend directory

2. **Configure deployment**:
   - Set the Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Add environment variables**:
   - Add all variables from `.env.example` with your values

4. **Deploy and get your URL**:
   - Railway will automatically build and deploy your app
   - Note the generated URL for frontend configuration

## Frontend Deployment on Vercel

1. **Create .env.local file**:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with your backend API URL
   ```

2. **Push your code to your Git repository**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

3. **Import your project on Vercel**:
   - Log in to Vercel (https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Select the frontend directory as the root

4. **Configure project settings**:
   - Framework preset: Next.js
   - Add environment variables:
     - `NEXT_PUBLIC_API_BASE_URL`: Your backend API URL (e.g., `https://hft-arbitrage-api.fly.dev`)

5. **Deploy the project**:
   - Click "Deploy"
   - Vercel will build and deploy your Next.js app

6. **Access your dashboard**:
   - Once deployment is complete, Vercel will provide a URL (e.g., `https://hft-arbitrage-dashboard.vercel.app`)

## Initial Setup - Data Collection and Model Training

Before your arbitrage system will work properly, you need to collect data and train the ML model:

1. **SSH into your backend server** (or use your local development environment):
   ```bash
   # If using Fly.io:
   fly ssh console -a your-app-name
   ```

2. **Run the data collection script**:
   ```bash
   cd /app
   python -m data.collector
   ```
   This will fetch historical data from Binance and Coinbase.

3. **Train the ML model**:
   ```bash
   python -m ml.train
   ```
   This will create a trained model file at `models/arb_model.pkl`.

4. **Restart the backend service** (if needed):
   ```bash
   # If using Fly.io:
   fly restart
   ```

## Updating the Deployment

### Backend Updates

1. **Push your code changes**:
   ```bash
   git add .
   git commit -m "Update backend code"
   git push
   ```

2. **Redeploy**:
   ```bash
   # If using Fly.io:
   cd backend
   fly deploy
   
   # If using Render or Railway:
   # Automatic redeployment should occur on code push
   ```

### Frontend Updates

1. **Push your code changes**:
   ```bash
   git add .
   git commit -m "Update frontend code"
   git push
   ```

2. **Vercel will automatically redeploy** when changes are pushed to your repository.

## CORS Configuration

If you encounter CORS issues:

1. **Update the backend configuration**:
   - Edit `backend/app/utils/config.py`
   - Set `CORS_ORIGINS` to include your frontend URL:
     ```python
     CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://your-frontend-url.vercel.app")
     ```

2. **Redeploy the backend**:
   ```bash
   cd backend
   fly deploy
   ```

## Troubleshooting

- **Backend not receiving data**: Check API keys and that WebSocket connections are established
- **Frontend not updating**: Check that the backend URL is correct in environment variables
- **Model prediction issues**: You may need to retrain the model with more recent data

## Maintenance

- **Model retraining**: Schedule periodic retraining to adapt to changing market conditions
- **API key rotation**: Update your API keys periodically for security
- **Monitoring**: Check the backend logs for any connection issues or errors
