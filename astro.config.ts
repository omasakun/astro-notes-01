import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'

export default defineConfig({
  integrations: [
    preact(),
  ],
  server: {
    port: 8137,
    host: true,
  },
})
