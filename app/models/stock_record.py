"""StockRecord: one SKU's quantity at one location, keyed by (sku, location)."""

from sqlalchemy import CheckConstraint, Column, Integer, String, UniqueConstraint

from app.database import Base


class StockRecord(Base):
    __tablename__ = "stock_records"
    __table_args__ = (
        UniqueConstraint("sku", "location", name="uq_stock_records_sku_location"),
        CheckConstraint("quantity >= 0", name="ck_stock_records_quantity_non_negative"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    sku = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    tracking_code = Column(String(255), nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "sku": self.sku,
            "location": self.location,
            "quantity": self.quantity,
            "tracking_code": self.tracking_code,
        }
