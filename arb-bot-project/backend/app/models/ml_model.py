import xgboost as xgb
import numpy as np
from pathlib import Path
import os
from collections import deque

# Initialize the model as None
arbitrage_model = None

# Keep track of recent spreads for prediction
spread_history = deque(maxlen=10)

def create_dummy_model():
    """Create a dummy XGBoost model for testing."""
    model = xgb.XGBClassifier(
        n_estimators=10,
        max_depth=3,
        learning_rate=0.1,
        objective='binary:logistic'
    )
    
    # Create dummy data that resembles our spread history
    n_samples = 1000
    n_features = 10  # Same as our spread_history maxlen
    
    # Generate random spread data between -1% and 1%
    X = np.random.uniform(-1, 1, (n_samples, n_features))
    
    # Generate labels: 1 if mean spread > 0.1%, 0 otherwise
    y = (X.mean(axis=1) > 0.1).astype(int)
    
    # Fit the model
    model.fit(X, y)
    return model

def load_model():
    """Load the trained XGBoost model from the models directory."""
    global arbitrage_model
    try:
        model_path = Path(os.getenv('MODEL_PATH', 'models/arbitrage_model.json'))
        if model_path.exists() and model_path.stat().st_size > 0:
            arbitrage_model = xgb.XGBClassifier()
            arbitrage_model.load_model(str(model_path))
            return True
        else:
            print(f"Model file not found or empty at {model_path}, creating dummy model")
            arbitrage_model = create_dummy_model()
            model_path.parent.mkdir(parents=True, exist_ok=True)
            arbitrage_model.save_model(str(model_path))
            return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def update_spreads(spread):
    """Update the spread history with a new spread value."""
    spread_history.append(spread)

def predict():
    """Predict if there's an arbitrage opportunity based on recent spreads."""
    global arbitrage_model
    if arbitrage_model is None:
        if not load_model():
            return None
    
    try:
        if len(spread_history) < spread_history.maxlen:
            return None
        
        # Create features from spread history
        features = np.array(list(spread_history)).reshape(1, -1)
        
        # Make prediction
        try:
            prediction = arbitrage_model.predict(features)[0]
            probability = arbitrage_model.predict_proba(features)[0][1]
            return bool(prediction), float(probability)
        except xgb.core.XGBoostError as e:
            print(f"XGBoost prediction error: {e}")
            return None
    except Exception as e:
        print(f"Error making prediction: {e}")
        return None

# Load the model when the module is imported
load_model()
