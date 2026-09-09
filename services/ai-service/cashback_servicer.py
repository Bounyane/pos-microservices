"""
cashback_servicer.py — gRPC servicer implementation.

Loads the pre-trained Random Forest model from MODEL_PATH and
implements the GetCashback RPC.  The cashback formula is:

    churn_prob  = model.predict_proba(features)[0][1]
    loyalty     = 1 - churn_prob
    cashback    = C_min + (C_max - C_min) * (alpha * loyalty) ** gamma

where (alpha, gamma, C_min, C_max) = (0.7, 2, 1.0, 10.0)
"""

import os
import logging
import pickle

import grpc
import cashback_pb2
import cashback_pb2_grpc

logger = logging.getLogger("ai-model.servicer")

# ─── Model loading ────────────────────────────────────────────────────────────
MODEL_PATH = os.environ.get("MODEL_PATH", "models/random_forest_model.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    logger.info(f"Random Forest model loaded from {MODEL_PATH}")
except FileNotFoundError:
    logger.warning(
        f"Model file not found at '{MODEL_PATH}'. "
        "Run scripts/train_model.py first, or set MODEL_PATH correctly."
    )
    model = None


# ─── Servicer ─────────────────────────────────────────────────────────────────
class CashbackServicer(cashback_pb2_grpc.CashbackServiceServicer):
    """
    Implements CashbackService.GetCashback.

    Input features (from CashbackRequest):
        time_last_transaction  — days since last transaction
        time_last_login        — days since last app login
        quantity               — number of items in the order
        price                  — total order price
        balance                — customer wallet balance
        has_wallet             — 1 = has wallet, 0 = no wallet
        vat_type               — VAT category code (int)
        vat_percentage         — VAT rate applied
        store_type             — store category code (int)
        operating_hours        — store daily operating hours
    """

    # Cashback formula hyper-parameters
    ALPHA   = 0.7
    GAMMA   = 2
    C_MIN   = 1.0
    C_MAX   = 10.0

    def GetCashback(self, request, context):
        if model is None:
            logger.error("Model not loaded — cannot compute cashback.")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("Model not loaded. Contact administrator.")
            return cashback_pb2.CashbackResponse()

        features = [
            request.time_last_transaction,
            request.quantity,
            request.price,
            request.balance,
            request.has_wallet,
            request.vat_type,
            request.vat_percentage,
            request.store_type,
            request.operating_hours,
        ]


        try:
            churn_prob = model.predict_proba([features])[0][1]
        except Exception as exc:
            logger.error(f"Model prediction error: {exc}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Prediction error: {exc}")
            return cashback_pb2.CashbackResponse()
        loyalty = 1 - churn_prob   

        cashback = (
            self.C_MIN
            + (self.C_MAX - self.C_MIN)
            * (self.ALPHA * loyalty) ** self.GAMMA
        )
        cashback_pct = round(cashback, 2)

        return cashback_pb2.CashbackResponse(
            cashback=cashback_pct,            # legacy field
            cashback_percentage=cashback_pct, # new named field
        )
