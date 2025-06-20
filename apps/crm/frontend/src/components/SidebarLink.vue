<template>
  <button
    class="group flex cursor-pointer items-center rounded text-ink-gray-7 duration-300 ease-in-out focus:outline-none focus:transition-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-outline-gray-3"
    :style="{
      height: 'var(--sidebar-item-height)',
      marginTop: 'var(--sidebar-item-gap-y)',
      marginBottom: 'var(--sidebar-item-gap-y)',
    }"
    :class="[isActive ? 'ui-selected' : 'ui-hover']"
    @click="handleClick"
  >
    <div
      class="flex w-full items-center justify-between duration-300 ease-in-out"
      :style="{
        'padding-top': 'var(--sidebar-link-py)',
        'padding-bottom': 'var(--sidebar-link-py)',
      }"
      :class="isCollapsed ? 'ml-[3px] p-1' : 'px-2'"
    >
      <div class="flex items-center truncate">
        <Tooltip
          :text="label"
          placement="right"
          :disabled="!isCollapsed"
          :hover-delay="isCollapsed ? 0 : 500"
        >
          <slot name="icon">
            <span
              class="grid flex-shrink-0 place-items-center"
              :style="{
                width: 'var(--sidebar-icon-size)',
                height: 'var(--sidebar-icon-size)',
              }"
            >
              <FeatherIcon
                v-if="typeof icon == 'string'"
                :name="icon"
                class="w-full h-full text-current"
                :class="
                  isActive
                    ? 'text-white'
                    : 'group-hover:text-sentra-apricot-jet'
                "
              />
              <component
                v-else
                :is="icon"
                class="w-full h-full text-current"
                :class="
                  isActive
                    ? 'text-white'
                    : 'group-hover:text-sentra-apricot-jet'
                "
              />
            </span>
          </slot>
        </Tooltip>
        <Tooltip
          :text="label"
          placement="right"
          :disabled="isCollapsed"
          :hoverDelay="1.5"
        >
          <span
            class="flex-1 flex-shrink-0 truncate duration-300 ease-in-out"
            :style="{
              fontSize: 'var(--sidebar-item-font-size)',
              marginLeft: isCollapsed ? '0' : 'var(--sidebar-icon-label-gap)',
            }"
            :class="
              isCollapsed
                ? 'ml-0 w-0 overflow-hidden opacity-0'
                : 'ml-2 w-auto opacity-100'
            "
          >
            {{ label }}
          </span>
        </Tooltip>
      </div>
      <slot name="right" />
    </div>
  </button>
</template>

<script setup>
import { Tooltip } from 'frappe-ui'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isMobileView, mobileSidebarOpened } from '@/composables/settings'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  icon: {
    type: [Object, String, Function],
  },
  label: {
    type: String,
    default: '',
  },
  to: {
    type: [Object, String],
    default: '',
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
})

function handleClick() {
  if (!props.to) return
  if (typeof props.to === 'object') {
    router.push(props.to)
  } else {
    router.push({ name: props.to })
  }
  if (isMobileView.value) {
    mobileSidebarOpened.value = false
  }
}

let isActive = computed(() => {
  if (route.query.view) {
    return route.query.view == props.to?.query?.view
  }
  return route.name === props.to
})
</script>
