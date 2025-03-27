import os
import sys
import glob
import logging
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import xgboost as xgb
import matplotlib.pyplot as plt

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_data(data_path=None):
    """
    Load data from CSV file or directory
    
    Args:
        data_path: Path to CSV file or directory with CSV files
        
    Returns:
        DataFrame with loaded data
    """
    if data_path is None:
        # Look in the default datasets directory
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "datasets")
        data_files = glob.glob(os.path.join(data_dir, "arbitrage_data_*.csv"))
        
        if not data_files:
            logger.error(f"No data files found in {data_dir}")
            return None
            
        # Get the most recent file
        data_path = max(data_files, key=os.path.getctime)
    
    logger.info(f"Loading data from {data_path}")
    
    try:
        if os.path.isdir(data_path):
            # Load all CSV files in directory
            data_files = glob.glob(os.path.join(data_path, "*.csv"))
            dfs = [pd.read_csv(file) for file in data_files]
            df = pd.concat(dfs, ignore_index=True)
        else:
            # Load single CSV file
            df = pd.read_csv(data_path)
            
        logger.info(f"Loaded {len(df)} rows of data")
        return df
        
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        return None

def prepare_features(df):
    """
    Prepare features for model training
    
    Args:
        df: DataFrame with arbitrage data
        
    Returns:
        X: Feature DataFrame
        y: Label Series
    """
    logger.info("Preparing features for model training")
    
    # Select feature columns
    feature_columns = [
        'spread_pct', 
        'spread_ma_5', 'spread_std_5', 'spread_trend_5',
        'spread_ma_10', 'spread_std_10', 'spread_trend_10',
        'spread_ma_20', 'spread_std_20', 'spread_trend_20'
    ]
    
    # Drop any rows with NaN values
    df = df.dropna(subset=feature_columns + ['label'])
    
    # Extract features and label
    X = df[feature_columns]
    y = df['label']
    
    logger.info(f"Prepared {len(X)} samples with {len(feature_columns)} features")
    
    return X, y

def train_xgboost_model(X, y, test_size=0.2, random_state=42):
    """
    Train an XGBoost model
    
    Args:
        X: Feature DataFrame
        y: Label Series
        test_size: Proportion of data to use for testing
        random_state: Random seed
        
    Returns:
        Trained model, test features, test labels
    """
    logger.info("Training XGBoost model")
    
    # Split data into training and testing sets
    # Use time-based split (not random) since this is time series data
    train_idx = int(len(X) * (1 - test_size))
    X_train, X_test = X.iloc[:train_idx], X.iloc[train_idx:]
    y_train, y_test = y.iloc[:train_idx], y.iloc[train_idx:]
    
    # Define model parameters
    params = {
        'objective': 'binary:logistic',
        'max_depth': 5,
        'learning_rate': 0.1,
        'n_estimators': 100,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'gamma': 0.1,
        'random_state': random_state
    }
    
    # Create and train model
    model = xgb.XGBClassifier(**params)
    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        eval_metric='auc',
        verbose=True
    )
    
    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    logger.info(f"Model performance:")
    logger.info(f"  Accuracy:  {accuracy:.4f}")
    logger.info(f"  Precision: {precision:.4f}")
    logger.info(f"  Recall:    {recall:.4f}")
    logger.info(f"  F1 Score:  {f1:.4f}")
    
    # Get confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    logger.info(f"Confusion Matrix:")
    logger.info(f"  True Negatives:  {cm[0][0]}")
    logger.info(f"  False Positives: {cm[0][1]}")
    logger.info(f"  False Negatives: {cm[1][0]}")
    logger.info(f"  True Positives:  {cm[1][1]}")
    
    return model, X_test, y_test

def plot_feature_importance(model, feature_names):
    """
    Plot feature importance
    
    Args:
        model: Trained XGBoost model
        feature_names: List of feature names
    """
    # Get feature importance
    importance = model.feature_importances_
    
    # Sort features by importance
    indices = np.argsort(importance)[::-1]
    
    # Plot
    plt.figure(figsize=(10, 6))
    plt.title("Feature Importance")
    plt.bar(range(len(indices)), importance[indices], align="center")
    plt.xticks(range(len(indices)), [feature_names[i] for i in indices], rotation=90)
    plt.tight_layout()
    
    # Save plot
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "plots")
    os.makedirs(output_dir, exist_ok=True)
    plt.savefig(os.path.join(output_dir, "feature_importance.png"))
    
    logger.info(f"Feature importance plot saved to {output_dir}/feature_importance.png")

def save_model(model, filename=None):
    """
    Save trained model to file
    
    Args:
        model: Trained model
        filename: Output filename
        
    Returns:
        Path to saved model
    """
    if filename is None:
        # Create default filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"arb_model_{timestamp}.pkl"
    
    # Ensure models directory exists
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Full path to model file
    model_path = os.path.join(models_dir, filename)
    
    # Save model
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    logger.info(f"Model saved to {model_path}")
    
    # Also save to the default location
    default_path = os.path.join(models_dir, "arb_model.pkl")
    with open(default_path, 'wb') as f:
        pickle.dump(model, f)
    
    logger.info(f"Model also saved to default location: {default_path}")
    
    return model_path

def train_model():
    """
    Main function to load data, train model, and save it
    
    Returns:
        Path to saved model
    """
    # Load data
    df = load_data()
    if df is None:
        logger.error("Failed to load data. Exiting.")
        return None
    
    # Prepare features
    X, y = prepare_features(df)
    
    # Train model
    model, X_test, y_test = train_xgboost_model(X, y)
    
    # Plot feature importance
    plot_feature_importance(model, X.columns)
    
    # Save model
    model_path = save_model(model)
    
    return model_path

if __name__ == "__main__":
    train_model()
