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
        # Max temp 38 is 8 degrees above 30 -> 8 * 0.02 = 0.16 extra
        # Peak demand = 95.23953 * 1.16 = 110.477 -> rounded to 110.5
        assert data["demand"] == 110.5
