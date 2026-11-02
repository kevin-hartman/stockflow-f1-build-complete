# navigator-reconcile (navigator) – sonnet

## Prompt

```
FEATURE-COMPLETE RECONCILIATION for F1-stock-visibility: every story is now designed + gated. Independently check the WHOLE set of stories against ITSELF — symmetrically, every story vs every other, INCLUDING the first-designed story (which was never checked against its later siblings). The cross-story context (all stories' ACs + the architecture's open_decisions + its mandated not-null fields) is injected below. Look ONLY for CROSS-STORY defects: an AC that contradicts another story's gated AC; a mandated (not-null) field no story's submit AC supplies; two stories' ACs overlapping on the same observable behavior; a persistence invariant anchored to the wrong story. Do NOT re-review a single story in isolation — each already passed its own reflect + gate. Write the verdict to <PROJECT_ROOT>/.consort/features/F1-stock-visibility/reconcile-verdict.json: {"version":1,"passed":<bool>,"findings":[{"owner":"spec-author"|"test-strategist"|"architect-reviewer"|"ux-designer","story":"<the OWNING story to change>","detail":"<the cross-story defect>","ac_ids":["<exact AC id(s)>"],"severity":"blocking"|"advisory"}]}. Use passed:true with findings:[] when the stories are mutually consistent. Each finding names the OWNING story (the one reopened + changed) and its author. Produce ONLY the verdict file, then stop.FEATURE-COMPLETE CROSS-STORY RECONCILIATION — every story below is now designed + gated. Check the WHOLE set against ITSELF, symmetrically (every story vs every other, including the first-designed one): an AC that contradicts another story's gated AC; a mandated (not-null) field no story's submit AC supplies; two stories' ACs that overlap on the same observable behavior; an invariant anchored to the wrong story. For each defect, name the OWNING story (the one to change) + its author (owner). This IS the context — do not run `consort-cross-story-context` yourself.

{
  "stories": [
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
    },
    {
      "story": "S3-view-sku-detail",
      "acs": [
        {
          "ac_id": "AC1-open-detail-from-row",
          "status": "draft",
          "layer": "E2E",
          "given": "stock records exist for (WID-001, A-01, quantity 12, tracking code \"A01-B7-S0042\") and (BOLT-07, A-01, quantity 40)",
          "when": "the operator clicks the WID-001 / A-01 row in the home stock table",
          "then": "the SKU detail view for that one record opens without a full-page reload, showing SKU WID-001, location A-01, quantity 12 and tracking code A01-B7-S0042, and no data from the BOLT-07 record",
          "architectural_notes": "E2E client-server contract: clicking a home stock-row SPA-navigates to /sku/:sku?location= and the detail page (client/src/pages via a hooks/api detail hook) fetches EP3 from app/routes/stock_records.py, which delegates to app/services/stock_records.py; the repository app/repositories/stock_records.py does an exact (sku, location) lookup served by the PI1 unique index, so only that record is returned. Verified by Playwright against the live API over two seeded rows on the paired branch (no document navigation, no BOLT-07 data), plus a pytest-bdd API test of the exact-key lookup and 404 on a miss."
        },
        {
          "ac_id": "AC2-absent-tracking-code-not-tracked",
          "status": "draft",
          "layer": "E2E",
          "given": "a stock record exists for (WID-001, A-01, quantity 12) filed with no tracking code",
          "when": "the operator opens that record's SKU detail view",
          "then": "the view renders cleanly with SKU, location and quantity shown and the tracking code field showing \"not tracked\" (not blank, 'null' or an error)",
          "architectural_notes": "E2E client-server contract: the detail response carries tracking_code null for a record stored with NULL (S1 AC2/OD2); the presentational detail component under client/src/components maps null to the detail-not-tracked pill inside detail-tracking-code, never blank, 'null' or an error. No server-side placeholder (NFR9). Verified by Playwright against the live API with a NULL-tracking row seeded on the paired branch, plus a component test for the null -> pill mapping."
        },
        {
          "ac_id": "AC3-par-level-judged-independently",
          "status": "draft",
          "layer": "E2E",
          "given": "a stock record exists for (WID-001, A-01, quantity 12, tracking code \"A01-B7-S0042\") with no par level recorded",
          "when": "the operator opens that record's SKU detail view",
          "then": "the par level field shows \"not tracked\" while the tracking code field on the same view shows A01-B7-S0042, each optional field judged on its own",
          "architectural_notes": "E2E client-server contract: the detail response returns par_level null (F1 stores no par level, OD4) alongside the real tracking_code; the client judges each optional field on its own via one per-field null -> detail-not-tracked mapping, so detail-par-level shows 'not tracked' while detail-tracking-code shows A01-B7-S0042. Owner client/src/components detail field renderer; service passes fields through unaltered. Verified by Playwright against the live API with a tracked row seeded on the paired branch."
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
    },
    {
      "id": "OD4-par-level-source",
      "question": "Where does a record's par level come from in F1, given stock_records has no par-level column?",
      "decision_status": "resolved",
      "resolved_by_story": "S3-view-sku-detail",
      "resolution": "F1 stores no par level; the EP3 detail contract returns par_level: null (rendered 'not tracked'). A later par-level feature adds a nullable column additively. Consistent with S2's par-level column showing 'not tracked'; no sibling AC contradicted."
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

- Write {"file_path":"<PROJECT_ROOT>/.consort/features/F1-stock-visibility/reconcile-verdict.json","content":"{\"version\":1,\"passed\":true,\"findings\":[{\"owner\":\"spec-author\",\"story\":\"S2-view-stock-by-location\",\"detail\":\"OD4's resolution says it is consistent with 'S2's par-level column showing not tracked', but no S2 AC specifies a par-level column. Par level is only covered in S3 AC3. Either add it to S2 or correct the OD4 wording. Nothing contradicts, so this is advisory.\",\"ac_ids\":[\"AC1-table-lists-records-by-location\",\"AC3-untracked-code-shows-not-tracked\"],\"severity\":\"advisory\"}]}\n"}

## Final reasoning

I wrote the verdict to `reconcile-verdict.json` with `passed: true` and one advisory finding.

The stories are consistent with each other. The advisory is on S2: OD4's resolution mentions an S2 par-level column, but no S2 AC specifies one (par level is only covered in S3 AC3).
