<template>
  <Dropdown :options="dropdownItems" v-bind="$attrs">
    <template v-slot="{ open }">
      <button
        class="flex h-12 items-center rounded-md py-2 duration-300 ease-in-out"
        :class="
          isCollapsed
            ? 'w-auto px-0'
            : open
              ? 'w-52 bg-surface-white px-2 shadow-sm'
              : 'w-52 px-2 hover:bg-surface-gray-3'
        "
      >
        <!-- Brand logo: size and spacing controlled via CSS variables below -->
        <BrandLogo v-model="brand" class="flex-shrink-0 brand-logo" />
        <div
          class="flex flex-1 flex-col text-left duration-300 ease-in-out truncate"
          :class="
            isCollapsed
              ? 'ml-0 w-0 overflow-hidden opacity-0'
              : 'ml-2 w-auto opacity-100'
          "
        >
          <div
            class="brand-name text-base font-medium leading-none text-ink-gray-9 truncate"
          >
            {{ __(brand.name || 'Sentra') }}
          </div>
          <div class="mt-1 text-sm leading-none text-ink-gray-7 truncate">
            {{ user.full_name }}
          </div>
        </div>
        <div
          class="duration-300 ease-in-out"
          :class="
            isCollapsed
              ? 'ml-0 w-0 overflow-hidden opacity-0'
              : 'ml-2 w-auto opacity-100'
          "
        >
          <FeatherIcon
            name="chevron-down"
            class="size-4 text-ink-gray-5"
            aria-hidden="true"
          />
        </div>
      </button>
    </template>
  </Dropdown>
</template>

<script setup>
import BrandLogo from '@/components/BrandLogo.vue'
import FrappeCloudIcon from '@/components/Icons/FrappeCloudIcon.vue'
import Apps from '@/components/Apps.vue'
import { sessionStore } from '@/stores/session'
import { usersStore } from '@/stores/users'
import { getSettings } from '@/stores/settings'
import { showSettings, isMobileView } from '@/composables/settings'
import { showAboutModal } from '@/composables/modals'
import { confirmLoginToFrappeCloud } from '@/composables/frappecloud'
import { Dropdown } from 'frappe-ui'
import { theme, toggleTheme } from '@/stores/theme'
import { computed, h, markRaw } from 'vue'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
})

const { settings, brand } = getSettings()
const { logout } = sessionStore()
const { getUser } = usersStore()

const user = computed(() => getUser() || {})

const dropdownItems = computed(() => {
  if (!settings.value?.dropdown_items) return []

  let items = settings.value.dropdown_items

  let _dropdownItems = [
    {
      group: 'Dropdown Items',
      hideLabel: true,
      items: [],
    },
  ]

  items.forEach((item) => {
    if (item.hidden) return
    if (item.type !== 'Separator') {
      _dropdownItems[_dropdownItems.length - 1].items.push(
        dropdownItemObj(item),
      )
    } else {
      _dropdownItems.push({
        group: '',
        hideLabel: true,
        items: [],
      })
    }
  })

  return _dropdownItems
})

function dropdownItemObj(item) {
  let _item = JSON.parse(JSON.stringify(item))
  let icon = _item.icon || 'external-link'
  if (typeof icon === 'string' && icon.startsWith('<svg')) {
    icon = markRaw(h('div', { innerHTML: icon }))
  }
  _item.icon = icon

  if (_item.is_standard) {
    return getStandardItem(_item)
  }

  return {
    icon: _item.icon,
    label: __(_item.label),
    onClick: () =>
      window.open(_item.route, _item.open_in_new_window ? '_blank' : ''),
  }
}

function getStandardItem(item) {
  switch (item.name1) {
    case 'app_selector':
      return {
        component: markRaw(Apps),
      }
    case 'toggle_theme':
      return {
        icon: theme.value === 'dark' ? 'sun' : item.icon,
        label: __(item.label),
        onClick: toggleTheme,
      }
    case 'settings':
      return {
        icon: item.icon,
        label: __(item.label),
        onClick: () => (showSettings.value = true),
        condition: () => !isMobileView.value,
      }
    case 'login_to_fc':
      return {
        icon: h(FrappeCloudIcon),
        label: __(item.label),
        onClick: () => confirmLoginToFrappeCloud(),
        condition: () => !isMobileView.value && window.is_fc_site,
      }
    case 'about':
      return {
        icon: item.icon,
        label: __(item.label),
        onClick: () => (showAboutModal.value = true),
      }
    case 'logout':
      return {
        icon: item.icon,
        label: __(item.label),
        onClick: () => logout.submit(),
      }
  }
}
</script>

<!--
  Customization Guide (CSS Variables)

  You can override these CSS variables anywhere in your application (for example in `src/index.css` or a component-scoped <style> block) to tweak the brand logo and label appearance.

  --brand-logo-size   : Controls both width & height of the logo.
                       Increase → larger logo (e.g., 48px).
                       Decrease → smaller logo (e.g., 24px).

  --brand-logo-gap    : Horizontal space between the logo and the "Sentra" label.
                       Increase → pushes label farther to the right (e.g., 1rem → 16px).
                       Decrease → brings label closer (e.g., 0.25rem → 4px).

  --brand-logo-offset : Moves the logo itself left/right.
                       Positive value → moves logo right; negative → left (e.g., -4px).

  Typography for the "Sentra" label:

  --brand-font-family : Any valid CSS font-family string (e.g., 'Poppins', 'Courier New', sans-serif).
  --brand-font-size   : Font size of the label (e.g., 1.25rem).
  --brand-font-weight : Font weight (e.g., 400, 500, 600).
  --brand-font-style  : normal | italic | oblique | etc.

  Example override (add to a global stylesheet):

  :root {
    --brand-logo-size: 40px;      /* bigger logo */
    --brand-logo-gap: 12px;       /* more gap */
    --brand-logo-offset: -2px;    /* nudge left */

    --brand-font-family: 'Poppins', sans-serif;
    --brand-font-size: 1.125rem;
    --brand-font-weight: 600;
    --brand-font-style: italic;
  }
-->

<style>
/* Default values — feel free to override using the variables above */
.brand-logo {
  width: var(--brand-logo-size, 3rem); /* 2rem = 32px */
  height: var(--brand-logo-size, 3rem);
  margin-right: var(--brand-logo-gap, 0.5rem); /* 0.5rem = 8px */
  transform: translateX(var(--brand-logo-offset, 0));
}

.brand-name {
  font-family: var(--brand-font-family, inherit);
  font-size: var(--brand-font-size, 1rem);
  font-weight: var(--brand-font-weight, 500);
  font-style: var(--brand-font-style, normal);
}
</style>
