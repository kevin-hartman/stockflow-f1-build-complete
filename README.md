# StockFlow – F1 build-complete snapshot

## What this is

A **ready-to-run snapshot** of StockFlow, a warehouse-management app for a mid-market
operation that has outgrown spreadsheets. **V1** lets the team see stock at one warehouse –
file a SKU's stock at a location, see it in a scannable by-location table, and drill into a
SKU's detail – as a React single-page client on a JSON API over Lakebase Postgres.

It's built with **[Consort](https://github.com/databricks-solutions/consort)**, a spec-first,
test-driven agent framework for apps on **Lakebase** (Databricks serverless Postgres). Consort
walks a feature through two lanes: a *design* lane (plan → spec → UX → architecture → tests)
and a *build* lane (TDD: RED → GREEN → REFACTOR).

**The purpose of this repo is to skip BOTH lanes and go straight to a working app.** Feature F1
is fully designed **and** built – every story is implemented, its tests pass against a real
Lakebase branch, and the working software gate is approved – so you can stand this up as your
own project and immediately run it, explore the code, or replay the whole build in the dashboard,
without redoing any of the design or TDD work.

## Where we are

Feature F1 is **build-complete**: designed, built (TDD, tests green on Lakebase), and
deploy-verified at the working-software gate.

> **Branch state — not yet merged for release.** The F1 software (code + tests) lives on the
> `feature-f1-stock-visibility` branch and has **not** been merged into `staging`. `main` and
> `staging` carry only the trunk scaffold and the design corpus; the feature's implementation is
> unmerged. This snapshot captures F1 at the built-and-verified stage, **before** the
> promote/release merge up the tier chain — so you clone and work on `feature-f1-stock-visibility`,
> and the release (staging→main promotion) is still ahead of you.

- **Planning:** complete. Sprint `v1` is locked, with the F1–F10 backlog proposed and sized.
- **Feature F1 – "Stock visibility":** build complete – the feature-spec, UX design-guide,
  architecture, db-design, and ordered test-list are authored and gated (in `.consort/`), and
  all three stories are implemented with passing tests and an approved working-software gate
  (`gates.json` + `deploy-evidence.json`):
  - `S1-file-stock-record` – file a stock record (SKU, location, quantity, tracking code) with inline fields
  - `S2-stock-by-location-table` – see a scannable stock-by-location table on the home view
  - `S3-sku-detail-view` – click a row to see that record's SKU detail across its locations
- **Dashboard replay:** the build run is captured on the feature branch (`agent-log.jsonl`,
  `turns/`, `next.json`, plus the per-test table snapshots and interactions), so a fresh clone
  can replay the full RED→GREEN→REFACTOR timeline – including each test's retrieved/stored rows –
  in the Consort dashboard before running anything.

## How to use it – stand up a working app

**Prerequisite:** Consort is installed, your environment is prepped, and access to a Lakebase
profile is ready to go. If you haven't set that up yet, run:

```bash
bash <(curl -sL https://tinyurl.com/consort-bootstrap)
```

If you need Lakebase, you can try it on [Free Edition](https://login.databricks.com/signup?intent=SIGN_UP&provider=DB_FREE_TIER).

### 1. Clone it down

```bash
git clone https://github.com/kevin-hartman/stockflow-f1-build-complete.git
cd stockflow-f1-build-complete
git checkout feature-f1-stock-visibility
(cd client && npm install)
```

`feature-f1-stock-visibility` is the branch carrying the built F1 feature (code + tests +
design corpus); the last line installs the UI client dependencies.

### 2. Stand it up as *your* project

Run the setup script, replacing `my-stockflow` with your own project name (kebab-case):

```bash
./setup.sh my-stockflow
```

It creates a fresh Lakebase project, re-attaches git to a new repo of your name, regenerates
`.env` against your workspace, and leaves you on the F1 feature branch with its paired Lakebase
branch ready. If you hit a snag, read the [runbook](RUNBOOK-rehydrate-as-new-project.md) and
share it with a Claude session to resolve.

### 3. Run it (and resume the workflow)

F1's code is already written and its migrations are ready, so you can run the app straight
away – apply the migrations and start the dev servers (see `scripts/`), or let the workflow
deploy it. To pick the Consort workflow back up where the build left off:

```
/consort:start
```

F1 is build-complete and this snapshot is parked at the **deploy gate** (its `next.json` shows
`approve-deploy-gate`), so `/consort:start` resumes there rather than re-running the build. Open
the Consort dashboard to replay the F1 build – the whole TDD timeline and each test's captured
table state are shipped in this snapshot.

### 4. Go forward: release it (deploy gate → PR → merge, up the tier chain)

The built F1 code lives **only on `feature-f1-stock-visibility`** – it has not been merged into
`staging` or `main`. "Releasing" it means promoting it **up the tier chain**
(`feature-f1-stock-visibility → staging → main`), and each hop is a **pull request + CI + merge**
against the paired Lakebase branch – not a local `git merge`. The workflow walks you through it:

1. **Approve the deploy gate.** `/deploy F1-stock-visibility` (target `local`) runs the app as
   real, reachable software for the working-software review, then stops at the deploy gate for
   your approval. Approving it clears F1 to promote.
2. **Open the promote PR (`feature-f1-stock-visibility → staging`).** Use the Lakebase SCM
   extension's branch/PR view, or `./scripts/lk lakebase-scm-prepare-pr`. This opens the PR and
   the per-PR CI (`.github/workflows/pr.yml`) runs the full test suite against F1's **paired
   Lakebase branch**, so the gate has real teeth.
3. **Merge to promote.** Merge the PR (the SCM view, or `./scripts/lk lakebase-scm-merge`). The
   release-on-merge workflow (`.github/workflows/merge.yml`) takes a pre-migration snapshot,
   migrates the target (`staging`) Lakebase branch, verifies the schema, and cleans up. F1 now
   lives on `staging`.
4. **Promote to production.** Repeat the same PR → CI → merge from `staging → main` to ship F1 to
   the production tier.

Driving it through Consort, `/consort:start` (or `/deploy F1-stock-visibility`) stops at each
HITL gate – the deploy gate, then the promote gate – so you approve each step and it advances the
promotion for you; you don't run the SCM CLIs by hand unless you want to.
