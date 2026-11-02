"""Stock-record service: validates a filing, then persists it via the repository."""

from typing import Any

from sqlalchemy.orm import Session

from app.models import StockRecord
from app.repositories import stock_records as repo
from app.repositories.session import get_session  # noqa: F401  (the session door routes depend on)
from app.repositories.stock_records import DuplicateStockRecordError

DUPLICATE_MESSAGE = "A record for that SKU at that location already exists"
QUANTITY_INVALID = "Quantity must be a whole number of zero or more"

__all__ = [
    "DUPLICATE_MESSAGE",
    "DuplicateStockRecordError",
    "StockRecordValidationError",
    "create_stock_record",
    "get_session",
    "list_stock_records",
]


class StockRecordValidationError(Exception):
    """Field-named validation failures: ``errors`` maps field -> message."""

    def __init__(self, errors: dict[str, str]):
        super().__init__("invalid stock record")
        self.errors = errors


def _blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def _required_text(value: Any, field: str, label: str, errors: dict[str, str]) -> str | None:
    if _blank(value):
        errors[field] = f"{label} is required"
        return None
    return str(value).strip()


def _quantity(value: Any, errors: dict[str, str]) -> int | None:
    if _blank(value):
        errors["quantity"] = "Quantity is required"
        return None
    if isinstance(value, bool):
        errors["quantity"] = QUANTITY_INVALID
        return None
    if isinstance(value, int):
        parsed = value
    elif isinstance(value, str) and value.strip().lstrip("-").isdigit():
        parsed = int(value.strip())
    else:
        errors["quantity"] = QUANTITY_INVALID
        return None
    if parsed < 0:
        errors["quantity"] = QUANTITY_INVALID
        return None
    return parsed


def create_stock_record(
    db: Session, *, sku: Any = None, location: Any = None, quantity: Any = None, tracking_code: Any = None
) -> StockRecord:
    errors: dict[str, str] = {}
    clean_sku = _required_text(sku, "sku", "SKU", errors)
    clean_location = _required_text(location, "location", "Location", errors)
    clean_quantity = _quantity(quantity, errors)
    if errors:
        raise StockRecordValidationError(errors)
    clean_code = None if _blank(tracking_code) else str(tracking_code).strip()
    return repo.add(
        db, sku=clean_sku, location=clean_location, quantity=clean_quantity, tracking_code=clean_code
    )


def list_stock_records(db: Session) -> list[StockRecord]:
    return repo.list_all(db)
