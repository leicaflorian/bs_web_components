import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/index.ts'),
      formats: ['es', 'umd', 'cjs', 'iife'],
      name: 'pippo',
      fileName: format => `components.${format}.js`
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'pages/**.*.html')
      },
      external: ['vue', '@vueuse/core']
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          // @ts-ignore
          isCustomElement: (tag) => tag.toLowerCase().startsWith('bwc')
        }
      }
    })
  ]
})
