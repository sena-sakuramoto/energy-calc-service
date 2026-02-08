from app.main import app
from fastapi.testclient import TestClient


def main():
    c = TestClient(app)
    r = c.get('/healthz')
    print('status:', r.status_code, 'json:', r.json())


if __name__ == '__main__':
    main()

