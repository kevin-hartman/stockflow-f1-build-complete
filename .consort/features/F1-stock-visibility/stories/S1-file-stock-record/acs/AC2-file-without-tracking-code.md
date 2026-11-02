# AC2-file-without-tracking-code

- **Given** the operator is on the stock-record form
- **When** they submit a valid SKU, location and quantity with the optional tracking code left blank
- **Then** the record is accepted and stored with no tracking code (the tracking code is absent, not an empty or placeholder value)
