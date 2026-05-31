import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_websocket_metrics():
    with client.websocket_connect("/ws/metrics") as websocket:
        data = websocket.receive_json()
        assert data["type"] == "welcome"
        assert "listeners" in data["data"]
        assert "track" in data["data"]
