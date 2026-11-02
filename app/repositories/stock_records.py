"""Stock-record repository: the only code that touches the ORM for stock_records."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import StockRecord


class DuplicateStockRecordError(Exception):
    """A record for that (sku, location) already exists."""


def add(db: Session, *, sku: str, location: str, quantity: int, tracking_code: str | None) -> StockRecord:
    record = StockRecord(sku=sku, location=location, quantity=quantity, tracking_code=tracking_code)
    db.add(record)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        constraint = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)
        if constraint == "uq_stock_records_sku_location":
            raise DuplicateStockRecordError() from exc
        raise
    db.refresh(record)
    return record


def list_all(db: Session) -> list[StockRecord]:
    return db.query(StockRecord).order_by(StockRecord.location, StockRecord.sku).all()
