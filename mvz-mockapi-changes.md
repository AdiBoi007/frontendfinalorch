# Orchestra mock API & Brain changes log

## 2026-05-21 — Project Brain visualisation & API shim

### `src/features/brain/scene/ConnectionArcs.tsx` (new)

- **What:** Renders curved `CatmullRomCurve3` arcs between nodes that share a `connections` entry, deduplicated so A↔B draws once.
- **Why:** Surfaces the knowledge-graph edges that were defined on `BrainNode` but never shown on the globe.
- **How:** Endpoints from `sphericalToCartesian` at radius `1.52`; midpoint normalized and pushed to `1.62` so arcs bow above the sphere. Opacity `0.18` default; `0.55` when connected to `selectedNode`; `0.04` for other arcs when one node is selected. Colour from `brainTokens.pin[source.category]`.
- **Backend:** N/A (pure client rendering). Graph data expected from `GET /v1/projects/:projectId/brain/graph/current` (see `getFlowGraph` in `api.ts`).

### `src/features/brain/scene/BrainSphere.tsx`

- **What:** Swapped sphere core from `meshBasicMaterial` to `meshStandardMaterial` (`color="#FFFFFF"`, `roughness={0.35}`, `metalness={0.04}`, `envMapIntensity={0.4}`). Mounted `<ConnectionArcs nodes={nodes} />` after `<Pins>`.
- **Why:** Adds lighting response and depth to the globe core; displays connection arcs on the sphere.

### `src/features/brain/scene/Atmosphere.tsx`

- **What:** Replaced single back-face shell with two layers: outer halo (`radius 1.72`, `brainTokens.rust`, opacity `0.07`) and inner bloom (`radius 1.56`, `#FFFFFF`, opacity `0.05`).
- **Why:** Subtle rust glow and white inner bloom for atmosphere without heavy post-processing.

### `src/features/brain/scene/BrainScene.tsx`

- **What:** Ambient `0.8 → 1.0`, directional `0.6 → 1.1`, point `0.2 → 0.35`.
- **Why:** Supports the new `meshStandardMaterial` sphere and makes pins/atmosphere read more clearly.

### `src/features/brain/scene/Pin.tsx`

- **What:** Category-based `URGENCY` map controls core scale, pulse speed/depth, and higher base halo opacity (`0.32`) for `change` pins.
- **Why:** Visual hierarchy by node type—changes feel more urgent; team/comms feel calmer.

### `src/lib/api.ts`

- **What:** Added `askSocrates(projectId, nodeTitle, nodeContent, messages)` stub returning a canned message.
- **Why:** Removes direct Anthropic `fetch` from the UI; single shim for future backend proxy.
- **Backend:** `POST /v1/projects/:projectId/brain/ask`  
  Body: `{ nodeTitle, nodeContent, messages: { role, content }[] }`  
  Response: `{ reply: string }`

### `src/features/brain/panel/DetailPanel.tsx`

- **What:** `SocratesTab` `send()` now calls `askSocrates` instead of `https://api.anthropic.com/v1/messages`. Removed try/catch around fetch; kept `setLoading` before/after.
- **Why:** Aligns Brain detail chat with the mock API layer and documents the real endpoint via TODO on `askSocrates`.

---

## 2026-05-21 — Integration status, dashboard sections, settings page

### `src/lib/types.ts`

- **What:** Re-added `IntegrationCategory` union type (8 categories) and `IntegrationStatus` interface (`id`, `name`, `category`, `connected`, optional `lastSyncedAt`).
- **Why:** Reverted by linter after previous commit attempt; required by SettingsPage, ProjectDashboardPage, and the api shim.

### `src/lib/mockData.ts`

- **What:** Re-added `IntegrationStatus` to the import block; re-added `mockIntegrationStatuses: Record<string, IntegrationStatus[]>` keyed by project ID. All entries default to `connected: false`. BloomFast (10), Elara Games (8), API Gateway (7).
- **Why:** Same revert recovery. All `connected: false` so the UI correctly shows "not connected" state until OAuth flows are implemented.

### `src/lib/api.ts`

- **What:** Re-added `IntegrationStatus` import; added `getIntegrationStatuses(projectId)` returning `mockIntegrationStatuses[projectId] ?? []`.
- **Backend:** `GET /v1/projects/:projectId/integrations`

### `src/pages/DashboardPage.tsx`

- **What:** Added two new sections between the project cards and the team section:
  - **Upcoming deadlines** — iterates `mockDeadlines`, shows project, task, due date, days left, colour-coded dot (green/amber/red).
  - **Recent requests** — iterates `mockRequests` (up to 5), shows platform icon (Slack/Gmail/WhatsApp with correct brand colour), sender, truncated message, time, status pill.
- **New imports:** `mockDeadlines`, `mockRequests` from mockData; `TbBrandSlack`, `TbBrandWhatsapp`, `TbMail` from react-icons/tb; `DeadlineItem`, `RequestItem` from types.
- **Backend:** Both sections will pull from `getDeadlines()` and `getRequests()` once the API is live.

### `src/pages/ProjectDashboardPage.tsx`

- **What (integrations):** Added `integrations: IntegrationStatus[]` state; loaded via `getIntegrationStatuses(id)` in existing `useEffect`; rendered as a row of small chips below the progress bar in the project header. Each chip has a green or red dot + service name.
- **What (requirements snapshot):** Added `liveDoc: LiveDocPayload | null` state; loaded via `getLiveDoc(id)`; renders a card showing the first 4 section headings from the live doc paired with their adjacent body/highlighted content. Includes a doc status footer bar (docType · version · status · source annotations count) and an "Open live doc" link.
- **New imports:** `getIntegrationStatuses`, `getLiveDoc` from api; `IntegrationStatus`, `LiveDocPayload` from types.
- **Backend:** Integrations from `GET /v1/projects/:projectId/integrations`; live doc from `GET /v1/projects/:projectId/brain/current`.

### `src/pages/SettingsPage.tsx`

- **What:** Full rebuild of the stub settings page. Now renders:
  - **Profile section** — avatar, name, role derived from `orchestra_role` in localStorage.
  - **Integrations section** — grouped by category (Communication → Calendar → Payments → Infrastructure → Database → Hosting → Monitoring → Notifications). Each card shows service name, category label, `connected`/`not connected` status pill, and a "Connect" button (stub, no-op) or "Connected" tick. Count pill shows X / N connected in the header.
- **New imports:** `getIntegrationStatuses` from api; `IntegrationStatus` from types; `TbCheck`, `TbPlugConnected` from react-icons/tb; `Avatar` from components.
- **Backend:** `GET /v1/workspace/integrations` (workspace-level endpoint, not yet defined); currently uses project "1" as default.

---

### `src/features/brain/overlay/BrainOverlay.tsx`

- **What:** Filter button opens a category flyout (`doc`, `decision`, `comms`, `team`, `change`) wired to `activeFilter` / `setFilter` from `useBrainStore`; active filter highlights the button; “Clear filter” when a filter is set.
- **Why:** Makes the existing Zustand filter state usable from the overlay (pins/list already respect `matchesFilter`).
- **Backend:** N/A (client-only filter). Persisted filters would live on project/brain settings if added later.
