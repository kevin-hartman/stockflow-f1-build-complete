# architect-reviewer (architect-reviewer) – opus

## Prompt

```
Annotate story S3-view-sku-detail's acceptance criteria + nfrs.md coverage. Author architectural_notes for ALL of story S3-view-sku-detail's ACs: AC1-open-detail-from-row, AC2-absent-tracking-code-not-tracked, AC3-par-level-judged-independently. Every one of this story's ACs MUST end up with a non-empty "architectural_notes" field in its acs/<AC>.json (the layer it lives in + how it realizes the design) — the design gate verifies that, and the spec-author's "layer" field does NOT count. architectural_notes are per-AC, so author the scoped ACs above even when the feature-level architecture.json already exists from an earlier story. For every E2E AC, ALSO pass consort-annotate-ac --ui-seams with the ia.md data-testid seam token(s) the AC's UI drives — the column / cell / region / empty-state / form field it asserts (e.g. "stock-cell-tracking,stock-not-tracked"). A deterministic gate checks each seam is named in <PROJECT_ROOT>/.consort/design/ia.md; if the AC needs a surface the IA does not yet name, declare the seam you need anyway and the gate routes the ux-designer to add it to ia.md. In architecture.json, make an EXPLICIT service_backed call (required): set service_backed:true if the feature persists data (a DB table/migration) or carries business logic, and then you MUST declare boundary, service, and repository layers (plus a "models" PACKAGE app/models/, one module per domain object, NOT a flat app/models.py, when it persists entities); set false ONLY for a trivial static/read-through endpoint. An Infra-layer AC or a migration/schema/storage NFR while service_backed is false hard-blocks the gate. When service_backed:true you MUST also declare architecture.json persistence_invariants[]: the DB-level guarantees the schema enforces (each with id, type one of unique|foreign_key|cascade|not_null|check|transactional|migration_reversible, table, and a one-line brief), covering unique/composite keys, foreign keys + cascade rules, NOT NULL / CHECK constraints, any transactional-atomicity boundary, and migration reversibility. The test-strategist must cover each with a real-branch test; a service_backed feature with no persistence_invariants hard-blocks the gate. When THIS story introduces a NEW read/query shape over the schema — a filter, lookup, sort, or join an AC drives (e.g. "list stock filtered by location", "look up a SKU's rows by sku") that is an INDEX candidate — declare it in architecture.json access_patterns[] (id, a one-line brief, and the table + column(s) it reads) so the DBA is pulled back in to reconsider the physical design for it; this is how a later READ story evolves the schema, since a story that adds no persistence_invariant would otherwise skip the DBA. Declare an access_pattern ONLY for a genuinely new query shape (not for every read, and not for one already covered by a prior story's pattern or a primary-key lookup). REUSE the established project architecture conventions (set by F1-stock-visibility): boundary=app/routes (react), service=app/services, repository=app/repositories, models=app/models, infrastructure=app/database.py. Declare the SAME role -> module paths in architecture.json, do NOT remap or rename an established layer; a divergent layout hard-blocks the spec gate and mismatches the inherited code. Author this story's architectural_notes FRESH from the ACs + IA on disk this turn. On a reflect-revise re-run the self-heal clears this story's prior architectural_notes BY DESIGN, so an absent/empty prior is the expected revise state — re-derive against the corrected ACs + IA. Write every artifact under the ABSOLUTE artifact root <PROJECT_ROOT>/.consort (this feature: <PROJECT_ROOT>/.consort/features/F1-stock-visibility/; this story: <PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S3-view-sku-detail/); use that absolute path and never resolve or guess the project root yourself.CROSS-STORY CONTEXT — this story is NOT reviewed in isolation. The feature's OTHER stories' ACs, the architecture's open_decisions, and its mandated (not-null) persistence fields are below; use them for the cross-story checks (an AC contradicting a gated sibling AC; a mandated field no sibling submit AC supplies). This IS that context — do not run `consort-cross-story-context` yourself.

{
  "current_story": "S3-view-sku-detail",
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
    },
    {
      "story": "S2-view-stock-by-location",
      "acs": [
        {
          "ac_id": "AC1-table-lists-records-by-location",
          "status": "draft",
          "layer": "E2E",
          "given": "stock records exist for (WID-001, A-01, quantity 12), (BOLT-07, A-01, quantity 40) and (WID-001, B-02, quantity 3)",
          "when": "the operator opens the home view",
          "then": "a stock-by-location table shows exactly those three records, one row each with its SKU, location and quantity, ordered by location so all records at the same location are adjacent",
          "architectural_notes": "E2E client-server contract: the home page (client/src/pages via a hooks/api list hook) fetches GET /api/stock-records from app/routes/stock_records.py, which delegates to app/services/stock_records.py; the repository app/repositories/stock_records.py owns the ORDER BY location, sku query (AP1). The client renders one stock-row per item grouped under location-group headers without re-sorting. Verified by Playwright against the live API over three seeded rows on the paired branch, plus a pytest-bdd API test asserting the list order."
        },
        {
          "ac_id": "AC2-empty-state-when-no-records",
          "status": "draft",
          "layer": "E2E",
          "given": "no stock records exist",
          "when": "the operator opens the home view",
          "then": "an explicit empty state is shown in place of the table that says no stock has been filed yet and points to the form for filing a first record, rather than a blank page or an empty table",
          "architectural_notes": "E2E client-server contract: when the real GET /api/stock-records returns an empty array the client renders the empty-state ('No stock filed yet') with empty-state-cta linking to /stock/new and does NOT render stock-table. The empty-vs-populated decision is driven by the server response, not static props. Verified by Playwright against the live API with the paired branch's stock_records cleared."
        },
        {
          "ac_id": "AC3-untracked-code-shows-not-tracked",
          "status": "draft",
          "layer": "E2E",
          "given": "a stock record exists for (WID-001, A-01, quantity 12) with no tracking code, alongside a record for (BOLT-07, A-01, quantity 40) with a tracking code",
          "when": "the operator opens the home view",
          "then": "the WID-001 row renders cleanly with its tracking code shown as \"not tracked\", while the BOLT-07 row shows its tracking code",
          "architectural_notes": "E2E client-server contract: the list returns tracking_code as null for an untracked record (stored NULL per S1 AC2/OD2); the client maps null to the not-tracked pill in stock-cell-tracking-code and renders the value otherwise, never blank or 'null'. Rendering lives in a presentational component under client/src/components; no server-side placeholder. Verified by Playwright against the live API with one NULL and one tracked row seeded on the paired branch (plus a component test for the null -> pill mapping)."
        },
        {
          "ac_id": "AC4-new-record-appears-without-reload",
          "status": "draft",
          "layer": "E2E",
          "given": "the operator is in the app with the home stock table showing no record for (NUT-09, C-03)",
          "when": "they file a valid record for SKU \"NUT-09\", location \"C-03\", quantity 8 through the form and return to the home view",
          "then": "the home table includes a NUT-09 / C-03 / 8 row without a full-page reload of the app",
          "architectural_notes": "E2E client-server contract across S1+S2: filing via POST /api/stock-records (EP1), then SPA navigation back to / re-fetches GET /api/stock-records on route mount (no cached stale list), so the NUT-09/C-03/8 row appears with no full-page reload (NFR5). Freshness is owned by the client list hook (fetch on mount / invalidate after create). Verified by Playwright against the live API asserting no document navigation and the new stock-row present."
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

- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility && cat stories/S3-view-sku-detail/acs/*.json && cat architecture.json && grep -n -i -E \"detail|sku-|par\" ../../design/ia.md | head -60","description":"Read S3 ACs, architecture, IA detail seams"}
- Bash {"command":"python3 - <<'EOF'\nimport json\np='architecture.json'; a=json.load(open(p))\na['api_contracts']=[c for c in a['api_contracts'] if c['id']!='EP3-get-stock-record-detail']\na['api_contracts'].append({\"id\":\"EP3-get-stock-record-detail\",\"method\":\"GET\",\"path\":\"/api/stock-records/{sku}\",\"query\":[\"location\"],\"shape\":\"object\",\"item\":\"Single record object for the exact (sku, location) key: {id: int, sku: string, location: string, quantity: int, tracking_code: string|null, par_level: int|null}. par_level is always null in F1 (no par-level storage until a later feature). 404 body {error: 'Stock record not found'} when no row matches.\",\"story\":\"S3-view-sku-detail\"})\na['open_decisions']=[o for o in a['open_decisions'] if o['id']!='OD4-par-level-source']\na['open_decisions'].append({\"id\":\"OD4-par-level-source\",\"question\":\"Where does a record's par level come from in F1, given stock_records has no par-level column?\",\"decision_status\":\"resolved\",\"resolved_by_story\":\"S3-view-sku-detail\",\"resolution\":\"F1 stores no par level; the EP3 detail contract returns par_level: null (rendered 'not tracked'). A later par-level feature adds a nullable column additively. Consistent with S2's par-level column showing 'not tracked'; no sibling AC contradicted.\"})\nn=[x for x in a['nfrs'] if x['id']=='NFR9-graceful-rendering'][0]\nn['requirement']=\"An absent tracking code is stored as NULL (S1) so readers (S2 list, S3 detail) render an explicit 'not tracked'; each optional field (tracking code, par level) is judged independently; empty location state is owned by S2.\"\njson.dump(a,open(p,'w'),indent=2)\nEOF\ngrep -n \"^#\" architecture.md","description":"Add S3 detail contract + par-level decision"}
- Read {"file_path":"<PROJECT_ROOT>/.consort/features/F1-stock-visibility/architecture.md","offset":20}
- Bash {"command":"cd <PROJECT_ROOT> && L=\"./scripts/lk consort-annotate-ac --feature F1-stock-visibility --story S3-view-sku-detail\" && \\\n$L --ac AC1-open-detail-from-row --layer E2E --api-contract EP3-get-stock-record-detail --ui-seams \"stock-row,sku-detail,detail-sku,detail-location,detail-quantity,detail-tracking-code\" --notes \"E2E client-server contract: clicking a home stock-row SPA-navigates to /sku/:sku?location= and the detail page (client/src/pages via a hooks/api detail hook) fetches EP3 from app/routes/stock_records.py, which delegates to app/services/stock_records.py; the repository app/repositories/stock_records.py does an exact (sku, location) lookup served by the PI1 unique index, so only that record is returned. Verified by Playwright against the live API over two seeded rows on the paired branch (no document navigation, no BOLT-07 data), plus a pytest-bdd API test of the exact-key lookup and 404 on a miss.\" && \\\n$L --ac AC2-absent-tracking-code-not-tracked --layer E2E --api-contract EP3-get-stock-record-detail --ui-seams \"sku-detail,detail-tracking-code,detail-not-tracked\" --notes \"E2E client-server contract: the detail response carries tracking_code null for a record stored with NULL (S1 AC2/OD2); the presentational detail component under client/src/components maps null to the detail-not-tracked pill inside detail-tracking-code, never blank, 'null' or an error. No server-side placeholder (NFR9). Verified by Playwright against the live API with a NULL-tracking row seeded on the paired branch, plus a component test for the null -> pill mapping.\" && \\\n$L --ac AC3-par-level-judged-independently --layer E2E --api-contract EP3-get-stock-record-detail --ui-seams \"sku-detail,detail-par-level,detail-tracking-code,detail-not-tracked\" --notes \"E2E client-server contract: the detail response returns par_level null (F1 stores no par level, OD4) alongside the real tracking_code; the client judges each optional field on its own via one per-field null -> detail-not-tracked mapping, so detail-par-level shows 'not tracked' while detail-tracking-code shows A01-B7-S0042. Owner client/src/components detail field renderer; service passes fields through unaltered. Verified by Playwright against the live API with a tracked row seeded on the paired branch.\" && \\\n./scripts/lk consort-response-formatter --role architect-reviewer --feature F1-stock-visibility --story S3-view-sku-detail","description":"Annotate S3 ACs and self-check"}
- Bash {"command":"cd <PROJECT_ROOT> && a(){ ./scripts/lk consort-annotate-ac --feature F1-stock-visibility --story S3-view-sku-detail --layer E2E --api-contract EP3-get-stock-record-detail \"$@\"; } && \\\na --ac AC1-open-detail-from-row --ui-seams \"stock-row,sku-detail,detail-sku,detail-location,detail-quantity,detail-tracking-code\" --notes \"E2E client-server contract: clicking a home stock-row SPA-navigates to /sku/:sku?location= and the detail page (client/src/pages via a hooks/api detail hook) fetches EP3 from app/routes/stock_records.py, which delegates to app/services/stock_records.py; the repository app/repositories/stock_records.py does an exact (sku, location) lookup served by the PI1 unique index, so only that record is returned. Verified by Playwright against the live API over two seeded rows on the paired branch (no document navigation, no BOLT-07 data), plus a pytest-bdd API test of the exact-key lookup and 404 on a miss.\" && \\\na --ac AC2-absent-tracking-code-not-tracked --ui-seams \"sku-detail,detail-tracking-code,detail-not-tracked\" --notes \"E2E client-server contract: the detail response carries tracking_code null for a record stored with NULL (S1 AC2/OD2); the presentational detail component under client/src/components maps null to the detail-not-tracked pill inside detail-tracking-code, never blank, 'null' or an error. No server-side placeholder (NFR9). Verified by Playwright against the live API with a NULL-tracking row seeded on the paired branch, plus a component test for the null -> pill mapping.\" && \\\na --ac AC3-par-level-judged-independently --ui-seams \"sku-detail,detail-par-level,detail-tracking-code,detail-not-tracked\" --notes \"E2E client-server contract: the detail response returns par_level null (F1 stores no par level, OD4) alongside the real tracking_code; the client judges each optional field on its own via one per-field null -> detail-not-tracked mapping, so detail-par-level shows 'not tracked' while detail-tracking-code shows A01-B7-S0042. Owner client/src/components detail field renderer; service passes fields through unaltered. Verified by Playwright against the live API with a tracked row seeded on the paired branch.\" && \\\n./scripts/lk consort-response-formatter --role architect-reviewer --feature F1-stock-visibility --story S3-view-sku-detail","description":"Annotate S3 ACs and self-check"}
- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility && python3 - <<'EOF'\np='architecture.md'; s=open(p).read()\ns=s.replace(\"null `tracking_code` -> `not-tracked` pill in a presentational component.\\n\",\"null `tracking_code` -> `not-tracked` pill in a presentational component.\\n- S3: `StockRecordService.get(sku, location)` -> `StockRecordRepository.get_by_key` (exact-key lookup served by the PI1 unique index; no new access pattern) behind `GET /api/stock-records/{sku}?location=` (EP3, object, 404 on miss, `par_level` always null in F1). Detail page renders each optional field through one per-field null -> `detail-not-tracked` mapping.\\n\",1)\ns=s.replace(\"- IA lists Batch/Serial inputs\",\"- S3 detail returns `par_level: null` with no backing column (OD4); a later par-level feature must add a nullable column additively and populate EP3.\\n- IA lists Batch/Serial inputs\",1)\ns=s.replace(\"\\n## Test strategy\",\"- S3 par level source: **not stored in F1**; EP3 returns null -> 'not tracked' — resolved (OD4).\\n\\n## Test strategy\",1)\ns=s.replace(\"plus a pytest-bdd API test for EP2 ordering (AP1).\",\"plus a pytest-bdd API test for EP2 ordering (AP1); S3 AC1–AC3 via Playwright against the live API on seeded paired-branch rows, plus a pytest-bdd API test for EP3 exact-key lookup + 404.\",1)\nopen(p,'w').write(s)\nEOF","description":"Add S3 sections to architecture.md"}

## Final reasoning

I annotated all three S3 ACs as E2E with their architectural notes and UI seams, and they pass the self-check. I also added a detail endpoint, `GET /api/stock-records/{sku}?location=`, to `architecture.json`, and resolved a new open decision that F1 stores no par level, so the detail view always shows it as "not tracked". `architecture.md` has the matching S3 updates.
