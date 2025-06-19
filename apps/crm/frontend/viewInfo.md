Below is an “architect’s-eye view” of everything that happens in the **Leads** module, stitched together from the Vue code you have in `/frontend/src`. Follow the numbered sections to see how the list screen, create-form, detail view and bulk actions talk to the Frappe backend and to each other.

---

1.  Routing layer

---

• `/leads/view/:viewType?` → **Leads.vue** (list / kanban / group-by)  
• `/leads/:leadId` → **Lead.vue** (desktop detail)  
• The same ids route to **MobileLead.vue** on small screens (see `handleMobileView` in `router.js`).

---

2.  List screen – src/pages/Leads.vue

---

The component is mostly UI, but it delegates all data-loading to the generic **ViewControls.vue** helper:

```287:315:src/pages/Leads.vue
<ViewControls
  ref="viewControls"
  v-model="leads"
  …                         <!-- passes “CRM Lead” doctype -->
/>
```

What ViewControls does:

1. Builds a **list resource** object (`list`) whose `.reload()` method eventually calls Frappe’s report-view API (`frappe.desk.reportview.get`) via the `call()` helper that ships with _frappe-ui_.
2. Adds client-side helpers for quick-filters, group-by, kanban columns, column-widths, pagination, etc.
3. Exposes the rows back to **Leads.vue**, which massages them (`parseRows()`) to attach avatars, colours, time-ago strings, etc.

Exporting the list is a nice hint of the underlying endpoint:

```560:573:src/components/ViewControls.vue
let url = `/api/method/frappe.desk.reportview.export_query?...&doctype=${props.doctype}…`
```

So every list refresh, filter-change or infinite-scroll (`loadMore`) eventually resolves to a `frappe.desk.reportview.*` RPC.

---

3.  Bulk & row actions – src/components/ListBulkActions.vue

---

The floating “n selected” banner injects extra Lead-specific bulk actions:

```70:82:src/components/ListBulkActions.vue
if (props.doctype === 'CRM Lead') {
  actions.push({
    label: __('Convert to Deal'),
    onClick: () => convertToDeal(selections, unselectAll),
  })
}
```

Deletion uses the generic reportview helper:

```100:117:src/components/ListBulkActions.vue
call('frappe.desk.reportview.delete_items', {
  items: JSON.stringify(Array.from(selections)),
  doctype: props.doctype,
})
```

---

4.  Creating a Lead – src/components/Modals/LeadModal.vue

---

• A big quick-entry dialog driven by Field-Layout metadata fetched from  
 `crm.fcrm.doctype.crm_fields_layout.crm_fields_layout.get_fields_layout`.  
• When you hit “Create” it does a plain `frappe.client.insert`:

```112:120:src/components/Modals/LeadModal.vue
const createLead = createResource({
  url: 'frappe.client.insert',
  makeParams(values) {
    return { doc: { doctype: 'CRM Lead', ...values } }
  },
})
```

Validation happens on the client (e.g. mandatory first-name, numeric revenue) before the RPC fires.

---

5.  Detail / editing screen – src/pages/Lead.vue

---

1.  Data fetch:

    ```427:434:src/pages/Lead.vue
    url: 'crm.fcrm.doctype.crm_lead.api.get_lead',
    params: { name: props.leadId },
    ```

2.  Field update:

    `380-392 (in updateLead): createResource({ url:'frappe.client.set_value', … })`

3.  Delete Lead (moves the user back to list afterwards):

    ```614:623:src/pages/Lead.vue
    async function deleteLead(name) {
      await call('frappe.client.delete', { doctype:'CRM Lead', name })
      router.push({ name:'Leads' })
    }
    ```

4.  Convert-to-Deal: single-record button plus a bulk variant both call  
    `crm.fcrm.doctype.crm_lead.crm_lead.convert_to_deal`.

The detail view also pulls two auxiliary resources:

• `…crm_fields_layout.get_sidepanel_sections` – for the read-only data panel on the right.  
• `crm.api.doc.get_assigned_users` – for the “Assign to” avatar stack.

All heavy lifting (setters, triggers, form-script hooks) runs through the composable **useDocument()** in `src/data/document.js`. That layer caches documents, fires Frappe calls, and executes any custom “controller” scripts delivered by the backend.

---

6.  State & helpers worth noting

---

• **Pinia stores**:  
 – `statusesStore` supplies coloured status options for Leads & Deals.  
 – `usersStore` resolves user ids to `full_name` / avatar.  
• **Global settings** (`composables/settings.js`) decide if telephony / WhatsApp buttons render.  
• **Telemetry**: every create & convert event is reported via `capture('lead_created')`, `capture('convert_lead_to_deal')`.

---

7.  When a Lead flows through the system

---

1. User lands on `/leads` → `ViewControls` asks the backend for a paginated list of _CRM Lead_ rows.
2. They click “Create” → `LeadModal` opens, validates inputs, runs `frappe.client.insert`.
3. Redirected to `/leads/<new-id>` → `Lead.vue` fetches the full doc with `…api.get_lead`.
4. Every inline edit (`updateField`) hits `frappe.client.set_value`; attachments go via the generic file-upload component.
5. Deletion fires `frappe.client.delete`; Bulk-delete uses `reportview.delete_items`.
6. Converting to a deal calls the bespoke `crm_lead.convert_to_deal` server method.

That’s the entire Lead lifecycle on the front-end side; everything else (permissions, database writes, workflow rules) happens in the Frappe backend the Vue app talks to.
