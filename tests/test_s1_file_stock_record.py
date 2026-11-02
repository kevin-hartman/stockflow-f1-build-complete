"""S1 file-stock-record: persistence invariants, service guards and EP1 API contract (real paired branch)."""

import os
import re
import uuid
from pathlib import Path
from unittest.mock import MagicMock, patch
from urllib.parse import urlparse

import psycopg
import pytest
import sqlalchemy as sa
from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy.exc import IntegrityError

from app.database import engine, resolved_url

_INI = str(Path(__file__).resolve().parent.parent / "alembic.ini")
_INSERT = sa.text(
    "INSERT INTO stock_records (sku, location, quantity, tracking_code) "
    "VALUES (:sku, :location, :quantity, :tracking_code)"
)


def _uniq(prefix="WID"):
    return f"{prefix}-{uuid.uuid4()}"


def _row(**over):
    base = {"sku": _uniq(), "location": "A-01", "quantity": 12, "tracking_code": None}
    base.update(over)
    return base


def _violation(db_session, params, kind):
    with pytest.raises(IntegrityError) as exc:
        db_session.execute(_INSERT, params)
        db_session.commit()
    db_session.rollback()
    assert isinstance(exc.value.orig, kind)
    return exc.value.orig


@pytest.mark.migration
@pytest.mark.testid("T1")
def test_stock_records_migration_downgrade_upgrade_round_trip():
    cfg = Config(_INI)
    script = ScriptDirectory.from_config(cfg)
    creators = [
        s
        for s in script.walk_revisions()
        if s.down_revision is None and "stock_records" in Path(s.path).read_text()
    ]
    assert len(creators) == 1, "an initial create-table migration for stock_records must exist"
    # Initial create-table: its own down_revision is None, i.e. the base.
    assert creators[0].down_revision is None
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")
    engine.dispose()
    insp = sa.inspect(engine)
    assert insp.has_table("stock_records")
    cols = {c["name"] for c in insp.get_columns("stock_records")}
    assert {"id", "sku", "location", "quantity", "tracking_code"} <= cols
    uniques = {u["name"] for u in insp.get_unique_constraints("stock_records")}
    assert "uq_stock_records_sku_location" in uniques
    checks = {c["name"] for c in insp.get_check_constraints("stock_records")}
    assert "ck_stock_records_quantity_non_negative" in checks


@pytest.mark.testid("T2")
def test_engine_url_comes_from_database_url_env_and_is_postgres():
    env_url = os.environ.get("DATABASE_URL")
    assert env_url, "DATABASE_URL must be set for tests"
    assert engine.dialect.name == "postgresql"
    assert "sqlite" not in env_url and ":memory:" not in env_url
    assert urlparse(resolved_url()).hostname == urlparse(env_url).hostname
    assert engine.url.host == urlparse(env_url).hostname


@pytest.mark.testid("T3")
def test_alembic_head_applied_on_paired_branch(db_session):
    head = ScriptDirectory.from_config(Config(_INI)).get_current_head()
    assert head is not None, "at least one migration must exist"
    current = db_session.execute(sa.text("SELECT version_num FROM alembic_version")).scalar()
    assert current == head


@pytest.mark.testid("T4")
def test_post_stock_record_responds_json(client):
    r = client.post("/api/stock-records", json=_row(tracking_code="TRK-1"))
    assert r.status_code == 201
    assert r.headers["content-type"].startswith("application/json")


@pytest.mark.testid("T12")
def test_insert_null_sku_rejected(db_session):
    err = _violation(db_session, _row(sku=None), psycopg.errors.NotNullViolation)
    assert "sku" in str(err)


@pytest.mark.testid("T13")
def test_insert_null_location_rejected(db_session):
    err = _violation(db_session, _row(location=None), psycopg.errors.NotNullViolation)
    assert "location" in str(err)


@pytest.mark.testid("T14")
def test_insert_null_quantity_rejected(db_session):
    err = _violation(db_session, _row(quantity=None), psycopg.errors.NotNullViolation)
    assert "quantity" in str(err)


