import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const cesiumSource = 'node_modules/cesium/Build/Cesium'
const cesiumBaseUrl = '/cesiumStatic'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: `${cesiumSource}/Workers`,
          dest: 'cesiumStatic',
          rename: { stripBase: 4 },
        },
        {
          src: `${cesiumSource}/ThirdParty`,
          dest: 'cesiumStatic',
          rename: { stripBase: 4 },
        },
        {
          src: `${cesiumSource}/Assets`,
          dest: 'cesiumStatic',
          rename: { stripBase: 4 },
        },
        {
          src: `${cesiumSource}/Widgets`,
          dest: 'cesiumStatic',
          rename: { stripBase: 4 },
        },
      ],
    }),
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
  },
})