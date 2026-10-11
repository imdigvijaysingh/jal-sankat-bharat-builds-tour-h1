import pytest
from fastapi.testclient import TestClient
from main import app, CITIES, level

client = TestClient(app)

def test_level_function():
    assert level(34) == "Low"
    assert level(35) == "Moderate"
    assert level(59) == "Moderate"
    assert level(60) == "High"
    assert level(100) == "High"

def test_assess_endpoint_fields():
    response = client.get("/api/assess/Saharanpur")
    assert response.status_code == 200
    data = response.json()
    
    # Check all expected fields are present
    expected_fields = [
        "city", "level", "score", "source", "peak_day", "peak_temp", 
        "demand", "supply", "gap", "gw", "components", "weights", 
        "days", "wards", "worst_ward", "actions", "sms_en", "sms_hi", "provenance"
    ]
    for field in expected_fields:
        assert field in data

def test_ward_ranking():
    # Saharanpur has 3 wards. We can check if they are ranked correctly by risk_pct.
    response = client.get("/api/assess/Saharanpur")
    data = response.json()
    wards = data["wards"]
    
    # Check that they are sorted by risk_pct descending
    for i in range(len(wards) - 1):
        assert wards[i]["risk_pct"] >= wards[i+1]["risk_pct"]
        
def test_scoring_math_offline_fallback():
    # We can check specific values for Saharanpur since we know offline fallback uses hardcoded temps
    # fallback: [33, 34, 35, 36, 37, 38, 36]
    # max temp = 38
    response = client.get("/api/assess/Saharanpur")
    data = response.json()
    
    if data["source"] == "offline-sample":
        assert data["peak_temp"] == 38
        # Baseline demand = 705478 * 135 / 1e6 = 95.23953
        # Max temp 38 is 13 degrees above 25 -> 13 * 0.02 = 0.26 extra
        # Peak demand = 95.23953 * 1.26 = 120.0018 -> rounded to 120.0
        assert data["demand"] == 120.0

def test_admin_auth_gate():
    # 1. Invalid login fails
    bad_res = client.post("/api/admin/login", json={"username": "admin", "password": "wrongpassword"})
    assert bad_res.status_code == 401

    # 2. Valid login succeeds and returns token
    login_res = client.post("/api/admin/login", json={"username": "admin", "password": "admin123"})
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    assert token

    # 3. Unauthenticated write fails
    unauth_res = client.post("/api/config", json={"LPCD": 135})
    assert unauth_res.status_code == 401

    # 4. Authenticated verify succeeds
    verify_res = client.get("/api/admin/verify", headers={"Authorization": f"Bearer {token}"})
    assert verify_res.status_code == 200
    assert verify_res.json()["authenticated"] is True
