# navigator-reflect (navigator) – sonnet

## Prompt

```
REFLECT on story S2-view-stock-by-location BEFORE the build lane: independently critique its spec slice (<PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S2-view-stock-by-location/story.json + acs/*.json) and its test-list (<PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S2-view-stock-by-location/test-list-per-story.json) against the architecture (<PROJECT_ROOT>/.consort/features/F1-stock-visibility/architecture.md/.json), the NFRs (<PROJECT_ROOT>/.consort/nfrs.md — a project-level file, NOT under the feature dir), and the information architecture (<PROJECT_ROOT>/.consort/design/ia.md). RUBRIC (pre-extracted; judge against THIS) :: layer=E2E | required NFRs, NFR6-scan-response; NFR9-graceful-rendering; NFR10-findability | design-token groups, app_name, app_icon, typography, colors, spacing, radius, shadows, breakpoints, motion, components. Look ONLY for design-time defects that would waste a build cycle. The DETERMINISTIC pre-reflect gate has ALREADY verified the structural classes — client-kind↔AC-layer coherence, E2E-layer coverage by a real Playwright spec, and that no real-browser navigation/reload assertion sits in the jsdom component harness — so do NOT spend a finding re-flagging those; focus on the SEMANTIC defects: (1) ACs that contradict each other; (2) an AC with no covering test, or a test that contradicts its AC; (3) an NFR with no fitness test; (4) a test asserting at a layer the architecture forbids; (5) an AC whose declared layer conflicts with the architecture; (6) an untestable/vacuous AC (no observable outcome); (7) a UI-styling test that asserts inline HTML style or raw CSS in the page SOURCE (e.g. a text-align/color/font check inside a style= attr) for a property the design-guide + design-adherence gate govern, instead of the rendered SEAM (the element carries the design-guide class / data-testid): such a test hard-codes the very inline style the design lane then refactors into a token-driven class, so it blocks that refactor (the ui-style-implementation-test smell); (8) for EACH user-facing AC (declared layer E2E or client): read <PROJECT_ROOT>/.consort/design/ia.md and locate the screen, form, or data-testid seam that AC asserts among the IA's Screens, Navigation, and User flows — emit a ux-designer finding naming every asserted surface the IA leaves out, because the architect would otherwise tag an E2E layer against a screen the IA does not define (the ia refinement adds the missing surface). ALSO, when that AC asserts an INTERACTIVE control (a filter, selector, combobox, search), the IA must name a control the user can OPERATE to reach EVERY state the AC asserts: the control's declared option source must cover the asserted values and its empty / no-match state must be reachable THROUGH the control (e.g. an all-values accessible combobox, not a native datalist whose options are only the filtered rows and whose empty option is unselectable) — emit a ux-designer finding when the IA's control cannot reach an asserted state. This control-SEMANTICS check is the twin of the surface-existence check: a surface the IA NAMES but whose control a user cannot operate to the asserted state is still an ia defect, not a build detail or a test bypass; Do NOT critique implementation, style, or scope, only buildability + internal consistency of THIS story's artifacts. BE EXHAUSTIVE in this ONE pass: findings[] is multi-valued — run EVERY check against EVERY AC, test-list item, and NFR, and emit a SEPARATE finding for EACH distinct defect (decompose a LEGACY multi-part singular NFR fitness_function into its sub-guarantees and flag every uncovered clause — but an NFR that already declares the ATOMIC fitness_functions ARRAY is coverage-checked DETERMINISTICALLY by checkFitnessClauseCoverage at the test_list gate, so do NOT re-decompose it). Do NOT return one finding at a time: the reflect↔revise loop is bounded and escalates after a few laps, so a piecemeal reflect burns that budget on repeated revise→re-test→reflect laps and can hand the human a still-defective design. Write your verdict to <PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S2-view-stock-by-location/reflect-verdict.json as {"version":1,"passed":<bool>,"findings":[{"owner":"spec-author"|"test-strategist"|"architect-reviewer"|"ux-designer","detail":"<the defect>","ac_ids":["<exact story AC id(s) this finding is about>"]}]}. passed:true with findings:[] when the spec + test-list are consistent + buildable (the common case, do NOT invent defects). Attribute each finding to its OWNING role so the fix routes to the right gate: spec-author (an AC/spec defect — the given/when/then or scope); architect-reviewer (an ARCHITECTURE defect — checks 4 and 5, i.e. a wrong layer tag, OR a route/path/contract in an AC's architectural_notes that disagrees with the IA or the tests, OR a persistence invariant that contradicts the AC; this is the architect's product, NOT the spec-author's, so do NOT attribute a notes/layer defect to spec-author); test-strategist (a test-list/coverage defect); ux-designer (a user-facing AC whose surface the IA does not name — defect 8). Set "ac_ids" to the EXACT story AC id(s) the finding concerns (verbatim, from this story's acs/) — the revise re-derives ONLY those ACs' test items; omit ac_ids (or []) ONLY for a whole-story defect that needs the entire test-list rebuilt. Write ONLY that file; the orchestrator routes any fix deterministically.CROSS-STORY CONTEXT — this story is NOT reviewed in isolation. The feature's OTHER stories' ACs, the architecture's open_decisions, and its mandated (not-null) persistence fields are below; use them for the cross-story checks (an AC contradicting a gated sibling AC; a mandated field no sibling submit AC supplies). This IS that context — do not run `consort-cross-story-context` yourself.

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

- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S2-view-stock-by-location; cat story.json acs/*.json test-list-per-story.json; cat ../../../design/ia.md","description":"Read story, ACs, test list, IA"}
- Bash {"command":"cd <PROJECT_ROOT>/.consort; cat nfrs.md | head -120","description":"Read NFRs"}
- Bash {"command":"cd <PROJECT_ROOT>/.consort; ls design; cd features/F1-stock-visibility/stories/S2-view-stock-by-location; cat acs/AC4*.json acs/AC5*.json 2>/dev/null; ls acs; python3 -I -c \"\nimport json;d=json.load(open('test-list-per-story.json'));\nfor i in d['tests'] if 'tests' in d else d['items']:\n  print(i['id'],i['ac_id'],i['kind'],i.get('nfr_id'),i['description'][:110])\"; grep -n -i -E \"filter|search|location-group|stock-row|not tracked|empty\" ../../../../design/ia.md | head -50","description":"Inspect remaining ACs, test summary, IA"}
- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility; grep -n -i -E \"NFR6|NFR9|NFR10\" architecture.md architecture.json | cut -c1-400; sed -n 1,200p stories/S2-view-stock-by-location/acs/AC4*.json | grep -E \"then|notes\"|cut -c1-600; python3 -I -c \"\nimport json;d=json.load(open('stories/S2-view-stock-by-location/test-list-per-story.json'));print([i['description'] for i in d['tests'] if i['id'] in('T39','T40','T41','T42')])\"","description":"Check NFR mapping and AC4"}
- Bash {"command":"cd <PROJECT_ROOT>/.consort/features/F1-stock-visibility; sed -n 160,225p architecture.json","description":"Read NFR entries"}
- Write {"file_path":"<PROJECT_ROOT>/.consort/features/F1-stock-visibility/stories/S2-view-stock-by-location/reflect-verdict.json","content":"{\"version\":1,\"passed\":true,\"findings\":[]}\n"}

## Final reasoning

I've finished the reflect on S2 and found no design defects. I wrote `reflect-verdict.json` with `passed: true` and an empty `findings` list.
