# F1 DB design

`stock_records` (mirrors `app/models/stock_record.py`), created by S1 in `SC1-create-stock-records`.

- PI1: UNIQUE(sku, location) `uq_stock_records_sku_location` (AC5).
- PI2/PI3/PI4: sku, location, quantity NOT NULL (AC3).
- PI5: INTEGER quantity + CHECK `quantity >= 0` (AC4).
- PI6: reversible initial create_table; downgrade drops, upgrade head recreates table + constraints.
- tracking_code nullable, stored as NULL when blank (AC2).

S1: no access patterns were declared at S1.

## S2 update
- AP1: `SC2-add-location-sku-index` adds non-unique index `ix_stock_records_location_sku (location, sku)` so the stock-by-location list can be read in index order (the unique index leads with sku, so it can't serve this sort). The downgrade drops only the index.
