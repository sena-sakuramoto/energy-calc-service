from app.main import app
from fastapi.testclient import TestClient


def main():
    c = TestClient(app)
    payload = {
        "building": {"building_type": "office", "total_floor_area": 1000.0, "climate_zone": 6, "num_stories": 3},
        "envelope": {"parts": [
            {"part_name": "wall S", "part_type": "wall", "area": 150.0, "u_value": 0.35},
            {"part_name": "wall N", "part_type": "wall", "area": 150.0, "u_value": 0.35},
            {"part_name": "roof", "part_type": "roof", "area": 350.0, "u_value": 0.22},
            {"part_name": "window", "part_type": "window", "area": 50.0, "u_value": 2.3, "eta_value": 0.6}
        ]},
        "systems": {
            "heating": {"system_type": "ルームエアコン", "rated_capacity": 50.0, "efficiency": 4.0},
            "cooling": {"system_type": "ルームエアコン", "rated_capacity": 50.0, "efficiency": 3.8},
            "ventilation": {"system_type": "第3種", "air_volume": 2000.0, "power_consumption": 300.0},
            "hot_water": {"system_type": "ガス", "efficiency": 0.87},
            "lighting": {"system_type": "LED", "power_density": 8.0}
        }
    }
    r = c.post('/api/v1/compliance/calculate', json=payload)
    print('status:', r.status_code)
    print('keys:', list(r.json().keys()))
    print('overall:', r.json()['overall_compliance'])


if __name__ == '__main__':
    main()

