import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import { nitro } from 'nitro/vite' // 1. Importa el plugin de Nitro

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), netlify(), tanstackStart(), viteReact()],
})



export default defineConfig({
  plugins: [
    tanstackStart({
      // 2. ELIMINA o comenta la sección de prerender de aquí
      // prerender: { enabled: true, ... }
    }),
    // 3. Añade el plugin de Nitro con la opción de prerender
    nitro({
      preset: 'node-server', // Asegura compatibilidad
      prerender: {
        routes: ['/'], // Le dice que genere la página principal
        crawlLinks: true, // Opcional: sigue los enlaces para generar más páginas
        failOnError: true, // Fuerza a que falle si hay un error, para detectarlo
      },
      build: {
    cssMinify: 'esbuild',
  },
    }),
  ]
    ,
})
