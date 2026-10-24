import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'

/* eslint-disable no-undef */

const packageAlias = [
  { find: '@', replacement: fileURLToPath(new URL(`src/`, import.meta.url)) },
  { find: 'core', replacement: fileURLToPath(new URL(`fe-zen-arch/core/`, import.meta.url)) },
  { find: 'icons', replacement: fileURLToPath(new URL(`fe-zen-arch/icons/`, import.meta.url)) },
  { find: 'ui', replacement: fileURLToPath(new URL(`fe-zen-arch/ui/`, import.meta.url)) }
]

export default defineConfig(({ command }) => {
  const args = process.argv.slice(2)
  const entryPoint = args.findLast((arg) => /\.(tsx?|jsx?)$/.test(arg)) ?? 'src/index.tsx'
  const portIndex = args.indexOf('--port')
  const portArgument = portIndex >= 0 ? args[portIndex + 1] : args.find((arg) => /^\d+$/.test(arg))
  const port = portArgument ? Number.parseInt(portArgument, 10) : 5173

  process.env.PUBLIC_ENTRY_POINT = entryPoint

  /** @type {import('vite').UserConfig} */
  const config = {
    server: { port, strictPort: true },
    plugins: [react()],
    envPrefix: ['VITE_', 'PUBLIC_'],
    resolve: {
      alias: [...packageAlias]
    }
  }

  if (command === 'build') {
    config.publicDir = false

    config.build = {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Check if the import is from not from node_modules, i.e our source code
            if (!id.includes('node_modules')) return null

            const module = id.includes('.pnpm')
              ? id.split('.pnpm/')[1].split('/')[0]
              : id.split('node_modules/')[1].split('/')[0]

            if (module.includes('@tanstack')) return 'v/fetch'
            if (module.includes('react-hook-form')) return 'v/form'
            if (module.includes('@floating-ui') || module.includes('tabbable')) return 'v/popover'
            if (module.includes('sentry')) return 'v/err-obs'
            if (module.includes('chart.js') || module.includes('chartjs')) return 'v/charts'
            if (module.startsWith('react') || module.startsWith('scheduler')) return 'v/react'

            return 'v/others' // All other dependencies
          }
        }
      }
    }
  }

  return config
})
