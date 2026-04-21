import urllib.request
import json
import traceback

req = urllib.request.Request(
    'http://localhost:3050/api/cards/generate',
    data=json.dumps({"method": "Mandelbrot"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        code = response.getcode()
        body = response.read().decode('utf-8')
        print(f"Status: {code}")
        print(f"Body: {body[:200]}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Body: {e.read().decode('utf-8')[:200]}")
except Exception as e:
    print(f"Exception: {e}")
    traceback.print_exc()
