# AC1-table-lists-records-by-location

- **Given** stock records exist for (WID-001, A-01, quantity 12), (BOLT-07, A-01, quantity 40) and (WID-001, B-02, quantity 3)
- **When** the operator opens the home view
- **Then** a stock-by-location table shows exactly those three records, one row each with its SKU, location and quantity, ordered by location so all records at the same location are adjacent
