"""S3 view-sku-detail: EP3 GET /api/stock-records/{sku}?location= contract."""

import uuid

import pytest


def _file(client, sku, location, quantity, code=None):
    r = client.post(
        "/api/stock-records",
        json={"sku": sku, "location": location, "quantity": quantity, "tracking_code": code},
    )
    assert r.status_code == 201, r.text


@pytest.mark.testid("T56")
def test_detail_existing_is_json_object(client):
    sku = f"WID-{uuid.uuid4().hex}"
    _file(client, sku, "A-01", 12, "A01-B7-S0042")
    r = client.get(f"/api/stock-records/{sku}", params={"location": "A-01"})
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("application/json")
    body = r.json()
    assert isinstance(body, dict)
    assert body["sku"] == sku and body["location"] == "A-01" and body["quantity"] == 12


@pytest.mark.testid("T57")
def test_detail_missing_is_json_404(client):
    r = client.get(f"/api/stock-records/NOPE-{uuid.uuid4().hex}", params={"location": "A-01"})
    assert r.status_code == 404
    assert r.headers["content-type"].startswith("application/json")
    assert r.json() == {"error": "Stock record not found"}


@pytest.mark.testid("T62")
def test_detail_null_tracking_code_is_json_null(client):
    sku = f"WID-{uuid.uuid4().hex}"
    _file(client, sku, "A-01", 5, None)
    body = client.get(f"/api/stock-records/{sku}", params={"location": "A-01"}).json()
    assert "tracking_code" in body and body["tracking_code"] is None


@pytest.mark.testid("T66")
def test_detail_par_level_null_independent_of_tracking_code(client):
    sku = f"WID-{uuid.uuid4().hex}"
    _file(client, sku, "A-01", 5, "A01-B7-S0042")
    body = client.get(f"/api/stock-records/{sku}", params={"location": "A-01"}).json()
    assert body["tracking_code"] == "A01-B7-S0042"
    assert "par_level" in body and body["par_level"] is None
