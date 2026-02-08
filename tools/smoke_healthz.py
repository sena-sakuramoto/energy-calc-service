import threading
import time
import requests
from uvicorn import Config, Server


def main():
    config = Config('app.main:app', host='127.0.0.1', port=8000, log_level='warning')
    server = Server(config)

    th = threading.Thread(target=server.run, daemon=True)
    th.start()

    # Wait for startup and ping /healthz
    ok = False
    for _ in range(50):
        try:
            r = requests.get('http://127.0.0.1:8000/healthz', timeout=0.5)
            print('HEALTHZ:', r.status_code, r.json())
            ok = True
            break
        except Exception:
            time.sleep(0.2)

    if not ok:
        print('HEALTHZ: timeout waiting for server')

    # Shutdown server
    server.should_exit = True
    th.join(timeout=5)
    print('SERVER: stopped')


if __name__ == '__main__':
    main()

