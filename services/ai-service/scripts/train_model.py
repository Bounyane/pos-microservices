"""
scripts/train_model.py — Trains a Random Forest churn-prediction model and
saves it as a .pkl file that the AI Model Service loads at startup.

Usage:
    python scripts/train_model.py               # uses generated synthetic data
    python scripts/train_model.py --data path/to/data.csv

The model predicts P(churn) for a customer based on 10 behavioural and
transactional features.  The cashback engine then converts this probability
into a percentage reward using the loyalty formula in cashback_servicer.py.

Features (in order):
    0  time_last_transaction   — days since last transaction
    1  time_last_login         — days since last app login
    2  quantity                — number of items in the order
    3  price                   — total order price
    4  balance                 — customer wallet balance
    5  has_wallet              — binary: 1=yes, 0=no
    6  vat_type                — categorical: VAT category code
    7  vat_percentage          — VAT rate applied
    8  store_type              — categorical: store type code
    9  operating_hours         — store daily operating hours
"""

import os
import argparse
import pickle
import logging

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    confusion_matrix,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train_model")

# Output path
MODEL_DIR  = os.environ.get("MODEL_DIR",  "models")
MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(MODEL_DIR, "random_forest_model.pkl"))

FEATURE_NAMES = [
    "time_last_transaction",
    "time_last_login",
    "quantity",
    "price",
    "balance",
    "has_wallet",
    "vat_type",
    "vat_percentage",
    "store_type",
    "operating_hours",
]


def generate_synthetic_data(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    """Generate synthetic labelled training data for demonstration."""
    rng = np.random.RandomState(random_state)

    data = pd.DataFrame({
        "time_last_transaction": rng.exponential(scale=30,  size=n_samples),   # days
        "time_last_login":       rng.exponential(scale=10,  size=n_samples),
        "quantity":              rng.randint(1, 20,          size=n_samples).astype(float),
        "price":                 rng.uniform(5, 500,         size=n_samples),
        "balance":               rng.uniform(0, 1000,        size=n_samples),
        "has_wallet":            rng.randint(0, 2,           size=n_samples),
        "vat_type":              rng.randint(0, 5,           size=n_samples),
        "vat_percentage":        rng.choice([0.0, 5.0, 10.0, 20.0], size=n_samples),
        "store_type":            rng.randint(0, 4,           size=n_samples),
        "operating_hours":       rng.uniform(6, 24,          size=n_samples),
    })

    # Churn label: customers who haven't transacted recently and have low balance
    churn_score = (
        0.4 * (data["time_last_transaction"] / 90).clip(0, 1)
        + 0.3 * (data["time_last_login"] / 30).clip(0, 1)
        + 0.2 * (1 - data["balance"] / 1000)
        + 0.1 * (1 - data["has_wallet"])
    )
    data["churn"] = (churn_score + rng.normal(0, 0.05, n_samples) > 0.5).astype(int)

    logger.info(
        f"Synthetic dataset: {n_samples} rows | "
        f"churn rate = {data['churn'].mean():.1%}"
    )
    return data


def train(data_path: str | None = None):
    # ── Load / generate data ─────────────────────────────────────────────────
    if data_path:
        logger.info(f"Loading training data from {data_path}")
        df = pd.read_csv(data_path)
    else:
        logger.info("No data file provided — generating synthetic training data …")
        df = generate_synthetic_data()

    X = df[FEATURE_NAMES].values
    y = df["churn"].values

    # ── Train / test split ───────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── Train Random Forest ──────────────────────────────────────────────────
    logger.info("Training RandomForestClassifier …")
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # ── Evaluate ─────────────────────────────────────────────────────────────
    y_pred     = clf.predict(X_test)
    y_prob     = clf.predict_proba(X_test)[:, 1]
    auc        = roc_auc_score(y_test, y_prob)

    logger.info(f"\n{classification_report(y_test, y_pred)}")
    logger.info(f"ROC-AUC: {auc:.4f}")
    logger.info(f"Confusion matrix:\n{confusion_matrix(y_test, y_pred)}")

    # ── Feature importances ──────────────────────────────────────────────────
    importances = sorted(
        zip(FEATURE_NAMES, clf.feature_importances_),
        key=lambda x: x[1], reverse=True
    )
    logger.info("Feature importances:")
    for name, imp in importances:
        logger.info(f"  {name:30s} {imp:.4f}")

    # ── Save model ───────────────────────────────────────────────────────────
    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(clf, f)
    logger.info(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Random Forest cashback model")
    parser.add_argument(
        "--data", type=str, default=None,
        help="Path to CSV training file (optional — uses synthetic data if omitted)"
    )
    args = parser.parse_args()
    train(args.data)
