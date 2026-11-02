"""S2 view-stock-by-location: EP1 list contract, SC2 index migration, real-branch fitness."""

import uuid
from pathlib import Path

import pytest
import sqlalchemy as sa
from alembic import command
from alembic.config import Config

from app.database import engine, resolved_url

_INI = str(Path(__file__).resolve().parent.parent / "alembic.ini")
_CREATE_TABLE_REV = "20261102085400"  # SC1 create-table: the SC2 add-index migration's own down_revision
_INDEX = "ix_stock_records_location_sku"


def _tag():
    return uuid.uuid4().hex


def _file(client, sku, location, quantity, code=None):
    r = client.post(
        "/api/stock-records",
        json={"sku": sku, "location": location, "quantity": quantity, "tracking_code": code},
    )
    assert r.status_code == 201, r.text
    return r.json()


def _mine(client, tag):
    r = client.get("/api/stock-records")
    assert r.status_code == 200
    return [x for x in r.json() if tag in x["sku"]]


@pytest.mark.testid("T39")
def test_list_returns_seeded_records(client):
    tag = _tag()
    la, lb = f"A-{tag}", f"B-{tag}"
    _file(client, f"WID-001-{tag}", la, 12)
    _file(client, f"BOLT-07-{tag}", la, 40)
    _file(client, f"WID-001-{tag}", lb, 3)
    rows = _mine(client, tag)
    assert len(rows) == 3
    for r in rows:
        assert set(r) >= {"id", "sku", "location", "quantity", "tracking_code"}
    got = {(r["sku"], r["location"], r["quantity"]) for r in rows}
    assert got == {
        (f"WID-001-{tag}", la, 12),
        (f"BOLT-07-{tag}", la, 40),
        (f"WID-001-{tag}", lb, 3),
    }


@pytest.mark.testid("T40")
def test_list_ordered_by_location_then_sku(client):
    tag = _tag()
    la, lb = f"A-{tag}", f"B-{tag}"
    _file(client, f"WID-001-{tag}", lb, 3)
    _file(client, f"WID-001-{tag}", la, 12)
    _file(client, f"BOLT-07-{tag}", la, 40)
    rows = _mine(client, tag)
    assert [(r["location"], r["sku"]) for r in rows] == [
        (la, f"BOLT-07-{tag}"),
        (la, f"WID-001-{tag}"),
        (lb, f"WID-001-{tag}"),
    ]


def _indexes():
    return {i["name"]: i for i in sa.inspect(engine).get_indexes("stock_records")}


@pytest.mark.migration
@pytest.mark.testid("T41")
def test_sc2_index_downgrade_upgrade_round_trip():
    cfg = Config(_INI)
    command.upgrade(cfg, "head")
    assert _INDEX in _indexes()
    command.downgrade(cfg, _CREATE_TABLE_REV)
    assert _INDEX not in _indexes()
    command.upgrade(cfg, "head")
    idx = _indexes()
    assert _INDEX in idx
    assert idx[_INDEX]["column_names"] == ["location", "sku"]


@pytest.mark.migration
@pytest.mark.testid("T42")
def test_sc2_index_downgrade_preserves_records():
    cfg = Config(_INI)
    command.upgrade(cfg, "head")
    tag = _tag()
    sku, loc = f"WID-{tag}", f"A-{tag}"
    with engine.begin() as conn:
        conn.execute(
            sa.text("INSERT INTO stock_records (sku, location, quantity) VALUES (:s, :l, 7)"),
            {"s": sku, "l": loc},
        )
    command.downgrade(cfg, _CREATE_TABLE_REV)
    command.upgrade(cfg, "head")
    with engine.connect() as conn:
        row = conn.execute(
            sa.text("SELECT sku, location, quantity FROM stock_records WHERE sku = :s"), {"s": sku}
        ).one()
    assert tuple(row) == (sku, loc, 7)


@pytest.mark.testid("T43")
def test_list_is_json_bare_array(client):
    _file(client, f"WID-{_tag()}", f"A-{_tag()}", 1)
    r = client.get("/api/stock-records")
    assert r.headers["content-type"].startswith("application/json")
    assert isinstance(r.json(), list)


@pytest.mark.testid("T44")
def test_engine_uses_database_url_on_paired_branch(monkeypatch):
    import os

    assert os.environ.get("DATABASE_URL"), "DATABASE_URL must be set"
    assert resolved_url() == os.environ["DATABASE_URL"] or resolved_url().startswith("postgres")
    assert engine.url.get_backend_name() == "postgresql"
    assert "sqlite" not in str(engine.url)
    assert ":memory:" not in str(engine.url)


@pytest.mark.testid("T45")
def test_alembic_head_applied_including_sc2_index():
    from alembic.script import ScriptDirectory

    head = ScriptDirectory.from_config(Config(_INI)).get_current_head()
    with engine.connect() as conn:
        current = conn.execute(sa.text("SELECT version_num FROM alembic_version")).scalar_one()
    assert current == head
    assert head != _CREATE_TABLE_REV
    assert _INDEX in _indexes()
