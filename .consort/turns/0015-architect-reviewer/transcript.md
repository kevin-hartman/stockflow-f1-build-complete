# architect-reviewer (architect-reviewer) – opus

## Prompt

```
REVISE (reflection gate): blocking smell "reflect-testlist-defect": reflection gate: AC5 requires an inline refusal message ('A record for that SKU at that location already exists') rendered in the stock-record-duplicate-error seam, but no component or Playwright test renders that seam; T27-T33 are all API/DB. The client-visible outcome of AC5 is uncovered.

This is a reflect ARCHITECTURE defect on the architect's own product: the flagged AC's architectural_notes (its layer, the route/path/contract, or a persistence invariant) were cleared and must be RE-ANNOTATED to resolve it — re-derive them against the ACs, the IA (ia.md), and architecture.json so the layer tag, the route/path, and the invariants agree with the IA and the tests. The acceptance criteria themselves are intact; author the architectural annotations only. The named fix is REQUIRED: the re-annotation MUST resolve the exact inconsistency described – do NOT omit it, weaken it, or defer it to an open question. If it genuinely cannot be resolved as written, name the concrete blocker; do not punt.

Annotate story S1-file-stock-record's acceptance criteria + nfrs.md coverage. Author architectural_notes for EXACTLY these un-noted AC(s): AC1-file-valid-record, AC5-duplicate-sku-location-rejected. Story S1-file-stock-record's remaining ACs (AC2-file-without-tracking-code, AC3-missing-required-field-inline-error, AC4-invalid-quantity-inline-error) already carry valid notes and are OUT of scope this turn. Every one of this story's ACs MUST end up with a non-empty "architectural_notes" field in its acs/<AC>.json (the layer it lives in + how it realizes the design) — the design gate verifies that, and the spec-author's "layer" field does NOT count. architectural_notes are per-AC, so author the scoped ACs above even when the feature-level architecture.json already exists from an earlier story. For every E2E AC, ALSO pass consort-annotate-ac --ui-seams with the ia.md data-testid seam token(s) the AC's UI drives — the column / cell / region / empty-state / form field it asserts (e.g. "stock-cell-tracking,stock-not-tracked"). A deterministic gate checks each seam is named in <PROJECT_ROOT>/.consort/design/ia.md; if the AC needs a surface the IA does not yet name, declare the seam you need anyway and the gate routes the ux-designer to add it to ia.md. In architecture.json, make an EXPLICIT service_backed call (required): set service_backed:true if the feature persists data (a DB table/migration) or carries business logic, and then you MUST declare boundary, service, and repository layers (plus a "models" PACKAGE app/models/, one module per domain object, NOT a flat app/models.py, when it persists entities); set false ONLY for a trivial static/read-through endpoint. An Infra-layer AC or a migration/schema/storage NFR while service_backed is false hard-blocks the gate. When service_backed:true you MUST also declare architecture.json persistence_invariants[]: the DB-level guarantees the schema enforces (each with id, type one of unique|foreign_key|cascade|not_null|check|transactional|migration_reversible, table, and a one-line brief), covering unique/composite keys, foreign keys + cascade rules, NOT NULL / CHECK constraints, any transactional-atomicity boundary, and migration reversibility. The test-strategist must cover each with a real-branch test; a service_backed feature with no persistence_invariants hard-blocks the gate. When THIS story introduces a NEW read/query shape over the schema — a filter, lookup, sort, or join an AC drives (e.g. "list stock filtered by location", "look up a SKU's rows by sku") that is an INDEX candidate — declare it in architecture.json access_patterns[] (id, a one-line brief, and the table + column(s) it reads) so the DBA is pulled back in to reconsider the physical design for it; this is how a later READ story evolves the schema, since a story that adds no persistence_invariant would otherwise skip the DBA. Declare an access_pattern ONLY for a genuinely new query shape (not for every read, and not for one already covered by a prior story's pattern or a primary-key lookup). REUSE the established project architecture conventions (set by F1-stock-visibility): boundary=app/routes (react), service=app/services, repository=app/repositories, models=app/models, infrastructure=app/database.py. Declare the SAME role -> module paths in architecture.json, do NOT remap or rename an established layer; a divergent layout hard-blocks the spec gate and mismatches the inherited code. Author this story's architectural_notes FRESH from the ACs + IA on disk this turn. On a reflect-revise re-run the self-heal clears this story's prior architectural_notes BY DESIGN, so an absent/empty prior is the expected revise state — re-derive against the corrected ACs + IA. Write every artifact under the ABSOLUTE artifact root <PROJECT_ROOT>/.consort (this feature: <PROJECT_ROOT>/.consort/features/F1-stock-visibility/; this story: <PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S1-file-stock-record/); use that absolute path and never resolve or guess the project root yourself.CROSS-STORY CONTEXT — this story is NOT reviewed in isolation. The feature's OTHER stories' ACs, the architecture's open_decisions, and its mandated (not-null) persistence fields are below; use them for the cross-story checks (an AC contradicting a gated sibling AC; a mandated field no sibling submit AC supplies). This IS that context — do not run `consort-cross-story-context` yourself.

{
  "current_story": "S1-file-stock-record",
  "sibling_stories": [],
  "open_decisions": [
    {
      "id": "OD1-refile-refuse-or-update",
      "question": "Re-filing an existing (sku, location): refuse or update in place?",
      "decision_status": "resolved",
      "resolved_by_story": "S1-file-stock-record",
      "resolution": "Refuse with 409 + inline message; quantity changes are adjustments (F2). Consistent with AC5 and R3."
    },
    {
      "id": "OD2-tracking-code-optional",
      "question": "Is the tracking code required?",
      "decision_status": "resolved",
      "resolved_by_story": "S1-file-stock-record",
      "resolution": "Optional; blank is stored as NULL so readers render 'not tracked'."
    },
    {
      "id": "OD3-batch-serial-fields",
      "question": "The IA lists optional Batch/Serial inputs on the form; F1 carries batch/serial inside the tracking code (spec Q4). Should the F1 form omit them until F6?",
      "decision_status": "deferred"
    }
  ],
  "required_persistence_fields": [
    {
      "invariant_id": "PI2-sku-not-null",
      "table": "stock_records",
      "brief": "sku is NOT NULL; an insert without a sku is rejected by the schema."
    },
    {
      "invariant_id": "PI3-location-not-null",
      "table": "stock_records",
      "brief": "location is NOT NULL; an insert without a location is rejected by the schema."
    },
    {
      "invariant_id": "PI4-quantity-not-null",
      "table": "stock_records",
      "brief": "quantity is NOT NULL; an insert without a quantity is rejected by the schema."
    }
  ]
} Be terse: produce ONLY the required artifact file(s) on disk, then stop with at most a one-line confirmation. Do NOT print a plan, a summary of what you did, rationale, tables, or restate the artifacts to stdout, that output is wasted latency. The files on disk are the deliverable, not your prose.
```

