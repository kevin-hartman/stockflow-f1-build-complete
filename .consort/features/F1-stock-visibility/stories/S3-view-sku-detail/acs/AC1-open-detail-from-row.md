# AC1-open-detail-from-row

- **Given** stock records exist for (WID-001, A-01, quantity 12, tracking code "A01-B7-S0042") and (BOLT-07, A-01, quantity 40)
- **When** the operator clicks the WID-001 / A-01 row in the home stock table
- **Then** the SKU detail view for that one record opens without a full-page reload, showing SKU WID-001, location A-01, quantity 12 and tracking code A01-B7-S0042, and no data from the BOLT-07 record
