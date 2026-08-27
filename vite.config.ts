import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Static assets copied verbatim into the build. They live next to the app
  // code in src/ rather than at the repo root.
  publicDir: 'src/public',
})