## Tools used

- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S1-file-stock-record/acs && cat AC1-file-valid-record.json AC5-duplicate-sku-location-rejected.json AC3-missing-required-field-inline-error.json; grep -n \"stock-record\\|data-testid\\|seam\" ../../../../../design/ia.md | head -60; grep -n '\"id\": \"EP' ../../../architecture.json","description":"Read scoped ACs, a sibling AC, IA seams, and API contracts"}
- Bash {"command":"grep -h '\"layer\"\\|api_contract' AC2*.json AC4*.json","description":"Check sibling AC layers"}
- Bash {"command":"cd <PROJECT_ROOT> && ./scripts/lk consort-annotate-ac --feature F1-stock-visibility --story S1-file-stock-record --ac AC1-file-valid-record --layer E2E --ui-seams \"stock-record-form,stock-record-sku,stock-record-location,stock-record-quantity,stock-record-tracking-code,stock-record-submit,stock-record-success\" --api-contract EP1-create-stock-record --notes \"E2E client-server contract: the React form (client/src/pages + hooks/api) POSTs to the boundary app/routes/stock_records.py, which delegates to app/services/stock_records.py; the service validates and persists via app/repositories/stock_records.py (models app/models/stock_record.py) in one transaction. On the real 201 response the client renders the stock-record-success status ('Record filed') without reload. Verified by Playwright against the live API plus a real-branch DB check that exactly one (WID-001, A-01) row holds quantity 12 and the tracking code.\" && ./scripts/lk consort-annotate-ac --feature F1-stock-visibility --story S1-file-stock-record --ac AC5-duplicate-sku-location-rejected --layer E2E --ui-seams \"stock-record-form,stock-record-sku,stock-record-location,stock-record-quantity,stock-record-submit,stock-record-duplicate-error,stock-record-success\" --api-contract EP1-create-stock-record --notes \"E2E client-server contract: the collision rule is decided server-side (app/services/stock_records.py refuses an existing (sku, location), backstopped by the PI1 unique constraint in app/repositories/stock_records.py) and returned as 409; the client maps that real 409 to the stock-record-duplicate-error seam above the submit button with the exact text 'A record for that SKU at that location already exists', keeps SKU/location/quantity in the fields and shows no stock-record-success. Must be covered by a component test (mocked 409 -> seam text) AND a Playwright e2e against the live API (real second submit -> seam visible), in addition to the existing API/DB tests asserting 409 and that the single (WID-001, A-01) row still holds quantity 12.\" && ./scripts/lk consort-response-formatter --role architect-reviewer --feature F1-stock-visibility --story S1-file-stock-record","description":"Annotate AC1 and AC5 as E2E, run self-check"}

## Final reasoning

I re-annotated AC1 and AC5 as E2E, and the response-formatter self-check passes. AC5 was API before, and is now E2E with the `stock-record-duplicate-error` seam, so the refusal message has to be covered by a component test (mocked 409) and a live-API Playwright test, alongside the existing API/DB tests (T27–T33). The endpoint still has an API-layer AC (AC4).
