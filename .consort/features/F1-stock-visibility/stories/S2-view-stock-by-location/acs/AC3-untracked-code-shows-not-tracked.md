# AC3-untracked-code-shows-not-tracked

- **Given** a stock record exists for (WID-001, A-01, quantity 12) with no tracking code, alongside a record for (BOLT-07, A-01, quantity 40) with a tracking code
- **When** the operator opens the home view
- **Then** the WID-001 row renders cleanly with its tracking code shown as "not tracked", while the BOLT-07 row shows its tracking code
