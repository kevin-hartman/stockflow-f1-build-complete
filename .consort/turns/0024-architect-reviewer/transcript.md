# architect-reviewer (architect-reviewer) – opus

## Prompt

```
Annotate story S2-view-stock-by-location's acceptance criteria + nfrs.md coverage. Author architectural_notes for ALL of story S2-view-stock-by-location's ACs: AC1-table-lists-records-by-location, AC2-empty-state-when-no-records, AC3-untracked-code-shows-not-tracked, AC4-new-record-appears-without-reload. Every one of this story's ACs MUST end up with a non-empty "architectural_notes" field in its acs/<AC>.json (the layer it lives in + how it realizes the design) — the design gate verifies that, and the spec-author's "layer" field does NOT count. architectural_notes are per-AC, so author the scoped ACs above even when the feature-level architecture.json already exists from an earlier story. For every E2E AC, ALSO pass consort-annotate-ac --ui-seams with the ia.md data-testid seam token(s) the AC's UI drives — the column / cell / region / empty-state / form field it asserts (e.g. "stock-cell-tracking,stock-not-tracked"). A deterministic gate checks each seam is named in <PROJECT_ROOT>/.consort/design/ia.md; if the AC needs a surface the IA does not yet name, declare the seam you need anyway and the gate routes the ux-designer to add it to ia.md. In architecture.json, make an EXPLICIT service_backed call (required): set service_backed:true if the feature persists data (a DB table/migration) or carries business logic, and then you MUST declare boundary, service, and repository layers (plus a "models" PACKAGE app/models/, one module per domain object, NOT a flat app/models.py, when it persists entities); set false ONLY for a trivial static/read-through endpoint. An Infra-layer AC or a migration/schema/storage NFR while service_backed is false hard-blocks the gate. When service_backed:true you MUST also declare architecture.json persistence_invariants[]: the DB-level guarantees the schema enforces (each with id, type one of unique|foreign_key|cascade|not_null|check|transactional|migration_reversible, table, and a one-line brief), covering unique/composite keys, foreign keys + cascade rules, NOT NULL / CHECK constraints, any transactional-atomicity boundary, and migration reversibility. The test-strategist must cover each with a real-branch test; a service_backed feature with no persistence_invariants hard-blocks the gate. When THIS story introduces a NEW read/query shape over the schema — a filter, lookup, sort, or join an AC drives (e.g. "list stock filtered by location", "look up a SKU's rows by sku") that is an INDEX candidate — declare it in architecture.json access_patterns[] (id, a one-line brief, and the table + column(s) it reads) so the DBA is pulled back in to reconsider the physical design for it; this is how a later READ story evolves the schema, since a story that adds no persistence_invariant would otherwise skip the DBA. Declare an access_pattern ONLY for a genuinely new query shape (not for every read, and not for one already covered by a prior story's pattern or a primary-key lookup). REUSE the established project architecture conventions (set by F1-stock-visibility): boundary=app/routes (react), service=app/services, repository=app/repositories, models=app/models, infrastructure=app/database.py. Declare the SAME role -> module paths in architecture.json, do NOT remap or rename an established layer; a divergent layout hard-blocks the spec gate and mismatches the inherited code. Author this story's architectural_notes FRESH from the ACs + IA on disk this turn. On a reflect-revise re-run the self-heal clears this story's prior architectural_notes BY DESIGN, so an absent/empty prior is the expected revise state — re-derive against the corrected ACs + IA. Write every artifact under the ABSOLUTE artifact root <PROJECT_ROOT>/.consort (this feature: <PROJECT_ROOT>/.consort/features/F1-stock-visibility/; this story: <PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S2-view-stock-by-location/); use that absolute path and never resolve or guess the project root yourself.CROSS-STORY CONTEXT — this story is NOT reviewed in isolation. The feature's OTHER stories' ACs, the architecture's open_decisions, and its mandated (not-null) persistence fields are below; use them for the cross-story checks (an AC contradicting a gated sibling AC; a mandated field no sibling submit AC supplies). This IS that context — do not run `consort-cross-story-context` yourself.

{
  "current_story": "S2-view-stock-by-location",
  "sibling_stories": [
    {
      "story": "S1-file-stock-record",
      "acs": [
        {
          "ac_id": "AC1-file-valid-record",
          "status": "draft",
          "layer": "E2E",
          "given": "the operator is on the stock-record form and no record exists for SKU \"WID-001\" at location \"A-01\"",
          "when": "they enter SKU \"WID-001\", location \"A-01\", quantity 12 and a tracking code, and submit the form",
          "then": "the form confirms the record was filed, and exactly one stock record for (WID-001, A-01) now exists holding quantity 12 and that tracking code",
          "architectural_notes": "E2E client-server contract: the React form (client/src/pages + hooks/api) POSTs to the boundary app/routes/stock_records.py, which delegates to app/services/stock_records.py; the service validates and persists via app/repositories/stock_records.py (models app/models/stock_record.py) in one transaction. On the real 201 response the client renders the stock-record-success status ('Record filed') without reload. Verified by Playwright against the live API plus a real-branch DB check that exactly one (WID-001, A-01) row holds quantity 12 and the tracking code."
        },
        {
          "ac_id": "AC2-file-without-tracking-code",
          "status": "draft",
          "layer": "API",
          "given": "the operator is on the stock-record form",
          "when": "they submit a valid SKU, location and quantity with the optional tracking code left blank",
          "then": "the record is accepted and stored with no tracking code (the tracking code is absent, not an empty or placeholder value)",
          "architectural_notes": "API: the stored-absence rule is a backend write rule - the service normalizes a blank/whitespace tracking_code to NULL before the repository insert, so the column holds SQL NULL, never '' or a placeholder. Owner app/services/stock_records.py; tracking_code is nullable in the schema (no not_null invariant). Verified by a pytest-bdd test posting to the endpoint and reading the row back from the paired branch DB."
        },
        {
          "ac_id": "AC3-missing-required-field-inline-error",
          "status": "draft",
          "layer": "E2E",
          "given": "the operator is on the stock-record form",
          "when": "they submit with any one of SKU, location or quantity left blank",
          "then": "an error naming that field is shown inline next to it (never a generic 'bad request'), the other entered values remain in the form, and no stock record is created",
          "architectural_notes": "E2E client-server contract: validation is decided server-side at the boundary/service (app/services/stock_records.py required-field check) and returned as a 422 field-keyed error envelope; the client renders each message in the matching field__error seam and keeps the other entered values (no reload, R7). Errors route through describeError() for non-field failures. Verified by Playwright against the live API plus a DB check that no row was created."
        },
        {
          "ac_id": "AC4-invalid-quantity-inline-error",
          "status": "draft",
          "layer": "E2E",
          "given": "the operator is on the stock-record form",
          "when": "they submit a quantity that is not a whole number of zero or more (e.g. -3 or 2.5)",
          "then": "an error naming the quantity field is shown inline next to it and no stock record is created",
          "architectural_notes": "E2E client-server contract: the service rejects a quantity that is not a whole number >= 0 (negative, decimal, non-numeric) with a 422 envelope keyed on quantity, rendered inline in the quantity field__error seam; defense-in-depth is the DB CHECK quantity >= 0 (PI). Owner app/services/stock_records.py. Verified by Playwright against the live API plus a DB check that nothing was stored."
        },
        {
          "ac_id": "AC5-duplicate-sku-location-rejected",
          "status": "draft",
          "layer": "E2E",
          "given": "a stock record already exists for SKU \"WID-001\" at location \"A-01\" with quantity 12",
          "when": "the operator files another record for SKU \"WID-001\" at location \"A-01\" with quantity 5",
          "then": "the submission is refused with an inline message stating a record for that SKU at that location already exists, exactly one record for (WID-001, A-01) remains, and it still holds quantity 12",
          "architectural_notes": "E2E client-server contract: the collision rule is decided server-side (app/services/stock_records.py refuses an existing (sku, location), backstopped by the PI1 unique constraint in app/repositories/stock_records.py) and returned as 409; the client maps that real 409 to the stock-record-duplicate-error seam above the submit button with the exact text 'A record for that SKU at that location already exists', keeps SKU/location/quantity in the fields and shows no stock-record-success. Must be covered by a component test (mocked 409 -> seam text) AND a Playwright e2e against the live API (real second submit -> seam visible), in addition to the existing API/DB tests asserting 409 and that the single (WID-001, A-01) row still holds quantity 12."
        }
      ]
    }
  ],
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

- Bash {"command":"cd <PROJECT_ROOT>/.consort && cat features/F1-stock-visibility/stories/S2-view-stock-by-location/acs/*.json; grep -n \"S2\\|stock-table\\|stock-\\(row\\|cell\\|empty\\|not\\)\" design/ia.md | head -30; python3 -c \"\nimport json;a=json.load(open('features/F1-stock-visibility/architecture.json'));print(json.dumps({k:a.get(k) for k in ['api_contracts','access_patterns','nfrs']},indent=1))\"","description":"Read S2 ACs, IA seams, and architecture contracts"}
- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility && python3 - <<'EOF'\nimport json\np='architecture.json';a=json.load(open(p))\nif not any(c['id']=='EP2-list-stock-records' for c in a['api_contracts']):\n  a['api_contracts'].append({\"id\":\"EP2-list-stock-records\",\"method\":\"GET\",\"path\":\"/api/stock-records\",\"shape\":\"list\",\"item\":\"Bare JSON array (no envelope), ordered by location then sku; each item {id: int, sku: string, location: string, quantity: int, tracking_code: string|null}. Empty array when no records exist.\",\"story\":\"S2-view-stock-by-location\"})\na.setdefault('access_patterns',[])\nif not any(x['id']=='AP1-list-ordered-by-location' for x in a['access_patterns']):\n  a['access_patterns'].append({\"id\":\"AP1-list-ordered-by-location\",\"table\":\"stock_records\",\"columns\":[\"location\",\"sku\"],\"story\":\"S2-view-stock-by-location\",\"brief\":\"Full list of stock_records ORDER BY location, sku for the home stock-by-location table; the (sku, location) unique index is sku-leading and does not serve a location-leading sort.\"})\njson.dump(a,open(p,'w'),indent=2)\nEOF\ngrep -n \"^## \" architecture.md","description":"Add list endpoint contract and location-ordered access pattern"}
- Bash {"command":"cd <PROJECT_ROOT> && L=\"--feature F1-stock-visibility --story S2-view-stock-by-location\"; ./scripts/lk consort-annotate-ac $L --ac AC1-table-lists-records-by-location --layer E2E --api-contract EP2-list-stock-records --ui-seams \"stock-table,stock-row,location-group,stock-cell-sku,stock-cell-location,stock-cell-quantity\" --notes \"E2E client-server contract: the home page (client/src/pages via a hooks/api list hook) fetches GET /api/stock-records from app/routes/stock_records.py, which delegates to app/services/stock_records.py; the repository app/repositories/stock_records.py owns the ORDER BY location, sku query (AP1). The client renders one stock-row per item grouped under location-group headers without re-sorting. Verified by Playwright against the live API over three seeded rows on the paired branch, plus a pytest-bdd API test asserting the list order.\" && ./scripts/lk consort-annotate-ac $L --ac AC2-empty-state-when-no-records --layer E2E --api-contract EP2-list-stock-records --ui-seams \"empty-state,empty-state-cta,stock-table\" --notes \"E2E client-server contract: when the real GET /api/stock-records returns an empty array the client renders the empty-state ('No stock filed yet') with empty-state-cta linking to /stock/new and does NOT render stock-table. The empty-vs-populated decision is driven by the server response, not static props. Verified by Playwright against the live API with the paired branch's stock_records cleared.\" && ./scripts/lk consort-annotate-ac $L --ac AC3-untracked-code-shows-not-tracked --layer E2E --api-contract EP2-list-stock-records --ui-seams \"stock-row,stock-cell-tracking-code,not-tracked\" --notes \"E2E client-server contract: the list returns tracking_code as null for an untracked record (stored NULL per S1 AC2/OD2); the client maps null to the not-tracked pill in stock-cell-tracking-code and renders the value otherwise, never blank or 'null'. Rendering lives in a presentational component under client/src/components; no server-side placeholder. Verified by Playwright against the live API with one NULL and one tracked row seeded on the paired branch (plus a component test for the null -> pill mapping).\" && ./scripts/lk consort-annotate-ac $L --ac AC4-new-record-appears-without-reload --layer E2E --api-contract EP2-list-stock-records --ui-seams \"stock-record-form,stock-record-submit,stock-record-success,stock-table,stock-row\" --notes \"E2E client-server contract across S1+S2: filing via POST /api/stock-records (EP1), then SPA navigation back to / re-fetches GET /api/stock-records on route mount (no cached stale list), so the NUT-09/C-03/8 row appears with no full-page reload (NFR5). Freshness is owned by the client list hook (fetch on mount / invalidate after create). Verified by Playwright against the live API asserting no document navigation and the new stock-row present.\" && ./scripts/lk consort-response-formatter --role architect-reviewer --feature F1-stock-visibility --story S2-view-stock-by-location","description":"Annotate S2 ACs as E2E and run self-check"}
- Bash {"command":"cd <PROJECT_ROOT> && a(){ ./scripts/lk consort-annotate-ac --feature F1-stock-visibility --story S2-view-stock-by-location --layer E2E --api-contract EP2-list-stock-records \"$@\"; }; a --ac AC1-table-lists-records-by-location --ui-seams \"stock-table,stock-row,location-group,stock-cell-sku,stock-cell-location,stock-cell-quantity\" --notes \"E2E client-server contract: the home page (client/src/pages via a hooks/api list hook) fetches GET /api/stock-records from app/routes/stock_records.py, which delegates to app/services/stock_records.py; the repository app/repositories/stock_records.py owns the ORDER BY location, sku query (AP1). The client renders one stock-row per item grouped under location-group headers without re-sorting. Verified by Playwright against the live API over three seeded rows on the paired branch, plus a pytest-bdd API test asserting the list order.\" && a --ac AC2-empty-state-when-no-records --ui-seams \"empty-state,empty-state-cta,stock-table\" --notes \"E2E client-server contract: when the real GET /api/stock-records returns an empty array the client renders the empty-state ('No stock filed yet') with empty-state-cta linking to /stock/new and does NOT render stock-table. The empty-vs-populated decision is driven by the server response, not static props. Verified by Playwright against the live API with the paired branch's stock_records cleared.\" && a --ac AC3-untracked-code-shows-not-tracked --ui-seams \"stock-row,stock-cell-tracking-code,not-tracked\" --notes \"E2E client-server contract: the list returns tracking_code as null for an untracked record (stored NULL per S1 AC2/OD2); the client maps null to the not-tracked pill in stock-cell-tracking-code and renders the value otherwise, never blank or 'null'. Rendering lives in a presentational component under client/src/components; no server-side placeholder. Verified by Playwright against the live API with one NULL and one tracked row seeded on the paired branch (plus a component test for the null -> pill mapping).\" && a --ac AC4-new-record-appears-without-reload --ui-seams \"stock-record-form,stock-record-submit,stock-record-success,stock-table,stock-row\" --notes \"E2E client-server contract across S1+S2: filing via POST /api/stock-records (EP1), then SPA navigation back to / re-fetches GET /api/stock-records on route mount (no cached stale list), so the NUT-09/C-03/8 row appears with no full-page reload (NFR5). Freshness is owned by the client list hook (fetch on mount / invalidate after create). Verified by Playwright against the live API asserting no document navigation and the new stock-row present.\" && ./scripts/lk consort-response-formatter --role architect-reviewer --feature F1-stock-visibility --story S2-view-stock-by-location","description":"Annotate S2 ACs as E2E and run self-check"}
- Read {"file_path":"<PROJECT_ROOT>/.consort/features/F1-stock-visibility/architecture.md","offset":20,"limit":30}
- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility && python3 - <<'EOF'\np='architecture.md';s=open(p).read()\ns=s.replace(\"- Boundary maps domain errors to HTTP (422/409) only; no business logic in routes or client.\\n\",\n\"- Boundary maps domain errors to HTTP (422/409) only; no business logic in routes or client.\\n- S2: `StockRecordService.list()` -> `StockRecordRepository.list_ordered()` (ORDER BY location, sku; AP1) behind `GET /api/stock-records` (EP2, bare list). Client list hook fetches on route mount so SPA return from `/stock/new` is fresh; null `tracking_code` -> `not-tracked` pill in a presentational component.\\n\")\ns=s.replace(\"- IA lists Batch/Serial inputs\",\"- IA S2 table shows Batch/Serial/Par level columns not in the F1 schema; they render `not-tracked` client-side until F6/F2 (no API field).\\n- IA lists Batch/Serial inputs\")\ns=s.replace(\"Playwright E2E against the live API: AC1, AC3, AC4 (with DB-state assertions).\",\n\"Playwright E2E against the live API: S1 AC1, AC3, AC4, AC5 (AC5 also component-tested for the 409 -> `stock-record-duplicate-error` mapping) with DB-state assertions; S2 AC1–AC4 (seeded/cleared on the paired branch), plus a pytest-bdd API test for EP2 ordering (AP1).\")\nopen(p,'w').write(s)\nEOF","description":"Add S2 patterns, risk, and test strategy to architecture.md"}

## Final reasoning

All four S2 ACs are now tagged E2E with notes and IA seams, and the self-check passes. `architecture.json` gains the `EP2-list-stock-records` list endpoint and access pattern `AP1-list-ordered-by-location`, which brings the DBA back in for an index decision. The IA table shows Batch/Serial/Par level columns the F1 schema doesn't have, so I recorded that in the `architecture.md` Risks section.
