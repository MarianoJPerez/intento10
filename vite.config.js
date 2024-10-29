import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'https://AdrianGustavo02.github.io/plataformasDesarrollo',
  css: {
    postcss: './postcss.config.cjs', 
  },
})
