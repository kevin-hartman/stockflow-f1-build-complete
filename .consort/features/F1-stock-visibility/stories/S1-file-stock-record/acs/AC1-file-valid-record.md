# AC1-file-valid-record

- **Given** the operator is on the stock-record form and no record exists for SKU "WID-001" at location "A-01"
- **When** they enter SKU "WID-001", location "A-01", quantity 12 and a tracking code, and submit the form
- **Then** the form confirms the record was filed, and exactly one stock record for (WID-001, A-01) now exists holding quantity 12 and that tracking code
