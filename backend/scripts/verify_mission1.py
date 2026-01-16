
import requests
import sys

API_URL = "http://localhost:8000"

def test_endpoint(name, url, method="GET", expected_status=200):
    try:
        response = requests.request(method, url)
        if response.status_code == expected_status:
           print(f"[PASS] {name}: Got {response.status_code}")
        else:
           print(f"[FAIL] {name}: Expected {expected_status}, Got {response.status_code}. Content: {response.text[:100]}")
    except Exception as e:
        print(f"[ERROR] {name}: {e}")

print("--- Mission 1 Verification ---")

# 1. Health Check
test_endpoint("Backend Health", f"{API_URL}/health", expected_status=200)

# 2. Public Endpoints (if any, e.g. Swagger)
test_endpoint("Swagger UI", f"{API_URL}/docs", expected_status=200)

# 3. Secure Endpoints (Should be 401 or 403 without token)
test_endpoint("System Users (No Token)", f"{API_URL}/v1/system/users", expected_status=401)
test_endpoint("System Tenants (No Token)", f"{API_URL}/v1/system/tenants", expected_status=401)
test_endpoint("System Keys (No Token)", f"{API_URL}/v1/system/keys?tenant_id=123", expected_status=401)

print("--- End Verification ---")