def _call_service_rejecting(**fields):
    from app.repositories import stock_records as repo
    from app.services import stock_records as svc

    db = MagicMock()
    with patch.object(repo, "add") as add:
        with pytest.raises(svc.StockRecordValidationError) as exc:
            svc.create_stock_record(db, **{"sku": _uniq(), "location": "A-01", "quantity": 12, **fields})
        add.assert_not_called()
    return exc.value


@pytest.mark.testid("T15")
def test_service_blank_sku_rejected_before_repository_write():
    err = _call_service_rejecting(sku="   ")
    assert "sku" in err.errors


@pytest.mark.testid("T16")
def test_post_missing_sku_returns_422_naming_sku(client):
    r = client.post("/api/stock-records", json={"location": "A-01", "quantity": 12})
    assert r.status_code == 422
    msg = r.json()["errors"]["sku"]
    assert re.search(r"\bsku\b", msg, re.IGNORECASE)


@pytest.mark.testid("T24")
def test_insert_negative_quantity_violates_check(db_session):
    err = _violation(db_session, _row(quantity=-1), psycopg.errors.CheckViolation)
    assert err.diag.constraint_name == "ck_stock_records_quantity_non_negative"


@pytest.mark.testid("T25")
def test_service_negative_quantity_rejected_before_repository_write():
    err = _call_service_rejecting(quantity=-3)
    assert "quantity" in err.errors


@pytest.mark.testid("T26")
def test_post_negative_quantity_returns_422_keyed_on_quantity(client):
    r = client.post("/api/stock-records", json=_row(quantity=-3))
    assert r.status_code == 422
    assert "quantity" in r.json()["errors"]


@pytest.mark.testid("T31")
def test_insert_duplicate_sku_location_violates_unique(db_session):
    row = _row()
    db_session.execute(_INSERT, row)
    db_session.commit()
    err = _violation(db_session, {**row, "quantity": 5}, psycopg.errors.UniqueViolation)
    assert err.diag.constraint_name == "uq_stock_records_sku_location"


@pytest.mark.testid("T32")
def test_post_duplicate_sku_location_returns_409(client):
    row = _row()
    assert client.post("/api/stock-records", json=row).status_code == 201
    r = client.post("/api/stock-records", json={**row, "quantity": 5})
    assert r.status_code == 409


@pytest.mark.testid("T33")
def test_refused_duplicate_leaves_single_original_row(client, db_session):
    row = _row()
    assert client.post("/api/stock-records", json=row).status_code == 201
    assert client.post("/api/stock-records", json={**row, "quantity": 5}).status_code == 409
    rows = db_session.execute(
        sa.text("SELECT quantity FROM stock_records WHERE sku = :sku AND location = :location"),
        {"sku": row["sku"], "location": row["location"]},
    ).all()
    assert [r[0] for r in rows] == [12]


def _post_without_tracking(client, **tracking):
    payload = {"sku": _uniq(), "location": "A-01", "quantity": 12, **tracking}
    return payload, client.post("/api/stock-records", json=payload)


@pytest.mark.testid("T8")
def test_post_blank_tracking_code_returns_201_with_null(client):
    _, r = _post_without_tracking(client, tracking_code="")
    assert r.status_code == 201
    assert r.json()["tracking_code"] is None


@pytest.mark.testid("T9")
def test_post_omitted_tracking_code_returns_201_with_null(client):
    _, r = _post_without_tracking(client)
    assert r.status_code == 201
    assert r.json()["tracking_code"] is None


@pytest.mark.testid("T10")
def test_post_whitespace_tracking_code_returns_201_with_null(client):
    _, r = _post_without_tracking(client, tracking_code="   ")
    assert r.status_code == 201
    assert r.json()["tracking_code"] is None


@pytest.mark.testid("T11")
def test_blank_tracking_code_stored_as_sql_null(client, db_session):
    payload, r = _post_without_tracking(client, tracking_code="  ")
    assert r.status_code == 201
    is_null = db_session.execute(
        sa.text("SELECT tracking_code IS NULL FROM stock_records WHERE sku = :sku AND location = :location"),
        {"sku": payload["sku"], "location": payload["location"]},
    ).scalar_one()
    assert is_null is True
