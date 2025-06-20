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

- **Sidebar:** `src/components/Layouts/AppSidebar.vue` and `src/components/SidebarLink.vue`.  
  – The selected/hover logic is implemented here using global utility classes.
- **Views (List, Kanban):** Styling for rows and buttons is globally managed. The hover and selected states for list items are controlled by global styles in `src/index.css` targeting `[role='row']`.
- **Settings Pages:** `src/components/Settings/`  
  – Account, telephony, WhatsApp, etc.

### Styling / Theme

- **Core Engine:** The project uses **Tailwind CSS** with a **`frappe-ui` preset**.
- **Centralized Theming:** The most critical file for custom theming is `src/index.css`. It defines global CSS variables and utility classes that control the application's look and feel.
- **Interaction States (Selected & Hover):**
  - To provide a consistent user experience, the application uses two global utility classes defined in `src/index.css`:
    - `.ui-selected`: A solid orange background with white text. Used for active navigation links and selected items in lists.
    - `.ui-hover`: A light cream background with orange text. Used for hover states on links and list items.
  - These classes are applied through a combination of component logic (e.g., in `SidebarLink.vue`) and global CSS rules (e.g., for list view rows).
- **Primary Color Control:** The `--brand-primary` CSS variable, which uses `--color-sentra-apricot-jet`, still controls the base theme color for elements like solid buttons.
- **Applying the Theme:**
  - **Sidebar:** `SidebarLink.vue` conditionally applies `.ui-selected` (solid orange) for the active route and `.ui-hover` (light orange) on hover.
  - **List Views:** The hover and selected states for list view rows are now consistent with the sidebar. Hovering a row applies the `.ui-hover` class (light cream background, orange text). Selected rows (via the checkbox) receive the `.ui-selected` class (solid orange background, white text). This is controlled by hyper-specific overrides in `src/index.css` that are scoped with `[data-doctype]` to avoid affecting other elements.
- **Overriding `frappe-ui` Components (The Hard Part):**
  - **The Challenge:** `frappe-ui` components, like the list view, are built with their own internal Tailwind classes (e.g., `bg-surface-gray-2`, `hover:bg-surface-menu-bar`). These classes are applied directly to elements, making them difficult to override with simple, global CSS. Simple class selectors will lose the CSS specificity battle.
  - **The Solution:** The only robust, permanent way to override these styles is to create **hyper-specific CSS rules** in our own `src/index.css`.
  - **The Strategy:**
    1. **Scoping:** We use a `[data-doctype]` attribute selector. This attribute exists on the root of the `ListView` component, so our styles will _only_ apply inside of it.
    2. **Targeting:** We must target the _exact_ `frappe-ui` utility classes we want to override. For example, to change the hover background, we target `[role='row'].hover\\:bg-surface-menu-bar:hover`. For the selected state, we target `[role='row'].bg-surface-gray-2`.
    3. **Forcefulness:** We use `!important` on every property to guarantee our styles win the specificity battle.
    4. **Child Elements:** We must also create separate, specific rules to override the styles of child elements, especially for text color. For instance, `...:hover .text-ink-gray-7` must be targeted explicitly to change its color on hover.
  - **This is the required pattern for reliably theming `frappe-ui` components that don't expose explicit theme props.**
- **Buttons & Controls:**
  - **Primary Buttons** (e.g., "Create", "Save"): Use the `variant="solid"` prop and are directly colored by `--brand-primary`.
  - **Secondary Buttons** (e.g., "Filter", "Sort"): Use other variants like `variant="ghost"` and are styled by the base `frappe-ui` theme.
- **Fonts & Sidebar:** Fonts are handled by Tailwind's defaults. The sidebar has its own set of CSS variables (`--sidebar-*`) in `src/index.css` for fine-tuning its layout.

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

1.  **Primary Theme Color:** To change the main brand color, update `--color-sentra-apricot-jet` and `--brand-primary-rgb` in `src/index.css`. This affects solid buttons and other base elements.
2.  **Selected/Hover Colors:** To change the selected or hover effects, modify the `.ui-selected` and `.ui-hover` utility classes in `src/index.css`.
3.  **Sidebar Look & Feel:** Tweak the `--sidebar-*` variables in `src/index.css`.
4.  **Fonts & Spacing:** Adjust the Tailwind config (`tailwind.config.js`) or add utility classes in `src/index.css`.
5.  **Icons:** All SVG icons are self-contained Vue components in `src/components/Icons/`.

---

## Extending Functionality

- **New Page / Module**
  1. Create a component in `src/pages/YourPage.vue`.
  2. Add a route in `router.js`.
  3. (Optional) Add a sidebar link via the `
