# Energy Calculation API

A comprehensive FastAPI service for energy calculations, BEI (Building Energy Index) evaluation, and tariff quoting.

## Features

- **Energy Calculations**: Power, energy consumption, and cost calculations
- **Tariff Quoting**: Support for flat, tiered, and time-of-use tariffs with various charges
- **BEI Evaluation**: Building Energy Index calculation for single and mixed-use buildings
- **Catalog System**: Standard intensity data management and validation

## API Endpoints

### Health Check
- `GET /healthz` - Service health check

### Energy Calculations (`/api/v1/calc/`)
- `POST /api/v1/calc/power` - Calculate power from voltage, current, and power factor
- `POST /api/v1/calc/energy` - Calculate energy consumption from power and time  
- `POST /api/v1/calc/cost` - Calculate cost from energy consumption and tariff
- `POST /api/v1/calc/device-usage` - Aggregate energy usage from multiple devices

### Tariff Quoting (`/api/v1/tariffs/`)
- `POST /api/v1/tariffs/quote` - Generate detailed bill quote based on tariff structure

### BEI Evaluation (`/api/v1/bei/`)
- `POST /api/v1/bei/evaluate` - Evaluate Building Energy Index
- `GET /api/v1/bei/catalog/uses` - List available building use types
- `GET /api/v1/bei/catalog/uses/{use}/zones` - List climate zones for a use type
- `GET /api/v1/bei/catalog/uses/{use}/zones/{zone}` - Get standard intensity data
- `POST /api/v1/bei/catalog/validate` - Validate catalog consistency

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

3. Access the API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Usage Examples

### Power Calculation
```python
# Single-phase power calculation
{
  "voltage": 100.0,
  "current": 10.0,
  "power_factor": 0.8,
  "is_three_phase": false
}
# Result: 800W (0.8kW)
```

### Energy Calculation  
```python
# Energy from power and time
{
  "power_kw": 2.5,
  "duration_hours": 8.0
}
# Result: 20 kWh
```

### Tiered Tariff Quote
```python
{
  "tariff": {
    "type": "tiered",
    "tiers": [
      {"limit_kwh": 100, "rate_per_kwh": 20.0},
      {"limit_kwh": 200, "rate_per_kwh": 25.0},
      {"limit_kwh": null, "rate_per_kwh": 30.0}
    ],
    "basic_charge_per_month": 1000.0,
    "tax_rate": 0.1
  },
  "total_usage_kwh": 250.0
}
```

### Time-of-Use Tariff
```python
{
  "tariff": {
    "type": "tou",
    "tou_periods": [
      {"name": "peak", "rate_per_kwh": 35.0, "hours": [13,14,15,16,17,18]},
      {"name": "off-peak", "rate_per_kwh": 15.0, "hours": [0,1,2,3,4,5,6,7,8,9,10,11,12,19,20,21,22,23]}
    ],
    "demand_charge_per_kw": 1000.0,
    "tax_rate": 0.1
  },
  "usage_profile": {
    "hourly_usage": [1.0, 1.0, ...]  // 24 values
  },
  "contract": {
    "max_demand_kw": 10.0
  }
}
```

### BEI Evaluation - Single Use Building
```python
{
  "building_area_m2": 1000.0,
  "use": "office",
  "zone": "6",
  "design_energy": [
    {"category": "lighting", "value": 50.0, "unit": "kWh"},
    {"category": "cooling", "value": 100.0, "unit": "kWh"},
    {"category": "heating", "value": 30.0, "unit": "kWh"}
  ],
  "renewable_energy_deduction_mj": 500.0
}
```

### BEI Evaluation - Mixed Use Building
```python
{
  "building_area_m2": 2000.0,
  "usage_mix": [
    {"use": "office", "zone": "6", "area_share": 0.7},
    {"use": "hotel", "zone": "6", "area_share": 0.3}
  ],
  "design_energy": [
    {"category": "lighting", "value": 200.0, "unit": "kWh"},
    {"category": "cooling", "value": 300.0, "unit": "kWh"}
  ],
  "bei_round_digits": 3,
  "compliance_threshold": 1.0
}
```

## Testing

Run tests:
```bash
PYTHONPATH=. pytest
```

Run tests with coverage:
```bash
PYTHONPATH=. pytest --cov=app tests/
```

## Configuration

Environment variables (`.env` file):
- `ENV`: deployment environment
- `SECRET_KEY`: JWT signing key
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `DEFAULT_TARIFF_PER_KWH`: Default electricity tariff rate

You can copy `.env.example` to `.env` and adjust the values as needed.
## Key Features

### Tariff System
- **Flat Rate**: Simple per-kWh pricing
- **Tiered Rate**: Progressive pricing with usage tiers
- **Time-of-Use**: Different rates for different hours
- **Comprehensive Charges**: Basic charges, renewable levies, fuel adjustments, demand charges, taxes

### BEI Calculation
- **Single Use**: Standard building types (office, hotel, retail, school)
- **Mixed Use**: Area-weighted combination of multiple use types
- **Flexible Energy Units**: Supports electricity (kWh), gas (m³), oil (L), etc.
- **Renewable Deduction**: Solar panel and other renewable energy credits
- **Catalog Integration**: Standard intensity data with validation

### Energy Calculations
- **Power Calculation**: Single-phase and three-phase electrical power
- **Energy Consumption**: Power × time calculations
- **Cost Estimation**: Energy cost with taxes and fixed fees
- **Device Aggregation**: Multi-device energy usage summation

## Architecture

- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation and serialization
- **YAML**: Configuration and data storage
- **Pytest**: Comprehensive testing framework

## Docker Deployment

Build and run with Docker:
```bash
docker build -t energy-calc-api .
docker run -p 8000:8000 energy-calc-api
```