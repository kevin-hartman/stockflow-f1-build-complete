# AC5-duplicate-sku-location-rejected

- **Given** a stock record already exists for SKU "WID-001" at location "A-01" with quantity 12
- **When** the operator files another record for SKU "WID-001" at location "A-01" with quantity 5
- **Then** the submission is refused with an inline message stating a record for that SKU at that location already exists, exactly one record for (WID-001, A-01) remains, and it still holds quantity 12
