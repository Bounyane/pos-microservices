# =============================================================================
#  AI Model Service — Dockerfile
#  Python 3.11 slim image
#  Build order:
#    1. Install dependencies
#    2. Generate gRPC stubs from cashback.proto
#    3. Train the model (if no model file is mounted)
#    4. Start the gRPC server
# =============================================================================
FROM python:3.11-slim

WORKDIR /app

# ── System dependencies ────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ────────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application source ─────────────────────────────────────────────────────────
COPY . .

# ── Generate gRPC Python stubs from the proto file ────────────────────────────
RUN python -m grpc_tools.protoc \
        -I. \
        --python_out=. \
        --grpc_python_out=. \
        cashback.proto

# ── Train the model if no pre-trained model is present ───────────────────────
# (In production, mount a pre-trained model via a volume instead)
RUN mkdir -p models && \
    [ -f models/random_forest_model.pkl ] || \
    python scripts/train_model.py

# ── Expose gRPC port ──────────────────────────────────────────────────────────
EXPOSE 50053

# ── Health check ──────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD python -c "import grpc; ch = grpc.insecure_channel('localhost:50053'); grpc.channel_ready_future(ch).result(timeout=5)" || exit 1

# ── Start server ──────────────────────────────────────────────────────────────
CMD ["python", "main.py"]
