import frappeUIPreset from 'frappe-ui/src/tailwind/preset'

export default {
  presets: [frappeUIPreset],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/frappe-ui/src/**/*.{vue,js,ts,jsx,tsx}',
    '../node_modules/frappe-ui/src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/frappe-ui/frappe/**/*.{vue,js,ts,jsx,tsx}',
    '../node_modules/frappe-ui/frappe/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [{ pattern: /!(text|bg)-/, variants: ['hover', 'active'] }],
  theme: {
    extend: {
      colors: {
        'sentra-apricot-jet': 'var(--color-sentra-apricot-jet)',
        'sentra-ocean-route': 'var(--color-sentra-ocean-route)',
        'sentra-dune-mist': 'var(--color-sentra-dune-mist)',
      },
    },
  },
  plugins: [],
}
