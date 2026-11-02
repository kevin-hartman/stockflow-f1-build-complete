# driver (driver) – opus

## Prompt

```
Make ALL of story S1-file-stock-record's failing tests GREEN in one pass (simplest honest code); implement until every one of the story's tests passes, then run the story's tests once. UI track is ON: the UI must adhere to the project design guide at <PROJECT_ROOT>/.consort/design/design-guide.md (+ the design-guide.json tokens). Build to it. RUBRIC (pre-extracted; judge against THIS) :: layers=E2E, API | required NFRs, NFR1-data-survival; NFR2-never-negative; NFR3-unique-addressability; NFR6-scan-response; NFR7-field-named-validation; NFR9-graceful-rendering; NFR10-findability | design-token groups, app_name, app_icon, typography, colors, spacing, radius, shadows, breakpoints, motion, components. The rubric above is pre-extracted from <PROJECT_ROOT>/.consort/features/F1-stock-visibility/architecture.md, <PROJECT_ROOT>/.consort/nfrs.md, and <PROJECT_ROOT>/.consort/design/design-guide.md, open those full files ONLY if you need more detail than it carries (do not re-read them by default). LAYOUT (place/judge code at THESE paths, do not scan for them) :: boundary=app/routes (react) | service=app/services | repository=app/repositories | models=app/models | infrastructure=app/database.py. RUN/REACHABILITY :: python project – source under app/. To confirm the app boots or is reachable, run `uv run uvicorn app.main:app` and GET the health path over HTTP. Reachability is an HTTP response, never just an import succeeding. TESTS :: this story's behavior tests are under tests/step_defs/ (one file per story). Iterate against the single failing test while fixing; the honest-GREEN full run is the authoritative verify. Be terse: produce ONLY the required artifact file(s) on disk, then stop with at most a one-line confirmation. Do NOT print a plan, a summary of what you did, rationale, tables, or restate the artifacts to stdout, that output is wasted latency. The files on disk are the deliverable, not your prose.
```

## Tools used

- Bash {"command":"git status --short | head -30; ls; ls app app/* tests tests/* client client/src 2>/dev/null | head -100; ls .consort/cycles/F1-stock-visibility/S1-file-stock-record 2>/dev/null","description":"Survey project layout and git status"}
- Bash {"command":"cat .consort/features/F1-stock-visibility/stories/S1-file-stock-record/test-list-per-story.json; git diff tests/; ls tests/e2e client/tests client/tests/* ; find client/src -type f","description":"Read story test list and test diffs"}
- Bash {"command":"cat app/services/stock_records.py app/routes/stock_records.py","description":"Read stock records service and route"}
- Bash {"command":"uv run pytest tests/test_s1_file_stock_record.py -q 2>&1 | tail -15","description":"Run story S1 backend tests","timeout":300000}
- Bash {"command":"./scripts/lk consort-log --role driver --feature F1-stock-visibility --cycle S1-file-stock-record --level info --event reasoning --message \"AC2 T8-T11 already satisfied: service normalizes blank/whitespace/omitted tracking_code to NULL; no code change. 19/19 story tests pass.\" 2>&1 | tail -2; ./scripts/lk consort-response-formatter --role driver --feature F1-stock-visibility --story S1-file-stock-record 2>&1 | tail -5","description":"Log driver reasoning and run layering/ux self-check"}

## Final reasoning

All 19 tests in S1-file-stock-record pass. I didn't change any code: the existing service already turns a blank, whitespace-only or missing `tracking_code` into NULL, so the four pending AC2 tests (T8–T11) passed as soon as they ran. The layering and design-adherence self-check also passes.
