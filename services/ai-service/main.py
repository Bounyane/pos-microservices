"""
main.py — gRPC server entry point for the Python AI Model Service.
Loads the trained Random Forest model and serves cashback predictions
over gRPC on GRPC_PORT (default: 50053).
"""

import os
import sys
import logging
import signal
import grpc
from concurrent import futures

# gRPC generated files (produced by grpc_tools.protoc)
import cashback_pb2
import cashback_pb2_grpc

from cashback_servicer import CashbackServicer

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("ai-model")

# ─── Config ───────────────────────────────────────────────────────────────────
GRPC_PORT   = int(os.environ.get("GRPC_PORT", 50053))
MAX_WORKERS = int(os.environ.get("MAX_WORKERS", 10))


def serve():
    """Start the gRPC server and block until terminated."""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=MAX_WORKERS))

    # Register the CashbackService implementation
    cashback_pb2_grpc.add_CashbackServiceServicer_to_server(
        CashbackServicer(), server
    )

    server.add_insecure_port(f"0.0.0.0:{GRPC_PORT}")
    server.start()
    logger.info(f"AI Model gRPC server started on port {GRPC_PORT}")

    # Graceful shutdown on SIGTERM / SIGINT
    def shutdown(signum, frame):
        logger.info("Shutdown signal received — stopping gRPC server …")
        server.stop(grace=5)
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT,  shutdown)

    server.wait_for_termination()


if __name__ == "__main__":
    serve()
