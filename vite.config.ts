import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // ב-Netlify האתר יושב בשורש הדומיין; ב-GitHub Pages בתיקייה עם שם הפרויקט
  base: process.env.NETLIFY ? '/' : '/smart-leads-dashboard/',
  plugins: [react(), tailwindcss()],
})
