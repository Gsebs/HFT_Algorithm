import asyncio
import logging
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.streams import start_streams
from app.strategy import arbitrage_strategy, get_status, get_trades
from app.utils.config import CORS_ORIGINS

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="HFT Arbitrage API",
    description="API for HFT arbitrage simulation between Binance and Coinbase",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-a0m52zi4b-gsebs-projects.vercel.app",  # Production URL
        "http://localhost:3000",  # Local development URL
        "*"  # Allow all origins temporarily for debugging
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """
    Start background tasks on application startup
    """
    logger.info("Starting application background tasks")
    
    # Start WebSocket streams in the background
    asyncio.create_task(start_streams())
    
    # Start arbitrage strategy in the background
    asyncio.create_task(arbitrage_strategy())
    
    logger.info("Application started successfully")

@app.get("/")
async def root():
    """
    Root endpoint for health check
    """
    return {"status": "ok", "message": "HFT Arbitrage API is running"}

@app.get("/status")
async def status():
    """
    Get current system status
    """
    return get_status()

@app.get("/trades")
async def trades(limit: int = Query(50, ge=1, le=1000)):
    """
    Get trade history
    
    Args:
        limit: Maximum number of trades to return (1-1000)
    """
    return get_trades(limit)

@app.get("/health")
async def health():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

# If running this file directly
if __name__ == "__main__":
    import uvicorn
    from app.utils.config import API_HOST, API_PORT
    
    uvicorn.run("app.main:app", host=API_HOST, port=API_PORT, reload=True)
