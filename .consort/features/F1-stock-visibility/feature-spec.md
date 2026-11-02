# F1 Stock visibility

## Summary
Operators file stock records (SKU, location, quantity, optional combined tracking code) and see them in a home stock-by-location table and a per-record SKU detail view. Establishes the `(sku, location)` key and the real-branch integration baseline.

## Data semantics
- A stock record is uniquely identified by `(sku, location)`; at most one exists per pair.
- The tracking code is optional; when omitted it is absent (rendered "not tracked" by readers).
- Quantity is a whole number ≥ 0.

## Stories
- S1-file-stock-record — file a record via the form with inline, field-named validation and duplicate-key refusal.
- S2-view-stock-by-location — home stock-by-location table with empty state.
- S3-view-sku-detail — single-record detail view with per-field "not tracked".

## Out of scope
- Adjusting, receiving, picking, counting stock (F2–F5) — so re-filing an existing `(sku, location)` does not update it.
- Searching/filtering the table (F9).
- Splitting the tracking code into batch/serial columns (F6).

## Open questions
- Q1 (S1): Re-filing an existing `(sku, location)` — refuse or update in place? Recommended: refuse (updating quantity is adjustment, F2). AC5 drafted as refuse.
- Q2 (S1): Is tracking code required? The request lists it in the form but S3 expects untracked fields. Recommended: optional (AC2).
- Q3 (S1): Is quantity 0 valid and does a quantity-0 record count as holding stock? Recommended: 0 is accepted and displayed like any other record in every view.
- Q4 (S1/S3): Par level, batch and serial are named as optional detail but not as form fields. Recommended: batch/serial are carried inside the tracking code; par level is not captured in F1 and renders "not tracked".
