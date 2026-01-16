
import requests
import sys

API_URL = "http://localhost:8000"

def test_endpoint(name, url, method="GET", expected_status=200):
    try:
        response = requests.request(method, url)
        # We accept 401 or 422 as proof that endpoint exists and is protected
        # 404 would mean it's missing (FAIL)
        if response.status_code in [expected_status, 401, 403, 422]:
           print(f"[PASS] {name}: Got {response.status_code}")
        else:
           print(f"[FAIL] {name}: Expected {expected_status}, Got {response.status_code}. Content: {response.text[:100]}")
    except Exception as e:
        print(f"[ERROR] {name}: {e}")

print("--- Mission 4 Verification ---")

# Verify Process Gen Endpoint exists
test_endpoint("Process Generate", f"{API_URL}/v1/process/generate", method="POST", expected_status=401)

print("--- End Verification ---")
