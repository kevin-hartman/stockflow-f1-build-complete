# F1 Stock visibility — Architecture

Layering (inherited convention): boundary `app/routes` (JSON API, rendered by the React SPA in `client/`) → service `app/services` → repository `app/repositories` (sole ORM/session owner; session door `app/repositories/session.py`) → models `app/models/` package (`stock_record.py`) → infrastructure `app/database.py`. service_backed: true; persists `stock_records`.

S1 layer assignment: AC1, AC3, AC4 are `E2E` (form submit rendered from real server responses); AC2 (NULL tracking code) and AC5 (duplicate refusal) are `API` write rules on `EP1-create-stock-record`.

## Architectural Concerns Mapping

| Concern | Owner layer | Module | Notes |
|---|---|---|---|
| Input validation (required fields, quantity whole ≥ 0) | Service (invoked from boundary) | app/services/stock_records.py | 422 field-keyed envelope (R7) |
| Uniqueness (sku, location) | Service + DB constraint | app/services/stock_records.py, PI1 | 409 on collision (R3) |
| Non-negative quantity | Service + DB CHECK | PI5 | R2 |
| Transactions | Service | app/services/stock_records.py | rollback on any error |
| Persistence / ORM | Repository | app/repositories/stock_records.py | only layer touching session |
| Error presentation | Client | client describeError() + field__error seams | inline, field-named |
| Config | Infrastructure | app/database.py via DATABASE_URL | twelve-factor; no DB rename |
| Auth / authz | N/A | — | Out of bounds for V1 |
| Logging / audit | N/A in F1 | — | Adjustment audit arrives with F2 |

## Pattern proposals

- `StockRecordService.create(cmd)` — single responsibility: validate, normalize blank tracking code to None, delegate to repository, map duplicates to `DuplicateStockRecord`.
- `StockRecordRepository` — `get_by_key(sku, location)`, `add(record)`; translates `IntegrityError` on PI1 to the domain error.
- Boundary maps domain errors to HTTP (422/409) only; no business logic in routes or client.
- S2: `StockRecordService.list()` -> `StockRecordRepository.list_ordered()` (ORDER BY location, sku; AP1) behind `GET /api/stock-records` (EP2, bare list). Client list hook fetches on route mount so SPA return from `/stock/new` is fresh; null `tracking_code` -> `not-tracked` pill in a presentational component.
- S3: `StockRecordService.get(sku, location)` -> `StockRecordRepository.get_by_key` (exact-key lookup served by the PI1 unique index; no new access pattern) behind `GET /api/stock-records/{sku}?location=` (EP3, object, 404 on miss, `par_level` always null in F1). Detail page renders each optional field through one per-field null -> `detail-not-tracked` mapping.

## Risks

- Scaffold ships a flat `app/models.py`; it must be replaced by the `app/models/` package (checkModulePlacement).
- Pre-check + insert race on (sku, location) — the unique constraint is the authority; the repository must map the IntegrityError, not rely on the pre-check alone.
- IA S2 table shows Batch/Serial/Par level columns not in the F1 schema; they render `not-tracked` client-side until F6/F2 (no API field).
- S3 detail returns `par_level: null` with no backing column (OD4); a later par-level feature must add a nullable column additively and populate EP3.
- IA lists Batch/Serial inputs beyond the spec's tracking-code-only model (OD3).

## Decisions

- Q1 re-file: **refuse** (409) — recommended, resolved (OD1).
- Q2 tracking code: **optional**, NULL when blank — resolved (OD2).
- Q3 quantity 0: **valid**; CHECK is `>= 0`.
- Q4 par/batch/serial: not captured in F1; batch/serial deferred to F6 (OD3 — recommend omitting the Batch/Serial inputs from the F1 form).
- S3 par level source: **not stored in F1**; EP3 returns null -> 'not tracked' — resolved (OD4).

## Test strategy

Real integration tests against the paired Lakebase branch (pytest-bdd: Gherkin `.feature` + `tests/step_defs/test_*.py` + `tests/conftest.py`; Alembic head applied first; FK-aware targeted DELETE cleanup). No mocks, stubs, or in-memory DB. API suite: AC2, AC5, plus PI1–PI6 DB tests. Playwright E2E against the live API: S1 AC1, AC3, AC4, AC5 (AC5 also component-tested for the 409 -> `stock-record-duplicate-error` mapping) with DB-state assertions; S2 AC1–AC4 (seeded/cleared on the paired branch), plus a pytest-bdd API test for EP2 ordering (AP1); S3 AC1–AC3 via Playwright against the live API on seeded paired-branch rows, plus a pytest-bdd API test for EP3 exact-key lookup + 404.

## Sign-off

Recommendation: **proceed**. — architect-reviewer
