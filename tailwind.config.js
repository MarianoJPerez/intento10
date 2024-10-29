/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",              // Archivo principal HTML en la raíz
    "./src/**/*.{js,jsx,ts,tsx}", // Todos los archivos dentro de la carpeta src con extensión js, jsx, ts y tsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}