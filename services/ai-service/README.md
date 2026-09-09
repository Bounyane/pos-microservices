# AI Model Service

A Python gRPC microservice that predicts customer **cashback percentage** using a
trained **Random Forest** churn model.

## How it works

```
Transaction Service ──gRPC──► AI Model Service
                                   │
                         Random Forest (sklearn)
                         predict_proba(features)
                                   │
                           churn_prob → loyalty
                           C = C_min + (C_max - C_min) * (α·L)^γ
                                   │
                         CashbackResponse(cashback_percentage)
```

### Cashback Formula

| Symbol   | Value | Description                    |
|----------|-------|--------------------------------|
| α (alpha)| 0.7   | Loyalty weight                 |
| γ (gamma)| 2     | Curvature exponent             |
| C_min    | 1.0   | Minimum cashback %             |
| C_max    | 10.0  | Maximum cashback %             |

`C = C_min + (C_max - C_min) × (α × loyalty)^γ`  
where `loyalty = 1 − P(churn)`

### Input Features

| # | Feature                | Type  | Description                    |
|---|------------------------|-------|--------------------------------|
| 0 | time_last_transaction  | float | Days since last transaction    |
| 1 | time_last_login        | float | Days since last app login      |
| 2 | quantity               | float | Number of items in order       |
| 3 | price                  | float | Total order price              |
| 4 | balance                | float | Customer wallet balance        |
| 5 | has_wallet             | int   | 1=has wallet, 0=no wallet      |
| 6 | vat_type               | int   | VAT category code              |
| 7 | vat_percentage         | float | VAT rate applied               |
| 8 | store_type             | int   | Store category code            |
| 9 | operating_hours        | float | Store daily operating hours    |

---

## Setup

### 1. Train the model

```bash
pip install -r requirements.txt
python scripts/train_model.py          # uses synthetic data
# OR with your own CSV:
python scripts/train_model.py --data path/to/data.csv
```

The trained model is saved to `models/random_forest_model.pkl`.

### 2. Generate gRPC stubs

```bash
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. cashback.proto
```

### 3. Run locally

```bash
cp .env.example .env
python main.py
```

### 4. Run with Docker

```bash
# Build & run (model is trained inside the container on first run)
docker build -t ai-model .
docker run -p 50053:50053 ai-model

# OR mount a pre-trained model:
docker run -p 50053:50053 \
  -v $(pwd)/models:/app/models \
  -e MODEL_PATH=models/random_forest_model.pkl \
  ai-model
```

---

## Environment Variables

| Variable     | Default                              | Description                     |
|--------------|--------------------------------------|---------------------------------|
| `GRPC_PORT`  | `50053`                              | Port the gRPC server listens on |
| `MAX_WORKERS`| `10`                                 | Thread pool size                |
| `MODEL_PATH` | `models/random_forest_model.pkl`     | Path to the trained model file  |

---

## Project Structure

```
services/ai-model/
├── cashback.proto           # gRPC service & message definitions
├── cashback_pb2.py          # Generated — proto messages      (auto-generated)
├── cashback_pb2_grpc.py     # Generated — gRPC stubs          (auto-generated)
├── cashback_servicer.py     # GetCashback implementation
├── main.py                  # gRPC server entry point
├── requirements.txt         # Python dependencies
├── Dockerfile
├── .env.example
├── models/
│   └── random_forest_model.pkl   # Trained model (after running train_model.py)
└── scripts/
    └── train_model.py       # Training script (synthetic or real CSV data)
```
