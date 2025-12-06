import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standard Vite config. It will auto-detect the .cjs configs above.
export default defineConfig({
  plugins: [react()],
})