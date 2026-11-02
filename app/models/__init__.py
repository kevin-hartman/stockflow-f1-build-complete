"""SQLAlchemy models. Importing this package registers every entity on Base.metadata."""

from app.models.stock_record import StockRecord

__all__ = ["StockRecord"]
