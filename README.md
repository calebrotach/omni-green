# OmniGreen workspace

Internal web app for mapping **UMB custodian file + wire execution** (evergreen / private-wealth style programs), **requirements by timeline**, **file ↔ API mapping**, narrative, account structure, and **open questions**. All references use **OmniGreen** as the allocator (not “Monark”). **Password protection is currently disabled** (open locally with no sign-in).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`); the app loads straight into the workspace.

## Build

```bash
npm run build
npm run preview
```

## Collaboration

Workspace data (flow steps, requirements, mappings, questions) is stored in **localStorage** under the key `omni-green-workspace`. Use **Export JSON** / **Import JSON** in the header to share snapshots with your CPO.

## Screens

- **Trade execution flow** — Swimlane chart with a **graph of steps** (phase columns × actor rows): black orthogonal connectors and **handoff labels** between OmniGreen, UMB, fund, and books, so order and interactions read as one process. Plus a comments thread. Underlying flow metadata still syncs into **Requirements by timeline** when updated (e.g. JSON import).
- **Requirements by timeline** — Grouped by phase; categories; client/CPO notes; statuses.
- **File ↔ API mapping** — Purchase and redemption grids (editable).
- **From order to books** — Order → omni → books & records narrative.
- **Account relationships** — Mermaid view of omnibus vs subaccounts.
- **Open questions & decisions** — Tracker with links to requirements.

## Reference context

- Evergreen / private wealth pattern: [StepStone private wealth solutions](https://www.stepstonegroup.com/what-we-do/solutions-services/private-wealth-solutions/)
- Custodian timing modeled from the OmniGreen ↔ UMB email thread (4:00 PM ET wire same day as import; order file cutoff pending 6:00 PM ET confirmation).
