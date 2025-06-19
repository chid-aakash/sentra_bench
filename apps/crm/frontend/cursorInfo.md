# Frontend Overview – Quick Reference for Cursor & Devs

> This document is a bird-eye snapshot of the Vue 3 + Vite frontend (folder: `frontend/`). Use it to orient yourself before diving into code.

---

## Tech Stack / Tooling

| Area       | Library / Tool                                                                        |
| ---------- | ------------------------------------------------------------------------------------- |
| Framework  | **Vue 3** (Composition API)                                                           |
| Build      | **Vite** (`vite.config.js`)                                                           |
| Styling    | **Tailwind CSS** (+ **frappe-ui** preset) → see `tailwind.config.js`, `src/index.css` |
| State      | **Pinia** stores in `src/stores/`                                                     |
| Router     | **Vue-Router 4** (`src/router.js`)                                                    |
| HTTP / RPC | wrapped helpers from **Frappe** (`frappe-ui`)                                         |
| Real-time  | Socket wrapper in `src/socket.js`                                                     |
| Telemetry  | `src/telemetry.ts`                                                                    |

---

## High-Level Flow

1. **`index.html`** – standalone shell (Vite injects bundles).
2. **`src/main.js`** – boots Vue app, registers Pinia & Router, imports global CSS.
3. **`src/App.vue`** – root component; chooses `DesktopLayout` or `MobileLayout` based on screen size.
4. **Page components** in `src/pages/` map 1-to-1 with routes declared in `router.js`.
5. **Layout components** in `src/components/Layouts/` wrap pages and house global UI (sidebar, header, etc.).
6. **Domain components** live in `src/components/` and its sub-folders (e.g., Activities, Controls, Icons).
7. **Pinia stores** centralise app-wide state (auth/session, theme, notifications, views…).
8. **Composables** (`src/composables/`) provide reusable logic hooks (modals, settings, active-tab manager…).

---

## Directory Cheat Sheet

```
frontend/
├─ components.d.ts            # TS types from unplugin-vue
├─ index.html                 # The single HTML entry
├─ src/
│  ├─ main.js                 # Vue app entry – mounts <App />
│  ├─ App.vue                 # Root component – chooses layout
│  ├─ index.css               # Tailwind layer + global CSS vars
│  ├─ router.js               # Route definitions & guards
│  ├─ socket.js               # Socket.IO wrapper
│  ├─ telemetry.ts            # Event capture utilities
│  ├─ pages/                  # Top-level route views (Leads, Deals…)
│  ├─ components/             # Reusable UI pieces
│  │  ├─ Layouts/             # Desktop/Mobile wrappers & sidebar
│  │  ├─ Activities/          # Timeline widgets
│  │  ├─ Controls/            # Form inputs & UI controls
│  │  ├─ Icons/               # All custom SVG Vue components
│  │  ├─ …
│  ├─ composables/            # Vue composable functions (hooks)
│  ├─ stores/                 # Pinia stores (global, session, theme…)
│  ├─ utils/                  # Pure helpers (formatting, dialogs…)
│  └─ data/                   # Static demo data / scripts
├─ public/                    # Static assets served as /assets
├─ tailwind.config.js         # Tailwind + frappe-ui preset
├─ postcss.config.js          # PostCSS for Tailwind
└─ vite.config.js             # Vite + alias setup
```

### Component Hot-spots

- **Sidebar:** `src/components/Layouts/AppSidebar.vue`  
  – Handles collapse state, onboarding banners, notification counts, etc.
- **Sidebar Link:** `src/components/SidebarLink.vue`  
  – Single item (icon + label); uses CSS vars for size/spacing.
- **Layout Header:** `src/components/Layouts/AppHeader.vue`  
  – Top bar with breadcrumbs, quick actions, user avatar.
- **Activities Timeline:** `src/components/Activities/`  
  – Modular sub-areas for comments, email, calls, tasks…
- **Settings Pages:** `src/components/Settings/`  
  – Account, telephony, WhatsApp, etc.

### Styling / Theme

- Global Tailwind layers + sentinel brand variables (`src/index.css`).
- Theme extensions live in `tailwind.config.js`.
- Sidebar-specific variables (height, icon size, gap) defined under `/* Sidebar customization variables */` in the root `:root` block – tweak to instantly reskin sidebar.
- Brand accent orange is now exposed via `--brand-primary`; buttons (`variant="solid"`) and list-row hovers inherit this automatically.

---

## Pinia Stores

| File               | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `global.js`        | Misc app-wide flags                       |
| `session.js`       | Logged-in user data / permissions         |
| `notifications.js` | Real-time notifications list & count      |
| `views.js`         | Saved lead/deal list views + pinned views |
| `theme.js`         | Dark/light + color settings               |

All stores are imported via the Composition API (`const { foo } = storeName()`).

---

## Routing Conventions

- Each page has a canonical **List** and **Detail** view (e.g., `Leads` list, `Lead` detail).
- Detail routes use params (`/lead/:leadId`).
- Optional `view` query param selects saved filters.

---

## Build / Dev

```bash
pnpm install         # or npm / yarn
pnpm dev             # vite dev server → http://localhost:8080
pnpm build           # production build (dist/)
```

Vite Hot-Module-Reload (HMR) is enabled; updating `.vue` or `.css` auto-refreshes the browser.

---

## Customisation Pointers

1. **Brand colours / theme:** Edit CSS variables in `index.css` & extend Tailwind colours in `tailwind.config.js`.
2. **Sidebar look & feel:** Tweak `--sidebar-*` vars or override classes in `SidebarLink.vue`.
3. **Global fonts / spacing:** Adjust Tailwind config or add utilities in `index.css` under `@layer utilities`.
4. **Icons:** All SVG components live in `src/components/Icons/`. Each is a self-contained Vue component (uses `currentColor` for easy theming).

---

## Extending Functionality

- **New Page / Module**
  1. Create a component in `src/pages/YourPage.vue`.
  2. Add a route in `router.js`.
  3. (Optional) Add a sidebar link via `links` array in `AppSidebar.vue`.
- **API Calls**  
  Use `frappe-ui`'s `call()` helper or Pinia actions. Backend endpoints live in Frappe apps.

---

Happy hacking! ✨
