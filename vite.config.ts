import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = (process.env.VITE_BASE_URL ?? env.VITE_BASE_URL ?? '').trim() || '/'

  return {
    base,
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: 'static/images/**/*',
            dest: 'static/images',
          },
        ],
      }),
    ],
    publicDir: 'public',
    optimizeDeps: {
      exclude: ['@huggingface/transformers', 'onnxruntime-web'],
    },
    worker: {
      format: 'es',
    },
  }
})
