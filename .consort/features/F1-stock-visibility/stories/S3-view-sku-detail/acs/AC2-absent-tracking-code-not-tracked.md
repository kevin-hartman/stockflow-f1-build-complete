# AC2-absent-tracking-code-not-tracked

- **Given** a stock record exists for (WID-001, A-01, quantity 12) filed with no tracking code
- **When** the operator opens that record's SKU detail view
- **Then** the view renders cleanly with SKU, location and quantity shown and the tracking code field showing "not tracked" (not blank, 'null' or an error)
